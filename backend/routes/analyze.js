import express from 'express';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import crypto from 'crypto';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper to log extraction attempts
const logExtraction = (source, count) => {
    console.log(`Extracted ${count} parameters via ${source}`);
};

router.post('/', upload.single('report'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        console.log("Starting OCR on", req.file.path);
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(req.file.path);
        await worker.terminate();
        fs.unlinkSync(req.file.path);
        
        // Log OCR text for debugging "Real" vs "Mock"
        fs.writeFileSync('ocr_last_result.txt', text || "NO TEXT FOUND");

        if (!text || text.trim().length < 20) {
            return res.json({ 
                success: false, 
                error: "The uploaded file doesn't seem to contain enough text. Please ensure it is a clear image of a medical report." 
            });
        }

        const apiKey = (process.env.GEMINI_API_KEY || "").trim().replace(/['"]/g, '');
        const prompt = `
        ROLE:
        You are a High-Precision Medical Data Extractor. Your sole responsibility is to transcribe and verify laboratory results. 

        CRITICAL INSTRUCTION: THE "MISSING DATA" PROTOCOL
        Before providing any explanation, you MUST check the document for the presence of specific keywords.
        - If the user asks about "Hemoglobin" (Hb) or "Vitamin D3" and those words do NOT appear in the image, you MUST explicitly state in the "explanation" field: "Requested parameter [Name] is NOT present in this specific report."
        - DO NOT attempt to find a 'similar' test. If it is not written, it does not exist for this session.

        EXTRACTION HIERARCHY:
        1. IDENTIFY THE PANEL: Look at the header (e.g., "Mycobacterium Combined Panel").
        2. IDENTIFY STATUS RESULTS: In molecular/PCR reports, extract text-based results ("Detected", "Positive", "Reactive", "Negative") as the primary result.
        3. REFERENCE RANGES: Extract the "Methodology" or "Reference Range" if available.

        SAFETY GUARDRAIL:
        Do not provide a diagnosis. Only provide data transcription and a factual explanation of what the terms mean.

        DOCUMENT TEXT:
        ${text.substring(0, 5000)}

        OUTPUT FORMAT (JSON ONLY):
        Return ONLY a JSON object with this structure:
        {
          "report_metadata": {
            "lab_name": "string",
            "report_title": "string",
            "patient_identifiers_found": boolean
          },
          "extracted_parameters": [
            {
              "test_name": "string",
              "result": "string",
              "unit": "string or null",
              "reference_range": "string or null",
              "is_abnormal": boolean
            }
          ],
          "user_requested_check": {
            "hemoglobin_found": boolean,
            "vitamin_d_found": boolean,
            "explanation": "Strict compliance with the 'Missing Data' protocol. Directly answer if Hemoglobin or Vitamin D3 were found. If not, explain why based on the Report Type."
          },
          "summary": "A 1-sentence plain-English summary of the 'Found Results' only."
        }
        `;

        // Prioritized list of reliable models
        const prioritizedModels = [
            { name: "models/gemini-1.5-flash", version: "v1" },
            { name: "models/gemini-2.0-flash", version: "v1beta" },
            { name: "models/gemini-1.5-pro", version: "v1" }
        ];

        let jsonResult = null;
        let isIrrelevant = false;

        // Try prioritized models first
        for (const modelInfo of prioritizedModels) {
            const modelPath = modelInfo.name;
            try {
                console.log(`Trying stable model: ${modelPath} (${modelInfo.version})`);
                const genUrl = `https://generativelanguage.googleapis.com/${modelInfo.version}/${modelPath}:generateContent?key=${apiKey}`;
                
                const response = await fetch(genUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.1,
                            response_mime_type: "application/json"
                        }
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    const errorMsg = data.error?.message || "Unknown error";
                    if (response.status === 429) {
                        console.warn(`${modelPath} quota exceeded (429).`);
                    } else {
                        console.error(`${modelPath} failed (${response.status}): ${errorMsg}`);
                    }
                    fs.appendFileSync('backend_error.log', `${modelPath} (${modelInfo.version}) error: ${errorMsg}\n`);
                    continue;
                }

                if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
                    continue;
                }

                let aiResponse = data.candidates[0].content.parts[0].text.trim();
                fs.writeFileSync('ai_last_response.txt', aiResponse);
                
                const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                
                if (parsed.error === "irrelevant_content") {
                    console.log(`Model ${modelPath} flagged as irrelevant content.`);
                    isIrrelevant = true;
                    break;
                }
                
                if (parsed.extracted_parameters || parsed.report_metadata) {
                    jsonResult = parsed;
                    console.log(`Extracted results using stable model: ${modelPath}`);
                    break;
                }
            } catch (err) {
                console.error(`${modelPath} parsing failed:`, err.message);
                continue;
            }
        }

        // Only fall back to dynamic discovery if prioritized models failed
        if (!jsonResult && !isIrrelevant) {
            console.log("Falling back to dynamic model discovery...");
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const listRes = await fetch(listUrl);
            const listData = await listRes.json();
            
            if (listData.models) {
                const otherModels = listData.models.filter(m => 
                    m.supportedGenerationMethods.includes("generateContent") && 
                    !prioritizedModels.some(p => p.name === m.name) &&
                    !m.name.includes("-tts") && !m.name.includes("-preview")
                );

                for (const model of otherModels.slice(0, 5)) { // Limit fallbacks
                    const modelPath = model.name;
                    try {
                        console.log(`Trying fallback model: ${modelPath}`);
                        const genUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
                        const response = await fetch(genUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
                            })
                        });

                        const data = await response.json();
                        if (!response.ok) continue;

                        let aiResponse = data.candidates[0].content.parts[0].text.trim();
                        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                        const parsed = JSON.parse(cleanJson);
                        if (parsed.extracted_parameters) {
                            jsonResult = parsed;
                            break;
                        }
                    } catch (err) { continue; }
                }
            }
        }

        if (isIrrelevant) {
            return res.json({ success: false, error: "This doesn't look like a medical report." });
        }

        if (jsonResult) {
            console.log(`High-Precision Extractor: Successfully parsed ${jsonResult.report_metadata?.report_title} with ${jsonResult.extracted_parameters?.length || 0} parameters.`);
            res.json({ 
                success: true, 
                report_metadata: jsonResult.report_metadata || {},
                extracted_parameters: jsonResult.extracted_parameters || [],
                user_requested_check: jsonResult.user_requested_check || { hemoglobin_found: false, vitamin_d_found: false, explanation: "" },
                summary: jsonResult.summary || "",
                disclaimer: "This is a machine-extracted transcription. For medical interpretation, consult a professional."
            });
        } else {
            console.log("Extraction Engine failed to extract data.");
            res.json({ 
                success: false, 
                error: "Could not extract any medical data from the report. Please ensure the image is clear." 
            });
        }
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze report" });
    }
});

export default router;

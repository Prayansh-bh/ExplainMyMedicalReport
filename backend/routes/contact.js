import express from 'express';
import Mailjet from 'node-mailjet';
import multer from 'multer';

const router = express.Router();

// Multer setup to handle file upload in memory
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', upload.single('report'), async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const reportFile = req.file;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Please fill in all required fields." });
    }

    // Initialize Mailjet with API keys from .env
    const mailjet = new Mailjet({
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_SECRET_KEY
    });

    try {
        // Prepare Mailjet request
        const mailData = {
            Messages: [
                {
                    From: {
                        Email: process.env.EMAIL_USER,
                        Name: "Medical Portz Contact Form"
                    },
                    To: [
                        {
                            Email: process.env.EMAIL_USER,
                            Name: "Admin"
                        }
                    ],
                    ReplyTo: {
                        Email: email,
                        Name: name
                    },
                    Subject: `New Inquiry: ${subject || 'General'}`,
                    TextPart: `New message from ${name}\n\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
                    HTMLPart: `
                        <h3>New Contact Form Submission</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                        <p><strong>Subject:</strong> ${subject || 'General'}</p>
                        <hr />
                        <p><strong>Message:</strong></p>
                        <p>${message.replace(/\n/g, '<br/>')}</p>
                    `,
                    Attachments: reportFile ? [
                        {
                            ContentType: reportFile.mimetype,
                            Filename: reportFile.originalname,
                            Base64Content: reportFile.buffer.toString('base64')
                        }
                    ] : []
                }
            ]
        };

        // If API keys are missing, simulate success (during setup)
        if (!process.env.MAILJET_API_KEY || process.env.MAILJET_API_KEY === 'your_api_key_here') {
            console.warn("⚠️ Mailjet: API Keys not configured. Simulating message reception...");
            return res.status(200).json({ 
                success: true, 
                message: "Message received (Simulation Mode). Please configure Mailjet keys in .env for real delivery."
            });
        }

        const result = await mailjet.post('send', { version: 'v3.1' }).request(mailData);
        
        console.log("Mailjet Full Response:", JSON.stringify(result.body, null, 2));
        res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
    } catch (error) {
        console.error("Mailjet Error Detail:", JSON.stringify(error.response?.body || error, null, 2));
        res.status(500).json({ success: false, error: "Failed to send message via Mailjet. Please check your credentials and sender verification." });
    }
});

export default router;

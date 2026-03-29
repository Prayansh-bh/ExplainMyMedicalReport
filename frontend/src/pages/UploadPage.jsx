import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, Loader2, ShieldCheck, HeartPulse, FileImage, FileText, Download, 
  ChevronRight, HelpCircle, ArrowRight, Stethoscope, Dna, Brain, Activity, 
  FlaskConical, UserCheck, Quote 
} from 'lucide-react';
import axios from 'axios';

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(-1);
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is ExplainMyMedicalReport?",
      answer: "ExplainMyMedicalReport is an AI-powered medical report explanation tool that helps you understand medical reports in simple language. Just upload your report and get an easy-to-read summary instantly."
    },
    {
      question: "How can I explain my medical report online?",
      answer: "You can use ExplainMyMedicalReport AI to get a medical report explanation online. Upload your file, and our system will analyze and simplify your medical report within seconds."
    },
    {
      question: "Can I understand lab test results without a doctor?",
      answer: "Yes. Our AI health report interpreter helps you interpret lab test results and explains what each value means in a clear and simple way."
    },
    {
      question: "How does AI medical report analysis work?",
      answer: "Our platform uses advanced technology to perform AI medical report analysis, breaking down complex terms into easy explanations so you can understand your medical report quickly."
    },
    {
      question: "What types of reports can I upload?",
      answer: "You can upload: Blood test reports (for blood test report explanation), MRI reports (MRI report explanation), CT scan reports (CT scan report meaning), Pathology reports (pathology report explanation), and General health reports."
    },
    {
      question: "What if I don't understand my medical report?",
      answer: "If you're thinking 'I don't understand my medical report', our tool is built exactly for you. It converts confusing lab results into simple language so you can clearly understand your health."
    },
    {
      question: "Can this tool simplify medical reports?",
      answer: "Absolutely. Our smart medical report reader is designed to simplify medical reports and provide a clear, human-friendly summary."
    },
    {
      question: "Is ExplainMyMedicalReport accurate?",
      answer: "ExplainMyMedicalReport tool provides highly reliable automated lab report analysis, but it is recommended to consult a doctor for medical decisions."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Ankit Sharma",
      role: "General Physician",
      icon: <Stethoscope className="w-6 h-6" />,
      quote: "ExplainMyMedicalReport helps patients understand medical reports before consultations. It reduces confusion and improves communication."
    },
    {
      name: "Dr. Priya Mehta",
      role: "Pathologist",
      icon: <Dna className="w-6 h-6" />,
      quote: "The platform provides clear pathology report explanation and simplifies complex findings into meaningful insights."
    },
    {
      name: "Dr. Rahul Verma",
      role: "Radiologist",
      icon: <Brain className="w-6 h-6" />,
      quote: "From MRI report explanation to CT scan report meaning, this tool helps patients grasp radiology reports easily."
    },
    {
      name: "Dr. Neha Kapoor",
      role: "Cardiologist",
      icon: <Activity className="w-6 h-6" />,
      quote: "Patients often struggle to interpret lab values. This tool helps them interpret lab test results and understand their health better."
    },
    {
      name: "Dr. Karan Patel",
      role: "Clinical Lab Specialist",
      icon: <FlaskConical className="w-6 h-6" />,
      quote: "The automated lab report analysis is impressive. It accurately highlights abnormal values and explains them clearly."
    },
    {
      name: "Dr. Sneha Iyer",
      role: "Internal Medicine Specialist",
      icon: <UserCheck className="w-6 h-6" />,
      quote: "Many patients say 'I don't understand my medical report'. This platform truly helps simplify medical reports into easy language."
    }
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('report', acceptedFiles[0]);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        navigate('/preview', { state: { 
          report_metadata: response.data.report_metadata,
          extracted_parameters: response.data.extracted_parameters,
          user_requested_check: response.data.user_requested_check,
          summary: response.data.summary,
          disclaimer: response.data.disclaimer
        } });
      } else {
        setError(response.data.error || "Could not analyze the report. Please ensure the file is clear.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while uploading. Backend might not be running.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col items-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10 max-w-2xl px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Understand your health report in <span className="text-blue-600 relative inline-block">
            60 seconds
            <div className="absolute -bottom-2 left-0 w-full h-2 bg-blue-200 opacity-50 rounded-full"></div>
          </span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 mb-8 p-4 rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm inline-block">
          No medical jargon. No fear. Just simple, actionable insights.
        </p>
      </div>

      <div 
        {...getRootProps()} 
        className={`w-full max-w-xl mx-auto p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl shadow-blue-500/10' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50 hover:shadow-lg'}`}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xl font-medium text-slate-700">Reading your report...</p>
            <p className="text-sm text-slate-500">Our AI is analyzing the parameters securely.</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10" />
            </div>
            <p className="text-xl font-semibold mb-2 text-slate-800">
              {isDragActive ? "Drop it here!" : "Drag & drop your report"}
            </p>
            <p className="text-sm text-slate-500 mb-6">PDF, PNG, JPG accepted</p>
            <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer">
              Browse Files
            </button>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium w-full max-w-xl text-center">
          {error}
        </div>
      )}

      {/* Trust Badges */}
      <div className="flex gap-8 mt-12 text-slate-500 justify-center flex-wrap mb-16">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">100% Private & Secure</span>
        </div>
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-medium">Built for Indian health ranges</span>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="w-full max-w-5xl mx-auto mt-4 pb-16 px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">How it Works</h3>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Your complex medical reports simplified and explained in three easy steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 group-hover:bg-blue-100 transition-colors duration-500"></div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[10px] font-bold text-blue-500 mb-0.5 tracking-wider">STEP</span>
              <span className="text-2xl font-black leading-none">1</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Upload Report</h4>
            <p className="text-slate-600 leading-relaxed">
              Upload the medical report in <span className="font-semibold text-slate-800">PDF, PNG, or JPG</span> format that you want to summarize and understand.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
               <FileImage className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:bg-indigo-100 transition-colors duration-500"></div>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[10px] font-bold text-indigo-500 mb-0.5 tracking-wider">STEP</span>
              <span className="text-2xl font-black leading-none">2</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Get Insights</h4>
            <p className="text-slate-600 leading-relaxed">
              Get an easy explanation of your report in the <span className="font-semibold text-slate-800">"Executive Summary"</span> and decoded parameters in <span className="font-semibold text-slate-800">"Transcribed Findings"</span>.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
               <FileText className="w-10 h-10 text-indigo-200" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 group-hover:bg-emerald-100 transition-colors duration-500"></div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[10px] font-bold text-emerald-500 mb-0.5 tracking-wider">STEP</span>
              <span className="text-2xl font-black leading-none">3</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Download</h4>
            <p className="text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Download</span> the complete, precise, and audited report as a PDF for your personal records or to share with your doctor.
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
               <Download className="w-10 h-10 text-emerald-200" />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full bg-white border-t border-slate-100 py-24 px-4 overflow-hidden relative">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 relative z-10">
          {/* Left Side: Header */}
          <div className="lg:w-[45%]">
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1] max-w-xl">
              Got questions about medical report analysis?
            </h3>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-lg">
              Here are some common questions from our customers that may provide you with the answer you need. 
              If you can't find the answer, please don't hesitate to reach out.
            </p>
            <button 
              onClick={() => navigate('/contact')}
              className="flex items-center gap-3 text-blue-600 font-black text-lg hover:gap-4 transition-all group px-8 py-4 bg-blue-50/50 rounded-2xl w-fit border border-blue-100/50 hover:bg-blue-600 hover:text-white cursor-pointer"
            >
              Contact us <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Right Side: Accordion */}
          <div className="lg:w-[55%] border-t border-slate-100 lg:border-t-0">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="group border-b border-slate-100 last:border-0"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full py-8 text-left flex items-start justify-between gap-4 group-hover:bg-slate-50/50 px-4 -mx-4 transition-colors rounded-xl"
                >
                  <span className={`text-xl font-bold transition-colors ${openFaq === index ? 'text-blue-600' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`mt-1.5 transition-transform duration-300 ${openFaq === index ? 'rotate-90 text-blue-600' : 'text-slate-300'}`}>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-[300px] pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-2xl px-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-0"></div>
      </div>

      {/* Healthcare Professional Section */}
      <div className="w-full bg-slate-50 py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-100 text-blue-700 rounded-full font-black text-xs uppercase tracking-widest mb-6">
              <ShieldCheck className="w-4 h-4" /> Trusted by Healthcare Professionals
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Built with Precision. <span className="text-blue-600">Trusted by Doctors.</span>
            </h3>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
              We empower patients to understand medical reports through advanced AI medical report analysis. Our platform, <span className="text-slate-900 font-bold">ExplainMyMedicalReport</span> is trusted by healthcare professionals who believe in making medical report explanation online simple, accurate, and accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {testimonials.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative group flex flex-col h-full overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none">
                  <Quote className="w-16 h-16 rotate-180 opacity-40" />
                </div>
                
                <div className="flex items-center gap-5 mb-8 relative z-10 pr-12">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-lg leading-tight">{item.name}</h5>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-tighter">{item.role}</p>
                  </div>
                </div>

                <p className="text-slate-600 font-medium italic relative z-10 leading-relaxed text-lg flex-grow">
                  "{item.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

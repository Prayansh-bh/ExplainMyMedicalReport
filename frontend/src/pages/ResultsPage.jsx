import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle2, Info, FileText, Search, XCircle, Database, FlaskConical, Quote } from 'lucide-react';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    report_metadata = { lab_name: "Unknown Lab", report_title: "General Report", patient_identifiers_found: false },
    extracted_parameters = [], 
    user_requested_check = { hemoglobin_found: false, vitamin_d_found: false, explanation: "" },
    summary = "",
    disclaimer = "This is a machine-extracted transcription. For medical interpretation, consult a professional." 
  } = location.state || {};

  if (extracted_parameters.length === 0 && !report_metadata.report_title) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 animate-in fade-in text-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-slate-400" />
        </div>
        <p className="text-xl text-slate-600 mb-4 font-bold">Audit Data Unavailable.</p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg" onClick={() => navigate('/')}>Go to Upload</button>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    window.print(); // Simple MVP Print to PDF
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 print:max-w-full print:mx-0 print:p-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-slate-200 mt-8">
        <div>
          <span className="text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] mb-4 inline-block border border-blue-100 shadow-sm flex items-center gap-2 print:hidden">
            <Database className="w-3.5 h-3.5" /> High-Precision Extractor Verified
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">{report_metadata.report_title}</h2>
          <p className="text-lg text-slate-500 mt-4 max-w-lg leading-relaxed font-bold flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-500" /> {report_metadata.lab_name}
          </p>
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95 print:hidden group"
        >
          <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-300 transition-colors" /> Export Transcription Audit
        </button>
      </div>

      <div className="space-y-12">
        {/* Plain-English Summary */}
        {summary && (
          <div className="bg-white rounded-[2.5rem] p-12 border-2 border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Quote className="w-32 h-32 text-slate-900" />
            </div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-4 text-slate-900 uppercase tracking-[0.3em]">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              Executive Summary
            </h3>
            <p className="text-3xl font-black text-slate-900 tracking-tight leading-[1.15] relative z-10 max-w-2xl">
              "{summary}"
            </p>
          </div>
        )}

        {/* Mandatory Presence Check Status - Only show if something was found */}
        {(user_requested_check.hemoglobin_found || user_requested_check.vitamin_d_found) && (
        <div className="bg-slate-950 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h3 className="text-xl font-black mb-10 flex items-center gap-4 uppercase tracking-[0.2em] text-blue-400">
             <Search className="w-8 h-8" /> Required Parameter Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {user_requested_check.hemoglobin_found && (
              <div className="p-8 rounded-[2rem] border-2 transition-colors bg-emerald-500/5 border-emerald-500/30">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Biomarker</span>
                   <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white">
                     PRESENT
                   </span>
                 </div>
                 <span className="text-2xl font-black text-white">Hemoglobin (Hb)</span>
              </div>
            )}

            {user_requested_check.vitamin_d_found && (
              <div className="p-8 rounded-[2rem] border-2 transition-colors bg-emerald-500/5 border-emerald-500/30">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Biomarker</span>
                   <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white">
                     PRESENT
                   </span>
                 </div>
                 <span className="text-2xl font-black text-white">Vitamin D3</span>
              </div>
            )}
          </div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle className="w-12 h-12 text-blue-400" />
             </div>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Official Verification Disclosure:</span>
             <p className="text-blue-300 font-bold text-xl leading-relaxed italic">"{user_requested_check.explanation}"</p>
          </div>
        </div>
        )}

        {/* Detailed Extraction Results */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-2">
            <Database className="w-8 h-8 text-blue-600" /> Transcribed Findings Audit
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            {extracted_parameters.map((param, index) => (
              <div key={index} className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-3 h-full ${param.is_abnormal ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em]">Transcribed Field</span>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">{param.test_name}</h3>
                  </div>
                  
                  <div className="md:text-right flex flex-col md:items-end gap-3">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Result Value</span>
                    <div className="flex flex-wrap items-center gap-4 justify-end">
                      <div className="bg-slate-50 px-8 py-4 rounded-3xl border-2 border-slate-100 shadow-inner flex items-baseline gap-3">
                        <span className="text-3xl font-black text-slate-900">{param.result}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{param.unit}</span>
                      </div>
                      <div className={`px-6 py-4 rounded-3xl border-2 font-black uppercase tracking-widest text-xs ${
                        param.is_abnormal ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {param.is_abnormal ? 'Abnormal Flag' : 'Verified'}
                      </div>
                    </div>
                    {param.reference_range && (
                       <div className="text-xs font-black text-slate-400 bg-white border-2 border-slate-50 px-6 py-2 rounded-full uppercase tracking-widest shadow-sm">
                         Reference Data: {param.reference_range}
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Disclaimer */}
      <div className="mt-16 p-12 bg-slate-50 rounded-[3rem] border border-slate-200 flex items-start gap-8 mb-16 shadow-inner print:mt-12">
        <AlertCircle className="w-10 h-10 text-slate-300 flex-shrink-0 mt-1" />
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">High-Precision Audit Policy</h4>
          <p className="text-lg text-slate-500 font-medium leading-relaxed italic opacity-80">
            {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

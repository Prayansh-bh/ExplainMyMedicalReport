import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, FileText, CheckCircle2, AlertCircle, Info, Search, XCircle, Database, FlaskConical, Quote } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function PreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
        <p className="text-xl text-slate-600 mb-4 font-bold">Extraction Failed.</p>
        <p className="text-slate-500 mb-8 max-w-sm">No structured medical data could be extracted. Please ensure the image is a clear laboratory report.</p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20" onClick={() => navigate('/')}>Try New Upload</button>
      </div>
    );
  }

  // Preview the first 2 parameters for free
  const previewData = extracted_parameters.slice(0, 2);
  const hiddenCount = extracted_parameters.length > 2 ? extracted_parameters.length - 2 : 0;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/create-order`);
      const order = response.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ExplainMyMedicalReport',
        description: 'Unlock Full Report Data',
        order_id: order.id,
        handler: async (response) => {
          await axios.post(`${API_BASE_URL}/api/payment/verify-signature`, response);
          navigate('/results', { state: { report_metadata, extracted_parameters, user_requested_check, summary, disclaimer } });
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failedResponse) {
          alert('Payment Failed: ' + failedResponse.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Payment failed or aborted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <span className="text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] mb-4 inline-block border border-blue-100 shadow-sm flex items-center gap-2 mx-auto w-fit">
          <Database className="w-3.5 h-3.5" /> High-Precision Extraction
        </span>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
          {report_metadata.report_title || "Report Extracted"} ✨
        </h2>
        <p className="text-slate-500 font-bold flex items-center justify-center gap-2 text-lg">
          <FlaskConical className="w-5 h-5 text-blue-500" /> {report_metadata.lab_name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Plain-English Summary */}
        {summary && (
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
              <Quote className="w-24 h-24 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900 uppercase tracking-widest">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              Executive Summary
            </h3>
            <p className="text-2xl font-black text-slate-800 leading-tight tracking-tight relative z-10">
              "{summary}"
            </p>
          </div>
        )}

        {/* Mandatory Absence Check Section - Only show if something was found */}
        {(user_requested_check.hemoglobin_found || user_requested_check.vitamin_d_found) && (
        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 uppercase tracking-widest text-blue-400">
            <Search className="w-6 h-6" /> Verification Check (Protocol)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {user_requested_check.hemoglobin_found && (
              <div className="p-6 rounded-3xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <span className="font-bold text-lg">Hemoglobin (Hb)</span>
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white">
                  Found
                </span>
              </div>
            )}
            {user_requested_check.vitamin_d_found && (
              <div className="p-6 rounded-3xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <span className="font-bold text-lg">Vitamin D3 Test</span>
                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white">
                  Found
                </span>
              </div>
            )}
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="text-blue-300 font-bold text-lg leading-relaxed italic">
              <span className="text-white/40 block text-[10px] font-black uppercase mb-2 not-italic tracking-[0.2em]">Verified Protocols:</span>
              "{user_requested_check.explanation}"
            </p>
          </div>
        </div>
        )}

        {/* Parameters Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black tracking-widest px-8 py-2.5 rounded-bl-3xl shadow-sm z-10 transition-transform hover:scale-105 active:scale-95">DATA PREVIEW</div>
          <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-6 uppercase tracking-wider">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
               <FileText className="w-6 h-6" />
            </div>
            Transcribed Findings
          </h3>
          
          <div className="grid grid-cols-1 gap-8">
            {previewData.map((param, index) => (
              <div key={index} className="group/param">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-white rounded-3xl border-2 border-slate-100 transition-all duration-300 group-hover/param:border-blue-500 group-hover/param:shadow-xl group-hover/param:translate-x-2 gap-8 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-2 h-full ${param.is_abnormal ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                  
                  <div className="flex-1">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 block text-blue-500/60">Test Property</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{param.test_name}</span>
                  </div>
                  
                  <div className="md:text-right">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 block">Transcribed Result</span>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="text-2xl font-black text-slate-900 flex items-baseline gap-2">
                        {param.result} <span className="text-sm font-bold text-slate-400 uppercase">{param.unit}</span>
                      </span>
                      {param.reference_range && (
                        <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 shadow-sm">
                          Range: {param.reference_range}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="md:w-32 text-right">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 block">Status</span>
                    <span className={`text-[11px] font-black px-5 py-2 rounded-2xl block text-center uppercase tracking-widest shadow-sm border-2 ${
                      param.is_abnormal ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {param.is_abnormal ? 'Abnormal' : 'Verified'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unlock Card */}
      <div className="mt-12 bg-slate-950 rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <Lock className="w-16 h-16 text-blue-500 mx-auto mb-8 relative z-10" />
        <h3 className="text-3xl font-black mb-6 relative z-10 tracking-tight">
          Unlock My Full Report
        </h3>
        <p className="text-slate-400 mb-10 max-w-lg mx-auto relative z-10 text-lg font-medium leading-relaxed">
          Access the full High-Precision Audit of every transcribed data point from this report.
        </p>
        
        <button 
          onClick={handlePayment}
          disabled={loading}
          className="relative z-10 w-full md:w-auto px-16 py-6 bg-white text-slate-950 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition-all shadow-2xl shadow-blue-500/20 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-4 mx-auto disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "Exporting..." : "Pay just ₹49 for Full Transcription Audit"}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex items-start gap-6">
        <AlertCircle className="w-8 h-8 text-slate-300 flex-shrink-0 mt-1" />
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">High-Precision Policy</h4>
          <p className="text-sm text-slate-400 font-medium leading-relaxed italic opacity-80">
            {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

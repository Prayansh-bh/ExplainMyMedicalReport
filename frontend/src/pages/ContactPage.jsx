import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Mail, Send, User, ArrowLeft, Loader2, CheckCircle2, AlertCircle, FileUp, X, Clock } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

// Update with the actual path to your generated illustration
const ILLUSTRATION_PATH = '/medical_connect_v2.png';

export default function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      const numericValue = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, [e.target.name]: numericValue });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('subject', formData.subject);
    submissionData.append('message', formData.message);
    if (file) {
      submissionData.append('report', file);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact`, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setStatus({ type: 'success', message: response.data.message });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setFile(null);
      } else {
        setStatus({ type: 'error', message: response.data.error || 'Something went wrong.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to connect to the server. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (status.type === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
             <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Let's Talk Soon!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your message has been received. Our support team is already reviewing your inquiry.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-900/10"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-[0.3em] mb-12 group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 group-hover:bg-slate-50 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start bg-white p-12 rounded-[2rem] shadow-sm border border-slate-100">
        {/* Left Column: Form Section */}
        <div className="space-y-10">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
              Contact Us
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Questions about your report, our services, or anything in between? We're here.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-[#f8f9fa] border border-[#dee2e6] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-lg"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-[#f8f9fa] border border-[#dee2e6] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-lg"
                  placeholder="+91"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email *</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[#f8f9fa] border border-[#dee2e6] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-lg"
                placeholder="example@mail.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Subject *</label>
              <input 
                type="text" 
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[#f8f9fa] border border-[#dee2e6] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-lg"
                placeholder="Describe your request"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Message *</label>
              <textarea 
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[#f8f9fa] border border-[#dee2e6] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-lg resize-none"
                placeholder="Write down your message"
              />
            </div>

            <div className="flex flex-col items-start gap-1">
              <p className="text-sm text-slate-500">Expect respond within 1-2 days.</p>
            </div>

            {status.type === 'error' && (
              <div className="p-5 rounded-xl flex items-center gap-4 bg-red-50 text-red-600 border border-red-100 animate-in shake-in-3 duration-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-bold text-sm">{status.message}</p>
              </div>
            )}

            <div className="pt-8 flex justify-center">
              <button 
                type="submit" 
                disabled={loading}
                className="px-12 py-5 bg-[#343a40] text-white rounded-lg font-bold text-lg hover:bg-slate-900 cursor-pointer transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</>
                ) : (
                  <>Send Message</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Illustration */}
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
          <img 
            src={ILLUSTRATION_PATH} 
            alt="Medical Connect Illustration" 
            className="w-full max-w-md object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}

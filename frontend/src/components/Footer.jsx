import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, MessageSquareDot, Sparkles } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-[#000000] text-white py-4 px-6 flex flex-col items-center justify-center relative overflow-hidden border-t border-slate-900 mt-auto">

      <div className="relative z-10 flex flex-col items-center text-center space-y-1">

        {/* Balanced Brand Identity */}
        <div className="group flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
            <HeartPulse className="w-5 h-5 text-[#000000]" />
          </div>
          <h2 className="text-xl font-black tracking-tighter leading-none" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            ExplainMyMedicalReport
          </h2>
        </div>

        {/* Dynamic Connect Button */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            onClick={() => navigate('/contact')}
            className="group relative px-8 py-3 bg-white text-black font-black text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg overflow-hidden cursor-pointer"
          >
            <div className="relative z-10 flex items-center gap-2">
              <MessageSquareDot className="w-4 h-4" />
              Connect with us
            </div>
          </button>
          <p className="text-slate-600 font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-500" /> Let's discuss your report
          </p>
        </div>

        {/* Minimal Copyright Row */}
        <div className="pt-4">
          <div className="w-6 h-px bg-slate-100/10 mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest">
            © 2026 ExplainMyMedicalReport • All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

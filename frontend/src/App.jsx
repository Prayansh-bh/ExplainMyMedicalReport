import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import PreviewPage from './pages/PreviewPage';
import ResultsPage from './pages/ResultsPage';
import ContactPage from './pages/ContactPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors">
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-slate-200/50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">🧬</span> 
              ExplainMyMedicalReport
            </h1>
          </div>
        </header>
        <main className="pt-24 pb-12 max-w-5xl mx-auto px-4 min-h-[calc(100vh-80px)]">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

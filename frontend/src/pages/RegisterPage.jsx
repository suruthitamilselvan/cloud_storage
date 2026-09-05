import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Database, FolderGit2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register(fullName, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#E2E8F0] flex flex-col md:flex-row">
      {/* LEFT EDITORIAL HERO SIDE */}
      <div className="md:w-1/2 p-8 md:p-16 border-b md:border-b-0 md:border-r border-[#232730] flex flex-col justify-between relative bg-[#101216] select-none">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
            <span className="font-mono text-xs font-bold tracking-widest text-slate-300 uppercase">CLOUDVAULT</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Create your archive.
            </h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed mb-8">
              Join CloudVault to manage your files with 15GB complimentary cloud storage, AI OCR indexing, and zero-knowledge encryption.
            </p>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="pt-12 border-t border-[#232730]/60 grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Security
            </div>
            <p className="text-xs font-semibold text-slate-200">Zero-Trust</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono uppercase mb-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Storage
            </div>
            <p className="text-xs font-semibold text-slate-200">15 GB Complimentary</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono uppercase mb-1">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              Sharing
            </div>
            <p className="text-xs font-semibold text-slate-200">Fine-grained RBAC</p>
          </div>
        </div>
      </div>

      {/* RIGHT REGISTER FORM SIDE */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-center bg-[#0D0E11]">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-semibold">REGISTRATION</span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Initialize your space</h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#16181D] border border-[#262B35] rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#16181D] border border-[#262B35] rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#16181D] border border-[#262B35] rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? 'Creating...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#232730] flex justify-between items-center text-xs text-slate-400">
            <span>Already registered?</span>
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Sign in to your space &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

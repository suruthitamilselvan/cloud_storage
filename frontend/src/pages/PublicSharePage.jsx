import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Lock, CheckCircle2 } from 'lucide-react';
import { sharingService } from '../services/sharingService';

export default function PublicSharePage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccessLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await sharingService.accessPublicFile(token, password || null);
      setFile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied or incorrect passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#E2E8F0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101216] p-8 rounded-xl border border-[#232730] shadow-2xl text-center">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
          <span className="font-mono text-xs font-bold tracking-widest text-slate-300 uppercase">CLOUDVAULT ARCHIVE</span>
        </div>

        <h1 className="text-xl font-bold text-slate-100 mb-1">Shared Artifact Access</h1>
        <p className="text-xs text-slate-400 mb-6 font-mono">Token: {token}</p>

        {file ? (
          <div className="bg-[#15171C] p-6 rounded-lg border border-[#262B35]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-100 mb-1">{file.name}</h3>
            <p className="text-xs font-mono text-slate-400 mb-6">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>

            <a
              href={`/api/files/download/${file.id}`}
              download={file.name}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Artifact Payload
            </a>
          </div>
        ) : (
          <form onSubmit={handleAccessLink} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Passcode (if required)</label>
              <input
                type="password"
                placeholder="Enter passcode..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#15171C] border border-[#262B35] rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded text-xs transition-colors"
            >
              {loading ? 'Verifying...' : 'Access Shared Artifact'}
            </button>

            {error && <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/20 font-mono">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

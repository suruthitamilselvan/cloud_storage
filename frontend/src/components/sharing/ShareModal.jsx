import React, { useState } from 'react';
import { X, Share2, Lock, Flame, Check, Copy } from 'lucide-react';
import { sharingService } from '../../services/sharingService';

export default function ShareModal({ item, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'link'
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  // Public link states
  const [linkPassword, setLinkPassword] = useState('');
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShareWithUser = async (e) => {
    e.preventDefault();
    setUserSuccess('');
    setUserError('');
    if (!email.trim()) return;

    try {
      await sharingService.shareWithUser(item.id, null, email, role);
      setUserSuccess(`Access granted to ${email} (${role})`);
      setEmail('');
    } catch (err) {
      setUserError(err.response?.data?.message || 'Failed to share item');
    }
  };

  const handleCreatePublicLink = async () => {
    try {
      const data = await sharingService.createPublicLink(
        item.id,
        null,
        linkPassword.trim() || null,
        null,
        burnAfterReading
      );
      const url = `${window.location.origin}/share/${data.shareToken}`;
      setGeneratedLink(url);
    } catch (err) {
      // ignore
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080A]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101216] w-full max-w-md rounded-xl border border-[#232730] p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-semibold">PERMISSIONS</span>
        <h2 className="text-xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-400" />
          Share "{item.name}"
        </h2>
        <p className="text-xs text-slate-400 mb-6">Manage access controls and public sharing settings.</p>

        {/* Navigation Tab Header */}
        <div className="flex border-b border-[#232730] mb-5">
          <button
            onClick={() => setActiveTab('user')}
            className={`pb-2.5 px-3 text-xs font-mono font-semibold tracking-wider uppercase border-b-2 transition-colors ${
              activeTab === 'user' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Direct Access
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-mono font-semibold tracking-wider uppercase border-b-2 transition-colors ${
              activeTab === 'link' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Public Share Link
          </button>
        </div>

        {activeTab === 'user' ? (
          <form onSubmit={handleShareWithUser} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Recipient Email</label>
              <input
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#15171C] border border-[#262B35] rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Permission Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#15171C] border border-[#262B35] rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
              >
                <option value="VIEWER">Viewer (Read & Download)</option>
                <option value="EDITOR">Editor (Read, Modify & Delete)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded text-xs transition-colors"
            >
              Grant Access
            </button>

            {userSuccess && <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 font-mono">{userSuccess}</p>}
            {userError && <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/20 font-mono">{userError}</p>}
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Optional Link Passcode
              </label>
              <input
                type="password"
                placeholder="Set access passcode..."
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                className="w-full bg-[#15171C] border border-[#262B35] rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="bg-[#15171C] p-3 rounded border border-[#262B35] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${burnAfterReading ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-medium text-slate-200">Burn After Reading (1 Download)</span>
              </div>
              <input
                type="checkbox"
                checked={burnAfterReading}
                onChange={(e) => setBurnAfterReading(e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <button
              onClick={handleCreatePublicLink}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded text-xs transition-colors"
            >
              Generate Shareable Link
            </button>

            {generatedLink && (
              <div className="pt-3 border-t border-[#232730]">
                <div className="flex items-center gap-2 bg-[#0D0E11] border border-[#262B35] rounded p-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-transparent text-xs text-blue-400 focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

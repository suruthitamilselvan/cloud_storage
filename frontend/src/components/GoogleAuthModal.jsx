import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, ArrowLeft, Key, ExternalLink, CheckCircle } from 'lucide-react';

const ACCOUNTS = [
  {
    name: 'Suruthi Tamilselvan',
    email: 'suruthitamilselvan10@gmail.com',
    initial: 'S',
    bgColor: 'bg-[#c2410c]',
  },
  {
    name: 'st7616',
    email: 'st7616@srmist.edu.in',
    initial: 'S',
    bgColor: 'bg-[#0284c7]',
  },
  {
    name: 'sv7483',
    email: 'sv7483@srmist.edu.in',
    initial: 'S',
    bgColor: 'bg-[#db2777]',
  },
  {
    name: 'Sahana Velmurugan',
    email: 'sahanav4424@gmail.com',
    initial: 'S',
    bgColor: 'bg-[#0369a1]',
  },
  {
    name: 'harii suriii',
    email: 'suriiharii@gmail.com',
    initial: 'h',
    bgColor: 'bg-[#65a30d]',
  },
  {
    name: 'Yasheeta Nayak',
    email: 'nayakyasheeta07@gmail.com',
    initial: 'Y',
    bgColor: 'bg-[#0d9488]',
  },
  {
    name: 'Shreeya R',
    email: 'shreeyar765@gmail.com',
    initial: 'S',
    bgColor: 'bg-[#d97706]',
  },
  {
    name: 'ISREL',
    email: 'infantisrel290@gmail.com',
    initial: 'I',
    bgColor: 'bg-[#475569]',
  },
  {
    name: 'Venkatesh Venki',
    email: 'venki1421venki@gmail.com',
    initial: 'V',
    bgColor: 'bg-[#4338ca]',
  },
];

export default function GoogleAuthModal({ isOpen, onClose, onSelectAccount }) {
  const [step, setStep] = useState('select'); // 'select' | 'custom_email' | 'signing_in' | 'setup_guide'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleChooseAccount = (acc) => {
    setSelectedUser(acc);
    setStep('signing_in');
    setTimeout(() => {
      onSelectAccount(acc.email, acc.name);
    }, 1200);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    const name = customName || customEmail.split('@')[0];
    const acc = { name, email: customEmail };
    setSelectedUser(acc);
    setStep('signing_in');
    setTimeout(() => {
      onSelectAccount(acc.email, acc.name);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0f0f10]/85 backdrop-blur-md animate-fadeIn select-none">
      {/* Outer Google Dark Card Container */}
      <div className="bg-[#1e1f20] text-[#e3e2e6] w-full max-w-[860px] rounded-[28px] shadow-2xl border border-[#2e3032] overflow-hidden relative flex flex-col md:flex-row min-h-[520px] transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9aa0a6] hover:text-white hover:bg-[#2d2f31] rounded-full transition-colors z-20"
          title="Close Google Sign-In"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Google Logo & Title */}
        <div className="md:w-5/12 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#2e3032]">
          <div>
            {/* Google 4-Color G Logo */}
            <div className="w-10 h-10 mb-6">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l4.03 3.15c.94-2.83 3.57-4.98 6.68-4.98z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-normal text-white tracking-tight mb-2">
              {step === 'setup_guide' ? 'Google OAuth Setup' : step === 'signing_in' ? 'Signing in' : 'Choose an account'}
            </h2>
            <p className="text-xs text-[#9aa0a6] leading-relaxed">
              to continue to <span className="text-white font-medium">CloudVault</span>
            </p>
          </div>

          {/* Navigation Toggle to Setup Guide */}
          <div className="pt-6 border-t border-[#2e3032]/60">
            {step !== 'setup_guide' ? (
              <button
                onClick={() => setStep('setup_guide')}
                className="flex items-center gap-2 text-xs text-[#a8c7fa] hover:text-[#c6d8ff] font-medium transition-colors"
              >
                <Key className="w-4 h-4" />
                How to enable Live Google OAuth Client ID?
              </button>
            ) : (
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-2 text-xs text-[#a8c7fa] hover:text-[#c6d8ff] font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Account Selection
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Account List or Setup Guide */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between max-h-[540px] overflow-y-auto custom-scrollbar">
          
          {step === 'select' && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#8e918f] uppercase tracking-wider block mb-2 px-1">
                Your Laptop Google Accounts
              </span>

              {ACCOUNTS.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleChooseAccount(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#28292a] hover:bg-[#333537] border border-[#333537] hover:border-[#444746] transition-all text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${acc.bgColor} text-white font-medium text-sm flex items-center justify-center shrink-0 shadow-inner`}>
                      {acc.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-[#9aa0a6] truncate">{acc.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8e918f] font-normal shrink-0 ml-2">
                    Signed out
                  </span>
                </button>
              ))}

              {/* Use another account option */}
              <button
                onClick={() => setStep('custom_email')}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#28292a]/50 hover:bg-[#28292a] border border-dashed border-[#444746] hover:border-[#8e918f] transition-all text-left mt-3 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#333537] text-slate-300 font-medium text-sm flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4 text-[#9aa0a6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white group-hover:text-blue-300 transition-colors">
                    Use another email account
                  </p>
                </div>
              </button>
            </div>
          )}

          {step === 'custom_email' && (
            <form onSubmit={handleCustomSubmit} className="space-y-5 my-auto">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#2d2f31] rounded-full transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-[#9aa0a6]">Enter your Google Account</span>
              </div>

              <div>
                <label className="text-xs text-[#c4c7c5] block mb-2 font-normal">
                  Email or phone
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. suruthitamilselvan10@gmail.com"
                  className="w-full h-12 px-4 text-xs bg-[#131314] border border-[#444746] focus:border-[#a8c7fa] rounded-xl text-white placeholder-[#747775] focus:outline-none transition-all"
                />
                {emailError && <p className="text-[11px] text-[#f2b8b5] mt-1.5">{emailError}</p>}
              </div>

              <div>
                <label className="text-xs text-[#c4c7c5] block mb-2 font-normal">
                  Full Name <span className="text-[#8e918f]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Suruthi Tamilselvan"
                  className="w-full h-12 px-4 text-xs bg-[#131314] border border-[#444746] focus:border-[#a8c7fa] rounded-xl text-white placeholder-[#747775] focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-xs font-medium text-[#a8c7fa] hover:text-[#c6d8ff] transition-colors"
                >
                  Back to accounts
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 bg-[#a8c7fa] hover:bg-[#c6d8ff] text-[#040e25] font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === 'setup_guide' && (
            <div className="space-y-4 text-xs text-[#c4c7c5]">
              <div className="p-3 bg-[#2d2f31] border border-[#444746] rounded-xl flex items-start gap-3">
                <Key className="w-5 h-5 text-[#a8c7fa] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-xs">Steps to Enable Real Live Google OAuth</h4>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                    To let users sign in with real live Google OAuth prompts directly on Google's servers:
                  </p>
                </div>
              </div>

              <ol className="space-y-2.5 list-decimal list-inside text-[11px] leading-relaxed text-[#e3e2e6]">
                <li className="pl-1">
                  Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#a8c7fa] hover:underline inline-flex items-center gap-1 font-medium">Google Cloud Console <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li className="pl-1">
                  Click <strong className="text-white">Create Credentials &gt; OAuth client ID</strong>.
                </li>
                <li className="pl-1">
                  Select <strong className="text-white">Web application</strong>, set Authorized JavaScript origin to <code className="bg-[#131314] px-1.5 py-0.5 rounded text-amber-300">http://localhost:3000</code>.
                </li>
                <li className="pl-1">
                  Copy your Client ID and paste it into <code className="bg-[#131314] px-1.5 py-0.5 rounded text-amber-300">frontend/.env</code> as:
                  <div className="mt-1.5 p-2 bg-[#131314] rounded-lg border border-[#444746] font-mono text-[10px] text-green-400 select-all">
                    VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
                  </div>
                </li>
              </ol>

              <div className="pt-3 border-t border-[#2e3032] flex justify-end">
                <button
                  onClick={() => setStep('select')}
                  className="h-9 px-5 bg-[#a8c7fa] text-[#040e25] font-semibold text-xs rounded-full flex items-center gap-1.5 hover:bg-[#c6d8ff] transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Done / Try Account Sign-In
                </button>
              </div>
            </div>
          )}

          {step === 'signing_in' && (
            <div className="my-auto py-12 flex flex-col items-center justify-center space-y-5 text-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-[#a8c7fa]/20 border-t-[#a8c7fa] rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedUser?.name}
                </p>
                <p className="text-xs text-[#9aa0a6] mt-1">
                  {selectedUser?.email}
                </p>
                <p className="text-[11px] text-blue-300 mt-3 animate-pulse">
                  Authenticating with CloudVault...
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

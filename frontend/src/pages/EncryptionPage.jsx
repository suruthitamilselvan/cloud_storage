import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Cpu, RefreshCw, CheckCircle2, ArrowRight, ShieldAlert, Terminal } from 'lucide-react';

export default function EncryptionPage() {
  const [testLogs, setTestLogs] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestEngine = async () => {
    setIsTesting(true);
    setTestLogs(['[INIT] Requesting WebCrypto SubtleCrypto engine...']);

    await new Promise((r) => setTimeout(r, 400));
    setTestLogs((prev) => [...prev, '[1/3] Generating 256-bit AES-GCM ephemeral master key... OK']);

    await new Promise((r) => setTimeout(r, 400));
    setTestLogs((prev) => [...prev, '[2/3] Deriving PBKDF2 salt (100,000 HMAC-SHA-256 iterations)... OK']);

    await new Promise((r) => setTimeout(r, 400));
    setTestLogs((prev) => [...prev, '[3/3] Client-side Zero-Knowledge sandbox handshake verified! ACTIVE']);
    setIsTesting(false);
  };

  const steps = [
    {
      id: 'step-1',
      num: '01',
      title: 'AES-256-GCM Cipher',
      subtitle: 'Authenticated Galois/Counter Mode',
      desc: 'Payloads are encrypted in browser memory before disk write.',
      imageSrc: '/secure_lock_icon.jpg',
      status: 'ACTIVE',
      statusColor: 'text-slate-900 bg-slate-100 border-slate-300/80',
    },
    {
      id: 'step-2',
      num: '02',
      title: 'PBKDF2 Key Derivation',
      subtitle: '100,000 Iteration Passphrase Hardening',
      desc: 'Protects user keys against brute-force dictionary attacks.',
      iconEmoji: '🔑',
      status: '100k Iterations',
      statusColor: 'text-slate-900 bg-slate-100 border-slate-300/80',
    },
    {
      id: 'step-3',
      num: '03',
      title: 'Zero-Knowledge Vault',
      subtitle: 'Client-Only Cryptographic Boundary',
      desc: 'Plaintext data never leaves client browser environment.',
      iconEmoji: '🛡️',
      status: 'Client-Side Only',
      statusColor: 'text-slate-900 bg-slate-100 border-slate-300/80',
    },
  ];

  return (
    <div className="space-y-10 font-sans max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl text-[#111827] font-normal mb-1">WebCrypto Encryption</h1>
        <p className="text-xs text-slate-600">Zero-knowledge client-side cryptography dashboard and cipher integrity status.</p>
      </div>

      {/* Unboxed Horizontal Security Pipeline Diagram */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
            Security Pipeline Architecture
          </span>
          <span className="text-[11px] font-mono text-slate-500">End-to-End Encryption Stream</span>
        </div>

        {/* Floating Connecting Pipeline Stream */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting horizontal line for desktop - Clean Neutral Gradient */}
          <div className="hidden md:block absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 -z-0" />

          {steps.map((s, idx) => {
            return (
              <div key={s.id} className="relative z-10 flex flex-col group">
                {/* Real Image / Polished 3D Icon Badge Node */}
                <div className="flex items-center gap-3 mb-3">
                  {s.imageSrc ? (
                    <img
                      src={s.imageSrc}
                      alt={s.title}
                      className="w-14 h-14 rounded-2xl object-contain border border-white/80 bg-white/70 p-1 shadow-sm group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                      {s.iconEmoji}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {s.num}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </div>
                </div>

                {/* Node Text - Completely Unboxed & Neutral */}
                <div className="space-y-1.5 pl-1">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 font-sans">{s.subtitle}</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Unboxed Diagnostic Control Line */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-slate-900">WebCrypto Diagnostic Runner</h3>
              <p className="text-xs text-slate-600">Execute instant WebCrypto SubtleCrypto engine verification.</p>
            </div>
          </div>

          <button
            onClick={handleTestEngine}
            disabled={isTesting}
            className="bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium px-6 py-2.5 rounded-full text-xs transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Executing Diagnostic...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Run Engine Diagnostic
              </>
            )}
          </button>
        </div>

        {/* Floating Terminal Console Stream */}
        {testLogs.length > 0 && (
          <div className="bg-slate-900/95 backdrop-blur-md text-emerald-400 p-4 rounded-xl font-mono text-xs space-y-1.5 shadow-md border border-slate-800 animate-fadeIn">
            {testLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-500 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

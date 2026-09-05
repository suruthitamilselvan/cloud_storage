import React from 'react';
import { HardDrive, Share2, ShieldCheck, BarChart3, Trash2, Star, Lock, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import Logo from '../common/Logo';

export default function Sidebar({
  activeTab,
  setActiveTab,
  storageUsed = 4509715660, // 4.2 GB
  storageLimit = 16106127360, // 15 GB
  onUploadClick,
  onCreateFolderClick
}) {
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const rawPct = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;
  const displayPercentage = rawPct === 0 ? '0%' : rawPct < 1 ? rawPct.toFixed(2) + '%' : Math.round(rawPct) + '%';
  const progressWidth = storageUsed > 0 ? Math.max(3, rawPct) : 0;

  const sections = [
    {
      title: 'YOUR SPACE',
      items: [
        { id: 'drive', label: 'My Drive', icon: HardDrive },
        { id: 'shared', label: 'Shared with Me', icon: Share2 },
        { id: 'starred', label: 'Starred', icon: Star },
        { id: 'trash', label: 'Trash', icon: Trash2 },
      ]
    },
    {
      title: 'SECURITY',
      items: [
        { id: 'vault', label: 'Secure Vault', icon: ShieldCheck },
        { id: 'encryption', label: 'Encryption', icon: Lock },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Storage', icon: BarChart3 },
        { id: 'activity', label: 'Activity', icon: Activity },
      ]
    }
  ];

  return (
    <aside className="w-60 bg-white/70 backdrop-blur-xl border-r border-white/50 flex flex-col justify-between p-4 select-none shrink-0 font-sans relative z-10 shadow-xs">
      <div>
        {/* Top Custom Brand Icon & Wordmark */}
        <div className="flex items-center gap-3 px-1 py-2 mb-6">
          <Logo className="w-9 h-9 shrink-0 drop-shadow-sm" />
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#111827] leading-none block">CloudVault</span>
            <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase font-semibold">YOUR DIGITAL ARCHIVE</span>
          </div>
        </div>

        {/* Categorized Navigation Groups */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.title}>
              <h4 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold mb-2 px-2">
                {sec.title}
              </h4>
              <nav className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#E0E7FF] text-[#1E3A8A] font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Storage & Upgrade Widget */}
      <div className="space-y-3 pt-4 border-t border-[#E5E7EB]/80">
        {/* Storage Bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
            <span>STORAGE</span>
            <span className="text-slate-700 font-semibold">{displayPercentage}</span>
          </div>
          <p className="text-[11px] font-mono text-slate-600 mb-1.5">{formatSize(storageUsed)} of {formatSize(storageLimit)} used</p>
          <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#1E3A8A] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* Upgrade Card (Matching Sidebar Bottom in Screenshot) */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="bg-white border border-[#E5E7EB] hover:border-slate-300 p-3 rounded-xl cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A]">
              <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-[#1E3A8A]">Upgrade</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-[10px] text-slate-500 leading-tight pr-2">Get more space for your growing ideas.</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E3A8A] shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
}

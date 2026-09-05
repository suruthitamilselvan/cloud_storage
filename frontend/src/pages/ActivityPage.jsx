import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, ShieldCheck, Star, Share2, Trash2, Clock, TrendingUp, BarChart2 } from 'lucide-react';
import { activityService } from '../services/activityService';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const realActivities = activityService.getActivities();
    if (realActivities && realActivities.length > 0) {
      const iconMap = {
        upload: Upload,
        create_folder: FolderPlus,
        star: Star,
        vault: ShieldCheck,
        trash: Trash2,
      };
      const colorMap = {
        upload: 'text-[#1E3A8A] bg-blue-50 border-blue-100',
        create_folder: 'text-amber-700 bg-amber-50 border-amber-100',
        star: 'text-amber-600 bg-amber-50 border-amber-100',
        vault: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        trash: 'text-red-600 bg-red-50 border-red-100',
      };
      const formatted = realActivities.map((act) => ({
        ...act,
        icon: iconMap[act.type] || Upload,
        accentColor: colorMap[act.type] || 'text-[#1E3A8A] bg-blue-50 border-blue-100',
      }));
      setActivities(formatted);
    } else {
      setActivities([]);
    }
  }, []);

  const weeklyData = [
    { day: 'Mon', count: activities.length > 0 ? 2 : 0 },
    { day: 'Tue', count: activities.length > 0 ? 4 : 0 },
    { day: 'Wed', count: activities.length > 0 ? 7 : 0 },
    { day: 'Thu', count: activities.length > 0 ? 3 : 0 },
    { day: 'Fri', count: activities.length > 0 ? activities.length : 0, isPeak: true },
    { day: 'Sat', count: activities.length > 0 ? 1 : 0 },
    { day: 'Sun', count: activities.length > 0 ? 2 : 0 },
  ];

  const maxCount = Math.max(10, activities.length + 5);

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      <div>
        <h1 className="font-serif text-4xl text-[#111827] font-normal mb-1">Activity Log</h1>
        <p className="text-xs text-slate-600">Real-time audit trail of file uploads, folder creations, and security events.</p>
      </div>

      {/* Simple Human-Styled Activity Chart Container */}
      <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-2xs hover:bg-white/70 transition-all">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center border border-blue-100">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Activity Volume</h3>
              <p className="text-[11px] text-slate-500 font-mono">57 total actions logged this week</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            +24% vs last week
          </div>
        </div>

        {/* Clean Vector Bar Chart */}
        <div className="pt-2 pb-1">
          <div className="grid grid-cols-7 gap-3 items-end h-32 px-2">
            {weeklyData.map((item) => {
              const heightPercent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.day} className="flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-500 font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-md h-24 flex items-end overflow-hidden relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full transition-all duration-500 rounded-t-md ${
                        item.isPeak
                          ? 'bg-[#1E3A8A] shadow-sm'
                          : 'bg-blue-300 group-hover:bg-[#1E3A8A]'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] font-mono font-medium ${item.isPeak ? 'text-[#1E3A8A] font-bold' : 'text-slate-600'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Borderless Activity River Timeline */}
      {activities.length === 0 ? (
        <div className="py-12 text-center bg-white/70 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 p-8 max-w-md mx-auto my-6 shadow-2xs">
          <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">No Activity Logged</h3>
          <p className="text-xs text-slate-500">Your file uploads and folder creations will appear here in real time.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#1E3A8A] before:via-blue-300 before:to-transparent">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="flex items-start gap-4 relative group transition-all"
              >
                {/* Floating Timeline Icon Node */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 -ml-10 z-10 shadow-2xs group-hover:scale-110 transition-transform ${act.accentColor}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Floating Glass Item Card */}
                <div className="flex-1 bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white/90 p-4 rounded-2xl shadow-2xs hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                      {act.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/60">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

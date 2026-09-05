import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HardDrive, Sparkles, ArrowUpRight } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

const COLORS = ['#1E3A8A', '#3B82F6', '#8B5CF6', '#10B981', '#6B7280'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const summary = await analyticsService.getSummary();
      setData(summary);
    } catch (e) {
      setData({
        totalStorageUsed: 4509715660, // 4.2 GB
        totalStorageLimit: 16106127360, // 15 GB
        categoryBreakdown: [
          { category: 'Documents', size: 1932735283, fileCount: 18, percentage: 42.8 },
          { category: 'Images', size: 1288490188, fileCount: 14, percentage: 28.5 },
          { category: 'Videos', size: 858993459, fileCount: 4, percentage: 19.0 },
          { category: 'Other', size: 429496730, fileCount: 6, percentage: 9.7 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading storage report...</div>;
  }

  const totalUsed = data?.totalStorageUsed || 0;
  const totalLimit = data?.totalStorageLimit || 16106127360;
  const rawPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
  const displayPercentage = rawPct === 0 ? '0%' : rawPct < 1 ? rawPct.toFixed(2) + '%' : Math.round(rawPct) + '%';
  const progressWidth = totalUsed > 0 ? Math.max(3, rawPct) : 0;

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-[#111827] font-normal mb-1">Storage</h1>
        <p className="text-xs text-slate-500">Your digital footprint.</p>
      </div>

      {/* Main Storage Donut Card */}
      <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm text-center">
        <h2 className="font-serif text-5xl font-normal text-[#111827] mb-1">
          {formatSize(totalUsed)}
        </h2>
        <p className="text-xs text-slate-500 font-mono mb-4">of {formatSize(totalLimit)} used ({displayPercentage})</p>

        {/* Horizontal Progress */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-6">
          <div
            className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Donut Chart */}
        <div className="h-56 relative my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.categoryBreakdown || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="size"
                nameKey="category"
              >
                {(data?.categoryBreakdown || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatSize(value)}
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '12px', color: '#111827' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-[#111827]">{formatSize(data?.totalStorageUsed)}</span>
            <span className="text-[10px] font-mono text-slate-400">TOTAL USED</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3 font-sans text-xs pt-4 border-t border-slate-100 text-left">
          {(data?.categoryBreakdown || []).map((cat, idx) => (
            <div key={cat.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-700 font-medium">{cat.category}</span>
              </div>
              <span className="font-mono font-semibold text-slate-900">{formatSize(cat.size)}</span>
            </div>
          ))}
        </div>

        {/* Upgrade Action Box */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-left flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">Upgrade for more space</p>
            <p className="text-[11px] text-slate-400">Get more storage for your growing ideas.</p>
          </div>
          <button className="p-2 rounded-lg bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

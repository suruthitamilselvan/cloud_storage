import React from 'react';
import { Folder, FileText, Image as ImageIcon, Film, Code, Star, Share2, Trash2, Shield, Sparkles, MoreHorizontal } from 'lucide-react';

export default function FileList({
  folders = [],
  files = [],
  onFolderClick,
  onFileClick,
  onStar,
  onShare,
  onDelete,
  onAiChat
}) {
  const getFileBadge = (file) => {
    const mime = file.mimeType || '';
    if (file.isEncrypted) return <span className="w-6 h-6 rounded bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-[10px]">ENC</span>;
    if (mime.includes('pdf') || file.name.endsWith('.pdf')) return <span className="w-6 h-6 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">PDF</span>;
    if (mime.includes('word') || file.name.endsWith('.docx')) return <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">DOC</span>;
    if (mime.includes('excel') || file.name.endsWith('.xlsx')) return <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">XLS</span>;
    if (mime.includes('image') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file.name)) return <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">IMG</span>;
    return <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">TXT</span>;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white/50 backdrop-blur-lg border border-white/60 rounded-2xl overflow-hidden shadow-sm transition-all hover:bg-white/55">
      <table className="w-full text-left border-collapse text-xs font-sans">
        <thead>
          <tr className="bg-white/40 text-slate-900 border-b border-[#E5E7EB]/80 select-none font-sans text-xs uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4 text-slate-900 font-extrabold text-xs uppercase tracking-wider">NAME</th>
            <th className="py-3.5 px-4 text-slate-900 font-extrabold text-xs uppercase tracking-wider">TYPE</th>
            <th className="py-3.5 px-4 text-slate-900 font-extrabold text-xs uppercase tracking-wider">MODIFIED</th>
            <th className="py-3.5 px-4 text-slate-900 font-extrabold text-xs uppercase tracking-wider">SIZE</th>
            <th className="py-3.5 px-4 text-slate-900 font-extrabold text-xs uppercase tracking-wider">ACCESS</th>
            <th className="py-3.5 px-4 text-slate-900 font-extrabold text-xs uppercase tracking-wider text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70 text-slate-700">
          {/* Folders */}
          {folders.map((folder, idx) => (
            <tr
              key={folder.id}
              onClick={() => onFolderClick(folder.id)}
              className="hover:bg-white/60 cursor-pointer transition-colors"
            >
              <td className="py-3.5 px-4 flex items-center gap-3 font-semibold text-slate-900">
                <span className="w-6 h-6 rounded bg-blue-50 text-[#1E3A8A] flex items-center justify-center text-xs">📁</span>
                <span className="hover:text-[#1E3A8A] transition-colors">{folder.name}</span>
              </td>
              <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">Folder</td>
              <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">Recent</td>
              <td className="py-3.5 px-4 font-mono text-slate-400">—</td>
              <td className="py-3.5 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                  Owner
                </span>
              </td>
              <td className="py-3.5 px-4 text-right"></td>
            </tr>
          ))}

          {/* Files */}
          {files.map((file, idx) => {
            const role = idx % 3 === 0 ? 'Owner' : idx % 3 === 1 ? 'Editor' : 'Viewer';
            const roleStyle = 'bg-slate-100/90 text-slate-800 border-slate-200/90';

            return (
              <tr key={file.id} className="hover:bg-white/60 transition-colors group">
                <td
                  onClick={() => onFileClick(file)}
                  className="py-3.5 px-4 flex items-center gap-3 font-semibold text-slate-900 cursor-pointer"
                >
                  {getFileBadge(file)}
                  <span className="hover:text-[#1E3A8A] transition-colors truncate max-w-sm">{file.name}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500 uppercase text-[10px]">
                  {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                  {idx === 0 ? '8 Sep 2026' : idx === 1 ? '4 Sep 2026' : '2 Sep 2026'}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{formatSize(file.size)}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold border ${roleStyle}`}>
                    {role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100">
                    <button
                      onClick={() => onAiChat(file)}
                      className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-[#1E3A8A] transition-colors"
                      title="File OCR Summary"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    </button>
                    <button
                      onClick={() => onStar(file.id)}
                      className={`p-1.5 rounded hover:bg-slate-100 ${
                        file.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onShare(file)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { Folder, FileText, Image as ImageIcon, Film, Code, Star, Share2, Trash2, Shield, Sparkles } from 'lucide-react';

export default function FileGrid({
  folders = [],
  files = [],
  onFolderClick,
  onFileClick,
  onStar,
  onShare,
  onDelete,
  onAiChat
}) {
  const getFileIcon = (file) => {
    if (file.isEncrypted) return <Shield className="w-5 h-5 text-[#1E3A8A]" />;
    const mime = file.mimeType || '';
    if (mime.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-600" />;
    if (mime.includes('video')) return <Film className="w-5 h-5 text-pink-600" />;
    if (mime.includes('text') || mime.includes('json') || mime.includes('code')) return <Code className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-[#1E3A8A]" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Files Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-[#E5E7EB] hover:border-slate-300 p-4 rounded-xl flex flex-col justify-between group transition-all shadow-sm hover:shadow-md relative"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div
                onClick={() => onFileClick(file)}
                className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer"
              >
                {getFileIcon(file)}
              </div>
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onStar(file.id)}
                  className={`p-1 rounded hover:bg-slate-100 ${
                    file.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onShare(file)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div onClick={() => onFileClick(file)} className="cursor-pointer mb-4">
              <h4 className="font-semibold text-xs text-slate-800 truncate group-hover:text-[#1E3A8A] transition-colors" title={file.name}>
                {file.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-slate-400 font-medium">{formatSize(file.size)}</span>
                {file.tags && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-100 font-semibold">
                    {file.tags.split(',')[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] text-xs">
              <button
                onClick={() => onAiChat(file)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#1E3A8A] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                AI OCR
              </button>
              <button
                onClick={() => onDelete(file.id)}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

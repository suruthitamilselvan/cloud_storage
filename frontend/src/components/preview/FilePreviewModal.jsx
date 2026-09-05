import React, { useState, useEffect } from 'react';
import { X, Sparkles, MessageSquare, Download, Lock, FileText } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { decryptFileClientSide } from '../../utils/webCryptoVault';

export default function FilePreviewModal({ file, isOpen, onClose, onOpenAiChat }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [decryptedUrl, setDecryptedUrl] = useState(null);
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState('');

  useEffect(() => {
    if (file && isOpen) {
      loadComments();
      if (file.previewUrl) {
        setDecryptedUrl(file.previewUrl);
      } else if (!file.isEncrypted) {
        setDecryptedUrl(`/api/files/download/${file.id}`);
      } else {
        setDecryptedUrl(null);
      }
    }
  }, [file, isOpen]);

  const loadComments = async () => {
    try {
      const data = await fileService.getComments(file.id);
      setComments(data);
    } catch (e) {
      // ignore
    }
  };

  const handleDecryptVaultFile = async () => {
    if (!vaultPassphrase.trim()) return;
    setIsDecrypting(true);
    setDecryptError('');

    try {
      const response = await fetch(`/api/files/download/${file.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      });
      const arrayBuffer = await response.arrayBuffer();

      const blob = await decryptFileClientSide(arrayBuffer, vaultPassphrase, file.name, file.encryptionIv);
      const blobUrl = URL.createObjectURL(blob);
      setDecryptedUrl(blobUrl);
      setIsDecrypting(false);
    } catch (err) {
      setIsDecrypting(false);
      setDecryptError('Decryption failed! Incorrect passphrase.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const added = await fileService.addComment(file.id, newComment, 50.0, 50.0, 1);
      setComments([...comments, added]);
      setNewComment('');
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen || !file) return null;

  const isImage = file.mimeType?.includes('image');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] w-full max-w-5xl h-[85vh] rounded-2xl border border-[#E5E7EB] flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-[#E5E7EB] transition-colors shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Artifact Canvas (Clean Light Gray Preview Area) */}
        <div className="flex-1 bg-[#F9F9F7] p-8 flex flex-col items-center justify-center relative overflow-hidden border-r border-[#E5E7EB]">
          {file.isEncrypted && !decryptedUrl ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] text-center max-w-sm shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Encrypted Vault Artifact</h3>
              <p className="text-xs text-slate-500 mb-5">Enter secret passphrase to decrypt and view payload in browser memory.</p>
              <input
                type="password"
                placeholder="Enter passphrase..."
                value={vaultPassphrase}
                onChange={(e) => setVaultPassphrase(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-xs text-slate-900 mb-3 focus:outline-none focus:border-[#1E3A8A] font-mono"
              />
              <button
                onClick={handleDecryptVaultFile}
                disabled={isDecrypting}
                className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt Payload'}
              </button>
              {decryptError && <p className="text-[11px] text-red-500 mt-2 font-mono">{decryptError}</p>}
            </div>
          ) : isImage ? (
            <img src={decryptedUrl} alt={file.name} className="max-h-full max-w-full object-contain rounded-xl border border-[#E5E7EB] shadow-sm" />
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-1">{file.name}</h3>
              <p className="text-xs font-mono text-slate-500 mb-6">MIME: {file.mimeType} · Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <a
                href={decryptedUrl}
                download={file.name}
                className="inline-flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Artifact
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Metadata & Annotations (Clean White Area) */}
        <div className="w-full md:w-80 bg-white p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="pb-5 border-b border-[#E5E7EB] mb-5">
              <span className="text-[10px] font-mono tracking-widest text-[#1E3A8A] uppercase font-semibold block mb-1">ARTIFACT METADATA</span>
              <h3 className="font-bold text-sm text-slate-900 truncate">{file.name}</h3>
              <div className="mt-4">
                <button
                  onClick={() => onOpenAiChat(file)}
                  className="w-full flex items-center justify-center gap-2 text-xs bg-slate-50 hover:bg-slate-100 text-slate-800 border border-[#E5E7EB] py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                  AI OCR Assistant
                </button>
              </div>
            </div>

            {/* Annotations */}
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-bold">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Annotations ({comments.length})
            </h4>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-mono text-slate-400 italic">No annotations added yet.</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <p className="font-semibold text-[#1E3A8A] text-[11px]">{c.userFullName || 'User'}</p>
                    <p className="text-slate-700 mt-1">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Annotation Form */}
          <form onSubmit={handleAddComment} className="pt-4 border-t border-[#E5E7EB] mt-4">
            <input
              type="text"
              placeholder="Add annotation..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A] mb-2 font-sans"
            />
            <button
              type="submit"
              className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-2xs"
            >
              Post Annotation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { encryptFileClientSide } from '../../utils/webCryptoVault';

export default function UploadModal({ isOpen, onClose, currentFolderId, onUploadSuccess, initialFiles = [] }) {
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileProgressList, setFileProgressList] = useState([]);
  const [error, setError] = useState('');

  // Duplicate prompt state
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    file: null,
    resolveAction: null,
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialFiles && initialFiles.length > 0) {
      handleFilesSelection(initialFiles);
    }
  }, [isOpen, initialFiles]);

  const processSingleFile = async (file, duplicateAction = 'replace') => {
    let fileToUpload = file;
    let ivHex = null;

    if (isEncrypted) {
      const encryptedResult = await encryptFileClientSide(file, passphrase);
      fileToUpload = encryptedResult.encryptedFile;
      ivHex = encryptedResult.ivHex;
    }

    setFileProgressList((prev) =>
      prev.map((item) => (item.name === file.name ? { ...item, status: 'uploading', progress: 50 } : item))
    );

    const uploaded = await fileService.uploadFile(
      fileToUpload,
      currentFolderId,
      isEncrypted,
      ivHex,
      (pct) => {
        setFileProgressList((prev) =>
          prev.map((item) => (item.name === file.name ? { ...item, progress: pct } : item))
        );
      },
      duplicateAction
    );

    setFileProgressList((prev) =>
      prev.map((item) => (item.name === file.name ? { ...item, status: 'completed', progress: 100 } : item))
    );

    return uploaded;
  };

  const handleFilesSelection = async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    setError('');

    if (isEncrypted && !passphrase.trim()) {
      setError('A secret passphrase is required for AES-256 Client Vault Encryption!');
      return;
    }

    setUploading(true);

    const initialList = acceptedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      progress: 10,
      status: 'pending',
      error: null,
    }));
    setFileProgressList(initialList);

    let lastUploaded = null;

    for (const file of acceptedFiles) {
      // Check for duplicate in current folder
      const existing = fileService.checkDuplicate(file.name, currentFolderId);
      let duplicateAction = 'replace';

      if (existing) {
        // Prompt user for Duplicate Choice
        duplicateAction = await new Promise((resolve) => {
          setDuplicateModal({
            isOpen: true,
            file: file,
            resolveAction: resolve,
          });
        });
      }

      if (duplicateAction === 'cancel') {
        setFileProgressList((prev) =>
          prev.map((item) => (item.name === file.name ? { ...item, status: 'cancelled', progress: 0 } : item))
        );
        continue;
      }

      try {
        lastUploaded = await processSingleFile(file, duplicateAction);
      } catch (err) {
        setFileProgressList((prev) =>
          prev.map((item) =>
            item.name === file.name
              ? { ...item, status: 'failed', error: err.message || 'Upload failed' }
              : item
          )
        );
      }
    }

    setTimeout(() => {
      setUploading(false);
      onUploadSuccess(lastUploaded);
      onClose();
    }, 600);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesSelection,
    multiple: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F9F9F7] w-full max-w-lg rounded-2xl border border-slate-200/90 p-7 relative shadow-2xl space-y-5 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#1E3A8A] uppercase font-bold">UPLOADER</span>
          <h2 className="text-2xl font-serif font-normal text-slate-900 tracking-tight">Upload Files</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select one or multiple files from your device to store in CloudVault.</p>
        </div>

        {/* E2EE Option */}
        <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsEncrypted(!isEncrypted)}>
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isEncrypted ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-800">Zero-Knowledge E2EE Encryption</span>
            </div>
            <input
              type="checkbox"
              checked={isEncrypted}
              onChange={(e) => setIsEncrypted(e.target.checked)}
              className="accent-[#1E3A8A] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {isEncrypted && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <input
                type="password"
                placeholder="Enter client vault secret passphrase..."
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A] font-mono"
              />
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                🔒 Files will be encrypted client-side using AES-256-GCM before transmission.
              </p>
            </div>
          )}
        </div>

        {/* Multi-File Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-[#1E3A8A] bg-blue-50/60'
              : 'border-slate-300/80 hover:border-slate-400 bg-white/70 shadow-2xs'
          }`}
        >
          <input {...getInputProps()} multiple />
          <UploadCloud className="w-10 h-10 text-[#1E3A8A] mx-auto mb-2.5 opacity-80" />
          <p className="text-sm font-semibold text-slate-900">
            {isDragActive ? 'Drop files to upload immediately...' : 'Click to browse or drop files here'}
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Supports PDF, DOCX, XLSX, PPTX, Images, Audio, ZIP up to 500MB
          </p>
        </div>

        {/* Per-File Upload Progress Stream */}
        {fileProgressList.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              UPLOADING ({fileProgressList.filter((f) => f.status === 'completed').length}/{fileProgressList.length})
            </span>

            {fileProgressList.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1 text-xs">
                <div className="flex items-center justify-between font-medium text-slate-800">
                  <div className="flex items-center gap-2 truncate max-w-[260px]">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div>
                    {item.status === 'completed' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete ✓
                      </span>
                    ) : item.status === 'failed' ? (
                      <span className="text-red-600 font-bold flex items-center gap-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    ) : item.status === 'cancelled' ? (
                      <span className="text-slate-400 font-mono text-[10px]">Cancelled</span>
                    ) : (
                      <span className="text-[#1E3A8A] font-mono text-[11px] font-bold">{item.progress}%</span>
                    )}
                  </div>
                </div>

                {item.status === 'uploading' && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#1E3A8A] h-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 font-medium p-3 bg-red-50 rounded-lg border border-red-200">{error}</p>
        )}

        {/* Duplicate Choice Modal Dialog */}
        {duplicateModal.isOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 p-6 shadow-2xl text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">File Already Exists</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  A file named <span className="font-bold text-slate-900 font-mono">"{duplicateModal.file?.name}"</span> already exists in this folder location.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    const action = duplicateModal.resolveAction;
                    setDuplicateModal({ isOpen: false, file: null, resolveAction: null });
                    if (action) action('replace');
                  }}
                  className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium py-2 rounded-lg text-xs transition-colors"
                >
                  Replace Existing File
                </button>
                <button
                  onClick={() => {
                    const action = duplicateModal.resolveAction;
                    setDuplicateModal({ isOpen: false, file: null, resolveAction: null });
                    if (action) action('keep_both');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-lg text-xs transition-colors"
                >
                  Keep Both (Rename)
                </button>
                <button
                  onClick={() => {
                    const action = duplicateModal.resolveAction;
                    setDuplicateModal({ isOpen: false, file: null, resolveAction: null });
                    if (action) action('cancel');
                  }}
                  className="w-full text-slate-500 hover:text-slate-800 text-xs py-1 transition-colors"
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

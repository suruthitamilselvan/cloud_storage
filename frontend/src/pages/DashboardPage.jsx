import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Breadcrumbs from '../components/explorer/Breadcrumbs';
import FileGrid from '../components/explorer/FileGrid';
import FileList from '../components/explorer/FileList';
import UploadModal from '../components/upload/UploadModal';
import FilePreviewModal from '../components/preview/FilePreviewModal';
import AiChatDrawer from '../components/ai/AiChatDrawer';
import ShareModal from '../components/sharing/ShareModal';
import AnalyticsPage from './AnalyticsPage';
import ActivityPage from './ActivityPage';
import EncryptionPage from './EncryptionPage';

import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { sharingService } from '../services/sharingService';
import { authService } from '../services/authService';
import { Plus, ArrowRight, FileText, Lock, UploadCloud, FolderPlus } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('drive'); // 'drive', 'shared', 'starred', 'vault', 'analytics', 'trash'
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewingAllRecent, setIsViewingAllRecent] = useState(false);
  const [isViewingAllFolders, setIsViewingAllFolders] = useState(false);
  const [isDraggingWorkspace, setIsDraggingWorkspace] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [user, setUser] = useState(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [selectedFileForAi, setSelectedFileForAi] = useState(null);
  const [selectedFileForShare, setSelectedFileForShare] = useState(null);

  const [droppedFiles, setDroppedFiles] = useState([]);

  const handleDragOverWorkspace = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingWorkspace) setIsDraggingWorkspace(true);
  };

  const handleDragLeaveWorkspace = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDraggingWorkspace(false);
    }
  };

  const handleDropWorkspace = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingWorkspace(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroppedFiles(Array.from(e.dataTransfer.files));
      setIsUploadOpen(true);
    }
  };

  const recentFiles = [];

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadContent();
  }, [activeTab, currentFolderId, searchQuery]);

  const loadUser = async () => {
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
    } catch (e) {
      // ignore
    }
  };

  const loadContent = async () => {
    try {
      if (searchQuery.trim()) {
        const searchResults = await fileService.searchFiles(searchQuery);
        setFiles(searchResults);
        setFolders([]);
        return;
      }

      if (activeTab === 'drive') {
        const allUserFiles = await fileService.getAllFiles();
        setAllFiles(allUserFiles);

        const fldrs = await folderService.getFolders(currentFolderId);
        const fls = await fileService.getFiles(currentFolderId);
        setFolders(fldrs);
        setFiles(fls);

        if (currentFolderId) {
          const bc = await folderService.getBreadcrumbs(currentFolderId);
          setBreadcrumbs(bc);
        } else {
          setBreadcrumbs([]);
        }
      } else if (activeTab === 'shared') {
        const sharedFls = await sharingService.getSharedWithMe();
        setFiles(sharedFls);
        setFolders([]);
        setBreadcrumbs([]);
      } else if (activeTab === 'starred') {
        const starredFls = await fileService.getStarredFiles();
        setFiles(starredFls);
        setFolders([]);
        setBreadcrumbs([]);
      } else if (activeTab === 'vault') {
        const vaultFls = await fileService.getVaultFiles();
        setFiles(vaultFls);
        setFolders([]);
        setBreadcrumbs([]);
      } else if (activeTab === 'trash') {
        const trashedFls = await fileService.getTrashedFiles();
        setFiles(trashedFls);
        setFolders([]);
        setBreadcrumbs([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await folderService.createFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      loadContent();
    } catch (e) {
      // ignore
    }
  };

  const handleStar = async (fileId) => {
    try {
      await fileService.toggleStar(fileId);
      loadContent();
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (fileId) => {
    try {
      if (activeTab === 'trash') {
        await fileService.deletePermanently(fileId);
      } else {
        await fileService.moveToTrash(fileId);
      }
      loadContent();
    } catch (e) {
      // ignore
    }
  };

  const getFolderFileCount = (folderId) => {
    return allFiles.filter(f => f.folderId === folderId && !f.isTrashed).length;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderFileThumbnail = (file) => {
    const name = file.name || '';
    const mime = file.mimeType || '';
    const isPdf = mime.includes('pdf') || /\.pdf$/i.test(name);
    const isImage = !isPdf && (mime.includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name) || (file.previewUrl && (file.previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) || file.previewUrl.startsWith('data:'))));
    const isExcel = mime.includes('excel') || mime.includes('spreadsheet') || /\.(xlsx|xls|csv)$/i.test(name);
    const isDoc = mime.includes('word') || /\.(docx|doc)$/i.test(name);
    const isEncrypted = file.isEncrypted || /\.enc$/i.test(name);

    if (isPdf) {
      return (
        <div className="w-16 h-20 bg-white rounded-md border border-slate-200 shadow-2xs p-2 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
          <div className="flex items-center justify-between border-b border-red-100 pb-1">
            <span className="bg-red-100 text-red-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">PDF</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <div className="space-y-1 my-auto">
            <div className="h-1 bg-slate-800 rounded w-full" />
            <div className="h-0.5 bg-slate-300 rounded w-5/6" />
            <div className="h-0.5 bg-slate-300 rounded w-4/6" />
            <div className="h-0.5 bg-slate-300 rounded w-full" />
          </div>
          <div className="text-[7px] font-mono text-slate-400 truncate">Document</div>
        </div>
      );
    }

    if (isImage) {
      const imgSrc = (file.previewUrl && (file.previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) || file.previewUrl.startsWith('data:'))) ? file.previewUrl : '/header_misty_mountain.jpg';
      return (
        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300 overflow-hidden">
          <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
        </div>
      );
    }

    if (isExcel) {
      return (
        <div className="w-16 h-20 bg-white rounded-md border border-slate-200 shadow-2xs p-1.5 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
          <div className="flex items-center justify-between bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
            <span>XLS</span>
            <span>📊</span>
          </div>
          <div className="grid grid-cols-3 gap-0.5 my-auto bg-slate-100 p-1 rounded border border-slate-200 text-[6px] font-mono text-slate-500 text-center">
            <div className="bg-emerald-100 font-bold text-emerald-800">Q1</div>
            <div className="bg-emerald-100 font-bold text-emerald-800">Q2</div>
            <div className="bg-emerald-100 font-bold text-emerald-800">Q3</div>
            <div className="bg-white">12k</div>
            <div className="bg-white">18k</div>
            <div className="bg-white">24k</div>
            <div className="bg-white">45k</div>
            <div className="bg-white">60k</div>
            <div className="bg-white">82k</div>
          </div>
        </div>
      );
    }

    if (isDoc) {
      return (
        <div className="w-16 h-20 bg-white rounded-md border border-slate-200 shadow-2xs p-2 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
          <div className="flex items-center justify-between border-b border-blue-100 pb-1">
            <span className="bg-blue-100 text-blue-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">DOC</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
          <div className="space-y-1 my-auto">
            <div className="h-1 bg-blue-900 rounded w-full" />
            <div className="h-0.5 bg-slate-300 rounded w-full" />
            <div className="h-0.5 bg-slate-300 rounded w-4/5" />
            <div className="h-0.5 bg-slate-300 rounded w-full" />
          </div>
          <div className="text-[7px] font-mono text-slate-400 truncate">Word Document</div>
        </div>
      );
    }

    if (isEncrypted) {
      return (
        <div className="w-16 h-20 bg-slate-900 text-white rounded-md border border-slate-700 shadow-2xs p-2 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="bg-blue-900 text-blue-200 font-mono text-[8px] font-bold px-1 rounded">AES-256</span>
            <span className="text-[10px]">🔒</span>
          </div>
          <div className="font-mono text-[7px] text-emerald-400 space-y-0.5">
            <p>0x8F9A2B</p>
            <p>ENCRYPTED</p>
          </div>
          <div className="text-[7px] font-mono text-slate-400">Vault File</div>
        </div>
      );
    }

    // Default Document Sheet
    return (
      <div className="w-16 h-20 bg-white rounded-md border border-slate-200 shadow-2xs p-2 flex flex-col justify-between relative group-hover:scale-105 transition-transform">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <span className="bg-slate-100 text-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">FILE</span>
        </div>
        <div className="space-y-1 my-auto">
          <div className="h-1 bg-slate-700 rounded w-full" />
          <div className="h-0.5 bg-slate-300 rounded w-3/4" />
          <div className="h-0.5 bg-slate-300 rounded w-full" />
        </div>
        <div className="text-[7px] font-mono text-slate-400 truncate">{name.split('.').pop()?.toUpperCase() || 'TXT'}</div>
      </div>
    );
  };

  return (
    <div
      onDragOver={handleDragOverWorkspace}
      onDragLeave={handleDragLeaveWorkspace}
      onDrop={handleDropWorkspace}
      className="flex h-screen bg-[#F9F9F7] text-[#111827] overflow-hidden font-sans relative"
    >
      {/* Workspace Full Screen Drag & Drop Overlay */}
      {isDraggingWorkspace && (
        <div className="fixed inset-0 z-50 bg-[#1E3A8A]/15 backdrop-blur-sm border-4 border-dashed border-[#1E3A8A] flex flex-col items-center justify-center pointer-events-none transition-all">
          <div className="bg-white px-10 py-8 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 animate-fadeIn">
            <UploadCloud className="w-14 h-14 text-[#1E3A8A] animate-bounce" />
            <h2 className="font-serif text-3xl font-bold text-slate-900">DROP FILES HERE</h2>
            <p className="text-xs text-slate-500 font-mono">
              Upload directly into {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'My Drive'}
            </p>
          </div>
        </div>
      )}

      {/* Full-Site Vivid Alpine Mountain Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <img
          src="/exact_alpine_background.jpg"
          alt="Full Site Alpine Mountain Background"
          className="w-full h-full object-cover object-center filter blur-[3px] opacity-92 scale-105 transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/25 to-white/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/15" />
      </div>

      {/* Off-White Translucent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentFolderId(null);
        }}
        storageUsed={allFiles.reduce((acc, f) => acc + (Number(f.size) || 0), 0)}
        storageLimit={user?.storageLimit || 16106127360}
        onUploadClick={() => setIsUploadOpen(true)}
        onCreateFolderClick={() => setIsCreateFolderOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
        />

        <main className="flex-1 p-8 overflow-y-auto min-w-0 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Context Breadcrumbs */}
            {activeTab === 'drive' && (
              <Breadcrumbs
                breadcrumbs={breadcrumbs}
                onNavigate={(fId) => setCurrentFolderId(fId)}
                onBreadcrumbClick={(fId) => setCurrentFolderId(fId)}
              />
            )}
            {/* TAB SPECIAL VIEWS */}
            {activeTab === 'vault' ? (
              /* SECURE VAULT VIEW */
              <div className="space-y-8 max-w-3xl mx-auto text-center py-4">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl text-[#111827] font-normal mb-2">Secure Vault</h1>
                  <p className="text-xs text-slate-600">Zero-knowledge client-side E2EE storage for your sensitive files.</p>
                </div>

                <div className="mx-auto w-24 h-24 relative flex items-center justify-center group cursor-pointer">
                  <img
                    src="/secure_lock_icon.jpg"
                    alt="Secure Lock"
                    className="w-24 h-24 object-contain rounded-2xl border border-white/80 bg-white/50 p-1.5 backdrop-blur-md shadow-md group-hover:scale-105 transition-all duration-300"
                  />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-serif text-2xl font-normal text-slate-900">AES-256 Vault Encryption</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">Files uploaded to Secure Vault are encrypted client-side before transmission.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                  <div className="bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/80 shadow-2xs flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">STATUS:</span>
                    <span className="text-xs font-bold text-slate-900 font-mono">ACTIVE</span>
                  </div>
                  <div className="bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/80 shadow-2xs flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">PROTECTED:</span>
                    <span className="text-xs font-bold text-slate-900 font-mono">{files.length} Files</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium px-8 py-3 rounded-full text-xs transition-colors shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Upload to Secure Vault
                  </button>
                </div>
              </div>
            ) : activeTab === 'trash' ? (
              /* TRASH VIEW */
              <div className="space-y-6">
                <div>
                  <h1 className="font-serif text-4xl text-[#111827] font-normal mb-1">Trash</h1>
                  <p className="text-xs text-slate-500">Recently removed. Files remain recoverable before permanent deletion.</p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-[#E5E7EB]">
                        <th className="py-3 px-4 font-bold">NAME</th>
                        <th className="py-3 px-4 font-bold">DELETED ON</th>
                        <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] text-slate-700">
                      {files.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-8 text-center text-slate-400">Trash is empty.</td>
                        </tr>
                      ) : (
                        files.map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-slate-400" />
                              {file.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">Recent</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleStar(file.id)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() => handleDelete(file.id)}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium transition-colors"
                                >
                                  Delete Permanently
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              <AnalyticsPage />
            ) : activeTab === 'activity' ? (
              <ActivityPage />
            ) : activeTab === 'encryption' ? (
              <EncryptionPage />
            ) : (
              /* MY DRIVE, SHARED, OR STARRED VIEWS */
              <>
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-6 gap-6 relative">
                  <div>
                    <h1 className="font-serif text-4xl md:text-5xl text-[#111827] font-normal tracking-tight mb-2">
                      {activeTab === 'shared'
                        ? 'Shared with Me'
                        : activeTab === 'starred'
                        ? 'Starred Files'
                        : breadcrumbs.length > 0
                        ? breadcrumbs[breadcrumbs.length - 1].name
                        : 'My Drive'}
                    </h1>
                    <p className="text-xs text-slate-600 mt-1 font-normal">
                      {activeTab === 'shared'
                        ? 'Files and documents shared with you by team members.'
                        : activeTab === 'starred'
                        ? 'Your bookmarked and starred documents for instant access.'
                        : 'Your digital archive.'}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {files.length} {files.length === 1 ? 'file' : 'files'} · {folders.length} {folders.length === 1 ? 'folder' : 'folders'} · {formatSize(allFiles.reduce((acc, f) => acc + (Number(f.size) || 0), 0))} used
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-5">
                      <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-2xs flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Folder
                      </button>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* Top Right Editorial Quote Block */}
                  <div className="hidden md:flex items-center justify-end relative z-10 pl-6">
                    <div className="text-right max-w-xs">
                      <p className="font-serif italic text-base md:text-lg text-slate-900 leading-snug">
                        A more organized<br />tomorrow, starts today.
                      </p>
                      <div className="w-36 border-b border-[#D1D5DB] my-2.5 ml-auto" />
                      <div className="flex items-center justify-end gap-1.5 text-[9px] font-mono text-slate-500 tracking-widest uppercase font-semibold">
                        <span>STORE</span>
                        <span>·</span>
                        <span>EXPLORE</span>
                        <span>·</span>
                        <span>CREATE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMPTY FOLDER OR CONTENT VIEW */}
                {activeTab === 'drive' && files.length === 0 && folders.length === 0 ? (
                  /* Requirement 12: Empty Folder State */
                  <div className="py-16 text-center bg-white/70 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 p-8 max-w-md mx-auto my-8 shadow-2xs">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto mb-3 border border-blue-100">
                      <FolderPlus className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl font-normal text-slate-900 mb-1 tracking-tight">
                      {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name.toUpperCase() : 'MY DRIVE'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      This folder is empty.<br />Upload files or create a subfolder to get started.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        Upload Files
                      </button>
                      <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium px-4 py-2 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        New Folder
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* RECENT STRIP */}
                    {activeTab === 'drive' && !currentFolderId && allFiles.length > 0 && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#111827]">Recent</h2>
                          <button
                            onClick={() => setIsViewingAllRecent((prev) => !prev)}
                            className="text-xs text-[#1E3A8A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                          >
                            {isViewingAllRecent ? 'Show less ↑' : 'View all →'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {(isViewingAllRecent ? allFiles : allFiles.slice(0, 5)).map((rf) => (
                            <div
                              key={rf.id}
                              onClick={() => setSelectedFileForPreview(rf)}
                              className="bg-white/80 backdrop-blur-md border border-white/70 hover:border-slate-300 p-3 rounded-xl cursor-pointer group transition-all shadow-2xs hover:shadow-sm"
                            >
                              <div className="w-full h-24 bg-[#F4F4F1] rounded-lg border border-slate-200/80 flex items-center justify-center overflow-hidden mb-2.5">
                                {renderFileThumbnail(rf)}
                              </div>
                              <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#1E3A8A] transition-colors" title={rf.name}>
                                {rf.name}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {rf.type || 'FILE'} · {formatSize(rf.size)} · {rf.timeAgo || 'Recent'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FOLDERS GRID SECTION */}
                    {activeTab === 'drive' && folders.length > 0 && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#111827]">Folders</h2>
                          <button
                            onClick={() => setIsViewingAllFolders((prev) => !prev)}
                            className="text-xs text-[#1E3A8A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                          >
                            {isViewingAllFolders ? 'Show less ↑' : 'View all →'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {(isViewingAllFolders ? folders : folders.slice(0, 4)).map((folder, idx) => {
                            const fileCount = getFolderFileCount(folder.id);
                            return (
                              <div
                                key={folder.id}
                                onClick={() => setCurrentFolderId(folder.id)}
                                className="bg-white/80 backdrop-blur-md border border-white/70 hover:border-slate-300 p-4 rounded-xl cursor-pointer group transition-all shadow-2xs"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-xs font-mono text-slate-400 font-bold">0{idx + 1}</span>
                                  <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] text-xs">
                                    📁
                                  </div>
                                </div>
                                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-[#1E3A8A] transition-colors truncate" title={folder.name}>
                                  {folder.name}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-400 mt-1">
                                  {fileCount} {fileCount === 1 ? 'file' : 'files'}
                                </p>
                              </div>
                            );
                          })}

                          {/* New Folder Action Card */}
                          <div
                            onClick={() => setIsCreateFolderOpen(true)}
                            className="bg-slate-50/60 border border-dashed border-slate-300 hover:border-[#1E3A8A] p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
                          >
                            <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#1E3A8A] mb-1" />
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#1E3A8A]">New Folder</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ARCHIVE CATALOG FILE EXPLORER */}
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {activeTab === 'shared' ? 'Shared Files' : activeTab === 'starred' ? 'Starred Documents' : 'Archive Catalog'}
                        </h3>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-400">{files.length} items</span>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              onClick={() => setViewMode('list')}
                              className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
                            >
                              ≡ List
                            </button>
                            <button
                              onClick={() => setViewMode('grid')}
                              className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
                            >
                              :: Grid
                            </button>
                          </div>
                        </div>
                      </div>

                      {viewMode === 'grid' ? (
                        <FileGrid
                          folders={folders}
                          files={files}
                          onFolderClick={(fId) => setCurrentFolderId(fId)}
                          onFileClick={(file) => setSelectedFileForPreview(file)}
                          onStar={handleStar}
                          onShare={(file) => setSelectedFileForShare(file)}
                          onDelete={handleDelete}
                          onAiChat={(file) => setSelectedFileForAi(file)}
                        />
                      ) : (
                        <FileList
                          folders={folders}
                          files={files}
                          onFolderClick={(fId) => setCurrentFolderId(fId)}
                          onFileClick={(file) => setSelectedFileForPreview(file)}
                          onStar={handleStar}
                          onShare={(file) => setSelectedFileForShare(file)}
                          onDelete={handleDelete}
                          onAiChat={(file) => setSelectedFileForAi(file)}
                        />
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setDroppedFiles([]);
        }}
        currentFolderId={currentFolderId}
        initialFiles={droppedFiles}
        onUploadSuccess={async () => {
          loadContent();
          loadUser();
        }}
      />

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F9F7] w-full max-w-sm rounded-xl p-6 border border-slate-200/90 shadow-2xl space-y-4 text-slate-900">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">CREATE NEW FOLDER</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Folder name</label>
                <input
                  type="text"
                  placeholder="e.g. Projects, Research, Invoices..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1E3A8A] font-medium shadow-2xs"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FilePreviewModal
        file={selectedFileForPreview}
        isOpen={!!selectedFileForPreview}
        onClose={() => setSelectedFileForPreview(null)}
        onOpenAiChat={(file) => {
          setSelectedFileForPreview(null);
          setSelectedFileForAi(file);
        }}
      />

      <AiChatDrawer
        file={selectedFileForAi}
        isOpen={!!selectedFileForAi}
        onClose={() => setSelectedFileForAi(null)}
      />

      <ShareModal
        item={selectedFileForShare}
        isOpen={!!selectedFileForShare}
        onClose={() => setSelectedFileForShare(null)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, RefreshCw } from 'lucide-react';
import { aiService } from '../../services/aiService';

export default function AiChatDrawer({ file, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  useEffect(() => {
    if (file && isOpen) {
      setMessages([]);
      loadSummary();
    }
  }, [file, isOpen]);

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await aiService.summarizeFile(file.id);
      // Remove any robot emojis from summary
      const cleanSummary = summary.replace(/🤖/g, '').trim();
      setMessages([{ sender: 'ai', text: cleanSummary }]);
    } catch (e) {
      setMessages([{ sender: 'ai', text: "AI OCR Assistant ready. Query text context for " + file.name }]);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loadingAnswer) return;

    const q = inputQuestion;
    setInputQuestion('');
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setLoadingAnswer(true);

    try {
      const ans = await aiService.chatWithDocument(file.id, q);
      const cleanAns = ans.replace(/🤖/g, '').trim();
      setMessages((prev) => [...prev, { sender: 'ai', text: cleanAns }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: "Error querying document context." }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col justify-between select-none">
      {/* Header */}
      <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50/50">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#1E3A8A] uppercase font-semibold">INTELLIGENCE</span>
          <h3 className="font-bold text-sm text-slate-900 leading-none mt-0.5">Document OCR Assistant</h3>
          <p className="text-xs text-slate-500 truncate max-w-[200px] mt-1 font-mono">{file.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs bg-[#FAFAFA]">
        {loadingSummary && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 py-4 justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1E3A8A]" />
            Analyzing document text payload...
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-[#1E3A8A] text-white font-medium'
                  : 'bg-white border border-[#E5E7EB] text-slate-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loadingAnswer && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#1E3A8A]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Querying document context...
          </div>
        )}
      </div>

      {/* Form Input */}
      <form onSubmit={handleSendQuestion} className="p-4 border-t border-[#E5E7EB] bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question about this document..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          className="flex-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A] font-sans"
        />
        <button
          type="submit"
          disabled={loadingAnswer}
          className="bg-[#1E3A8A] hover:bg-[#172554] text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

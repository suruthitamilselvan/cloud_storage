import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ breadcrumbs = [], onNavigate, onBreadcrumbClick }) {
  const handleClick = (id) => {
    if (onNavigate) onNavigate(id);
    if (onBreadcrumbClick) onBreadcrumbClick(id);
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 select-none">
      <button
        onClick={() => handleClick(null)}
        className="flex items-center gap-1 hover:text-[#1E3A8A] transition-colors font-medium text-slate-600 bg-white/60 px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs cursor-pointer"
      >
        <Home className="w-3.5 h-3.5 text-[#1E3A8A]" />
        Home
      </button>
      <ChevronRight className="w-3 h-3 text-slate-400" />
      <button
        onClick={() => handleClick(null)}
        className="font-semibold text-slate-800 hover:text-[#1E3A8A] transition-colors cursor-pointer"
      >
        My Drive
      </button>

      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <button
            onClick={() => handleClick(crumb.id)}
            className="hover:text-[#1E3A8A] transition-colors font-bold text-slate-900 truncate max-w-[160px] cursor-pointer bg-white/70 px-2 py-0.5 rounded border border-slate-200/60"
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

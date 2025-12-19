import React from 'react';
import { Download, FileJson, FileText, Printer, FileCode, MessageSquare } from 'lucide-react';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onExportMarkdown: () => void;
  onExportHTML: () => void;
  onExportPDF: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onTitleChange, 
  onExportMarkdown, 
  onExportHTML, 
  onExportPDF 
}) => {
  return (
    <header className="relative h-14 bg-brand-black border-b border-brand-red/30 text-white flex items-center justify-between px-4 shadow-md z-50">
      <div className="flex items-center flex-1 min-w-0 mr-4">
        <div className="flex items-center mr-6 hidden md:flex select-none">
            <span className="font-mono text-xl font-bold tracking-tight">
                <span className="text-white">Math</span>
                <span className="text-brand-gold">Mark</span>
                <span className="text-brand-red ml-0.5">2PDF</span>
            </span>
        </div>
        <input 
          type="text" 
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-zinc-800 focus:bg-zinc-800 hover:bg-zinc-700 text-gray-100 placeholder-gray-500 px-3 py-1.5 rounded-md outline-none border border-zinc-700 focus:border-brand-gold transition-all w-full max-w-sm text-sm font-medium"
          placeholder="Document Name"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-800/80 border border-zinc-700 rounded-md p-1 gap-1">
            <span className="text-xs font-bold text-brand-gold/80 px-2 hidden lg:block uppercase tracking-wider">Save</span>
            
            <button 
                type="button"
                onClick={onExportMarkdown}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded hover:bg-brand-gold hover:text-black active:bg-yellow-500 transition-colors shadow-sm"
                title="Save as Markdown (.md)"
            >
                <FileText size={14} />
                <span className="hidden sm:inline">Markdown</span>
            </button>
            
            <button 
                type="button"
                onClick={onExportHTML}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded hover:bg-brand-gold hover:text-black active:bg-yellow-500 transition-colors shadow-sm"
                title="Save as HTML (.html)"
            >
                <FileCode size={14} />
                <span className="hidden sm:inline">HTML</span>
            </button>
            
            <button 
                type="button"
                onClick={onExportPDF}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-red text-white rounded hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
                title="Print / Save as PDF"
            >
                <Printer size={14} />
                <span className="hidden sm:inline">PDF</span>
            </button>
        </div>

        <a 
            href="#"
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-gold bg-transparent border border-brand-gold/50 rounded-md hover:bg-brand-gold/10 focus:outline-none transition-all shadow-sm ml-2"
            onClick={(e) => { e.preventDefault(); alert('Feedback feature coming soon!'); }}
        >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Feedback</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
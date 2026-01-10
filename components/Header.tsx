import React, { useState } from 'react';
import { FileText, Printer, FileCode, MessageSquare, FileType, CheckCircle, Clock, Settings, X } from 'lucide-react';
import { PDFSettings } from '../types';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onExportMarkdown: () => void;
  onExportHTML: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  pdfSettings: PDFSettings;
  onPdfSettingsChange: (settings: PDFSettings) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onTitleChange, 
  onExportMarkdown, 
  onExportHTML, 
  onExportPDF,
  onExportDOCX,
  saveStatus,
  pdfSettings,
  onPdfSettingsChange
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        <div className="flex flex-col">
            <input 
            type="text" 
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-zinc-800 focus:bg-zinc-800 hover:bg-zinc-700 text-gray-100 placeholder-gray-500 px-3 py-1.5 rounded-md outline-none border border-zinc-700 focus:border-brand-gold transition-all w-full max-w-sm text-sm font-medium"
            placeholder="Document Name"
            />
        </div>
        <div className="ml-3 flex items-center text-xs text-zinc-400 select-none w-24">
            {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-green-500 animate-in fade-in duration-500">
                    <CheckCircle size={12} /> Saved
                </span>
            )}
            {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-brand-gold animate-pulse">
                    <Clock size={12} /> Saving...
                </span>
            )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-800/80 border border-zinc-700 rounded-md p-1 gap-1">
            <span className="text-xs font-bold text-brand-gold/80 px-2 hidden lg:block uppercase tracking-wider">Export</span>
            
            <button 
                type="button"
                onClick={onExportMarkdown}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded hover:bg-brand-gold hover:text-black active:bg-yellow-500 transition-colors shadow-sm"
                title="Save as Markdown (.md)"
            >
                <FileText size={14} />
                <span className="hidden sm:inline">MD</span>
            </button>

            <button 
                type="button"
                onClick={onExportDOCX}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded hover:bg-brand-gold hover:text-black active:bg-yellow-500 transition-colors shadow-sm"
                title="Save as Word (.docx)"
            >
                <FileType size={14} />
                <span className="hidden sm:inline">DOCX</span>
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
                title="Export as PDF"
            >
                <Printer size={14} />
                <span className="hidden sm:inline">PDF</span>
            </button>
        </div>

        {/* Settings Toggle */}
        <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="cursor-pointer flex items-center justify-center p-2 text-sm font-medium text-gray-400 hover:text-brand-gold bg-transparent rounded-md hover:bg-zinc-800 transition-all ml-1 relative"
            title="Export Settings"
        >
            <Settings size={18} />
        </button>

        {/* Settings Modal */}
        {isSettingsOpen && (
            <>
                <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsSettingsOpen(false)} />
                <div className="absolute top-14 right-4 w-72 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-100 text-gray-800 dark:text-gray-100">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-zinc-700">
                        <h3 className="font-bold text-sm">Export Preferences</h3>
                        <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Default Filename</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => onTitleChange(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-brand-gold outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PDF Orientation</label>
                            <select
                                value={pdfSettings.orientation}
                                onChange={(e) => onPdfSettingsChange({...pdfSettings, orientation: e.target.value as 'portrait' | 'landscape'})}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-brand-gold outline-none"
                            >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PDF Margins (mm)</label>
                            <input 
                                type="number" 
                                value={pdfSettings.margins}
                                onChange={(e) => onPdfSettingsChange({...pdfSettings, margins: parseInt(e.target.value) || 0})}
                                min="0"
                                max="100"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-brand-gold outline-none"
                            />
                        </div>
                    </div>
                </div>
            </>
        )}
      </div>
    </header>
  );
};

export default Header;
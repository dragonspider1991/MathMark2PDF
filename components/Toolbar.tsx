import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, Quote, Code, Terminal, 
  List, ListOrdered, CheckSquare, Table, Minus, Sigma,
  Eye, Columns, PenLine, Undo2, Redo2, Bookmark, Plus, Trash2, X,
  FileText, Scaling, LayoutTemplate, Type, Maximize, Minimize,
  Moon, Sun, SpellCheck, ZoomIn, ZoomOut, RotateCcw, Languages
} from 'lucide-react';
import { InsertType, ViewMode, Preset, PageSize, Template, FontSize, PDFSettings } from '../types';

interface ToolbarProps {
  onInsert: (type: InsertType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (content: string) => void;
  onDeletePreset: (id: string) => void;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  template: Template;
  onTemplateChange: (template: Template) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  spellCheck: boolean;
  onToggleSpellCheck: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  pdfSettings: PDFSettings;
  onFontChange: (type: 'text' | 'math' | 'both', font: string) => void;
}

const TEXT_FONTS = ['Noto Sans', 'Inter', 'Noto Serif', 'Playfair Display', 'Montserrat', 'Arial', 'Times New Roman'];
const MATH_FONTS = ['Noto Sans Math', 'STIX Two Math', 'KaTeX_Main', 'Roboto Mono', 'Noto Serif'];

const Toolbar: React.FC<ToolbarProps> = ({ 
  onInsert, viewMode, onViewModeChange, onUndo, onRedo, canUndo, canRedo, presets, onSavePreset, onLoadPreset, onDeletePreset,
  pageSize, onPageSizeChange, template, onTemplateChange, fontSize, onFontSizeChange, theme, onToggleTheme, spellCheck,
  onToggleSpellCheck, zoomLevel, onZoomChange, pdfSettings, onFontChange
}) => {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const presetMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetMenuRef.current && !presetMenuRef.current.contains(event.target as Node)) setIsPresetMenuOpen(false);
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) setIsFontMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  const Button = ({ type, icon: Icon, tooltip }: { type: InsertType; icon: React.ElementType; tooltip: string }) => (
    <button onClick={() => onInsert(type)} className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red rounded-lg transition-all active:scale-95" title={tooltip}>
      <Icon size={22} strokeWidth={2} />
    </button>
  );

  const Divider = () => <div className="w-px h-8 bg-gray-200 dark:bg-zinc-700 mx-2 self-center" />;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print select-none shadow-sm relative z-20 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
      <div className="flex items-center gap-1 min-w-max">
        <div className="flex gap-1 mr-1">
          <button onClick={onUndo} disabled={!canUndo} className={`p-2.5 rounded-lg transition-all ${!canUndo ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red active:scale-95'}`} title="Undo (Ctrl+Z)">
            <Undo2 size={24} strokeWidth={2.5} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-2.5 rounded-lg transition-all ${!canRedo ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red active:scale-95'}`} title="Redo (Ctrl+Y)">
            <Redo2 size={24} strokeWidth={2.5} />
          </button>
        </div>
        <Divider />
        <Button type="bold" icon={Bold} tooltip="Bold (Ctrl+B)" />
        <Button type="italic" icon={Italic} tooltip="Italic (Ctrl+I)" />
        <Button type="strike" icon={Strikethrough} tooltip="Strikethrough (Ctrl+D)" />
        <Divider />
        <Button type="h1" icon={Heading1} tooltip="Heading 1" />
        <Button type="h2" icon={Heading2} tooltip="Heading 2" />
        <Button type="h3" icon={Heading3} tooltip="Heading 3" />
        <Divider />
        <Button type="ul" icon={List} tooltip="Unordered List" />
        <Button type="ol" icon={ListOrdered} tooltip="Ordered List" />
        <Button type="check" icon={CheckSquare} tooltip="Task List" />
        <Divider />
        <Button type="link" icon={LinkIcon} tooltip="Link (Ctrl+K)" />
        <Button type="image" icon={ImageIcon} tooltip="Image" />
        <Button type="quote" icon={Quote} tooltip="Blockquote" />
        <Button type="table" icon={Table} tooltip="Table" />
        <Divider />
        <Button type="code" icon={Code} tooltip="Inline Code" />
        <Button type="code-block" icon={Terminal} tooltip="Code Block" />
        <Button type="math" icon={Sigma} tooltip="Math Equation" />
        <Divider />
        
        {/* Typography Menu */}
        <div className="relative" ref={fontMenuRef}>
          <button onClick={() => setIsFontMenuOpen(!isFontMenuOpen)} className={`flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors ${isFontMenuOpen ? 'bg-brand-red/10 text-brand-red' : ''}`} title="Typography Settings">
            <Languages size={18} />
            <span className="hidden xl:inline">Typography</span>
          </button>
          {isFontMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Document Font</label>
                    <div className="space-y-1">
                        {TEXT_FONTS.map(f => (
                            <button key={f} onClick={() => onFontChange('text', f)} className={`block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 ${pdfSettings.textFont === f ? 'text-brand-red font-bold' : 'text-gray-700 dark:text-gray-300'}`} style={{ fontFamily: `"${f}", sans-serif` }}>{f}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Math Font</label>
                    <div className="space-y-1">
                        {MATH_FONTS.map(f => (
                            <button key={f} onClick={() => onFontChange('math', f)} className={`block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 ${pdfSettings.mathFont === f ? 'text-brand-red font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{f}</button>
                        ))}
                    </div>
                </div>
            </div>
          )}
        </div>

        <Divider />

        <div className="flex items-center gap-2">
            <div className="relative group">
                <button className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors" title="PDF Template">
                    <LayoutTemplate size={18} />
                    <span className="hidden xl:inline">{template}</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 py-1 hidden group-hover:block z-50">
                    {['Standard', 'Academic', 'Business', 'Typewriter', 'Modern', 'Elegant'].map((tmpl) => (
                        <button key={tmpl} onClick={() => onTemplateChange(tmpl as Template)} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 ${template === tmpl ? 'text-brand-red font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{tmpl}</button>
                    ))}
                </div>
            </div>
            <button onClick={onToggleSpellCheck} className={`p-2 rounded-lg transition-all ${spellCheck ? 'text-brand-red bg-brand-red/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`} title={spellCheck ? "Disable Spellcheck" : "Enable Spellcheck"}>
                <SpellCheck size={20} />
            </button>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700">
            <button onClick={() => onZoomChange(Math.max(50, zoomLevel - 10))} className="p-1.5 text-gray-500 hover:text-brand-red rounded" title="Zoom Out"><ZoomOut size={16}/></button>
            <span className="text-xs font-mono w-10 text-center text-gray-600 dark:text-gray-300 select-none">{zoomLevel}%</span>
            <button onClick={() => onZoomChange(Math.min(200, zoomLevel + 10))} className="p-1.5 text-gray-500 hover:text-brand-red rounded" title="Zoom In"><ZoomIn size={16}/></button>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700">
            <button onClick={() => onViewModeChange('editor')} className={`p-2 rounded transition-all ${viewMode === 'editor' ? 'bg-white dark:bg-zinc-600 text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`} title="Editor Only"><PenLine size={20} /></button>
            <button onClick={() => onViewModeChange('split')} className={`p-2 rounded transition-all ${viewMode === 'split' ? 'bg-white dark:bg-zinc-600 text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`} title="Split View"><Columns size={20} /></button>
            <button onClick={() => onViewModeChange('preview')} className={`p-2 rounded transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-600 text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`} title="Preview Only"><Eye size={20} /></button>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-3">
        <button onClick={onToggleTheme} className="p-2.5 text-gray-500 hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all" title={theme === 'dark' ? "Light Mode" : "Dark Mode"}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={toggleFullscreen} className="p-2.5 text-gray-500 hover:text-brand-red hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all" title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
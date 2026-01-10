import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, Quote, Code, Terminal, 
  List, ListOrdered, CheckSquare, Table, Minus, Sigma,
  Eye, Columns, PenLine, Undo2, Redo2, Bookmark, Plus, Trash2, X,
  FileText, Scaling, LayoutTemplate, Type, Maximize, Minimize,
  Moon, Sun, SpellCheck, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { InsertType, ViewMode, Preset, PageSize, Template, FontSize } from '../types';

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
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onInsert, 
  viewMode, 
  onViewModeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  pageSize,
  onPageSizeChange,
  template,
  onTemplateChange,
  fontSize,
  onFontSizeChange,
  theme,
  onToggleTheme,
  spellCheck,
  onToggleSpellCheck,
  zoomLevel,
  onZoomChange
}) => {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const presetMenuRef = useRef<HTMLDivElement>(null);

  // Close preset menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetMenuRef.current && !presetMenuRef.current.contains(event.target as Node)) {
        setIsPresetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPresetName.trim()) {
      onSavePreset(newPresetName);
      setNewPresetName('');
    }
  };

  const Button = ({ 
    type, 
    icon: Icon, 
    tooltip 
  }: { 
    type: InsertType; 
    icon: React.ElementType; 
    tooltip: string 
  }) => (
    <button
      onClick={() => onInsert(type)}
      className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red rounded-lg transition-all active:scale-95"
      title={tooltip}
    >
      <Icon size={22} strokeWidth={2} />
    </button>
  );

  const Divider = () => <div className="w-px h-8 bg-gray-200 dark:bg-zinc-700 mx-2 self-center" />;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print select-none shadow-sm relative z-20 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
      <div className="flex items-center gap-1 min-w-max">
        {/* Undo / Redo Group */}
        <div className="flex gap-1 mr-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2.5 rounded-lg transition-all ${
              !canUndo 
                ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red active:scale-95'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={24} strokeWidth={2.5} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2.5 rounded-lg transition-all ${
              !canRedo 
                ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red active:scale-95'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={24} strokeWidth={2.5} />
          </button>
        </div>

        <Divider />

        {/* Text Style Group */}
        <Button type="bold" icon={Bold} tooltip="Bold (Ctrl+B)" />
        <Button type="italic" icon={Italic} tooltip="Italic (Ctrl+I)" />
        <Button type="strike" icon={Strikethrough} tooltip="Strikethrough (Ctrl+D)" />
        
        <Divider />
        
        {/* Headings Group */}
        <Button type="h1" icon={Heading1} tooltip="Heading 1" />
        <Button type="h2" icon={Heading2} tooltip="Heading 2" />
        <Button type="h3" icon={Heading3} tooltip="Heading 3" />
        
        <Divider />

        {/* Lists Group */}
        <Button type="ul" icon={List} tooltip="Unordered List" />
        <Button type="ol" icon={ListOrdered} tooltip="Ordered List" />
        <Button type="check" icon={CheckSquare} tooltip="Task List" />
        
        <Divider />

        {/* Insert Group */}
        <Button type="link" icon={LinkIcon} tooltip="Link (Ctrl+K)" />
        <Button type="image" icon={ImageIcon} tooltip="Image" />
        <Button type="quote" icon={Quote} tooltip="Blockquote" />
        <Button type="table" icon={Table} tooltip="Table" />
        
        <Divider />

        {/* Code & Math Group */}
        <Button type="code" icon={Code} tooltip="Inline Code" />
        <Button type="code-block" icon={Terminal} tooltip="Code Block" />
        <Button type="math" icon={Sigma} tooltip="Math Equation" />
        <Button type="line" icon={Minus} tooltip="Horizontal Rule" />

        <Divider />

        {/* Page & Template Options */}
        <div className="flex items-center gap-2">
            {/* Page Size */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors" title="Page Size">
                    <FileText size={18} />
                    <span className="hidden xl:inline">{pageSize}</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 py-1 hidden group-hover:block z-50">
                    {['A4', 'Letter', 'Legal'].map((size) => (
                        <button 
                            key={size}
                            onClick={() => onPageSizeChange(size as PageSize)} 
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 ${pageSize === size ? 'text-brand-red font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Selector */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors" title="PDF Template">
                    <LayoutTemplate size={18} />
                    <span className="hidden xl:inline">{template}</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 py-1 hidden group-hover:block z-50">
                    {['Standard', 'Academic', 'Business', 'Typewriter'].map((tmpl) => (
                        <button 
                            key={tmpl}
                            onClick={() => onTemplateChange(tmpl as Template)} 
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 ${template === tmpl ? 'text-brand-red font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {tmpl}
                        </button>
                    ))}
                </div>
            </div>

             {/* Font Size Selector */}
             <div className="relative group">
                <button className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors" title="Editor Font Size">
                    <Type size={18} />
                    <span className="hidden xl:inline">{fontSize}</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 py-1 hidden group-hover:block z-50">
                    {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                        <button 
                            key={size}
                            onClick={() => onFontSizeChange(size as FontSize)} 
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 ${fontSize === size ? 'text-brand-red font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <button 
              onClick={onToggleSpellCheck}
              className={`p-2 rounded-lg transition-all ${spellCheck ? 'text-brand-red bg-brand-red/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`} 
              title={spellCheck ? "Disable Spellcheck" : "Enable Spellcheck"}
            >
                <SpellCheck size={20} />
            </button>
        </div>

        <Divider />

        {/* Presets Menu */}
        <div className="relative" ref={presetMenuRef}>
          <button
            onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
            className={`p-2.5 rounded-lg transition-all flex items-center gap-1 ${
              isPresetMenuOpen 
                ? 'bg-brand-red/10 text-brand-red' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-brand-red'
            }`}
            title="Formatting Presets & Snippets"
          >
            <Bookmark size={22} strokeWidth={2} />
          </button>

          {isPresetMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-gray-200 dark:border-zinc-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    <Bookmark size={16} className="text-brand-red" />
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Saved Presets</h3>
                </div>
                <button onClick={() => setIsPresetMenuOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-700">
                  <X size={14} />
                </button>
              </div>

              {/* Create New Preset */}
              <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Save Selection</label>
                  <form onSubmit={handleCreatePreset} className="flex gap-2">
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Name..."
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newPresetName.trim()}
                      className="p-1.5 bg-brand-gold text-brand-black rounded-md hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      title="Save current selection as preset"
                    >
                      <Plus size={18} />
                    </button>
                  </form>
              </div>

              {/* Presets List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {presets.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">No presets yet.</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Select text in editor and save it here.</p>
                  </div>
                ) : (
                  presets.map(preset => (
                    <div key={preset.id} className="group flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-md border border-gray-100 dark:border-zinc-700 hover:border-gray-200 dark:hover:border-zinc-600 transition-all bg-white dark:bg-zinc-900 shadow-sm">
                      <button
                        onClick={() => {
                          onLoadPreset(preset.content);
                          setIsPresetMenuOpen(false);
                        }}
                        className="flex-1 text-left text-sm text-gray-700 dark:text-gray-200 hover:text-brand-red font-medium truncate"
                        title="Click to insert"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Delete this preset?')) onDeletePreset(preset.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete preset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Zoom Controls */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700">
            <button onClick={() => onZoomChange(Math.max(50, zoomLevel - 10))} className="p-1.5 text-gray-500 hover:text-brand-red rounded" title="Zoom Out"><ZoomOut size={16}/></button>
            <span className="text-xs font-mono w-10 text-center text-gray-600 dark:text-gray-300 select-none">{zoomLevel}%</span>
            <button onClick={() => onZoomChange(Math.min(200, zoomLevel + 10))} className="p-1.5 text-gray-500 hover:text-brand-red rounded" title="Zoom In"><ZoomIn size={16}/></button>
            <button onClick={() => onZoomChange(100)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded ml-1" title="Reset Zoom"><RotateCcw size={14}/></button>
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700">
            <button
            onClick={() => onViewModeChange('editor')}
            className={`p-2 rounded transition-all ${viewMode === 'editor' ? 'bg-white dark:bg-zinc-600 text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            title="Editor Only"
            >
            <PenLine size={20} />
            </button>
            <button
            onClick={() => onViewModeChange('split')}
            className={`p-2 rounded transition-all ${viewMode === 'split' ? 'bg-white dark:bg-zinc-600 text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            title="Split View"
            >
            <Columns size={20} />
            </button>
            <button
            onClick={() => onViewModeChange('preview')}
            className={`p-2 rounded transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-600 text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            title="Preview Only"
            >
            <Eye size={20} />
            </button>
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="ml-3 p-2.5 text-gray-500 hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Fullscreen Toggle */}
      <button 
        onClick={toggleFullscreen}
        className="ml-1 p-2.5 text-gray-500 hover:text-brand-red hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
};

export default Toolbar;
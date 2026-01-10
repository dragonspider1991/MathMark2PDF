import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import { ViewMode, DocumentState, InsertType, Preset, PageSize, Template, FontSize, PDFSettings } from './types';
import { insertMarkdown, defaultMarkdown } from './lib/markdown-utils';
import { ArrowLeftRight, MousePointerClick } from 'lucide-react';

declare const html2pdf: any;
declare const htmlDocx: any;
declare const saveAs: any;

// Default presets to populate if storage is empty
const DEFAULT_PRESETS: Preset[] = [
  { 
    id: 'default-1', 
    name: 'Info Callout', 
    content: '> ℹ️ **Info:** ' 
  },
  { 
    id: 'default-2', 
    name: 'Math Block', 
    content: '\n$$\n f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2\\pi i \\xi x} \\,d\\xi \n$$\n' 
  },
  { 
    id: 'default-3', 
    name: 'Checklist', 
    content: '- [ ] To Do\n- [ ] In Progress\n- [ ] Done' 
  },
  {
    id: 'default-4',
    name: 'Signature',
    content: '\n---\n*Generated with **MathMark2PDF***'
  }
];

// Map fontSize names to Tailwind classes
const fontSizeMap: Record<FontSize, string> = {
  'Small': 'text-xs',
  'Medium': 'text-sm',
  'Large': 'text-base',
  'Extra Large': 'text-lg'
};

// Line heights in pixels (approximate for leading-relaxed)
const lineHeightMap: Record<FontSize, number> = {
    'Small': 20, // 12px * 1.625 ≈ 19.5
    'Medium': 24, // 14px * 1.625 ≈ 22.75
    'Large': 28, // 16px * 1.625 = 26
    'Extra Large': 32 // 18px * 1.625 ≈ 29.25
};

// Custom Rehype plugin to inject line numbers
const rehypeInjectLineNumber = () => {
    return (tree: any) => {
        const visit = (node: any) => {
            if (node.type === 'element' && node.position && node.position.start) {
                node.properties = node.properties || {};
                node.properties['data-line'] = node.position.start.line;
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(visit);
            }
        };
        visit(tree);
    };
};

// Shared component configuration
const markdownComponents: any = {
  a: ({node, ...props}: any) => <a {...props} className="text-brand-red hover:underline decoration-brand-gold/50 dark:text-red-400" target="_blank" rel="noopener noreferrer" />,
  img: ({node, ...props}: any) => <img {...props} className="rounded-lg shadow-md max-w-full" loading="lazy" />,
  table: ({node, ...props}: any) => <div className="overflow-x-auto my-4"><table {...props} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-700" /></div>,
  thead: ({node, ...props}: any) => <thead {...props} className="bg-gray-50 dark:bg-zinc-800" />,
  th: ({node, ...props}: any) => <th {...props} className="px-6 py-3 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-brand-red/20 dark:border-red-900/30" />,
  td: ({node, ...props}: any) => <td {...props} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700" />,
  code: ({node, ...props}: any) => {
      const { className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const isBlock = !!match;

      return isBlock ? (
        <pre className="bg-[#1e1e1e] text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono leading-normal shadow-inner border-l-4 border-brand-gold">
           <code className={className} {...rest}>
            {children}
           </code>
        </pre>
      ) : (
        <code className={`bg-gray-100 dark:bg-zinc-800 text-brand-red dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-zinc-700 ${className || ''}`} {...rest}>
          {children}
        </code>
      )
  },
  blockquote: ({node, ...props}: any) => <blockquote {...props} className="border-l-4 border-brand-gold pl-4 py-1 my-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 rounded-r" />,
  ul: ({node, ...props}: any) => <ul {...props} className="list-disc pl-6 space-y-1 my-4 marker:text-brand-red" />,
  ol: ({node, ...props}: any) => <ol {...props} className="list-decimal pl-6 space-y-1 my-4 marker:text-brand-red" />,
  h1: ({node, ...props}: any) => <h1 {...props} className="text-3xl font-bold text-black dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mt-8 mb-4" />,
  h2: ({node, ...props}: any) => <h2 {...props} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4" />,
  h3: ({node, ...props}: any) => <h3 {...props} className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3" />,
  h4: ({node, ...props}: any) => <h4 {...props} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3" />,
  h5: ({node, ...props}: any) => <h5 {...props} className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2" />,
  h6: ({node, ...props}: any) => <h6 {...props} className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2 uppercase tracking-wide text-brand-red" />,
  hr: ({node, ...props}: any) => <hr {...props} className="my-8 border-gray-300 dark:border-gray-700" />,
  p: ({node, ...props}: any) => <p {...props} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" />,
};

function App() {
  const [doc, setDoc] = useState<DocumentState>({
    title: 'Untitled Document',
    content: defaultMarkdown,
    pageSize: 'A4',
    template: 'Standard',
    fontSize: 'Medium',
    pdfSettings: {
        orientation: 'portrait',
        margins: 15
    }
  });
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [spellCheck, setSpellCheck] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // History management
  const [history, setHistory] = useState<string[]>([defaultMarkdown]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Presets management
  const [presets, setPresets] = useState<Preset[]>([]);

  const debounceRef = useRef<any>(null);
  const saveTimeoutRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load autosave and presets on mount
  useEffect(() => {
    // Autosave loading
    const savedDoc = localStorage.getItem('md2pdf_autosave');
    if (savedDoc) {
        try {
            const parsed = JSON.parse(savedDoc);
            setDoc(prev => ({ 
              ...prev, 
              ...parsed, 
              pdfSettings: parsed.pdfSettings || { orientation: 'portrait', margins: 15 }
            }));
            setHistory([parsed.content]);
            setHistoryIndex(0);
        } catch (e) {
            console.error("Failed to load autosave", e);
        }
    }

    // Presets loading
    const savedPresets = localStorage.getItem('md2pdf_presets');
    if (savedPresets) {
        try {
            const parsedPresets = JSON.parse(savedPresets);
            if (Array.isArray(parsedPresets) && parsedPresets.length > 0) {
                setPresets(parsedPresets);
            } else {
                setPresets(DEFAULT_PRESETS);
            }
        } catch (e) {
            console.error("Failed to load presets", e);
            setPresets(DEFAULT_PRESETS);
        }
    } else {
        setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Autosave effect with status indicator
  useEffect(() => {
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('md2pdf_autosave', JSON.stringify(doc));
        setSaveStatus('saved');
    }, 1000);

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [doc]);

  // Persist presets effect
  useEffect(() => {
    localStorage.setItem('md2pdf_presets', JSON.stringify(presets));
  }, [presets]);

  // Sync scroll between editor and preview
  const handleScroll = (source: 'editor' | 'preview') => {
    const editor = editorContainerRef.current;
    const preview = previewContainerRef.current;
    
    if (!editor || !preview) return;

    if (source === 'editor') {
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      // Only scroll if difference is significant to prevent jitter loop
      const targetScroll = percentage * (preview.scrollHeight - preview.clientHeight);
      if (Math.abs(preview.scrollTop - targetScroll) > 10) {
          preview.scrollTop = targetScroll;
      }
    } else {
      const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      const targetScroll = percentage * (editor.scrollHeight - editor.clientHeight);
      if (Math.abs(editor.scrollTop - targetScroll) > 10) {
          editor.scrollTop = targetScroll;
      }
    }
  };

  const updateHistory = (newContent: string) => {
    setHistory(prev => {
        // If content is identical to current history tip, don't push
        if (prev[historyIndex] === newContent) return prev;
        
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        // Limit history size
        if (newHistory.length > 100) newHistory.shift();
        return newHistory;
    });
    setHistoryIndex(prev => {
        const currentContent = history[prev];
        return currentContent === newContent ? prev : (prev < history.length ? history.slice(0, prev + 1).length : prev + 1);
    });
  };

  const handleContentChange = (newContent: string, immediate = false) => {
    setDoc(prev => ({ ...prev, content: newContent }));

    if (debounceRef.current) {
        clearTimeout(debounceRef.current);
    }

    if (immediate) {
        updateHistory(newContent);
    } else {
        debounceRef.current = setTimeout(() => {
            updateHistory(newContent);
        }, 700);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setDoc(prev => ({ ...prev, content: history[newIndex] }));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setDoc(prev => ({ ...prev, content: history[newIndex] }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
        } else if (e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }
  };

  const handleInsert = (type: InsertType) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const { text, newCursor } = insertMarkdown(doc.content, type, start, end);
    
    // Immediate update for toolbar actions
    handleContentChange(text, true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // Generic text insertion for Presets
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const text = doc.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newContent = before + textToInsert + after;
    const newCursor = start + textToInsert.length;
    
    handleContentChange(newContent, true);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleSavePreset = (name: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const selectedText = doc.content.substring(start, end);
    
    if (!selectedText.trim()) {
      alert("Please select some text in the editor to save as a preset.");
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      content: selectedText
    };
    
    setPresets(prev => [...prev, newPreset]);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title || 'untitled'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;700&family=Noto+Sans+Math&display=swap" rel="stylesheet">
  <style>
    body {
        font-family: 'Noto Sans', sans-serif;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 40px auto;
      padding: 45px;
      background-color: white;
      border-radius: 8px;
    }
    /* KaTeX Font Override */
    .katex { font-family: 'Noto Sans Math', monospace !important; }
    
    /* Templates */
    .template-Academic { font-family: 'Times New Roman', serif; text-align: justify; }
    .template-Business { font-family: 'Noto Sans', sans-serif; }
    .template-Typewriter { font-family: 'Courier New', monospace; }
    
    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
        margin: 0;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <article class="markdown-body template-${doc.template}">
    ${document.getElementById('markdown-preview')?.innerHTML || ''}
  </article>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title || 'untitled'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('markdown-preview');
    if (!element) return;
    
    // Clone to avoid modifying the visual view during export
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.maxWidth = '100%';
    clone.style.padding = '40px';
    // Remove zoom for export
    (clone.style as any).zoom = '1';
    
    // Ensure template class is present
    clone.className = `prose prose-red max-w-none p-8 md:p-12 markdown-body template-${doc.template}`;
    
    const margin = doc.pdfSettings?.margins || 15;
    
    const opt = {
        margin:       [margin, margin, margin, margin], 
        filename:     `${doc.title || 'document'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { 
            unit: 'mm', 
            format: doc.pageSize.toLowerCase() as any, 
            orientation: doc.pdfSettings?.orientation || 'portrait' 
        },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(clone).save();
    } else {
        alert("PDF Generation library not loaded. Please allow CDN scripts or try again.");
    }
  };

  const handleExportDOCX = () => {
      const element = document.getElementById('markdown-preview');
      if (!element) return;
      
      const content = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>${doc.title}</title>
            </head>
            <body>
                ${element.innerHTML}
            </body>
        </html>
      `;
      
      if (typeof htmlDocx !== 'undefined' && typeof saveAs !== 'undefined') {
          const converted = htmlDocx.asBlob(content);
          saveAs(converted, `${doc.title || 'document'}.docx`);
      } else {
           alert("DOCX Generation library not loaded. Please allow CDN scripts or try again.");
      }
  };

  // --- Click to Sync Functionality ---

  const handleEditorClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!isSyncActive) return;
    const textarea = e.currentTarget;
    const cursorPosition = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPosition);
    // 1-based line number
    const lineNumber = textBefore.split('\n').length;

    const previewEl = document.getElementById('markdown-preview');
    if (previewEl) {
        // Find all elements with data-line attribute
        const elements = Array.from(previewEl.querySelectorAll('[data-line]')) as HTMLElement[];
        
        // Find closest element with line number >= clicked line
        // or the last element if we are at the end
        let target = elements.find(el => parseInt(el.getAttribute('data-line') || '0') >= lineNumber);
        
        // Fallback to the closest previous one if we are past the specific line but in a block
        if (!target) {
             const reversed = [...elements].reverse();
             target = reversed.find(el => parseInt(el.getAttribute('data-line') || '0') <= lineNumber);
        }

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight effect
            target.style.transition = 'background-color 0.5s';
            const originalBg = target.style.backgroundColor;
            target.style.backgroundColor = '#fff3cd'; // Light yellow highlight
            setTimeout(() => {
                target.style.backgroundColor = originalBg;
            }, 1000);
        }
    }
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSyncActive) return;
    
    // Find closest parent with data-line
    const target = (e.target as HTMLElement).closest('[data-line]');
    if (target && textareaRef.current && editorContainerRef.current) {
        const line = parseInt(target.getAttribute('data-line') || '0');
        const lineHeight = lineHeightMap[doc.fontSize];
        
        // Estimate position: (line - 1) * lineHeight
        // This is an approximation. For wrapped lines, it might be off.
        const scrollPos = (line - 1) * lineHeight;
        
        editorContainerRef.current.scrollTo({ top: scrollPos - 100, behavior: 'smooth' }); // -100 offset for context
        
        // Optional: Focus textarea (might cause scroll jump depending on browser)
        // textareaRef.current.focus();
    }
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-zinc-950 flex flex-col overflow-hidden transition-colors duration-200">
      {/* Screen View (Hidden when printing) */}
      <div className="flex flex-col h-full print:hidden">
        <Header 
            title={doc.title}
            onTitleChange={(title) => setDoc(prev => ({ ...prev, title }))}
            onExportMarkdown={handleExportMarkdown}
            onExportHTML={handleExportHTML}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
            saveStatus={saveStatus}
            pdfSettings={doc.pdfSettings}
            onPdfSettingsChange={(pdfSettings) => setDoc(prev => ({ ...prev, pdfSettings }))}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden relative shadow-inner">
            <Toolbar 
              onInsert={handleInsert} 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onUndo={undo}
              onRedo={redo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              presets={presets}
              onSavePreset={handleSavePreset}
              onLoadPreset={insertTextAtCursor}
              onDeletePreset={handleDeletePreset}
              pageSize={doc.pageSize}
              onPageSizeChange={(size) => setDoc(prev => ({ ...prev, pageSize: size }))}
              template={doc.template}
              onTemplateChange={(template) => setDoc(prev => ({ ...prev, template }))}
              fontSize={doc.fontSize}
              onFontSizeChange={(fontSize) => setDoc(prev => ({ ...prev, fontSize }))}
              theme={theme}
              onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              spellCheck={spellCheck}
              onToggleSpellCheck={() => setSpellCheck(!spellCheck)}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
            />
            
            <div className="flex flex-1 overflow-hidden relative">
                <div 
                    ref={editorContainerRef}
                    className={`flex flex-col h-full overflow-y-auto border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 ${
                    viewMode === 'editor' ? 'w-full' : 
                    viewMode === 'split' ? 'w-1/2' : 'w-0 hidden'
                    }`}
                    onScroll={() => viewMode === 'split' && !isSyncActive && handleScroll('editor')}
                >
                    <div className="flex-1 relative min-h-full">
                    <textarea
                        ref={textareaRef}
                        value={doc.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={handleEditorClick}
                        className={`w-full h-full p-8 font-mono leading-relaxed resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-zinc-600 bg-transparent ${fontSizeMap[doc.fontSize]} ${isSyncActive ? 'cursor-pointer' : 'cursor-text'}`}
                        placeholder="Start writing..."
                        spellCheck={spellCheck}
                    />
                    </div>
                </div>

                {/* Partition Sync Button - Visible only in split view */}
                {viewMode === 'split' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <button
                            onClick={() => setIsSyncActive(!isSyncActive)}
                            className={`pointer-events-auto p-2 rounded-full shadow-lg border transition-all duration-200 group ${
                                isSyncActive 
                                    ? 'bg-brand-red text-white border-brand-red scale-110' 
                                    : 'bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-zinc-600 hover:text-brand-red hover:border-brand-red/50 dark:hover:text-brand-red'
                            }`}
                            title={isSyncActive ? "Disable Click-to-Sync" : "Enable Click-to-Sync"}
                        >
                            {isSyncActive ? (
                                <MousePointerClick size={20} strokeWidth={2} className="animate-pulse" />
                            ) : (
                                <ArrowLeftRight size={20} strokeWidth={2} />
                            )}
                        </button>
                        {isSyncActive && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Click a side to sync
                            </div>
                        )}
                    </div>
                )}

                <div 
                    ref={previewContainerRef}
                    onClick={handlePreviewClick}
                    className={`flex flex-col h-full bg-white dark:bg-zinc-900 overflow-y-auto transition-all duration-300 ${
                    viewMode === 'preview' ? 'w-full' : 
                    viewMode === 'split' ? 'w-1/2' : 'w-0 hidden'
                    } ${isSyncActive ? 'cursor-pointer' : ''}`}
                    onScroll={() => viewMode === 'split' && !isSyncActive && handleScroll('preview')}
                >
                    <div 
                    id="markdown-preview" 
                    className={`prose prose-red dark:prose-invert max-w-none p-8 md:p-12 markdown-body template-${doc.template}`}
                    style={{
                        // Simple visual representation of page width in preview
                        maxWidth: doc.pageSize === 'A4' ? '210mm' : doc.pageSize === 'Legal' ? '216mm' : '216mm',
                        margin: '0 auto',
                        minHeight: '100%',
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease-in-out'
                    }}
                    >
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeInjectLineNumber]}
                        components={markdownComponents}
                    >
                        {doc.content}
                    </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Print View (Only visible when printing) */}
      <div className="hidden print:block bg-white h-auto w-full p-8">
         <div className={`prose prose-red max-w-none template-${doc.template}`} style={{ maxWidth: 'none' }}>
             <h1 className="text-4xl font-bold mb-6 pb-2 border-b-2 border-gray-300">{doc.title}</h1>
             <div className="markdown-content">
               <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={markdownComponents}
              >
                  {doc.content}
              </ReactMarkdown>
             </div>
         </div>
      </div>
    </div>
  );
}

export default App;
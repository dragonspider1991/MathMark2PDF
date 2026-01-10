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

const DEFAULT_PRESETS: Preset[] = [
  { id: 'default-1', name: 'Info Callout', content: '> ℹ️ **Info:** ' },
  { id: 'default-2', name: 'Math Block', content: '\n$$\n f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2\\pi i \\xi x} \\,d\\xi \n$$\n' },
  { id: 'default-3', name: 'Checklist', content: '- [ ] To Do\n- [ ] In Progress\n- [ ] Done' },
  { id: 'default-4', name: 'Signature', content: '\n---\n*Generated with **MathMark2PDF***' }
];

const fontSizeMap: Record<FontSize, string> = {
  'Small': 'text-xs', 'Medium': 'text-sm', 'Large': 'text-base', 'Extra Large': 'text-lg'
};

const lineHeightMap: Record<FontSize, number> = {
    'Small': 20, 'Medium': 24, 'Large': 28, 'Extra Large': 32
};

// Map templates to their default fonts
const templateDefaults: Record<Template, { text: string; math: string }> = {
  'Standard': { text: 'Noto Sans', math: 'Noto Sans Math' },
  'Academic': { text: 'Noto Serif', math: 'Noto Sans Math' },
  'Business': { text: 'Inter', math: 'Noto Sans Math' },
  'Typewriter': { text: 'JetBrains Mono', math: 'Roboto Mono' },
  'Modern': { text: 'Montserrat', math: 'Noto Sans Math' },
  'Elegant': { text: 'Playfair Display', math: 'Noto Serif' }
};

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
           <code className={className} {...rest}>{children}</code>
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
        margins: 15,
        textFont: 'Noto Sans',
        mathFont: 'Noto Sans Math',
        isFontOverridden: false
    }
  });
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [spellCheck, setSpellCheck] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const [history, setHistory] = useState<string[]>([defaultMarkdown]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [presets, setPresets] = useState<Preset[]>([]);

  const debounceRef = useRef<any>(null);
  const saveTimeoutRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const savedDoc = localStorage.getItem('md2pdf_autosave');
    if (savedDoc) {
        try {
            const parsed = JSON.parse(savedDoc);
            setDoc(prev => ({ 
              ...prev, ...parsed, 
              pdfSettings: parsed.pdfSettings || { orientation: 'portrait', margins: 15, textFont: 'Noto Sans', mathFont: 'Noto Sans Math', isFontOverridden: false }
            }));
            setHistory([parsed.content]);
            setHistoryIndex(0);
        } catch (e) { console.error("Autosave load failed", e); }
    }
    const savedPresets = localStorage.getItem('md2pdf_presets');
    if (savedPresets) {
        try {
            const parsedPresets = JSON.parse(savedPresets);
            setPresets(Array.isArray(parsedPresets) && parsedPresets.length > 0 ? parsedPresets : DEFAULT_PRESETS);
        } catch (e) { setPresets(DEFAULT_PRESETS); }
    } else { setPresets(DEFAULT_PRESETS); }
  }, []);

  useEffect(() => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('md2pdf_autosave', JSON.stringify(doc));
        setSaveStatus('saved');
    }, 1000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [doc]);

  useEffect(() => {
    localStorage.setItem('md2pdf_presets', JSON.stringify(presets));
  }, [presets]);

  const handleScroll = (source: 'editor' | 'preview') => {
    const editor = editorContainerRef.current;
    const preview = previewContainerRef.current;
    if (!editor || !preview) return;
    if (source === 'editor') {
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    } else {
      const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
    }
  };

  const handleTemplateChange = (newTemplate: Template) => {
    setDoc(prev => {
        const nextSettings = { ...prev.pdfSettings };
        // Only update font if user hasn't overridden it
        if (!prev.pdfSettings.isFontOverridden) {
            nextSettings.textFont = templateDefaults[newTemplate].text;
            nextSettings.mathFont = templateDefaults[newTemplate].math;
        }
        return { ...prev, template: newTemplate, pdfSettings: nextSettings };
    });
  };

  const handleFontChange = (type: 'text' | 'math' | 'both', font: string) => {
    setDoc(prev => {
        const nextSettings = { ...prev.pdfSettings, isFontOverridden: true };
        if (type === 'text' || type === 'both') nextSettings.textFont = font;
        if (type === 'math' || type === 'both') nextSettings.mathFont = font;
        return { ...prev, pdfSettings: nextSettings };
    });
  };

  const handleContentChange = (newContent: string, immediate = false) => {
    setDoc(prev => ({ ...prev, content: newContent }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (immediate) {
        updateHistory(newContent);
    } else {
        debounceRef.current = setTimeout(() => updateHistory(newContent), 700);
    }
  };

  const updateHistory = (newContent: string) => {
    setHistory(prev => {
        if (prev[historyIndex] === newContent) return prev;
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        if (newHistory.length > 100) newHistory.shift();
        return newHistory;
    });
    setHistoryIndex(prev => history[prev] === newContent ? prev : prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setDoc(prev => ({ ...prev, content: history[newIndex] }));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setDoc(prev => ({ ...prev, content: history[newIndex] }));
    }
  };

  const handleInsert = (type: InsertType) => {
    if (!textareaRef.current) return;
    const { text, newCursor } = insertMarkdown(doc.content, type, textareaRef.current.selectionStart, textareaRef.current.selectionEnd);
    handleContentChange(text, true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent = doc.content.substring(0, start) + textToInsert + doc.content.substring(end);
    handleContentChange(newContent, true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
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
        font-family: '${doc.pdfSettings.textFont}', sans-serif;
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
    .katex { font-family: '${doc.pdfSettings.mathFont}', monospace !important; }
    
    /* Template Styles */
    .template-Academic { font-family: 'Times New Roman', serif; text-align: justify; }
    .template-Academic h1 { text-align: center; text-transform: uppercase; border-bottom: none !important; margin-bottom: 2rem; }
    .template-Business { border-top: 8px solid #1e3a8a; padding-top: 2rem !important; }
    .template-Typewriter { font-family: 'Courier New', monospace; }
    .template-Modern h1 { background: #000; color: #fff; padding: 1rem; text-transform: uppercase; }
    .template-Elegant h1 { font-weight: 300; text-align: center; letter-spacing: 4px; border-bottom: 1px solid #d4af37 !important; }

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

  const handleExportPDF = () => {
    const element = document.getElementById('markdown-preview');
    if (!element) return;
    
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.maxWidth = '100%';
    clone.style.padding = '40px';
    (clone.style as any).zoom = '1';
    
    // Explicitly set font for PDF generation to ensure it carries over
    clone.style.fontFamily = `"${doc.pdfSettings.textFont}", sans-serif`;
    
    clone.className = `prose prose-red dark:prose-invert max-w-none p-8 md:p-12 markdown-body template-${doc.template}`;
    
    // Ensure math fonts are correctly applied in the PDF
    const style = document.createElement('style');
    style.innerHTML = `.katex, .katex * { font-family: "${doc.pdfSettings.mathFont}", serif !important; }`;
    clone.appendChild(style);

    const margin = doc.pdfSettings?.margins || 15;
    const opt = {
        margin: [margin, margin, margin, margin],
        filename: `${doc.title || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: doc.pageSize.toLowerCase() as any, orientation: doc.pdfSettings?.orientation || 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    if (typeof html2pdf !== 'undefined') html2pdf().set(opt).from(clone).save();
    else alert("PDF library not loaded.");
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-zinc-950 flex flex-col overflow-hidden transition-colors duration-200">
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
              onInsert={handleInsert} viewMode={viewMode} onViewModeChange={setViewMode}
              onUndo={undo} onRedo={redo} canUndo={historyIndex > 0} canRedo={historyIndex < history.length - 1}
              presets={presets} onSavePreset={(name) => {}} onLoadPreset={insertTextAtCursor}
              onDeletePreset={(id) => setPresets(prev => prev.filter(p => p.id !== id))}
              pageSize={doc.pageSize} onPageSizeChange={(size) => setDoc(prev => ({ ...prev, pageSize: size }))}
              template={doc.template} onTemplateChange={handleTemplateChange}
              fontSize={doc.fontSize} onFontSizeChange={(fontSize) => setDoc(prev => ({ ...prev, fontSize }))}
              theme={theme} onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              spellCheck={spellCheck} onToggleSpellCheck={() => setSpellCheck(!spellCheck)}
              zoomLevel={zoomLevel} onZoomChange={setZoomLevel}
              pdfSettings={doc.pdfSettings} onFontChange={handleFontChange}
            />
            
            <div className="flex flex-1 overflow-hidden relative">
                <div 
                    ref={editorContainerRef}
                    className={`flex flex-col h-full overflow-y-auto border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 ${
                        viewMode === 'editor' ? 'w-full' : viewMode === 'split' ? 'w-1/2' : 'w-0 hidden'
                    }`}
                    onScroll={() => viewMode === 'split' && !isSyncActive && handleScroll('editor')}
                >
                    <textarea
                        ref={textareaRef}
                        value={doc.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className={`w-full h-full p-8 font-mono leading-relaxed resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-zinc-600 bg-transparent ${fontSizeMap[doc.fontSize]}`}
                        placeholder="Start writing..."
                        spellCheck={spellCheck}
                    />
                </div>

                {viewMode === 'split' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <button
                            onClick={() => setIsSyncActive(!isSyncActive)}
                            className={`pointer-events-auto p-2 rounded-full shadow-lg border transition-all duration-200 ${
                                isSyncActive ? 'bg-brand-red text-white border-brand-red scale-110' : 'bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-brand-red'
                            }`}
                        >
                            {isSyncActive ? <MousePointerClick size={20} className="animate-pulse" /> : <ArrowLeftRight size={20} />}
                        </button>
                    </div>
                )}

                <div 
                    ref={previewContainerRef}
                    className={`flex flex-col h-full bg-white dark:bg-zinc-900 overflow-y-auto transition-all duration-300 ${
                        viewMode === 'preview' ? 'w-full' : viewMode === 'split' ? 'w-1/2' : 'w-0 hidden'
                    }`}
                    onScroll={() => viewMode === 'split' && !isSyncActive && handleScroll('preview')}
                >
                    <div 
                        id="markdown-preview" 
                        className={`prose prose-red dark:prose-invert max-w-none p-8 md:p-12 markdown-body template-${doc.template}`}
                        style={{
                            maxWidth: doc.pageSize === 'A4' ? '210mm' : '216mm',
                            margin: '0 auto',
                            minHeight: '100%',
                            transform: `scale(${zoomLevel / 100})`,
                            transformOrigin: 'top center',
                            fontFamily: `"${doc.pdfSettings.textFont}", sans-serif`,
                            transition: 'transform 0.2s ease-in-out'
                        }}
                    >
                        {/* Custom Math Font Injector */}
                        <style>{`.katex, .katex * { font-family: "${doc.pdfSettings.mathFont}", serif !important; }`}</style>
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
    </div>
  );
}

export default App;
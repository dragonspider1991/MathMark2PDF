export type ViewMode = 'editor' | 'preview' | 'split';
export type PageSize = 'A4' | 'Letter' | 'Legal';
export type Template = 'Standard' | 'Academic' | 'Business' | 'Typewriter' | 'Modern' | 'Elegant';
export type FontSize = 'Small' | 'Medium' | 'Large' | 'Extra Large';

export interface PDFSettings {
  orientation: 'portrait' | 'landscape';
  margins: number; // in mm
  textFont: string;
  mathFont: string;
  isFontOverridden: boolean;
}

export interface DocumentState {
  title: string;
  content: string;
  pageSize: PageSize;
  template: Template;
  fontSize: FontSize;
  pdfSettings: PDFSettings;
}

export interface Preset {
  id: string;
  name: string;
  content: string;
}

export type InsertType = 
  | 'bold' 
  | 'italic' 
  | 'strike' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'link' 
  | 'image' 
  | 'quote' 
  | 'code' 
  | 'code-block' 
  | 'math'
  | 'ul' 
  | 'ol' 
  | 'check' 
  | 'table' 
  | 'line';
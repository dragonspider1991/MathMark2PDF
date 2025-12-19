export type ViewMode = 'editor' | 'preview' | 'split';

export interface DocumentState {
  title: string;
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
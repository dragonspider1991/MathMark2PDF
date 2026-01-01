import React from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, Quote, Code, Terminal, 
  List, ListOrdered, CheckSquare, Table, Minus, Sigma,
  Eye, Columns, PenLine
} from 'lucide-react';
import { InsertType, ViewMode } from '../types';

interface ToolbarProps {
  onInsert: (type: InsertType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onInsert, viewMode, onViewModeChange }) => {
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
      className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-brand-red rounded transition-colors"
      title={tooltip}
    >
      <Icon size={16} strokeWidth={2.5} />
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1 self-center" />;

  return (
    <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200 bg-white no-print select-none">
      <div className="flex flex-wrap items-center gap-0.5">
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

        <Button type="quote" icon={Quote} tooltip="Blockquote" />
        <Button type="code" icon={Code} tooltip="Inline Code" />
        <Button type="code-block" icon={Terminal} tooltip="Code Block" />
        <Button type="math" icon={Sigma} tooltip="Math Equation" />
        
        <Divider />

        <Button type="link" icon={LinkIcon} tooltip="Link (Ctrl+K)" />
        <Button type="image" icon={ImageIcon} tooltip="Image" />
        <Button type="table" icon={Table} tooltip="Table" />
        <Button type="line" icon={Minus} tooltip="Horizontal Rule" />
      </div>

      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 ml-2 border border-gray-200">
        <button
          onClick={() => onViewModeChange('editor')}
          className={`p-1.5 rounded transition-all ${viewMode === 'editor' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Editor Only"
        >
          <PenLine size={16} />
        </button>
        <button
          onClick={() => onViewModeChange('split')}
          className={`p-1.5 rounded transition-all ${viewMode === 'split' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Split View"
        >
          <Columns size={16} />
        </button>
        <button
          onClick={() => onViewModeChange('preview')}
          className={`p-1.5 rounded transition-all ${viewMode === 'preview' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Preview Only"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
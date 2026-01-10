import { InsertType } from '../types';

export const insertMarkdown = (
  text: string,
  type: InsertType,
  selectionStart: number,
  selectionEnd: number
): { text: string; newCursor: number } => {
  const before = text.substring(0, selectionStart);
  const selected = text.substring(selectionStart, selectionEnd);
  const after = text.substring(selectionEnd);

  let insertion = '';
  let cursorOffset = 0;

  switch (type) {
    case 'bold':
      insertion = `**${selected || 'bold text'}**`;
      cursorOffset = selected ? 2 + selected.length + 2 : 2 + 9 + 2; 
      break;
    case 'italic':
      insertion = `*${selected || 'italic text'}*`;
      cursorOffset = selected ? 1 + selected.length + 1 : 1 + 11 + 1;
      break;
    case 'strike':
      insertion = `~~${selected || 'strikethrough'}~~`;
      cursorOffset = selected ? 2 + selected.length + 2 : 2 + 13 + 2;
      break;
    case 'h1':
      insertion = `# ${selected || 'Heading 1'}`;
      cursorOffset = 2 + (selected || 'Heading 1').length;
      break;
    case 'h2':
      insertion = `## ${selected || 'Heading 2'}`;
      cursorOffset = 3 + (selected || 'Heading 2').length;
      break;
    case 'h3':
      insertion = `### ${selected || 'Heading 3'}`;
      cursorOffset = 4 + (selected || 'Heading 3').length;
      break;
    case 'link':
      insertion = `[${selected || 'link text'}](url)`;
      cursorOffset = 1 + (selected || 'link text').length + 1; // Position cursor at 'url'
      break;
    case 'image':
      insertion = `![${selected || 'alt text'}](image_url)`;
      cursorOffset = 2 + (selected || 'alt text').length + 1;
      break;
    case 'quote':
      insertion = `\n> ${selected || 'Blockquote'}\n`;
      cursorOffset = 3 + (selected || 'Blockquote').length + 1;
      break;
    case 'code':
      insertion = `\`${selected || 'code'}\``;
      cursorOffset = 1 + (selected || 'code').length + 1;
      break;
    case 'code-block':
      insertion = `\n\`\`\`\n${selected || 'code block'}\n\`\`\`\n`;
      cursorOffset = 5 + (selected || 'code block').length + 4;
      break;
    case 'math':
        insertion = `\n$$\n${selected || 'E = mc^2'}\n$$\n`;
        cursorOffset = 4 + (selected || 'E = mc^2').length + 4;
        break;
    case 'ul':
      insertion = `\n- ${selected || 'List item'}`;
      cursorOffset = 3 + (selected || 'List item').length;
      break;
    case 'ol':
      insertion = `\n1. ${selected || 'List item'}`;
      cursorOffset = 4 + (selected || 'List item').length;
      break;
    case 'check':
      insertion = `\n- [ ] ${selected || 'Task item'}`;
      cursorOffset = 7 + (selected || 'Task item').length;
      break;
    case 'table':
      insertion = `\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
      cursorOffset = insertion.length;
      break;
    case 'line':
      insertion = `\n---\n`;
      cursorOffset = 5;
      break;
  }

  return {
    text: before + insertion + after,
    newCursor: selectionStart + cursorOffset,
  };
};

export const defaultMarkdown = `# Welcome to MathMark2PDF

**MathMark2PDF** is a powerful markdown editor and converter with first-class support for mathematics and clean export options.

## Features

- **Rich Editor**: Syntax highlighting and LaTeX math support.
- **Export Power**: Save as \`.md\`, \`.html\`, or print to \`.pdf\`.
- **Theme**: Striking Black, Red, and Gold design.

## Math Capabilities

We use **KaTeX** for fast and beautiful math rendering.

Inline: $E = mc^2$

Display block:

$$
\\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\left( -\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^{\\!2}\\,\\right)
$$

## Code Blocks

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Tables

| Metric | Value |
| :--- | :---: |
| Speed | Fast |
| Design | Bold |
| Cost | Free |

> "Mathematics is the language with which God has written the universe." 
> — Galileo Galilei

---

Start typing to create your document!
`;
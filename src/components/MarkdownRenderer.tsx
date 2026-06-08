import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Simple custom parser to transform Markdown headings, lists, and bold text into styled HTML elements
  const lines = content.split('\n');
  const elements = lines.map((line, index) => {
    // 1. Headings
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-2xl font-bold font-display mt-6 mb-3 text-white border-b border-slate-700 pb-2">
          {line.replace('# ', '')}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-semibold font-display mt-5 mb-2.5 text-slate-100">
          {line.replace('## ', '')}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg font-medium font-display mt-4 mb-2 text-sky-400">
          {line.replace('### ', '')}
        </h3>
      );
    }

    // 2. Blockquotes
    if (line.startsWith('> ')) {
      return (
        <blockquote key={index} className="border-l-4 border-sky-400 bg-slate-800/60 px-4 py-2 my-3 rounded-r text-slate-300 italic text-sm">
          {line.replace('> ', '')}
        </blockquote>
      );
    }

    // 3. Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletText = line.substring(2);
      return (
        <li key={index} className="ml-5 list-disc my-1 text-slate-300 text-sm">
          {parseInlineFormatting(bulletText)}
        </li>
      );
    }

    // 4. Numbered list
    const numMatch = line.match(/^\d+\.\s(.*)/);
    if (numMatch) {
      return (
        <li key={index} className="ml-5 list-decimal my-1 text-slate-300 text-sm">
          {parseInlineFormatting(numMatch[1])}
        </li>
      );
    }

    // 5. Normal line separator or normal paragraph
    if (line.trim() === '---') {
      return <hr key={index} className="my-5 border-slate-700" />;
    }

    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }

    return (
      <p key={index} className="text-slate-300 text-sm leading-relaxed mb-2">
        {parseInlineFormatting(line)}
      </p>
    );
  });

  return <div className="space-y-1 markdown-body">{elements}</div>;
}

// Support bold highlights (**bold**) or inline code (`code`)
function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    // Check for bold notation
    const boldStart = currentText.indexOf('**');
    if (boldStart !== -1) {
      const boldEnd = currentText.indexOf('**', boldStart + 2);
      if (boldEnd !== -1) {
        // Text before bold
        if (boldStart > 0) {
          parts.push(<span key={keyIdx++}>{currentText.substring(0, boldStart)}</span>);
        }
        // Bold content
        const boldContent = currentText.substring(boldStart + 2, boldEnd);
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-white bg-slate-800/50 px-1 py-0.5 rounded text-sky-300">
            {boldContent}
          </strong>
        );
        currentText = currentText.substring(boldEnd + 2);
        continue;
      }
    }

    // Check for bullet highlights or bracketed names
    const bracketStart = currentText.indexOf('[');
    if (bracketStart !== -1) {
      const bracketEnd = currentText.indexOf(']', bracketStart + 1);
      if (bracketEnd !== -1) {
        if (bracketStart > 0) {
          parts.push(<span key={keyIdx++}>{currentText.substring(0, bracketStart)}</span>);
        }
        const bracketContent = currentText.substring(bracketStart + 1, bracketEnd);
        parts.push(
          <span key={keyIdx++} className="font-semibold text-sky-400">
            [{bracketContent}]
          </span>
        );
        currentText = currentText.substring(bracketEnd + 1);
        continue;
      }
    }

    // Plain text remainder
    parts.push(<span key={keyIdx++}>{currentText}</span>);
    break;
  }

  return parts;
}

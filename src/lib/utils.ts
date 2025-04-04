// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats text with markdown-style bold formatting (**text**) while preserving code blocks.
 * 
 * @param text The input text to format
 * @returns An array of elements where bold text is wrapped in span tags with appropriate classes
 */
export function formatMarkdownBold(text: string): (string | { type: 'bold', content: string, key: string })[] {
  if (!text) return [];
  
  // Split the text into segments: code blocks and normal text
  const segments: { type: 'code' | 'text'; content: string }[] = [];
  
  // Match code blocks (marked with ```). We treat these as protected content
  const codeBlockRegex = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match;
  
  // Extract code blocks and regular text segments
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text segment before code block if it exists
    if (match.index > lastIndex) {
      segments.push({ 
        type: 'text', 
        content: text.substring(lastIndex, match.index) 
      });
    }
    
    // Add code block
    segments.push({ type: 'code', content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last code block
  if (lastIndex < text.length) {
    segments.push({ 
      type: 'text', 
      content: text.substring(lastIndex) 
    });
  }
  
  // If no code blocks found, treat entire text as one text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }
  
  // Process all segments
  const result: (string | { type: 'bold', content: string, key: string })[] = [];
  
  segments.forEach((segment, segmentIndex) => {
    if (segment.type === 'code') {
      // Keep code blocks untouched
      result.push(segment.content);
    } else {
      // Format bold text in non-code segments
      // Match text between ** markers
      const parts = segment.content.split(/(\*\*.*?\*\*)/g);
      
      parts.forEach((part, partIndex) => {
        // Check if this part is a bold text pattern (**text**)
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          // Remove ** markers and create a bold text representation
          const boldText = part.substring(2, part.length - 2);
          result.push({
            type: 'bold',
            content: boldText,
            key: `${segmentIndex}-${partIndex}`
          });
        } else if (part) {
          // Push regular text
          result.push(part);
        }
      });
    }
  });
  
  return result;
}

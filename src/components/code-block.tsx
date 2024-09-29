// Path: src/components/code-block.tsx

"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCopy, FaCheck } from "react-icons/fa"; // Importing copy and check icons
import { useTheme } from "next-themes";

/**
 * Props interface for the CodeBlock component.
 */
interface CodeBlockProps {
  language: string; // Programming language for syntax highlighting
  value: string;    // The actual code to display
}

/**
 * CodeBlock Component
 * Renders a syntax-highlighted code block with a copy button.
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const { theme } = useTheme(); // Access the current theme (light or dark)
  const [copied, setCopied] = useState(false); // State to manage copy status

  // Determine the style based on the current theme
  const selectedStyle = theme === "dark" ? prism : dark; // Use 'prism' for light and 'dark' for dark themes

  /**
   * Handles copying the code content to the clipboard.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    console.log("📋 Copied code block content to clipboard.");
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4"> {/* Added vertical margins for separation */}
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-opacity p-1 rounded-md bg-transparent"
        aria-label="Copy code to clipboard"
      >
        {copied ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
      </button>
      {/* Syntax Highlighted Code Block */}
      <SyntaxHighlighter
        language={language}
        style={selectedStyle}
        PreTag="div"
        showLineNumbers
        wrapLongLines
        className={`rounded-md p-4 ${
          theme === "light" ? "bg-gray-100 text-black" : "bg-black text-white"
        }`}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;

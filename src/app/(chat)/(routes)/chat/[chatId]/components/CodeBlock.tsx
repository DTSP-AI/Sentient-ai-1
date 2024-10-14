// src/components/CodeBlock.tsx

"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  return (
    <SyntaxHighlighter language={language} style={dark} PreTag="div">
      {value}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;

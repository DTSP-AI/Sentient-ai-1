// Relative Path: /src/components/ui/code-snippet.tsx

"use client";

import { Button } from "@/components/ui/button"; // 🔘 Reusable button component
import { Copy } from "lucide-react"; // 📦 Copy icon from lucide-react
import { useToast } from "@/components/ui/use-toast"; // 🛠️ Hook for toast notifications
import { useTheme } from "next-themes"; // 🎨 Hook to access current theme
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // 🖥️ Syntax highlighter for code blocks
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism"; // 🌑 Dark theme for syntax highlighting

interface CodeSnippetProps {
  code: string;
  language?: string;
}

const CodeSnippet = ({ code, language = "javascript" }: CodeSnippetProps) => {
  const { toast } = useToast(); // 🔔 Toast notification handler
  const { theme } = useTheme(); // 🌗 Current theme (light/dark)

  // 📋 Function to handle copying code to clipboard
  const onCopyCode = () => {
    try {
      navigator.clipboard.writeText(code); // 📋 Write code to clipboard
      console.log("📋 Code snippet copied to clipboard:", code); // 📝 Log successful copy action
      toast({
        description: "Code copied to clipboard.",
        duration: 3000,
      });
    } catch (error) {
      console.error("❌ Error copying code snippet:", error); // 🛑 Log error if copying fails
      toast({
        description: "Failed to copy code.",
        duration: 3000,
      });
    }
  };

  console.log("🖥️ Rendering CodeSnippet component for language:", language); // 📝 Log the rendering of the code snippet

  return (
    <div className="w-full max-w-full overflow-x-auto mb-12"> {/* 🖼️ Container allows horizontal scrolling and adds bottom margin */}
      {/* 🏷️ Code Block Header */}
      <div className="w-full flex justify-between items-center bg-gray-800 bg-opacity-75 text-gray-200 px-2 py-1 rounded-t-lg">
        <span className="text-sm font-medium ml-2">{language}</span> {/* 📄 Language Label */}
        <Button
          onClick={onCopyCode} // 📂 Handle copy code action on click
          variant="ghost"
          size="icon"
          aria-label="Copy code" // 🧑‍💻 Accessibility label
        >
          <Copy className="w-4 h-4" /> {/* 📋 Copy icon */}
        </Button>
      </div>
      {/* 🖥️ Syntax Highlighted Code Block */}
      <SyntaxHighlighter
        language={language}
        style={darcula} // 🌑 Apply dark theme
        showLineNumbers // 🔢 Show line numbers in code block
        customStyle={{
          backgroundColor: "#0a0a0a", // 🖤 Fixed dark background
          borderRadius: "0 0 0.5rem 0.5rem", // 🔲 Rounded bottom corners
          padding: "16px", // 🖼️ Padding inside the code block
          marginTop: "4px", // 📏 Remove top margin to align with header
          marginBottom: "4px", // 📏 Bottom margin
          color: "#f8f8f2", // 🖋️ Fixed light text color
          width: "100%", // 📐 Make code block take full width of parent
          overflowX: "auto", // 🔄 Enable horizontal scrolling for overflowing content
          whiteSpace: "pre-wrap", // 🔄 Preserve whitespace and allow wrapping
          wordBreak: "break-all", // 🔄 Break words to prevent overflow
        }}
        className="w-full" // 📐 Ensure the SyntaxHighlighter takes full width
      >
        {code} {/* 📝 Code content to be highlighted */}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeSnippet; // ✅ Export CodeSnippet as default

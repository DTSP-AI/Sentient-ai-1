// Relative Path: /src/components/chat-message.tsx

"use client";

import { BotAvatar } from "@/components/bot-avatar"; // 🧑‍💼 Bot avatar component
import { Button } from "@/components/ui/button"; // 🔘 Reusable button component
import { useToast } from "@/components/ui/use-toast"; // 🛠️ Hook for toast notifications
import { UserAvatar } from "@/components/user-avatar"; // 👤 User avatar component
import { cn } from "@/lib/utils"; // 🧩 Utility for conditional classNames
import { Copy } from "lucide-react"; // 📦 Icon for copy functionality
import { useTheme } from "next-themes"; // 🎨 Hook to access current theme
import { BeatLoader } from "react-spinners"; // 🌀 Loader component for loading states
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // 🖥️ Syntax highlighter for code blocks
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism"; // 🌑 Dark theme for syntax highlighting

export interface ChatMessageProps {
  id?: string;
  role: "system" | "user"; // 👥 Role of the message sender
  content?: string;
  isLoading?: boolean;
  src?: string; // 🌐 Source URL for avatars
}

export const ChatMessage = ({
  role,
  content = "", // 📝 Default content to an empty string
  isLoading,
  src,
}: ChatMessageProps) => {
  const { toast } = useToast(); // 🔔 Toast notification handler
  const { theme } = useTheme(); // 🌗 Current theme (light/dark)

  // 📋 Function to handle copying message content to clipboard
  const onCopy = () => {
    if (!content) {
      // ❌ No content to copy
      console.log("❌ Attempted to copy empty content.");
      return;
    }

    navigator.clipboard.writeText(content); // 📋 Write content to clipboard
    // 📢 Notify user of successful copy
    console.log("📋 Message copied to clipboard:", content);
    toast({
      description: "Message copied to clipboard.",
      duration: 3000,
    });
  };

  // 📋 Function to handle copying code snippets to clipboard
  const onCopyCode = (code: string) => {
    navigator.clipboard.writeText(code); // 📋 Write code to clipboard
    // 📢 Notify user of successful code copy
    console.log("📋 Code snippet copied to clipboard:", code);
    toast({
      description: "Code copied to clipboard.",
      duration: 3000,
    });
  };

  // 📝 Function to render message content with support for code snippets
  const renderContent = () => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g; // 🔍 Regex to detect code blocks
    const parts = []; // 📦 Array to hold rendered content parts
    let lastIndex = 0; // 🔢 Track the last index processed
    let match;

    // 🔄 Iterate over all code block matches in the content
    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, lang, code] = match; // 📝 Destructure match results
      const index = match.index; // 📍 Start index of the match

      // 📝 Add text before the code block as a paragraph
      if (lastIndex < index) {
        const text = content.substring(lastIndex, index);
        parts.push(
          <p key={lastIndex} className="mb-2">
            {text}
          </p>
        );
      }

      // 🖥️ Render the detected code block with syntax highlighting
      parts.push(
        <div
          key={index}
          className="flex flex-col items-start w-full px-0.5" // 📱 Adjusted to items-start and minimal padding
        >
          {/* 🏷️ Code Block Header */}
          <div className="w-full flex justify-between items-center bg-gray-800 bg-opacity-75 text-gray-200 px-0.5 py-1 rounded-t-lg"> {/* 🔽 Updated padding and border radius */}
            <span className="text-sm font-medium ml-2">{lang || "javascript"}</span> {/* 📄 Language Label moved right by 8px */}
            <Button
              onClick={() => onCopyCode(code)} // 📂 Handle copy code action on click
              variant="ghost" // 🎨 Button variant
              size="icon" // 📏 Button size
            >
              <Copy className="w-4 h-4" /> {/* 📋 Copy icon */}
              {/* 📋 Copy button tooltip */}
            </Button>
          </div>
          {/* 🖥️ Syntax Highlighted Code Block */}
          <SyntaxHighlighter
            language={lang || "javascript"} // 🖥️ Language for syntax highlighting, default to JavaScript
            style={darcula} // 🌑 Apply dark theme
            showLineNumbers // 🔢 Show line numbers in code block
            customStyle={{
              backgroundColor: "#000000", // ⚫ Black background for code blocks
              borderRadius: "0 0 0.5rem 0.5rem", // 🔲 Rounded bottom corners to 0.5rem (8px), top corners remain 0px
              padding: "16px", // 🖼️ Padding inside the code block
              marginTop: "0", // 📏 Remove top margin to align with header
              marginBottom: "8px", // 📏 Bottom margin
              color: "#f8f8f2", // 🖋️ Light text for better readability
              width: "100%", // 📐 Make code block take full width
              maxWidth: "448px", // 📏 Aligned max-width with parent container's max-w-md (448px)
            }}
          >
            {code} {/* 📝 Code content to be highlighted */}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = index + fullMatch.length; // 🔢 Update last processed index
      // 🔍 Log detection and rendering of a code block
      console.log("🔍 Detected and rendered a code block.");
    }

    // 📝 Add any remaining text after the last code block as a paragraph
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex);
      parts.push(
        <p key={lastIndex} className="mb-2">
          {text}
        </p>
      );
    }

    return parts; // 🗂️ Return all rendered content parts
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-x-3 py-4 w-full", // ⚙️ Base styling for message container
        role === "user" && "justify-end" // 🧑‍💻 Align user messages to the end (right)
      )}
    >
      {role !== "user" && src && <BotAvatar src={src} />} {/* 👤 Bot avatar */}
      <div className="rounded-md bg-primary/10 px-4 py-2 max-w-md text-sm"> {/* 📏 Container for message content */}
        {/* 🌀 Display loader if the message is loading */}
        {isLoading ? (
          <>
            <BeatLoader size={5} color={theme === "light" ? "black" : "white"} /> {/* 🌀 Loading spinner */}
            {/* 📡 Loading state visually hidden for accessibility */}
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          <div>
            {renderContent()} {/* 📝 Render the formatted content */}
            {/* 🖨️ Log successful content rendering */}
            <p className="text-xs text-gray-500 mt-1">🖨️ Content rendered successfully.</p>
          </div>
        )}
      </div>
      {role === "user" && <UserAvatar />} {/* 👤 User avatar */}
      {role !== "user" && !isLoading && (
        <Button
          onClick={onCopy} // 📂 Handle copy action on click
          className="opacity-0 group-hover:opacity-100 transition" // 👀 Show button on hover
          size="icon" // 📏 Button size
          variant="ghost" // 🎨 Button variant
        >
          <Copy className="w-4 h-4" /> {/* 📋 Copy icon */}
          {/* 📋 Copy button tooltip */}
        </Button>
      )}
    </div>
  );
};

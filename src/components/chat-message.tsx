"use client";

import { BotAvatar } from "@/components/bot-avatar"; // 🧑‍💼 Bot avatar component
import { Button } from "@/components/ui/button"; // 🔘 Reusable button component
import { UserAvatar } from "@/components/user-avatar"; // 👤 User avatar component
import { cn } from "@/lib/utils"; // 🧩 Utility for conditional classNames
import { Pencil, Copy } from "lucide-react"; // 📦 Icons for edit and copy functionalities
import { useTheme } from "next-themes"; // 🎨 Hook to access current theme
import { BeatLoader } from "react-spinners"; // 🌀 Loader component for loading states
import CodeSnippet from "@/components/ui/code-snippet"; // 🖥️ Separate CodeSnippet component

export interface ChatMessageProps {
  id?: string;
  role: "system" | "user" | "bot"; // 👥 Role of the message sender (added bot role for clarity)
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
  const { theme } = useTheme(); // 🌗 Current theme (light/dark)

  // 📋 Function to handle copying message content to clipboard
  const onCopy = () => {
    if (!content) {
      console.log("❌ Attempted to copy empty content."); // 📝 Log when attempting to copy an empty content
      return;
    }

    navigator.clipboard.writeText(content); // 📋 Write content to clipboard
    console.log("📋 Message copied to clipboard:", content); // 📝 Log successful copy action
  };

  // ✏️ Function to handle editing the message
  const onEdit = () => {
    console.log("✏️ Edit button clicked for message:", content); // 📝 Log edit action
  };

  // 📝 Function to render message content with support for code snippets using CodeSnippet component
  const renderContent = () => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g; // 🔍 Regex to detect code blocks
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Iterate through the content and detect both text and code blocks
    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;

      // Handle any text before the code block
      if (lastIndex < index) {
        const text = content.substring(lastIndex, index).split("\n\n").map((paragraph, i) => (
          <p key={`text-${lastIndex}-${i}`} className="mb-2 break-words">
            {paragraph.trim()}
          </p>
        ));
        parts.push(...text);
      }

      // Render the code block using the CodeSnippet component
      parts.push(
        <CodeSnippet
          key={index}
          code={code} // 📝 Code content to be highlighted
          language={lang || "javascript"} // 📄 Language label with default to JavaScript
        />
      );

      lastIndex = index + fullMatch.length;
    }

    // Handle any remaining text after the last code block
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex).split("\n\n").map((paragraph, i) => (
        <p key={`text-${lastIndex}-${i}`} className="mb-2 break-words">
          {paragraph.trim()}
        </p>
      ));
      parts.push(...remainingText);
    }

    return parts;
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-x-2 py-2 max-w-full", // Full width on all screens
        role === "user"
          ? "justify-end w-full md:w-1/2 ml-auto"  // User: right-aligned, 50% on medium and larger screens
          : "justify-center w-full md:w-full" // Bot: centered, full width on medium and larger screens
      )}
    >
      {role === "user" && (
        <Button
          onClick={onEdit} // ✏️ Handle edit action on click
          className="opacity-0 group-hover:opacity-100 transition" // 👀 Show button on hover
          size="icon" // 📏 Button size
          variant="ghost" // 🎨 Button variant
          aria-label="Edit message" // 🧑‍💻 Accessibility label
        >
          <Pencil className="w-4 h-4" /> {/* ✏️ Edit icon */}
        </Button>
      )}

      {/* Hide the Bot Avatar on mobile */}
      {role === "bot" && src && (
        <div className="hidden md:block"> {/* Hide avatar on mobile */}
          <BotAvatar src={src} />
        </div>
      )}

      {/* 📦 Message Content Container */}
      <div
        className={cn(
          "rounded-md px-6 md:px-6 py-4 md:py-4 w-full overflow-hidden flex-1", // 📐 Responsive padding, prevent overflow, take remaining space
          role === "bot" ? "bg-transparent" : "bg-primary/10", // Make Bot messages transparent and User messages with a background
          "text-base md:text-base" // 🔤 Responsive text size
        )}
      >
        {/* 🌀 Display loader if the message is loading */}
        {isLoading ? (
          <>
            <BeatLoader
              size={5}
              color={theme === "light" ? "black" : "white"}
            /> {/* 🌀 Loading spinner */}
            <span className="sr-only">Loading...</span> {/* 📡 Loading state visually hidden for accessibility */}
          </>
        ) : (
          <div>
            {renderContent()} {/* 📝 Render the formatted content */}
          </div>
        )}
      </div>

      {role === "user" && <UserAvatar />} {/* 👤 User avatar */}

      {role === "bot" && !isLoading && (
        <Button
          onClick={onCopy} // 📂 Handle copy action on click
          className="opacity-0 group-hover:opacity-100 transition" // 👀 Show button on hover
          size="icon" // 📏 Button size
          variant="ghost" // 🎨 Button variant
          aria-label="Copy message" // 🧑‍💻 Accessibility label
        >
          <Copy className="w-4 h-4" /> {/* 📋 Copy icon */}
        </Button>
      )}
    </div>
  );
};

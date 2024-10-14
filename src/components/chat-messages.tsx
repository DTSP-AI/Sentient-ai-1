// Relative Path: /src/components/chat-messages.tsx

"use client";

import { ElementRef, useEffect, useRef, useState } from "react"; // 🔄 React hooks for state and effects
import { Companion } from "@prisma/client"; // 🗃️ Prisma client for database models
import { ChatMessage, ChatMessageProps } from "@/components/chat-message"; // 💬 Chat message components

interface ChatMessagesProps {
  messages: ChatMessageProps[]; // 📜 Array of chat messages
  isLoading: boolean; // ⏳ Loading state
  companion: Companion; // 🤖 Companion information
}

export const ChatMessages = ({
  messages = [],
  isLoading,
  companion,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null); // 📍 Reference to the scroll container

  // 🌀 State to control the fake loading animation
  const [fakeLoading, setFakeLoading] = useState(messages.length === 0);

  // ⏰ useEffect to handle fake loading when the component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false); // ⏳ Fake loading completed
      console.log("⏳ Fake loading animation ended.");
    }, 1000); // ⏱️ 1-second delay for fake loading

    // 🧹 Clean up the timeout to prevent memory leaks
    return () => {
      clearTimeout(timeout);
      console.log("🧹 Cleaned up fake loading timeout.");
    };
  }, []);

  // 🔄 useEffect to scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" }); // 📜 Smooth scroll to bottom
      console.log("📍 Scrolled to the bottom of chat messages.");
    }
  }, [messages]); // 📥 Dependency on messages array

  return (
    <div className="flex-1 overflow-y-auto pr-4 h-full"> {/* 🖥️ Container for chat messages with vertical scrolling and full height */}
      {/* 💬 Introductory message from the companion */}
      <ChatMessage
        id="intro-message" // 🆔 Unique ID for the introductory message
        role="system" // 🧑‍💼 Role indicating system/bot message
        content={`Hello, I'm ${companion.name}. ${companion.shortDescription}`} // 📝 Introductory content
        src={companion.src} // 🌐 Avatar source for the companion
        isLoading={fakeLoading} // ⏳ Loading state
      />
      {/* 💬 Map through and render each chat message */}
      {messages.map((message) => (
        <ChatMessage
          key={message.id} // 🆔 Unique key for each message
          id={message.id} // 🆔 Message ID
          role={message.role} // 👥 Message sender role
          content={message.content} // 📝 Message content
          src={companion.src} // 🌐 Avatar source for the companion
        />
      ))}
      {/* ⏳ Show a loading message if the system is loading */}
      {isLoading && (
        <ChatMessage
          id="loading-message" // 🆔 Unique ID for the loading message
          role="system" // 🧑‍💼 Role indicating system/bot message
          content="Thinking..." // 📝 Loading content
          src={companion.src} // 🌐 Avatar source for the companion
          isLoading={true} // ⏳ Loading state
        />
      )}
      {/* 📍 Reference div for scrolling to the bottom */}
      <div ref={scrollRef} />
    </div>
  );
};

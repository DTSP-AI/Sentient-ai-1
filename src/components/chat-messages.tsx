// Relative Path: /src/components/chat-messages.tsx

"use client";

import { useRef, useState } from "react"; // 🔄 React hooks for state and references
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
  const scrollContainerRef = useRef<HTMLDivElement>(null); // 📍 Reference to the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null); // 📍 Reference to the scroll-to-bottom element

  // 🌀 State to control the fake loading animation
  const [fakeLoading, setFakeLoading] = useState(messages.length === 0); // 🟢 Initializes fakeLoading to true if there are no messages

  // 🕒 Handle fake loading without useEffect
  if (fakeLoading) {
    setTimeout(() => {
      setFakeLoading(false); // ⏳ Fake loading completed
      console.log("⏳ Fake loading animation ended."); // 📝 Log fake loading completion
    }, 1000); // ⏱️ 1-second delay for fake loading
  }

  // 📍 Scroll to bottom without useEffect
  if (scrollContainerRef.current) {
    // 📋 Check if the latest message is from the system
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "system") {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight, // 📏 Scroll to the bottom of the container
        behavior: "smooth",
      });
      console.log("📍 Scrolled to the bottom of chat messages."); // 📝 Log scrolling action
    }
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-6 md:px-20 py-4 md:py-6 h-full scrollbar-hide scrollbar-hover" // Increased padding horizontally and vertically
    >
      {/* 💬 Introductory message from the companion */}
      <ChatMessage
        id="intro-message" // 🆔 Unique ID for the introductory message
        role="system" // 🧑‍💼 Role indicating system/bot message
        content={`Hello, I'm ${companion.name}. ${companion.shortDescription}`} // 📝 Introductory content
        src={companion.src} // 🌐 Avatar source for the companion
        isLoading={fakeLoading} // ⏳ Loading state controlled by fakeLoading
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
      <div ref={scrollRef} /> {/* 📍 Invisible div to maintain scroll reference */}
    </div>
  );
};

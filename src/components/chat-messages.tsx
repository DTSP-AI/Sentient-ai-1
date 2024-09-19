//src\components\chat-messages.tsx

"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { Companion } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "@/components/chat-message";

interface ChatMessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  companion: Companion;
}

export const ChatMessages = ({
  messages = [],
  isLoading,
  companion,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);

  // State to control the fake loading animation
  const [fakeLoading, setFakeLoading] = useState(messages.length === 0);

  // Use effect to handle fake loading when the component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    // Clean up the timeout to prevent memory leaks
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // Scroll to the bottom of the chat messages when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      {/* Introductory message from the companion */}
      <ChatMessage
        id="intro-message"
        role="system"
        content={`Hello, I'm ${companion.name}. ${companion.shortDescription}`}
        src={companion.src}
        isLoading={fakeLoading}
      />
      {/* Map through and render each chat message */}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          id={message.id}
          role={message.role}
          content={message.content}
          src={companion.src}
        />
      ))}
      {/* Show a loading message if the system is loading */}
      {isLoading && (
        <ChatMessage
          id="loading-message"
          role="system"
          content="Thinking..."
          src={companion.src}
          isLoading={true}
        />
      )}
      {/* Reference div for scrolling to the bottom */}
      <div ref={scrollRef} />
    </div>
  );
};

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

  const [fakeLoading, setFakeLoading] = useState(
    messages.length === 0 ? true : false,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        id="intro-message"
        role="system"
        content={`Hello, I'm ${companion.name}. ${companion.shortDescription}`}
        src={companion.src}
        isLoading={fakeLoading}
      />
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          id={message.id}
          role={message.role}
          content={message.content}
          src={companion.src}
        />
      ))}
      {isLoading && (
        <ChatMessage
          id="loading-message"
          role="system"
          content="Thinking..."
          src={companion.src}
          isLoading={true}
        />
      )}
      <div ref={scrollRef} />
    </div>
  );
};
//src\app\(chat)\(routes)\chat\[chatId]\components\client.tsx

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/chat-header";
import { ChatForm } from "@/components/chat-form";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";
import { Companion, Message } from "@prisma/client";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
    characterDescription: {
      physicalAppearance: string;
      identity: string;
      interactionStyle: string;
    };
  };
  initialMessages: ChatMessageProps[];
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(
    companion.messages.map((message) => ({
      id: message.id,
      role: message.role as "system" | "user",
      content: message.content,
      src: companion.src,
    }))
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageProps = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      src: companion.src,
    };
    setMessages((current) => [...current, userMessage]);

    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/${companion.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response.");
      }

      const { systemMessage } = await response.json();
      const aiMessage: ChatMessageProps = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: systemMessage,
        src: companion.src,
      };
      setMessages((current) => [...current, aiMessage]);
      setInput("");
    } catch (error) {
      console.error("Failed to generate response:", error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader companion={companion} />
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        companion={companion}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
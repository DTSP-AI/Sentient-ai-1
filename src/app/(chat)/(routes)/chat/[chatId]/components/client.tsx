// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(chat)\(routes)\chat\[chatId]\components\client.tsx

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@components/chat-header";
import { ChatForm } from "@components/chat-form";
import { ChatMessages, ChatMessageProps } from "@components/chat-message";
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
  initialResponse: string;
}

export const ChatClient = ({ companion, initialMessages, initialResponse }: ChatClientProps) => {
  const router = useRouter();

  // Initialize the messages state with initialMessages and initialResponse
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    ...initialMessages,
    { role: "system", content: initialResponse },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    };
    setMessages((current) => [...current, userMessage]);

    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/${companion.id}`, {  // Use chatId in the API call
        method: "POST",
        body: JSON.stringify({ prompt: input }),  // Match 'prompt' with server-side handling
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response.");
      }

      const { systemMessage } = await response.json();
      setMessages((current) => [...current, { role: "system", content: systemMessage }]);
      setInput(""); // Clear input after sending
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
      <ChatMessages companion={companion} isLoading={isLoading} messages={messages} />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

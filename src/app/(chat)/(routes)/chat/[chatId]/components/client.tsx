// Path: src/app/(chat)/routes/chat/[chatId]/components/client.tsx

"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
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

export const ChatClient = ({ companion, initialMessages }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch the latest messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log("🚀 Fetching messages for chat:", companion.id);
        const response = await fetch(`/api/chat/${companion.id}/messages`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages.");
        }
        const data = await response.json();
        console.log("📨 Fetched messages:", data);

        const fetchedMessages: ChatMessageProps[] = data.map((msg: Message) => ({
          id: msg.id,
          role: msg.role as "system" | "user",
          content: msg.content,
          src: companion.src,
        }));
        setMessages(fetchedMessages);
        // Store fetched messages in localStorage
        localStorage.setItem(`chat_${companion.id}`, JSON.stringify(fetchedMessages));
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
        // If fetch fails, try to load from localStorage
        const storedMessages = localStorage.getItem(`chat_${companion.id}`);
        if (storedMessages) {
          console.log("🗄️ Loaded messages from localStorage.");
          setMessages(JSON.parse(storedMessages));
        }
      }
    };
    fetchMessages();
  }, [companion.id, companion.src]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus the input when the AI response is received
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageProps = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      src: companion.src,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_${companion.id}`, JSON.stringify(updatedMessages));

    setIsLoading(true);
    console.log("⌨️ Sending user message:", userMessage);

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
      console.log("🤖 AI response received:", systemMessage);

      const aiMessage: ChatMessageProps = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: systemMessage,
        src: companion.src,
      };
      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);
      localStorage.setItem(`chat_${companion.id}`, JSON.stringify(newMessages));
      setInput("");
    } catch (error) {
      console.error("❌ Failed to generate response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear messages on the client side
  const onMessagesCleared = () => {
    setMessages([]); // Clear the state
    localStorage.removeItem(`chat_${companion.id}`); // Clear local storage
    console.log("🗑️ Cleared all messages.");
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2"> {/* Ensured full width */}
      <ChatHeader companion={companion} onMessagesCleared={onMessagesCleared} />
      <div className="flex-1 overflow-y-auto"> {/* Adjusted to stretch the chat area */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          companion={companion}
        />
        <div ref={scrollRef} />
      </div>
      <ChatForm
        isLoading={isLoading}
        input={input}
        inputRef={inputRef}
        handleInputChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

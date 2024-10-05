// Relative Path: /src/app/(chat)/routes/chat/[chatId]/components/client.tsx

"use client";

import { useState, useRef, FormEvent, useEffect } from "react"; // 🔄 React hooks for state and effects
import { useRouter } from "next/navigation"; // 🚀 Next.js router for navigation
import { ChatHeader } from "@/components/chat-header"; // 🧑‍💼 Chat header component
import { ChatForm } from "@/components/chat-form"; // 📝 Chat form component
import { ChatMessages } from "@/components/chat-messages"; // 💬 Chat messages component
import { ChatMessageProps } from "@/components/chat-message"; // 💌 Chat message props
import { Companion, Message } from "@prisma/client"; // 🗃️ Prisma client for database models

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
  const router = useRouter(); // 🌐 Router instance for navigation
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages); // 💬 State for chat messages
  const [input, setInput] = useState<string>(""); // 📝 State for input field
  const [isLoading, setIsLoading] = useState<boolean>(false); // ⏳ Loading state

  const inputRef = useRef<HTMLInputElement | null>(null); // 🔗 Reference to the input element
  const scrollRef = useRef<HTMLDivElement>(null); // 📍 Reference to the scroll container

  // 🌀 Fetch the latest messages on component mount
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
        // 🗄️ Store fetched messages in localStorage
        localStorage.setItem(`chat_${companion.id}`, JSON.stringify(fetchedMessages));
        console.log("🗄️ Messages stored in localStorage.");
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
        // 📂 If fetch fails, try to load from localStorage
        const storedMessages = localStorage.getItem(`chat_${companion.id}`);
        if (storedMessages) {
          console.log("🗄️ Loaded messages from localStorage.");
          setMessages(JSON.parse(storedMessages));
        } else {
          console.log("🆘 No messages found in localStorage.");
        }
      }
    };
    fetchMessages();
  }, [companion.id, companion.src]);

  // 🔄 Scroll to the bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" }); // 📜 Smooth scroll to bottom
      console.log("📍 Automatically scrolled to the bottom of chat messages.");
    }
  }, [messages]);

  // 🎯 Focus the input when the AI response is received
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus(); // 🎯 Focus the input field
      console.log("🎯 Input field focused.");
    }
  }, [isLoading]);

  // 📝 Handle form submission to send a message
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      console.log("⚠️ Empty input. Message not sent.");
      return;
    }

    const userMessage: ChatMessageProps = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      src: companion.src,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_${companion.id}`, JSON.stringify(updatedMessages));
    console.log("⌨️ User message sent:", userMessage);

    setIsLoading(true);
    console.log("⏳ Awaiting AI response...");

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
      console.log("✅ AI message appended to chat.");
      setInput("");
      console.log("📝 Input field cleared.");
    } catch (error) {
      console.error("❌ Failed to generate response:", error);
      // 🔄 Optionally, notify the user about the error
    } finally {
      setIsLoading(false);
      console.log("🔄 Loading state updated to false.");
    }
  };

  // 🗑️ Function to clear messages on the client side
  const onMessagesCleared = () => {
    setMessages([]); // 🧹 Clear the state
    localStorage.removeItem(`chat_${companion.id}`); // 🗑️ Clear local storage
    console.log("🗑️ Cleared all messages from state and localStorage.");
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader companion={companion} onMessagesCleared={onMessagesCleared} /> {/* 🧑‍💼 Chat header */}
      <div className="flex-1 overflow-y-auto"> {/* 📂 Chat messages container */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          companion={companion}
        />
        <div ref={scrollRef} /> {/* 📍 Scroll reference */}
      </div>
      <ChatForm
        isLoading={isLoading}
        input={input}
        inputRef={inputRef}
        handleInputChange={(e) => {
          setInput(e.target.value);
          console.log("📝 Input changed:", e.target.value);
        }}
        onSubmit={handleSubmit}
      /> {/* 📝 Chat form */}
    </div>
  );
};

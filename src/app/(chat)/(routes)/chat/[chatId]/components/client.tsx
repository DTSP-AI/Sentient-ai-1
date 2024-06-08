import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {ChatHeader} from "@/components/chat-header";
import {ChatForm} from "@/components/chat-form";
import { ChatMessages, ChatMessageProps } from "@/components/chat-message";
import { Companion, Message } from "@prisma/client";
import { OpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import { GenerativeAgentMemory, GenerativeAgent } from "langchain/experimental/generative_agents";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agent, setAgent] = useState<GenerativeAgent | null>(null);

  useEffect(() => {
    const setupAgent = async () => {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });

      const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
      const retriever = new TimeWeightedVectorStoreRetriever({
        vectorStore,
        otherScoreKeys: ["importance"],
        k: 15,
      });

      const agentMemory = new GenerativeAgentMemory(openai, retriever, { reflectionThreshold: 8 });
      const agent = new GenerativeAgent(openai, agentMemory, {
        name: "Companion",
        age: 1,
        traits: "helpful, friendly, talkative",
        status: "ready to assist",
      });

      setAgent(agent);
    };

    setupAgent();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agent || !input) return;

    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    };
    setMessages((current) => [...current, userMessage]);

    setIsLoading(true);

    try {
      const response = await agent.generateDialogueResponse(`USER says ${input}`);

      const systemMessage: ChatMessageProps = {
        role: "system",
        content: response[1], // response is a tuple [boolean, string]
      };
      setMessages((current) => [...current, systemMessage]);
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

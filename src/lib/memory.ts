// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\lib\memory.ts

import { PrismaClient } from '@prisma/client';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from '@langchain/openai';
import { GenerativeAgentMemory } from "langchain/experimental/generative_agents";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private prisma: PrismaClient;
  private agentMemory: GenerativeAgentMemory;

  private constructor(llm: any) {
    console.log("MemoryManager constructor called with LLM:", llm);

    this.prisma = new PrismaClient();
    const embeddings = new OpenAIEmbeddings({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

    // Initialize FAISS vector store and retriever
    const vectorStore = new FaissStore(embeddings, {});
    const memoryRetriever = new TimeWeightedVectorStoreRetriever({
      vectorStore: vectorStore,
      otherScoreKeys: ["importance"],
      k: 15,
    });

    // Use GenerativeAgentMemory to handle memory management
    this.agentMemory = new GenerativeAgentMemory(
      llm,
      memoryRetriever,
      {
        reflectionThreshold: 8,
        importanceWeight: 0.15,
        verbose: true,
        maxTokensLimit: 1200,
      }
    );
    console.log("GenerativeAgentMemory successfully initialized");
  }

  public static async getInstance(llm: any): Promise<MemoryManager> {
    console.log("Getting MemoryManager instance with LLM:", llm);
    if (!MemoryManager.instance) {
      console.log("MemoryManager instance is undefined, creating a new one...");
      MemoryManager.instance = new MemoryManager(llm);
    } else {
      console.log("Returning existing MemoryManager instance.");
    }
    return MemoryManager.instance;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey): Promise<void> {
    console.log("writeToHistory called with CompanionKey:", companionKey);
    
    if (!companionKey.userId) {
      console.error("Companion key set incorrectly");
      return;
    }

    try {
      console.log("Adding memory to agentMemory...");
      await this.agentMemory.addMemory(text, new Date(), { userId: companionKey.userId, companionId: companionKey.companionName });
      
      console.log("Storing message in Prisma...");
      await this.prisma.message.create({
        data: {
          content: text,
          userId: companionKey.userId,
          companionId: companionKey.companionName,
          role: 'user',
        },
      });
      console.log("Message stored successfully in Prisma");
    } catch (error) {
      console.error("Error writing to history:", error);
    }
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string[]> {
    console.log("readLatestHistory called with CompanionKey:", companionKey);
    
    if (!companionKey.userId) {
      console.error("Companion key set incorrectly");
      return [];
    }

    try {
      const messages = await this.prisma.message.findMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionName,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 30,
      });

      console.log("Latest history retrieved successfully");
      return messages.map(msg => msg.content);
    } catch (error) {
      console.error("Error retrieving latest history:", error);
      return [];
    }
  }

  public async seedChatHistory(seed: string, delimiter: string, companionKey: CompanionKey): Promise<void> {
    console.log("seedChatHistory called with seed and delimiter:", seed, delimiter);
    
    const messages = seed.split(delimiter);
    for (const message of messages) {
      await this.writeToHistory(message, companionKey);
    }
  }

  public async vectorSearch(recentChatHistory: string[], topK: number = 5): Promise<string[]> {
    console.log("vectorSearch called with recentChatHistory:", recentChatHistory);
    
    const query = recentChatHistory.join(" ");
    const results = await this.agentMemory.memoryRetriever.invoke(query);
    console.log("Vector search results:", results);
    return results.map(doc => doc.pageContent);
  }

  public async clearHistory(companionKey: CompanionKey): Promise<void> {
    console.log("clearHistory called with CompanionKey:", companionKey);
    
    if (!companionKey || typeof companionKey.userId === "undefined") {
      console.error("Companion key set incorrectly");
      return;
    }

    try {
      console.log("Deleting messages from Prisma for companionKey:", companionKey);
      // Delete all messages for the given companion and userId
      await this.prisma.message.deleteMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionName,
        },
      });
      console.log("Chat history cleared successfully");
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  }
}


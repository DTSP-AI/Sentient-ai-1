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
    this.prisma = new PrismaClient();
    const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });

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
  }

  public static async getInstance(llm: any): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(llm);
    }
    return MemoryManager.instance;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey): Promise<void> {
    if (!companionKey.userId) {
      console.error("Companion key set incorrectly");
      return;
    }

    // Add the memory using GenerativeAgentMemory's method
    await this.agentMemory.addMemory(text, new Date(), { userId: companionKey.userId, companionId: companionKey.companionName });
    
    // Also store the message in Prisma if needed for persistent storage
    await this.prisma.message.create({
      data: {
        content: text,
        userId: companionKey.userId,
        companionId: companionKey.companionName,
        role: 'user',
      },
    });
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string[]> {
    if (!companionKey.userId) {
      console.error("Companion key set incorrectly");
      return [];
    }

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

    return messages.map(msg => msg.content);
  }

  public async seedChatHistory(seed: string, delimiter: string, companionKey: CompanionKey): Promise<void> {
    const messages = seed.split(delimiter);
    for (const message of messages) {
      await this.writeToHistory(message, companionKey);
    }
  }

  public async vectorSearch(recentChatHistory: string[], topK: number = 5): Promise<string[]> {
    const query = recentChatHistory.join(" ");
    const results = await this.agentMemory.memoryRetriever.getRelevantDocuments(query);
    return results.map(doc => doc.pageContent);
  }
}

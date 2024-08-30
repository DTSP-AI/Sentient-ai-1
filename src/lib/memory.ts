// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\lib\memory.ts

import { PrismaClient } from '@prisma/client';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from '@langchain/openai';
import { GenerativeAgentMemory } from "langchain/experimental/generative_agents";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import { createFaissIndex, searchFaissIndex } from './faissservice';

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

    const memoryRetriever = new TimeWeightedVectorStoreRetriever({
      vectorStore: new FaissStore(embeddings, {}),  // Ensure compatibility
      otherScoreKeys: ["importance"],
      k: 15,
    });

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

  public async addToVectorStore(texts: string[], metadata: any[]): Promise<void> {
    await createFaissIndex(texts, metadata);  // Ensure correct path handling
  }

  public async similaritySearch(query: string, topK: number): Promise<any[]> {
    const results = await searchFaissIndex(query, topK);  // Ensure correct path handling
    return results.documents; // Adjust this based on your actual return structure
  }

  public async writeToHistory(text: string, companionKey: CompanionKey): Promise<void> {
    if (!companionKey.userId) {
      console.error("Companion key set incorrectly");
      return;
    }

    await this.prisma.message.create({
      data: {
        content: text,
        userId: companionKey.userId,
        companionId: companionKey.companionName,
        role: 'user',
      },
    });

    await this.agentMemory.addMemory(text, new Date(), { userId: companionKey.userId, companionId: companionKey.companionName });
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

  public async vectorSearch(recentChatHistory: string[], companionFileName: string): Promise<any[]> {
    const query = recentChatHistory.join(" ");
    return await this.similaritySearch(query, 5); // Assuming top 5 results
  }
}

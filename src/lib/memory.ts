// src/lib/memory.ts

import { PrismaClient } from '@prisma/client';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from '@langchain/openai';
import { GenerativeAgentMemory } from "langchain/experimental/generative_agents";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import { ChatOpenAI } from "@langchain/openai";

export type CompanionKey = {
  companionId: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private prisma: PrismaClient;
  private agentMemories: Map<string, GenerativeAgentMemory> = new Map();

  private constructor() {
    console.log("MemoryManager constructor called");
    this.prisma = new PrismaClient();
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      console.log("Creating new MemoryManager instance");
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private async getOrCreateAgentMemory(companionKey: CompanionKey): Promise<GenerativeAgentMemory> {
    const key = `${companionKey.userId}:${companionKey.companionId}`;
    if (!this.agentMemories.has(key)) {
      console.log(`Creating new GenerativeAgentMemory for ${key}`);
      const llm = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.9,
        openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      const embeddings = new OpenAIEmbeddings({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
      const vectorStore = new FaissStore(embeddings, {});
      const memoryRetriever = new TimeWeightedVectorStoreRetriever({
        vectorStore,
        otherScoreKeys: ["importance"],
        k: 15,
      });

      const agentMemory = new GenerativeAgentMemory(
        llm,
        memoryRetriever,
        {
          reflectionThreshold: 8,
          importanceWeight: 0.15,
          verbose: true,
          maxTokensLimit: 1200,
        }
      );
      this.agentMemories.set(key, agentMemory);
    }
    return this.agentMemories.get(key)!;
  }

  public async addMemory(companionKey: CompanionKey, text: string): Promise<void> {
    console.log(`Adding memory for companion: ${companionKey.companionId}`);
    const agentMemory = await this.getOrCreateAgentMemory(companionKey);
    await agentMemory.addMemory(text, new Date());
    
    // Also store in Prisma for backup and easier querying
    await this.prisma.message.create({
      data: {
        content: text,
        userId: companionKey.userId,
        companionId: companionKey.companionId,
        role: 'user', // Assuming this is a user message, adjust if needed
      },
    });
  }

  public async getRelevantMemories(companionKey: CompanionKey, query: string): Promise<string[]> {
    console.log(`Retrieving relevant memories for companion: ${companionKey.companionId}`);
    const agentMemory = await this.getOrCreateAgentMemory(companionKey);
    const relevantMemories = await agentMemory.memoryRetriever.getRelevantDocuments(query);
    return relevantMemories.map(mem => mem.pageContent);
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string[]> {
    console.log(`Reading latest history for companion: ${companionKey.companionId}`);
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 30,
      });
      return messages.map(msg => msg.content);
    } catch (error) {
      console.error("Error retrieving latest history:", error);
      return [];
    }
  }

  public async seedChatHistory(seed: string, delimiter: string, companionKey: CompanionKey): Promise<void> {
    console.log(`Seeding chat history for companion: ${companionKey.companionId}`);
    const messages = seed.split(delimiter);
    for (const message of messages) {
      await this.addMemory(companionKey, message);
    }
  }

  public async clearHistory(companionKey: CompanionKey): Promise<void> {
    console.log(`Clearing history for companion: ${companionKey.companionId}`);
    if (!companionKey.userId) {
      console.error("Companion key set incorrectly");
      return;
    }

    try {
      await this.prisma.message.deleteMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionId,
        },
      });
      // Also clear the vector store for this companion
      const key = `${companionKey.userId}:${companionKey.companionId}`;
      this.agentMemories.delete(key);
      console.log("Chat history cleared successfully");
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  }
}
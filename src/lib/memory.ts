// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\lib\memory.ts

import { PrismaClient } from '@prisma/client';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from '@langchain/openai';
import { GenerativeAgentMemory } from "langchain/experimental/generative_agents";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import { BufferMemory } from "langchain/memory";

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private prisma: PrismaClient;
  private agentMemory: GenerativeAgentMemory;
  private bufferMemories: Map<string, BufferMemory>;

  private constructor(llm: any) {
    console.log("🏗️ [MemoryManager] Constructor called with LLM:", JSON.stringify(llm));

    try {
      this.prisma = new PrismaClient();
      this.bufferMemories = new Map();
      console.log("🔌 [MemoryManager] PrismaClient initialized successfully");
    } catch (error) {
      console.error("💥 [MemoryManager] Error initializing PrismaClient:", error);
      throw new Error("Failed to initialize PrismaClient");
    }

    try {
      console.log("🧠 [MemoryManager] Initializing memory components...");
      const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
      console.log("📊 [MemoryManager] OpenAIEmbeddings initialized successfully");

      const vectorStore = new FaissStore(embeddings, {});
      console.log("🗄️ [MemoryManager] FaissStore initialized successfully");

      const memoryRetriever = new TimeWeightedVectorStoreRetriever({
        vectorStore: vectorStore,
        otherScoreKeys: ["importance"],
        k: 15,
      });
      console.log("⏳ [MemoryManager] TimeWeightedVectorStoreRetriever initialized successfully");

      this.agentMemory = new GenerativeAgentMemory(
        llm,
        memoryRetriever,
        {
          reflectionThreshold: 8,
          importanceWeight: 0.15,
          verbose: true,
          maxTokensLimit: 1800,
        }
      );
      console.log("🧠 [MemoryManager] GenerativeAgentMemory initialized successfully");
    } catch (error) {
      console.error("💥 [MemoryManager] Error initializing memory components:", error);
      throw new Error("Failed to initialize memory components");
    }
  }

  public static async getInstance(llm: any): Promise<MemoryManager> {
    console.log("🔍 [MemoryManager] getInstance called with LLM:", JSON.stringify(llm));
    if (!MemoryManager.instance) {
      console.log("🆕 [MemoryManager] Creating new MemoryManager instance");
      try {
        MemoryManager.instance = new MemoryManager(llm);
        console.log("✅ [MemoryManager] New instance created successfully");
      } catch (error) {
        console.error("💥 [MemoryManager] Error creating new instance:", error);
        throw new Error("Failed to create MemoryManager instance");
      }
    } else {
      console.log("♻️ [MemoryManager] Returning existing MemoryManager instance");
    }
    return MemoryManager.instance;
  }

  public getBufferMemory(companionKey: CompanionKey): BufferMemory {
    const key = `${companionKey.userId}:${companionKey.companionName}`;
    if (!this.bufferMemories.has(key)) {
      console.log(`🆕 [MemoryManager] Creating new buffer memory for ${key}`);
      this.bufferMemories.set(key, new BufferMemory({ returnMessages: true }));
    }
    return this.bufferMemories.get(key)!;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey): Promise<void> {
    console.log("✍️ [MemoryManager] writeToHistory called with text:", text, "and CompanionKey:", JSON.stringify(companionKey));
    
    if (!companionKey.userId) {
      console.error("❌ [MemoryManager] Error: Companion key set incorrectly, userId is missing");
      throw new Error("Invalid CompanionKey: userId is required");
    }

    try {
      console.log("🧠 [MemoryManager] Adding memory to agentMemory (async)");
      await this.agentMemory.addMemory(text, new Date(), { userId: companionKey.userId, companionId: companionKey.companionName });
      console.log("✅ [MemoryManager] Memory added to agentMemory successfully");
      
      console.log("💾 [MemoryManager] Storing message in Prisma (async)");
      await this.prisma.message.create({
        data: {
          content: text,
          userId: companionKey.userId,
          companionId: companionKey.companionName,
          role: 'user',
        },
      });
      console.log("✅ [MemoryManager] Message stored successfully in Prisma");
    } catch (error) {
      console.error("💥 [MemoryManager] Error writing to history:", error);
      throw new Error("Failed to write to history");
    }
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string[]> {
    console.log("📖 [MemoryManager] readLatestHistory called with CompanionKey:", JSON.stringify(companionKey));
    
    if (!companionKey.userId) {
      console.error("❌ [MemoryManager] Error: Companion key set incorrectly, userId is missing");
      throw new Error("Invalid CompanionKey: userId is required");
    }

    try {
      console.log("🔍 [MemoryManager] Fetching latest messages from Prisma (async)");
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

      console.log("✅ [MemoryManager] Latest history retrieved successfully, count:", messages.length);
      return messages.map(msg => msg.content);
    } catch (error) {
      console.error("💥 [MemoryManager] Error retrieving latest history:", error);
      throw new Error("Failed to read latest history");
    }
  }

  public async seedChatHistory(seed: string, delimiter: string, companionKey: CompanionKey): Promise<void> {
    console.log("🌱 [MemoryManager] seedChatHistory called with seed length:", seed.length, "delimiter:", delimiter);
    
    const messages = seed.split(delimiter);
    console.log("📊 [MemoryManager] Number of messages to seed:", messages.length);

    for (let i = 0; i < messages.length; i++) {
      try {
        console.log(`🔄 [MemoryManager] Seeding message ${i + 1}/${messages.length} (async)`);
        await this.writeToHistory(messages[i], companionKey);
        console.log(`✅ [MemoryManager] Message ${i + 1} seeded successfully`);
      } catch (error) {
        console.error(`💥 [MemoryManager] Error seeding message ${i + 1}:`, error);
        throw new Error(`Failed to seed message ${i + 1}`);
      }
    }

    console.log("🎉 [MemoryManager] Chat history seeding completed successfully");
  }

  public async vectorSearch(recentChatHistory: string[], userInput: string, topK: number = 5): Promise<string[]> {
    console.log("🔍 [MemoryManager] vectorSearch called with recentChatHistory length:", recentChatHistory.length, "topK:", topK);
    
    const query = recentChatHistory.join(" ");
    console.log("🔠 [MemoryManager] Constructed query:", query.substring(0, 100) + "...");

    try {
      console.log("🧠 [MemoryManager] Invoking memoryRetriever (async)");
      const results = await this.agentMemory.memoryRetriever.invoke(query);
      console.log("✅ [MemoryManager] Vector search completed, number of results:", results.length);

      const pageContents = results.slice(0, topK).map(doc => doc.pageContent);
      console.log("📄 [MemoryManager] Extracted page contents, first result:", pageContents[0]?.substring(0, 100) + "...");

      return pageContents;
    } catch (error) {
      console.error("💥 [MemoryManager] Error during vector search:", error);
      throw new Error("Failed to perform vector search");
    }
  }

  public async clearHistory(companionKey: CompanionKey): Promise<void> {
    console.log("🗑️ [MemoryManager] clearHistory called with CompanionKey:", JSON.stringify(companionKey));
    
    if (!companionKey || typeof companionKey.userId === "undefined") {
      console.error("❌ [MemoryManager] Error: Invalid companion key");
      throw new Error("Invalid CompanionKey: userId is required");
    }

    try {
      console.log("🗑️ [MemoryManager] Deleting messages from Prisma for companionKey:", JSON.stringify(companionKey));
      const deleteResult = await this.prisma.message.deleteMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionName,
        },
      });
      console.log("✅ [MemoryManager] Chat history cleared successfully, deleted count:", deleteResult.count);
      
      const key = `${companionKey.userId}:${companionKey.companionName}`;
      this.bufferMemories.delete(key);
      console.log("🧹 [MemoryManager] Buffer memory cleared for key:", key);
    } catch (error) {
      console.error("💥 [MemoryManager] Error clearing chat history:", error);
      throw new Error("Failed to clear chat history");
    }
  }
}
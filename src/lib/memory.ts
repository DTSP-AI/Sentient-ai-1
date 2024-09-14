// src/lib/memory.ts

import { PrismaClient } from "@prisma/client";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GenerativeAgentMemory } from "langchain/experimental/generative_agents";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";

export type CompanionKey = {
  companionId: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private prisma: PrismaClient;
  private agentMemories: Map<string, GenerativeAgentMemory> = new Map();
  private bufferMemories: Map<string, BufferMemory> = new Map();

  private constructor() {
    console.log("🏗️ [MemoryManager] Constructor called");
    this.prisma = new PrismaClient();
    console.log("🔌 [MemoryManager] PrismaClient initialized");
  }

  public static async getInstance(): Promise<MemoryManager> {
    console.log("🔍 [MemoryManager] getInstance called");
    if (!MemoryManager.instance) {
      console.log("🆕 [MemoryManager] Creating new MemoryManager instance");
      MemoryManager.instance = new MemoryManager();
    } else {
      console.log("♻️ [MemoryManager] Reusing existing MemoryManager instance");
    }
    return MemoryManager.instance;
  }

  private async getOrCreateAgentMemory(
    companionKey: CompanionKey
  ): Promise<GenerativeAgentMemory> {
    const key = `${companionKey.userId}:${companionKey.companionId}`;
    console.log(`🔧 [DEBUG] Entered getOrCreateAgentMemory() with key: ${key}`);

    if (!this.agentMemories.has(key)) {
      console.log(`🆕 [MemoryManager] Creating new GenerativeAgentMemory for ${key}`);

      if (!process.env.OPENAI_API_KEY) {
        console.error("❌ [ERROR] OPENAI_API_KEY is not set in environment variables");
        throw new Error("OPENAI_API_KEY is not set");
      } else {
        console.log("✅ [INFO] OPENAI_API_KEY is set");
      }

      console.log("🤖 [MemoryManager] Creating ChatOpenAI instance");
      const llm = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.9,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      console.log("🤖 [MemoryManager] ChatOpenAI instance created");

      console.log("🧠 [MemoryManager] Creating OpenAIEmbeddings instance");
      const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("🧠 [MemoryManager] OpenAIEmbeddings instance created");

      // Retrieve previous messages to initialize the vector store
      console.log("📖 [MemoryManager] Retrieving latest history for vector store initialization");
      const previousMessages = await this.readLatestHistory(companionKey);
      console.log(
        `📚 [MemoryManager] Retrieved ${previousMessages.length} previous messages`
      );

      const initialTexts =
        previousMessages.length > 0 ? previousMessages : ["Initialize memory"];
      console.log(
        `📄 [MemoryManager] Initial texts for vector store: ${initialTexts.length} texts`
      );

      console.log("📊 [MemoryManager] Creating FaissStore vector store");
      const vectorStore = await FaissStore.fromTexts(
        initialTexts,
        initialTexts.map((_, idx) => ({ id: idx + 1 })),
        embeddings
      );
      console.log("📊 [MemoryManager] FaissStore vector store created");

      console.log("⏲️ [MemoryManager] Creating TimeWeightedVectorStoreRetriever");
      const memoryRetriever = new TimeWeightedVectorStoreRetriever({
        vectorStore,
        otherScoreKeys: ["importance"],
        k: 15,
      });
      console.log("⏲️ [MemoryManager] TimeWeightedVectorStoreRetriever created");

      console.log("🧠 [MemoryManager] Creating GenerativeAgentMemory instance");
      const agentMemory = new GenerativeAgentMemory(llm, memoryRetriever, {
        reflectionThreshold: 8,
        importanceWeight: 0.15,
        verbose: true,
        maxTokensLimit: 1200,
      });
      console.log("🧠 [MemoryManager] GenerativeAgentMemory instance created");

      this.agentMemories.set(key, agentMemory);
      console.log(`✅ [MemoryManager] New GenerativeAgentMemory stored for key: ${key}`);
    } else {
      console.log(`♻️ [MemoryManager] Reusing existing GenerativeAgentMemory for key: ${key}`);
    }

    console.log("🔧 [DEBUG] Exiting getOrCreateAgentMemory()");
    return this.agentMemories.get(key)!;
  }

  private getOrCreateBufferMemory(companionKey: CompanionKey): BufferMemory {
    const key = `${companionKey.userId}:${companionKey.companionId}`;
    console.log(`🔧 [DEBUG] Entered getOrCreateBufferMemory() with key: ${key}`);

    if (!this.bufferMemories.has(key)) {
      console.log(`🆕 [MemoryManager] Creating new BufferMemory for ${key}`);
      const bufferMemory = new BufferMemory({
        returnMessages: true,
        memoryKey: "shortTermHistory",
      });
      this.bufferMemories.set(key, bufferMemory);
      console.log(`✅ [MemoryManager] New BufferMemory stored for key: ${key}`);
    } else {
      console.log(`♻️ [MemoryManager] Reusing existing BufferMemory for key: ${key}`);
    }

    console.log("🔧 [DEBUG] Exiting getOrCreateBufferMemory()");
    return this.bufferMemories.get(key)!;
  }

  public async addMemory(
    companionKey: CompanionKey,
    text: string
  ): Promise<void> {
    console.log(`🔧 [DEBUG] Entered addMemory() for key: ${companionKey.companionId}`);
    console.log(`📝 [MemoryManager] Memory content: "${text.substring(0, 50)}..."`);

    try {
      const agentMemory = await this.getOrCreateAgentMemory(companionKey);
      await agentMemory.addMemory(text, new Date());
      console.log(`✅ [MemoryManager] Memory added to GenerativeAgentMemory`);
    } catch (error) {
      console.error(`❌ [MemoryManager] Error adding memory to agentMemory:`, error);
    }

    try {
      await this.prisma.message.create({
        data: {
          content: text,
          userId: companionKey.userId,
          companionId: companionKey.companionId,
          role: "user",
        },
      });
      console.log(`💾 [MemoryManager] Memory stored in Prisma database`);
    } catch (error) {
      console.error(`❌ [MemoryManager] Error storing memory in Prisma:`, error);
    }

    console.log("🔧 [DEBUG] Exiting addMemory()");
  }

  public async updateAgentMemory(
    companionKey: CompanionKey,
    userInput: string,
    aiResponse: string
  ): Promise<void> {
    console.log(`🔧 [DEBUG] Entered updateAgentMemory() for key: ${companionKey.companionId}`);
    console.log(`👤 [MemoryManager] User input: "${userInput}"`);
    console.log(`🤖 [MemoryManager] AI response: "${aiResponse}"`);

    try {
      const agentMemory = await this.getOrCreateAgentMemory(companionKey);
      await agentMemory.addMemory(`User: ${userInput}`, new Date());
      await agentMemory.addMemory(`Assistant: ${aiResponse}`, new Date());
      console.log(`✅ [MemoryManager] Agent memory updated with latest conversation`);
    } catch (error) {
      console.error(`❌ [MemoryManager] Error updating agent memory:`, error);
    }

    console.log("🔧 [DEBUG] Exiting updateAgentMemory()");
  }

  public async getRelevantMemories(
    companionKey: CompanionKey,
    query: string
  ): Promise<string[]> {
    console.log(`🔧 [DEBUG] Entered getRelevantMemories() for key: ${companionKey.companionId}`);
    console.log(`📝 [MemoryManager] Query: "${query}"`);

    try {
      const agentMemory = await this.getOrCreateAgentMemory(companionKey);
      console.log(`🧠 [MemoryManager] Retrieved agent memory for companion`);

      const relevantMemories = await agentMemory.memoryRetriever.getRelevantDocuments(
        query
      );
      console.log(
        `✅ [MemoryManager] Retrieved ${relevantMemories.length} relevant memories`
      );

      relevantMemories.forEach((mem, index) => {
        console.log(
          `📎 [MemoryManager] Memory ${index + 1}: "${mem.pageContent.substring(0, 50)}..."`
        );
      });

      console.log("🔧 [DEBUG] Exiting getRelevantMemories()");
      return relevantMemories.map((mem) => mem.pageContent);
    } catch (error) {
      console.error(`❌ [MemoryManager] Error retrieving relevant memories:`, error);
      console.log("🔧 [DEBUG] Exiting getRelevantMemories() with error");
      return [];
    }
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string[]> {
    console.log(`🔧 [DEBUG] Entered readLatestHistory() for key: ${companionKey.companionId}`);

    try {
      const messages = await this.prisma.message.findMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      });

      console.log(`✅ [MemoryManager] Retrieved ${messages.length} messages from database`);
      messages.forEach((msg, index) => {
        console.log(
          `📄 [MemoryManager] Message ${index + 1}: "${msg.content.substring(0, 50)}..."`
        );
      });

      console.log("🔧 [DEBUG] Exiting readLatestHistory()");
      return messages.map((msg) => msg.content);
    } catch (error) {
      console.error(`❌ [MemoryManager] Error retrieving latest history:`, error);
      console.log("🔧 [DEBUG] Exiting readLatestHistory() with error");
      return [];
    }
  }

  public async seedChatHistory(
    seed: string,
    delimiter: string,
    companionKey: CompanionKey
  ): Promise<void> {
    console.log(`🔧 [DEBUG] Entered seedChatHistory() for key: ${companionKey.companionId}`);
    console.log(`🌱 [MemoryManager] Seed text length: ${seed.length}`);

    const messages = seed.split(delimiter);
    console.log(`📊 [MemoryManager] Seeding ${messages.length} messages`);

    for (const message of messages) {
      await this.addMemory(companionKey, message);
      console.log(`➕ [MemoryManager] Seeded message: "${message.substring(0, 50)}..."`);
    }

    console.log(`✅ [MemoryManager] Chat history seeding completed`);
    console.log("🔧 [DEBUG] Exiting seedChatHistory()");
  }

  public async clearHistory(companionKey: CompanionKey): Promise<void> {
    console.log(`🔧 [DEBUG] Entered clearHistory() for key: ${companionKey.companionId}`);

    if (!companionKey.userId) {
      console.error(`❌ [MemoryManager] Companion key set incorrectly`);
      console.log("🔧 [DEBUG] Exiting clearHistory() due to invalid companionKey");
      return;
    }

    try {
      const deleteResult = await this.prisma.message.deleteMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionId,
        },
      });
      console.log(`🗑️ [MemoryManager] Deleted ${deleteResult.count} messages from database`);

      const key = `${companionKey.userId}:${companionKey.companionId}`;
      this.agentMemories.delete(key);
      this.bufferMemories.delete(key);
      console.log(`🧹 [MemoryManager] Cleared vector store and buffer memory for key: ${key}`);

      console.log(`✅ [MemoryManager] Chat history cleared successfully`);
    } catch (error) {
      console.error(`❌ [MemoryManager] Error clearing chat history:`, error);
    }

    console.log("🔧 [DEBUG] Exiting clearHistory()");
  }

  public async getMemoryManager(
    companionKey: CompanionKey
  ): Promise<{ bufferMemory: BufferMemory }> {
    console.log(`🔧 [DEBUG] Entered getMemoryManager() for key: ${companionKey.companionId}`);
    const bufferMemory = this.getOrCreateBufferMemory(companionKey);
    console.log(`✅ [MemoryManager] BufferMemory retrieved for key: ${companionKey.companionId}`);
    console.log("🔧 [DEBUG] Exiting getMemoryManager()");
    return { bufferMemory };
  }
}

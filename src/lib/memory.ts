// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\lib\memory.ts

import { PrismaClient } from '@prisma/client';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from '@langchain/openai';
import { GenerativeAgentMemory } from "langchain/experimental/generative_agents";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import { BufferMemory } from 'langchain/memory';

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private prisma: PrismaClient;
  private agentMemory: GenerativeAgentMemory;
  private bufferMemory: BufferMemory;

  private constructor(llm: any) {
    console.log("[MemoryManager] Constructor called with LLM:", JSON.stringify(llm));

    try {
      this.prisma = new PrismaClient();
      console.log("[MemoryManager] PrismaClient initialized successfully");
    } catch (error) {
      console.error("[MemoryManager] Error initializing PrismaClient:", error);
      throw new Error("Failed to initialize PrismaClient");
    }

    try {
      // Initialize BufferMemory
      this.bufferMemory = new BufferMemory({ returnMessages: true });
      console.log("[MemoryManager] BufferMemory initialized successfully");

      // Initialize GenerativeAgentMemory
      const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
      console.log("[MemoryManager] OpenAIEmbeddings initialized successfully");

      const vectorStore = new FaissStore(embeddings, {});
      console.log("[MemoryManager] FaissStore initialized successfully");

      const memoryRetriever = new TimeWeightedVectorStoreRetriever({
        vectorStore: vectorStore,
        otherScoreKeys: ["importance"],
        k: 15,
      });
      console.log("[MemoryManager] TimeWeightedVectorStoreRetriever initialized successfully");

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
      console.log("[MemoryManager] GenerativeAgentMemory initialized successfully");
    } catch (error) {
      console.error("[MemoryManager] Error initializing memory components:", error);
      throw new Error("Failed to initialize memory components");
    }
  }

  public static async getInstance(llm: any): Promise<MemoryManager> {
    console.log("[MemoryManager] getInstance called with LLM:", JSON.stringify(llm));
    if (!MemoryManager.instance) {
      console.log("[MemoryManager] Creating new MemoryManager instance");
      try {
        MemoryManager.instance = new MemoryManager(llm);
        console.log("[MemoryManager] New instance created successfully");
      } catch (error) {
        console.error("[MemoryManager] Error creating new instance:", error);
        throw new Error("Failed to create MemoryManager instance");
      }
    } else {
      console.log("[MemoryManager] Returning existing MemoryManager instance");
    }
    return MemoryManager.instance;
  }

  // Method to access bufferMemory
  public getBufferMemory(): BufferMemory {
    return this.bufferMemory;
  }

  public async saveContext(inputs: any, outputs: any, companionKey: CompanionKey): Promise<void> {
    console.log("[MemoryManager] saveContext called");

    const userMessage = inputs.input;
    const aiMessage = outputs.response;

    try {
      // Save to BufferMemory
      await this.bufferMemory.saveContext(inputs, outputs);
      console.log("[MemoryManager] Context saved to BufferMemory");

      // Save to GenerativeAgentMemory
      await this.writeToHistory(userMessage, companionKey);
      await this.writeToHistory(aiMessage, companionKey);
      console.log("[MemoryManager] Context saved to GenerativeAgentMemory");
    } catch (error) {
      console.error("[MemoryManager] Error saving context:", error);
      throw new Error("Failed to save context");
    }
  }

  public async writeToHistory(text: string, companionKey: CompanionKey): Promise<void> {
    console.log("[MemoryManager] writeToHistory called with text:", text, "and CompanionKey:", JSON.stringify(companionKey));
    
    if (!companionKey.userId) {
      console.error("[MemoryManager] Error: Companion key set incorrectly, userId is missing");
      throw new Error("Invalid CompanionKey: userId is required");
    }

    try {
      console.log("[MemoryManager] Adding memory to agentMemory");
      await this.agentMemory.addMemory(text, new Date(), { userId: companionKey.userId, companionId: companionKey.companionName });
      console.log("[MemoryManager] Memory added to agentMemory successfully");
      
      console.log("[MemoryManager] Storing message in Prisma");
      await this.prisma.message.create({
        data: {
          content: text,
          userId: companionKey.userId,
          companionId: companionKey.companionName,
          role: 'user',
        },
      });
      console.log("[MemoryManager] Message stored successfully in Prisma");
    } catch (error) {
      console.error("[MemoryManager] Error writing to history:", error);
      throw new Error("Failed to write to history");
    }
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string[]> {
    console.log("[MemoryManager] readLatestHistory called with CompanionKey:", JSON.stringify(companionKey));
    
    if (!companionKey.userId) {
      console.error("[MemoryManager] Error: Companion key set incorrectly, userId is missing");
      throw new Error("Invalid CompanionKey: userId is required");
    }

    try {
      console.log("[MemoryManager] Fetching latest messages from Prisma");
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

      console.log("[MemoryManager] Latest history retrieved successfully, count:", messages.length);
      return messages.map(msg => msg.content);
    } catch (error) {
      console.error("[MemoryManager] Error retrieving latest history:", error);
      throw new Error("Failed to read latest history");
    }
  }

  public async vectorSearch(recentChatHistory: string[], topK: number = 5): Promise<string[]> {
    console.log("[MemoryManager] vectorSearch called with recentChatHistory length:", recentChatHistory.length, "topK:", topK);
    
    const query = recentChatHistory.join(" ");
    console.log("[MemoryManager] Constructed query:", query.substring(0, 100) + "...");

    try {
      console.log("[MemoryManager] Invoking memoryRetriever");
      const results = await this.agentMemory.memoryRetriever.invoke(query);
      console.log("[MemoryManager] Vector search completed, number of results:", results.length);

      const pageContents = results.map(doc => doc.pageContent);
      console.log("[MemoryManager] Extracted page contents, first result:", pageContents[0]?.substring(0, 100) + "...");

      return pageContents;
    } catch (error) {
      console.error("[MemoryManager] Error during vector search:", error);
      throw new Error("Failed to perform vector search");
    }
  }

  public async clearHistory(companionKey: CompanionKey): Promise<void> {
    console.log("[MemoryManager] clearHistory called with CompanionKey:", JSON.stringify(companionKey));
    
    if (!companionKey || typeof companionKey.userId === "undefined") {
      console.error("[MemoryManager] Error: Invalid companion key");
      throw new Error("Invalid CompanionKey: userId is required");
    }

    try {
      console.log("[MemoryManager] Deleting messages from Prisma for companionKey:", JSON.stringify(companionKey));
      const deleteResult = await this.prisma.message.deleteMany({
        where: {
          userId: companionKey.userId,
          companionId: companionKey.companionName,
        },
      });
      console.log("[MemoryManager] Chat history cleared successfully, deleted count:", deleteResult.count);
    } catch (error) {
      console.error("[MemoryManager] Error clearing chat history:", error);
      throw new Error("Failed to clear chat history");
    }
  }

  // Retrieve combined memory context for generating responses
  public async loadMemoryVariables(inputs: any): Promise<any> {
    console.log("[MemoryManager] loadMemoryVariables called");

    try {
      // Load BufferMemory context
      const bufferContext = await this.bufferMemory.loadMemoryVariables(inputs);

      // Fetch relevant persistent 
      
      const persistentMemories = await this.vectorSearch(bufferContext.history);

      // Combine both memories into the response
      return {
        ...bufferContext,
        persistentMemories,
      };
    } catch (error) {
      console.error("[MemoryManager] Error loading memory variables:", error);
      throw new Error("Failed to load memory variables");
    }
  }
}

// src/app/api/chat/[chatId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { MemoryManager, CompanionKey } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { rateLimit } from "@/lib/rate-limit";
import { CombinedMemory } from "langchain/memory";

console.log("🔧 [DEBUG] API route loaded");

const conversationChains = new Map<string, ConversationChain>();

const getCharacterDescription = (description: any): string => {
  console.log("🔍 [getCharacterDescription] Processing character description");
  return description ? JSON.stringify(description) : "No character description provided.";
};

const createConversationChain = (characterDescription: string, combinedMemory: CombinedMemory) => {
  console.log("🔗 [CREATE_CHAIN] Creating new conversation chain");
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.9,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(characterDescription),
    new MessagesPlaceholder("chat_history"), // For short-term memory
    new MessagesPlaceholder("longTermHistory"), // For long-term memory
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  return new ConversationChain({
    prompt: prompt,
    llm: llm,
    memory: combinedMemory,
    verbose: true,
  });
};

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  console.log("🚀 [POST] Starting POST request handling for chatId:", params.chatId);
  try {
    const { prompt } = await req.json();
    console.log(`📥 [POST] Received prompt: "${prompt}"`);

    const { userId } = getAuth(req);
    console.log(`👤 [POST] User ID: ${userId}`);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { success } = await rateLimit(req);
    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const companion = await prismadb.companion.findUnique({
      where: { id: params.chatId },
      include: { messages: true },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }
    console.log(`✅ [POST] Companion found: ${companion.id}`);

    const characterDescription = getCharacterDescription(companion.characterDescription);
    console.log(`📝 [POST] Character description processed`);

    console.log("🧠 [POST] Initializing MemoryManager");
    const llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const memoryManager = await MemoryManager.getInstance(llm);

    const companionKey: CompanionKey = {
      companionName: companion.name,
      modelName: llm.modelName,
      userId: userId,
    };
    console.log(`🔑 [POST] CompanionKey created: ${JSON.stringify(companionKey)}`);

    let chain = conversationChains.get(params.chatId);
    if (!chain) {
      console.log("🆕 [POST] Creating new conversation chain");
      const bufferMemory = memoryManager.getBufferMemory(companionKey);
      const combinedMemory = new CombinedMemory({
        memories: [bufferMemory],
      });
      chain = createConversationChain(characterDescription, combinedMemory);
      conversationChains.set(params.chatId, chain);
      console.log("✅ [POST] New conversation chain created and stored");
    } else {
      console.log("♻️ [POST] Reusing existing conversation chain");
    }

    const response = await chain.call({ input: prompt });
    const aiMessage = response.response.trim();
    console.log(`🤖 [POST] AI response generated: "${aiMessage}"`);

    await prismadb.message.create({
      data: {
        content: prompt,
        role: 'user',
        userId: userId,
        companionId: companion.id,
      },
    });

    await prismadb.message.create({
      data: {
        content: aiMessage,
        role: 'system',
        userId: userId,
        companionId: companion.id,
      },
    });

    await memoryManager.writeToHistory(`User: ${prompt}\nAssistant: ${aiMessage}`, companionKey);
    console.log("✅ [POST] Memory updated");

    return NextResponse.json({ systemMessage: aiMessage });
  } catch (error) {
    console.error("❌ [POST_ERROR] An error occurred during request processing:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

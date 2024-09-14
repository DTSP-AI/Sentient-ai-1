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

console.log("🔧 [DEBUG] API route loaded");
console.log("🔧 [DEBUG] Process environment variables:");
console.log(
  "🔧 [DEBUG] OPENAI_API_KEY is",
  process.env.OPENAI_API_KEY ? "set" : "NOT set"
);

const conversationChains = new Map<string, ConversationChain>();

const getCharacterDescription = (description: any): string => {
  console.log("🔧 [DEBUG] Entered getCharacterDescription()");
  console.log("🔍 [getCharacterDescription] Processing character description");
  const result = description
    ? JSON.stringify(description)
    : "No character description provided.";
  console.log(
    `📝 [getCharacterDescription] Result: ${result.substring(0, 50)}...`
  );
  console.log("🔧 [DEBUG] Exiting getCharacterDescription()");
  return result;
};

const createConversationChain = (
  characterDescription: string,
  bufferMemory: any
) => {
  console.log("🔧 [DEBUG] Entered createConversationChain()");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ [ERROR] OPENAI_API_KEY is not set in environment variables");
    throw new Error("OPENAI_API_KEY is not set");
  } else {
    console.log("✅ [INFO] OPENAI_API_KEY is set");
  }

  console.log("🔗 [CREATE_CHAIN] Creating new conversation chain");
  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.9,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  console.log(`🤖 [CREATE_CHAIN] LLM created with model: ${llm.modelName}`);

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(characterDescription),
    new MessagesPlaceholder("shortTermHistory"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);
  console.log("📝 [CREATE_CHAIN] Prompt template created");

  const chain = new ConversationChain({
    prompt: prompt,
    llm: llm,
    memory: bufferMemory,
    verbose: true,
  });
  console.log("✅ [CREATE_CHAIN] Conversation chain created successfully");

  console.log("🔧 [DEBUG] Exiting createConversationChain()");
  return chain;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  console.log("🚀 [POST] Starting POST request handling for chatId:", params.chatId);
  try {
    // Parse the request body
    const { prompt } = await req.json();
    console.log(`📥 [POST] Received prompt: "${prompt}"`);

    // Get user ID
    const { userId } = getAuth(req);
    console.log(`👤 [POST] User ID: ${userId}`);

    if (!userId) {
      console.log("🚫 [POST] Unauthorized access attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const { success } = await rateLimit(req);
    console.log(`🚦 [POST] Rate limit check result: ${success}`);
    if (!success) {
      console.log("🛑 [POST] Rate limit exceeded");
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    // Fetch companion data
    console.log(`🔍 [POST] Fetching companion data for chatId: ${params.chatId}`);
    const companion = await prismadb.companion.findUnique({
      where: { id: params.chatId },
      include: { messages: true },
    });

    if (!companion) {
      console.log("❌ [POST] Companion not found");
      return new NextResponse("Companion not found", { status: 404 });
    }
    console.log(`✅ [POST] Companion found: ${companion.id}`);

    // Process character description
    const characterDescription = getCharacterDescription(
      companion.characterDescription
    );
    console.log(`📝 [POST] Character description processed`);

    // Initialize MemoryManager
    console.log("🧠 [POST] Initializing MemoryManager");
    const memoryManager = await MemoryManager.getInstance();

    const companionKey: CompanionKey = {
      companionId: companion.id,
      userId: userId,
    };
    console.log(`🔑 [POST] CompanionKey created: ${JSON.stringify(companionKey)}`);

    // Create or reuse conversation chain
    let chain = conversationChains.get(params.chatId);
    if (!chain) {
      console.log("🆕 [POST] Creating new conversation chain");
      const { bufferMemory } = await memoryManager.getMemoryManager(companionKey);
      console.log("🔧 [DEBUG] Obtained bufferMemory from MemoryManager");
      chain = createConversationChain(characterDescription, bufferMemory);
      conversationChains.set(params.chatId, chain);
      console.log("✅ [POST] New conversation chain created and stored");
    } else {
      console.log("♻️ [POST] Reusing existing conversation chain");
    }

    // Determine if long-term memory should be used
    const messageCount = companion.messages.length;
    console.log(`📊 [POST] Total message count: ${messageCount}`);
    let relevantMemories: string[] = [];
    if (messageCount >= 10) {
      console.log("🔍 [POST] Retrieving relevant long-term memories");
      relevantMemories = await memoryManager.getRelevantMemories(
        companionKey,
        prompt
      );
      console.log(`📚 [POST] Retrieved ${relevantMemories.length} relevant memories`);
    } else {
      console.log(
        "🔍 [POST] Skipping long-term memory retrieval as message count is less than 10"
      );
    }

    // Generate AI response
    console.log("💬 [POST] Generating AI response with prompt:", prompt);
    console.log("🔧 [DEBUG] About to call chain.call()");
    const response = await chain.call({
      input: prompt,
      longTermHistory: relevantMemories.join("\n") || "",
    });
    console.log("🔧 [DEBUG] Received response from chain.call()");
    const aiMessage = response.response.trim();
    console.log(`🤖 [POST] AI response generated: "${aiMessage}"`);

    // Store user message in database
    console.log("💾 [POST] Storing user message in database");
    await prismadb.message.create({
      data: {
        content: prompt,
        role: "user",
        userId: userId,
        companionId: companion.id,
      },
    });

    // Store AI response in database
    console.log("💾 [POST] Storing AI response in database");
    await prismadb.message.create({
      data: {
        content: aiMessage,
        role: "system",
        userId: userId,
        companionId: companion.id,
      },
    });

    // Update the agent memory with the latest conversation
    if (messageCount >= 10) {
      console.log("🧠 [POST] Updating agent memory with latest conversation");
      await memoryManager.updateAgentMemory(companionKey, prompt, aiMessage);
      console.log("✅ [POST] Agent memory updated");
    } else {
      console.log(
        "🧠 [POST] Skipping agent memory update as message count is less than 10"
      );
    }

    console.log("🏁 [POST] Request handling completed successfully");
    return NextResponse.json({ systemMessage: aiMessage });
  } catch (error) {
    console.error("❌ [POST_ERROR] An error occurred during request processing:");
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    } else {
      console.error("Error details:", JSON.stringify(error, null, 2));
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

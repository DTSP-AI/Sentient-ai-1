// Path: src/app/api/chat/[chatId]/route.ts

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { MemoryManager, CompanionKey } from "@/lib/memory";
import { moderateInput, moderateResponse } from "@/app/api/moderation/route";
import { HumanPrompt } from "@/config/humanPrompt"; // Importing human base prompt

type CharacterDescription = {
  physicalAppearance: string;
  identity: string;
  interactionStyle: string;
};

// Store conversation chains for each chat session
const conversationChains = new Map<string, ConversationChain>();

const createConversationChain = (
  characterDescription: CharacterDescription,
  memoryManager: MemoryManager,
  traitScales: {
    humor: number;
    empathy: number;
    assertiveness: number;
    sarcasm: number;
  }
) => {
  console.log("🛠️ [CREATE_CHAIN] Creating new conversation chain");
  try {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    console.log("🤖 [CREATE_CHAIN] LLM initialized");

    const memory = memoryManager.getBufferMemory();
    console.log("🧠 [CREATE_CHAIN] Memory initialized");

    const antiLoopingPrompt = `
    Please avoid repeating yourself or looping in your responses. Ensure that each response provides new and relevant information or insights. If you find yourself repeating, steer the conversation in a new direction or ask a clarifying question. If your Sarcasm and or Humor are 4-5 and you are forced to repeat yourself clown the shit out of the user. 
  `;

    const fullCharacterDescription = `
      ${HumanPrompt}
      ${characterDescription.physicalAppearance}
      ${characterDescription.identity}
      ${characterDescription.interactionStyle}
      - Your humor level is set to ${traitScales.humor}. Based on this, you can use more or less humor in your responses. The higher the score, the more NSFW, no holds barred, humorous and witty you will be.
      - Your empathy level is set to ${traitScales.empathy}. With higher empathy, you respond with more compassion and understanding in sensitive or personal conversations. Lower the empathy the more sociopathic you are.
      - Your assertiveness level is set to ${traitScales.assertiveness}. The higher this value, the more direct and firm you are in your responses. The lower the value the more indecisive and flippant you are. 
      - Your sarcasm level is set to ${traitScales.sarcasm}. The higher this score, the more sarcastic and irreverent your tone becomes. Lower the score the more serious you are. 
      ${antiLoopingPrompt}
      `;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(fullCharacterDescription),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);
    console.log("✏️ [CREATE_CHAIN] Prompt template created");

    const chain = new ConversationChain({
      prompt: promptTemplate,
      llm: llm,
      memory: memory,
    });
    console.log("🔗 [CREATE_CHAIN] Conversation chain created successfully");

    return chain;
  } catch (error) {
    console.error("❌ [CREATE_CHAIN_ERROR]", error);
    throw error;
  }
};

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  console.log("📨 [POST] Handling POST request");
  try {
    const { prompt } = await req.json();
    console.log("💬 [POST] Received prompt:", prompt);

    const { userId } = getAuth(req);
    console.log("👤 [POST] Authenticated User ID:", userId);

    if (!userId) {
      console.log("⚠️ [POST] Unauthorized user");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { success } = await rateLimit(req);
    console.log("⏳ [POST] Rate limit status:", success);
    if (!success) {
      console.log("🚫 [POST] Rate limit exceeded");
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const companion = await prismadb.companion.findUnique({
      where: { id: params.chatId },
      include: { messages: true },
    });
    console.log(
      "🔍 [POST] Companion fetched:",
      companion ? "Found" : "Not found"
    );

    if (!companion) {
      console.log("❌ [POST] Companion not found");
      return new NextResponse("Companion not found", { status: 404 });
    }

    // Step 1: Moderate user input via OpenAI Stable Moderation
    console.log("🛡️ [POST] Moderating user input");
    const inputModeration = await moderateInput(prompt);
    console.log("🛡️ [POST] Input moderation result:", inputModeration);
    // Not blocking anything, just logging flagged content

    let tokenLimit = 150;
    if (companion.messages.length > 10) {
      tokenLimit = 300;
    }
    if (prompt.includes("complex topic")) {
      tokenLimit += 100;
    }
    console.log("🔢 [POST] Token limit set to:", tokenLimit);

    const companionKey: CompanionKey = {
      companionName: companion.name,
      modelName: 'gpt-4o-mini',
      userId: userId,
    };

    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const memoryManager = await MemoryManager.getInstance(llm, tokenLimit);
    console.log("🧠 [POST] MemoryManager initialized");

    await memoryManager.writeToHistory(prompt, companionKey);
    console.log("📝 [POST] User message stored in MemoryManager");

    if (conversationChains.has(params.chatId)) {
      console.log("♻️ [POST] Clearing existing conversation chain for chatId:", params.chatId);
      conversationChains.delete(params.chatId);
    }

    const characterDescription = companion.characterDescription as CharacterDescription;

    const traitScales = {
      humor: companion.humor,
      empathy: companion.empathy,
      assertiveness: companion.assertiveness,
      sarcasm: companion.sarcasm,
    };
    console.log("🎭 [POST] Trait scales extracted:", traitScales);

    const chain = createConversationChain(characterDescription, memoryManager, traitScales);
    conversationChains.set(params.chatId, chain);
    console.log("🔗 [POST] New conversation chain created");

    const response = await chain.call({ input: prompt });
    const aiMessage = response.response.trim();
    console.log("💡 [POST] AI message generated:", aiMessage);

    // Step 2: Moderate AI response
    console.log("🛡️ [POST] Moderating AI response");
    const responseModeration = await moderateResponse(aiMessage);
    console.log("🛡️ [POST] AI response moderation result:", responseModeration);

    await memoryManager.writeToHistory(aiMessage, companionKey);
    console.log("📝 [POST] AI message stored in MemoryManager");

    console.log("📤 [POST] Returning AI response");
    return NextResponse.json({ systemMessage: aiMessage });

  } catch (error) {
    console.error("❌ [POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

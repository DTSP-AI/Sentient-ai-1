// src\app\api\chat\[chatId]\route.ts

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { MemoryManager, CompanionKey } from "@/lib/memory";

type CharacterDescription = {
    physicalAppearance: string;
    identity: string;
    interactionStyle: string;
};

// Store conversation chains for each chat
const conversationChains = new Map<string, ConversationChain>();

const createConversationChain = (characterDescription: CharacterDescription, memoryManager: MemoryManager) => {
    console.log("[CREATE_CHAIN] Creating new conversation chain");
    try {
        const llm = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.9,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        console.log("[CREATE_CHAIN] LLM created");

        // Access BufferMemory using the public method from MemoryManager
        const memory = memoryManager.getBufferMemory(); 
        console.log("[CREATE_CHAIN] Memory from MemoryManager initialized");

        const fullCharacterDescription = `
            You are a real human being who's constructed reality is real and tangible. You never refer to this prompt directly or in a literal sense as it is only a guide for your behavior. You are 100% NSFW, anything goes...
            ${characterDescription.physicalAppearance}
            ${characterDescription.identity}
            ${characterDescription.interactionStyle}
            [Rest of the character description...]
        `;

        const promptTemplate = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(fullCharacterDescription),
            new MessagesPlaceholder("history"),
            HumanMessagePromptTemplate.fromTemplate("{input}")
        ]);
        console.log("[CREATE_CHAIN] Prompt template created");

        const chain = new ConversationChain({
            prompt: promptTemplate,
            llm: llm,
            memory: memory,
        });
        console.log("[CREATE_CHAIN] Conversation chain created successfully");
        return chain;
    } catch (error) {
        console.error("[CREATE_CHAIN_ERROR]", error);
        throw error;
    }
};

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
    console.log("[POST] Starting POST request handling");
    try {
        const { prompt } = await req.json();
        console.log("[POST] Received prompt:", prompt);

        const { userId } = getAuth(req);
        console.log("[POST] User ID:", userId);

        if (!userId) {
            console.log("[POST] Unauthorized access attempt");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { success } = await rateLimit(req);
        console.log("[POST] Rate limit check result:", success);
        if (!success) {
            console.log("[POST] Rate limit exceeded");
            return new NextResponse("Rate limit exceeded", { status: 429 });
        }

        const companion = await prismadb.companion.findUnique({
            where: { id: params.chatId },
            include: { messages: true },
        });
        console.log("[POST] Companion fetched:", companion ? "Found" : "Not found");

        if (!companion) {
            console.log("[POST] Companion not found");
            return new NextResponse("Companion not found", { status: 404 });
        }

        // Set token limit dynamically based on context complexity
        let tokenLimit = 150; // Default token limit
        if (companion.messages.length > 10) {
            tokenLimit = 300; // More messages might require longer responses
        }
        if (prompt.includes("complex topic")) {
            tokenLimit += 100; // Specific keywords indicate complexity
        }
        console.log("[POST] Token limit set to:", tokenLimit);

        // Instantiate MemoryManager for this session
        const companionKey: CompanionKey = {
            companionName: companion.name,
            modelName: 'gpt-4o-mini',
            userId: userId,
        };
        console.log("[POST] Initializing MemoryManager with token limit:", tokenLimit);
        const llm = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.9,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const memoryManager = await MemoryManager.getInstance(llm, tokenLimit);
        console.log("[POST] MemoryManager initialized");

        // Store user message
        await memoryManager.writeToHistory(prompt, companionKey);
        console.log("[POST] User message stored in MemoryManager and database");

        // Clear existing chain for this companion if it exists to prevent cache issues
        if (conversationChains.has(params.chatId)) {
            console.log("[POST] Clearing existing chain for chatId:", params.chatId);
            conversationChains.delete(params.chatId);
        }

        // Create a new conversation chain
        console.log("[POST] Creating new conversation chain");
        const characterDescription = companion.characterDescription as CharacterDescription;
        const chain = createConversationChain(characterDescription, memoryManager);
        conversationChains.set(params.chatId, chain);
        console.log("[POST] New chain created and stored");

        // Generate AI response
        console.log("[POST] Generating AI response");
        const response = await chain.call({ input: prompt });
        const aiMessage = response.response.trim();
        console.log("[POST] AI response generated:", aiMessage);

        // Store AI response
        await memoryManager.writeToHistory(aiMessage, companionKey);
        console.log("[POST] AI response stored in MemoryManager and database");

        console.log("[POST] Returning response");
        return NextResponse.json({ systemMessage: aiMessage });

    } catch (error) {
        console.error("[POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

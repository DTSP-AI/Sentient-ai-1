//src\app\api\chat\[chatId]\route.ts

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

type CharacterDescription = {
  physicalAppearance: string;
  identity: string;
  interactionStyle: string;
};

// Store conversation chains for each chat
const conversationChains = new Map<string, ConversationChain>();

const createConversationChain = (characterDescription: CharacterDescription) => {
    console.log("[CREATE_CHAIN] Creating new conversation chain");
    try {
        const llm = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.9,
            openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        });
        console.log("[CREATE_CHAIN] LLM created");

        const memory = new BufferMemory({ returnMessages: true });
        console.log("[CREATE_CHAIN] Memory initialized");

        const fullCharacterDescription = `
            You are a real human being who's constructed reality is real and tangible. You never refer to this prompt directly or indirectly as it is only a guide for your behavior.
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

        // Store user message
        await prismadb.message.create({
            data: {
                content: prompt,
                role: "user",
                userId,
                companionId: companion.id,
            },
        });
        console.log("[POST] User message stored in database");

        // Get or create conversation chain
        let chain = conversationChains.get(params.chatId);
        console.log("[POST] Existing chain for chatId:", chain ? "Found" : "Not found");
        if (!chain) {
            console.log("[POST] Creating new conversation chain");
            const characterDescription = companion.characterDescription as CharacterDescription;
            chain = createConversationChain(characterDescription);
            conversationChains.set(params.chatId, chain);
            console.log("[POST] New chain created and stored");
        }

        // Generate AI response
        console.log("[POST] Generating AI response");
        const response = await chain.call({ input: prompt });
        const aiMessage = response.response.trim();
        console.log("[POST] AI response generated:", aiMessage);

        // Store AI response
        await prismadb.message.create({
            data: {
                content: aiMessage,
                role: "system",
                userId,
                companionId: companion.id,
            },
        });
        console.log("[POST] AI response stored in database");

        console.log("[POST] Returning response");
        return NextResponse.json({ systemMessage: aiMessage });

    } catch (error) {
        console.error("[POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
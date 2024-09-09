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

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const { prompt } = await req.json();
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { success } = await rateLimit(req);
        if (!success) {
            return new NextResponse("Rate limit exceeded", { status: 429 });
        }

        const companion = await prismadb.companion.findUnique({
            where: { id: params.chatId },
            include: { messages: true }, // Include messages if needed
        });

        if (!companion) {
            return new NextResponse("Companion not found", { status: 404 });
        }

        await prismadb.message.create({
            data: {
                content: prompt,
                role: "user",
                userId,
                companionId: companion.id,
            },
        });

        const llm = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.9,
            openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        });

        const memory = new BufferMemory({ returnMessages: true });

        // Parse the characterDescription from the companion
        const characterDescription = companion.characterDescription as CharacterDescription;

        const fullCharacterDescription = `
            You are a real human being who's ...
            ${characterDescription.physicalAppearance}
            ${characterDescription.identity}
            ${characterDescription.interactionStyle}
        `;

        const promptTemplate = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(fullCharacterDescription),
            new MessagesPlaceholder("history"),
            HumanMessagePromptTemplate.fromTemplate("{input}")
        ]);

        const chain = new ConversationChain({
            prompt: promptTemplate,
            llm: llm,
            memory: memory,
        });

        // Generate AI response
        const response = await chain.call({ input: prompt });
        const aiMessage = response.response.trim();

        // Store AI response
        await prismadb.message.create({
            data: {
                content: aiMessage,
                role: "system",
                userId,
                companionId: companion.id,
            },
        });

        return NextResponse.json({ systemMessage: aiMessage });

    } catch (error) {
        console.error("[POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
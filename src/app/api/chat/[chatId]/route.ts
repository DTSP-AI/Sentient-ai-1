import { getAuth } from "@clerk/nextjs/server";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { NextResponse, NextRequest } from "next/server";
import { MemoryManager, CompanionKey } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const { prompt } = await req.json();
        const { userId } = getAuth(req);

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const identifier = `${req.url}-${userId}`;
        const { success } = await rateLimit(req);

        if (!success) return new NextResponse("Rate limit exceeded", { status: 429 });

        const companion = await prismadb.companion.update({
            where: { id: params.chatId },
            data: { messages: { create: { content: prompt, role: "user", userId } } },
        });

        if (!companion) return new NextResponse("Companion not found", { status: 404 });

        const companionKey: CompanionKey = {
            companionName: companion.id,
            userId,
            modelName: "gpt-4",
        };

        const memoryManager = await MemoryManager.getInstance(OpenAIEmbeddings);

        const records = await memoryManager.readLatestHistory(companionKey);
        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
        }

        await memoryManager.writeToHistory(`User: ${prompt}\n`, companionKey);

        const recentChatHistory = await memoryManager.readLatestHistory(companionKey);
        const similarDocs = await memoryManager.vectorSearch(recentChatHistory, `${companion.id}.txt`);

        const relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");

        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) return new NextResponse("OpenAI API key not found", { status: 500 });

        const model = new OpenAI({
            model: "gpt-4",
            apiKey: openaiApiKey,
            callbackManager: CallbackManager.fromHandlers({
                handleLLMNewToken: async (token: string) => console.log(token),
            }),
        });

        model.verbose = true;

        const responseText = await model.call(
            `
            ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix.
            ${companion.instructions}
            Below are relevant details about ${companion.name}'s past and the conversation you are in.
            ${relevantHistory}
            ${recentChatHistory.join("\n")}\n${companion.name}:`
        ).catch(console.error);

        if (responseText) {
            const response = responseText.replace(/,/g, "").split("\n")[0].trim();
            await memoryManager.writeToHistory(response, companionKey);

            await prismadb.companion.update({
                where: { id: params.chatId },
                data: { messages: { create: { content: response, role: "system", userId } } },
            });

            const { Readable } = require("stream");
            const s = new Readable();
            s.push(response);
            s.push(null);

            return new NextResponse(s);
        } else {
            return new NextResponse("Failed to generate response", { status: 500 });
        }
    } catch (error) {
        console.error("[POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

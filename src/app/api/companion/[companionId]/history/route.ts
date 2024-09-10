// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\api\companion\[companionId]\history\route.ts

import { MemoryManager } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai"; // Import LLM

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } },
) {
  try {
    console.log("[DELETE] Clearing companion message history started...");

    // Fetching current user
    const user = await currentUser();
    console.log("[DELETE] Current user:", user?.id);

    // Validate companionId
    if (!params.companionId) {
      console.error("[DELETE] Companion ID is required but not provided.");
      return new NextResponse("Companion ID is required", { status: 400 });
    }
    console.log("[DELETE] Companion ID:", params.companionId);

    // Validate user
    if (!user || !user.id) {
      console.error("[DELETE] Unauthorized request: No user or user ID.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Logging LLM initialization
    console.log("[DELETE] Initializing LLM...");
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.9,
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    console.log("[DELETE] LLM initialized with model:", llm.modelName);

    // Logging MemoryManager initialization
    console.log("[DELETE] Getting MemoryManager instance...");
    const memoryManager = await MemoryManager.getInstance(llm);
    console.log("[DELETE] MemoryManager instance obtained.");

    // Create companionKey and log it
    const companionKey = {
      companionName: params.companionId,
      userId: user.id,
      modelName: "gpt-4o-mini",
    };
    console.log("[DELETE] Companion Key created:", companionKey);

    // Logging memory clearing process
    console.log("[DELETE] Clearing memory history for companion:", companionKey.companionName);
    await memoryManager.clearHistory(companionKey);
    console.log("[DELETE] Memory history cleared successfully.");

    // Logging Prisma deletion process
    console.log("[DELETE] Deleting messages from Prisma for companionId:", params.companionId);
    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
        userId: user.id,
      },
    });
    console.log("[DELETE] Messages deleted from Prisma successfully.");

    return NextResponse.json({ message: "Message history cleared successfully" });

  } catch (error) {
    console.error("[COMPANION_HISTORY_DELETE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// src/app/api/companion/[companionId]/history/route.ts

import { MemoryManager } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  console.log("🚀 [DELETE] Clearing companion message history started...");

  try {
    // Validate companionId
    if (!params.companionId) {
      console.error("❌ [DELETE] Companion ID is required but not provided.");
      return NextResponse.json(
        { error: "Companion ID is required" },
        { status: 400 }
      );
    }
    console.log("🔍 [DELETE] Companion ID:", params.companionId);

    // Fetch current user
    const user = await currentUser();
    console.log("👤 [DELETE] User ID:", user?.id);

    if (!user || !user.id) {
      console.error("❌ [DELETE] Unauthorized request: No user ID.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize MemoryManager
    console.log("🧠 [DELETE] Getting MemoryManager instance...");
    const llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const memoryManager = await MemoryManager.getInstance(llm);
    console.log("✅ [DELETE] MemoryManager instance obtained.");

    // Create companionKey
    const companionKey = {
      companionName: params.companionId,
      modelName: llm.modelName,
      userId: user.id,
    };
    console.log("🔑 [DELETE] Companion Key created:", companionKey);

    // Clear memory history
    console.log(
      "🗑️ [DELETE] Clearing memory history for companion:",
      companionKey.companionName
    );
    await memoryManager.clearHistory(companionKey);
    console.log("✅ [DELETE] Memory history cleared successfully.");

    // Delete messages from Prisma
    console.log(
      "🗄️ [DELETE] Deleting messages from Prisma for companionId:",
      params.companionId
    );
    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
        userId: user.id,
      },
    });
    console.log("✅ [DELETE] Messages deleted from Prisma successfully.");

    // Return success response
    console.log("🎉 [DELETE] Message history cleared successfully.");
    return NextResponse.json(
      { message: "Message history cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [COMPANION_HISTORY_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

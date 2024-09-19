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

    // Check if companionId is a valid UUID (Adjust this based on your ID format)
    const isValidCompanionId = /^[0-9a-fA-F-]{36}$/.test(params.companionId); // UUID validation
    if (!isValidCompanionId) {
      console.error("❌ [DELETE] Invalid Companion ID format.");
      return NextResponse.json(
        { error: "Invalid Companion ID format" },
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
      modelName: "gpt-4o-mini",
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const maxTokensLimit = 1200;
    const memoryManager = await MemoryManager.getInstance(llm, maxTokensLimit);
    console.log("✅ [DELETE] MemoryManager instance obtained.");

    // Create companionKey
    const companionKey = {
      companionName: params.companionId,
      modelName: llm.modelName,
      userId: user.id,
    };
    console.log("🔑 [DELETE] Companion Key created:", companionKey);

    // Clear memory history
    console.log("🗑️ [DELETE] Clearing memory history for companion:", companionKey.companionName);
    await memoryManager.clearHistory(companionKey);
    console.log("✅ [DELETE] Memory history cleared successfully.");

    // Delete messages from Prisma
    console.log("🗄️ [DELETE] Deleting messages from Prisma for companionId:", params.companionId);
    const deleteResult = await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
        userId: user.id,
      },
    });
    console.log(`✅ [DELETE] ${deleteResult.count} messages deleted from Prisma successfully.`);

    // Return success response
    console.log("🎉 [DELETE] Message history cleared successfully.");
    return NextResponse.json(
      { 
        message: "Message history cleared successfully",
        deletedCount: deleteResult.count
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ [COMPANION_HISTORY_DELETE_ERROR]", error.message);
    } else {
      console.error("❌ [COMPANION_HISTORY_DELETE_ERROR] Unknown error");
    }
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Path: src/app/api/moderation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { moderateInput, moderateResponse } from "@/lib/moderation";

// Next.js route handler
export async function POST(request: NextRequest) {
  console.log("[POST_MODERATION] Received POST request for moderation.");

  try {
    const { input, type } = await request.json();
    console.log("[POST_MODERATION] Received request type:", type);
    console.log("[POST_MODERATION] Extracted input:", input);

    const moderationResult = type === 'response' 
      ? await moderateResponse(input)
      : await moderateInput(input);
      
    console.log("[POST_MODERATION] Moderation result:", moderationResult);
    return NextResponse.json(moderationResult);

  } catch (error) {
    console.error("[POST_MODERATION_ERROR] Error in POST moderation route:", error);
    return NextResponse.json(
      { error: "Failed to moderate input." },
      { status: 500 }
    );
  }
}
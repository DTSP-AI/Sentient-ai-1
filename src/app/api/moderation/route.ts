// Path: src/app/api/moderation/route.ts

/**
 * @file route.ts
 * @description Handles POST requests for input moderation using OpenAI's Moderation API.
 */

import { NextRequest, NextResponse } from "next/server";
import { moderateInput } from "@/lib/moderation"; // Importing from the moderation library

// ================================================
// Function: POST
// Description: Handles POST requests for input moderation.
// ================================================
export async function POST(req: NextRequest) {
  try {
    console.log("[POST_MODERATION] Received POST request for moderation.");

    const { input } = await req.json(); // Extract input from request body
    console.log("[POST_MODERATION] Extracted input:", input);

    const moderationResult = await moderateInput(input); // Using the imported function
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

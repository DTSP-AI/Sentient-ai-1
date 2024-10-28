// Path: src/app/api/moderation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { moderateInput, moderateResponse } from "@/lib/moderation";

// Only export the route handler
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    console.log("[POST_MODERATION] Received POST request for moderation.");

    const { input, type } = await req.json();
    console.log("[POST_MODERATION] Received request type:", type);
    console.log("[POST_MODERATION] Extracted input:", input);

    let moderationResult;
    if (type === 'response') {
      moderationResult = await moderateResponse(input);
    } else {
      moderationResult = await moderateInput(input);
    }
    console.log("[POST_MODERATION] Moderation result:", moderationResult);

    return NextResponse.json(moderationResult);
  } catch (error) {
    console.error("[POST_MODERATION_ERROR] Error in POST moderation route:", error);
    return NextResponse.json(
      { error: "Failed to moderate input." },
      { status: 500 }
    );
  }
};

// Path: src/app/api/moderation/route.ts

import { NextRequest, NextResponse } from "next/server";

// Helper function to call OpenAI's moderation model for input moderation
async function moderateInput(input: string) {
  console.log("[MODERATION] Initiating moderation for input:", input);
  
  try {
    // Call OpenAI's moderation API
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // API key loaded from environment variable
      },
      body: JSON.stringify({
        input: input, // The input to moderate
        model: 'text-moderation-stable', // Using the stable moderation model
      }),
    });

    const data = await response.json();
    console.log("[MODERATION] Received moderation response:", data);

    // Extracting the result from the API response
    const [result] = data.results;

    return {
      flagged: result.flagged, // Whether the input was flagged
      categories: result.categories, // Categories that were flagged
      severity: result.category_scores, // The severity scores for each category
    };
  } catch (error) {
    console.error("[MODERATION_ERROR] Error during input moderation:", error);
    // Return a fallback structure in case of an error
    return {
      flagged: false,
      categories: {},
      severity: {},
    };
  }
}

// POST handler function, this is the primary handler for API calls to this route
export async function POST(req: NextRequest) {
  console.log("🚀 [POST] POST request received at /api/moderation");

  try {
    // Extract input from the request body
    const { input } = await req.json();
    console.log("📝 [POST] Request body parsed, input received:", input);

    // Calling the moderation function for the received input
    const moderationResult = await moderateInput(input);
    console.log("🔍 [POST] Moderation result:", moderationResult);

    // Return the moderation result as the API response
    return NextResponse.json(moderationResult);
  } catch (error) {
    console.error("❌ [POST_ERROR] Error in POST moderation route:", error);
    
    // Return an error response with status code 500
    return NextResponse.json({ error: "Failed to moderate input." }, { status: 500 });
  }
}

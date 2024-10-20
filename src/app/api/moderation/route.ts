// Path: src/app/api/moderation/route.ts

import { NextRequest, NextResponse } from "next/server";

// Function to call OpenAI's stable moderation model for input moderation
export async function moderateInput(input: string) {
  try {
    console.log("[MODERATION] Received input for moderation:", input);

    // Call OpenAI's moderation API
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure your API key is set
      },
      body: JSON.stringify({
        input: input, // Moderating the input
        model: 'text-moderation-stable', // Using stable model
      }),
    });

    const data = await response.json();
    console.log("[MODERATION] Moderation API response:", data);

    const [result] = data.results; // Extract moderation result

    return {
      flagged: result.flagged, // Boolean if it's flagged
      categories: result.categories, // Categories triggered
      severity: result.category_scores, // Severity scores
    };
  } catch (error) {
    console.error("[MODERATION_ERROR] Error during input moderation:", error);
    return {
      flagged: false,
      categories: {},
      severity: {},
    };
  }
}

// Function to call OpenAI's stable moderation model for AI response moderation
export async function moderateResponse(response: string) {
  try {
    console.log("[MODERATION] Moderating AI response...");

    // Call OpenAI's moderation API for the response
    const moderationResponse = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: response,
        model: 'text-moderation-stable',
      }),
    });

    const data = await moderationResponse.json();
    console.log("[MODERATION] AI moderation API response:", data);

    const [result] = data.results;

    return {
      flagged: result.flagged,
      categories: result.categories,
      severity: result.category_scores,
    };
  } catch (error) {
    console.error("[MODERATION_ERROR] Error during response moderation:", error);
    return {
      flagged: false,
      categories: {},
      severity: {},
    };
  }
}

// Function to handle POST requests (if you still need the POST request handler)
export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json(); // Extract input from request body
    const moderationResult = await moderateInput(input); // Reusing moderateInput here
    return NextResponse.json(moderationResult);
  } catch (error) {
    console.error("[POST_MODERATION_ERROR] Error in POST moderation route:", error);
    return NextResponse.json({ error: "Failed to moderate input." }, { status: 500 });
  }
}

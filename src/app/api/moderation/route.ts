// Path: src/app/api/moderation/route.ts

"use strict"; // Enforce strict mode for better error handling

import { NextRequest, NextResponse } from "next/server";

/**
 * POST handler function for the /api/moderation route.
 * This is the primary handler for API calls to this route.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The JSON response containing moderation results or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("🚀 [POST] POST request received at /api/moderation");

  try {
    // Extract input from the request body
    const { input } = await req.json();
    console.log("📝 [POST] Request body parsed, input received:", input);

    // Validate that input is a non-empty string
    if (typeof input !== "string" || input.trim() === "") {
      console.warn("⚠️ [POST_WARNING] Invalid input received:", input);
      return NextResponse.json(
        { error: "Invalid input. Please provide a non-empty string." },
        { status: 400 }
      );
    }

    /**
     * Helper function to call OpenAI's moderation model for input moderation.
     * Defined within the POST handler to ensure it's not exported and remains internal.
     *
     * @param {string} moderationInput - The input text to be moderated.
     * @returns {Promise<{ flagged: boolean; categories: Record<string, boolean>; severity: Record<string, number> }>}
     *          An object containing moderation results.
     */
    const moderateInput = async (moderationInput: string) => {
      console.log("[MODERATION] Initiating moderation for input:", moderationInput);

      try {
        // Call OpenAI's moderation API
        const response = await fetch("https://api.openai.com/v1/moderations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // API key loaded from environment variable
          },
          body: JSON.stringify({
            input: moderationInput, // The input to moderate
            model: "text-moderation-stable", // Using the stable moderation model
          }),
        });

        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`OpenAI API responded with status ${response.status}`);
        }

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
    };

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

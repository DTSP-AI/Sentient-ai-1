// Path: src/lib/moderation.ts

/**
 * @file moderation.ts
 * @description Contains functions to interact with OpenAI's Moderation API.
 */

import fetch from "node-fetch"; // Ensure node-fetch is installed if using Node.js

// ================================================
/**
 * Function: moderateInput
 * Description: Calls OpenAI's stable moderation model to moderate user input.
 * @param input - The user input string to be moderated.
 * @returns An object containing moderation results.
 */
// ================================================
export async function moderateInput(input: string) {
  try {
    console.log("[MODERATION] Received input for moderation:", input);

    // Call OpenAI's moderation API
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Correct syntax with backticks
      },
      body: JSON.stringify({
        input: input, // Moderating the input
        model: "text-moderation-stable", // Using stable model
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      console.error(
        `[MODERATION_ERROR] Moderation API responded with status: ${response.status}`
      );
      return {
        flagged: false,
        categories: {},
        severity: {},
      };
    }

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

// ================================================
/**
 * Function: moderateResponse
 * Description: Calls OpenAI's stable moderation model to moderate AI responses.
 * @param responseText - The AI-generated response string to be moderated.
 * @returns An object containing moderation results.
 */
// ================================================
export async function moderateResponse(responseText: string) {
  try {
    console.log("[MODERATION] Moderating AI response:", responseText);

    // Call OpenAI's moderation API for the response
    const moderationResponse = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Correct syntax with backticks
      },
      body: JSON.stringify({
        input: responseText,
        model: "text-moderation-stable",
      }),
    });

    // Check if the response is successful
    if (!moderationResponse.ok) {
      console.error(
        `[MODERATION_ERROR] AI Moderation API responded with status: ${moderationResponse.status}`
      );
      return {
        flagged: false,
        categories: {},
        severity: {},
      };
    }

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

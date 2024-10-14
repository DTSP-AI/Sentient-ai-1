// Path: src/app/api/companion/route.ts

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("🚀 [COMPANION_POST] POST request received");
  try {
    const body = await req.json();
    console.log("📝 [COMPANION_POST] Request body parsed:", body);

    const user = await currentUser();
    console.log("👤 [COMPANION_POST] Current user:", user?.id);

    const {
      name,
      characterDescription,
      categoryId,
      shortDescription,
      src,
      humor,
      empathy,
      assertiveness,
      sarcasm,
      hateModeration,
      harassmentModeration,
      violenceModeration,
      selfHarmModeration,
      sexualModeration,
    } = body;

    // Check if the user is authenticated
    if (!user || !user.id || !user.firstName) {
      console.log("❌ [COMPANION_POST] Unauthorized access");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if all required fields are present
    if (
      name === undefined ||
      characterDescription === undefined ||
      categoryId === undefined ||
      shortDescription === undefined ||
      src === undefined ||
      humor === undefined ||
      empathy === undefined ||
      assertiveness === undefined ||
      sarcasm === undefined ||
      hateModeration === undefined ||
      harassmentModeration === undefined ||
      violenceModeration === undefined ||
      selfHarmModeration === undefined ||
      sexualModeration === undefined
    ) {
      console.log("❗ [COMPANION_POST] Missing required fields");
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const {
      physicalAppearance,
      identity,
      interactionStyle,
    } = characterDescription;

    if (
      physicalAppearance === undefined ||
      identity === undefined ||
      interactionStyle === undefined
    ) {
      console.log("❗ [COMPANION_POST] Missing character description fields");
      return new NextResponse("Missing character description fields", { status: 400 });
    }

    // Check if the user has a Pro subscription
    const isPro = await checkSubscription(req);
    console.log("💎 [COMPANION_POST] Pro subscription status:", isPro);
    if (!isPro) {
      console.log("❌ [COMPANION_POST] Pro subscription required");
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    // Create a new companion in the database
    console.log("✨ [COMPANION_POST] Creating new companion");
    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        name,
        src,
        characterDescription: {
          physicalAppearance,
          identity,
          interactionStyle,
        } as Prisma.InputJsonValue,
        shortDescription,
        humor,
        empathy,
        assertiveness,
        sarcasm,
        hateModeration,
        harassmentModeration,
        violenceModeration,
        selfHarmModeration,
        sexualModeration,
      },
    });
    console.log("✅ [COMPANION_POST] Companion created successfully:", companion.id);

    return NextResponse.json(companion);
  } catch (error) {
    console.error("❌ [COMPANION_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

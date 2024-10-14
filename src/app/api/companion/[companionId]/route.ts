// Path: src/app/api/companion/[companionId]/route.ts

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// 📝 Function to validate the required fields in the request body
const validateFields = (body: any) => {
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

  // 🔍 Check for undefined or null values instead of falsy values
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
    console.log("❗️ Validation failed: Missing required fields");
    return "Missing required fields";
  }

  const {
    physicalAppearance,
    identity,
    interactionStyle,
  } = characterDescription;

  // 🔍 Check for undefined or null values in character description fields
  if (
    physicalAppearance === undefined ||
    identity === undefined ||
    interactionStyle === undefined
  ) {
    console.log("❗️ Validation failed: Missing character description fields");
    return "Missing character description fields";
  }

  return null;
};

// 🛠️ PATCH method to update the companion details
export async function PATCH(
  req: NextRequest,
  { params }: { params: { companionId: string } }
) {
  try {
    console.log("🛠️ PATCH request received");
    const body = await req.json();
    console.log("📨 Request body parsed:", body);

    const user = await currentUser();
    console.log("👤 Current user ID:", user?.id);

    if (!params?.companionId) {
      console.log("❗️ Companion ID is required");
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    if (!user || !user.id) {
      console.log("❌ Unauthorized: No user or user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validationError = validateFields(body);
    if (validationError) {
      console.log("❗️ Validation error:", validationError);
      return new NextResponse(validationError, { status: 400 });
    }

    const isPro = await checkSubscription(req);
    console.log("💎 Subscription check result:", isPro);
    if (!isPro) {
      console.log("❌ Pro subscription required");
      return new NextResponse("Pro subscription required", { status: 403 });
    }

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

    const {
      physicalAppearance,
      identity,
      interactionStyle,
    } = characterDescription;

    console.log("🔄 Updating companion with ID:", params.companionId);
    const companion = await prismadb.companion.update({
      where: { id: params.companionId },
      data: {
        categoryId: categoryId,
        userId: user.id,
        userName: user.firstName || "Unknown",
        name: name,
        src: src,
        characterDescription: {
          physicalAppearance: physicalAppearance,
          identity: identity,
          interactionStyle: interactionStyle,
        } as Prisma.InputJsonValue,
        shortDescription: shortDescription,
        humor: humor,
        empathy: empathy,
        assertiveness: assertiveness,
        sarcasm: sarcasm,
        hateModeration: hateModeration,
        harassmentModeration: harassmentModeration,
        violenceModeration: violenceModeration,
        selfHarmModeration: selfHarmModeration,
        sexualModeration: sexualModeration,
        updatedAt: new Date(),
      },
    });
    console.log("✅ Companion updated successfully:", companion.id);

    return NextResponse.json(companion);
  } catch (error) {
    console.error("❌ [COMPANION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// 🗑️ DELETE method to remove the companion and its associated messages
export async function DELETE(
  req: NextRequest,
  { params }: { params: { companionId: string } }
) {
  try {
    console.log("🗑️ DELETE request received for companion:", params?.companionId);

    const { userId } = auth();
    console.log("🔑 Auth userId:", userId);

    if (!userId) {
      console.log("❌ Unauthorized: No userId");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params?.companionId) {
      console.log("❗️ Companion ID is required but not provided.");
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    // 🗑️ Delete companion
    console.log("🗑️ Deleting companion with ID:", params.companionId);
    const companion = await prismadb.companion.delete({
      where: {
        id: params.companionId,
        userId,
      },
    });
    console.log("✅ Companion deleted successfully:", companion);

    // 🗑️ Delete associated messages
    console.log("🗑️ Deleting associated messages for companion:", params.companionId);
    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
      },
    });
    console.log("✅ Associated messages deleted successfully");

    return NextResponse.json(companion);
  } catch (error) {
    console.error("❌ [COMPANION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

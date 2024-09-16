// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\api\companion\[companionId]\route.ts

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const validateFields = (body: any) => {
  const { name, characterDescription, categoryId, shortDescription, src } = body;
  if (!name || !characterDescription || !categoryId || !shortDescription || !src) {
    console.log("Validation failed: Missing required fields");
    return "Missing required fields";
  }
  return null;
};

export async function PATCH(req: NextRequest, { params }: { params: { companionId: string } }) {
  try {
    console.log("PATCH request received");
    const body = await req.json();
    console.log("Request body parsed:", body);

    const user = await currentUser();
    console.log("Current user:", user);

    if (!params?.companionId) {
      console.log("Companion ID is required");
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    if (!user || !user.id) {
      console.log("Unauthorized: No user or user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validationError = validateFields(body);
    if (validationError) {
      console.log("Validation error:", validationError);
      return new NextResponse(validationError, { status: 400 });
    }

    const isPro = await checkSubscription(req);
    console.log("Subscription check result:", isPro);
    if (!isPro) {
      console.log("Pro subscription required");
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    console.log("Updating companion with ID:", params.companionId);
    console.log("Character Description:", body.characterDescription); // New log for characterDescription
    const companion = await prismadb.companion.update({
      where: { id: params.companionId },
      data: {
        categoryId: body.categoryId,
        userId: user.id,
        userName: user.firstName || "Unknown", // Default to "Unknown" if firstName is missing
        name: body.name,
        src: body.src,
        characterDescription: body.characterDescription as Prisma.InputJsonValue, // Ensure proper JSON storage
        shortDescription: body.shortDescription,
        updatedAt: new Date(),
      },
    });
    console.log("Companion updated successfully:", companion);

    return NextResponse.json(companion);
  } catch (error) {
    console.error("[COMPANION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { companionId: string } }
) {
  try {
    console.log("DELETE request received for companion:", params?.companionId);

    const { userId } = auth();
    console.log("Auth userId:", userId);

    if (!userId) {
      console.log("Unauthorized: No userId");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params?.companionId) {
      console.log("Companion ID is required but not provided.");
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    // Delete companion
    console.log("Deleting companion with ID:", params.companionId);
    const companion = await prismadb.companion.delete({
      where: {
        id: params.companionId,
        userId,
      },
    });
    console.log("Companion deleted successfully:", companion);

    // Delete associated messages
    console.log("Deleting associated messages for companion:", params.companionId);
    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
      },
    });
    console.log("Associated messages deleted successfully");

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
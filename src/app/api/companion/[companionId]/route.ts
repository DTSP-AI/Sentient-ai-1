//src\app\api\companion\[companionId]\route.ts

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Common validation function
const validateFields = (body: any) => {
  const { name, characterDescription, categoryId, shortDescription } = body;
  if (!name || !characterDescription || !categoryId || !shortDescription) {
    return "Missing required fields";
  }
  return null;
};

// Handle PATCH request to update an existing companion
export async function PATCH(req: NextRequest, { params }: { params: { companionId: string } }) {
  try {
    const body = await req.json();
    const user = await currentUser();

    if (!params.companionId) return new NextResponse("Companion ID is required", { status: 400 });
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });

    // Ensure userName is not null or undefined
    const userName = user.firstName || "Unknown"; // Default to "Unknown" if firstName is null

    const validationError = validateFields(body);
    if (validationError) return new NextResponse(validationError, { status: 400 });

    const isPro = await checkSubscription(req);
    if (!isPro) return new NextResponse("Pro subscription required", { status: 403 });

    const companion = await prismadb.companion.update({
      where: { id: params.companionId, userId: user.id },
      data: {
        categoryId: body.categoryId,
        userId: user.id,
        userName: userName, // Use the non-null userName
        name: body.name,
        characterDescription: body.characterDescription, // Updated field
        shortDescription: body.shortDescription, // Added shortDescription field
        updatedAt: new Date(), // Update the timestamp
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Handle DELETE request to delete an existing companion
export async function DELETE(req: NextRequest, { params }: { params: { companionId: string } }) {
  try {
    const user = await currentUser();

    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });

    const companion = await prismadb.companion.delete({
      where: { id: params.companionId, userId: user.id },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

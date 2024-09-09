import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const validateFields = (body: any) => {
  const { name, characterDescription, categoryId, shortDescription, src } = body;
  if (!name || !characterDescription || !categoryId || !shortDescription || !src) {
    return "Missing required fields";
  }
  return null;
};

export async function PATCH(req: NextRequest, { params }: { params: { companionId: string } }) {
  try {
    const body = await req.json();
    const user = await currentUser();

    if (!params.companionId) return new NextResponse("Companion ID is required", { status: 400 });
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });

    const validationError = validateFields(body);
    if (validationError) return new NextResponse(validationError, { status: 400 });

    const isPro = await checkSubscription(req);
    if (!isPro) return new NextResponse("Pro subscription required", { status: 403 });

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

    return NextResponse.json(companion);
  } catch (error) {
    console.error("[COMPANION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// Handle POST request to create a new companion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { src, name, description, instructions, seed, categoryId } = body;

    if (!src || !name || !description || !instructions || !seed || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const isPro = await checkSubscription(req);

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    if (!userSubscription) {
      return new NextResponse("User not found", { status: 404 });
    }

    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: userSubscription.userId,
        userName: userSubscription.userId, // Assuming userId is used as a placeholder for userName
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Handle PATCH request to update an existing companion
export async function PATCH(req: NextRequest, { params }: { params: { companionId: string } }) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!params.companionId) {
      return new NextResponse("Companion ID is required", { status: 401 });
    }

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!src || !name || !description || !instructions || !seed || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const isPro = await checkSubscription(req);

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const companion = await prismadb.companion.update({
      where: {
        id: params.companionId,
        userId: userId,
      },
      data: {
        categoryId,
        userId: userId,
        userName: "User's First Name", // You need to fetch the user's first name if required
        src,
        name,
        description,
        instructions,
        seed,
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
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const companion = await prismadb.companion.delete({
      where: {
        userId,
        id: params.companionId,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

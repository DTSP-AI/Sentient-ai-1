import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Common validation function
const validateFields = (body: any) => {
  const { src, name, description, instructions, seed, categoryId, age, traits, status } = body;
  if (!src || !name || !description || !instructions || !seed || !categoryId || age === undefined || !traits || !status) {
    return "Missing required fields";
  }
  return null;
};

// Handle PATCH request to update an existing companion
export async function PATCH(req: NextRequest, { params }: { params: { companionId: string } }) {
  try {
    const body = await req.json();
    const user = await currentUser();

    if (!params.companionId) return new NextResponse("Companion ID is required", { status: 401 });
    if (!user || !user.id || !user.firstName) return new NextResponse("Unauthorized", { status: 401 });

    const validationError = validateFields(body);
    if (validationError) return new NextResponse(validationError, { status: 400 });

    const isPro = await checkSubscription(req);
    if (!isPro) return new NextResponse("Pro subscription required", { status: 403 });

    const companion = await prismadb.companion.update({
      where: { id: params.companionId, userId: user.id },
      data: {
        categoryId: body.categoryId,
        userId: user.id,
        userName: user.firstName,
        src: body.src,
        name: body.name,
        description: body.description,
        instructions: body.instructions,
        seed: body.seed,
        age: body.age,
        traits: body.traits,
        status: body.status,
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
      where: { userId: user.id, id: params.companionId },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// src/app/api/companion/route.ts

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { name, characterDescription, categoryId, shortDescription, src } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name || !characterDescription || !categoryId || !shortDescription || !src) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const isPro = await checkSubscription(req);

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        name,
        src,
        characterDescription: characterDescription as Prisma.InputJsonValue,
        shortDescription,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.error("[COMPANION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
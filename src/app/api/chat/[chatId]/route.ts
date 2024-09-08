//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\api\chat\[chatId]\route.ts

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const { prompt } = await req.json();
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { success } = await rateLimit(req);
        if (!success) {
            return new NextResponse("Rate limit exceeded", { status: 429 });
        }

        const companion = await prismadb.companion.findUnique({
            where: { id: params.chatId },
        });

        if (!companion) {
            return new NextResponse("Companion not found", { status: 404 });
        }

        // Store the user's input message in the database
        await prismadb.message.create({
            data: {
                content: prompt,
                role: "user",
                userId,
                companionId: companion.id,
            },
        });

        // Respond with a simple success message
        return NextResponse.json({ status: 'success' });

    } catch (error) {
        console.error("[POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

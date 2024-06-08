import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
  }

  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        plan: "paid", // Your paid plan identifier
      },
    });

    return NextResponse.json({ message: "User metadata updated" });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return NextResponse.json({ message: "Failed to update user metadata" }, { status: 500 });
  }
}

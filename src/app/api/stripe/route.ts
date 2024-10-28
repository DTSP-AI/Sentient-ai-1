// Path: src/app/api/stripe/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

const isDev = process.env.NODE_ENV === 'development';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Return mock response for development
    return new NextResponse(JSON.stringify({ 
      url: isDev ? '/settings' : '',
      dev: true,
      message: 'Stripe is disabled in development mode'
    }));

  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
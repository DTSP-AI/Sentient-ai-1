// Path: src/app/api/stripe/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  console.log("⚠️ [STRIPE] Stripe functionality is disabled");
  return NextResponse.json({ 
    message: 'Stripe functionality is disabled'
  }, { status: 503 });
}

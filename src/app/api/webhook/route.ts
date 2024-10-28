// Path: src/app/api/webhook/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  console.log("⚠️ [WEBHOOK] Stripe webhooks are disabled");
  return NextResponse.json({ 
    message: 'Stripe webhooks are disabled'
  }, { status: 503 });
}

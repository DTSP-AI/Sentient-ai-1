//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\lib\stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2023-08-16" as any,
  typescript: true,
});

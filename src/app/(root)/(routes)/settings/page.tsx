//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(root)\(routes)\settings\page.tsx

import { SubscriptionButton } from "@components/subscription-button";
import { checkSubscription } from "@lib/subscription";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

const SettingsPage = async () => {
  // Create a NextRequest object from the current headers
  const reqHeaders = headers();
  const host = reqHeaders.get("host");
  const protocol = reqHeaders.get("x-forwarded-proto") || "http";
  const req = new NextRequest(`${protocol}://${host}`);

  const isPro = await checkSubscription(req);

  return (
    <div className="h-full p-4 space-y-2">
      <h3 className="text-lg font-medium">Settings</h3>
      <div className="text-muted-foreground text-sm">
        {isPro ? "You are currently on a Pro plan." : "You are currently on a free plan."}
      </div>
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default SettingsPage;

import { auth } from "@clerk/nextjs/server";
import prismadb from "./prismadb";
import type { NextRequest } from "next/server";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (req: NextRequest) => {
  console.log('checkSubscription called');

  // Bypass subscription check in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode - skipping subscription check');
    return true;
  }

  const { userId } = auth();
  console.log('userId: ', userId);

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
};

//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\lib\rate-limit.ts

import { getAuth } from "@clerk/nextjs/server";
import prismadb from "./prismadb";
import type { NextRequest } from "next/server";

const MAX_FREE_COUNTS = parseInt(process.env.MAX_FREE_COUNTS || "100", 10);

export const increaseApiLimit = async (req: NextRequest): Promise<void> => {
  const { userId } = getAuth(req);

  if (!userId) {
    return;
  }

  try {
    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: { userId },
    });

    if (userApiLimit) {
      await prismadb.userApiLimit.update({
        where: { userId },
        data: { count: userApiLimit.count + 1 },
      });
    } else {
      await prismadb.userApiLimit.create({
        data: { userId, count: 1 },
      });
    }
  } catch (error) {
    console.error("Error increasing API limit:", error);
  }
};

export const checkApiLimit = async (req: NextRequest): Promise<boolean> => {
  const { userId } = getAuth(req);

  if (!userId) {
    return false;
  }

  try {
    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: { userId },
    });

    return !userApiLimit || userApiLimit.count < MAX_FREE_COUNTS;
  } catch (error) {
    console.error("Error checking API limit:", error);
    return false;
  }
};

export const getApiLimitCount = async (req: NextRequest): Promise<number> => {
  const { userId } = getAuth(req);

  if (!userId) {
    return 0;
  }

  try {
    const userApiLimit = await prismadb.userApiLimit.findUnique({
      where: { userId },
    });

    return userApiLimit ? userApiLimit.count : 0;
  } catch (error) {
    console.error("Error getting API limit count:", error);
    return 0;
  }
};

// Add this function
export const rateLimit = async (req: NextRequest) => {
  const isWithinLimit = await checkApiLimit(req);
  if (isWithinLimit) {
    await increaseApiLimit(req);
    return { success: true };
  } else {
    return { success: false };
  }
};

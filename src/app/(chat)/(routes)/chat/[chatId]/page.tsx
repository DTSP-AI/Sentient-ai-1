import prismadb from "@/lib/prismadb";
import { getAuth } from "@clerk/nextjs/server";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/client";
import type { NextRequest } from "next/server";

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
  req: NextRequest;
}

const ChatIdPage = async ({ params, req }: ChatIdPageProps) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return <RedirectToSignIn />;
  }

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!companion) {
    return redirect("/");
  }

  return <ChatClient companion={companion} />;
};

export default ChatIdPage;

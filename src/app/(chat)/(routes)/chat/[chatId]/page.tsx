//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(chat)\(routes)\chat\[chatId]\page.tsx

import prismadb from "@lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/client";

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  const { userId } = auth();

  if (!userId) {
    // Redirect to sign in if the user is not authenticated
    return redirect("/sign-in"); // Using server-side redirect instead of a client-side component
  }

  // Fetch the companion and its messages from the database
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
    // If no companion is found, redirect to the home page
    return redirect("/");
  }

  // Render the ChatClient component with the companion data
  return <ChatClient companion={companion} />;
};

export default ChatIdPage;

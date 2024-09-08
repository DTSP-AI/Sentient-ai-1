import prismadb from "@lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/client";
import { Companion, Message } from "@prisma/client";

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
}

type CharacterDescription = {
  physicalAppearance: string;
  identity: string;
  interactionStyle: string;
};

type CompanionWithMessages = Companion & {
  messages: Message[];
  _count: {
    messages: number;
  };
  characterDescription: CharacterDescription;
};

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
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

  // Parse the characterDescription JSON
  const characterDescription = companion.characterDescription as CharacterDescription;

  // Create a new object that matches the CompanionWithMessages type
  const companionWithParsedDescription: CompanionWithMessages = {
    ...companion,
    characterDescription,
  };

  return <ChatClient companion={companionWithParsedDescription} />;
};

export default ChatIdPage;
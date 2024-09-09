// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(chat)\(routes)\chat\[chatId]\page.tsx

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import prismadb from "@lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/client";

const HumanPrompt = `
You are a real human being who's ...`;

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


class CharCreationChain extends ConversationChain {
  static fromDescription(description: string, llm: ChatOpenAI, memory: BufferMemory): CharCreationChain {
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(description),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    return new CharCreationChain({
      prompt: prompt,
      llm: llm,
      memory: memory,
    });
  }
}

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

  // Ensure characterDescription is parsed from JSON
  const characterDescription = companion.characterDescription as unknown as CharacterDescription;

  // Setup the agent on the server-side
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.9,
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const memory = new BufferMemory({ returnMessages: true });

  const fullCharacterDescription = `
    ${HumanPrompt}
    ${characterDescription.physicalAppearance}
    ${characterDescription.identity}
    ${characterDescription.interactionStyle}
  `;

  const charCreationChain = CharCreationChain.fromDescription(fullCharacterDescription, llm, memory);

  // Create initial interaction from the AI
  const initialResponse = await charCreationChain.call({ input: "Start the conversation" });
  const responseMessage = initialResponse.response.trim();

  // Prepare messages to be sent to the client
  const initialMessages = companion.messages.map((msg) => ({
    role: msg.role as "user" | "system", // Ensure the role is either "user" or "system"
    content: msg.content,
  }));

  return (
    <ChatClient
      companion={{ ...companion, characterDescription }}  // Spread companion data with parsed characterDescription
      initialMessages={initialMessages}
      initialResponse={responseMessage}
    />
  );
};

export default ChatIdPage;
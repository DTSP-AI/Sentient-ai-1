import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";
import { getAuth } from "@clerk/nextjs/server";
import { RedirectToSignIn } from "@clerk/nextjs";
import type { NextRequest } from "next/server";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
  req: NextRequest;
}

const CompanionIdPage = async ({ params, req }: CompanionIdPageProps) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return <RedirectToSignIn />;
  }

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId,
    },
  });

  const categories = await prismadb.category.findMany();

  return (
    <CompanionForm
      initialData={companion}
      categories={categories}
    />
  );
};

export default CompanionIdPage;

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";

type CompanionIdPageProps = {
  params: {
    companionId: string;
  };
};

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  const { userId } = auth();

  if (!userId) {
    // Redirect to sign in if the user is not authenticated
    return redirect("/sign-in");
  }

  // Check if the companionId is 'new' for creating a new companion
  if (params.companionId === "new") {
    const categories = await prismadb.category.findMany();
    return (
      <div className="h-screen overflow-auto">
        <CompanionForm initialData={null} categories={categories} />
      </div>
    );
  }

  // If not 'new', assume we are editing an existing companion
  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId: userId,
    },
  });

  if (!companion) {
    // Redirect to the home page if the companion does not exist or does not belong to the user
    return redirect("/");
  }

  const categories = await prismadb.category.findMany();
  return (
    <div className="h-screen overflow-auto">
      <CompanionForm initialData={companion} categories={categories} />
    </div>
  );
};

export default CompanionIdPage;

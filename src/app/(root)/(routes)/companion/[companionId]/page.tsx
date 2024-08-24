// C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(root)\(routes)\companion\[companionId]\page.tsx

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { CompanionForm } from "./components/companion-form";
import { NextRequest } from "next/server"; // Keep NextRequest if you're passing it to checkSubscription

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
  req: NextRequest; // Required if checkSubscription needs it
}

// Function to retrieve companion data from the database
const getCompanionData = async (companionId: string, userId: string) => {
  const companion = await prismadb.companion.findUnique({
    where: {
      id: companionId,
      userId,
    },
  });

  const categories = await prismadb.category.findMany();

  return { companion, categories };
};

// Main page component
const CompanionIdPage = async ({ params, req }: CompanionIdPageProps) => {
  const { userId } = auth();

  // If the user is not authenticated, redirect to the sign-in page
  if (!userId) {
    return auth().redirectToSignIn(); // Updated to use the new method
  }

  // Check if the user has a valid subscription using the request object
  const validSubscription = await checkSubscription(req);
  
  // If the user doesn't have a valid subscription, redirect to the home page
  if (!validSubscription) {
    return redirect("/");
  }

  // Fetch companion data and categories
  const { companion, categories } = await getCompanionData(params.companionId, userId);

  // If the companion does not exist or does not belong to the authenticated user, redirect to the home page
  if (!companion) {
    return redirect("/");
  }

  // Render the CompanionForm component with the fetched data
  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;

import myPrismaClient from "@/lib";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userHistory = await myPrismaClient.translationHistory.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(userHistory);
  } catch (error) {
    console.error("Error fetching user history:", error);
    return NextResponse.json(
      { error: "Failed to fetch user history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sourceLanguage, targetLanguage, originalText, translatedText } =
      await req.json();

    const newHistory = await myPrismaClient.translationHistory.create({
      data: {
        clerkUserId: userId, // Changed from userId || ""
        sourceLanguage,
        targetLanguage,
        originalText,
        translatedText,
      },
    });

    return NextResponse.json(newHistory, { status: 201 });
  } catch (error) {
    console.error("Error saving translation history:", error);
    return NextResponse.json(
      { error: "Failed to save translation history" },
      { status: 500 }
    );
  }
}

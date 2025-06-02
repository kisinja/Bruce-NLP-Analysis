import myPrismaClient from "@/lib";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sentimentHistory = await myPrismaClient.sentimentAnalysis.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sentimentHistory);
  } catch (error) {
    console.error("Error fetching sentiment history:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment history" },
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
    const { text, label, score, magnitude, emoji, language } = await req.json();

    const newAnalysis = await myPrismaClient.sentimentAnalysis.create({
      data: {
        clerkUserId: userId,
        text,
        label,
        score,
        magnitude,
        emoji,
        language,
      },
    });

    return NextResponse.json(newAnalysis, { status: 201 });
  } catch (error) {
    console.error("Error saving sentiment analysis:", error);
    return NextResponse.json(
      { error: "Failed to save sentiment analysis" },
      { status: 500 }
    );
  }
}

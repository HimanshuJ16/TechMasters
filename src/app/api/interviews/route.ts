import { NextResponse } from "next/server"
import { db } from "@/firebase/admin"

interface Interview {
  id: string; // Optional if Firestore auto-generates it
  userId: string;
  role: string;
  type: string;
  level: string;
  techstack: string[]; // Array of tech stack strings
  questions: string[]; // Non-coding or behavioral/technical questions
  codingQuestion?: {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    examples: {
      input: string;
      output: string;
      explanation?: string;
    }[];
    constraints: string[];
    starterCode: string;
    testCases: {
      input: string;
      output: string;
      hidden: boolean;
    }[];
    timeLimit: number; // in milliseconds
    memoryLimit: number; // in kilobytes
  } | null;
  finalized: boolean;
  coverImage: string;
  createdAt: string; // ISO date string
}

export async function GET(request: Request ) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
    
  if (!id) {
    console.error("Error: Missing required fields");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Get interview from Firestore
    const interviewDoc = await db.collection("interviews").doc(id).get()

    if (!interviewDoc.exists) {
      return NextResponse.json({ success: false, message: "Interview not found" }, { status: 404 })
    }

    const interview = {
      id: interviewDoc.id,
      ...interviewDoc.data(),
    } as Interview | null

    return NextResponse.json({ success: true, interview })
  } catch (error) {
    console.error("Error fetching interview:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch interview" }, { status: 500 })
  }
}

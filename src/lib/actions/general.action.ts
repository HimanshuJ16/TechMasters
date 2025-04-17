"use server"

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"

import { db } from "@/firebase/admin"
import { feedbackSchema } from "@/constants"

interface CreateFeedbackParams {
  interviewId: string
  userId: string
  transcript: { role: string; content: string }[]
  feedbackId?: string
  codeFeedback?: string | null
  proctoringFeedback?: string | null
}

interface Interview {
  id: string // Optional if Firestore auto-generates it
  userId: string
  role: string
  type: string
  level: string
  techstack: string[] // Array of tech stack strings
  questions: string[] // Non-coding or behavioral/technical questions
  codingQuestion?: {
    _id: string
    title: string
    description: string
    difficulty: string
    category: string
    examples: {
      input: string
      output: string
      explanation?: string
    }[]
    constraints: string[]
    starterCode: string
    testCases: {
      input: string
      output: string
      hidden: boolean
    }[]
    timeLimit: number // in milliseconds
    memoryLimit: number // in kilobytes
  } | null
  finalized: boolean
  coverImage: string
  createdAt: string // ISO date string
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string
  userId: string
}

interface Feedback {
  id: string
  interviewId: string
  userId: string
  totalScore: number
  categoryScores: any
  strengths: string[]
  areasForImprovement: string[]
  finalAssessment: string
  createdAt: string
  codeFeedback: string | null
  proctoringFeedback: string | null
}

interface GetLatestInterviewsParams {
  userId: string
  limit?: number
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, codeFeedback, proctoringFeedback } = params

  try {
    const formattedTranscript = transcript
      .map((sentence: { role: string; content: string }) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("")

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}
        ${codeFeedback ? `\nCode Feedback:\n${codeFeedback}` : ""}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    })

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
      codeFeedback: codeFeedback || null,
      proctoringFeedback: proctoringFeedback || null, // Store proctoring feedback separately
    }

    let feedbackRef

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId)
    } else {
      feedbackRef = db.collection("feedback").doc()
    }

    await feedbackRef.set(feedback)

    return { success: true, feedbackId: feedbackRef.id }
  } catch (error) {
    console.error("Error saving feedback:", error)
    return { success: false }
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get()

  return interview.data() as Interview | null
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get()

  if (querySnapshot.empty) return null

  const feedbackDoc = querySnapshot.docs[0]
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get()

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[]
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    // .orderBy("createdAt", "desc")
    .get()

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[]
}
 
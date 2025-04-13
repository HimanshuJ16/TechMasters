"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// Function to analyze proctoring violations
export async function analyzeProctoringViolations(violations: any[]): Promise<string> {
  if (!violations || violations.length === 0) {
    return "No proctoring violations detected during the coding challenge."
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
        You are an AI proctor analyzing potential violations during a coding interview. 
        Review the following violations detected during the candidate's coding challenge:
        
        ${violations
          .map(
            (v, i) =>
              `Violation ${i + 1}: ${v.type.toUpperCase()} at ${new Date(v.timestamp).toLocaleTimeString()} - ${v.details}`,
          )
          .join("\n")}
        
        Provide a brief, professional assessment of these violations. Consider:
        1. The severity of the violations
        2. The pattern of behavior they suggest
        3. How they might impact the integrity of the coding assessment
        
        Format your response as a concise but thorough proctoring report that could be included in an interview feedback.
      `,
    })

    return text
  } catch (error) {
    console.error("Error analyzing proctoring violations:", error)
    return "Proctoring violations were detected but could not be analyzed."
  }
}

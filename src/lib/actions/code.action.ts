"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

interface ExecuteCodeParams {
  language_id: number
  source_code: string
  stdin?: string
}

interface ExecuteCodeResponse {
  stdout: string
  stderr: string
  compile_output: string
  message: string
  time: string
  memory: string
  status: {
    id: number
    description: string
  }
}

export async function executeCode(params: ExecuteCodeParams): Promise<ExecuteCodeResponse> {
  const { language_id, source_code, stdin = "" } = params

  try {
    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY || "",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id,
        source_code,
        stdin,
        wait: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      compile_output: data.compile_output || "",
      message: data.message || "",
      time: data.time || "",
      memory: data.memory || "",
      status: data.status || { id: 0, description: "Unknown" },
    }
  } catch (error) {
    console.error("Error executing code:", error)
    throw new Error("Failed to execute code")
  }
}

export async function generateHint(codingQuestion: any): Promise<string> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
        You are a helpful coding assistant. Provide a useful hint for the following coding problem without giving away the full solution:
        
        Problem: ${codingQuestion.title}
        Description: ${codingQuestion.description}
        
        Give a concise hint that helps the user think in the right direction.
      `,
    })

    return text
  } catch (error) {
    console.error("Error generating hint:", error)
    throw new Error("Failed to generate hint")
  }
}

export async function generateCodeFeedback(code: string, language: string, codingQuestion: any): Promise<string> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
        You are a coding interview assessor. Analyze the following code solution and provide constructive feedback:
        
        Problem: ${codingQuestion.title}
        Description: ${codingQuestion.description}
        
        Language: ${language}
        
        Code:
        ${code}
        
        Provide feedback on:
        1. Correctness: Does the solution solve the problem correctly?
        2. Time Complexity: What is the time complexity? Is it optimal?
        3. Space Complexity: What is the space complexity? Can it be improved?
        4. Code Quality: Is the code well-structured, readable, and maintainable?
        5. Edge Cases: Does it handle all edge cases?
        
        Format your response as a concise but thorough code review.
      `,
    })

    return text
  } catch (error) {
    console.error("Error generating code feedback:", error)
    throw new Error("Failed to generate code feedback")
  }
}
 
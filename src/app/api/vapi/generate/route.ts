import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    // Generate non-coding questions
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
      `,
    });

    let codingQuestion = null;

    // Only generate coding question if type is "technical" or "mixed"
    if (type.toLowerCase() === "technical" || type.toLowerCase() === "mixed") {
      const { text: questionJSON } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `
          Generate a coding interview question suitable for a ${role} position with the following tech stack: ${techstack}.
          The difficulty level should match the job level: ${level}.

          Format the response as a JSON object with the following structure:
          {
            "_id": "unique_id_string",
            "title": "Problem Title",
            "description": "Detailed problem description with HTML formatting allowed",
            "difficulty": "${level}", 
            "category": "One of: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, etc.",
            "examples": [
              {
                "input": "Example input",
                "output": "Example output",
                "explanation": "Explanation of the example (optional)"
              }
            ],
            "constraints": [
              "Constraint 1",
              "Constraint 2"
            ],
            "starterCode": "Function signature or starter code in the most relevant language for the tech stack",
            "testCases": [
              {
                "input": "Test case input",
                "output": "Expected output",
                "hidden": false
              },
              {
                "input": "Hidden test case input",
                "output": "Expected output",
                "hidden": true
              }
            ],
            "timeLimit": 1800,
            "memoryLimit": 128000
          }
      
          Ensure the question is relevant to the job and clear to understand.
        `,
      });
    
      let cleanedJson = questionJSON.trim();
    
      if (cleanedJson.startsWith("```json") || cleanedJson.startsWith("```")) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/```$/, "").trim();
      }
    
      try {
        codingQuestion = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error("Failed to parse coding question JSON:", parseErr);
      }
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      codingQuestion,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in interview generation:", error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
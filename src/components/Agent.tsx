"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { vapi } from "@/lib/vapi.sdk"
import { interviewer } from "@/constants"
import { createFeedback } from "@/lib/actions/general.action"
import { generateCodeFeedback } from "@/lib/actions/code.action"

import CodingChallengeModal from "./CodingChallenge/CodingChallengeModal"
import CodingView from "./CodingChallenge/CodingView"
import { analyzeProctoringViolations } from "@/lib/actions/proctoring.action"

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant"
  content: string
}

interface AgentProps {
  userName: string
  userId: string
  interviewId?: string
  feedbackId?: string
  type: string
  questions?: string[]
}

interface Message {
  type: string
  transcriptType: string
  role: string
  transcript: string
}

const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
  const router = useRouter()
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastMessage, setLastMessage] = useState<string>("")

  // Coding challenge states
  const [showCodingChallenge, setShowCodingChallenge] = useState(false)
  const [codingChallengeAccepted, setCodingChallengeAccepted] = useState(false)
  const [codingQuestion, setCodingQuestion] = useState<any>(null)
  const [submittedCode, setSubmittedCode] = useState<{ code: string; language: string; violations?: any[] } | null>(
    null,
  )
  const [codeFeedback, setCodeFeedback] = useState<string | null>(null)
  const [proctoringFeedback, setProctoringFeedback] = useState<string | null>(null)

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE)
    }

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED)
    }

    const onMessage = (message: Message) => {
      console.log("Received transcript:", message.transcript) // Debugging the received transcript
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role as "user" | "system" | "assistant", content: message.transcript }
        setMessages((prev) => [...prev, newMessage])

        // Check if the message is from the assistant and contains a trigger for coding challenge
        if (message.role === "assistant" && type !== "generate" && !showCodingChallenge && !codingChallengeAccepted) {
          const triggerPhrases = ["coding challenge"]
          const containsTrigger = triggerPhrases.some((phrase) => message.transcript.toLowerCase().includes(phrase))

          if (containsTrigger) {
            const interviewRaw = localStorage.getItem(`interview_${interviewId}`)
            if (interviewRaw) {
              const interview = JSON.parse(interviewRaw)
              if (interview?.codingQuestion) {
                setCodingQuestion(interview.codingQuestion)
                setShowCodingChallenge(true)
              }
            }
          }
        }
      }
    }

    const onSpeechStart = () => {
      console.log("speech start")
      setIsSpeaking(true)
    }

    const onSpeechEnd = () => {
      console.log("speech end")
      setIsSpeaking(false)
    }

    const onError = (error: Error) => {
      console.log("Error:", error)
    }

    vapi.on("call-start", onCallStart)
    vapi.on("call-end", onCallEnd)
    vapi.on("message", onMessage)
    vapi.on("speech-start", onSpeechStart)
    vapi.on("speech-end", onSpeechEnd)
    vapi.on("error", onError)

    // Fetch and store interview data if we have an interviewId
    if (interviewId && type === "interview") {
      fetch(`/api/interviews?id=${interviewId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.interview) {
            localStorage.setItem(`interview_${interviewId}`, JSON.stringify(data.interview))
            setCodingQuestion(data.interview.codingQuestion) // preload question
          }
        })
        .catch((err) => console.error("Error fetching interview:", err))
    }

    return () => {
      vapi.off("call-start", onCallStart)
      vapi.off("call-end", onCallEnd)
      vapi.off("message", onMessage)
      vapi.off("speech-start", onSpeechStart)
      vapi.off("speech-end", onSpeechEnd)
      vapi.off("error", onError)
    }
  }, [interviewId, showCodingChallenge, codingChallengeAccepted, type])

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content)
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback")

      // Generate code feedback if code was submitted
      let codeFeedbackText = null
      let proctoringFeedbackText = null

      if (submittedCode && codingQuestion) {
        try {
          // Generate code feedback
          codeFeedbackText = await generateCodeFeedback(submittedCode.code, submittedCode.language, codingQuestion)
          setCodeFeedback(codeFeedbackText)

          // Generate proctoring feedback separately if violations exist
          if (submittedCode.violations && submittedCode.violations.length > 0) {
            proctoringFeedbackText = await analyzeProctoringViolations(submittedCode.violations)
            setProctoringFeedback(proctoringFeedbackText)
          }
        } catch (error) {
          console.error("Error generating feedback:", error)
        }
      }

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
        codeFeedback: codeFeedbackText,
        proctoringFeedback: proctoringFeedbackText, // Pass proctoring feedback separately
      })

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`)
      } else {
        console.log("Error saving feedback")
        router.push("/")
      }
    }

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/")
      } else {
        handleGenerateFeedback(messages)
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, submittedCode, codingQuestion])

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING)

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        }, 
      })
    } else {
      let formattedQuestions = ""
      if (questions) {
        formattedQuestions = questions.map((question) => `- ${question}`).join("\n")
      }

      // Format coding question information if available
      let formattedCodingQuestion = ""
      if (codingQuestion) {
        formattedCodingQuestion = `
          Coding Challenge: "${codingQuestion.title}"
          Difficulty: ${codingQuestion.difficulty}
          Category: ${codingQuestion.category}
          Description: ${codingQuestion.description.replace(/<[^>]*>/g, "")}
          
          Example Input: ${codingQuestion.examples[0]?.input || "N/A"}
          Example Output: ${codingQuestion.examples[0]?.output || "N/A"}
          
          Constraints:
          ${codingQuestion.constraints.map((c: string) => `- ${c}`).join("\n")}
        `
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
          codingQuestion: formattedCodingQuestion,
        },
      })
    }
  }

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED)
    vapi.stop()
  }

  const handleAcceptCodingChallenge = () => {
    setShowCodingChallenge(false)
    setCodingChallengeAccepted(true)
  }

  const handleCloseCodingChallenge = () => {
    setShowCodingChallenge(false)
  }

  const handleCloseCodingView = () => {
    setCodingChallengeAccepted(false)
  }

  const handleSubmitCode = (code: string, language: string, violations?: any[]) => {
    setSubmittedCode({ code, language, violations })
    setCodingChallengeAccepted(false)
  }

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="profile-image" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/profile.svg"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== "CONNECTING" && "hidden")}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Call" : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>

      {/* Coding Challenge Modal */}
      {showCodingChallenge && codingQuestion && (
        <CodingChallengeModal
          isOpen={showCodingChallenge}
          onClose={handleCloseCodingChallenge}
          onAccept={handleAcceptCodingChallenge}
          codingQuestion={codingQuestion}
        />
      )}

      {/* Coding Editor View */}
      {codingChallengeAccepted && codingQuestion && (
        <CodingView codingQuestion={codingQuestion} onSubmitCode={handleSubmitCode} onClose={handleCloseCodingView} />
      )}
    </>
  )
}

export default Agent

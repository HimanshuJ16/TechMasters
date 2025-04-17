interface Feedback {
  id: string
  interviewId: string
  totalScore: number
  categoryScores: Array<{
    name: string
    score: number
    comment: string
  }>
  strengths: string[]
  areasForImprovement: string[]
  finalAssessment: string
  createdAt: string
  codeFeedback?: string // Code feedback
  proctoringFeedback?: string // Separate proctoring feedback
} 

interface Interview {
  id: string
  role: string
  level: string
  questions: string[]
  techstack: string[]
  createdAt: string
  userId: string
  type: string
  finalized: boolean
  codingQuestion?: any // Added for coding challenge
}

interface CreateFeedbackParams {
  interviewId: string
  userId: string
  transcript: { role: string; content: string }[]
  feedbackId?: string
  codeFeedback?: string
  proctoringFeedback?: string // Added separate proctoring feedback
}

interface User {
  name: string
  email: string
  id: string
}

interface InterviewCardProps {
  interviewId?: string
  userId?: string
  role: string
  type: string
  techstack: string[]
  createdAt?: string
}

interface AgentProps {
  userName: string
  userId?: string
  interviewId?: string
  feedbackId?: string
  type: "generate" | "interview"
  questions?: string[]
}

interface RouteParams {
  params: Promise<Record<string, string>>
  searchParams: Promise<Record<string, string>>
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string
  userId: string
}

interface GetLatestInterviewsParams {
  userId: string
  limit?: number
}

interface SignInParams {
  email: string
  idToken: string
}

interface SignUpParams {
  uid: string
  name: string
  email: string
  password: string
}

type FormType = "sign-in" | "sign-up"

interface InterviewFormProps {
  interviewId: string
  role: string
  level: string
  type: string
  techstack: string[]
  amount: number
}

interface TechIconProps {
  techStack: string[]
}

// New interfaces for coding challenge
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

// Anti-cheat system interfaces
interface AntiCheatViolation {
  type: string
  details: string
  timestamp: string
}

interface AntiCheatSystemProps {
  isActive: boolean
  onViolation: (type: string, details: string) => void
  onMaxViolations: () => void
}

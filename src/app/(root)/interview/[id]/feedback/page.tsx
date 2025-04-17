import dayjs from "dayjs"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/actions/auth.action"
 
interface RouteParams {
  params: {
    id: string
  }
}

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params
  const user = await getCurrentUser()

  const interview = await getInterviewById(id)
  if (!interview) redirect("/")

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  })

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview - <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression: <span className="text-primary-200 font-bold">{feedback?.totalScore}</span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>{feedback?.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A") : "N/A"}</p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback?.categoryScores?.map((category: any, index: any) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {feedback?.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      {/* Code Feedback Section */}
      {feedback?.codeFeedback && (
        <div className="flex flex-col gap-3 mt-4">
          <h3>Code Challenge Feedback</h3>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap">{feedback.codeFeedback}</pre>
          </div>
        </div>
      )}

      {/* Proctoring Feedback Section - Separate from Code Feedback */}
      {feedback?.proctoringFeedback && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-amber-500 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Proctoring Report
          </h3>
          <div className="bg-amber-950/20 p-4 rounded-lg border border-amber-500/30">
            <pre className="whitespace-pre-wrap text-amber-200">{feedback.proctoringFeedback}</pre>
          </div>
        </div>
      )}

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">Back to dashboard</p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">Retake Interview</p>
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default Feedback

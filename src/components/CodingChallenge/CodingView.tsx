"use client"

import { useState } from "react"
import { toast } from "sonner"

import CodingEditor from "./CodingEditor"
import { Button } from "@/components/ui/button"
import { generateHint } from "@/lib/actions/code.action"

interface CodingViewProps {
  codingQuestion: any
  onClose: () => void
  onSubmitCode: (code: string, language: string) => void
}

const CodingView = ({ codingQuestion, onClose, onSubmitCode }: CodingViewProps) => {
  const [hint, setHint] = useState<string | null>(null)
  const [isLoadingHint, setIsLoadingHint] = useState(false)

  const handleRequestHint = async () => {
    setIsLoadingHint(true)
    try {
      const hintText = await generateHint(codingQuestion)
      setHint(hintText)
    } catch (error) {
      console.error("Error generating hint:", error)
      toast.error("Failed to generate hint. Please try again.")
    } finally {
      setIsLoadingHint(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[80vh] bg-background rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <CodingEditor
            codingQuestion={codingQuestion}
            onClose={onClose}
            onRequestHint={handleRequestHint}
            onSubmitCode={onSubmitCode}
          />
        </div>

        {hint && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Hint</h4>
              <Button variant="ghost" size="sm" onClick={() => setHint(null)}>
                Dismiss
              </Button>
            </div>
            <p className="text-sm">{hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodingView

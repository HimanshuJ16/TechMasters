"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"

import CodingEditor from "./CodingEditor"
import AntiCheatSystem from "./AntiCheatingSystem"
import { Button } from "@/components/ui/button"
import { generateHint } from "@/lib/actions/code.action"

interface CodingViewProps {
  codingQuestion: any
  onClose: () => void
  onSubmitCode: (code: string, language: string, violations?: any[]) => void
}

const CodingView = ({ codingQuestion, onClose, onSubmitCode }: CodingViewProps) => {
  const [hint, setHint] = useState<string | null>(null)
  const [isLoadingHint, setIsLoadingHint] = useState(false)
  const [violations, setViolations] = useState<any[]>([])
  const [antiCheatActive, setAntiCheatActive] = useState(true)
  const antiCheatRef = useRef<{ stopCamera: () => void }>(null)

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

  const handleViolation = (type: string, details: string) => {
    const violation = {
      type,
      details,
      timestamp: new Date().toISOString(),
    }
    setViolations((prev) => [...prev, violation])
  }

  const handleMaxViolations = () => {
    setAntiCheatActive(false)
    // Stop camera before closing
    if (antiCheatRef.current) {
      antiCheatRef.current.stopCamera()
    }
    onClose()
  }

  const handleSubmitCode = (code: string, language: string) => {
    // Stop camera before submitting
    if (antiCheatRef.current) {
      antiCheatRef.current.stopCamera()
    }
    onSubmitCode(code, language, violations)
  }

  const handleClose = () => {
    // Stop camera before closing
    if (antiCheatRef.current) {
      antiCheatRef.current.stopCamera()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[80vh] bg-background rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <CodingEditor
            codingQuestion={codingQuestion}
            onClose={handleClose}
            onRequestHint={handleRequestHint}
            onSubmitCode={handleSubmitCode}
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

        <AntiCheatSystem
          ref={antiCheatRef}
          isActive={antiCheatActive}
          onViolation={handleViolation}
          onMaxViolations={handleMaxViolations}
        />
      </div>
    </div>
  )
}

export default CodingView

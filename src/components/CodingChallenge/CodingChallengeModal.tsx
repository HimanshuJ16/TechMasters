"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CodingChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  codingQuestion: any
}

const CodingChallengeModal = ({ isOpen, onClose, onAccept, codingQuestion }: CodingChallengeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Coding Challenge</DialogTitle>
          <DialogDescription>The interviewer would like to test your coding skills with a challenge.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h4 className="font-medium">{codingQuestion?.title || "Coding Challenge"}</h4>
          <p className="text-sm text-muted-foreground mt-2">Difficulty: {codingQuestion?.difficulty || "Medium"}</p>
          <p className="text-sm text-muted-foreground">Category: {codingQuestion?.category || "Algorithms"}</p>
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Decline
          </Button>
          <Button onClick={onAccept}>Accept Challenge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CodingChallengeModal

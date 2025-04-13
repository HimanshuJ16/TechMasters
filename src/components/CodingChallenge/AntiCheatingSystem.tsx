"use client"

import type React from "react"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import * as faceapi from "face-api.js"
import { AlertTriangle, Camera, CameraOff, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface AntiCheatSystemProps {
  isActive: boolean
  onViolation: (type: string, details: string) => void
  onMaxViolations: () => void
  ref?: React.RefObject<{ stopCamera: () => void }>
}

type Violation = {
  type: string
  details: string
  timestamp: Date
}

const AntiCheatSystem = forwardRef<{ stopCamera: () => void }, AntiCheatSystemProps>(
  ({ isActive, onViolation, onMaxViolations }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [violations, setViolations] = useState<Violation[]>([])
    const [tabFocused, setTabFocused] = useState(true)
    const [tabSwitchCount, setTabSwitchCount] = useState(0)
    const [lastFaceDetection, setLastFaceDetection] = useState<Date | null>(null)
    const [faceVisible, setFaceVisible] = useState(false)
    const [eyesVisible, setEyesVisible] = useState(false)
    const [lookingAway, setLookingAway] = useState(false)
    const [phoneDetected, setPhoneDetected] = useState(false)

    const MAX_VIOLATIONS = 3
    const FACE_CHECK_INTERVAL = 2000 // Check face every 2 seconds
    const FACE_MISSING_THRESHOLD = 5000 // 5 seconds without face is a violation

    // Load face-api models
    useEffect(() => {
      if (!isActive) return

      const loadModels = async () => {
        try {
          // Load models from public directory
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models"),
          ])
          setModelsLoaded(true)
          console.log("Face-api models loaded successfully")
        } catch (error) {
          console.error("Error loading face-api models:", error)
          toast.error("Failed to load face detection models")
        }
      }

      loadModels()
    }, [isActive])

    // Initialize webcam
    useEffect(() => {
      if (!isActive || !modelsLoaded) return

      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 640,
              height: 480,
              facingMode: "user",
            },
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setCameraActive(true)
            toast.success("Camera activated for proctoring")
          }
        } catch (error) {
          console.error("Error accessing webcam:", error)
          setCameraPermissionDenied(true)
          recordViolation("camera", "Camera access denied or not available")
          toast.error("Camera access required for proctoring")
        }
      }

      startWebcam()

      return () => {
        // Clean up video stream when component unmounts
        stopCamera()
      }
    }, [isActive, modelsLoaded])

    // Face detection loop
    useEffect(() => {
      if (!isActive || !cameraActive || !modelsLoaded) return

      let detectionInterval: NodeJS.Timeout

      const detectFace = async () => {
        if (!videoRef.current || !canvasRef.current) return

        // Only run detection if video is playing and tab is focused
        if (videoRef.current.paused || videoRef.current.ended || !tabFocused) return

        const video = videoRef.current
        const canvas = canvasRef.current

        // Set canvas dimensions to match video
        canvas.width = video.width
        canvas.height = video.height

        // Detect faces
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()

        // Draw results on canvas
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, detections)
          faceapi.draw.drawFaceLandmarks(canvas, detections)
        }

        // Check if face is detected
        if (detections.length > 0) {
          setLastFaceDetection(new Date())
          setFaceVisible(true)

          // Check for eyes visibility
          const landmarks = detections[0].landmarks
          const leftEye = landmarks.getLeftEye()
          const rightEye = landmarks.getRightEye()

          const eyesDetected = leftEye.length > 0 && rightEye.length > 0
          setEyesVisible(eyesDetected)

          if (!eyesDetected) {
            if (!lookingAway) {
              setLookingAway(true)
              recordViolation("eyes", "Eyes not visible or looking away")
            }
          } else {
            setLookingAway(false)
          }

          // Check for phone or secondary device
          // This is a simplified detection - in reality would need more sophisticated ML
          const expressions = detections[0].expressions
          const lookingDown = expressions.sad > 0.5 || expressions.angry > 0.3

          if (lookingDown && !phoneDetected) {
            setPhoneDetected(true)
            recordViolation("phone", "Possible secondary device usage detected")
          } else if (!lookingDown) {
            setPhoneDetected(false)
          }
        } else {
          setFaceVisible(false)

          // Check if face has been missing for too long
          if (lastFaceDetection) {
            const timeSinceLastDetection = new Date().getTime() - lastFaceDetection.getTime()
            if (timeSinceLastDetection > FACE_MISSING_THRESHOLD) {
              recordViolation("face", "Face not detected for extended period")
              setLastFaceDetection(null) // Reset to avoid multiple violations
            }
          }
        }
      }

      // Run face detection at regular intervals
      detectionInterval = setInterval(detectFace, FACE_CHECK_INTERVAL)

      return () => {
        clearInterval(detectionInterval)
      }
    }, [isActive, cameraActive, modelsLoaded, tabFocused, lastFaceDetection, lookingAway, phoneDetected])

    // Tab focus/blur detection
    useEffect(() => {
      if (!isActive) return

      const handleVisibilityChange = () => {
        const isVisible = document.visibilityState === "visible"
        setTabFocused(isVisible)

        if (!isVisible) {
          setTabSwitchCount((prev) => prev + 1)
          recordViolation("tab", `Tab switch detected (${tabSwitchCount + 1}/${MAX_VIOLATIONS})`)

          toast.warning(`Tab switch detected! (${tabSwitchCount + 1}/${MAX_VIOLATIONS})`, {
            description: "Switching tabs during the coding challenge is not allowed.",
          })
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }, [isActive, tabSwitchCount])

    // Check for max violations
    useEffect(() => {
      if (violations.length >= MAX_VIOLATIONS) {
        onMaxViolations()
        toast.error("Maximum violations reached. Challenge terminated.", {
          description: "Your attempt has been flagged for suspicious activity.",
        })
      }
    }, [violations, onMaxViolations])

    const recordViolation = (type: string, details: string) => {
      const violation = {
        type,
        details,
        timestamp: new Date(),
      }

      setViolations((prev) => [...prev, violation])
      onViolation(type, details)
    }

    // Add this method to the AntiCheatSystem component
    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
        videoRef.current.srcObject = null
        setCameraActive(false)
      }
    }

    // Expose the stopCamera method through the ref
    useImperativeHandle(ref, () => ({
      stopCamera: () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
          videoRef.current.srcObject = null
          setCameraActive(false)
        }
      },
    }))

    // Expose the stopCamera method
    useEffect(() => {
      return () => {
        // Clean up video stream when component unmounts
        stopCamera()
      }
    }, [])

    if (!isActive) return null

    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2">
        <div className="bg-background border rounded-lg shadow-lg p-2 w-64">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Proctoring System</h4>
            <div className="flex items-center gap-1">
              {cameraActive ? (
                <Camera className="h-4 w-4 text-green-500" />
              ) : (
                <CameraOff className="h-4 w-4 text-red-500" />
              )}
              {tabFocused ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-500" />}
              {violations.length > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            </div>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Camera:</span>
              <span className={cameraActive ? "text-green-500" : "text-red-500"}>
                {cameraActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Face Detected:</span>
              <span className={faceVisible ? "text-green-500" : "text-red-500"}>{faceVisible ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span>Tab Switches:</span>
              <span className={tabSwitchCount > 0 ? "text-amber-500" : "text-green-500"}>
                {tabSwitchCount}/{MAX_VIOLATIONS}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Violations:</span>
              <span className={violations.length > 0 ? "text-amber-500" : "text-green-500"}>
                {violations.length}/{MAX_VIOLATIONS}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-32 h-24 rounded-lg border shadow-md bg-black"
            onPlay={() => setCameraActive(true)}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-32 h-24 rounded-lg" />
        </div>
      </div>
    )
  },
)

// Add display name
AntiCheatSystem.displayName = "AntiCheatSystem"

export default AntiCheatSystem

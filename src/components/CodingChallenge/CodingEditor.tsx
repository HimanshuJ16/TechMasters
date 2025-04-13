"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Play, Lightbulb, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { executeCode } from "@/lib/actions/code.action"

const LANGUAGES = [
  { id: 63, name: "JavaScript (Node.js 12.14.0)", extension: "js" },
  { id: 71, name: "Python (3.8.1)", extension: "py" },
  { id: 62, name: "Java (OpenJDK 13.0.1)", extension: "java" },
  { id: 54, name: "C++ (GCC 9.2.0)", extension: "cpp" },
  { id: 51, name: "C# (Mono 6.6.0.161)", extension: "cs" },
]

const DEFAULT_CODE = {
  js: "function solution(input) {\n  // Write your code here\n  \n  return result;\n}",
  py: "def solution(input):\n    # Write your code here\n    \n    return result",
  java: "public class Solution {\n    public static Object solution(Object input) {\n        // Write your code here\n        \n        return result;\n    }\n}",
  cpp: "#include <iostream>\n\nusing namespace std;\n\nint solution(int input) {\n    // Write your code here\n    \n    return result;\n}",
  cs: "using System;\n\npublic class Solution {\n    public static object Main(object input) {\n        // Write your code here\n        \n        return result;\n    }\n}",
}

interface CodingEditorProps {
  codingQuestion: any
  onClose: () => void
  onRequestHint: () => void
  onSubmitCode: (code: string, language: string) => void
}

const CodingEditor = ({ codingQuestion, onClose, onRequestHint, onSubmitCode }: CodingEditorProps) => {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("problem")

  useEffect(() => {
    // Set default code based on selected language
    setCode(DEFAULT_CODE[language.extension as keyof typeof DEFAULT_CODE])
  }, [language])

  const handleLanguageChange = (langId: string) => {
    const selectedLang = LANGUAGES.find((lang) => lang.id.toString() === langId)
    if (selectedLang) {
      setLanguage(selectedLang)
    }
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setOutput("")

    try {
      const testCase = codingQuestion.examples[0].input
      const result = await executeCode({
        language_id: language.id,
        source_code: code,
        stdin: testCase,
      })

      setOutput(result.stdout || result.stderr || "No output")
    } catch (error) {
      console.error("Error executing code:", error)
      setOutput("Error executing code. Please try again.")
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmitCode = () => {
    onSubmitCode(code, language.name)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{codingQuestion.title}</h3>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onRequestHint}>
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black">
                <p>Request a hint</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-1/2 h-full overflow-auto border-r">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="problem" className="flex-1">
                Problem
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex-1">
                Examples
              </TabsTrigger>
            </TabsList>
            <TabsContent value="problem" className="p-4">
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: codingQuestion.description }} />

                <h4>Constraints:</h4>
                <ul>
                  {codingQuestion.constraints.map((constraint: string, i: number) => (
                    <li key={i}>{constraint}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="examples" className="p-4">
              <div className="space-y-4">
                {codingQuestion.examples.map((example: any, i: number) => (
                  <div key={i} className="border rounded-md p-4">
                    <div className="font-medium">Example {i + 1}:</div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-muted-foreground">Input:</div>
                      <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                        <code>{example.input}</code>
                      </pre>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-muted-foreground">Output:</div>
                      <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                        <code>{example.output}</code>
                      </pre>
                    </div>
                    {example.explanation && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-muted-foreground">Explanation:</div>
                        <div className="mt-1">{example.explanation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/2 h-full flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <Select value={language.id.toString()} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id.toString()}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={copyCode}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="border-t">
            <div className="p-2 flex justify-between items-center">
              <div className="text-sm font-medium">Output</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRunCode} disabled={isRunning}>
                  {isRunning ? (
                    "Running..."
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" /> Run
                    </>
                  )}
                </Button>
                <Button variant="default" size="sm" onClick={handleSubmitCode}>
                  Submit
                </Button>
              </div>
            </div>
            <div className="p-4 bg-muted h-32 overflow-auto font-mono text-sm">
              {output || "Run your code to see output"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodingEditor

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Settings, 
  ChevronDown,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles
} from "lucide-react";

interface CodeEditorProps {
  onNavigate: (page: string) => void;
}

export default function CodeEditor({ onNavigate }: CodeEditorProps) {
  const [code, setCode] = useState(`def two_sum(nums, target):
    # Write your solution here
    pass

# Test your code
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))`);
  
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    setOutput("Output:\n[0, 1]\n\nTest case passed! ✓\nExecution time: 0.045s\nMemory: 14.2 MB");
    setHasRun(true);
  };

  const handleReset = () => {
    setCode(`def two_sum(nums, target):
    # Write your solution here
    pass

# Test your code
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))`);
    setOutput("");
    setHasRun(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h3>Two Sum</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-700">Easy</Badge>
                <span className="text-sm text-muted-foreground">Arrays • Hash Table</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-gray-50">
              {language.charAt(0).toUpperCase() + language.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-2/5 border-r border-border overflow-auto">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-white px-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="flex-1 overflow-auto p-6 m-0">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3">Problem Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Given an array of integers <code className="px-2 py-1 bg-gray-100 rounded text-sm">nums</code> and 
                    an integer <code className="px-2 py-1 bg-gray-100 rounded text-sm">target</code>, return indices 
                    of the two numbers such that they add up to target.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3">Examples</h4>
                  <Card className="p-4 bg-gray-50">
                    <p className="text-sm mb-2"><strong>Input:</strong> nums = [2,7,11,15], target = 9</p>
                    <p className="text-sm mb-2"><strong>Output:</strong> [0,1]</p>
                    <p className="text-sm text-muted-foreground"><strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                  </Card>
                </div>

                <div>
                  <Card className="p-4 bg-gray-50">
                    <p className="text-sm mb-2"><strong>Input:</strong> nums = [3,2,4], target = 6</p>
                    <p className="text-sm mb-2"><strong>Output:</strong> [1,2]</p>
                  </Card>
                </div>

                <div>
                  <h4 className="mb-3">Constraints</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 2 ≤ nums.length ≤ 10⁴</li>
                    <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                    <li>• -10⁹ ≤ target ≤ 10⁹</li>
                    <li>• Only one valid answer exists</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3">Hints</h4>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Try using a hash map to store the numbers you've seen and their indices.</p>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="solution" className="flex-1 overflow-auto p-6 m-0">
              <div className="space-y-4">
                <h3>Optimal Solution</h3>
                <p className="text-muted-foreground">
                  Use a hash map to achieve O(n) time complexity
                </p>
                <Card className="p-4 bg-gray-900 text-gray-100">
                  <pre className="text-sm overflow-auto">
{`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`}
                  </pre>
                </Card>
                <div className="pt-4 border-t border-border">
                  <h4 className="mb-2">Complexity Analysis</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Time Complexity: O(n)</li>
                    <li>• Space Complexity: O(n)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="flex-1 overflow-auto p-6 m-0">
              <p className="text-muted-foreground">Discussion forum coming soon...</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Code Area */}
          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-6 font-mono text-sm bg-gray-900 text-gray-100 border-0 outline-none resize-none"
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="h-48 border-t border-border bg-white">
            <Tabs defaultValue="output" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-white px-6">
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                <TabsTrigger value="ai-review">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="output" className="flex-1 overflow-auto p-6 m-0">
                {output ? (
                  <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{output}</pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click "Run Code" to see the output
                  </p>
                )}
              </TabsContent>

              <TabsContent value="testcases" className="flex-1 overflow-auto p-6 m-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Test case 1: Passed</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm text-muted-foreground">Test case 2: Not run</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span className="text-sm text-muted-foreground">Test case 3: Not run</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-review" className="flex-1 overflow-auto p-6 m-0">
                <div className="space-y-4">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="mb-2">Great start! Here are some suggestions:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Consider edge cases like empty arrays</li>
                          <li>• Add comments to explain your logic</li>
                          <li>• Use descriptive variable names</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border-t border-border px-6 py-4 flex items-center justify-between">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRun}>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Submit Solution
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

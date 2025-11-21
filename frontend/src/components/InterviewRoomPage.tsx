import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { 
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Settings,
  Users,
  MessageSquare,
  Code,
  Pencil,
  Play,
  Pause,
  Square,
  Circle,
  MoreVertical,
  Maximize2,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  PhoneOff,
  Timer,
  Download,
  RotateCcw,
  Type,
  Eraser,
  Minus,
  MousePointer
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface InterviewRoomPageProps {
  onBack: () => void;
}

export default function InterviewRoomPage({ onBack }: InterviewRoomPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [activeTab, setActiveTab] = useState("code");

  // Mock participants
  const participants = [
    { id: 1, name: "You", role: "Host", muted: isMuted, video: !isVideoOff, avatar: "Y" },
    { id: 2, name: "Sarah Chen", role: "Interviewer", muted: false, video: true, avatar: "SC" },
  ];

  const codeContent = `# Two Sum Problem
def two_sum(nums, target):
    """
    Find two numbers that add up to target.
    Return indices of the two numbers.
    """
    # Your code here
    hash_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    
    return []

# Test cases
print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))       # [1, 2]`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h4>Mock Technical Interview</h4>
              <p className="text-xs text-muted-foreground">Room ID: MTI-2024-001</p>
            </div>
            {isRoomLocked && (
              <Badge className="bg-red-100 text-red-700">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isRecording && (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono">{recordingTime}</span>
                </>
              )}
            </div>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              disabled
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Placeholder Notice */}
      <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
        <p className="text-sm text-blue-800">
          🚧 <strong>Interview Room Placeholder:</strong> All controls are designed but non-functional. 
          This includes recording, video/audio, code editor collaboration, and whiteboard features.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Video & Participants */}
        <div className="w-80 border-r border-border flex flex-col bg-gray-50">
          {/* Video Grid */}
          <div className="p-4 space-y-3">
            {participants.map((participant) => (
              <Card key={participant.id} className="relative overflow-hidden bg-gray-900">
                <div className="aspect-video flex items-center justify-center">
                  {participant.video ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xl">{participant.avatar}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-black/50 text-white border-0">
                      {participant.name}
                    </Badge>
                    {participant.role === "Host" && (
                      <Badge className="bg-blue-600 text-white border-0 text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {participant.muted && (
                      <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Room Controls (Host Only) */}
          <div className="p-4 border-t border-border">
            <h4 className="text-sm mb-3">Host Controls</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsRoomLocked(!isRoomLocked)}
                disabled
              >
                {isRoomLocked ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Room
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Room
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled
              >
                <VolumeX className="w-4 h-4 mr-2" />
                Mute Participant
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600"
                disabled
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>

          {/* Participants List */}
          <div className="flex-1 p-4 border-t border-border overflow-auto">
            <h4 className="text-sm mb-3">Participants ({participants.length})</h4>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs text-blue-600">{participant.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.role}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>Mute</DropdownMenuItem>
                      <DropdownMenuItem disabled>Make Host</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled className="text-red-600">
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Code Editor / Whiteboard */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="bg-white border-b border-border px-4">
              <TabsList>
                <TabsTrigger value="code">
                  <Code className="w-4 h-4 mr-2" />
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="whiteboard">
                  <Pencil className="w-4 h-4 mr-2" />
                  Whiteboard
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Code Editor Tab */}
            <TabsContent value="code" className="flex-1 m-0 p-0">
              <div className="h-full flex flex-col">
                {/* Editor Toolbar */}
                <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled>
                      <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="bg-gray-800 text-white border-gray-700">
                      Collaborative Mode
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800" disabled>
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </Button>
                  </div>
                </div>

                {/* Code Editor Area */}
                <div className="flex-1 bg-gray-900 p-4 overflow-auto">
                  <pre className="text-gray-100 font-mono text-sm">
                    <code>{codeContent}</code>
                  </pre>
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
                    <p className="text-xs text-blue-200">
                      💡 <strong>Collaborative Editor:</strong> In the full implementation, 
                      both participants can type and edit code in real-time with cursor tracking and syntax highlighting.
                    </p>
                  </div>
                </div>

                {/* Output Console */}
                <div className="h-32 bg-black border-t border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">OUTPUT</span>
                    <Button variant="ghost" size="sm" className="text-gray-400 h-6" disabled>
                      Clear
                    </Button>
                  </div>
                  <div className="font-mono text-xs text-green-400">
                    <div>[0, 1]</div>
                    <div>[1, 2]</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Whiteboard Tab */}
            <TabsContent value="whiteboard" className="flex-1 m-0 p-0">
              <div className="h-full flex flex-col">
                {/* Whiteboard Toolbar */}
                <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <MousePointer className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Type className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Circle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Eraser className="w-4 h-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-2"></div>
                    
                    {/* Color Palette */}
                    <div className="flex items-center gap-1">
                      {['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map(color => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                          disabled
                        />
                      ))}
                    </div>

                    <div className="w-px h-6 bg-border mx-2"></div>

                    <Button variant="outline" size="sm" disabled>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Undo
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Clear Canvas
                  </Button>
                </div>

                {/* Whiteboard Canvas */}
                <div className="flex-1 bg-white relative">
                  {/* Grid Background */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}></div>
                  
                  {/* Canvas Content Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-md p-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Pencil className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="mb-2">Collaborative Whiteboard</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Draw diagrams, mind maps, and visualize data structures together. 
                        Both participants can draw simultaneously.
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>• Mind Maps</div>
                        <div>• Flowcharts</div>
                        <div>• Data Structures</div>
                        <div>• System Design</div>
                        <div>• Algorithms</div>
                        <div>• Brainstorming</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Chat & Notes */}
        <div className="w-80 border-l border-border flex flex-col bg-white">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-4">
              <div className="flex-1 space-y-3 overflow-auto mb-4">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-blue-600">SC</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sarah Chen</p>
                    <p className="text-sm bg-gray-100 rounded p-2 mt-1">
                      Hi! Ready to start the interview?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-green-600">Y</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground text-right">You</p>
                    <p className="text-sm bg-blue-600 text-white rounded p-2 mt-1">
                      Yes, I'm ready! Let's begin.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-border rounded text-sm"
                  disabled
                />
                <Button size="sm" disabled>Send</Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 m-0 p-4">
              <textarea
                placeholder="Take notes during the interview..."
                className="w-full h-full p-3 border border-border rounded text-sm resize-none"
                disabled
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              disabled
            >
              {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="sm"
              onClick={() => setIsVideoOff(!isVideoOff)}
              disabled
            >
              {isVideoOff ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
              {isVideoOff ? "Start Video" : "Stop Video"}
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <MonitorUp className="w-4 h-4 mr-2" />
              Share Screen
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" disabled>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="destructive" size="sm" onClick={onBack}>
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

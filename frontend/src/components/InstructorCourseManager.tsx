import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Plus,
  Edit,
  Trash2,
  GripVertical,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  Video,
  FileCode,
  CheckSquare,
  Upload,
  Save,
  Eye,
  Settings,
  Users,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface InstructorCourseManagerProps {
  onNavigate: (page: string) => void;
}

export default function InstructorCourseManager({ onNavigate }: InstructorCourseManagerProps) {
  const [selectedCourse, setSelectedCourse] = useState("python-masterclass");
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);

  const courses = [
    { 
      id: "python-masterclass", 
      name: "Complete Python Programming Masterclass",
      status: "Published"
    },
    { 
      id: "java-dsa", 
      name: "Data Structures & Algorithms in Java",
      status: "Published"
    },
    { 
      id: "react-web", 
      name: "Modern Web Development with React",
      status: "Published"
    },
    { 
      id: "sql-design", 
      name: "Advanced SQL Database Design",
      status: "Draft"
    },
  ];

  const sections = [
    {
      id: 1,
      title: "Introduction to Python",
      lessons: [
        { 
          id: 1, 
          title: "What is Python?", 
          type: "video", 
          duration: "12:30",
          status: "published"
        },
        { 
          id: 2, 
          title: "Setting up Environment", 
          type: "video", 
          duration: "8:45",
          status: "published"
        },
        { 
          id: 3, 
          title: "Your First Program", 
          type: "video", 
          duration: "15:20",
          status: "published"
        },
        { 
          id: 4, 
          title: "Quiz: Python Basics", 
          type: "quiz", 
          duration: "10 questions",
          status: "published"
        },
      ]
    },
    {
      id: 2,
      title: "Variables and Data Types",
      lessons: [
        { 
          id: 5, 
          title: "Understanding Variables", 
          type: "video", 
          duration: "14:15",
          status: "published"
        },
        { 
          id: 6, 
          title: "Data Types in Python", 
          type: "video", 
          duration: "18:30",
          status: "published"
        },
        { 
          id: 7, 
          title: "Type Conversion", 
          type: "video", 
          duration: "10:45",
          status: "draft"
        },
        { 
          id: 8, 
          title: "Coding Exercise", 
          type: "exercise", 
          duration: "5 problems",
          status: "draft"
        },
      ]
    },
    {
      id: 3,
      title: "Control Flow",
      lessons: [
        { 
          id: 9, 
          title: "If-Else Statements", 
          type: "video", 
          duration: "16:20",
          status: "published"
        },
        { 
          id: 10, 
          title: "Loops in Python", 
          type: "video", 
          duration: "20:10",
          status: "published"
        },
      ]
    },
  ];

  const courseStats = {
    totalLessons: 48,
    publishedLessons: 42,
    totalDuration: "12h 30m",
    students: 1245,
    avgRating: 4.9,
    completionRate: 78,
  };

  const students = [
    { 
      id: 1, 
      name: "Alice Johnson", 
      avatar: "AJ",
      enrolled: "2 weeks ago",
      progress: 85,
      lastActive: "2 hours ago"
    },
    { 
      id: 2, 
      name: "Bob Smith", 
      avatar: "BS",
      enrolled: "1 month ago",
      progress: 45,
      lastActive: "1 day ago"
    },
    { 
      id: 3, 
      name: "Carol White", 
      avatar: "CW",
      enrolled: "3 days ago",
      progress: 12,
      lastActive: "5 hours ago"
    },
    { 
      id: 4, 
      name: "David Lee", 
      avatar: "DL",
      enrolled: "2 months ago",
      progress: 100,
      lastActive: "1 week ago"
    },
  ];

  const questions = [
    {
      id: 1,
      student: "Alice Johnson",
      avatar: "AJ",
      lesson: "Understanding Variables",
      question: "How do I handle type conversion errors in Python?",
      time: "2 hours ago",
      replies: 2,
      status: "answered"
    },
    {
      id: 2,
      student: "Bob Smith",
      avatar: "BS",
      lesson: "Loops in Python",
      question: "What's the difference between while and for loops?",
      time: "5 hours ago",
      replies: 0,
      status: "pending"
    },
    {
      id: 3,
      student: "Carol White",
      avatar: "CW",
      lesson: "Your First Program",
      question: "Getting syntax error on line 5, can someone help?",
      time: "1 day ago",
      replies: 3,
      status: "answered"
    },
  ];

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "quiz": return CheckSquare;
      case "exercise": return FileCode;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    return status === "published" 
      ? "bg-green-100 text-green-700" 
      : "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Course Management</h2>
          <p className="text-muted-foreground mt-1">Manage your course content and students</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lessons</p>
              <p className="text-lg">{courseStats.totalLessons}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="text-lg">{courseStats.publishedLessons}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg">{courseStats.totalDuration}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="text-lg">{courseStats.students}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-lg">{courseStats.avgRating}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-lg">{courseStats.completionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="curriculum" className="space-y-6">
        <TabsList>
          <TabsTrigger value="curriculum">
            <FileText className="w-4 h-4 mr-2" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="questions">
            <MessageSquare className="w-4 h-4 mr-2" />
            Q&A
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Course Curriculum</h3>
            <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Section</DialogTitle>
                  <DialogDescription>
                    Create a new section to organize your course content
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input placeholder="e.g., Introduction to Python" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Brief description of what students will learn in this section" 
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Section
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <Card key={section.id} className="overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button className="cursor-grab hover:bg-gray-200 p-1 rounded">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    <div className="flex-1">
                      <h4>Section {sectionIndex + 1}: {section.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.lessons.length} lessons
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const LessonIcon = getLessonIcon(lesson.type);
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <button className="cursor-grab hover:bg-gray-200 p-1 rounded">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <LessonIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                        </div>
                        <Badge className={getStatusColor(lesson.status)}>
                          {lesson.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-6">Enrolled Students</h3>
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">{student.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Enrolled {student.enrolled} • Last active {student.lastActive}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-blue-600">{student.progress}%</p>
                    </div>
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-6">Student Questions</h3>
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-lg border border-border hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm text-blue-600">{q.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{q.student}</p>
                          <p className="text-sm text-muted-foreground">
                            Asked in: {q.lesson} • {q.time}
                          </p>
                        </div>
                        <Badge className={
                          q.status === 'answered' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }>
                          {q.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{q.question}</p>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Reply ({q.replies})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-6">Course Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input defaultValue="Complete Python Programming Masterclass" />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea 
                  defaultValue="Learn Python from scratch and master programming fundamentals with hands-on projects and real-world examples."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Course Price</Label>
                <Input type="number" defaultValue="49.99" />
              </div>
              <div className="space-y-2">
                <Label>Course Category</Label>
                <Select defaultValue="programming">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                    <SelectItem value="mobile">Mobile Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course Level</Label>
                <Select defaultValue="beginner">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      Make this course public
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Q&A</p>
                    <p className="text-sm text-muted-foreground">
                      Allow students to ask questions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Reviews</p>
                    <p className="text-sm text-muted-foreground">
                      Allow students to leave reviews
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

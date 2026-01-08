import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Video,
  CheckCircle,
  Info,
  DollarSign,
  BookOpen,
  Target,
  Award,
  Plus,
  Trash2,
  Edit3,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==================== Interfaces ====================
interface Lesson {
  id: string;
  title: string;
  type: "video" | "theory";
  content: string;
  duration: string;
  isFreePreview: boolean;
}

interface Topic {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

interface CourseData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  price: string;
  thumbnail: string;
  whatYouWillLearn: string[];
  prerequisites: string[];
  targetAudience: string[];
  topics: Topic[];
}

// ==================== Helper Functions ====================
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createEmptyLesson = (): Lesson => ({
  id: generateId(),
  title: "",
  type: "video",
  content: "",
  duration: "",
  isFreePreview: false,
});

const createEmptyTopic = (): Topic => ({
  id: generateId(),
  title: "",
  lessons: [],
  isExpanded: true,
});

export default function InstructorCreateCourse() {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "",
    language: "english",
    price: "",
    thumbnail: "",
    whatYouWillLearn: [""],
    prerequisites: [""],
    targetAudience: [""],
    topics: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Lesson editing modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const categories = [
    "Programming",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Database",
    "DevOps",
    "Cloud Computing",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

  // ==================== List Item Handlers ====================
  const addListItem = (
    field: "whatYouWillLearn" | "prerequisites" | "targetAudience"
  ) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateListItem = (
    field: "whatYouWillLearn" | "prerequisites" | "targetAudience",
    index: number,
    value: string
  ) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeListItem = (
    field: "whatYouWillLearn" | "prerequisites" | "targetAudience",
    index: number
  ) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // ==================== Topic (Section) Handlers ====================
  const addTopic = () => {
    setCourseData((prev) => ({
      ...prev,
      topics: [...prev.topics, createEmptyTopic()],
    }));
  };

  const updateTopicTitle = (topicId: string, title: string) => {
    setCourseData((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) =>
        topic.id === topicId ? { ...topic, title } : topic
      ),
    }));
  };

  const deleteTopic = (topicId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this section and all its lessons?"
      )
    ) {
      setCourseData((prev) => ({
        ...prev,
        topics: prev.topics.filter((topic) => topic.id !== topicId),
      }));
    }
  };

  const toggleTopicExpanded = (topicId: string) => {
    setCourseData((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, isExpanded: !topic.isExpanded }
          : topic
      ),
    }));
  };

  const moveTopicUp = (index: number) => {
    if (index === 0) return;
    setCourseData((prev) => {
      const newTopics = [...prev.topics];
      [newTopics[index - 1], newTopics[index]] = [
        newTopics[index],
        newTopics[index - 1],
      ];
      return { ...prev, topics: newTopics };
    });
  };

  const moveTopicDown = (index: number) => {
    if (index === courseData.topics.length - 1) return;
    setCourseData((prev) => {
      const newTopics = [...prev.topics];
      [newTopics[index], newTopics[index + 1]] = [
        newTopics[index + 1],
        newTopics[index],
      ];
      return { ...prev, topics: newTopics };
    });
  };

  // ==================== Lesson Handlers ====================
  const openLessonModal = (topicId: string, lesson?: Lesson) => {
    setEditingTopicId(topicId);
    setEditingLesson(lesson || createEmptyLesson());
    setIsLessonModalOpen(true);
  };

  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
    setEditingTopicId(null);
  };

  const saveLesson = () => {
    if (!editingLesson || !editingTopicId) return;
    if (!editingLesson.title.trim()) {
      alert("Please enter a lesson title");
      return;
    }

    setCourseData((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id !== editingTopicId) return topic;

        const existingIndex = topic.lessons.findIndex(
          (l) => l.id === editingLesson.id
        );
        if (existingIndex >= 0) {
          // Update existing lesson
          const newLessons = [...topic.lessons];
          newLessons[existingIndex] = editingLesson;
          return { ...topic, lessons: newLessons };
        } else {
          // Add new lesson
          return { ...topic, lessons: [...topic.lessons, editingLesson] };
        }
      }),
    }));

    closeLessonModal();
  };

  const deleteLesson = (topicId: string, lessonId: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      setCourseData((prev) => ({
        ...prev,
        topics: prev.topics.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                lessons: topic.lessons.filter((l) => l.id !== lessonId),
              }
            : topic
        ),
      }));
    }
  };

  const moveLessonUp = (topicId: string, lessonIndex: number) => {
    if (lessonIndex === 0) return;
    setCourseData((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id !== topicId) return topic;
        const newLessons = [...topic.lessons];
        [newLessons[lessonIndex - 1], newLessons[lessonIndex]] = [
          newLessons[lessonIndex],
          newLessons[lessonIndex - 1],
        ];
        return { ...topic, lessons: newLessons };
      }),
    }));
  };

  const moveLessonDown = (topicId: string, lessonIndex: number) => {
    const topic = courseData.topics.find((t) => t.id === topicId);
    if (!topic || lessonIndex === topic.lessons.length - 1) return;
    setCourseData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => {
        if (t.id !== topicId) return t;
        const newLessons = [...t.lessons];
        [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [
          newLessons[lessonIndex + 1],
          newLessons[lessonIndex],
        ];
        return { ...t, lessons: newLessons };
      }),
    }));
  };

  // ==================== Navigation & Validation ====================
  const handleNext = () => {
    // Validate current step before moving forward
    if (!validateCurrentStep()) {
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!courseData.title.trim()) {
          alert("Please enter a course title");
          return false;
        }
        if (!courseData.description.trim()) {
          alert("Please enter a course description");
          return false;
        }
        if (!courseData.category) {
          alert("Please select a category");
          return false;
        }
        if (!courseData.level) {
          alert("Please select a course level");
          return false;
        }
        return true;
      case 2:
        // Media step - optional validation
        return true;
      case 3:
        // Objectives step validation
        if (
          courseData.whatYouWillLearn.filter((item) => item.trim()).length === 0
        ) {
          alert("Please add at least one learning objective");
          return false;
        }
        return true;
      case 4:
        // Curriculum step validation
        if (courseData.topics.length === 0) {
          alert("Please add at least one section");
          return false;
        }
        const hasEmptyTopic = courseData.topics.some((t) => !t.title.trim());
        if (hasEmptyTopic) {
          alert("Please fill in all section titles");
          return false;
        }
        const hasLessons = courseData.topics.some((t) => t.lessons.length > 0);
        if (!hasLessons) {
          alert("Please add at least one lesson to your course");
          return false;
        }
        return true;
      case 5:
        // Final validation
        return true;
      default:
        return true;
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // Call API to save course as draft
      // await saveCourseAsDraftMutation.mutateAsync({
      //   ...courseData,
      //   status: 'draft'
      // });

      alert("Course saved as draft successfully!");
      navigate("/instructor/courses");
    } catch (error: any) {
      alert("Failed to save course: " + (error.message || "Unknown error"));
    }
  };

  const handleCreateCourse = async () => {
    // Validate all steps
    if (!validateCurrentStep()) {
      return;
    }

    try {
      // Call API to create/publish course
      // await createCourseMutation.mutateAsync({
      //   ...courseData,
      //   status: 'published'
      // });

      alert("Course created and published successfully!");
      navigate("/instructor/courses");
    } catch (error: any) {
      alert("Failed to create course: " + (error.message || "Unknown error"));
    }
  };

  // ==================== Calculate Curriculum Stats ====================
  const getTotalLessons = () => {
    return courseData.topics.reduce(
      (sum, topic) => sum + topic.lessons.length,
      0
    );
  };

  const getTotalDuration = () => {
    let totalMinutes = 0;
    courseData.topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        const duration = parseInt(lesson.duration) || 0;
        totalMinutes += duration;
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // ==================== Render Step Content ====================
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Basic Information</h3>
              <p className="text-muted-foreground mb-6">
                Provide the essential details about your course
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Course Title *</Label>
                <Input
                  placeholder="e.g., Complete Python Programming Masterclass"
                  value={courseData.title}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  A clear, descriptive title helps students find your course
                </p>
              </div>

              <div className="space-y-2">
                <Label>Course Subtitle</Label>
                <Input
                  placeholder="e.g., Learn Python from scratch with hands-on projects"
                  value={courseData.subtitle}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      subtitle: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Course Description *</Label>
                <Textarea
                  placeholder="Describe what students will learn in your course..."
                  rows={6}
                  value={courseData.description}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {courseData.description.length}/1000 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value: string) =>
                      setCourseData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select
                    value={courseData.level}
                    onValueChange={(value: string) =>
                      setCourseData((prev) => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level.toLowerCase()}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={courseData.language}
                    onValueChange={(value: string) =>
                      setCourseData((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="49.99"
                    value={courseData.price}
                    onChange={(e) =>
                      setCourseData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Course Media</h3>
              <p className="text-muted-foreground mb-6">
                Upload your course thumbnail and promotional video
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Course Thumbnail *</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Upload Course Thumbnail</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recommended size: 1280x720px (16:9 ratio)
                      </p>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Promotional Video (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Upload Promotional Video</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Max duration: 2 minutes, Max size: 500MB
                      </p>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Video
                    </Button>
                  </div>
                </div>
              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Tips for great thumbnails
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Use high-quality images with good lighting</li>
                      <li>Include text overlay with your course title</li>
                      <li>Show what students will learn or achieve</li>
                      <li>Avoid cluttered or busy designs</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Course Objectives</h3>
              <p className="text-muted-foreground mb-6">
                Define what students will learn and who this course is for
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>What Students Will Learn *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  List the key learning outcomes (at least 4)
                </p>
                <div className="space-y-2">
                  {courseData.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Learning objective ${index + 1}`}
                        value={item}
                        onChange={(e) =>
                          updateListItem(
                            "whatYouWillLearn",
                            index,
                            e.target.value
                          )
                        }
                      />
                      {courseData.whatYouWillLearn.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            removeListItem("whatYouWillLearn", index)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem("whatYouWillLearn")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Learning Objective
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prerequisites</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  What students need to know before taking this course
                </p>
                <div className="space-y-2">
                  {courseData.prerequisites.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Prerequisite ${index + 1}`}
                        value={item}
                        onChange={(e) =>
                          updateListItem("prerequisites", index, e.target.value)
                        }
                      />
                      {courseData.prerequisites.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeListItem("prerequisites", index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem("prerequisites")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prerequisite
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Who is this course for?
                </p>
                <div className="space-y-2">
                  {courseData.targetAudience.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Target audience ${index + 1}`}
                        value={item}
                        onChange={(e) =>
                          updateListItem(
                            "targetAudience",
                            index,
                            e.target.value
                          )
                        }
                      />
                      {courseData.targetAudience.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            removeListItem("targetAudience", index)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem("targetAudience")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Target Audience
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Course Curriculum</h3>
              <p className="text-muted-foreground mb-6">
                Organize your course content into sections and lessons
              </p>
            </div>

            {/* Curriculum Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {courseData.topics.length}
                    </p>
                    <p className="text-xs text-blue-700">Sections</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {getTotalLessons()}
                    </p>
                    <p className="text-xs text-purple-700">Lessons</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {getTotalDuration()}
                    </p>
                    <p className="text-xs text-green-700">Total Duration</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sections List */}
            <div className="space-y-4">
              {courseData.topics.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-semibold mb-2">No sections yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start building your curriculum by adding sections
                  </p>
                  <Button onClick={addTopic}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Section
                  </Button>
                </Card>
              ) : (
                <>
                  {courseData.topics.map((topic, topicIndex) => (
                    <Card key={topic.id} className="overflow-hidden">
                      {/* Section Header */}
                      <div className="bg-gray-50 border-b p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveTopicUp(topicIndex)}
                              disabled={topicIndex === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveTopicDown(topicIndex)}
                              disabled={
                                topicIndex === courseData.topics.length - 1
                              }
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                Section {topicIndex + 1}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {topic.lessons.length} lesson
                                {topic.lessons.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <Input
                              placeholder="Section title (e.g., Introduction to Python)"
                              value={topic.title}
                              onChange={(e) =>
                                updateTopicTitle(topic.id, e.target.value)
                              }
                              className="font-medium"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleTopicExpanded(topic.id)}
                            >
                              {topic.isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTopic(topic.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Lessons List */}
                      {topic.isExpanded && (
                        <div className="p-4 space-y-2">
                          {topic.lessons.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <p className="text-sm mb-2">
                                No lessons in this section
                              </p>
                            </div>
                          ) : (
                            topic.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      moveLessonUp(topic.id, lessonIndex)
                                    }
                                    disabled={lessonIndex === 0}
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      moveLessonDown(topic.id, lessonIndex)
                                    }
                                    disabled={
                                      lessonIndex === topic.lessons.length - 1
                                    }
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </div>

                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                  {lesson.type === "video" ? (
                                    <Play className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-purple-600" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">
                                      {lesson.title || "Untitled Lesson"}
                                    </p>
                                    {lesson.isFreePreview && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Preview
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="capitalize">
                                      {lesson.type}
                                    </span>
                                    {lesson.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{lesson.duration} min</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      openLessonModal(topic.id, lesson)
                                    }
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      deleteLesson(topic.id, lesson.id)
                                    }
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => openLessonModal(topic.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={addTopic}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Section
                  </Button>
                </>
              )}
            </div>

            {/* Tips Card */}
            <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Curriculum Tips</p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Start with an introduction to set expectations</li>
                    <li>Group related content into logical sections</li>
                    <li>Mix video lessons with theory for variety</li>
                    <li>
                      Mark some lessons as "Free Preview" to attract students
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Course Settings & Launch</h3>
              <p className="text-muted-foreground mb-6">
                Configure your course settings and prepare for launch
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gray-50">
                <h4 className="mb-4">Course Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="text-sm font-medium">
                        {courseData.title || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-sm font-medium capitalize">
                        {courseData.category || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="text-sm font-medium capitalize">
                        {courseData.level || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-sm font-medium">
                        ${courseData.price || "Free"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Curriculum Summary */}
              <div className="mt-6 pt-4 border-t border-border">
                <h5 className="text-sm font-medium mb-3">Curriculum</h5>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{courseData.topics.length} sections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>{getTotalLessons()} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>{getTotalDuration()} total</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Publish Course</p>
                    <p className="text-sm text-muted-foreground">
                      Make this course available to students
                    </p>
                  </div>
                  <Switch />
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
                    <p className="font-medium">Enable Reviews</p>
                    <p className="text-sm text-muted-foreground">
                      Allow students to leave reviews and ratings
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Certificate</p>
                    <p className="text-sm text-muted-foreground">
                      Provide certificate upon completion
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">
                      Ready to Launch!
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      Your course is ready to be published. Once published,
                      students can enroll and start learning.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/instructor/courses")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveAsDraft}>
                Save as Draft
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (validateCurrentStep()) {
                    if (currentStep === totalSteps) {
                      handleCreateCourse();
                    } else {
                      handleNext();
                    }
                  }
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {currentStep === totalSteps
                  ? "Create Course"
                  : "Save & Continue"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h3>Create New Course</h3>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between mt-4">
            {[
              { step: 1, label: "Basic Info" },
              { step: 2, label: "Media" },
              { step: 3, label: "Objectives" },
              { step: 4, label: "Curriculum" },
              { step: 5, label: "Settings" },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-center gap-2 ${
                  currentStep >= item.step
                    ? "text-blue-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= item.step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > item.step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{item.step}</span>
                  )}
                </div>
                <span className="text-sm hidden md:block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-8 py-8">
        <Card className="p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveAsDraft}>
                Save as Draft
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (validateCurrentStep()) {
                    if (currentStep === totalSteps) {
                      handleCreateCourse();
                    } else {
                      handleNext();
                    }
                  }
                }}
              >
                {currentStep === totalSteps ? "Create Course" : "Next"}
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Lesson Edit Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson &&
              courseData.topics.some((t) =>
                t.lessons.some((l) => l.id === editingLesson.id)
              )
                ? "Edit Lesson"
                : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>

          {editingLesson && (
            <div className="space-y-4 py-4">
              {/* Lesson Title */}
              <div className="space-y-2">
                <Label>Lesson Title *</Label>
                <Input
                  placeholder="e.g., Introduction to Variables"
                  value={editingLesson.title}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Lesson Type */}
              <div className="space-y-2">
                <Label>Lesson Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingLesson({
                        ...editingLesson,
                        type: "video",
                        content: "",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      editingLesson.type === "video"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Video
                      className={`w-6 h-6 mx-auto mb-2 ${
                        editingLesson.type === "video"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        editingLesson.type === "video"
                          ? "text-blue-900"
                          : "text-gray-600"
                      }`}
                    >
                      Video
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a video lesson
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingLesson({
                        ...editingLesson,
                        type: "theory",
                        content: "",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      editingLesson.type === "theory"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <FileText
                      className={`w-6 h-6 mx-auto mb-2 ${
                        editingLesson.type === "theory"
                          ? "text-purple-600"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        editingLesson.type === "theory"
                          ? "text-purple-900"
                          : "text-gray-600"
                      }`}
                    >
                      Theory
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Text-based content
                    </p>
                  </button>
                </div>
              </div>

              {/* Content based on type */}
              {editingLesson.type === "video" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Video Upload</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <Video className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM up to 500MB
                      </p>
                      <Input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditingLesson({
                              ...editingLesson,
                              content: file.name,
                            });
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" className="mt-3">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    {editingLesson.content && (
                      <p className="text-sm text-green-600">
                        ✓ {editingLesson.content}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Video Duration (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 15"
                      value={editingLesson.duration}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lesson Content</Label>
                    <Textarea
                      placeholder="Write your lesson content here... (Markdown supported)"
                      rows={8}
                      value={editingLesson.content}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          content: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {editingLesson.content.length} characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Reading Time (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={editingLesson.duration}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Free Preview Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Free Preview</p>
                    <p className="text-xs text-muted-foreground">
                      Allow non-enrolled students to preview this lesson
                    </p>
                  </div>
                </div>
                <Switch
                  checked={editingLesson.isFreePreview}
                  onCheckedChange={(checked: boolean) =>
                    setEditingLesson({
                      ...editingLesson,
                      isFreePreview: checked,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeLessonModal}>
              Cancel
            </Button>
            <Button
              onClick={saveLesson}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingLesson &&
              courseData.topics.some((t) =>
                t.lessons.some((l) => l.id === editingLesson.id)
              )
                ? "Save Changes"
                : "Add Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

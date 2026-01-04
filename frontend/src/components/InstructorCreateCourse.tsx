import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Video,

  CheckCircle,
  AlertCircle,
  Info,
  DollarSign,

  BookOpen,
  Target,
  Award,
} from "lucide-react";



import { useNavigate } from "react-router-dom";

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
}

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
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

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
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem("whatYouWillLearn")}
                  >
                    + Add Learning Objective
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
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem("prerequisites")}
                  >
                    + Add Prerequisite
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
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem("targetAudience")}
                  >
                    + Add Target Audience
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
              { step: 4, label: "Settings" },
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
    </div>
  );
}

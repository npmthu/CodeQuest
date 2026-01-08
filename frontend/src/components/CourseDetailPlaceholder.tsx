import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft,
  PlayCircle,
  FileText,
  Code,
  CheckCircle,
  BookOpen
} from "lucide-react";

interface CourseDetailPlaceholderProps {
  courseId: string;
  onBack: () => void;
}

export default function CourseDetailPlaceholder({ courseId, onBack }: CourseDetailPlaceholderProps) {
  // Extract readable name from courseId
  const courseName = courseId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Path
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h2>{courseName}</h2>
              <p className="text-muted-foreground mt-2">
                Course ID: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{courseId}</code>
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">Course Content</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Placeholder Notice */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 mb-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-3">🚧 Course Content Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              This is a placeholder page for <span className="font-medium text-blue-600">{courseName}</span>.
              The actual course content, lessons, and interactive exercises will be available here once implemented.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="py-2 px-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Lessons
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                <Code className="w-4 h-4 mr-2" />
                Coding Exercises
              </Badge>
              <Badge variant="outline" className="py-2 px-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                Quizzes
              </Badge>
            </div>
          </div>
        </Card>

        {/* Mock Course Outline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h4>Video Lectures</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              High-quality video content explaining key concepts and demonstrating practical examples.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Introduction & Overview</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Core Concepts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Advanced Topics</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-green-600" />
              </div>
              <h4>Coding Exercises</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Hands-on coding challenges to practice and reinforce your learning.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Warm-up Exercises</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Practice Problems</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Challenge Problems</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h4>Reading Materials</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive documentation and guides for deeper understanding.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Concept Explanations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Code Examples</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Best Practices</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h4>Assessments</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Quizzes and tests to evaluate your understanding and progress.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Knowledge Checks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Practice Tests</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Final Exam</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled>
            <PlayCircle className="w-4 h-4 mr-2" />
            Start Learning (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}

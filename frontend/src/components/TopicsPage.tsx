import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, BookOpen, FileText, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTopics } from "../hooks/useApi";

export default function TopicsPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const { data: topicsData, isLoading } = useTopics();

  // Filter topics by courseId if provided
  const topics = courseId 
    ? (topicsData || []).filter((t: any) => t.course_id === courseId)
    : (topicsData || []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        {courseId && (
          <button
            onClick={() => navigate(`/courses`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to selected course
          </button>
        )}
        <h2 className="text-3xl font-bold">
          {courseId ? 'Course Topics' : 'All Topics'}
        </h2>
        <p className="text-muted-foreground mt-2">
          Select a topic to view its lessons
        </p>
      </div>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No topics available</h3>
          <p className="text-muted-foreground">
            {courseId ? 'This course has no topics yet.' : 'No topics found in the system.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic: any) => (
            <Card 
              key={topic.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(courseId ? `/courses/${courseId}/lessons/${topic.id}` : `/lessons/${topic.id}`)}
            >
              {/* Topic Icon */}
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>

              {/* Topic Title & Description */}
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {topic.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {topic.description || 'No description available'}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{topic.lesson_count || 0} lessons</span>
                </div>
                {topic.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{topic.estimated_duration}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

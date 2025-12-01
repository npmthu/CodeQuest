import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Clock, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../api/ApiProvider";

interface CoursesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function CoursesPage({ onNavigate }: CoursesPageProps) {
  const api = useApi();

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    }
  });

  const courses = coursesData || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h2 className="text-3xl font-bold">All Courses</h2>
        <p className="text-muted-foreground mt-2">
          Browse and explore our comprehensive course catalog
        </p>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No courses available</h3>
          <p className="text-muted-foreground">Check back later for new courses!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card 
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate('topics', { courseId: course.id })}
            >
              {/* Course Thumbnail */}
              {course.thumbnail_url ? (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white" />
                </div>
              )}

              {/* Course Content */}
              <div className="p-6 space-y-4">
                {/* Title & Difficulty */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {course.title}
                    </h3>
                    {course.difficulty && (
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || 'No description available'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.topic_count || 0} topics</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {course.is_published ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    Draft
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

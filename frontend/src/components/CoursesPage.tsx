import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BookOpen, Clock, Award, Search, Filter, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCourses, useMyEnrollments } from "../hooks/useApi";
import { useState, useMemo } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function CoursesPage() {
  const navigate = useNavigate();

  const { data: coursesData, isLoading: loadingCourses } = useCourses();
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useMyEnrollments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");

  const courses = coursesData || [];
  const enrollments = enrollmentsData || [];

  // Get enrolled course IDs
  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((e: any) => e.course_id));
  }, [enrollments]);

  // Separate enrolled and available courses
  const { enrolledCourses, availableCourses } = useMemo(() => {
    const enrolled = enrollments.map((e: any) => ({
      ...e.course,
      enrollment: e
    }));
    
    const available = courses.filter((c: any) => !enrolledCourseIds.has(c.id));
    
    return { enrolledCourses: enrolled, availableCourses: available };
  }, [courses, enrollments, enrolledCourseIds]);

  // Filter available courses based on search and level
  const filteredAvailableCourses = useMemo(() => {
    return availableCourses.filter((course: any) => {
      const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === "All Levels" || 
                          course.difficulty?.toLowerCase() === selectedLevel.toLowerCase();
      return matchesSearch && matchesLevel;
    });
  }, [availableCourses, searchQuery, selectedLevel]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CourseCard = ({ course, enrolled = false }: { course: any; enrolled?: boolean }) => (
    <Card 
      key={course.id}
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-blue-300 relative"
      onClick={() => navigate(enrolled ? `/courses/${course.id}/topics` : `/courses/${course.id}/enroll`)}
    >
      {enrolled && (
        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          Enrolled
        </div>
      )}
      
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
        </div>
      </div>
    </Card>
  );

  if (loadingCourses || loadingEnrollments) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Banner */}
      <div className="relative h-80 overflow-hidden">
        <ImageWithFallback
          src="https://media.licdn.com/dms/image/v2/C4D12AQESj72-s5gEKg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1626753867110?e=2147483647&v=beta&t=rtLXIlbaUs8nhMnaC9aEv08PhyGTjFfwrgE8ZdCmziM"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-12">
        {/* My Enrolled Courses Section */}
        {enrolledCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Enrolled Courses</h2>
                <p className="text-gray-600 mt-1">Continue your learning journey</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'Course' : 'Courses'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} enrolled={true} />
              ))}
            </div>
          </section>
        )}

        {/* All Available Courses Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {enrolledCourses.length > 0 ? 'Explore More Courses' : 'All Courses'}
            </h2>
            <p className="text-gray-600 mt-1">Browse and enroll in courses to start learning</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Filter className="w-5 h-5" />
                <span>Filters:</span>
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {(searchQuery || selectedLevel !== "All Levels") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLevel("All Levels");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredAvailableCourses.length} of {availableCourses.length} available courses
          </div>

          {/* Courses Grid */}
          {filteredAvailableCourses.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {availableCourses.length === 0 ? "No available courses" : "No courses match your filters"}
              </h3>
              <p className="text-muted-foreground">
                {availableCourses.length === 0 
                  ? "All courses are enrolled or check back later!" 
                  : "Try adjusting your search or filters"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} enrolled={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

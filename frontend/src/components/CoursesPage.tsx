import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  BookOpen,
  Clock,
  Award,
  Search,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCourses, useMyEnrollments } from "../hooks/useApi";
import { useState, useMemo } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type SortOption =
  | "title-asc"
  | "title-desc"
  | "difficulty-asc"
  | "difficulty-desc"
  | "topics-asc"
  | "topics-desc";

const difficultyOrder: Record<string, number> = {
  easy: 1,
  beginner: 1,
  medium: 2,
  intermediate: 2,
  hard: 3,
  advanced: 3,
};

export default function CoursesPage() {
  const navigate = useNavigate();

  const { data: coursesData, isLoading: loadingCourses } = useCourses();
  const { data: enrollmentsData, isLoading: loadingEnrollments } =
    useMyEnrollments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");

  const courses = coursesData || [];
  const enrollments = enrollmentsData || [];

  // Get enrolled course IDs
  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((e: any) => e.course_id));
  }, [enrollments]);

  // Helper function to filter courses by search and level
  const filterCourses = (courseList: any[]) => {
    return courseList.filter((course: any) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        course.title?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower);

      const courseDifficulty = course.difficulty?.toLowerCase() || "";
      const matchesLevel =
        selectedLevel === "All Levels" ||
        courseDifficulty === selectedLevel.toLowerCase() ||
        // Handle mapping between easy/medium/hard and beginner/intermediate/advanced
        (selectedLevel.toLowerCase() === "beginner" &&
          courseDifficulty === "easy") ||
        (selectedLevel.toLowerCase() === "intermediate" &&
          courseDifficulty === "medium") ||
        (selectedLevel.toLowerCase() === "advanced" &&
          courseDifficulty === "hard") ||
        (selectedLevel.toLowerCase() === "easy" &&
          courseDifficulty === "beginner") ||
        (selectedLevel.toLowerCase() === "medium" &&
          courseDifficulty === "intermediate") ||
        (selectedLevel.toLowerCase() === "hard" &&
          courseDifficulty === "advanced");

      return matchesSearch && matchesLevel;
    });
  };

  // Helper function to sort courses
  const sortCourses = (courseList: any[]) => {
    return [...courseList].sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        case "difficulty-asc":
          return (
            (difficultyOrder[a.difficulty?.toLowerCase()] || 0) -
            (difficultyOrder[b.difficulty?.toLowerCase()] || 0)
          );
        case "difficulty-desc":
          return (
            (difficultyOrder[b.difficulty?.toLowerCase()] || 0) -
            (difficultyOrder[a.difficulty?.toLowerCase()] || 0)
          );
        case "topics-asc":
          return (a.topic_count || 0) - (b.topic_count || 0);
        case "topics-desc":
          return (b.topic_count || 0) - (a.topic_count || 0);
        default:
          return 0;
      }
    });
  };

  // Separate enrolled and available courses
  const { enrolledCourses, availableCourses } = useMemo(() => {
    const enrolled = enrollments.map((e: any) => ({
      ...e.course,
      enrollment: e,
    }));

    const available = courses.filter((c: any) => !enrolledCourseIds.has(c.id));

    return { enrolledCourses: enrolled, availableCourses: available };
  }, [courses, enrollments, enrolledCourseIds]);

  // Filter and sort enrolled courses
  const filteredEnrolledCourses = useMemo(() => {
    const filtered = filterCourses(enrolledCourses);
    return sortCourses(filtered);
  }, [enrolledCourses, searchQuery, selectedLevel, sortBy]);

  // Filter and sort available courses
  const filteredAvailableCourses = useMemo(() => {
    const filtered = filterCourses(availableCourses);
    return sortCourses(filtered);
  }, [availableCourses, searchQuery, selectedLevel, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const CourseCard = ({
    course,
    enrolled = false,
  }: {
    course: any;
    enrolled?: boolean;
  }) => (
    <Card
      key={course.id}
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer bg-white border-2 hover:border-blue-300 relative"
      onClick={() =>
        navigate(
          enrolled ? `/courses/${course.id}` : `/courses/${course.id}/enroll`
        )
      }
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
            {course.description || "No description available"}
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
        {/* Enhanced Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 -mt-16 relative z-10 border border-gray-100">
          {/* Search Input */}
          <div className="relative max-w-3xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters & Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Filter className="w-5 h-5 text-blue-500" />
                <span>Level:</span>
              </div>
              <div className="flex gap-2">
                {["All Levels", "Beginner", "Intermediate", "Advanced"].map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedLevel === level
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                <span>Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="difficulty-asc">Difficulty (Easy → Hard)</option>
                <option value="difficulty-desc">
                  Difficulty (Hard → Easy)
                </option>
                <option value="topics-asc">Topics (Least)</option>
                <option value="topics-desc">Topics (Most)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || selectedLevel !== "All Levels") && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 text-blue-700"
                  >
                    Search: "
                    {searchQuery.length > 20
                      ? searchQuery.slice(0, 20) + "..."
                      : searchQuery}
                    "
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {selectedLevel !== "All Levels" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-purple-100 text-purple-700"
                  >
                    {selectedLevel}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedLevel("All Levels")}
                    />
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLevel("All Levels");
                  setSortBy("title-asc");
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
        {/* My Enrolled Courses Section */}
        {enrolledCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  My Enrolled Courses
                </h2>
                <p className="text-gray-600 mt-1">
                  Continue your learning journey
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredEnrolledCourses.length === enrolledCourses.length
                  ? `${enrolledCourses.length} ${
                      enrolledCourses.length === 1 ? "Course" : "Courses"
                    }`
                  : `${filteredEnrolledCourses.length} of ${enrolledCourses.length} Courses`}
              </Badge>
            </div>
            {filteredEnrolledCourses.length === 0 ? (
              <Card className="p-8 text-center bg-white border-dashed border-2 border-gray-200">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  No enrolled courses match your search
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrolledCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} enrolled={true} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* All Available Courses Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {enrolledCourses.length > 0
                ? "Explore More Courses"
                : "All Courses"}
            </h2>
            <p className="text-gray-600 mt-1">
              Browse and enroll in courses to start learning
            </p>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredAvailableCourses.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {availableCourses.length}
              </span>{" "}
              available courses
            </div>
            {filteredAvailableCourses.length > 0 && (
              <div className="text-sm text-gray-500">
                Sorted by:{" "}
                <span className="font-medium text-gray-700">
                  {sortBy === "title-asc" && "Title (A-Z)"}
                  {sortBy === "title-desc" && "Title (Z-A)"}
                  {sortBy === "difficulty-asc" && "Difficulty (Easy → Hard)"}
                  {sortBy === "difficulty-desc" && "Difficulty (Hard → Easy)"}
                  {sortBy === "topics-asc" && "Topics (Least)"}
                  {sortBy === "topics-desc" && "Topics (Most)"}
                </span>
              </div>
            )}
          </div>

          {/* Courses Grid */}
          {filteredAvailableCourses.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {availableCourses.length === 0
                  ? "No available courses"
                  : "No courses match your filters"}
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

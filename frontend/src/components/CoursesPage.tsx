import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookOpen, Clock, Award, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../api/ApiProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function CoursesPage() {
  const navigate = useNavigate();
  const api = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    }
  });

  const courses = coursesData || [];

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'immediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
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
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="glass-card mb-8 overflow-hidden">
        <div className="relative h-80">
          <ImageWithFallback
            src="https://media.licdn.com/dms/image/v2/C4D12AQESj72-s5gEKg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1626753867110?e=2147483647&v=beta&t=rtLXIlbaUs8nhMnaC9aEv08PhyGTjFfwrgE8ZdCmziM"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/90 via-blue-300/70 to-blue-200/50 flex items-center">
            <div className="px-12 max-w-2xl">
              <div className="inline-block px-3 py-1 bg-[#2563EB] rounded-full mb-4">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-3 items-center">
          <Search className="w-6 h-6 text-gray-900 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
          />
          <button
            type="button"
            className="flex-shrink-0 px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
          >
            <Search className="w-5 h-5" />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>


      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <span className="text-gray-900 font-medium">Filters:</span>
        </div>
        
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#2563EB] cursor-pointer"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: any) => (
            <Card 
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/courses/${course.id}/topics`)}
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

              <div className="p-6 space-y-4">
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

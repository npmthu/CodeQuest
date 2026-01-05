import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { adminApi } from "../../services/api";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
  difficulty?: string;
  is_published?: boolean;
  partner_id?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  topic_id?: string;
  topic_name?: string;
  instructor_id?: string;
  instructor_name?: string;
  price?: number;
  is_premium?: boolean;
  is_featured?: boolean;
  is_hot?: boolean;
  enrollment_count?: number;
  rating?: number;
  image_url?: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<string[]>(["All"]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail_url: "",
    difficulty: "beginner",
    is_published: false,
    partner_id: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCourses(1, 100);
      if (response.success && response.data) {
        const courseData = response.data.courses || response.data || [];
        setCourses(courseData);

        // Extract unique topics
        const uniqueTopics = [
          ...new Set(
            courseData.map((c: Course) => c.topic_name).filter(Boolean)
          ),
        ] as string[];
        setTopics(["All", ...uniqueTopics]);
      } else {
        toast.error(response.error || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTopic =
      selectedTopic === "All" || course.topic_name === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await adminApi.deleteCourse(courseId);
      if (response.success) {
        toast.success("Course deleted successfully");
        fetchCourses();
      } else {
        toast.error(response.error || "Failed to delete course");
      }
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const toggleFeatured = async (course: Course) => {
    try {
      const response = await adminApi.updateCourse(course.id, {
        is_featured: !course.is_featured,
      });
      if (response.success) {
        toast.success(
          `Course ${!course.is_featured ? "featured" : "unfeatured"}`
        );
        fetchCourses();
      }
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  const toggleHot = async (course: Course) => {
    try {
      const response = await adminApi.updateCourse(course.id, {
        is_hot: !course.is_hot,
      });
      if (response.success) {
        toast.success(
          `Course ${!course.is_hot ? "marked as hot" : "unmarked"}`
        );
        fetchCourses();
      }
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  const handleCreateCourse = async () => {
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    // Auto-generate slug from title if not provided
    const slug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    try {
      const response = await adminApi.createCourse({
        title: formData.title,
        slug: slug,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url,
        difficulty: formData.difficulty,
        is_published: formData.is_published,
        partner_id: formData.partner_id || null,
      });

      if (response.success) {
        toast.success("Course created successfully");
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          slug: "",
          description: "",
          thumbnail_url: "",
          difficulty: "beginner",
          is_published: false,
          partner_id: "",
        });
        fetchCourses();
      } else {
        toast.error(response.error || "Failed to create course");
      }
    } catch (error) {
      toast.error("Failed to create course");
    }
  };

  const getDefaultImage = (topic?: string) => {
    const images: Record<string, string> = {
      Python:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
      Java: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
      "C/C++":
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
      DSA: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
      SQL: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      Web: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
    };
    return (
      images[topic || ""] ||
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1E3A8A] mb-2">Course Management</h1>
          <p className="text-gray-600">
            Create, edit, and manage courses and lessons
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Course Title *</Label>
                <Input
                  placeholder="Enter course title"
                  className="rounded-xl"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setFormData({ ...formData, title, slug });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL-friendly identifier)</Label>
                <Input
                  placeholder="course-slug (auto-generated from title)"
                  className="rounded-xl"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Leave empty to auto-generate from title
                </p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter course description"
                  className="rounded-xl"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select
                    className="w-full h-10 rounded-xl border border-gray-300 px-3"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Partner ID (Optional)</Label>
                  <Input
                    placeholder="UUID of business partner"
                    className="rounded-xl"
                    value={formData.partner_id}
                    onChange={(e) =>
                      setFormData({ ...formData, partner_id: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input
                  placeholder="https://..."
                  className="rounded-xl"
                  value={formData.thumbnail_url}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail_url: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked })
                    }
                  />
                  <Label>Published (visible to users)</Label>
                </div>
              </div>
              <Button
                className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl"
                onClick={handleCreateCourse}
              >
                Create Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-300"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopic === topic ? "default" : "outline"}
              onClick={() => setSelectedTopic(topic)}
              className={`rounded-xl ${
                selectedTopic === topic
                  ? "bg-[#2563EB] hover:bg-[#1E3A8A]"
                  : "hover:bg-gray-100"
              }`}
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No courses found. Create your first course!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="rounded-2xl border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image_url || getDefaultImage(course.topic_name)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDefaultImage(
                      course.topic_name
                    );
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {course.is_hot && (
                    <Badge className="bg-red-500 text-white">🔥 Hot</Badge>
                  )}
                  {course.is_featured && (
                    <Badge className="bg-purple-500 text-white">Featured</Badge>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-[#2563EB] text-white">
                    {course.topic_name || "General"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description || "No description"}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      ⭐ {course.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {(course.enrollment_count || 0).toLocaleString()} students
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {!course.price || course.price === 0
                        ? "Free"
                        : `${course.price.toLocaleString()} VND`}
                    </span>
                  </div>
                  {course.is_premium && (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(course)}
                    className={`rounded-xl ${
                      course.is_featured ? "bg-purple-50 border-purple-300" : ""
                    }`}
                  >
                    {course.is_featured ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleHot(course)}
                    className={`rounded-xl ${
                      course.is_hot ? "bg-red-50 border-red-300" : ""
                    }`}
                  >
                    🔥
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

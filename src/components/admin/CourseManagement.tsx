import { useState } from "react";
import { Plus, Search, Edit, Trash2, DollarSign, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";

interface Course {
  id: string;
  title: string;
  topic: string;
  description: string;
  instructor: string;
  price: number;
  isPremium: boolean;
  isFeatured: boolean;
  isHot: boolean;
  enrollments: number;
  rating: number;
  imageUrl: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "C++ Programming Fundamentals",
    topic: "C/C++",
    description: "Master the basics of C++ programming",
    instructor: "Nguyễn Văn A",
    price: 299000,
    isPremium: false,
    isFeatured: true,
    isHot: true,
    enrollments: 2800,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
  },
  {
    id: "2",
    title: "Python for Data Science",
    topic: "Python",
    description: "Learn Python for data analysis and ML",
    instructor: "Trần Thị B",
    price: 399000,
    isPremium: true,
    isFeatured: true,
    isHot: true,
    enrollments: 3500,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
  },
  {
    id: "3",
    title: "Java Object-Oriented Programming",
    topic: "Java",
    description: "Deep dive into OOP with Java",
    instructor: "Lê Văn C",
    price: 0,
    isPremium: false,
    isFeatured: false,
    isHot: false,
    enrollments: 2200,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
  },
  {
    id: "4",
    title: "Data Structures & Algorithms",
    topic: "DSA",
    description: "Essential DSA for interviews",
    instructor: "Phạm Thị D",
    price: 499000,
    isPremium: true,
    isFeatured: true,
    isHot: true,
    enrollments: 4100,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
  },
  {
    id: "5",
    title: "SQL Database Design",
    topic: "SQL",
    description: "Master database design and queries",
    instructor: "Hoàng Văn E",
    price: 0,
    isPremium: false,
    isFeatured: false,
    isHot: false,
    enrollments: 1800,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
  },
  {
    id: "6",
    title: "Modern Web Development",
    topic: "Web",
    description: "Build modern web apps with React",
    instructor: "Vũ Thị F",
    price: 599000,
    isPremium: true,
    isFeatured: true,
    isHot: false,
    enrollments: 3200,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
  },
];

const topics = ["All", "C/C++", "Python", "Java", "DSA", "SQL", "Web"];

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "All" || course.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter((course) => course.id !== courseId));
  };

  const toggleFeatured = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, isFeatured: !course.isFeatured } : course
      )
    );
  };

  const toggleHot = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, isHot: !course.isHot } : course
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1E3A8A] mb-2">Course Management</h1>
          <p className="text-gray-600">Create, edit, and manage courses and lessons</p>
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
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input placeholder="Enter course title" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Enter course description" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input placeholder="e.g., Python" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Price (VND)</Label>
                  <Input type="number" placeholder="0 for free" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Input placeholder="Instructor name" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input placeholder="https://..." className="rounded-xl" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Premium Only</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Hot</Label>
                </div>
              </div>
              <Button className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="rounded-2xl border-gray-200 overflow-hidden hover:shadow-lg transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {course.isHot && (
                  <Badge className="bg-red-500 text-white">🔥 Hot</Badge>
                )}
                {course.isFeatured && (
                  <Badge className="bg-purple-500 text-white">Featured</Badge>
                )}
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-[#2563EB] text-white">{course.topic}</Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <h3 className="text-lg text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">⭐ {course.rating}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {course.enrollments.toLocaleString()} students
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {course.price === 0
                      ? "Free"
                      : `${course.price.toLocaleString()} VND`}
                  </span>
                </div>
                {course.isPremium && (
                  <Badge className="bg-yellow-100 text-yellow-700">Premium</Badge>
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
                  onClick={() => toggleFeatured(course.id)}
                  className={`rounded-xl ${
                    course.isFeatured ? "bg-purple-50 border-purple-300" : ""
                  }`}
                >
                  {course.isFeatured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleHot(course.id)}
                  className={`rounded-xl ${
                    course.isHot ? "bg-red-50 border-red-300" : ""
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
    </div>
  );
}

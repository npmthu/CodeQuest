import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  GraduationCap,
  Loader2,
  BookOpen,
  Upload,
  Download,
  FolderKanban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../api/ApiProvider";

interface LearnerData {
  id: string;
  email: string;
  name: string;
  avatar: string;
  joinedAt: string;
  enrolledCourses: {
    courseId: string;
    courseName: string;
    status: string;
    progress: number;
    enrolledAt: string;
    completedAt: string | null;
  }[];
  status: string;
}

interface CourseData {
  id: string;
  title: string;
  enrolledCount: number;
  completedCount: number;
}

export default function BusinessAccountManagement() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    course_id: "",
  });
  const [filterCourse, setFilterCourse] = useState("all");

  // Fetch learners from API
  const { data: learnersData, isLoading: learnersLoading } = useQuery({
    queryKey: ['business-learners'],
    queryFn: async () => {
      const response = await api.get('/business/learners');
      return response.data;
    },
  });

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['business-courses'],
    queryFn: async () => {
      const response = await api.get('/business/courses');
      return response.data;
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['business-stats'],
    queryFn: async () => {
      const response = await api.get('/business/stats');
      return response.data;
    },
  });

  // Add learner mutation
  const addLearnerMutation = useMutation({
    mutationFn: async (data: { email: string; course_id: string }) => {
      const response = await api.post('/business/learners', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-learners'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      setIsAddLearnerOpen(false);
      setFormData({ email: "", course_id: "" });
    },
  });

  // Remove learner mutation
  const removeLearnerMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await api.patch(`/business/learners/${enrollmentId}`, { method: 'DELETE' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-learners'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
    },
  });

  const learners: LearnerData[] = learnersData?.learners ?? [];
  const courses: CourseData[] = coursesData?.courses ?? [];

  // Filter learners
  const filteredLearners = learners.filter(learner => {
    const matchesSearch = !searchQuery || 
      learner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = filterCourse === "all" || 
      learner.enrolledCourses?.some(c => c.courseId === filterCourse);
    
    return matchesSearch && matchesCourse;
  });

  const handleAddLearner = async () => {
    if (!formData.email.trim()) {
      alert("Please enter learner email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!formData.course_id) {
      alert("Please select a course");
      return;
    }

    try {
      await addLearnerMutation.mutateAsync(formData);
      alert("Learner enrolled successfully!");
    } catch (error: any) {
      alert("Failed to enroll learner: " + (error.message || "Unknown error"));
    }
  };

  const handleRemoveLearner = async (
    learnerId: string,
    learnerName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to remove ${learnerName} from this course?`
      )
    ) {
      return;
    }

    try {
      await removeLearnerMutation.mutateAsync(learnerId);
      alert("Learner removed successfully!");
    } catch (error: any) {
      alert("Failed to remove learner: " + (error.message || "Unknown error"));
    }
  };

  const handleExportLearners = async () => {
    try {
      const response = await api.post('/business/learners/export');
      // Trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'learners.csv';
      a.click();
    } catch (error: any) {
      alert("Failed to export learners: " + (error.message || "Unknown error"));
    }
  };

  const handleImportCSV = async () => {
    alert("Import CSV feature coming soon");
  };

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-green-100 text-green-700"
      : status === "enrolled"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            Learner Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage learners enrolled in your courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleImportCSV}
            className="rounded-xl hover:bg-blue-50 hover:border-blue-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddLearnerOpen} onOpenChange={setIsAddLearnerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                <UserPlus className="w-4 h-4 mr-2" />
                Enroll Learner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Enroll Learner in Course</DialogTitle>
                <DialogDescription>
                  Add an existing user to one of your courses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    The user must already have an account on the platform
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Select Course *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value: string) =>
                      setFormData((prev) => ({ ...prev, course_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddLearnerOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25"
                  onClick={handleAddLearner}
                  disabled={addLearnerMutation.isPending}
                >
                  {addLearnerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Enroll Learner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Learners</p>
              <p className="text-2xl font-bold text-gray-900">{statsData?.totalLearners ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Instructors</p>
              <p className="text-2xl font-bold text-gray-900">{statsData?.activeInstructors ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Courses</p>
              <p className="text-2xl font-bold text-gray-900">{statsData?.totalCourses ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{statsData?.averageCompletion ?? 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Learners List */}
      <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Enrolled Learners</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search learners..."
                className="pl-10 h-10 w-64 rounded-xl border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-[200px] h-10 rounded-xl">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportLearners}
              className="h-10 w-10 rounded-xl hover:bg-blue-50"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {learnersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">No learners found</h4>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterCourse !== "all" 
                ? "Try adjusting your filters"
                : "Enroll learners in your courses to see them here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Learner
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Courses
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLearners.map((learner) => (
                  <tr
                    key={learner.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden">
                          {learner.avatar ? (
                            <img src={learner.avatar} alt={learner.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm text-white font-medium">
                              {learner.name?.substring(0, 2).toUpperCase() || '??'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {learner.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {learner.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {learner.enrolledCourses?.slice(0, 2).map((course, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Badge className={getStatusColor(course.status)}>
                              {course.courseName?.substring(0, 25) || 'Course'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {course.progress || 0}%
                            </span>
                          </div>
                        ))}
                        {(learner.enrolledCourses?.length || 0) > 2 && (
                          <span className="text-xs text-gray-500">
                            +{learner.enrolledCourses!.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {learner.joinedAt ? new Date(learner.joinedAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl"
                        >
                          <DropdownMenuItem
                            className="rounded-lg"
                            onClick={() =>
                              handleRemoveLearner(learner.id, learner.name)
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

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
  GraduationCap,
  Users,
  Star,
  BookOpen,
  Search,
  UserPlus,
  MoreVertical,
  Trash2,
  Mail,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../api/ApiProvider";

interface InstructorData {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  joinedAt: string;
  coursesCount: number;
  studentsCount: number;
}

interface CourseData {
  id: string;
  title: string;
}

export default function BusinessInstructorManagement() {
  const api = useApi();
  const queryClient = useQueryClient();

  const [isAddInstructorOpen, setIsAddInstructorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [formData, setFormData] = useState({
    email: "",
    role: "instructor",
  });

  // Fetch instructors from API
  const { data: instructorsData, isLoading: instructorsLoading } = useQuery({
    queryKey: ["business-instructors"],
    queryFn: async () => {
      const response = await api.get("/business/instructors");
      return response.data;
    },
  });

  // Fetch courses for context
  const { data: coursesData } = useQuery({
    queryKey: ["business-courses"],
    queryFn: async () => {
      const response = await api.get("/business/courses");
      return response.data;
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["business-stats"],
    queryFn: async () => {
      const response = await api.get("/business/stats");
      return response.data;
    },
  });

  const instructors: InstructorData[] = instructorsData?.instructors ?? [];
  const courses: CourseData[] = coursesData?.courses ?? [];

  // Add instructor mutation
  const addInstructorMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await api.post("/business/instructors", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-instructors"] });
      queryClient.invalidateQueries({ queryKey: ["business-stats"] });
      setIsAddInstructorOpen(false);
      setFormData({ email: "", role: "instructor" });
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      alert(error.response?.data?.error || "Failed to add instructor");
    },
  });

  // Remove instructor mutation
  const removeInstructorMutation = useMutation({
    mutationFn: async (instructorId: string) => {
      const response = await api.delete(`/business/instructors/${instructorId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-instructors"] });
      queryClient.invalidateQueries({ queryKey: ["business-stats"] });
    },
  });

  // Filter instructors
  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch =
      instructor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || instructor.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddInstructor = () => {
    if (!formData.email.trim()) {
      alert("Please enter instructor email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    addInstructorMutation.mutate(formData);
  };

  const handleRemoveInstructor = (instructorId: string, instructorName: string) => {
    if (confirm(`Are you sure you want to remove "${instructorName}" as an instructor?`)) {
      removeInstructorMutation.mutate(instructorId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "lead":
        return "bg-purple-100 text-purple-700";
      case "senior":
        return "bg-blue-100 text-blue-700";
      case "instructor":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            Instructor Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage instructors for your organization`s courses
          </p>
        </div>
        <Dialog open={isAddInstructorOpen} onOpenChange={setIsAddInstructorOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Instructor</DialogTitle>
              <DialogDescription>
                Invite a user to become an instructor for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="instructor@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  The user must already have an account on the platform
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="senior">Senior Instructor</SelectItem>
                    <SelectItem value="lead">Lead Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddInstructorOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddInstructor}
                disabled={addInstructorMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {addInstructorMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Instructor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Instructors</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.totalInstructors ?? instructors.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.totalCourses ?? courses.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Learners</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.totalLearners ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.averageCompletion ?? 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="senior">Senior Instructor</SelectItem>
              <SelectItem value="lead">Lead Instructor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Instructor List */}
      {instructorsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredInstructors.length === 0 ? (
        <Card className="p-12 rounded-2xl border-0 shadow-lg shadow-gray-200/50 text-center">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">No instructors found</h4>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterRole !== "all"
              ? "Try adjusting your filters"
              : "Add your first instructor to get started"}
          </p>
          {!searchQuery && filterRole === "all" && (
            <Button
              onClick={() => setIsAddInstructorOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Instructor
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-lg text-white font-semibold">
                      {instructor.avatar || instructor.name?.charAt(0) || instructor.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {instructor.name || "Unnamed"}
                    </h4>
                    <p className="text-sm text-gray-500">{instructor.email}</p>
                    <Badge className={`mt-1 ${getRoleColor(instructor.role)}`}>
                      {instructor.role || "instructor"}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="rounded-lg">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRemoveInstructor(instructor.id, instructor.name || instructor.email)}
                      className="text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Courses</p>
                    <p className="font-semibold text-gray-900">{instructor.coursesCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-semibold text-gray-900">{instructor.studentsCount || 0}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Joined</p>
                    <p className="font-semibold text-gray-900">{formatDate(instructor.joinedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

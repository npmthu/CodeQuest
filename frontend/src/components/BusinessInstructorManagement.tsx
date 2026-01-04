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
  Edit,
  Trash2,
  Mail,
  Award,
  Clock,

  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import { useNavigate } from "react-router-dom";

export default function BusinessInstructorManagement() {
  const navigate = useNavigate();
  const [isAddInstructorOpen, setIsAddInstructorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCohort, setFilterCohort] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    cohorts: [],
    bio: "",
  });

  const instructors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      email: "sarah.chen@techcorp.com",
      specialization: "Data Science & Machine Learning",
      cohorts: ["Data Science Bootcamp", "ML Advanced"],
      students: 142,
      courses: 8,
      rating: 4.9,
      reviews: 89,
      status: "Active",
      avatar: "SC",
      joinedDate: "Jan 2023",
      completionRate: 92,
      responseTime: "< 2 hours",
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      email: "michael.j@techcorp.com",
      specialization: "Software Engineering",
      cohorts: ["Software Engineering 2024", "Web Dev Fast Track"],
      students: 198,
      courses: 12,
      rating: 4.8,
      reviews: 124,
      status: "Active",
      avatar: "MJ",
      joinedDate: "Mar 2023",
      completionRate: 88,
      responseTime: "< 3 hours",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@techcorp.com",
      specialization: "UX/UI Design",
      cohorts: ["Design Track"],
      students: 76,
      courses: 6,
      rating: 4.7,
      reviews: 54,
      status: "Active",
      avatar: "ER",
      joinedDate: "Jun 2023",
      completionRate: 85,
      responseTime: "< 4 hours",
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.k@techcorp.com",
      specialization: "Mobile Development",
      cohorts: ["Mobile App Development"],
      students: 64,
      courses: 5,
      rating: 4.6,
      reviews: 42,
      status: "Active",
      avatar: "DK",
      joinedDate: "Aug 2023",
      completionRate: 82,
      responseTime: "< 5 hours",
    },
  ];

  const performanceData = [
    { name: "Dr. Sarah Chen", students: 142, rating: 4.9, completion: 92 },
    {
      name: "Prof. Michael Johnson",
      students: 198,
      rating: 4.8,
      completion: 88,
    },
    { name: "Emily Rodriguez", students: 76, rating: 4.7, completion: 85 },
    { name: "David Kim", students: 64, rating: 4.6, completion: 82 },
  ];

  const cohortAssignments = [
    {
      cohort: "Software Engineering 2024",
      instructors: ["Prof. Michael Johnson", "Dr. Sarah Chen"],
      learners: 85,
      avgRating: 4.8,
    },
    {
      cohort: "Data Science Bootcamp",
      instructors: ["Dr. Sarah Chen"],
      learners: 62,
      avgRating: 4.9,
    },
    {
      cohort: "Web Dev Fast Track",
      instructors: ["Prof. Michael Johnson", "Emily Rodriguez"],
      learners: 124,
      avgRating: 4.7,
    },
    {
      cohort: "Mobile App Development",
      instructors: ["David Kim"],
      learners: 48,
      avgRating: 4.6,
    },
  ];

  // ============= INSTRUCTOR HANDLERS =============
  const handleAddInstructor = async () => {
    if (!formData.name.trim()) {
      alert("Please enter instructor name");
      return;
    }
    if (!formData.email.trim()) {
      alert("Please enter instructor email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!formData.specialization.trim()) {
      alert("Please enter specialization");
      return;
    }

    try {
      // Call API to add instructor
      // await addInstructorMutation.mutateAsync({
      //   name: formData.name,
      //   email: formData.email,
      //   specialization: formData.specialization,
      //   cohorts: formData.cohorts,
      //   bio: formData.bio
      // });

      setFormData({
        name: "",
        email: "",
        specialization: "",
        cohorts: [],
        bio: "",
      });
      setIsAddInstructorOpen(false);
      alert("Instructor added successfully!");
    } catch (error: any) {
      alert("Failed to add instructor: " + (error.message || "Unknown error"));
    }
  };

  const handleEditInstructor = async (_instructorId: number) => {
    try {
      // Call API to update instructor
      // await updateInstructorMutation.mutateAsync({
      //   instructorId,
      //   ...formData
      // });
      alert("Instructor updated successfully!");
    } catch (error: any) {
      alert(
        "Failed to update instructor: " + (error.message || "Unknown error")
      );
    }
  };

  const handleRemoveInstructor = async (
    _instructorId: number,
    instructorName: string
  ) => {
    if (!confirm(`Are you sure you want to remove ${instructorName}?`)) {
      return;
    }

    try {
      // Call API to remove instructor
      // await removeInstructorMutation.mutateAsync(instructorId);
      alert("Instructor removed successfully!");
    } catch (error: any) {
      alert(
        "Failed to remove instructor: " + (error.message || "Unknown error")
      );
    }
  };

  const handleSendMessage = async (
    _instructorId: number,
    instructorName: string
  ) => {
    const message = prompt(`Send message to ${instructorName}:`);
    if (!message) return;

    try {
      // Call API to send message
      // await sendMessageMutation.mutateAsync({
      //   userId: instructorId,
      //   message
      // });
      alert("Message sent successfully!");
    } catch (error: any) {
      alert("Failed to send message: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Instructor Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage instructors and their assignments across cohorts
          </p>
        </div>
        <Dialog
          open={isAddInstructorOpen}
          onOpenChange={setIsAddInstructorOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Instructor</DialogTitle>
              <DialogDescription>
                Add an instructor to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="e.g., Dr. Jane Smith"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="jane.smith@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input
                  placeholder="e.g., Machine Learning, Web Development"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Assign to Cohorts</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cohorts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="se-2024">
                      Software Engineering 2024
                    </SelectItem>
                    <SelectItem value="ds-q1">Data Science Bootcamp</SelectItem>
                    <SelectItem value="web-ft">
                      Web Development Fast Track
                    </SelectItem>
                    <SelectItem value="mobile">
                      Mobile App Development
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bio/Introduction</Label>
                <Input
                  placeholder="Brief introduction about the instructor"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddInstructorOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddInstructor}
              >
                Add Instructor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-muted-foreground">Total Instructors</p>
          <p className="text-2xl mt-1">{instructors.length}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">Students Taught</p>
          <p className="text-2xl mt-1">
            {instructors.reduce((sum, i) => sum + i.students, 0)}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-sm text-muted-foreground">Avg. Rating</p>
          <p className="text-2xl mt-1">
            {(
              instructors.reduce((sum, i) => sum + i.rating, 0) /
              instructors.length
            ).toFixed(1)}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-muted-foreground">Total Courses</p>
          <p className="text-2xl mt-1">
            {instructors.reduce((sum, i) => sum + i.courses, 0)}
          </p>
        </Card>
      </div>

      {/* Instructor Performance Chart */}
      <Card className="p-6">
        <h3 className="mb-6">Instructor Performance Overview</h3>
        <ChartContainer
          config={{
            students: {
              label: "Students",
              color: "hsl(var(--chart-1))",
            },
            completion: {
              label: "Completion Rate (%)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-64"
        >
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="students" fill="#2563EB" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completion" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Instructors List */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search instructors..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCohort} onValueChange={setFilterCohort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by cohort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              <SelectItem value="se-2024">Software Engineering</SelectItem>
              <SelectItem value="ds-q1">Data Science</SelectItem>
              <SelectItem value="web-ft">Web Development</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl text-blue-600">
                    {instructor.avatar}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4>{instructor.name}</h4>
                        <Badge className="bg-green-100 text-green-700">
                          {instructor.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {instructor.specialization}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {instructor.email} • Joined {instructor.joinedDate}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditInstructor(instructor.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleSendMessage(instructor.id, instructor.name)
                          }
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/instructor/analytics")}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleRemoveInstructor(
                              instructor.id,
                              instructor.name
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-muted-foreground">
                          Students
                        </p>
                      </div>
                      <p className="text-lg">{instructor.students}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                      <p className="text-lg">{instructor.courses}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <p className="text-lg">{instructor.rating}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-muted-foreground">
                          Completion
                        </p>
                      </div>
                      <p className="text-lg">{instructor.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-muted-foreground">
                          Response
                        </p>
                      </div>
                      <p className="text-sm">{instructor.responseTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      Assigned Cohorts:
                    </span>
                    {instructor.cohorts.map((cohort, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cohort}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Cohort Assignments */}
      <Card className="p-6">
        <h3 className="mb-6">Cohort-Instructor Assignments</h3>
        <div className="space-y-4">
          {cohortAssignments.map((assignment, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm">{assignment.cohort}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {assignment.learners} learners • Avg. Rating:{" "}
                    {assignment.avgRating}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3 mr-2" />
                  Reassign
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {assignment.instructors.map((instructor, i) => (
                  <Badge key={i} className="bg-blue-100 text-blue-700">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {instructor}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

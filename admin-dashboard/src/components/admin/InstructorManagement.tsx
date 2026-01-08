import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { ValidatedTextarea } from "../ui/validated-textarea";
import {
  Search,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreVertical,
  Star,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Loader2,
  Mail,
  AlertTriangle,
  UserCheck,
  UserX,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

interface InstructorApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  expertise: string[];
  experience: string;
  bio: string;
  linkedIn?: string;
  website?: string;
  portfolio?: string;
  education?: string;
  certifications?: string[];
  currentJob?: string;
  whyInstructor: string;
  coursePlan?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface ApprovedInstructor {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "suspended" | "inactive";
  joinedAt: string;
  expertise: string[];
  totalCourses: number;
  totalStudents: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
  lastActive: string;
}

export default function InstructorManagement() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [instructors, setInstructors] = useState<ApprovedInstructor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"applications" | "instructors">(
    "applications"
  );

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<InstructorApplication | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejectionTouched, setRejectionTouched] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<ApprovedInstructor | null>(null);

  // Mock data
  const mockApplications: InstructorApplication[] = [
    {
      id: "app-1",
      userId: "user-101",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@university.edu",
      avatar: "",
      status: "pending",
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      expertise: ["Machine Learning", "Python", "Data Science"],
      experience: "10+ years",
      bio: "Associate Professor of Computer Science with extensive research in AI and machine learning. Published 50+ papers in top journals.",
      linkedIn: "https://linkedin.com/in/sarahchen",
      education: "PhD Computer Science, MIT",
      certifications: ["Google Cloud ML", "AWS Machine Learning"],
      currentJob: "Associate Professor at State University",
      whyInstructor:
        "I want to share my knowledge with a broader audience beyond academia and help aspiring data scientists succeed.",
      coursePlan:
        "Planning to create a comprehensive Machine Learning bootcamp covering fundamentals to advanced topics.",
    },
    {
      id: "app-2",
      userId: "user-102",
      name: "Michael Rodriguez",
      email: "michael.r@techcorp.com",
      status: "pending",
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      expertise: ["React", "Node.js", "TypeScript"],
      experience: "8 years",
      bio: "Senior Software Engineer at a Fortune 500 tech company. Built scalable applications serving millions of users.",
      linkedIn: "https://linkedin.com/in/michaelr",
      website: "https://michaeldev.io",
      currentJob: "Senior Engineer at TechCorp",
      whyInstructor:
        "Teaching has always been my passion. I mentor junior developers and want to scale my impact through online courses.",
      coursePlan:
        "Full-stack JavaScript development from basics to deployment.",
    },
    {
      id: "app-3",
      userId: "user-103",
      name: "Emily Watson",
      email: "emily.w@design.co",
      status: "rejected",
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      expertise: ["UI/UX Design", "Figma"],
      experience: "3 years",
      bio: "UI Designer focused on mobile applications.",
      currentJob: "UI Designer at Startup",
      whyInstructor: "Want to teach design principles.",
      rejectionReason:
        "Insufficient teaching experience. Encouraged to build more content first.",
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    },
    {
      id: "app-4",
      userId: "user-104",
      name: "James Park",
      email: "james.park@cybersec.io",
      status: "approved",
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      expertise: ["Cybersecurity", "Ethical Hacking", "Network Security"],
      experience: "12 years",
      bio: "Certified Ethical Hacker and Security Consultant with experience in Fortune 500 security audits.",
      linkedIn: "https://linkedin.com/in/jamespark",
      certifications: ["CEH", "CISSP", "OSCP"],
      currentJob: "Security Consultant",
      whyInstructor:
        "Cybersecurity education is crucial in today's world. I want to help train the next generation of security professionals.",
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
  ];

  const mockInstructors: ApprovedInstructor[] = [
    {
      id: "inst-1",
      userId: "user-201",
      name: "James Park",
      email: "james.park@cybersec.io",
      status: "active",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
      expertise: ["Cybersecurity", "Ethical Hacking"],
      totalCourses: 5,
      totalStudents: 12450,
      totalEarnings: 89500,
      rating: 4.8,
      reviewCount: 2340,
      lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "inst-2",
      userId: "user-202",
      name: "Lisa Thompson",
      email: "lisa.t@devworld.com",
      status: "active",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
      expertise: ["Web Development", "JavaScript"],
      totalCourses: 12,
      totalStudents: 45000,
      totalEarnings: 234000,
      rating: 4.9,
      reviewCount: 8900,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "inst-3",
      userId: "user-203",
      name: "David Kim",
      email: "david.kim@datalab.io",
      status: "suspended",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      expertise: ["Data Science", "Python"],
      totalCourses: 3,
      totalStudents: 5600,
      totalEarnings: 28000,
      rating: 3.9,
      reviewCount: 450,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setApplications(mockApplications);
      setInstructors(mockInstructors);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (app: InstructorApplication) => {
    setSelectedApplication(app);
    setViewModalOpen(true);
  };

  const handleApprove = async (appId: string) => {
    try {
      // API call would go here
      setApplications(
        applications.map((app) =>
          app.id === appId
            ? {
                ...app,
                status: "approved" as const,
                reviewedAt: new Date().toISOString(),
              }
            : app
        )
      );
      toast.success("Application approved! Instructor account created.");
      setViewModalOpen(false);
    } catch (error) {
      toast.error("Failed to approve application");
    }
  };

  const validateRejectionReason = (value: string): string => {
    if (!value.trim()) {
      return "Rejection reason is required";
    }
    if (value.trim().length < 20) {
      return "Please provide a more detailed reason (at least 20 characters)";
    }
    if (value.trim().length > 500) {
      return "Rejection reason must be less than 500 characters";
    }
    return "";
  };

  const handleRejectionReasonChange = (value: string) => {
    setRejectionReason(value);
    if (rejectionTouched) {
      setRejectionError(validateRejectionReason(value));
    }
  };

  const handleRejectionBlur = () => {
    setRejectionTouched(true);
    setRejectionError(validateRejectionReason(rejectionReason));
  };

  const handleReject = async () => {
    setRejectionTouched(true);
    const error = validateRejectionReason(rejectionReason);
    setRejectionError(error);

    if (error) {
      return;
    }

    if (!selectedApplication) {
      toast.error("No application selected");
      return;
    }

    try {
      setApplications(
        applications.map((app) =>
          app.id === selectedApplication.id
            ? {
                ...app,
                status: "rejected" as const,
                rejectionReason: rejectionReason.trim(),
                reviewedAt: new Date().toISOString(),
              }
            : app
        )
      );
      toast.success("Application rejected. Applicant will be notified.");
      setRejectModalOpen(false);
      setViewModalOpen(false);
      setRejectionReason("");
      setRejectionError("");
      setRejectionTouched(false);
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  const handleSuspendInstructor = async () => {
    if (!selectedInstructor) return;

    try {
      setInstructors(
        instructors.map((inst) =>
          inst.id === selectedInstructor.id
            ? { ...inst, status: "suspended" as const }
            : inst
        )
      );
      toast.success("Instructor suspended");
      setSuspendModalOpen(false);
    } catch (error) {
      toast.error("Failed to suspend instructor");
    }
  };

  const handleReactivateInstructor = async (instId: string) => {
    try {
      setInstructors(
        instructors.map((inst) =>
          inst.id === instId ? { ...inst, status: "active" as const } : inst
        )
      );
      toast.success("Instructor reactivated");
    } catch (error) {
      toast.error("Failed to reactivate instructor");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.expertise.some((e) =>
        e.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(
    (a) => a.status === "pending"
  ).length;
  const activeInstructorsCount = instructors.filter(
    (i) => i.status === "active"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
          Instructor Management
        </h1>
        <p className="text-gray-500 mt-1">
          Review applications and manage instructors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Instructors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeInstructorsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {instructors.reduce((sum, i) => sum + i.totalCourses, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {instructors
                    .reduce((sum, i) => sum + i.totalStudents, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "applications"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Applications{" "}
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-yellow-100 text-yellow-700">
              {pendingCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("instructors")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "instructors"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Instructors
        </button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, email, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {activeTab === "applications" ? (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      {activeTab === "applications" && (
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                  <TableHead>Applicant</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={app.avatar} />
                          <AvatarFallback>
                            {app.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-gray-500">{app.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {app.expertise.slice(0, 2).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {app.expertise.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{app.expertise.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app.experience}</TableCell>
                    <TableCell>{formatTimeAgo(app.appliedAt)}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(app)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(app.id)}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedApplication(app);
                                setRejectModalOpen(true);
                              }}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No applications found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructors Table */}
      {activeTab === "instructors" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.map((inst) => (
                  <TableRow key={inst.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={inst.avatar} />
                          <AvatarFallback>
                            {inst.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{inst.name}</p>
                          <p className="text-sm text-gray-500">{inst.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        {inst.totalCourses}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-green-500" />
                        {inst.totalStudents.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-yellow-500" />$
                        {inst.totalEarnings.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{inst.rating}</span>
                        <span className="text-gray-400 text-sm">
                          ({inst.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(inst.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {inst.status === "active" ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedInstructor(inst);
                                setSuspendModalOpen(true);
                              }}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() =>
                                handleReactivateInstructor(inst.id)
                              }
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredInstructors.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No instructors found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Application Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Review</DialogTitle>
            <DialogDescription>
              Review instructor application details
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedApplication.avatar} />
                  <AvatarFallback className="text-xl">
                    {selectedApplication.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedApplication.name}
                  </h3>
                  <p className="text-gray-500">{selectedApplication.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedApplication.status)}
                    <span className="text-sm text-gray-400">
                      Applied {formatTimeAgo(selectedApplication.appliedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Experience</Label>
                  <p className="font-medium">
                    {selectedApplication.experience}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Current Position</Label>
                  <p className="font-medium">
                    {selectedApplication.currentJob || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Education</Label>
                  <p className="font-medium">
                    {selectedApplication.education || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Links</Label>
                  <div className="flex gap-2">
                    {selectedApplication.linkedIn && (
                      <a
                        href={selectedApplication.linkedIn}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        LinkedIn
                      </a>
                    )}
                    {selectedApplication.website && (
                      <a
                        href={selectedApplication.website}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div>
                <Label className="text-gray-500">Areas of Expertise</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApplication.expertise.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {selectedApplication.certifications &&
                selectedApplication.certifications.length > 0 && (
                  <div>
                    <Label className="text-gray-500">Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApplication.certifications.map((cert) => (
                        <Badge key={cert} className="bg-blue-100 text-blue-700">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Bio */}
              <div>
                <Label className="text-gray-500">Bio</Label>
                <p className="mt-1 text-gray-700">{selectedApplication.bio}</p>
              </div>

              {/* Why Instructor */}
              <div>
                <Label className="text-gray-500">
                  Why do you want to be an instructor?
                </Label>
                <p className="mt-1 text-gray-700">
                  {selectedApplication.whyInstructor}
                </p>
              </div>

              {/* Course Plan */}
              {selectedApplication.coursePlan && (
                <div>
                  <Label className="text-gray-500">Course Plans</Label>
                  <p className="mt-1 text-gray-700">
                    {selectedApplication.coursePlan}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApplication.status === "rejected" &&
                selectedApplication.rejectionReason && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <Label className="text-red-600">Rejection Reason</Label>
                    <p className="mt-1 text-red-700">
                      {selectedApplication.rejectionReason}
                    </p>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            {selectedApplication?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setRejectModalOpen(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedApplication.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={rejectModalOpen}
        onOpenChange={(open) => {
          setRejectModalOpen(open);
          if (!open) {
            setRejectionReason("");
            setRejectionError("");
            setRejectionTouched(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the
              applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ValidatedTextarea
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => handleRejectionReasonChange(e.target.value)}
              onBlur={handleRejectionBlur}
              error={rejectionTouched ? rejectionError : undefined}
              placeholder="Please explain why this application is being rejected..."
              rows={4}
              maxLength={500}
              showCharCount
              required
              helperText="Minimum 20 characters. Be specific and constructive."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectionTouched && !!rejectionError}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Instructor Modal */}
      <AlertDialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Instructor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedInstructor?.name}? They
              will not be able to access their instructor dashboard or receive
              new enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSuspendInstructor}
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

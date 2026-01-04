import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Building,
  GraduationCap,
  FolderKanban,
  Download,
  Upload,
  Plus,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useNavigate } from "react-router-dom";

interface BusinessAccountManagementProps {}

export default function BusinessAccountManagement() {
  const navigate = useNavigate();
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [isAddCohortOpen, setIsAddCohortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    cohort: "",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCohort, setFilterCohort] = useState("all");

  const organizationInfo = {
    name: "TechCorp Inc.",
    industry: "Technology",
    size: "500-1000 employees",
    plan: "Enterprise",
    license: 1500,
    used: 1247,
  };

  const learners = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.j@techcorp.com",
      department: "Engineering",
      cohort: "Software Engineering 2024",
      status: "Active",
      enrolled: "Jan 15, 2024",
      progress: 85,
      avatar: "AJ",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.s@techcorp.com",
      department: "Data Science",
      cohort: "Data Science Bootcamp",
      status: "Active",
      enrolled: "Feb 1, 2024",
      progress: 72,
      avatar: "BS",
    },
    {
      id: 3,
      name: "Carol White",
      email: "carol.w@techcorp.com",
      department: "Engineering",
      cohort: "Software Engineering 2024",
      status: "Active",
      enrolled: "Jan 20, 2024",
      progress: 68,
      avatar: "CW",
    },
    {
      id: 4,
      name: "David Lee",
      email: "david.l@techcorp.com",
      department: "Design",
      cohort: "UX/UI Design Track",
      status: "Inactive",
      enrolled: "Dec 10, 2023",
      progress: 45,
      avatar: "DL",
    },
  ];

  const cohorts = [
    {
      id: 1,
      name: "Software Engineering Cohort 2024",
      description: "Full-stack development program",
      learners: 85,
      instructors: 4,
      startDate: "Jan 1, 2024",
      endDate: "Jun 30, 2024",
      status: "Active",
    },
    {
      id: 2,
      name: "Data Science Bootcamp Q1",
      description: "Intensive data science and ML program",
      learners: 62,
      instructors: 3,
      startDate: "Feb 1, 2024",
      endDate: "Jul 31, 2024",
      status: "Active",
    },
    {
      id: 3,
      name: "Web Development Fast Track",
      description: "Accelerated web development course",
      learners: 124,
      instructors: 5,
      startDate: "Dec 1, 2023",
      endDate: "May 31, 2024",
      status: "Active",
    },
  ];

  const departments = [
    { name: "Engineering", learners: 456, color: "bg-blue-100 text-blue-700" },
    {
      name: "Data Science",
      learners: 298,
      color: "bg-green-100 text-green-700",
    },
    { name: "Design", learners: 186, color: "bg-purple-100 text-purple-700" },
    {
      name: "Marketing",
      learners: 124,
      color: "bg-orange-100 text-orange-700",
    },
    { name: "Product", learners: 98, color: "bg-pink-100 text-pink-700" },
    { name: "Others", learners: 85, color: "bg-gray-100 text-gray-700" },
  ];

  // ============= LEARNER HANDLERS =============
  const handleAddLearner = async () => {
    if (!formData.name.trim()) {
      alert("Please enter learner name");
      return;
    }
    if (!formData.email.trim()) {
      alert("Please enter learner email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!formData.department) {
      alert("Please select a department");
      return;
    }
    if (!formData.cohort) {
      alert("Please select a cohort");
      return;
    }

    try {
      // Call API to add learner
      // await addLearnerMutation.mutateAsync({
      //   name: formData.name,
      //   email: formData.email,
      //   department: formData.department,
      //   cohort_id: formData.cohort
      // });

      setFormData({ name: "", email: "", department: "", cohort: "" });
      setIsAddLearnerOpen(false);
      alert("Learner added successfully!");
    } catch (error: any) {
      alert("Failed to add learner: " + (error.message || "Unknown error"));
    }
  };

  const handleEditLearner = async (learnerId: string) => {
    try {
      // Call API to update learner
      // await updateLearnerMutation.mutateAsync({
      //   learnerId,
      //   ...formData
      // });
      alert("Learner updated successfully!");
    } catch (error: any) {
      alert("Failed to update learner: " + (error.message || "Unknown error"));
    }
  };

  const handleRemoveLearner = async (
    learnerId: string,
    learnerName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to remove ${learnerName} from this organization?`
      )
    ) {
      return;
    }

    try {
      // Call API to remove learner
      // await removeLearnerMutation.mutateAsync(learnerId);
      alert("Learner removed successfully!");
    } catch (error: any) {
      alert("Failed to remove learner: " + (error.message || "Unknown error"));
    }
  };

  const handleSendMessage = async (learnerId: string, learnerName: string) => {
    const message = prompt(`Send message to ${learnerName}:`);
    if (!message) return;

    try {
      // Call API to send message
      // await sendMessageMutation.mutateAsync({
      //   userId: learnerId,
      //   message
      // });
      alert("Message sent successfully!");
    } catch (error: any) {
      alert("Failed to send message: " + (error.message || "Unknown error"));
    }
  };

  const handleExportLearners = async () => {
    try {
      // Call API to generate CSV export
      // const csv = await exportLearnersMutation.mutateAsync();
      // Trigger download
      alert("Export CSV feature coming soon");
    } catch (error: any) {
      alert("Failed to export learners: " + (error.message || "Unknown error"));
    }
  };

  const handleImportCSV = async () => {
    try {
      // TODO: Implement CSV file picker and upload
      alert("Import CSV feature coming soon");
    } catch (error: any) {
      alert("Failed to import learners: " + (error.message || "Unknown error"));
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Account Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage your organization's learners, instructors, and cohorts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleImportCSV}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddLearnerOpen} onOpenChange={setIsAddLearnerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Learners
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Learners</DialogTitle>
                <DialogDescription>
                  Add learners to your organization individually or in bulk
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="e.g., John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      placeholder="john.doe@company.com"
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="data-science">
                          Data Science
                        </SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign to Cohort</Label>
                    <Select
                      value={formData.cohort}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, cohort: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cohort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="se-2024">
                          Software Engineering 2024
                        </SelectItem>
                        <SelectItem value="ds-q1">
                          Data Science Bootcamp
                        </SelectItem>
                        <SelectItem value="web-ft">
                          Web Development Fast Track
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Or import multiple learners:
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleImportCSV}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV File
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddLearnerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddLearner}
                >
                  Add Learner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Organization Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3>{organizationInfo.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {organizationInfo.industry} • {organizationInfo.size}
              </p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
            {organizationInfo.plan} Plan
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Licenses</p>
            <p className="text-2xl mt-1">{organizationInfo.license}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Used Licenses</p>
            <p className="text-2xl mt-1">{organizationInfo.used}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl mt-1 text-green-600">
              {organizationInfo.license - organizationInfo.used}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Utilization</p>
            <p className="text-2xl mt-1">
              {Math.round(
                (organizationInfo.used / organizationInfo.license) * 100
              )}
              %
            </p>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="learners" className="space-y-6">
        <TabsList>
          <TabsTrigger value="learners">
            <Users className="w-4 h-4 mr-2" />
            Learners
          </TabsTrigger>
          <TabsTrigger value="cohorts">
            <FolderKanban className="w-4 h-4 mr-2" />
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Building className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
        </TabsList>

        {/* Learners Tab */}
        <TabsContent value="learners" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search learners by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Learners</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCohort} onValueChange={setFilterCohort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                <SelectItem value="se-2024">
                  Software Engineering 2024
                </SelectItem>
                <SelectItem value="ds-q1">Data Science Bootcamp</SelectItem>
                <SelectItem value="web-ft">Web Development</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportLearners}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm">Learner</th>
                    <th className="px-6 py-4 text-left text-sm">Department</th>
                    <th className="px-6 py-4 text-left text-sm">Cohort</th>
                    <th className="px-6 py-4 text-left text-sm">Status</th>
                    <th className="px-6 py-4 text-left text-sm">Progress</th>
                    <th className="px-6 py-4 text-left text-sm">Enrolled</th>
                    <th className="px-6 py-4 text-right text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {learners.map((learner) => (
                    <tr key={learner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm text-blue-600">
                              {learner.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {learner.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {learner.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{learner.department}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{learner.cohort}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(learner.status)}>
                          {learner.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${learner.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {learner.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {learner.enrolled}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditLearner(learner.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleSendMessage(learner.id, learner.name)
                              }
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => navigate("/business/performance")}
                            >
                              <GraduationCap className="w-4 h-4 mr-2" />
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleRemoveLearner(learner.id, learner.name)
                              }
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {cohorts.length} active cohorts
            </p>
            <Dialog open={isAddCohortOpen} onOpenChange={setIsAddCohortOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Cohort
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Cohort</DialogTitle>
                  <DialogDescription>
                    Set up a new learning cohort for your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Cohort Name *</Label>
                    <Input placeholder="e.g., Software Engineering Q2 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the cohort" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddCohortOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Cohort
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {cohorts.map((cohort) => (
              <Card key={cohort.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4>{cohort.name}</h4>
                      <Badge className="bg-green-100 text-green-700">
                        {cohort.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cohort.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Cohort
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/business/instructors")}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Manage Instructors
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Learners</p>
                    </div>
                    <p className="text-xl">{cohort.learners}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-muted-foreground">
                        Instructors
                      </p>
                    </div>
                    <p className="text-xl">{cohort.instructors}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Start Date
                    </p>
                    <p className="text-sm font-medium">{cohort.startDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      End Date
                    </p>
                    <p className="text-sm font-medium">{cohort.endDate}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card
                key={dept.name}
                className="p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4>{dept.name}</h4>
                  <Badge className={dept.color}>{dept.learners} learners</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Active Learners
                    </span>
                    <span>{Math.round(dept.learners * 0.85)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Progress</span>
                    <span className="text-blue-600">
                      {Math.round(65 + Math.random() * 20)}%
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/business/performance")}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

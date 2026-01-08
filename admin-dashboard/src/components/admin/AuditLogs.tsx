import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
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
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Search,
  History,
  User,
  Settings,
  Shield,
  BookOpen,
  CreditCard,
  Trash2,
  Edit,
  Eye,
  Filter,
  Download,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserPlus,
  Ban,
  Key,
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  actionType:
    | "create"
    | "update"
    | "delete"
    | "login"
    | "security"
    | "settings";
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  status: "success" | "failure" | "warning";
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7days");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data
  const mockLogs: AuditLog[] = [
    {
      id: "1",
      userId: "admin-001",
      userName: "Super Admin",
      userEmail: "admin@codequest.com",
      action: "User Banned",
      actionType: "security",
      resource: "User",
      resourceId: "user-123",
      details: "Banned user john.doe@email.com for Terms of Service violation",
      ipAddress: "192.168.1.100",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: "success",
    },
    {
      id: "2",
      userId: "admin-001",
      userName: "Super Admin",
      userEmail: "admin@codequest.com",
      action: "Course Updated",
      actionType: "update",
      resource: "Course",
      resourceId: "course-456",
      details:
        "Updated course 'Advanced JavaScript' - changed price from $49 to $39",
      ipAddress: "192.168.1.100",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "success",
    },
    {
      id: "3",
      userId: "admin-002",
      userName: "Content Manager",
      userEmail: "content@codequest.com",
      action: "Post Rejected",
      actionType: "update",
      resource: "ForumPost",
      resourceId: "post-789",
      details: "Rejected forum post for inappropriate content",
      ipAddress: "192.168.1.101",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "success",
    },
    {
      id: "4",
      userId: "admin-001",
      userName: "Super Admin",
      userEmail: "admin@codequest.com",
      action: "Admin Login",
      actionType: "login",
      resource: "Authentication",
      details: "Admin login successful",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      status: "success",
    },
    {
      id: "5",
      userId: "admin-002",
      userName: "Content Manager",
      userEmail: "content@codequest.com",
      action: "Subscription Plan Created",
      actionType: "create",
      resource: "SubscriptionPlan",
      resourceId: "plan-101",
      details: "Created new subscription plan 'Enterprise' at $99/month",
      ipAddress: "192.168.1.101",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: "success",
    },
    {
      id: "6",
      userId: "unknown",
      userName: "Unknown",
      userEmail: "unknown@email.com",
      action: "Admin Login Failed",
      actionType: "login",
      resource: "Authentication",
      details: "Failed login attempt - invalid credentials",
      ipAddress: "203.45.67.89",
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      status: "failure",
    },
    {
      id: "7",
      userId: "admin-001",
      userName: "Super Admin",
      userEmail: "admin@codequest.com",
      action: "System Settings Updated",
      actionType: "settings",
      resource: "Settings",
      details: "Changed maintenance mode to enabled",
      ipAddress: "192.168.1.100",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      status: "warning",
    },
    {
      id: "8",
      userId: "admin-001",
      userName: "Super Admin",
      userEmail: "admin@codequest.com",
      action: "User Role Changed",
      actionType: "update",
      resource: "User",
      resourceId: "user-789",
      details: "Changed user role from 'Student' to 'Instructor'",
      ipAddress: "192.168.1.100",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      status: "success",
    },
    {
      id: "9",
      userId: "admin-002",
      userName: "Content Manager",
      userEmail: "content@codequest.com",
      action: "Course Deleted",
      actionType: "delete",
      resource: "Course",
      resourceId: "course-123",
      details: "Deleted course 'Outdated Framework Tutorial'",
      ipAddress: "192.168.1.101",
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      status: "success",
    },
    {
      id: "10",
      userId: "admin-001",
      userName: "Super Admin",
      userEmail: "admin@codequest.com",
      action: "Subscription Cancelled",
      actionType: "update",
      resource: "Subscription",
      resourceId: "sub-456",
      details:
        "Admin cancelled subscription for user@email.com - reason: refund request",
      ipAddress: "192.168.1.100",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      status: "success",
    },
  ];

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, statusFilter, dateRange]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLogs(mockLogs);
      setTotalPages(3);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (actionType: AuditLog["actionType"]) => {
    switch (actionType) {
      case "create":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "update":
        return <Edit className="w-4 h-4 text-blue-500" />;
      case "delete":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case "login":
        return <Key className="w-4 h-4 text-purple-500" />;
      case "security":
        return <Shield className="w-4 h-4 text-orange-500" />;
      case "settings":
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: AuditLog["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case "failure":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case "user":
        return <User className="w-4 h-4" />;
      case "course":
        return <BookOpen className="w-4 h-4" />;
      case "subscriptionplan":
      case "subscription":
        return <CreditCard className="w-4 h-4" />;
      case "forumpost":
        return <History className="w-4 h-4" />;
      case "authentication":
        return <Shield className="w-4 h-4" />;
      case "settings":
        return <Settings className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction =
      actionFilter === "all" || log.actionType === actionFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const handleExport = () => {
    toast.success("Exporting audit logs...");
    // In real app, would generate and download CSV/JSON
  };

  // Stats calculations
  const totalActions = logs.length;
  const successfulActions = logs.filter((l) => l.status === "success").length;
  const failedActions = logs.filter((l) => l.status === "failure").length;
  const securityActions = logs.filter(
    (l) => l.actionType === "security"
  ).length;

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            Audit Logs
          </h1>
          <p className="text-gray-500 mt-1">
            Track all administrative actions and system changes
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="rounded-xl hover:bg-blue-50 hover:border-blue-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalActions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-gray-900">
                  {successfulActions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {failedActions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {securityActions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-300"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.actionType)}
                      <span className="font-medium">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 ring-2 ring-white shadow-md">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {log.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{log.userName}</p>
                        <p className="text-xs text-gray-500">{log.userEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getResourceIcon(log.resource)}
                      <span>{log.resource}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p
                      className="text-sm text-gray-600 max-w-xs truncate"
                      title={log.details}
                    >
                      {log.details}
                    </p>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.ipAddress}
                    </code>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(log.timestamp)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

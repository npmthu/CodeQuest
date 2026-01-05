import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Loader2,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { adminApi } from "../../services/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  created_at: string;
  last_login_at?: string;
  is_active?: boolean;
  subscription_tier?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers(
        page,
        8,
        searchTerm || undefined
      );
      if (response.success) {
        setUsers(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else {
        toast.error(response.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUserStatus = (user: User) => {
    // Use is_active from database
    return user.is_active ? "Active" : "Inactive";
  };

  const getUserRole = (user: User) => {
    // Handle null, undefined, or empty role
    const role = user.role.toLowerCase().trim();
    if (!role || role === "") return "Learner";
    if (role === "admin") return "Admin";
    if (role === "instructor") return "Instructor";
    if (role === "business_partner") return "Business Partner";
    return "Learner";
  };

  const filteredUsers = users.filter((user) => {
    const userRole = getUserRole(user).toLowerCase();
    const userStatus = getUserStatus(user).toLowerCase();
    const matchesRole = filterRole === "all" || userRole === filterRole;
    const matchesStatus = filterStatus === "all" || userStatus === filterStatus;
    return matchesRole && matchesStatus;
  });

  const handleUpgradeToPremium = async (userId: string) => {
    try {
      const response = await adminApi.updateUserRole(userId, "premium");
      if (response.success) {
        toast.success("User upgraded to Premium");
        fetchUsers();
      } else {
        toast.error(response.error || "Failed to upgrade user");
      }
    } catch (error) {
      toast.error("Failed to upgrade user");
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const response = await adminApi.banUser(userId);
      if (response.success) {
        toast.success("User has been banned");
        fetchUsers();
      } else {
        toast.error(response.error || "Failed to ban user");
      }
    } catch (error) {
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await adminApi.unbanUser(userId);
      if (response.success) {
        toast.success("User has been unbanned");
        fetchUsers();
      } else {
        toast.error(response.error || "Failed to unban user");
      }
    } catch (error) {
      toast.error("Failed to unban user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-[#1E3A8A] mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts, roles, and access</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-300"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="business partner">Business Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {total} users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const displayName =
                    user.display_name || user.email?.split("@")[0] || "User";
                  const userRole = getUserRole(user);
                  const userStatus = getUserStatus(user);

                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-[#2563EB] text-white">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor:
                              userRole === "Admin"
                                ? "#dc2626"
                                : userRole === "Instructor"
                                ? "#2563eb"
                                : userRole === "Business Partner"
                                ? "#9333ea"
                                : "#16a34a",
                            color: "white",
                            border: "none",
                          }}
                        >
                          {userRole === "Admin" && (
                            <Crown className="w-3 h-3 mr-1 inline" />
                          )}
                          {userRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            userStatus === "Active" ? "default" : "secondary"
                          }
                          className={
                            userStatus === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {userStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatTimeAgo(user.last_login_at)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 8) || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 8 >= total || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

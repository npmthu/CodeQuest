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
  full_name?: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  subscription_tier?: string;
  is_banned?: boolean;
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
        20,
        searchTerm || undefined
      );
      if (response.success && response.data) {
        setUsers(response.data.users || response.data || []);
        setTotal(response.data.pagination?.total || response.data.length || 0);
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
    if (user.is_banned) return "Banned";
    const lastActive = user.last_sign_in_at
      ? new Date(user.last_sign_in_at)
      : null;
    if (!lastActive) return "Inactive";
    const daysSinceActive =
      (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActive < 30 ? "Active" : "Inactive";
  };

  const getUserRole = (user: User) => {
    if (user.role === "admin") return "Admin";
    if (
      user.subscription_tier &&
      user.subscription_tier !== "free" &&
      user.subscription_tier !== "basic"
    ) {
      return "Premium";
    }
    return "Free";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage user accounts, roles, and access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {total} total users
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border-0 shadow-lg shadow-gray-200/50 p-6">
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
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-40 h-11 rounded-xl">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="free">Free</SelectItem>
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
      <div className="bg-white rounded-2xl border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30">
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
                    user.full_name || user.email?.split("@")[0] || "User";
                  const userRole = getUserRole(user);
                  const userStatus = getUserStatus(user);

                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="ring-2 ring-white shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">
                            {displayName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            userRole === "Premium" || userRole === "Admin"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            userRole === "Admin"
                              ? "bg-purple-600 text-white"
                              : userRole === "Premium"
                              ? "bg-[#2563EB] text-white"
                              : "bg-gray-200 text-gray-700"
                          }
                        >
                          {(userRole === "Premium" || userRole === "Admin") && (
                            <Crown className="w-3 h-3 mr-1" />
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
                              : userStatus === "Banned"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {userStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatTimeAgo(user.last_sign_in_at)}
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
                            {userRole === "Free" && (
                              <DropdownMenuItem
                                onClick={() => handleUpgradeToPremium(user.id)}
                              >
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade to Premium
                              </DropdownMenuItem>
                            )}
                            {user.is_banned ? (
                              <DropdownMenuItem
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleBanUser(user.id)}
                                className="text-red-600"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
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
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Search, Filter, MoreVertical, UserCheck, UserX, Crown, Mail } from "lucide-react";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: "Free" | "Premium";
  status: "Active" | "Inactive";
  lastActive: string;
  joinDate: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Bug Quýt",
    email: "bugquyt@gmail.com",
    role: "Premium",
    status: "Active",
    lastActive: "2 minutes ago",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "Free",
    status: "Active",
    lastActive: "1 hour ago",
    joinDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    role: "Premium",
    status: "Active",
    lastActive: "3 hours ago",
    joinDate: "2024-01-10",
  },
  {
    id: "4",
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    role: "Free",
    status: "Inactive",
    lastActive: "2 days ago",
    joinDate: "2024-03-05",
  },
  {
    id: "5",
    name: "Phạm Thị D",
    email: "phamthid@gmail.com",
    role: "Premium",
    status: "Active",
    lastActive: "5 minutes ago",
    joinDate: "2024-01-22",
  },
  {
    id: "6",
    name: "Hoàng Văn E",
    email: "hoangvane@gmail.com",
    role: "Free",
    status: "Active",
    lastActive: "30 minutes ago",
    joinDate: "2024-04-01",
  },
  {
    id: "7",
    name: "Vũ Thị F",
    email: "vuthif@gmail.com",
    role: "Free",
    status: "Active",
    lastActive: "1 day ago",
    joinDate: "2024-03-18",
  },
  {
    id: "8",
    name: "Đặng Văn G",
    email: "dangvang@gmail.com",
    role: "Premium",
    status: "Inactive",
    lastActive: "1 week ago",
    joinDate: "2024-02-14",
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || user.status.toLowerCase() === filterStatus;
    const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleUpgradeToPremium = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: "Premium" } : user
      )
    );
  };

  const handleDeactivate = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: "Inactive" } : user
      )
    );
  };

  const handleActivate = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: "Active" } : user
      )
    );
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
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-[#2563EB] text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "Premium" ? "default" : "secondary"}
                      className={
                        user.role === "Premium"
                          ? "bg-[#2563EB] text-white"
                          : "bg-gray-200 text-gray-700"
                      }
                    >
                      {user.role === "Premium" && <Crown className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "Active" ? "default" : "secondary"}
                      className={
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.lastActive}</TableCell>
                  <TableCell className="text-gray-600">{user.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {user.role === "Free" && (
                          <DropdownMenuItem
                            onClick={() => handleUpgradeToPremium(user.id)}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                          </DropdownMenuItem>
                        )}
                        {user.status === "Active" ? (
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(user.id)}
                            className="text-red-600"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleActivate(user.id)}
                            className="text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

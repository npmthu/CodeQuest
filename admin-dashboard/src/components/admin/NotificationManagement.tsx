import { useState } from "react";
import { Send, Plus, Eye, Calendar, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface Notification {
  id: string;
  title: string;
  content: string;
  audience: "All Users" | "Premium Users" | "Free Users" | "Admins";
  status: "sent" | "scheduled" | "draft";
  scheduledDate?: string;
  sentDate?: string;
  recipients: number;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Python Course Available!",
    content:
      "We're excited to announce a new Python for Data Science course. Enroll now!",
    audience: "All Users",
    status: "sent",
    sentDate: "2025-11-01",
    recipients: 12458,
  },
  {
    id: "2",
    title: "Premium Sale - 50% Off",
    content:
      "Limited time offer! Get 50% off on all premium courses. Don't miss out!",
    audience: "Free Users",
    status: "scheduled",
    scheduledDate: "2025-11-15",
    recipients: 8234,
  },
  {
    id: "3",
    title: "System Maintenance Notice",
    content:
      "Scheduled maintenance on Nov 20. Platform will be down from 2-4 AM.",
    audience: "All Users",
    status: "scheduled",
    scheduledDate: "2025-11-18",
    recipients: 12458,
  },
  {
    id: "4",
    title: "Thank you for being Premium!",
    content:
      "As a token of appreciation, enjoy exclusive access to our new DSA masterclass.",
    audience: "Premium Users",
    status: "sent",
    sentDate: "2025-10-28",
    recipients: 4224,
  },
  {
    id: "5",
    title: "New features coming soon",
    content:
      "We're working on AI-powered code review and live coding sessions. Stay tuned!",
    audience: "All Users",
    status: "draft",
    recipients: 0,
  },
];

export default function NotificationManagement() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true;
    return notif.status === activeTab;
  });

  const getStatusBadge = (status: Notification["status"]) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-700">Sent</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
    }
  };

  const sentCount = notifications.filter((n) => n.status === "sent").length;
  const scheduledCount = notifications.filter(
    (n) => n.status === "scheduled"
  ).length;
  const draftCount = notifications.filter((n) => n.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage platform announcements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Enter notification title"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea
                  placeholder="Enter notification message"
                  className="rounded-xl min-h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="free">Free Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Schedule Date (Optional)</Label>
                  <Input type="date" className="rounded-xl" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900">Preview</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your message will be displayed to users in their
                      notification center and via email.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl">
                  Save as Draft
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25">
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sent</p>
                <p className="text-2xl font-bold text-gray-900">{sentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scheduledCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-slate-500 flex items-center justify-center shadow-lg shadow-gray-500/30">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            All Notifications
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Sent ({sentCount})
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Scheduled ({scheduledCount})
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Drafts ({draftCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notif.title}
                      </h3>
                      {getStatusBadge(notif.status)}
                    </div>
                    <p className="text-gray-600 mb-3">{notif.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{notif.audience}</span>
                      </div>
                      {notif.sentDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Sent: {notif.sentDate}</span>
                        </div>
                      )}
                      {notif.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Scheduled: {notif.scheduledDate}</span>
                        </div>
                      )}
                      {notif.recipients > 0 && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {notif.recipients.toLocaleString()} recipients
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {notif.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/25"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

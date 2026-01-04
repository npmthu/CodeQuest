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
    content: "We're excited to announce a new Python for Data Science course. Enroll now!",
    audience: "All Users",
    status: "sent",
    sentDate: "2025-11-01",
    recipients: 12458,
  },
  {
    id: "2",
    title: "Premium Sale - 50% Off",
    content: "Limited time offer! Get 50% off on all premium courses. Don't miss out!",
    audience: "Free Users",
    status: "scheduled",
    scheduledDate: "2025-11-15",
    recipients: 8234,
  },
  {
    id: "3",
    title: "System Maintenance Notice",
    content: "Scheduled maintenance on Nov 20. Platform will be down from 2-4 AM.",
    audience: "All Users",
    status: "scheduled",
    scheduledDate: "2025-11-18",
    recipients: 12458,
  },
  {
    id: "4",
    title: "Thank you for being Premium!",
    content: "As a token of appreciation, enjoy exclusive access to our new DSA masterclass.",
    audience: "Premium Users",
    status: "sent",
    sentDate: "2025-10-28",
    recipients: 4224,
  },
  {
    id: "5",
    title: "New features coming soon",
    content: "We're working on AI-powered code review and live coding sessions. Stay tuned!",
    audience: "All Users",
    status: "draft",
    recipients: 0,
  },
];

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
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
  const scheduledCount = notifications.filter((n) => n.status === "scheduled").length;
  const draftCount = notifications.filter((n) => n.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1E3A8A] mb-2">Notifications</h1>
          <p className="text-gray-600">Create and manage platform announcements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl">
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
                      Your message will be displayed to users in their notification center and via email.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl">
                  Save as Draft
                </Button>
                <Button className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl">
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
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sent</p>
                <p className="text-2xl text-gray-900">{sentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                <p className="text-2xl text-gray-900">{scheduledCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Drafts</p>
                <p className="text-2xl text-gray-900">{draftCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-lg">
            Sent ({sentCount})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="rounded-lg">
            Scheduled ({scheduledCount})
          </TabsTrigger>
          <TabsTrigger value="draft" className="rounded-lg">
            Drafts ({draftCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.map((notif) => (
            <Card key={notif.id} className="rounded-2xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-gray-900">{notif.title}</h3>
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
                        <span>{notif.recipients.toLocaleString()} recipients</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {notif.status === "draft" && (
                      <Button size="sm" className="bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl">
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

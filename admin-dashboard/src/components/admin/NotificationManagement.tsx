import { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Eye,
  Calendar,
  Users,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
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
import { toast } from "sonner";
import { adminApi } from "../../services/api";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  target_plan_id?: string;
  target_plan_name?: string;
  scheduled_for?: string;
  status: "draft" | "sent" | "scheduled";
  sent_at?: string;
  recipients_count?: number;
  created_at: string;
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target_plan_id: "all",
    scheduled_for: "",
  });

  useEffect(() => {
    fetchNotifications();
    fetchPlans();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await adminApi.getPlans();
      if (response.success && response.data) {
        setPlans(response.data.filter((p: SubscriptionPlan) => p.is_active));
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSendNow = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.sendNotification({
        title: formData.title,
        message: formData.message,
        target_plan_id:
          formData.target_plan_id === "all" ? null : formData.target_plan_id,
        scheduled_for: formData.scheduled_for || null,
      });

      if (response.success) {
        toast.success(
          formData.scheduled_for
            ? "Notification scheduled successfully"
            : `Notification sent to ${
                response.data?.recipients_count || 0
              } users`
        );
        setIsCreateDialogOpen(false);
        resetForm();
        await fetchNotifications();
      } else {
        toast.error(response.error || "Failed to send notification");
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error(error.message || "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.saveDraftNotification({
        title: formData.title,
        message: formData.message,
        target_plan_id:
          formData.target_plan_id === "all" ? null : formData.target_plan_id,
        scheduled_for: formData.scheduled_for || null,
      });

      if (response.success) {
        toast.success("Draft saved successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        await fetchNotifications();
      } else {
        toast.error(response.error || "Failed to save draft");
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      target_plan_id: "all",
      scheduled_for: "",
    });
  };

  const getTargetAudienceName = () => {
    if (formData.target_plan_id === "all") {
      return "All Users";
    }
    const plan = plans.find((p) => p.id === formData.target_plan_id);
    return plan ? `${plan.name} Users` : "Unknown";
  };

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
  const totalRecipients = notifications.reduce(
    (sum, n) => sum + (n.recipients_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1E3A8A] mb-2">Notifications</h1>
          <p className="text-gray-600">
            Create and manage platform announcements
          </p>
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Hello"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="hi"
                  className="rounded-xl min-h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={formData.target_plan_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, target_plan_id: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} Subscribers
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule Date (Optional)</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={formData.scheduled_for}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduled_for: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Preview
                    </p>
                    <p className="text-sm text-blue-700">
                      Your message will be displayed to users in their
                      notification center and via email.
                    </p>
                    {formData.title && (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200">
                        <p className="font-semibold text-gray-900">
                          {formData.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formData.message || "No message content"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          To: {getTargetAudienceName()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSendNow}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sent</p>
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
                <Save className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Recipients</p>
                <p className="text-2xl text-gray-900">{totalRecipients}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <Card key={notif.id} className="rounded-2xl border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg text-gray-900">{notif.title}</h3>
                        {getStatusBadge(notif.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{notif.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{notif.target_plan_name || "All Users"}</span>
                        </div>
                        {notif.sent_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Sent:{" "}
                              {new Date(notif.sent_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {notif.scheduled_for && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Scheduled:{" "}
                              {new Date(
                                notif.scheduled_for
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {notif.recipients_count !== undefined &&
                          notif.recipients_count > 0 && (
                            <span>
                              {notif.recipients_count.toLocaleString()}{" "}
                              recipients
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {notif.status === "draft" && (
                        <Button
                          size="sm"
                          className="bg-[#2563EB] hover:bg-[#1E3A8A] rounded-xl"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

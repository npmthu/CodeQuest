import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Building,
  Users,
  CreditCard,
  Bell,
  Save,
  Loader2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../api/ApiProvider";

interface OrganizationSettings {
  name: string;
  slug: string;
  domain: string;
  logo_url: string;
  settings: {
    timezone?: string;
    industry?: string;
    description?: string;
  };
}

interface BillingInfo {
  plan: string;
  licenses: number;
  usedLicenses: number;
  billingCycle: string;
  nextBillingDate: string;
  paymentMethod: string;
  cardLast4: string;
}

export default function BusinessSettings() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("organization");

  // Fetch settings from API
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const response = await api.get("/business/settings");
      return response.data;
    },
  });

  // Fetch stats for overview
  const { data: statsData } = useQuery({
    queryKey: ["business-stats"],
    queryFn: async () => {
      const response = await api.get("/business/stats");
      return response.data;
    },
  });

  // Local state for form
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: "",
    slug: "",
    domain: "",
    logo_url: "",
    settings: {},
  });

  // Update local state when data loads
  useEffect(() => {
    if (settingsData) {
      setOrgSettings({
        name: settingsData.name || "",
        slug: settingsData.slug || "",
        domain: settingsData.domain || "",
        logo_url: settingsData.logo_url || "",
        settings: settingsData.settings || {},
      });
    }
  }, [settingsData]);

  // Mock billing info (keep as mock per requirements)
  const billingInfo: BillingInfo = {
    plan: "Enterprise",
    licenses: 1500,
    usedLicenses: statsData?.totalLearners ?? 0,
    billingCycle: "Annual",
    nextBillingDate: "2025-01-15",
    paymentMethod: "Credit Card",
    cardLast4: "4242",
  };

  // Notification Settings (local state, would need backend support)
  const [notifications, setNotifications] = useState({
    emailReports: true,
    weeklyDigest: true,
    learnerProgress: true,
    courseCompletion: true,
    lowEngagement: true,
    licenseWarnings: true,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<OrganizationSettings>) => {
      const response = await api.patch("/business/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });

  // Handlers
  const handleSaveOrganization = async () => {
    setSaving(true);
    try {
      await updateSettingsMutation.mutateAsync({
        name: orgSettings.name,
        slug: orgSettings.slug,
        domain: orgSettings.domain,
        logo_url: orgSettings.logo_url,
        settings: orgSettings.settings,
      });
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    // Simulate API call - would need backend support
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    alert("Notification settings updated!");
  };

  if (settingsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
          Organization Settings
        </h2>
        <p className="text-gray-500 mt-1">
          Manage your organization profile and preferences
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.totalCourses ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Learners</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.totalLearners ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Instructors</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData?.totalInstructors ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-2xl font-bold text-gray-900">{billingInfo.plan}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="organization"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4"
          >
            <Building className="w-4 h-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
            <h3 className="text-lg font-semibold mb-6">Organization Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={orgSettings.name}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL identifier)</Label>
                <Input
                  value={orgSettings.slug}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input
                  value={orgSettings.domain || ""}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({ ...prev, domain: e.target.value }))
                  }
                  placeholder="yourcompany.com"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={orgSettings.logo_url || ""}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({ ...prev, logo_url: e.target.value }))
                  }
                  placeholder="https://example.com/logo.png"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={orgSettings.settings?.industry || ""}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, industry: e.target.value },
                    }))
                  }
                  placeholder="Technology, Healthcare, etc."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input
                  value={orgSettings.settings?.timezone || ""}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, timezone: e.target.value },
                    }))
                  }
                  placeholder="America/New_York"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={orgSettings.settings?.description || ""}
                  onChange={(e) =>
                    setOrgSettings((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, description: e.target.value },
                    }))
                  }
                  placeholder="Brief description of your organization..."
                  rows={3}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveOrganization}
                disabled={saving || updateSettingsMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {saving || updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Tab (Mock) */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
            <h3 className="text-lg font-semibold mb-6">Current Plan</h3>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-6">
              <div>
                <Badge className="bg-blue-100 text-blue-700 mb-2">
                  {billingInfo.plan}
                </Badge>
                <p className="text-sm text-gray-600">
                  {billingInfo.usedLicenses} of {billingInfo.licenses} licenses used
                </p>
              </div>
              <Button variant="outline" className="rounded-xl">
                Upgrade Plan
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="font-semibold">{billingInfo.billingCycle}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="font-semibold">{billingInfo.nextBillingDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-semibold">
                  {billingInfo.paymentMethod} ending in {billingInfo.cardLast4}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">License Utilization</p>
                <p className="font-semibold">
                  {Math.round((billingInfo.usedLicenses / billingInfo.licenses) * 100)}%
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
            <h3 className="text-lg font-semibold mb-6">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Weekly Progress Reports</p>
                  <p className="text-sm text-gray-500">
                    Receive weekly summary of learner progress
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, weeklyDigest: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Course Completion Alerts</p>
                  <p className="text-sm text-gray-500">
                    Get notified when learners complete courses
                  </p>
                </div>
                <Switch
                  checked={notifications.courseCompletion}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, courseCompletion: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Low Engagement Warnings</p>
                  <p className="text-sm text-gray-500">
                    Alert when learners show low engagement
                  </p>
                </div>
                <Switch
                  checked={notifications.lowEngagement}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, lowEngagement: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">License Usage Warnings</p>
                  <p className="text-sm text-gray-500">
                    Notify when license usage exceeds 80%
                  </p>
                </div>
                <Switch
                  checked={notifications.licenseWarnings}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, licenseWarnings: checked }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

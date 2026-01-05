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
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Building,
  Users,
  CreditCard,
  Shield,
  Bell,
  Save,
  Clock,
  Key,
  Link,
  Loader2,
  Download,
  Trash2,
  Plus,
  Copy,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

interface OrganizationSettings {
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
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

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected";
  lastSync?: string;
  icon: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  permissions: string[];
}

export default function BusinessSettings() {
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("organization");

  // Organization Settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: "TechCorp Inc.",
    industry: "Technology",
    size: "500-1000",
    website: "https://techcorp.example.com",
    description:
      "Leading technology company focused on innovation and digital transformation",
    address: "123 Tech Street, San Francisco, CA 94105",
    phone: "+1 (555) 123-4567",
    email: "admin@techcorp.example.com",
    timezone: "America/Los_Angeles",
  });

  // Billing Info
  const billingInfo: BillingInfo = {
    plan: "Enterprise",
    licenses: 1500,
    usedLicenses: 1247,
    billingCycle: "Annual",
    nextBillingDate: "2025-01-15",
    paymentMethod: "Credit Card",
    cardLast4: "4242",
  };

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailReports: true,
    weeklyDigest: true,
    learnerProgress: true,
    courseCompletion: true,
    lowEngagement: true,
    licenseWarnings: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  // SSO Settings
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [ssoProvider, setSsoProvider] = useState("okta");

  // Integrations
  const integrations: IntegrationConfig[] = [
    {
      id: "1",
      name: "Slack",
      type: "Communication",
      status: "connected",
      lastSync: "2024-03-20 14:30",
      icon: "💬",
    },
    {
      id: "2",
      name: "Microsoft Teams",
      type: "Communication",
      status: "disconnected",
      icon: "📱",
    },
    {
      id: "3",
      name: "Salesforce",
      type: "CRM",
      status: "connected",
      lastSync: "2024-03-20 12:00",
      icon: "☁️",
    },
    {
      id: "4",
      name: "Workday",
      type: "HR",
      status: "disconnected",
      icon: "👥",
    },
    {
      id: "5",
      name: "Google Workspace",
      type: "SSO",
      status: "connected",
      lastSync: "2024-03-20 15:00",
      icon: "🔐",
    },
  ];

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "pk_live_****************************abcd",
      createdAt: "2024-01-15",
      lastUsed: "2024-03-20",
      permissions: ["read", "write"],
    },
    {
      id: "2",
      name: "Analytics Integration",
      key: "pk_live_****************************efgh",
      createdAt: "2024-02-20",
      lastUsed: "2024-03-19",
      permissions: ["read"],
    },
  ]);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");

  // Handlers
  const handleSaveOrganization = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert(
      language === "vi" ? "Đã lưu thành công!" : "Settings saved successfully!"
    );
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert(
      language === "vi"
        ? "Đã cập nhật cài đặt thông báo!"
        : "Notification settings updated!"
    );
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      alert(
        language === "vi"
          ? "Vui lòng nhập tên API key"
          : "Please enter API key name"
      );
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKeyName,
      key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "-",
      permissions: ["read"],
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKeyName("");
    setIsApiKeyModalOpen(false);
  };

  const handleDeleteApiKey = (keyId: string) => {
    if (
      confirm(
        language === "vi"
          ? "Bạn có chắc muốn xóa API key này?"
          : "Are you sure you want to delete this API key?"
      )
    ) {
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert(language === "vi" ? "Đã sao chép!" : "Copied to clipboard!");
  };

  const handleToggleIntegration = (_integrationId: string) => {
    // In real app, this would call an API
    alert(
      language === "vi" ? "Tính năng đang phát triển" : "Feature coming soon"
    );
  };

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Other",
  ];

  const companySizes = [
    "1-50",
    "51-200",
    "201-500",
    "500-1000",
    "1000-5000",
    "5000+",
  ];

  const timezones = [
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Asia/Ho_Chi_Minh",
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === "vi" ? "Cài đặt doanh nghiệp" : "Business Settings"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === "vi"
              ? "Quản lý cài đặt tổ chức và tích hợp"
              : "Manage organization settings and integrations"}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="organization">
            <Building className="w-4 h-4 mr-2" />
            {language === "vi" ? "Tổ chức" : "Organization"}
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            {language === "vi" ? "Thanh toán" : "Billing"}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {language === "vi" ? "Thông báo" : "Notifications"}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            {language === "vi" ? "Bảo mật" : "Security"}
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link className="w-4 h-4 mr-2" />
            {language === "vi" ? "Tích hợp" : "Integrations"}
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === "vi"
                ? "Thông tin tổ chức"
                : "Organization Information"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Tên công ty" : "Company Name"}
                </Label>
                <Input
                  value={orgSettings.name}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Ngành nghề" : "Industry"}</Label>
                <Select
                  value={orgSettings.industry}
                  onValueChange={(value: string) =>
                    setOrgSettings({ ...orgSettings, industry: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Quy mô" : "Company Size"}</Label>
                <Select
                  value={orgSettings.size}
                  onValueChange={(value: string) =>
                    setOrgSettings({ ...orgSettings, size: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} {language === "vi" ? "nhân viên" : "employees"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Website" : "Website"}</Label>
                <Input
                  type="url"
                  value={orgSettings.website}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, website: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{language === "vi" ? "Mô tả" : "Description"}</Label>
                <Textarea
                  rows={3}
                  value={orgSettings.description}
                  onChange={(e) =>
                    setOrgSettings({
                      ...orgSettings,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Email" : "Email"}</Label>
                <Input
                  type="email"
                  value={orgSettings.email}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Điện thoại" : "Phone"}</Label>
                <Input
                  type="tel"
                  value={orgSettings.phone}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{language === "vi" ? "Địa chỉ" : "Address"}</Label>
                <Input
                  value={orgSettings.address}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Múi giờ" : "Timezone"}</Label>
                <Select
                  value={orgSettings.timezone}
                  onValueChange={(value: string) =>
                    setOrgSettings({ ...orgSettings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveOrganization}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                {language === "vi" ? "Lưu thay đổi" : "Save Changes"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "vi" ? "Gói hiện tại" : "Current Plan"}
                  </p>
                  <p className="text-lg font-semibold">{billingInfo.plan}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "vi" ? "License" : "Licenses"}
                  </p>
                  <p className="text-lg font-semibold">
                    {billingInfo.usedLicenses}/{billingInfo.licenses}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === "vi"
                      ? "Thanh toán tiếp theo"
                      : "Next Billing"}
                  </p>
                  <p className="text-lg font-semibold">
                    {billingInfo.nextBillingDate}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === "vi" ? "Chi tiết thanh toán" : "Billing Details"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {language === "vi" ? "Chu kỳ thanh toán" : "Billing Cycle"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {billingInfo.billingCycle}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {language === "vi" ? "Thay đổi" : "Change"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{billingInfo.paymentMethod}</p>
                    <p className="text-sm text-muted-foreground">
                      •••• •••• •••• {billingInfo.cardLast4}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {language === "vi" ? "Cập nhật" : "Update"}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {language === "vi" ? "Tải hóa đơn" : "Download Invoices"}
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {language === "vi" ? "Mua thêm license" : "Add Licenses"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === "vi"
                ? "Cài đặt thông báo"
                : "Notification Settings"}
            </h3>

            <div className="space-y-4">
              {[
                {
                  key: "emailReports",
                  label:
                    language === "vi" ? "Báo cáo qua email" : "Email Reports",
                  desc:
                    language === "vi"
                      ? "Nhận báo cáo định kỳ qua email"
                      : "Receive periodic reports via email",
                },
                {
                  key: "weeklyDigest",
                  label:
                    language === "vi" ? "Tổng hợp hàng tuần" : "Weekly Digest",
                  desc:
                    language === "vi"
                      ? "Tổng hợp hoạt động hàng tuần"
                      : "Weekly activity summary",
                },
                {
                  key: "learnerProgress",
                  label:
                    language === "vi" ? "Tiến độ học viên" : "Learner Progress",
                  desc:
                    language === "vi"
                      ? "Thông báo khi học viên đạt milestone"
                      : "Notifications when learners reach milestones",
                },
                {
                  key: "courseCompletion",
                  label:
                    language === "vi"
                      ? "Hoàn thành khóa học"
                      : "Course Completion",
                  desc:
                    language === "vi"
                      ? "Thông báo khi học viên hoàn thành khóa học"
                      : "Notifications when learners complete courses",
                },
                {
                  key: "lowEngagement",
                  label:
                    language === "vi"
                      ? "Cảnh báo tương tác thấp"
                      : "Low Engagement Alerts",
                  desc:
                    language === "vi"
                      ? "Cảnh báo khi học viên không hoạt động"
                      : "Alerts when learners become inactive",
                },
                {
                  key: "licenseWarnings",
                  label:
                    language === "vi" ? "Cảnh báo license" : "License Warnings",
                  desc:
                    language === "vi"
                      ? "Thông báo khi license sắp hết"
                      : "Notifications when licenses are running low",
                },
                {
                  key: "systemUpdates",
                  label:
                    language === "vi" ? "Cập nhật hệ thống" : "System Updates",
                  desc:
                    language === "vi"
                      ? "Thông báo về tính năng mới"
                      : "Notifications about new features",
                },
                {
                  key: "marketingEmails",
                  label:
                    language === "vi" ? "Email marketing" : "Marketing Emails",
                  desc:
                    language === "vi"
                      ? "Nhận thông tin khuyến mãi"
                      : "Receive promotional content",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={
                      notifications[item.key as keyof typeof notifications]
                    }
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: checked,
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveNotifications}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                {language === "vi" ? "Lưu cài đặt" : "Save Settings"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* SSO Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === "vi"
                ? "Đăng nhập một lần (SSO)"
                : "Single Sign-On (SSO)"}
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <p className="font-medium">
                  {language === "vi" ? "Bật SSO" : "Enable SSO"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "vi"
                    ? "Cho phép nhân viên đăng nhập bằng SSO của công ty"
                    : "Allow employees to login using company SSO"}
                </p>
              </div>
              <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} />
            </div>

            {ssoEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {language === "vi" ? "Nhà cung cấp SSO" : "SSO Provider"}
                  </Label>
                  <Select value={ssoProvider} onValueChange={setSsoProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="okta">Okta</SelectItem>
                      <SelectItem value="azure">Azure AD</SelectItem>
                      <SelectItem value="google">Google Workspace</SelectItem>
                      <SelectItem value="onelogin">OneLogin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {language === "vi"
                      ? "Liên hệ support@codequest.com để cấu hình SSO"
                      : "Contact support@codequest.com to configure SSO"}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* API Keys */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {language === "vi" ? "API Keys" : "API Keys"}
              </h3>
              <Button onClick={() => setIsApiKeyModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {language === "vi" ? "Tạo API Key" : "Create API Key"}
              </Button>
            </div>

            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{key.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {key.key}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {language === "vi" ? "Tạo" : "Created"}: {key.createdAt}
                      </span>
                      <span>
                        {language === "vi" ? "Sử dụng gần nhất" : "Last used"}:{" "}
                        {key.lastUsed}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyApiKey(key.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {apiKeys.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>
                    {language === "vi"
                      ? "Chưa có API key nào"
                      : "No API keys yet"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === "vi" ? "Tích hợp có sẵn" : "Available Integrations"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {integration.icon}
                    </div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.type}
                      </p>
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === "vi" ? "Đồng bộ" : "Synced"}:{" "}
                          {integration.lastSync}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        integration.status === "connected"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {integration.status === "connected"
                        ? language === "vi"
                          ? "Đã kết nối"
                          : "Connected"
                        : language === "vi"
                        ? "Chưa kết nối"
                        : "Disconnected"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleIntegration(integration.id)}
                    >
                      {integration.status === "connected"
                        ? language === "vi"
                          ? "Cài đặt"
                          : "Settings"
                        : language === "vi"
                        ? "Kết nối"
                        : "Connect"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create API Key Modal */}
      <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === "vi" ? "Tạo API Key mới" : "Create New API Key"}
            </DialogTitle>
            <DialogDescription>
              {language === "vi"
                ? "API key sẽ chỉ hiển thị một lần sau khi tạo"
                : "The API key will only be shown once after creation"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {language === "vi" ? "Tên API Key" : "API Key Name"}
              </Label>
              <Input
                placeholder={
                  language === "vi"
                    ? "VD: Production API"
                    : "e.g., Production API"
                }
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApiKeyModalOpen(false)}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateApiKey}
            >
              {language === "vi" ? "Tạo API Key" : "Create API Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

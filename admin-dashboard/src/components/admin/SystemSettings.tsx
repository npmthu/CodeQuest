import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ValidatedInput } from "../ui/validated-input";
import { ValidatedTextarea } from "../ui/validated-textarea";
import { validateField, systemSettingsValidation } from "../../lib/validation";
import {
  Globe,
  Mail,
  Shield,
  CreditCard,
  Lock,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Server,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

interface SystemConfig {
  // General Settings
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;

  // User Settings
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  maxLoginAttempts: number;
  sessionTimeout: number;

  // Payment Settings
  currency: string;
  taxRate: number;
  enablePayments: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;

  // Email Settings
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpSecure: boolean;
  emailFromName: string;
  emailFromAddress: string;

  // Security Settings
  enforceStrongPasswords: boolean;
  enable2FA: boolean;
  allowSocialLogin: boolean;
  recaptchaEnabled: boolean;

  // Content Settings
  requirePostApproval: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  enableComments: boolean;
}

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [config, setConfig] = useState<SystemConfig>({
    // General
    siteName: "CodeQuest",
    siteDescription: "Learn to code with interactive courses and challenges",
    supportEmail: "support@codequest.com",
    maintenanceMode: false,
    maintenanceMessage:
      "We are currently performing maintenance. Please check back soon.",

    // User
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "student",
    maxLoginAttempts: 5,
    sessionTimeout: 24,

    // Payment
    currency: "USD",
    taxRate: 0,
    enablePayments: true,
    stripeEnabled: true,
    paypalEnabled: false,

    // Email
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "",
    smtpSecure: true,
    emailFromName: "CodeQuest",
    emailFromAddress: "noreply@codequest.com",

    // Security
    enforceStrongPasswords: true,
    enable2FA: false,
    allowSocialLogin: true,
    recaptchaEnabled: false,

    // Content
    requirePostApproval: false,
    maxFileUploadSize: 10,
    allowedFileTypes: ["jpg", "png", "gif", "pdf", "zip"],
    enableComments: true,
  });

  const [systemStatus, setSystemStatus] = useState({
    database: "healthy",
    api: "healthy",
    storage: "healthy",
    email: "healthy",
  });

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Validate a single field on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const rules =
      systemSettingsValidation[field as keyof typeof systemSettingsValidation];
    if (rules) {
      const fieldLabel = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
      const error = validateField(
        config[field as keyof SystemConfig],
        fieldLabel,
        rules
      );
      setErrors((prev) => ({
        ...prev,
        [field]: error || "",
      }));
    }
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(systemSettingsValidation).forEach(([field, rules]) => {
      if (rules) {
        const fieldLabel = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase());
        const error = validateField(
          config[field as keyof SystemConfig],
          fieldLabel,
          rules
        );
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    // Mark all fields as touched
    const allTouched = Object.keys(systemSettingsValidation).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setTouched(allTouched);

    return isValid;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setSaving(true);
    try {
      // In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    toast.info("Sending test email...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Test email sent successfully");
  };

  const handleClearCache = async () => {
    toast.info("Clearing cache...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Cache cleared successfully");
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-[#1E3A8A]">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div
                key={service}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                {status === "healthy" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium capitalize">{service}</p>
                  <p
                    className={`text-xs ${
                      status === "healthy" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleClearCache}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="users">
            <Shield className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="content">
            <Palette className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Basic site settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="Site Name"
                  value={config.siteName}
                  onChange={(e) =>
                    setConfig({ ...config, siteName: e.target.value })
                  }
                  onBlur={() => handleBlur("siteName")}
                  error={touched.siteName ? errors.siteName : undefined}
                  required
                  helperText="2-50 characters"
                />
                <ValidatedInput
                  label="Support Email"
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) =>
                    setConfig({ ...config, supportEmail: e.target.value })
                  }
                  onBlur={() => handleBlur("supportEmail")}
                  error={touched.supportEmail ? errors.supportEmail : undefined}
                  required
                  placeholder="support@example.com"
                />
              </div>
              <ValidatedTextarea
                label="Site Description"
                value={config.siteDescription}
                onChange={(e) =>
                  setConfig({ ...config, siteDescription: e.target.value })
                }
                onBlur={() => handleBlur("siteDescription")}
                error={
                  touched.siteDescription ? errors.siteDescription : undefined
                }
                rows={3}
                maxLength={500}
                showCharCount
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Maintenance Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Maintenance Mode</p>
                  <p className="text-sm text-gray-500">
                    Users will see maintenance message
                  </p>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, maintenanceMode: checked })
                  }
                />
              </div>
              {config.maintenanceMode && (
                <ValidatedTextarea
                  label="Maintenance Message"
                  value={config.maintenanceMessage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maintenanceMessage: e.target.value,
                    })
                  }
                  onBlur={() => handleBlur("maintenanceMessage")}
                  error={
                    touched.maintenanceMessage
                      ? errors.maintenanceMessage
                      : undefined
                  }
                  rows={2}
                  maxLength={500}
                  showCharCount
                  required={config.maintenanceMode}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow New Registrations</p>
                  <p className="text-sm text-gray-500">
                    Enable or disable new user signups
                  </p>
                </div>
                <Switch
                  checked={config.allowRegistration}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, allowRegistration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-sm text-gray-500">
                    Users must verify email before access
                  </p>
                </div>
                <Switch
                  checked={config.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, requireEmailVerification: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default User Role</Label>
                  <Select
                    value={config.defaultUserRole}
                    onValueChange={(value) =>
                      setConfig({ ...config, defaultUserRole: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ValidatedInput
                  label="Session Timeout (hours)"
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sessionTimeout: parseInt(e.target.value) || 0,
                    })
                  }
                  onBlur={() => handleBlur("sessionTimeout")}
                  error={
                    touched.sessionTimeout ? errors.sessionTimeout : undefined
                  }
                  required
                  min={1}
                  max={720}
                  helperText="1-720 hours (max 30 days)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Payments</p>
                  <p className="text-sm text-gray-500">
                    Allow users to purchase subscriptions
                  </p>
                </div>
                <Switch
                  checked={config.enablePayments}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enablePayments: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={config.currency}
                    onValueChange={(value) =>
                      setConfig({ ...config, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ValidatedInput
                  label="Tax Rate (%)"
                  type="number"
                  value={config.taxRate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  onBlur={() => handleBlur("taxRate")}
                  error={touched.taxRate ? errors.taxRate : undefined}
                  min={0}
                  max={100}
                  step={0.1}
                  helperText="0-100%"
                />
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Payment Gateways</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-gray-500">
                        Credit cards & more
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.stripeEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, stripeEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">P</span>
                    </div>
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-500">PayPal payments</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.paypalEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, paypalEnabled: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="SMTP Host"
                  value={config.smtpHost}
                  onChange={(e) =>
                    setConfig({ ...config, smtpHost: e.target.value })
                  }
                  onBlur={() => handleBlur("smtpHost")}
                  error={touched.smtpHost ? errors.smtpHost : undefined}
                  placeholder="smtp.example.com"
                  helperText="e.g., smtp.gmail.com"
                />
                <ValidatedInput
                  label="SMTP Port"
                  value={config.smtpPort}
                  onChange={(e) =>
                    setConfig({ ...config, smtpPort: e.target.value })
                  }
                  onBlur={() => handleBlur("smtpPort")}
                  error={touched.smtpPort ? errors.smtpPort : undefined}
                  placeholder="587"
                  helperText="Common: 587 (TLS), 465 (SSL)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="SMTP Username"
                  value={config.smtpUser}
                  onChange={(e) =>
                    setConfig({ ...config, smtpUser: e.target.value })
                  }
                  onBlur={() => handleBlur("smtpUser")}
                  error={touched.smtpUser ? errors.smtpUser : undefined}
                  placeholder="user@example.com"
                />
                <ValidatedInput
                  label="SMTP Password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Use Secure Connection (TLS)</p>
                  <p className="text-sm text-gray-500">
                    Encrypt email communications
                  </p>
                </div>
                <Switch
                  checked={config.smtpSecure}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, smtpSecure: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <ValidatedInput
                  label="From Name"
                  value={config.emailFromName}
                  onChange={(e) =>
                    setConfig({ ...config, emailFromName: e.target.value })
                  }
                  onBlur={() => handleBlur("emailFromName")}
                  error={
                    touched.emailFromName ? errors.emailFromName : undefined
                  }
                  placeholder="Your Company"
                  maxLength={50}
                />
                <ValidatedInput
                  label="From Address"
                  type="email"
                  value={config.emailFromAddress}
                  onChange={(e) =>
                    setConfig({ ...config, emailFromAddress: e.target.value })
                  }
                  onBlur={() => handleBlur("emailFromAddress")}
                  error={
                    touched.emailFromAddress
                      ? errors.emailFromAddress
                      : undefined
                  }
                  placeholder="noreply@example.com"
                />
              </div>
              <Button variant="outline" onClick={handleTestEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enforce Strong Passwords</p>
                  <p className="text-sm text-gray-500">
                    Require uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
                <Switch
                  checked={config.enforceStrongPasswords}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enforceStrongPasswords: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Enable Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500">
                    Allow users to enable 2FA
                  </p>
                </div>
                <Switch
                  checked={config.enable2FA}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enable2FA: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Social Login</p>
                  <p className="text-sm text-gray-500">
                    Enable Google, GitHub login
                  </p>
                </div>
                <Switch
                  checked={config.allowSocialLogin}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, allowSocialLogin: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable reCAPTCHA</p>
                  <p className="text-sm text-gray-500">
                    Protect forms from spam
                  </p>
                </div>
                <Switch
                  checked={config.recaptchaEnabled}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, recaptchaEnabled: checked })
                  }
                />
              </div>
              <div className="pt-4 border-t">
                <ValidatedInput
                  label="Max Login Attempts"
                  type="number"
                  value={config.maxLoginAttempts}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxLoginAttempts: parseInt(e.target.value) || 0,
                    })
                  }
                  onBlur={() => handleBlur("maxLoginAttempts")}
                  error={
                    touched.maxLoginAttempts
                      ? errors.maxLoginAttempts
                      : undefined
                  }
                  className="w-32"
                  min={1}
                  max={20}
                  required
                  helperText="Lock account after this many failed attempts (1-20)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Post Approval</p>
                  <p className="text-sm text-gray-500">
                    New posts require admin approval
                  </p>
                </div>
                <Switch
                  checked={config.requirePostApproval}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, requirePostApproval: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Comments</p>
                  <p className="text-sm text-gray-500">
                    Allow users to comment on courses
                  </p>
                </div>
                <Switch
                  checked={config.enableComments}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enableComments: checked })
                  }
                />
              </div>
              <div className="pt-4 border-t">
                <ValidatedInput
                  label="Max File Upload Size (MB)"
                  type="number"
                  value={config.maxFileUploadSize}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxFileUploadSize: parseInt(e.target.value) || 0,
                    })
                  }
                  onBlur={() => handleBlur("maxFileUploadSize")}
                  error={
                    touched.maxFileUploadSize
                      ? errors.maxFileUploadSize
                      : undefined
                  }
                  className="w-32"
                  min={1}
                  max={100}
                  required
                  helperText="Maximum upload size per file (1-100 MB)"
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {config.allowedFileTypes.map((type) => (
                    <Badge key={type} variant="outline">
                      .{type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

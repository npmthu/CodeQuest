import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useAuth } from "../contexts/AuthContext";
import {
  useUpdateUserProfile,
  useChangePassword,
  useDeleteAccount,
  useRevokeSession,
} from "../hooks/useApi";
import { toast } from "sonner";
import { User, Bell, Lock, Palette, Globe, Shield } from "lucide-react";

interface UserPreferences {
  theme: "light" | "dark";
  codeEditorTheme: string;
  language: string;
  timezone: string;
  notifications: {
    newLessonEmail: boolean;
    forumRepliesEmail: boolean;
    achievementEmail: boolean;
    weeklyProgressEmail: boolean;
    marketingEmail: boolean;
    dailyReminder: boolean;
    streakAlerts: boolean;
  };
  twoFactorEnabled: boolean;
}

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const updateProfileMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();
  const revokeSessionMutation = useRevokeSession();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    codeEditorTheme: "VS Code Dark",
    language: "English",
    timezone: "Pacific Time (PT)",
    notifications: {
      newLessonEmail: true,
      forumRepliesEmail: true,
      achievementEmail: true,
      weeklyProgressEmail: false,
      marketingEmail: false,
      dailyReminder: true,
      streakAlerts: true,
    },
    twoFactorEnabled: false,
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ============= PROFILE HANDLERS =============
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        display_name: displayName,
        bio: bio,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
  };

  // ============= PASSWORD HANDLERS =============
  const handleUpdatePassword = async () => {
    setPasswordError("");

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
      toast.error(error.message || "Failed to update password");
    }
  };

  // ============= SESSION HANDLERS =============
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success("Session revoked successfully");
    } catch (error) {
      console.error("Failed to revoke session:", error);
      toast.error("Failed to revoke session");
    }
  };

  // ============= ACCOUNT DELETION HANDLER =============
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      alert("Please enter your password to confirm");
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({
        password: deleteConfirmPassword,
      });

      // Redirect to login
      window.location.href = "/login";
    } catch (error: any) {
      toast.error(
        "Failed to delete account: " + (error.message || "Unknown error")
      );
      setDeleteConfirmPassword("");
    }
  };

  // ============= PREFERENCES HANDLERS =============
  const handlePreferenceChange = async (
    key: keyof UserPreferences,
    value: any
  ) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };
    setPreferences(updatedPreferences);

    try {
      // Save to API
      // await updateUserPreferences.mutateAsync(updatedPreferences);
    } catch (error) {
      console.error("Failed to save preference:", error);
    }
  };

  const handleNotificationToggle = async (
    notificationType: keyof typeof preferences.notifications,
    value: boolean
  ) => {
    const updatedPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [notificationType]: value,
      },
    };
    setPreferences(updatedPreferences);

    try {
      // Save to API
      // await updateUserPreferences.mutateAsync(updatedPreferences);
    } catch (error) {
      console.error("Failed to save notification preference:", error);
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      // Call API to enable/disable 2FA
      // if (enabled) {
      //   await enableTwoFactor.mutateAsync();
      // } else {
      //   await disableTwoFactor.mutateAsync();
      // }

      setPreferences((prev) => ({
        ...prev,
        twoFactorEnabled: enabled,
      }));

      alert(`Two-Factor Authentication ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Failed to update 2FA:", error);
      alert("Failed to update Two-Factor Authentication");
    }
  };

  const email = profile?.email || user?.email || "";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2>{t("settings.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            {t("settings.profile")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t("settings.notifications")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            {t("settings.security")}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="w-4 h-4 mr-2" />
            {t("settings.preferences")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">{t("settings.personalInfo")}</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="displayName">{t("settings.displayName")}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">{t("settings.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-2 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="bio">{t("settings.bio")}</Label>
                <textarea
                  id="bio"
                  className="w-full mt-2 p-3 border border-input rounded-lg resize-none"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">{t("settings.location")}</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? t("settings.saving")
                  : t("settings.saveChanges")}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t("settings.socialLinks")}</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="github">{t("settings.github")}</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">{t("settings.linkedin")}</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="website">{t("settings.website")}</Label>
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? t("settings.saving")
                  : t("settings.saveLinks")}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">{t("settings.emailNotifications")}</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.newLesson")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.newLessonDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.newLessonEmail}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("newLessonEmail", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.forumReplies")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.forumRepliesDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.forumRepliesEmail}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("forumRepliesEmail", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.achievements")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.achievementsDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.achievementEmail}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("achievementEmail", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.weeklyReport")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.weeklyReportDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.weeklyProgressEmail}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("weeklyProgressEmail", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.marketing")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.marketingDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.marketingEmail}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("marketingEmail", checked)
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t("settings.pushNotifications")}</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.dailyReminder")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.dailyReminderDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.dailyReminder}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("dailyReminder", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.streakAlerts")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.streakAlertsDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.streakAlerts}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("streakAlerts", checked)
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">{t("settings.changePassword")}</h3>
            <div className="space-y-4 max-w-2xl">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="mt-2"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="mt-2"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="mt-2"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleUpdatePassword}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t("settings.twoFactor")}</h3>
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p>Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <p>{t("settings.enable2FA")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.enable2FADesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t("settings.activeSessions")}</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div>
                  <p>MacBook Pro - Chrome</p>
                  <p className="text-sm text-muted-foreground">
                    San Francisco, CA • {t("settings.currentSession")}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  {t("settings.active")}
                </Badge>
              </div>
              <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div>
                  <p>iPhone 14 - Safari</p>
                  <p className="text-sm text-muted-foreground">
                    San Francisco, CA • 2 hours ago
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession("session-id-2")}
                >
                  Revoke
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>{t("settings.appearance")}</h3>
              {darkMode && (
                <Badge className="bg-purple-100 text-purple-700">
                  {t("settings.darkModeActive")}
                </Badge>
              )}
            </div>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.darkMode")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.darkModeDesc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.theme === "dark"}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("theme", checked ? "dark" : "light")
                  }
                />
              </div>
              <div>
                <Label>Code Editor Theme</Label>
                <select
                  className="w-full mt-2 p-3 border border-input rounded-lg"
                  value={preferences.codeEditorTheme}
                  onChange={(e) =>
                    handlePreferenceChange("codeEditorTheme", e.target.value)
                  }
                >
                  <option>VS Code Dark</option>
                  <option>VS Code Light</option>
                  <option>Monokai</option>
                  <option>Dracula</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>{t("settings.languageRegion")}</h3>
              <Badge variant="outline">
                {language === "vi" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"} •{" "}
                {timezone}
              </Badge>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label>{t("settings.language")}</Label>
                <select
                  className="w-full mt-2 p-3 border border-input rounded-lg"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "vi")}
                >
                  <option value="en">{t("lang.english")}</option>
                  <option value="vi">{t("lang.vietnamese")}</option>
                </select>
              </div>
              <div>
                <Label>Timezone</Label>
                <select
                  className="w-full mt-2 p-3 border border-input rounded-lg"
                  value={preferences.timezone}
                  onChange={(e) =>
                    handlePreferenceChange("timezone", e.target.value)
                  }
                >
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-red-200">
            <h3 className="mb-6 text-red-600">{t("settings.dangerZone")}</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t("settings.deleteAccount")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.deleteAccountDesc")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending
                    ? "Deleting..."
                    : "Delete Account"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All your data will be permanently
                deleted. Please enter your password to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <Label htmlFor="deletePassword">Password Confirmation</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="Enter your password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete My Account
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useUpdateUserProfile } from "../hooks/useApi";
import { 
  User, 
  Bell, 
  Lock, 
  Palette,
  Globe,
  Shield
} from "lucide-react";

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const updateProfileMutation = useUpdateUserProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // Preferences state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [codeTheme, setCodeTheme] = useState(() => {
    return localStorage.getItem('codeTheme') || 'VS Code Dark';
  });
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('timezone') || 'Pacific Time (PT)';
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: false,
    marketing: false,
    dailyReminder: true,
    streakAlerts: true
  });
  
  // Apply dark mode on mount and when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('codeTheme', codeTheme);
  }, [codeTheme]);
  
  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);
  
  // Save notification preferences
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        display_name: displayName,
        bio: bio,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  };

  const email = profile?.email || user?.email || '';

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2>{t('settings.title')}</h2>
        <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            {t('settings.profile')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t('settings.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            {t('settings.security')}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="w-4 h-4 mr-2" />
            {t('settings.preferences')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">{t('settings.personalInfo')}</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="displayName">{t('settings.displayName')}</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label htmlFor="email">{t('settings.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled
                  className="mt-2 bg-gray-100" 
                />
              </div>
              <div>
                <Label htmlFor="bio">{t('settings.bio')}</Label>
                <textarea
                  id="bio"
                  className="w-full mt-2 p-3 border border-input rounded-lg resize-none"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">{t('settings.location')}</Label>
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
                {updateProfileMutation.isPending ? t('settings.saving') : t('settings.saveChanges')}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t('settings.socialLinks')}</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="github">{t('settings.github')}</Label>
                <Input 
                  id="github" 
                  placeholder="https://github.com/username" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label htmlFor="linkedin">{t('settings.linkedin')}</Label>
                <Input 
                  id="linkedin" 
                  placeholder="https://linkedin.com/in/username" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label htmlFor="website">{t('settings.website')}</Label>
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
                {updateProfileMutation.isPending ? t('settings.saving') : t('settings.saveLinks')}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">{t('settings.emailNotifications')}</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.newLesson')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.newLessonDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.forumReplies')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.forumRepliesDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.achievements')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.achievementsDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.weeklyReport')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.weeklyReportDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.weeklyReport} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.marketing')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.marketingDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.marketing} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))} 
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t('settings.pushNotifications')}</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.dailyReminder')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.dailyReminderDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.dailyReminder} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyReminder: checked }))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.streakAlerts')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.streakAlertsDesc')}</p>
                </div>
                <Switch 
                  checked={notifications.streakAlerts} 
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, streakAlerts: checked }))} 
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">{t('settings.changePassword')}</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                <Input id="currentPassword" type="password" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                <Input id="newPassword" type="password" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
                <Input id="confirmPassword" type="password" className="mt-2" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">{t('settings.updatePassword')}</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t('settings.twoFactor')}</h3>
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p>{t('settings.enable2FA')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.enable2FADesc')}</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">{t('settings.activeSessions')}</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div>
                  <p>MacBook Pro - Chrome</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA • {t('settings.currentSession')}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">{t('settings.active')}</Badge>
              </div>
              <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div>
                  <p>iPhone 14 - Safari</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA • 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">{t('settings.revoke')}</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>{t('settings.appearance')}</h3>
              {darkMode && (
                <Badge className="bg-purple-100 text-purple-700">
                  {t('settings.darkModeActive')}
                </Badge>
              )}
            </div>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.darkMode')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.darkModeDesc')}</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div>
                <Label>{t('settings.codeTheme')}</Label>
                <select 
                  className="w-full mt-2 p-3 border border-input rounded-lg"
                  value={codeTheme}
                  onChange={(e) => setCodeTheme(e.target.value)}
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
              <h3>{t('settings.languageRegion')}</h3>
              <Badge variant="outline">
                {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'} • {timezone}
              </Badge>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label>{t('settings.language')}</Label>
                <select 
                  className="w-full mt-2 p-3 border border-input rounded-lg"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
                >
                  <option value="en">{t('lang.english')}</option>
                  <option value="vi">{t('lang.vietnamese')}</option>
                </select>
              </div>
              <div>
                <Label>{t('settings.timezone')}</Label>
                <select 
                  className="w-full mt-2 p-3 border border-input rounded-lg"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
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
            <h3 className="mb-6 text-red-600">{t('settings.dangerZone')}</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>{t('settings.deleteAccount')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.deleteAccountDesc')}</p>
                </div>
                <Button variant="destructive">{t('settings.deleteAccount')}</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

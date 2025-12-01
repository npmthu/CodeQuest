import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../api/ApiProvider";
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
  const api = useApi();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await api.patch('/users/me', {
        display_name: displayName,
        bio: bio,
        // Add other fields as needed
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const email = profile?.email || user?.email || '';

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2>Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Personal Information</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled
                  className="mt-2 bg-gray-100" 
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full mt-2 p-3 border border-input rounded-lg resize-none"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
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
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Social Links</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input 
                  id="github" 
                  placeholder="https://github.com/username" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  placeholder="https://linkedin.com/in/username" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="mt-2" 
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
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
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Links'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Email Notifications</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>New lesson available</p>
                  <p className="text-sm text-muted-foreground">Get notified when new lessons are published</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Forum replies</p>
                  <p className="text-sm text-muted-foreground">Receive notifications for forum activity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Achievement unlocked</p>
                  <p className="text-sm text-muted-foreground">Get notified when you earn badges</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Weekly progress summary</p>
                  <p className="text-sm text-muted-foreground">Receive a weekly email with your progress</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Marketing emails</p>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Push Notifications</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>Daily reminder</p>
                  <p className="text-sm text-muted-foreground">Remind me to practice coding daily</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Streak alerts</p>
                  <p className="text-sm text-muted-foreground">Alert when my streak is about to break</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Change Password</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" className="mt-2" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Two-Factor Authentication</h3>
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p>Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Active Sessions</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div>
                  <p>MacBook Pro - Chrome</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA • Current session</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div>
                  <p>iPhone 14 - Safari</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA • 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Appearance</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch />
              </div>
              <div>
                <Label>Code Editor Theme</Label>
                <select className="w-full mt-2 p-3 border border-input rounded-lg">
                  <option>VS Code Dark</option>
                  <option>VS Code Light</option>
                  <option>Monokai</option>
                  <option>Dracula</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Language & Region</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label>Language</Label>
                <select className="w-full mt-2 p-3 border border-input rounded-lg">
                  <option>English</option>
                  <option>Vietnamese</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <Label>Timezone</Label>
                <select className="w-full mt-2 p-3 border border-input rounded-lg">
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-red-200">
            <h3 className="mb-6 text-red-600">Danger Zone</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p>Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Upload, X } from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../hooks/useProfile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    level: 'Beginner',
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        level: profile.level || 'Beginner',
      });
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload avatar if changed
      if (avatarFile) {
        await uploadAvatar.mutateAsync(avatarFile);
      }
      
      // Update profile data
      const updateData: any = {};
      
      if (formData.display_name !== profile?.display_name) {
        updateData.display_name = formData.display_name.trim();
      }
      
      if (formData.bio !== profile?.bio) {
        updateData.bio = formData.bio.trim();
      }
      
      if (formData.level !== profile?.level) {
        updateData.level = formData.level;
      }
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile.mutateAsync(updateData);
      }
      
      onClose();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const isLoading = updateProfile.isPending || uploadAvatar.isPending;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview} alt="Avatar" />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.display_name || 'User')}
                </AvatarFallback>
              </Avatar>
              
              {/* Avatar Upload Button */}
              <div className="absolute -bottom-2 -right-2">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Remove Avatar Button */}
              {avatarPreview && (
                <div className="absolute -top-2 -right-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="rounded-full w-6 h-6 p-0"
                    onClick={handleRemoveAvatar}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF or WebP. Max 5MB.
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="Enter your display name"
              maxLength={255}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/2000 characters
            </p>
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Skill Level</Label>
            <Select value={formData.level} onValueChange={(value: string) => handleInputChange('level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

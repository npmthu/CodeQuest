import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  Plus,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function CreateSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    session_date: '',
    duration_minutes: 60,
    price: 29.99,
    max_slots: 5,
    session_link: '',
    requirements: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to create a session');
      return;
    }

    // Validation
    const requiredFields = ['title', 'topic', 'session_date', 'duration_minutes', 'max_slots'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate session date is in the future
    const sessionDate = new Date(formData.session_date);
    if (sessionDate <= new Date()) {
      toast.error('Session date must be in the future');
      return;
    }

    // Validate duration
    if (formData.duration_minutes < 15 || formData.duration_minutes > 240) {
      toast.error('Duration must be between 15 and 240 minutes');
      return;
    }

    // Validate slots
    if (formData.max_slots < 1 || formData.max_slots > 20) {
      toast.error('Max slots must be between 1 and 20');
      return;
    }

    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabaseClient');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Session expired. Please login again.');
      }
      
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/mock-interviews/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          session_date: new Date(formData.session_date).toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create session');
      }

      const result = await response.json();
      
      toast.success('Interview session created successfully!');
      navigate('/instructor/interviews');
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const topics = [
    'JavaScript Fundamentals',
    'React & Frontend',
    'Node.js & Backend',
    'Data Structures & Algorithms',
    'System Design',
    'Database Design',
    'API Development',
    'Mobile Development',
    'DevOps & Deployment',
    'Security Best Practices',
    'Code Review & Testing',
    'Career Guidance'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/instructor/interviews')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interviews
          </Button>
          <h1 className="text-3xl font-bold">Create Interview Session</h1>
          <p className="text-muted-foreground">Set up a new mock interview session for learners</p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., JavaScript Fundamentals Interview"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this interview will cover..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Select value={formData.topic} onValueChange={(value: string) => handleInputChange('topic', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                <Select value={formData.difficulty_level} onValueChange={(value: string) => handleInputChange('difficulty_level', value as 'beginner' | 'intermediate' | 'advanced')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schedule & Pricing */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="session_date">Session Date & Time *</Label>
                <Input
                  id="session_date"
                  type="datetime-local"
                  value={formData.session_date}
                  onChange={(e) => handleInputChange('session_date', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    max="240"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="max_slots">Max Slots *</Label>
                  <Input
                    id="max_slots"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_slots}
                    onChange={(e) => handleInputChange('max_slots', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="session_link">Session Link (Optional)</Label>
                <Input
                  id="session_link"
                  placeholder="https://zoom.us/j/..."
                  value={formData.session_link}
                  onChange={(e) => handleInputChange('session_link', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Any prerequisites or materials learners should have..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Preview */}
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Session Preview
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{formData.title || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topic:</span>
                  <span className="font-medium">{formData.topic || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium capitalize">{formData.difficulty_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formData.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">${formData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Slots:</span>
                  <span className="font-medium">{formData.max_slots}</span>
                </div>
                {formData.session_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(formData.session_date).toLocaleDateString()} at {new Date(formData.session_date).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl"
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/instructor/interviews')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

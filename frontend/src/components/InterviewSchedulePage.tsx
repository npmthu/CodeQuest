import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
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
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Video,
  Users,
  Bell,
  CheckCircle,
  X,
  Download,
  RefreshCw
} from "lucide-react";

interface InterviewSchedulePageProps {
  onBack: () => void;
}

export default function InterviewSchedulePage({ onBack }: InterviewSchedulePageProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);

  const upcomingInterviews = [
    {
      id: 1,
      type: "Mock Technical Interview",
      interviewer: "Sarah Chen",
      date: "Nov 15, 2024",
      time: "2:00 PM",
      duration: "60 min",
      status: "Confirmed",
      reminder: true
    },
    {
      id: 2,
      type: "System Design Practice",
      interviewer: "Mike Johnson",
      date: "Nov 17, 2024",
      time: "4:30 PM",
      duration: "90 min",
      status: "Confirmed",
      reminder: true
    },
    {
      id: 3,
      type: "Behavioral Interview",
      interviewer: "Emily Rodriguez",
      date: "Nov 20, 2024",
      time: "10:00 AM",
      duration: "45 min",
      status: "Pending",
      reminder: false
    },
    {
      id: 4,
      type: "Frontend Development",
      interviewer: "David Kim",
      date: "Nov 22, 2024",
      time: "3:00 PM",
      duration: "60 min",
      status: "Confirmed",
      reminder: true
    },
  ];

  const timeSlots = [
    { time: "09:00 AM", available: true },
    { time: "10:00 AM", available: false, interview: "Behavioral Interview" },
    { time: "11:00 AM", available: true },
    { time: "12:00 PM", available: true },
    { time: "01:00 PM", available: true },
    { time: "02:00 PM", available: false, interview: "Mock Technical Interview" },
    { time: "03:00 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "05:00 PM", available: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interviews
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h2>Interview Schedule</h2>
              <p className="text-muted-foreground mt-1">
                Manage your interview appointments and availability
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" disabled>
                <Download className="w-4 h-4 mr-2" />
                Export Schedule
              </Button>
              <Dialog open={isNewScheduleOpen} onOpenChange={setIsNewScheduleOpen}>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsNewScheduleOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Interview</DialogTitle>
                    <DialogDescription>
                      🚧 This is a placeholder dialog. All scheduling features are non-functional.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Interview Type *</Label>
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Interview</SelectItem>
                            <SelectItem value="system">System Design</SelectItem>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="frontend">Frontend Development</SelectItem>
                            <SelectItem value="backend">Backend Development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration *</Label>
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input type="date" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Time *</Label>
                        <Input type="time" disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interviewer Email *</Label>
                      <Input 
                        type="email" 
                        placeholder="interviewer@example.com" 
                        disabled 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea 
                        placeholder="Add any special instructions or topics to cover..."
                        className="min-h-[100px]"
                        disabled
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Reminders</Label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-not-allowed">
                          <input type="checkbox" disabled className="rounded" />
                          <span className="text-sm text-muted-foreground">
                            Send email reminder 1 day before
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-not-allowed">
                          <input type="checkbox" disabled className="rounded" />
                          <span className="text-sm text-muted-foreground">
                            Send email reminder 1 hour before
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-not-allowed">
                          <input type="checkbox" disabled className="rounded" />
                          <span className="text-sm text-muted-foreground">
                            Add to Google Calendar
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-blue-600">Note:</strong> In the full implementation, 
                        you can schedule interviews with calendar integration, automated reminders, 
                        and time zone handling.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewScheduleOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                      Schedule Interview
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Notice */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            🚧 <strong>Scheduling System Placeholder:</strong> All calendar, time picker, and reminder features 
            are designed but not yet functional. Calendar sync and automated notifications will be available in the full implementation.
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>Calendar</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Calendar
                  </Button>
                </div>
              </div>
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />

              <div className="mt-6">
                <h4 className="mb-4">
                  Schedule for {date?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <div className="space-y-2">
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        slot.available
                          ? "border-gray-200 hover:border-blue-200 cursor-pointer"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      {slot.available ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Available
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600">
                            {slot.interview}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Interviews */}
          <div>
            <h3 className="mb-4">Upcoming Interviews</h3>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <Card key={interview.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm mb-2">{interview.type}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        with {interview.interviewer}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {interview.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {interview.time}
                        </span>
                      </div>
                    </div>
                    <Badge className={
                      interview.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }>
                      {interview.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">Duration:</span>
                    <span className="text-xs font-medium">{interview.duration}</span>
                    {interview.reminder && (
                      <Badge variant="outline" className="text-xs ml-auto">
                        <Bell className="w-3 h-3 mr-1" />
                        Reminder On
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Video className="w-3 h-3 mr-1" />
                      Join
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Calendar Integration */}
            <Card className="p-4 mt-6">
              <h4 className="mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Calendar Integration
              </h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Google Calendar
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  Outlook Calendar
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  Apple Calendar
                </Button>
              </div>
            </Card>

            {/* Reminder Settings */}
            <Card className="p-4 mt-6">
              <h4 className="mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Reminder Settings
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" disabled className="rounded" defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    Email notifications
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" disabled className="rounded" defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    24 hours before
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" disabled className="rounded" defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    1 hour before
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" disabled className="rounded" />
                  <span className="text-sm text-muted-foreground">
                    SMS notifications
                  </span>
                </label>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface InterviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  sessionId?: string;
  userRole?: 'instructor' | 'learner';
  instructorName?: string;
}

export default function InterviewFeedbackModal({
  isOpen,
  onClose,
  bookingId,
  sessionId,
  userRole = 'learner',
  instructorName = 'Instructor'
}: InterviewFeedbackModalProps) {
  const { session: authSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simplified ratings
  const [systemRating, setSystemRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState('');

  const renderStarRating = (
    rating: number,
    setRating: (value: number) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label className="text-white text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-500'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-gray-300 text-sm self-center">
          {rating > 0 ? `${rating}/5` : '-'}
        </span>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!systemRating || !overallRating) {
      toast.error('Please rate both system and experience');
      return;
    }

    if (!bookingId && !sessionId) {
      toast.error('Session information missing');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/mock-interviews/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession?.access_token}`
        },
        body: JSON.stringify({
          booking_id: bookingId,
          session_id: sessionId,
          overall_rating: systemRating,
          technical_rating: overallRating,
          communication_rating: overallRating,
          problem_solving_rating: overallRating,
          comments: comments || undefined,
          feedback_type: userRole === 'instructor' ? 'instructor_system' : 'learner_feedback',
          is_public: false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback (${response.status})`);
      }

      toast.success('Feedback submitted successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {userRole === 'instructor' ? 'System Feedback' : 'Session Feedback'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* System Rating - for both roles */}
          <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white text-sm">CodeQuest Platform</h3>
            {renderStarRating(systemRating, setSystemRating, 'Overall Experience')}
          </div>

          {/* Role-specific rating */}
          <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
            {userRole === 'instructor' ? (
              <>
                <h3 className="font-semibold text-white text-sm">Teaching Experience</h3>
                {renderStarRating(overallRating, setOverallRating, 'Learner Engagement')}
              </>
            ) : (
              <>
                <h3 className="font-semibold text-white text-sm">Interview Session</h3>
                {renderStarRating(overallRating, setOverallRating, 'Instructor Rating')}
              </>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-white text-sm">
              Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                userRole === 'instructor'
                  ? 'Any suggestions for improvement...'
                  : 'What went well or could improve...'
              }
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-sm"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400">{comments.length}/500</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-300"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!systemRating || !overallRating || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

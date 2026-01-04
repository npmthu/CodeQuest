import { Request, Response } from 'express';
import { MockInterviewService } from '../services/mockInterviewService';
import { AuthRequest } from '../middleware/auth';

export class FeedbackController {
  private interviewService: MockInterviewService;

  constructor() {
    this.interviewService = new MockInterviewService();
  }

  /**
   * POST /api/mock-interviews/feedback
   * Create feedback for a completed interview (Instructor only)
   */
  async createFeedback(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      // Both instructors and learners can provide feedback
      // Instructors provide feedback for learners
      // Learners provide feedback for instructors/system
      const userRole = user.role;
      const isInstructor = userRole === 'instructor' || userRole === 'business_partner';
      const isLearner = userRole === 'learner';

      const feedbackData = req.body;
      
      // Validate required fields based on role
      // Instructors provide feedback for system/session (no booking_id needed)
      // Learners provide feedback for instructors (booking_id required to link)
      const requiredRatings = ['overall_rating', 'technical_rating', 'communication_rating', 'problem_solving_rating'];
      const missingFields = requiredRatings.filter(field => feedbackData[field] === undefined || feedbackData[field] === null);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Learners must provide booking_id to link feedback to their booking
      // Instructors don't need booking_id (they provide system/session feedback)
      if (isLearner && !feedbackData.booking_id && !feedbackData.session_id) {
        return res.status(400).json({
          success: false,
          error: 'Learners must provide booking_id or session_id'
        });
      }

      // Validate rating ranges
      const ratings = ['overall_rating', 'technical_rating', 'communication_rating', 'problem_solving_rating'];
      for (const rating of ratings) {
        const value = feedbackData[rating];
        if (value < 1 || value > 5) {
          return res.status(400).json({
            success: false,
            error: `${rating} must be between 1 and 5`
          });
        }
      }

      const feedback = await this.interviewService.createFeedback(user.id, feedbackData);

      console.log('📝 Interview feedback created:', {
        feedbackId: feedback.id,
        bookingId: feedbackData.booking_id,
        instructorId: user.id,
        overallRating: feedback.overall_rating
      });

      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback created successfully'
      });
    } catch (error: any) {
      console.error('❌ Error creating feedback:', error);
      
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create feedback'
      });
    }
  }

  /**
   * GET /api/mock-interviews/my-feedback
   * Get current user's feedback (Learner only)
   */
  async getMyFeedback(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const filters = {
        session_id: req.query.session_id as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.interviewService.getLearnerFeedback(user.id, filters);

      res.json({
        success: true,
        data: result,
        message: `Found ${result.feedback.length} feedback entries`
      });
    } catch (error: any) {
      console.error('❌ Error fetching feedback:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch feedback'
      });
    }
  }

  /**
   * GET /api/mock-interviews/feedback/:id
   * Get specific feedback by ID (only if user is the learner or instructor)
   */
  async getFeedbackById(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { id } = req.params;
      
      // For now, we'll use the getLearnerFeedback method
      // In a real implementation, you'd have a getFeedbackById method
      const result = await this.interviewService.getLearnerFeedback(user.id, { page: 1, limit: 100 });
      const feedback = result.feedback.find(f => f.id === id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: 'Feedback not found or access denied'
        });
      }

      // Additional check: only the learner or instructor can view this feedback
      if (feedback.learner_id !== user.id && feedback.instructor_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: feedback
      });
    } catch (error: any) {
      console.error('❌ Error fetching feedback:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch feedback'
      });
    }
  }

  /**
   * PUT /api/mock-interviews/feedback/:id
   * Update feedback (Instructor only, and only their own feedback)
   */
  async updateFeedback(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (user.role !== 'instructor' && user.role !== 'business_partner') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only instructors can update feedback' 
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      // This would require implementing an updateFeedback method in the service
      // For now, return a placeholder response
      res.json({
        success: true,
        message: 'Feedback update functionality not yet implemented'
      });
    } catch (error: any) {
      console.error('❌ Error updating feedback:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update feedback'
      });
    }
  }

  /**
   * GET /api/mock-interviews/instructor-feedback-stats
   * Get feedback statistics for an instructor (Instructor only)
   */
  async getInstructorFeedbackStats(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (user.role !== 'instructor' && user.role !== 'business_partner') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only instructors can view feedback stats' 
        });
      }

      // This would require implementing statistics methods in the service
      // For now, return mock data
      const mockStats = {
        total_feedback_given: 0,
        average_ratings: {
          overall: 0,
          technical: 0,
          communication: 0,
          problem_solving: 0
        },
        feedback_by_month: [],
        recent_feedback: []
      };

      res.json({
        success: true,
        data: mockStats,
        message: 'Feedback statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('❌ Error fetching feedback stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch feedback statistics'
      });
    }
  }
}

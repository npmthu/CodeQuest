"""
Code Review Service - Business Logic
"""
import time
from typing import Dict, Any
from ai.gemini_client import GeminiClient
from db.operations import (
    get_submission_by_id,
    save_generated_content,
    save_code_review,
    get_code_review_by_submission
)


class CodeReviewService:
    def __init__(self):
        self.gemini_client = GeminiClient()
    
    def create_code_review(
        self,
        user_id: str,
        submission_id: str,
        language: str,
        code: str
    ) -> Dict[str, Any]:
        """
        Main entry point: create a code review for submitted code.
        
        Args:
            user_id: UUID of the user
            submission_id: UUID of the submission
            language: Programming language
            code: Source code to review
        
        Returns:
            Dict containing content_id, review_id, summary, issues, suggestions, quality_rating
        
        Raises:
            ValueError: If submission not found or invalid
            Exception: If AI or DB operation fails
        """
        # 1. Validate submission exists
        submission = get_submission_by_id(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")
        
        # 2. Check if review already exists
        existing_review = get_code_review_by_submission(submission_id)
        if existing_review:
            # Return existing review
            return self._format_existing_review(existing_review)
        
        # 3. Call Gemini AI for code review
        start_time = time.time()
        
        try:
            ai_response = self.gemini_client.review_code(code, language)
        except Exception as e:
            raise Exception(f"AI review failed: {str(e)}")
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # 4. Extract structured data
        summary = ai_response.get('summary', '')
        issues = ai_response.get('issues', [])
        suggestions = ai_response.get('suggestions', [])
        
        # 5. Calculate quality rating (simple algorithm)
        quality_rating = self._calculate_quality_rating(issues)
        overall_score = quality_rating * 20  # Convert 1-5 to 0-100 scale
        
        # 6. Save raw AI response to ai_generated_content
        content_id = save_generated_content(
            user_id=user_id,
            content_type='code_review',
            source_type='submission',
            source_id=submission_id,
            generated_data=ai_response
        )
        
        # 7. Save structured review to ai_code_reviews
        # Map AI response to schema fields
        review_id = save_code_review(
            submission_id=submission_id,
            summary=summary,
            strengths=suggestions,  # Suggestions are positive points
            improvements=issues,     # Issues are things to improve
            overall_score=overall_score,
            processing_time_ms=processing_time_ms,
            code_suggestions=None,  # Could be enhanced later
            dimensions=None         # Could add detailed scores later
        )
        
        # 8. Return response
        return {
            'content_id': content_id,
            'review_id': review_id,
            'summary': summary,
            'issues': issues,
            'suggestions': suggestions,
            'quality_rating': quality_rating,
            'overall_score': overall_score,
            'processing_time_ms': processing_time_ms
        }
    
    def _calculate_quality_rating(self, issues: list) -> int:
        """
        Calculate quality rating (1-5) based on number of issues.
        
        Args:
            issues: List of issues found
        
        Returns:
            Rating from 1 to 5 (5 is best)
        """
        num_issues = len(issues)
        
        # Simple algorithm: subtract issues from 5, clamp to 1-5
        rating = 5 - num_issues
        return max(1, min(5, rating))
    
    def _format_existing_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format existing review from DB to match API response.
        
        Args:
            review: Review data from database
        
        Returns:
            Formatted response dict
        """
        return {
            'content_id': None,  # Not stored for existing reviews
            'review_id': review['id'],
            'summary': review['summary'],
            'issues': review['improvements'] or [],  # improvements = issues
            'suggestions': review['strengths'] or [],  # strengths = suggestions
            'quality_rating': review['overall_score'] // 20,  # Convert back to 1-5
            'overall_score': review['overall_score'],
            'processing_time_ms': review['processing_time_ms']
        }

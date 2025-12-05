"""
API Routes for Code Review
"""
from flask import Blueprint, request
from services.code_review_service import CodeReviewService
from utils.response import success_response, error_response


code_review_bp = Blueprint('code_review', __name__)
review_service = CodeReviewService()


@code_review_bp.route('/api/ai/code-review', methods=['POST'])
def create_code_review():
    """
    POST /api/ai/code-review
    
    Request Body:
    {
        "user_id": "UUID",
        "submission_id": "UUID",
        "language": "python",
        "code": "..."
    }
    
    Response:
    {
        "success": true,
        "message": "Code review completed",
        "data": {
            "content_id": "...",
            "review_id": "...",
            "summary": "...",
            "issues": ["..."],
            "suggestions": ["..."],
            "quality_rating": 4,
            "overall_score": 80,
            "processing_time_ms": 1234
        }
    }
    """
    try:
        # Parse request body
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'submission_id', 'language', 'code']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            return error_response(
                f"Missing required fields: {', '.join(missing_fields)}",
                status_code=400
            )
        
        # Extract fields
        user_id = data['user_id']
        submission_id = data['submission_id']
        language = data['language']
        code = data['code']
        
        # Validate data types and content
        if not isinstance(code, str) or len(code.strip()) == 0:
            return error_response("Code must be a non-empty string", status_code=400)
        
        if not isinstance(language, str) or len(language.strip()) == 0:
            return error_response("Language must be a non-empty string", status_code=400)
        
        # Call service to create review
        result = review_service.create_code_review(
            user_id=user_id,
            submission_id=submission_id,
            language=language,
            code=code
        )
        
        return success_response(
            data=result,
            message="Code review completed successfully"
        )
        
    except ValueError as e:
        # Validation errors (e.g., submission not found)
        return error_response(str(e), status_code=404)
        
    except Exception as e:
        # Internal server errors
        return error_response(
            message="Internal server error",
            status_code=500,
            details={'error': str(e)}
        )


@code_review_bp.route('/api/ai/code-review/<submission_id>', methods=['GET'])
def get_code_review(submission_id: str):
    """
    GET /api/ai/code-review/<submission_id>
    
    Get existing code review for a submission.
    
    Response:
    {
        "success": true,
        "data": { ... review data ... }
    }
    """
    try:
        from db.operations import get_code_review_by_submission
        
        review = get_code_review_by_submission(submission_id)
        
        if not review:
            return error_response(
                f"No review found for submission {submission_id}",
                status_code=404
            )
        
        # Format response
        formatted = review_service._format_existing_review(review)
        
        return success_response(
            data=formatted,
            message="Review retrieved successfully"
        )
        
    except Exception as e:
        return error_response(
            message="Failed to retrieve review",
            status_code=500,
            details={'error': str(e)}
        )


@code_review_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return success_response({'status': 'healthy'}, message="Service is running")

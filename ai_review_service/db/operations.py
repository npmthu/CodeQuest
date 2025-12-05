"""
Database operations for AI code reviews using Supabase SDK
"""
from typing import Optional, Dict, Any, List
from db.db import db


def get_submission_by_id(submission_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch submission details from database using Supabase.
    
    Args:
        submission_id: UUID of the submission
    
    Returns:
        Submission data as dict or None if not found
    """
    try:
        client = db.get_client()
        
        # Query submissions with language join
        response = client.table('submissions')\
            .select('*, languages(name)')\
            .eq('id', submission_id)\
            .single()\
            .execute()
        
        if response.data:
            # Flatten the language data
            result = response.data.copy()
            if 'languages' in result and result['languages']:
                result['language_name'] = result['languages'].get('name')
            return result
        
        return None
        
    except Exception as e:
        print(f"Error fetching submission: {e}")
        return None


def save_generated_content(
    user_id: str,
    content_type: str,
    source_type: str,
    source_id: Optional[str],
    generated_data: Dict[str, Any]
) -> str:
    """
    Save AI-generated content to database using Supabase.
    
    Args:
        user_id: UUID of the user
        content_type: Type of content ('code_review', 'mindmap', etc.)
        source_type: Source type ('submission', 'lesson', 'problem', etc.)
        source_id: UUID of the source (submission_id, etc.)
        generated_data: The actual AI response data (will be stored as JSONB)
    
    Returns:
        ID of the created content record
    """
    try:
        client = db.get_client()
        
        data = {
            'user_id': user_id,
            'content_type': content_type,
            'source_type': source_type,
            'source_id': source_id,
            'generated_data': generated_data  # Supabase handles JSON automatically
        }
        
        response = client.table('ai_generated_content')\
            .insert(data)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['id']
        
        raise Exception("Failed to insert generated content")
        
    except Exception as e:
        raise Exception(f"Error saving generated content: {str(e)}")


def save_code_review(
    submission_id: str,
    summary: str,
    strengths: List[str],
    improvements: List[str],
    overall_score: int,
    processing_time_ms: int,
    code_suggestions: Optional[List[Dict]] = None,
    dimensions: Optional[Dict[str, int]] = None
) -> str:
    """
    Save structured code review to database using Supabase.
    
    Args:
        submission_id: UUID of the submission
        summary: Overall review summary
        strengths: List of positive points (mapped from suggestions)
        improvements: List of issues/improvements needed
        overall_score: Quality rating (0-100)
        processing_time_ms: Time taken for review in milliseconds
        code_suggestions: Optional list of code suggestion objects
        dimensions: Optional dict of score dimensions
    
    Returns:
        ID of the created review record
    """
    try:
        client = db.get_client()
        
        data = {
            'submission_id': submission_id,
            'status': 'COMPLETE',
            'overall_score': overall_score,
            'dimensions': dimensions,  # Supabase handles JSON/JSONB automatically
            'summary': summary,
            'strengths': strengths,
            'improvements': improvements,
            'code_suggestions': code_suggestions,
            'processing_time_ms': processing_time_ms
            # generated_at will be set by database NOW()
        }
        
        response = client.table('ai_code_reviews')\
            .insert(data)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['id']
        
        raise Exception("Failed to insert code review")
        
    except Exception as e:
        raise Exception(f"Error saving code review: {str(e)}")


def get_code_review_by_submission(submission_id: str) -> Optional[Dict[str, Any]]:
    """
    Get existing code review for a submission using Supabase.
    
    Args:
        submission_id: UUID of the submission
    
    Returns:
        Review data or None if not found
    """
    try:
        client = db.get_client()
        
        response = client.table('ai_code_reviews')\
            .select('*')\
            .eq('submission_id', submission_id)\
            .eq('status', 'COMPLETE')\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        return None
        
    except Exception as e:
        print(f"Error fetching code review: {e}")
        return None

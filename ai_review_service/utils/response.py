"""
Utility functions for API responses
"""
from typing import Dict, Any, Optional
from flask import jsonify


def success_response(data: Any, message: str = "Success", status_code: int = 200):
    """
    Create a successful API response.
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
    
    Returns:
        Flask JSON response
    """
    return jsonify({
        'success': True,
        'message': message,
        'data': data
    }), status_code


def error_response(message: str, status_code: int = 400, details: Optional[Dict] = None):
    """
    Create an error API response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        details: Additional error details
    
    Returns:
        Flask JSON response
    """
    response = {
        'success': False,
        'error': message
    }
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code

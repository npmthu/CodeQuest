"""
Gemini AI Client for Code Review
"""
import os
import json
import google.generativeai as genai
from typing import Dict, List, Any


class GeminiClient:
    AVAILABLE_MODELS = [
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-pro',
        'gemini-pro-vision',
        'gemini-1.5-pro',
    ]

    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model_name = os.getenv('GEMINI_MODEL', None)

        if not self.model_name:
            # Try to find a working model
            self.model_name = self._find_working_model()
        
        self.model = genai.GenerativeModel(self.model_name)
    
    def _find_working_model(self) -> str:
        """
        Try to find a working model from available models.
        Returns the first model that can be instantiated.
        """
        for model_name in self.AVAILABLE_MODELS:
            try:
                test_model = genai.GenerativeModel(model_name)
                return model_name
            except Exception as e:
                continue
        
        # If no model works, default to first in list and let it fail with clear error
        return self.AVAILABLE_MODELS[0]
    
    def review_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Send code to Gemini for review and return structured feedback.
        
        Args:
            code: The source code to review
            language: Programming language (e.g., 'python', 'java', 'javascript')
        
        Returns:
            Dict with keys: summary, issues, suggestions
        """
        prompt = self._build_review_prompt(code, language)
        
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_response(response.text)
            return result
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def _build_review_prompt(self, code: str, language: str) -> str:
        """Build the prompt for code review"""
        return f"""You are an expert code reviewer. Analyze the following {language} code and provide a structured review.

CODE:
```{language}
{code}
```

Provide your response in valid JSON format with the following structure:
{{
  "summary": "Brief overall assessment of the code (2-3 sentences)",
  "issues": ["List of specific problems, bugs, or anti-patterns found"],
  "suggestions": ["List of actionable improvements and best practices"]
}}

Focus on:
- Code correctness and potential bugs
- Code quality and readability
- Performance issues
- Security vulnerabilities
- Best practices for {language}

Return ONLY the JSON object, no additional text.
"""
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini response into structured format.
        Handles both direct JSON and markdown-wrapped JSON.
        """
        try:
            # Remove markdown code blocks if present
            text = response_text.strip()
            if text.startswith('```json'):
                text = text[7:]  # Remove ```json
            elif text.startswith('```'):
                text = text[3:]   # Remove ```
            
            if text.endswith('```'):
                text = text[:-3]
            
            text = text.strip()
            
            # Parse JSON
            parsed = json.loads(text)
            
            # Validate required fields
            if not isinstance(parsed.get('summary'), str):
                parsed['summary'] = "No summary provided"
            if not isinstance(parsed.get('issues'), list):
                parsed['issues'] = []
            if not isinstance(parsed.get('suggestions'), list):
                parsed['suggestions'] = []
            
            return parsed
            
        except json.JSONDecodeError as e:
            # Fallback: create structured response from plain text
            return {
                "summary": "AI review completed but response format was unexpected",
                "issues": ["Unable to parse structured feedback"],
                "suggestions": [response_text[:500]]  # First 500 chars as fallback
            }

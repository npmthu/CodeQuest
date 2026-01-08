/**
 * AI Service - Gemini API integration for code review and notebook assistance
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../config/database';

interface CodeReviewResult {
  summary: string;
  issues: string[];
  suggestions: string[];
  qualityRating: number;
}

interface NotebookAssistResult {
  response: string;
  suggestions?: string[];
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isConfigured: boolean = false;

  constructor() {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      if (!apiKey) {
        console.warn('⚠️  GEMINI_API_KEY not set - AI features will be disabled');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      this.isConfigured = true;
      console.log(`✅ AI Service initialized with model: ${modelName}`);
    } catch (error: any) {
      console.error('❌ AI Service initialization failed:', error.message);
    }
  }

  /**
   * Review submitted code using Gemini AI with retry logic
   */
  async reviewCode(
    code: string,
    language: string,
    problemTitle?: string
  ): Promise<CodeReviewResult> {
    if (!this.isConfigured || !this.model) {
      throw new Error('AI Service not configured - check GEMINI_API_KEY');
    }

    const prompt = this.buildCodeReviewPrompt(code, language, problemTitle);

    // Retry logic for network failures
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Attempting Gemini API call (attempt ${attempt}/${maxRetries})...`);
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✓ Gemini API call successful');
        return this.parseCodeReviewResponse(text);
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Gemini API error (attempt ${attempt}/${maxRetries}):`, {
          message: error.message,
          name: error.name,
          code: error.code,
        });

        // Don't retry on certain errors
        if (error.message?.includes('API key') || error.message?.includes('403')) {
          throw new Error(`AI code review failed: ${error.message}`);
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    console.error('❌ All Gemini API retry attempts failed');
    throw new Error(`AI code review failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Assist with notebook/problem-solving questions
   */
  async assistNotebook(
    question: string,
    context?: string
  ): Promise<NotebookAssistResult> {
    if (!this.isConfigured || !this.model) {
      throw new Error('AI Service not configured - check GEMINI_API_KEY');
    }

    const prompt = this.buildNotebookPrompt(question, context);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return { response: text };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`AI assistant failed: ${error.message}`);
    }
  }

  /**
   * Save AI-generated content to database
   */
  async saveGeneratedContent(
    userId: string,
    contentType: 'code_review' | 'notebook_assist' | 'hint',
    sourceType: 'submission' | 'problem' | 'note',
    sourceId: string,
    generatedData: any
  ): Promise<string> {
    try {
      const { data, error } = await supabaseAdmin
        .from('ai_generated_content')
        .insert({
          user_id: userId,
          content_type: contentType,
          source_type: sourceType,
          source_id: sourceId,
          generated_data: generatedData,
        })
        .select('id')
        .single();

      if (error) {
        // If duplicate key, try upsert instead
        if (error.code === '23505') {
          console.log(`Generated content already exists for ${sourceType} ${sourceId}, updating instead...`);
          const { data: upsertData, error: upsertError } = await supabaseAdmin
            .from('ai_generated_content')
            .update({
              generated_data: generatedData,
            })
            .eq('source_type', sourceType)
            .eq('source_id', sourceId)
            .eq('content_type', contentType)
            .select('id')
            .single();

          if (upsertError) throw upsertError;
          return upsertData.id;
        }
        throw error;
      }
      return data.id;
    } catch (err: any) {
      console.error(`Error saving generated content: ${err.message}`);
      throw err;
    }
  }

  /**
   * Save code review to ai_code_reviews table
   */
  async saveCodeReview(
    submissionId: string,
    summary: string,
    strengths: string[],
    improvements: string[],
    overallScore: number,
    processingTimeMs: number
  ): Promise<string> {
    try {
      const { data, error } = await supabaseAdmin
        .from('ai_code_reviews')
        .insert({
          submission_id: submissionId,
          summary,
          strengths,
          improvements,
          overall_score: overallScore,
          processing_time_ms: processingTimeMs,
        })
        .select('id')
        .single();

      if (error) {
        // If duplicate key error, try to update existing record
        if (error.code === '23505') { // Unique violation
          console.log(`Code review already exists for submission ${submissionId}, updating instead...`);
          const { data: updateData, error: updateError } = await supabaseAdmin
            .from('ai_code_reviews')
            .update({
              summary,
              strengths,
              improvements,
              overall_score: overallScore,
              processing_time_ms: processingTimeMs,
            })
            .eq('submission_id', submissionId)
            .select('id')
            .single();

          if (updateError) throw updateError;
          return updateData.id;
        }
        throw error;
      }
      return data.id;
    } catch (err: any) {
      console.error(`Error saving code review: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get existing code review for a submission
   */
  async getCodeReviewBySubmission(submissionId: string): Promise<any> {
    try {
      // Use limit(1).maybeSingle() to avoid throwing when multiple rows or none exist
      const { data, error } = await supabaseAdmin
        .from('ai_code_reviews')
        .select('*')
        .eq('submission_id', submissionId)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (err: any) {
      // If the error is "not found" return null, otherwise log and rethrow for visibility
      if (err?.code === 'PGRST116' || /not found/i.test(err?.message || '')) {
        return null;
      }
      console.error(`Error fetching code review for submission ${submissionId}:`, err.message || err);
      throw err;
    }
  }

  // --- Private helper methods ---

  private buildCodeReviewPrompt(
    code: string,
    language: string,
    problemTitle?: string
  ): string {
    const contextInfo = problemTitle ? `for problem: "${problemTitle}"` : '';
    
    return `You are an expert code reviewer. Analyze the following ${language} code ${contextInfo} and provide a structured review.

CODE:
\`\`\`${language}
${code}
\`\`\`

Provide your response in valid JSON format with the following structure:
{
  "summary": "Brief overall assessment of the code (2-3 sentences)",
  "issues": ["List of specific problems, bugs, or anti-patterns found"],
  "suggestions": ["List of actionable improvements and best practices"]
}

Focus on:
- Code correctness and potential bugs
- Code quality and readability  
- Performance issues
- Security vulnerabilities
- Best practices for ${language}

Return ONLY the JSON object, no additional text.`;
  }

  private buildNotebookPrompt(question: string, context?: string): string {
    const contextSection = context 
      ? `\n\nContext:\n${context}\n` 
      : '';

    return `You are a helpful programming tutor. Answer the following question clearly and concisely.${contextSection}

Question: ${question}

Provide a clear, educational answer. If providing code examples, use markdown code blocks. Keep the explanation beginner-friendly but technically accurate.`;
  }

  /**
   * Generate a concise summary from notebook content
   */
  async generateSummary(content: string): Promise<string> {
    // Check configuration first
    if (!this.isConfigured || !this.model) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      console.error('❌ AI Service not configured:', {
        hasApiKey: !!apiKey,
        isConfigured: this.isConfigured,
        hasModel: !!this.model,
        envVars: {
          GEMINI_API_KEY: apiKey ? '***' + apiKey.slice(-4) : 'NOT SET',
          AI_API_KEY: process.env.AI_API_KEY ? 'SET' : 'NOT SET'
        }
      });
      throw new Error('AI Service not configured - check GEMINI_API_KEY environment variable');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const prompt = this.buildSummaryPrompt(content);

    try {
      console.log('🤖 Calling Gemini API for summary generation...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Check if response is valid
      if (!response) {
        throw new Error('Empty response from Gemini API');
      }
      
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text response from Gemini API');
      }
      
      console.log('✅ Summary generated successfully, length:', text.length);
      return text.trim();
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ Gemini API error in generateSummary:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        errorDetails: error.cause || error.details || 'No additional details',
        promptLength: prompt.length
      });

      // Provide more specific error messages
      if (error.message?.includes('API_KEY')) {
        throw new Error('Invalid or missing Gemini API key. Please check GEMINI_API_KEY environment variable.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error('API quota exceeded or rate limit reached. Please try again later.');
      }
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        throw new Error('Network error or timeout while calling AI service. Please try again.');
      }
      
      throw new Error(`AI summary generation failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate a mindmap JSON structure from notebook content
   */
  async generateMindmap(content: string): Promise<any> {
    // Check configuration first
    if (!this.isConfigured || !this.model) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      console.error('❌ AI Service not configured:', {
        hasApiKey: !!apiKey,
        isConfigured: this.isConfigured,
        hasModel: !!this.model,
        envVars: {
          GEMINI_API_KEY: apiKey ? '***' + apiKey.slice(-4) : 'NOT SET',
          AI_API_KEY: process.env.AI_API_KEY ? 'SET' : 'NOT SET'
        }
      });
      throw new Error('AI Service not configured - check GEMINI_API_KEY environment variable');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    const prompt = this.buildMindmapPrompt(content);

    try {
      console.log('🤖 Calling Gemini API for mindmap generation...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Check if response is valid
      if (!response) {
        throw new Error('Empty response from Gemini API');
      }
      
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text response from Gemini API');
      }
      
      console.log('✅ Mindmap response received, parsing JSON...');
      const parsed = this.parseMindmapResponse(text);
      console.log('✅ Mindmap parsed successfully');
      return parsed;
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ Gemini API error in generateMindmap:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        errorDetails: error.cause || error.details || 'No additional details',
        promptLength: prompt.length,
        isParseError: error.message?.includes('parse') || error.message?.includes('JSON')
      });

      // Provide more specific error messages
      if (error.message?.includes('API_KEY')) {
        throw new Error('Invalid or missing Gemini API key. Please check GEMINI_API_KEY environment variable.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error('API quota exceeded or rate limit reached. Please try again later.');
      }
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        throw new Error('Network error or timeout while calling AI service. Please try again.');
      }
      if (error.message?.includes('parse') || error.message?.includes('JSON')) {
        throw new Error(`Failed to parse mindmap JSON: ${error.message}. The AI response may not be in the expected format.`);
      }
      
      throw new Error(`AI mindmap generation failed: ${error.message || 'Unknown error'}`);
    }
  }

  private parseCodeReviewResponse(responseText: string): CodeReviewResult {
    try {
      // Remove markdown code blocks if present
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(cleanText);
      
      // Calculate quality rating based on issues count
      const issuesCount = parsed.issues?.length || 0;
      let qualityRating = 5;
      if (issuesCount > 0) qualityRating = 4;
      if (issuesCount > 2) qualityRating = 3;
      if (issuesCount > 5) qualityRating = 2;
      if (issuesCount > 10) qualityRating = 1;

      return {
        summary: parsed.summary || 'No summary provided',
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        qualityRating,
      };
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', responseText);
      // Fallback: return raw text as summary
      return {
        summary: responseText,
        issues: [],
        suggestions: [],
        qualityRating: 3,
      };
    }
  }

  private buildSummaryPrompt(content: string): string {
    return `You are an expert note-taker and educator. Summarize the following notebook content into clear, concise bullet points with a main takeaway.

Content:
${content}

Instructions:
- Provide a brief main takeaway (1-2 sentences) at the beginning
- Follow with key bullet points (5-10 points maximum)
- Use clear, concise language
- Focus on the most important concepts and information
- Format your response in markdown

Return ONLY the markdown summary, no additional text or explanation.`;
  }

  private buildMindmapPrompt(content: string): string {
    return `You are an expert at creating knowledge structures. Analyze the following notebook content and create a hierarchical mindmap structure.

Content:
${content}

Create a mindmap that represents the main topics, subtopics, and relationships in the content.

CRITICAL: You MUST return ONLY valid JSON in the following exact structure:
{
  "root": "Main Topic Name",
  "children": [
    {
      "label": "Subtopic 1",
      "children": [
        {
          "label": "Detail 1.1",
          "children": []
        },
        {
          "label": "Detail 1.2",
          "children": []
        }
      ]
    },
    {
      "label": "Subtopic 2",
      "children": [
        {
          "label": "Detail 2.1",
          "children": []
        }
      ]
    }
  ]
}

Rules:
- The "root" should be the main topic/concept from the content
- Each node has a "label" (string) and "children" (array of nodes)
- Create 3-7 main subtopics (children of root)
- Each subtopic can have 0-5 child nodes for details
- Keep labels concise (3-8 words)
- Do NOT include any text before or after the JSON
- Do NOT wrap the JSON in markdown code blocks
- Return ONLY the JSON object, nothing else`;
  }

  private parseMindmapResponse(responseText: string): any {
    try {
      console.log('🔍 Parsing mindmap response, length:', responseText.length);
      
      // Remove markdown code blocks if present
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        console.log('📝 Removed markdown code block wrapper');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
        console.log('📝 Removed code block wrapper');
      }

      // Try to extract JSON if there's text before/after
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
        console.log('📝 Extracted JSON from surrounding text');
      }

      console.log('🔍 Attempting to parse JSON, preview:', cleanText.substring(0, 200));
      const parsed = JSON.parse(cleanText);
      
      // Validate structure
      if (!parsed.root || typeof parsed.root !== 'string') {
        console.error('❌ Invalid mindmap structure - missing root:', parsed);
        throw new Error('Invalid mindmap structure: missing or invalid root field');
      }
      
      if (!Array.isArray(parsed.children)) {
        console.warn('⚠️  Mindmap children is not an array, initializing empty array');
        parsed.children = [];
      }

      // Validate children structure recursively
      const validateNode = (node: any, path: string = 'root'): boolean => {
        if (!node || typeof node !== 'object') {
          console.error(`❌ Invalid node at ${path}: not an object`, node);
          return false;
        }
        if (!node.label || typeof node.label !== 'string') {
          console.error(`❌ Invalid node at ${path}: missing or invalid label`, node);
          return false;
        }
        if (!Array.isArray(node.children)) {
          console.warn(`⚠️  Node children at ${path} is not an array, initializing empty array`);
          node.children = [];
        }
        return node.children.every((child: any, index: number) => 
          validateNode(child, `${path}.children[${index}]`)
        );
      };

      parsed.children.forEach((child: any, index: number) => {
        if (!validateNode(child, `children[${index}]`)) {
          throw new Error(`Invalid mindmap structure: invalid child node at index ${index}`);
        }
      });

      console.log('✅ Mindmap structure validated successfully');
      return parsed;
    } catch (error: any) {
      console.error('❌ Failed to parse mindmap response as JSON:', {
        error: error.message,
        responsePreview: responseText.substring(0, 500),
        responseLength: responseText.length
      });
      throw new Error(`Failed to parse mindmap JSON: ${error.message}. Raw response preview: ${responseText.substring(0, 200)}...`);
    }
  }
}

export default new AIService();

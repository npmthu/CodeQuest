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
   * Review submitted code using Gemini AI
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseCodeReviewResponse(text);
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`AI code review failed: ${error.message}`);
    }
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
}

export default new AIService();

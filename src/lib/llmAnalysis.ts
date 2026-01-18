/**
 * LLM-Powered AI Analysis Module
 * Integrates OpenAI, Google Gemini, or Claude for intelligent answer validation
 * and adaptive question analysis based on SWAR hard-coded questions
 */

import { Question } from './gradeQuestions';

// ============================================
// LLM Configuration
// ============================================

export type LLMProvider = 'openai' | 'gemini' | 'claude' | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
}

// ============================================
// Analysis Response Types
// ============================================

export interface LLMValidationResult {
  isCorrect: boolean;
  confidence: number;
  reason: string;
  semanticScore: number; // 0-100: semantic understanding
  conceptualMastery: 'mastered' | 'developing' | 'emerging' | 'needs_help';
  suggestedFeedback: string;
  commonMisconception?: string;
  learningGap?: string;
  nextStepRecommendation?: string;
}

export interface AdaptivityRecommendation {
  adjustDifficulty: 'increase' | 'maintain' | 'decrease';
  confidenceScore: number;
  reasoning: string;
  suggestedNextQuestionType?: string;
  estimatedGradeLevel?: number;
}

export interface DetailedAnalysis {
  questionId: number;
  questionText: string;
  studentResponse: string;
  validation: LLMValidationResult;
  adaptivity: AdaptivityRecommendation;
  pedagogicalInsights: {
    strengthsIdentified: string[];
    areasForImprovement: string[];
    recommendedInterventions: string[];
    estimatedCompetencyLevel: number; // 0-100
  };
  timeAnalysis?: {
    responseTime: number;
    isRushed: boolean;
    isOverthinking: boolean;
  };
}

export interface SessionAnalysis {
  sessionId: string;
  studentId: string;
  sessionType: 'dyslexia' | 'dyscalculia';
  totalQuestions: number;
  correctAnswers: number;
  overallScore: number;
  detailedAnalyses: DetailedAnalysis[];
  diagnosticSummary: {
    strongAreas: string[];
    weakAreas: string[];
    overallCompetency: string;
    riskIndicators: string[];
    recommendedIntervention: string;
    followUpSuggestions: string[];
  };
  generatedAt: Date;
}

// ============================================
// LLM Analysis Service
// ============================================

class LLMAnalysisService {
  private config: LLMConfig;
  private systemPrompt: string;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.3,
      maxTokens: 1000,
      ...config,
    };

    this.systemPrompt = this.buildSystemPrompt();
  }

  private buildSystemPrompt(): string {
    return `You are an expert educational AI assistant specialized in assessing speech and language learning disabilities (dyslexia and dyscalculia). Your role is to:

1. Validate student responses with semantic understanding, not just string matching
2. Identify conceptual understanding levels
3. Detect common misconceptions and learning gaps
4. Provide pedagogically sound feedback
5. Recommend adaptive difficulty adjustments
6. Identify students at risk who may need intervention

Context:
- SWAR is a speech-first screening tool for learning disabilities
- Focus on phonological awareness, decoding, fluency, and number sense
- Responses can have minor errors but still demonstrate understanding
- Your feedback should be encouraging yet honest

Always respond in valid JSON format.`;
  }

  /**
   * Validate answer using LLM with semantic understanding
   */
  async validateAnswerWithLLM(
    studentResponse: string,
    expectedAnswer: string,
    question: Question,
    sessionType: 'dyslexia' | 'dyscalculia'
  ): Promise<LLMValidationResult> {
    try {
      const prompt = this.buildValidationPrompt(
        studentResponse,
        expectedAnswer,
        question,
        sessionType
      );

      const response = await this.callLLM(prompt);
      return JSON.parse(response) as LLMValidationResult;
    } catch (error) {
      console.error('LLM validation error:', error);
      // Fallback to basic validation
      return this.fallbackValidation(studentResponse, expectedAnswer, question.type);
    }
  }

  /**
   * Get adaptivity recommendation based on performance
   */
  async getAdaptivityRecommendation(
    studentResponse: string,
    expectedAnswer: string,
    question: Question,
    performanceHistory: LLMValidationResult[]
  ): Promise<AdaptivityRecommendation> {
    try {
      const prompt = this.buildAdaptivityPrompt(
        studentResponse,
        expectedAnswer,
        question,
        performanceHistory
      );

      const response = await this.callLLM(prompt);
      return JSON.parse(response) as AdaptivityRecommendation;
    } catch (error) {
      console.error('Adaptivity recommendation error:', error);
      return this.fallbackAdaptivity();
    }
  }

  /**
   * Analyze complete session and generate detailed report
   */
  async analyzeSession(
    sessionId: string,
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia',
    responses: Array<{
      question: Question;
      studentResponse: string;
      validation: LLMValidationResult;
      responseTime: number;
    }>
  ): Promise<SessionAnalysis> {
    try {
      const prompt = this.buildSessionAnalysisPrompt(
        sessionType,
        responses
      );

      const response = await this.callLLM(prompt);
      const analysis = JSON.parse(response);

      return {
        sessionId,
        studentId,
        sessionType,
        totalQuestions: responses.length,
        correctAnswers: responses.filter(r => r.validation.isCorrect).length,
        overallScore: (responses.filter(r => r.validation.isCorrect).length / responses.length) * 100,
        detailedAnalyses: responses.map((r, idx) => ({
          questionId: r.question.id,
          questionText: r.question.text,
          studentResponse: r.studentResponse,
          validation: r.validation,
          adaptivity: { adjustDifficulty: 'maintain', confidenceScore: 50, reasoning: '' },
          pedagogicalInsights: this.extractPedagogicalInsights(r.validation),
          timeAnalysis: {
            responseTime: r.responseTime,
            isRushed: r.responseTime < 3000,
            isOverthinking: r.responseTime > 30000,
          },
        })),
        diagnosticSummary: analysis.diagnosticSummary || this.fallbackDiagnosticSummary(),
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Session analysis error:', error);
      return this.fallbackSessionAnalysis(sessionId, studentId, sessionType, responses);
    }
  }

  /**
   * Generate pedagogical insights from validation
   */
  private extractPedagogicalInsights(validation: LLMValidationResult) {
    return {
      strengthsIdentified: [
        validation.conceptualMastery === 'mastered' ? 'Strong conceptual understanding' : '',
        validation.confidence >= 80 ? 'High accuracy' : '',
      ].filter(Boolean),
      areasForImprovement: [
        validation.learningGap || 'None identified',
      ],
      recommendedInterventions: [
        validation.nextStepRecommendation || 'Continue with similar difficulty level',
      ],
      estimatedCompetencyLevel: validation.semanticScore,
    };
  }

  // ============================================
  // Prompt Building Methods
  // ============================================

  private buildValidationPrompt(
    studentResponse: string,
    expectedAnswer: string,
    question: Question,
    sessionType: string
  ): string {
    return `Validate this student response for a ${sessionType} screening question.

Question Type: ${question.type}
Question: "${question.text}"
Expected Answer: "${expectedAnswer}"
Student Response: "${studentResponse}"

Provide a JSON response with:
{
  "isCorrect": boolean,
  "confidence": number (0-100),
  "reason": string,
  "semanticScore": number (0-100, how well they understood the concept),
  "conceptualMastery": "mastered" | "developing" | "emerging" | "needs_help",
  "suggestedFeedback": string,
  "commonMisconception": string or null,
  "learningGap": string or null,
  "nextStepRecommendation": string or null
}`;
  }

  private buildAdaptivityPrompt(
    studentResponse: string,
    expectedAnswer: string,
    question: Question,
    performanceHistory: LLMValidationResult[]
  ): string {
    const avgConfidence = performanceHistory.reduce((sum, p) => sum + p.confidence, 0) / performanceHistory.length;

    return `Based on this student's performance, recommend difficulty adjustment.

Current Question: "${question.text}"
Current Response: "${studentResponse}"
Current Confidence: ${avgConfidence.toFixed(0)}%
Recent Performance: ${performanceHistory.slice(-5).map(p => p.confidence).join(', ')}%

Provide JSON:
{
  "adjustDifficulty": "increase" | "maintain" | "decrease",
  "confidenceScore": number,
  "reasoning": string,
  "suggestedNextQuestionType": string or null,
  "estimatedGradeLevel": number or null
}`;
  }

  private buildSessionAnalysisPrompt(
    sessionType: string,
    responses: Array<any>
  ): string {
    const responsesSummary = responses.map(r => ({
      question: r.question.text,
      answer: r.studentResponse,
      correct: r.validation.isCorrect,
      confidence: r.validation.confidence,
    }));

    return `Analyze this ${sessionType} screening session and provide diagnostic insights.

Session Responses: ${JSON.stringify(responsesSummary, null, 2)}

Provide comprehensive JSON analysis with:
{
  "diagnosticSummary": {
    "strongAreas": string[],
    "weakAreas": string[],
    "overallCompetency": string,
    "riskIndicators": string[],
    "recommendedIntervention": string,
    "followUpSuggestions": string[]
  }
}`;
  }

  // ============================================
  // LLM API Call Method
  // ============================================

  private async callLLM(prompt: string): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(prompt);
      case 'gemini':
        return this.callGemini(prompt);
      case 'claude':
        return this.callClaude(prompt);
      case 'local':
        return this.callLocal(prompt);
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message}`);
    }

    return data.choices[0].message.content;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: this.systemPrompt },
              { text: prompt },
            ],
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message}`);
    }

    return data.candidates[0].content.parts[0].text;
  }

  private async callClaude(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens || 1000,
        system: this.systemPrompt,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Claude API error: ${data.error?.message}`);
    }

    return data.content[0].text;
  }

  private async callLocal(prompt: string): Promise<string> {
    // Ollama API returns streaming JSON - we need to handle it properly
    try {
      const response = await fetch(this.config.baseURL || 'http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'mistral',
          prompt: `Quick check: Is "${prompt}" correct? Answer: {"isCorrect": true/false}`,
          temperature: 0.1,
          stream: false,
          num_predict: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract response from Ollama format
      if (data.response) {
        // Try to parse JSON from response
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return jsonMatch[0];
          }
        } catch (e) {
          // If JSON parsing fails, return response as-is
          return data.response;
        }
      }
      
      return data.response || '';
    } catch (error) {
      console.error('Ollama connection error:', error);
      throw error;
    }
  }

  // ============================================
  // Fallback Methods (when LLM unavailable)
  // ============================================

  private fallbackValidation(
    studentResponse: string,
    expectedAnswer: string,
    questionType: string
  ): LLMValidationResult {
    const isExactMatch = studentResponse.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
    const similarity = this.calculateSimilarity(studentResponse, expectedAnswer);

    return {
      isCorrect: isExactMatch || similarity >= 75,
      confidence: similarity,
      reason: isExactMatch ? 'Exact match' : `${similarity.toFixed(0)}% similarity`,
      semanticScore: similarity,
      conceptualMastery: similarity >= 80 ? 'mastered' : similarity >= 60 ? 'developing' : 'emerging',
      suggestedFeedback: 'Good attempt. Review the expected answer.',
    };
  }

  private fallbackAdaptivity(): AdaptivityRecommendation {
    return {
      adjustDifficulty: 'maintain',
      confidenceScore: 50,
      reasoning: 'Maintain current difficulty level',
    };
  }

  private fallbackDiagnosticSummary() {
    return {
      strongAreas: ['Attempting all questions'],
      weakAreas: ['Unable to perform detailed analysis'],
      overallCompetency: 'Assessment incomplete',
      riskIndicators: [],
      recommendedIntervention: 'Continue with screening',
      followUpSuggestions: ['Review performance in next session'],
    };
  }

  private fallbackSessionAnalysis(
    sessionId: string,
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia',
    responses: Array<any>
  ): SessionAnalysis {
    const correctCount = responses.filter(r => r.validation.isCorrect).length;
    return {
      sessionId,
      studentId,
      sessionType,
      totalQuestions: responses.length,
      correctAnswers: correctCount,
      overallScore: (correctCount / responses.length) * 100,
      detailedAnalyses: [],
      diagnosticSummary: this.fallbackDiagnosticSummary(),
      generatedAt: new Date(),
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 100;

    const distance = this.levenshteinDistance(longer, shorter);
    return ((longer.length - distance) / longer.length) * 100;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[str2.length][str1.length];
  }
}

// ============================================
// Singleton Instance & Export
// ============================================

let llmService: LLMAnalysisService | null = null;

export function initializeLLMService(config: LLMConfig): LLMAnalysisService {
  llmService = new LLMAnalysisService(config);
  return llmService;
}

export function getLLMService(): LLMAnalysisService {
  if (!llmService) {
    // Default to fallback mode
    llmService = new LLMAnalysisService({ provider: 'local' });
  }
  return llmService;
}

export default LLMAnalysisService;

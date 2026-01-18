/**
 * Integration Guide: LLM/ML AI Analysis with SWAR Questions
 * 
 * This file demonstrates how to integrate the AI analysis modules
 * with the existing Session.tsx and DailyPractice.tsx components
 */

import React from 'react';
import { getLLMService } from '@/lib/llmAnalysis';
import { getAdaptiveMLService } from '@/lib/adaptiveML';
import { getAIConfigManager } from '@/lib/aiConfig';
import { validateAnswer } from '@/lib/answerValidation';
import { Question } from '@/lib/gradeQuestions';
import { SessionAnalysis } from '@/lib/llmAnalysis';
import { StudentProfile } from '@/lib/adaptiveML';

/**
 * Enhanced answer validation using LLM + ML
 * Replace basic validation in Session.tsx submitResponse function
 */
export async function validateResponseWithAI(
  studentResponse: string,
  question: Question,
  sessionType: 'dyslexia' | 'dyscalculia',
  studentId: string,
  responseTime: number
): Promise<{
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  semanticScore?: number;
  nextDifficulty?: 'easy' | 'medium' | 'hard';
}> {
  try {
    // Initialize config
    const configManager = getAIConfigManager();
    const llmService = getLLMService();
    const adaptiveService = getAdaptiveMLService();

    // Validate response using LLM for semantic understanding
    const llmValidation = await llmService.validateAnswerWithLLM(
      studentResponse,
      question.expectedAnswer,
      question,
      sessionType
    );

    // Record performance for adaptive learning
    const profile = adaptiveService.initializeStudentProfile(
      studentId,
      sessionType,
      3 // base grade
    );

    adaptiveService.recordPerformance(studentId, sessionType, {
      questionId: question.id,
      timestamp: Date.now(),
      responseTime,
      isCorrect: llmValidation.isCorrect,
      confidence: llmValidation.confidence,
      questionType: question.type,
      difficultyLevel: 2,
    });

    // Get next difficulty recommendation
    const nextPrediction = adaptiveService.predictNextQuestion(
      studentId,
      sessionType,
      question
    );

    return {
      isCorrect: llmValidation.isCorrect,
      confidence: llmValidation.confidence,
      feedback: llmValidation.suggestedFeedback,
      semanticScore: llmValidation.semanticScore,
      nextDifficulty: nextPrediction.recommendedDifficulty,
    };
  } catch (error) {
    console.error('AI validation error:', error);
    // Fallback to basic validation
    return {
      isCorrect: studentResponse.toLowerCase().trim() === 
                 question.expectedAnswer.toLowerCase().trim(),
      confidence: 50,
      feedback: 'Response recorded',
    };
  }
}

/**
 * Generate Comprehensive Session Analysis
 */
export async function generateSessionAnalysis(
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia',
  responses: any[]
) {
  try {
    const llmService = getLLMService();
    const adaptiveService = getAdaptiveMLService();

    // Get comprehensive analysis from LLM
    const analysisReport = await llmService.analyzeSession(
      `session_${studentId}_${Date.now()}`,
      studentId,
      sessionType,
      responses.map((r) => ({
        question: r.questionId,
        studentResponse: r.response,
        validation: {
          isCorrect: r.isCorrect,
          confidence: r.confidenceScore,
          reason: r.feedback || '',
          semanticScore: r.semanticScore || 50,
          conceptualMastery: 'developing',
          suggestedFeedback: '',
        },
        responseTime: r.responseTimeMs,
      }))
    );

    // Get student profile analysis
    const profileAnalysis = adaptiveService.getStudentAnalysis(
      studentId,
      sessionType
    );

    return {
      sessionAnalysis: analysisReport,
      studentProfile: profileAnalysis,
      timestamp: new Date(),
      recommendations: {
        nextSteps: analysisReport.diagnosticSummary.followUpSuggestions,
        interventionNeeded: profileAnalysis?.recommendations.interventionNeeded,
        focusAreas: profileAnalysis?.recommendations.focusAreas,
      },
    };
  } catch (error) {
    console.error('Session analysis error:', error);
    return null;
  }
}

/**
 * Adaptive Question Selection
 */
export function getAdaptiveQuestion(
  questions: Question[],
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia',
  currentIndex: number
): Question {
  try {
    const adaptiveService = getAdaptiveMLService();

    // Get prediction for next question
    const prediction = adaptiveService.predictNextQuestion(
      studentId,
      sessionType,
      questions[currentIndex]
    );

    // Select question from pool based on difficulty
    const difficultyFilter = (q: Question) => {
      if (prediction.recommendedDifficulty === 'easy') {
        return q.id <= 3;
      } else if (prediction.recommendedDifficulty === 'hard') {
        return q.id >= 6;
      }
      return true;
    };

    const appropriateQuestions = questions.filter(difficultyFilter);
    return appropriateQuestions[currentIndex] || questions[currentIndex];
  } catch (error) {
    console.error('Error in adaptive question selection:', error);
    return questions[currentIndex];
  }
}

/**
 * React Hook for AI Analysis
 */
export function useAIAnalysis(
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia'
) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState(null);
  const [error, setError] = React.useState<string | null>(null);

  const validateResponse = React.useCallback(
    async (
      studentResponse: string,
      question: Question,
      responseTime: number
    ) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await validateResponseWithAI(
          studentResponse,
          question,
          sessionType,
          studentId,
          responseTime
        );
        setAnalysis(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        setError(message);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [studentId, sessionType]
  );

  const getStudentProfile = React.useCallback(() => {
    const adaptiveService = getAdaptiveMLService();
    return adaptiveService.getStudentAnalysis(studentId, sessionType);
  }, [studentId, sessionType]);

  return {
    validateResponse,
    getStudentProfile,
    isAnalyzing,
    analysis,
    error,
  };
}

/**
 * Type Extensions for Session Data
 */
export interface EnhancedResponseData {
  questionId: number;
  questionText: string;
  expectedAnswer: string;
  response: string;
  isCorrect: boolean;
  responseTimeMs: number;
  semanticScore?: number;
  confidenceScore?: number;
  conceptualMastery?: 'mastered' | 'developing' | 'emerging' | 'needs_help';
  pedagogicalFeedback?: string;
  suggestedNextDifficulty?: 'easy' | 'medium' | 'hard';
  learningGapIdentified?: string;
}

export interface EnhancedSessionData {
  studentId: string;
  sessionType: 'dyslexia' | 'dyscalculia';
  responses: EnhancedResponseData[];
  completedAt: Date;
  aiAnalysisReport?: SessionAnalysis;
  studentProfile?: StudentProfile;
  diagnosticSummary?: {
    overallCompetency: string;
    riskIndicators: string[];
    recommendedIntervention: string;
    followUpSuggestions: string[];
  };
}

/**
 * Environment Setup Example
 */
export const ENV_SETUP_EXAMPLE = `
# .env.local - Add these to enable AI analysis

# Option 1: Use OpenAI (requires paid API)
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-your-openai-key-here
VITE_LLM_MODEL=gpt-3.5-turbo

# Option 2: Use Google Gemini (free tier available)
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your-gemini-api-key-here
VITE_LLM_MODEL=gemini-pro

# Option 3: Use Local Ollama (FREE, private, runs locally)
VITE_LLM_PROVIDER=local
VITE_LOCAL_MODEL_URL=http://localhost:11434/api
VITE_LLM_MODEL=mistral

# Feature flags
VITE_ENABLE_LLM_VALIDATION=true
VITE_ENABLE_ADAPTIVE_DIFFICULTY=true
VITE_ENABLE_DETAILED_ANALYSIS=true

# For local Ollama setup, run:
# 1. Download Ollama: https://ollama.ai
# 2. Run: ollama pull mistral
# 3. Run: ollama serve
# Then restart your dev server
`;

/**
 * Export all integration functions
 */
export default {
  validateResponseWithAI,
  generateSessionAnalysis,
  getAdaptiveQuestion,
  useAIAnalysis,
  ENV_SETUP_EXAMPLE,
};

/**
 * Type Extensions for AI-Enhanced Session Data
 * 
 * Add these type definitions to your existing Session.tsx
 * or create a new types file for consistency
 */

// ============================================
// Enhanced Response Data Type
// ============================================

/**
 * Extended response data with AI analysis fields
 * Replace the original ResponseData interface in Session.tsx
 */
export interface ResponseData {
  // Original fields (keep these)
  questionId: number;
  questionText: string;
  expectedAnswer: string;
  response: string;
  isCorrect: boolean;
  responseTimeMs: number;

  // New AI fields (add these)
  // Confidence and semantic understanding
  confidenceScore?: number; // 0-100: How confident the model is
  semanticScore?: number;   // 0-100: Level of semantic understanding
  
  // Conceptual mastery assessment
  conceptualMastery?: 'mastered' | 'developing' | 'emerging' | 'needs_help';
  
  // Feedback and recommendations
  aiGeneratedFeedback?: string; // Detailed pedagogical feedback from LLM
  commonMisconception?: string; // If incorrect, what misconception was detected
  learningGapIdentified?: string; // Specific learning gap if found
  suggestedNextDifficulty?: 'easy' | 'medium' | 'hard';
  
  // Additional analysis
  responseQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  riskIndicators?: string[]; // Flags for intervention
  
  // Metadata
  analysisTimestamp?: number;
  analysisModel?: string; // Which LLM model was used
}

// ============================================
// Enhanced Session Data Type
// ============================================

export interface EnhancedSessionData {
  // Session metadata
  studentId: string;
  sessionId: string;
  sessionType: 'dyslexia' | 'dyscalculia';
  grade: number;
  startedAt: Date;
  completedAt?: Date;
  duration: number; // milliseconds
  
  // Responses with AI analysis
  responses: ResponseData[]; // Now using enhanced ResponseData
  
  // Summary statistics
  totalQuestions: number;
  correctAnswers: number;
  overallScore: number; // 0-100
  averageConfidence: number;
  averageResponseTime: number;
  
  // AI Analysis Report
  aiAnalysis?: {
    // Diagnostic information
    studentProfile: {
      estimatedCompetencyLevel: number; // 0-100
      learningRate: string; // 'fast' | 'moderate' | 'slow'
      consistencyScore: number; // 0-100
      fatigueDetected: boolean;
    };
    
    // Performance analysis
    performanceAnalysis: {
      improvementTrend: 'improving' | 'stable' | 'declining';
      strongAreas: string[];
      weakAreas: string[];
      consistentErrors: string[];
      areaOfFocus: string;
    };
    
    // Diagnostic summary
    diagnosticSummary: {
      overallCompetency: string;
      assessmentConfidence: number; // 0-100
      riskIndicators: string[];
      urgencyOfIntervention: 'immediate' | 'high' | 'moderate' | 'low';
      interventionType?: string;
    };
    
    // Recommendations
    recommendations: {
      nextSteps: string[];
      practiceAreas: string[];
      supportSuggestions: string[];
      followUpTiming: string; // e.g., "1 week", "2 weeks"
    };
    
    // Metadata
    analysisGeneratedAt: Date;
    analysisModel: string;
    analysisVersion: string;
  };
  
  // For database persistence
  storedInDatabase?: boolean;
  databaseId?: string;
}

// ============================================
// Student Performance Profile
// ============================================

export interface StudentPerformanceProfile {
  studentId: string;
  sessionType: 'dyslexia' | 'dyscalculia';
  
  // Overall metrics
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  
  // Trend information
  recentSessions: ResponseData[];
  performanceTrend: 'improving' | 'stable' | 'declining';
  improvementRate: number; // percentage points per week
  
  // Competency tracking
  competencyLevel: number; // 0-100
  estimatedGradeLevel: number; // 1-12
  
  // Areas of strength and need
  masterAreas: string[];
  developingAreas: string[];
  needsHelpAreas: string[];
  
  // Risk assessment
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  
  // Recommendations
  recommendedIntervention: string;
  interventionUrgency: 'low' | 'medium' | 'high' | 'urgent';
  suggestedSupportStrategies: string[];
  
  // Metadata
  lastAssessmentDate: Date;
  lastUpdated: Date;
  assessmentCount: number;
}

// ============================================
// Batch Analysis Request/Response
// ============================================

export interface BatchAnalysisRequest {
  studentId: string;
  sessionType: 'dyslexia' | 'dyscalculia';
  responses: ResponseData[];
  priorityLevel?: 'low' | 'normal' | 'high';
}

export interface BatchAnalysisResponse {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysisData?: EnhancedSessionData;
  error?: string;
  completedAt?: Date;
}

// ============================================
// Real-Time Feedback
// ============================================

export interface RealtimeFeedback {
  questionId: number;
  isCorrect: boolean;
  confidence: number;
  immediateFeeback: string; // Shown to student right after response
  
  // For UI display
  displayColor: 'green' | 'yellow' | 'red'; // Confidence-based
  showsEncouragement: boolean;
  showsCorrectionIfNeeded: boolean;
  
  // For tracking
  timestamp: number;
  feedbackGeneratedBy: 'llm' | 'fallback' | 'cached';
}

// ============================================
// Usage Example in Session.tsx
// ============================================

/*
// In Session.tsx, update the ResponseData initialization:

import { ResponseData, EnhancedSessionData, RealtimeFeedback } from '@/types/aiSession';

// When creating a response:
const newResponse: ResponseData = {
  // Original fields
  questionId: currentQ.id,
  questionText: currentQ.text,
  expectedAnswer: currentQ.expectedAnswer,
  response: transcript,
  isCorrect: validation.isCorrect,
  responseTimeMs: responseTime,
  
  // New AI fields
  confidenceScore: validation.confidence,
  semanticScore: validation.semanticScore,
  conceptualMastery: validation.conceptualMastery,
  aiGeneratedFeedback: validation.suggestedFeedback,
  suggestedNextDifficulty: nextPrediction.recommendedDifficulty,
  analysisTimestamp: Date.now(),
  analysisModel: 'gpt-3.5-turbo',
};

// When completing session:
const enhancedSession: EnhancedSessionData = {
  studentId,
  sessionId: sessionUUID,
  sessionType,
  grade: gradeParam,
  startedAt: sessionStartTime,
  completedAt: new Date(),
  duration: Date.now() - sessionStartTime.getTime(),
  responses: allResponses,
  totalQuestions: questions.length,
  correctAnswers: allResponses.filter(r => r.isCorrect).length,
  overallScore: (allResponses.filter(r => r.isCorrect).length / questions.length) * 100,
  aiAnalysis: await generateSessionAnalysis(allResponses),
};

// Store in database
await supabase.from('sessions').insert(enhancedSession);
*/

// ============================================
// Database Schema Extensions
// ============================================

/*
-- Add these columns to existing sessions table

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS (
  -- AI Analysis
  semantic_score NUMERIC,
  conceptual_mastery VARCHAR(20),
  confidence_score NUMERIC,
  ai_feedback TEXT,
  
  -- Performance Analysis
  student_profile JSONB,
  performance_analysis JSONB,
  diagnostic_summary JSONB,
  recommendations JSONB,
  
  -- Metadata
  analysis_model VARCHAR(100),
  analysis_timestamp TIMESTAMPTZ,
  analysis_version VARCHAR(20)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_analysis_date 
ON sessions(analysis_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_competency 
ON sessions((student_profile->>'competency'));
*/

// ============================================
// Integration Checklist
// ============================================

/*
To fully integrate AI analysis types:

1. ✅ Copy these type definitions to a new file:
   src/types/aiSession.ts

2. ✅ Update Session.tsx imports:
   import { ResponseData, EnhancedSessionData } from '@/types/aiSession';

3. ✅ Replace ResponseData interface in Session.tsx with the extended version

4. ✅ Update database schema (see schema extension above)

5. ✅ Update database inserts to include new fields

6. ✅ Update database queries to fetch new fields

7. ✅ Update teacher dashboard to display new fields

8. ✅ Update parent dashboard with AI insights

9. ✅ Add migration script to existing databases

10. ✅ Test with sample sessions
*/

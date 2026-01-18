/**
 * Machine Learning-based Adaptive Difficulty Module
 * Dynamically adjusts question difficulty based on student performance
 * Using performance history and pattern recognition
 */

import { Question } from './gradeQuestions';

// ============================================
// ML Models and Types
// ============================================

export interface PerformanceMetrics {
  questionId: number;
  timestamp: number;
  responseTime: number;
  isCorrect: boolean;
  confidence: number;
  questionType: string;
  difficultyLevel: number;
}

export interface StudentProfile {
  studentId: string;
  sessionType: 'dyslexia' | 'dyscalculia';
  currentGrade: number;
  performanceHistory: PerformanceMetrics[];
  estimatedCompetencyLevel: number; // 0-100
  learningRate: number; // How quickly they improve
  strugglingAreas: string[];
  strengthAreas: string[];
  adaptiveGradeAdjustment: number; // -2 to +2 from base grade
}

export interface MLPrediction {
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  successProbability: number; // 0-100
  estimatedTimeNeeded: number; // ms
  recommendedGradeLevel: number;
  confidence: number;
}

export interface LearningPattern {
  improvementTrend: 'improving' | 'stable' | 'declining';
  averageAccuracy: number;
  averageResponseTime: number;
  consistencyScore: number; // 0-100
  fatigueDetected: boolean;
  sessionDuration: number;
}

// ============================================
// Difficulty Level Mapping
// ============================================

const difficultyMapping = {
  phoneme: { easy: 1, medium: 2, hard: 3 },
  word: { easy: 1, medium: 2, hard: 3 },
  sentence: { easy: 2, medium: 3, hard: 4 },
  number: { easy: 1, medium: 2, hard: 3 },
  calculation: { easy: 1, medium: 2, hard: 3 },
};

// ============================================
// Adaptive ML Service
// ============================================

class AdaptiveMLService {
  private studentProfiles: Map<string, StudentProfile> = new Map();
  private performanceThresholds = {
    excellent: 85,
    good: 70,
    fair: 50,
    poor: 30,
  };

  /**
   * Initialize or get student profile
   */
  initializeStudentProfile(
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia',
    baseGrade: number
  ): StudentProfile {
    const key = `${studentId}:${sessionType}`;

    if (this.studentProfiles.has(key)) {
      return this.studentProfiles.get(key)!;
    }

    const profile: StudentProfile = {
      studentId,
      sessionType,
      currentGrade: baseGrade,
      performanceHistory: [],
      estimatedCompetencyLevel: 50,
      learningRate: 1,
      strugglingAreas: [],
      strengthAreas: [],
      adaptiveGradeAdjustment: 0,
    };

    this.studentProfiles.set(key, profile);
    return profile;
  }

  /**
   * Record performance metric
   */
  recordPerformance(
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia',
    metric: PerformanceMetrics
  ): void {
    const key = `${studentId}:${sessionType}`;
    let profile = this.studentProfiles.get(key);

    if (!profile) {
      profile = this.initializeStudentProfile(
        studentId,
        sessionType,
        Math.max(1, Math.floor(metric.difficultyLevel))
      );
    }

    profile.performanceHistory.push(metric);

    // Update profile based on new performance
    this.updateStudentProfile(profile);
  }

  /**
   * Predict difficulty and success probability for next question
   */
  predictNextQuestion(
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia',
    currentQuestion: Question
  ): MLPrediction {
    const key = `${studentId}:${sessionType}`;
    const profile = this.studentProfiles.get(key);

    if (!profile || profile.performanceHistory.length === 0) {
      // Default prediction for new student
      return this.getDefaultPrediction(currentQuestion);
    }

    // Analyze performance patterns
    const pattern = this.analyzeLearningPattern(profile);
    const competency = profile.estimatedCompetencyLevel;
    const recentAccuracy = this.calculateRecentAccuracy(profile);

    // ML prediction logic
    let recommendedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    let successProbability = 50;
    let gradeAdjustment = 0;

    if (recentAccuracy >= this.performanceThresholds.excellent) {
      recommendedDifficulty = 'hard';
      successProbability = 75;
      gradeAdjustment = 1;
    } else if (recentAccuracy >= this.performanceThresholds.good) {
      recommendedDifficulty = 'medium';
      successProbability = 70;
      gradeAdjustment = 0.5;
    } else if (recentAccuracy >= this.performanceThresholds.fair) {
      recommendedDifficulty = 'easy';
      successProbability = 60;
      gradeAdjustment = 0;
    } else {
      recommendedDifficulty = 'easy';
      successProbability = 45;
      gradeAdjustment = -1;
    }

    // Adjust for learning rate
    if (pattern.improvementTrend === 'improving') {
      successProbability += 10;
      gradeAdjustment += profile.learningRate;
    } else if (pattern.improvementTrend === 'declining') {
      successProbability -= 15;
      gradeAdjustment -= 1;
    }

    // Adjust for fatigue
    if (pattern.fatigueDetected) {
      successProbability -= 10;
      recommendedDifficulty = 'easy';
    }

    const estimatedTimeNeeded = this.estimateResponseTime(profile, recommendedDifficulty);
    const recommendedGradeLevel = Math.max(
      1,
      Math.min(12, profile.currentGrade + gradeAdjustment)
    );

    return {
      recommendedDifficulty,
      successProbability: Math.max(0, Math.min(100, successProbability)),
      estimatedTimeNeeded,
      recommendedGradeLevel,
      confidence: pattern.consistencyScore / 100,
    };
  }

  /**
   * Analyze learning pattern
   */
  analyzeLearningPattern(profile: StudentProfile): LearningPattern {
    const history = profile.performanceHistory;
    if (history.length === 0) {
      return {
        improvementTrend: 'stable',
        averageAccuracy: 50,
        averageResponseTime: 5000,
        consistencyScore: 50,
        fatigueDetected: false,
        sessionDuration: 0,
      };
    }

    // Calculate recent vs earlier performance
    const recentSize = Math.ceil(history.length / 3);
    const recent = history.slice(-recentSize);
    const earlier = history.length > recentSize ? history.slice(0, recentSize) : history;

    const recentAccuracy =
      (recent.filter((m) => m.isCorrect).length / recent.length) * 100;
    const earlierAccuracy =
      (earlier.filter((m) => m.isCorrect).length / earlier.length) * 100;

    const improvementTrend =
      recentAccuracy > earlierAccuracy + 10
        ? 'improving'
        : recentAccuracy < earlierAccuracy - 10
          ? 'declining'
          : 'stable';

    // Calculate average metrics
    const averageAccuracy =
      (history.filter((m) => m.isCorrect).length / history.length) * 100;
    const averageResponseTime =
      history.reduce((sum, m) => sum + m.responseTime, 0) / history.length;

    // Consistency score (std dev of accuracy)
    const variance =
      history.reduce((sum, m) => {
        const diff = (m.isCorrect ? 100 : 0) - averageAccuracy;
        return sum + diff * diff;
      }, 0) / history.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - stdDev);

    // Detect fatigue (declining performance over time)
    const lastQuarter = history.slice(-Math.ceil(history.length / 4));
    const fatigueDetected =
      lastQuarter.length > 3 &&
      lastQuarter.filter((m) => !m.isCorrect).length >
        lastQuarter.length / 2;

    const sessionDuration =
      history.length > 0
        ? history[history.length - 1].timestamp - history[0].timestamp
        : 0;

    return {
      improvementTrend,
      averageAccuracy,
      averageResponseTime,
      consistencyScore,
      fatigueDetected,
      sessionDuration,
    };
  }

  /**
   * Update student profile based on performance trends
   */
  private updateStudentProfile(profile: StudentProfile): void {
    const history = profile.performanceHistory;
    if (history.length === 0) return;

    // Update competency level
    const recentAccuracy = this.calculateRecentAccuracy(profile);
    profile.estimatedCompetencyLevel = recentAccuracy;

    // Update learning rate
    const pattern = this.analyzeLearningPattern(profile);
    if (pattern.improvementTrend === 'improving') {
      profile.learningRate = Math.min(2, profile.learningRate + 0.1);
    } else if (pattern.improvementTrend === 'declining') {
      profile.learningRate = Math.max(0.5, profile.learningRate - 0.1);
    }

    // Identify struggling and strong areas
    this.updateStrugglingAreas(profile);
    this.updateStrengthAreas(profile);

    // Calculate adaptive grade adjustment
    if (recentAccuracy >= 85) {
      profile.adaptiveGradeAdjustment = Math.min(
        2,
        profile.adaptiveGradeAdjustment + 0.5
      );
    } else if (recentAccuracy < 50) {
      profile.adaptiveGradeAdjustment = Math.max(
        -2,
        profile.adaptiveGradeAdjustment - 0.5
      );
    }
  }

  /**
   * Identify struggling areas
   */
  private updateStrugglingAreas(profile: StudentProfile): void {
    const typeAccuracy: Record<string, { correct: number; total: number }> = {};

    profile.performanceHistory.forEach((metric) => {
      if (!typeAccuracy[metric.questionType]) {
        typeAccuracy[metric.questionType] = { correct: 0, total: 0 };
      }
      typeAccuracy[metric.questionType].total++;
      if (metric.isCorrect) {
        typeAccuracy[metric.questionType].correct++;
      }
    });

    profile.strugglingAreas = Object.entries(typeAccuracy)
      .filter(
        ([_, stats]) =>
          (stats.correct / stats.total) * 100 < 60
      )
      .map(([type]) => type);
  }

  /**
   * Identify strength areas
   */
  private updateStrengthAreas(profile: StudentProfile): void {
    const typeAccuracy: Record<string, { correct: number; total: number }> = {};

    profile.performanceHistory.forEach((metric) => {
      if (!typeAccuracy[metric.questionType]) {
        typeAccuracy[metric.questionType] = { correct: 0, total: 0 };
      }
      typeAccuracy[metric.questionType].total++;
      if (metric.isCorrect) {
        typeAccuracy[metric.questionType].correct++;
      }
    });

    profile.strengthAreas = Object.entries(typeAccuracy)
      .filter(
        ([_, stats]) =>
          (stats.correct / stats.total) * 100 >= 80
      )
      .map(([type]) => type);
  }

  /**
   * Calculate recent accuracy (last 10 responses or all if fewer)
   */
  private calculateRecentAccuracy(profile: StudentProfile): number {
    const recent = profile.performanceHistory.slice(-10);
    if (recent.length === 0) return 50;

    return (
      (recent.filter((m) => m.isCorrect).length / recent.length) * 100
    );
  }

  /**
   * Estimate response time based on difficulty
   */
  private estimateResponseTime(
    profile: StudentProfile,
    difficulty: 'easy' | 'medium' | 'hard'
  ): number {
    const avgTime =
      profile.performanceHistory.length > 0
        ? profile.performanceHistory.reduce((sum, m) => sum + m.responseTime, 0) /
          profile.performanceHistory.length
        : 5000;

    const timeMultiplier =
      difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.5 : 1;

    return Math.round(avgTime * timeMultiplier);
  }

  /**
   * Default prediction for new students
   */
  private getDefaultPrediction(question: Question): MLPrediction {
    return {
      recommendedDifficulty: 'medium',
      successProbability: 60,
      estimatedTimeNeeded: 5000,
      recommendedGradeLevel: 3,
      confidence: 0.5,
    };
  }

  /**
   * Get comprehensive student profile analysis
   */
  getStudentAnalysis(
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia'
  ) {
    const key = `${studentId}:${sessionType}`;
    const profile = this.studentProfiles.get(key);

    if (!profile) {
      return null;
    }

    const pattern = this.analyzeLearningPattern(profile);

    return {
      profile,
      pattern,
      recommendations: {
        nextDifficulty: this.getRecommendedDifficulty(profile),
        interventionNeeded:
          profile.estimatedCompetencyLevel < 50,
        focusAreas: profile.strugglingAreas,
        reinforcementAreas: profile.strengthAreas,
        estimatedReadinessForNextGrade:
          profile.estimatedCompetencyLevel >= 80,
      },
    };
  }

  /**
   * Get recommended difficulty based on profile
   */
  private getRecommendedDifficulty(profile: StudentProfile): 'easy' | 'medium' | 'hard' {
    const competency = profile.estimatedCompetencyLevel;

    if (competency >= 85) return 'hard';
    if (competency >= 70) return 'medium';
    return 'easy';
  }

  /**
   * Clear profile (e.g., at end of session)
   */
  clearProfile(studentId: string, sessionType: 'dyslexia' | 'dyscalculia'): void {
    const key = `${studentId}:${sessionType}`;
    this.studentProfiles.delete(key);
  }

  /**
   * Export profile for persistence
   */
  exportProfile(
    studentId: string,
    sessionType: 'dyslexia' | 'dyscalculia'
  ): StudentProfile | null {
    const key = `${studentId}:${sessionType}`;
    return this.studentProfiles.get(key) || null;
  }

  /**
   * Import profile from persistence
   */
  importProfile(profile: StudentProfile): void {
    const key = `${profile.studentId}:${profile.sessionType}`;
    this.studentProfiles.set(key, profile);
  }
}

// ============================================
// Singleton Instance & Export
// ============================================

let adaptiveService: AdaptiveMLService | null = null;

export function getAdaptiveMLService(): AdaptiveMLService {
  if (!adaptiveService) {
    adaptiveService = new AdaptiveMLService();
  }
  return adaptiveService;
}

export default AdaptiveMLService;

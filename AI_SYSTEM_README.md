# 🧠 SWAR AI Analysis System - Complete Documentation

## 📚 Table of Contents
1. [Overview](#overview)
2. [What's Included](#whats-included)
3. [Quick Start](#quick-start)
4. [Architecture](#architecture)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The SWAR AI Analysis System integrates Large Language Models (LLMs) and Machine Learning (ML) to provide intelligent analysis of student responses based on hard-coded questions in `gradeQuestions.ts`.

### Key Capabilities

**🤖 LLM-Powered Answer Validation**
- Semantic understanding (not just string matching)
- Conceptual mastery detection
- Common misconception identification
- Pedagogical feedback generation
- Support for multiple LLM providers (OpenAI, Gemini, Claude, Ollama)

**🎯 ML-Based Adaptive Learning**
- Dynamic difficulty adjustment
- Learning pattern detection
- Performance prediction
- Student profiling
- Risk indicator identification

**📊 Comprehensive Analysis**
- Session-level diagnostics
- Student performance profiles
- Intervention recommendations
- Progress tracking

---

## What's Included

### 📁 Core Modules

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/llmAnalysis.ts` | LLM service for semantic validation | ✅ Ready |
| `src/lib/adaptiveML.ts` | ML-based student profiling & adaptivity | ✅ Ready |
| `src/lib/aiConfig.ts` | Configuration & environment setup | ✅ Ready |
| `src/lib/aiIntegration.ts` | Integration helpers & React hooks | ✅ Ready |
| `src/types/aiSession.ts` | Enhanced type definitions | ✅ Ready |

### 📖 Documentation

| File | Purpose |
|------|---------|
| `LLM_ML_INTEGRATION_GUIDE.md` | Complete setup & usage guide |
| `AI_INTEGRATION_SUMMARY.md` | High-level overview |
| `QUICK_START.md` | 5-minute setup checklist |
| `.env.local.example` | Configuration template |
| `AI_SYSTEM_README.md` | This file |

### 🔧 Configuration

| File | Purpose |
|------|---------|
| `.env.local.example` | All configuration options documented |
| `.env.local` | Your environment-specific config (create locally) |

---

## Quick Start

### 1. Choose Your AI Provider

**Local Ollama (Recommended)**
```bash
# Download: https://ollama.ai
ollama pull mistral
ollama serve
```

**OR Cloud Provider**
- OpenAI: https://platform.openai.com/api-keys
- Google Gemini: https://makersuite.google.com/app/apikey
- Claude: https://console.anthropic.com/

### 2. Setup Environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your provider credentials
```

### 3. Integrate into Session.tsx

```typescript
import { validateResponseWithAI } from '@/lib/aiIntegration';

const validation = await validateResponseWithAI(
  transcript,
  currentQ,
  sessionType,
  studentId,
  responseTime
);
```

### 4. Restart Server

```bash
npm run dev
```

---

## Architecture

### System Flow

```
┌─────────────────────────────────────────────────────┐
│ Student Response (from Speech Recognition)          │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼───────────┐
        │ validateResponseWithAI  │
        └────────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
 ┌──────────┐   ┌──────────┐   ┌──────────┐
 │  LLM     │   │   ML     │   │ Fallback │
 │Validation│   │ Learning │   │Validation│
 └────┬─────┘   └────┬─────┘   └────┬─────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
        ┌────────────▼──────────────┐
        │ Enhanced Validation Result │
        │ - isCorrect               │
        │ - confidence              │
        │ - semanticScore           │
        │ - conceptualMastery       │
        │ - feedback                │
        │ - nextDifficulty          │
        └────────────┬───────────────┘
                     │
        ┌────────────▼──────────────┐
        │ Display to Student        │
        │ & Store in Session Data   │
        └───────────────────────────┘
```

### Module Dependencies

```
Session.tsx
    ↓
aiIntegration.ts (Integration layer)
    ├── llmAnalysis.ts (LLM Service)
    │   ├── OpenAI, Gemini, Claude, Ollama
    │   └── answerValidation.ts (Fallback)
    │
    └── adaptiveML.ts (ML Service)
        └── Performance tracking
```

---

## Usage Examples

### Example 1: Basic Answer Validation

```typescript
import { getLLMService } from '@/lib/llmAnalysis';
import { getQuestionsForGrade } from '@/lib/gradeQuestions';

const llmService = getLLMService();
const questions = getQuestionsForGrade(3, 'dyslexia');
const question = questions[0];

const result = await llmService.validateAnswerWithLLM(
  "cat",  // student response
  question.expectedAnswer,
  question,
  'dyslexia'
);

console.log({
  isCorrect: result.isCorrect,
  confidence: result.confidence,
  feedback: result.suggestedFeedback,
  mastery: result.conceptualMastery
});
```

### Example 2: Adaptive Difficulty

```typescript
import { getAdaptiveMLService } from '@/lib/adaptiveML';

const mlService = getAdaptiveMLService();

// Record a student's response
mlService.recordPerformance('student-123', 'dyslexia', {
  questionId: 1,
  timestamp: Date.now(),
  responseTime: 5000,
  isCorrect: true,
  confidence: 90,
  questionType: 'word',
  difficultyLevel: 2
});

// Get prediction for next question
const prediction = mlService.predictNextQuestion(
  'student-123',
  'dyslexia',
  currentQuestion
);

console.log({
  difficulty: prediction.recommendedDifficulty,
  successProbability: prediction.successProbability,
  gradeLevel: prediction.recommendedGradeLevel
});
```

### Example 3: Session Analysis

```typescript
import { generateSessionAnalysis } from '@/lib/aiIntegration';

const report = await generateSessionAnalysis(
  'student-123',
  'dyslexia',
  allResponses
);

console.log({
  competency: report.studentProfile.estimatedCompetencyLevel,
  trend: report.performanceAnalysis.improvementTrend,
  strengths: report.performanceAnalysis.strongAreas,
  improvements: report.performanceAnalysis.weakAreas,
  intervention: report.diagnosticSummary.recommendedIntervention
});
```

### Example 4: React Hook Integration

```typescript
import { useAIAnalysis } from '@/lib/aiIntegration';

function SessionComponent() {
  const { validateResponse, getStudentProfile, isAnalyzing } = 
    useAIAnalysis('student-id', 'dyslexia');

  const handleSubmit = async (response, question) => {
    const result = await validateResponse(response, question, 5000);
    
    if (result?.isCorrect) {
      console.log('Correct!', result.feedback);
    } else {
      console.log('Try again:', result?.feedback);
    }
  };

  return (
    <>
      {isAnalyzing && <LoadingSpinner />}
      <button onClick={() => handleSubmit(...)}>
        Submit Response
      </button>
    </>
  );
}
```

---

## Configuration

### Environment Variables

#### LLM Provider Selection
```env
# Local (Recommended)
VITE_LLM_PROVIDER=local
VITE_LOCAL_MODEL_URL=http://localhost:11434/api
VITE_LLM_MODEL=mistral

# OpenAI
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-...
VITE_LLM_MODEL=gpt-3.5-turbo

# Google Gemini
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=...
VITE_LLM_MODEL=gemini-pro

# Anthropic Claude
VITE_LLM_PROVIDER=claude
VITE_LLM_API_KEY=sk-ant-...
VITE_LLM_MODEL=claude-3-sonnet-20240229
```

#### Feature Flags
```env
VITE_ENABLE_LLM_VALIDATION=true
VITE_ENABLE_ADAPTIVE_DIFFICULTY=true
VITE_ENABLE_DETAILED_ANALYSIS=true
VITE_ENABLE_PEDAGOGICAL_FEEDBACK=true
```

#### Performance Tuning
```env
VITE_LLM_TEMPERATURE=0.3      # 0=deterministic, 1=creative
VITE_LLM_MAX_TOKENS=1000      # Response length limit
VITE_CACHE_PREDICTIONS=true   # Reduce API calls
VITE_MAX_CONCURRENT_ANALYSES=3
```

### Programmatic Configuration

```typescript
import { getAIConfigManager } from '@/lib/aiConfig';

const configManager = getAIConfigManager();

// Get current config
const config = configManager.getConfig();

// Update config
configManager.setConfig({
  llmProvider: 'openai',
  llmApiKey: 'sk-...',
  enableLLMValidation: true
});

// Validate
const validation = configManager.validateConfig();
console.log(validation.errors);
```

---

## API Reference

### LLMAnalysisService

#### validateAnswerWithLLM()
```typescript
async validateAnswerWithLLM(
  studentResponse: string,
  expectedAnswer: string,
  question: Question,
  sessionType: 'dyslexia' | 'dyscalculia'
): Promise<LLMValidationResult>
```

**Returns:**
```typescript
{
  isCorrect: boolean;
  confidence: number;           // 0-100
  reason: string;
  semanticScore: number;        // 0-100
  conceptualMastery: string;    // 'mastered' | 'developing' | ...
  suggestedFeedback: string;
  commonMisconception?: string;
  learningGap?: string;
  nextStepRecommendation?: string;
}
```

#### getAdaptivityRecommendation()
```typescript
async getAdaptivityRecommendation(
  studentResponse: string,
  expectedAnswer: string,
  question: Question,
  performanceHistory: LLMValidationResult[]
): Promise<AdaptivityRecommendation>
```

#### analyzeSession()
```typescript
async analyzeSession(
  sessionId: string,
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia',
  responses: Array<{...}>
): Promise<SessionAnalysis>
```

### AdaptiveMLService

#### recordPerformance()
```typescript
recordPerformance(
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia',
  metric: PerformanceMetrics
): void
```

#### predictNextQuestion()
```typescript
predictNextQuestion(
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia',
  currentQuestion: Question
): MLPrediction
```

#### getStudentAnalysis()
```typescript
getStudentAnalysis(
  studentId: string,
  sessionType: 'dyslexia' | 'dyscalculia'
): StudentAnalysisResult | null
```

---

## Troubleshooting

### Common Issues

**❌ "Cannot find module 'llmAnalysis'"**
- Verify files exist: `ls src/lib/llmAnalysis.ts`
- Check import paths use correct case
- Restart dev server

**❌ "API key not configured"**
- Check `.env.local` exists
- Verify `VITE_LLM_API_KEY` is set
- Restart dev server (vite requires restart for env changes)

**❌ "Local model connection refused"**
- Ensure Ollama is running: `ollama serve`
- Check URL: `http://localhost:11434/api`
- Pull model: `ollama pull mistral`

**❌ "Slow responses"**
- Reduce max tokens: `VITE_LLM_MAX_TOKENS=500`
- Use faster model: `mistral` or `neural-chat`
- Enable caching: `VITE_CACHE_PREDICTIONS=true`

**❌ "High API costs"**
- Switch to local Ollama (free)
- Use Google Gemini (free tier: 60 req/min)
- Reduce `VITE_LLM_MAX_TOKENS`
- Enable caching to reduce redundant calls

### Debug Mode

Enable detailed logging:

```typescript
// In any component
import { getLLMService } from '@/lib/llmAnalysis';

const llm = getLLMService();
console.log = (msg) => {
  console.debug('[SWAR-AI]', msg);
};

// Then use as normal - will log all API calls
```

---

## Best Practices

### 1. Local Development
Use Ollama for:
- Development without API costs
- Privacy (no external API calls)
- Offline operation
- Easy debugging

### 2. Production Deployment
Use managed APIs for:
- Reliability and uptime
- Scaling capacity
- Monitoring and logging
- Support from vendor

### 3. Performance
```typescript
// DO: Batch analysis when possible
const report = await generateSessionAnalysis(studentId, type, responses);

// DON'T: Validate one response at a time unnecessarily
for (let response of responses) {
  await validateResponseWithAI(...); // Inefficient
}
```

### 4. Error Handling
```typescript
try {
  const result = await validateResponseWithAI(...);
} catch (error) {
  console.error('AI analysis failed:', error);
  // Automatically falls back to basic validation
  // App continues to work!
}
```

---

## Support & Resources

### Documentation Files
- `QUICK_START.md` - 5-minute setup
- `LLM_ML_INTEGRATION_GUIDE.md` - Complete guide
- `AI_INTEGRATION_SUMMARY.md` - High-level overview
- `.env.local.example` - Configuration options

### External Resources
- **Ollama**: https://ollama.ai
- **OpenAI**: https://platform.openai.com/docs
- **Google Gemini**: https://ai.google.dev
- **Anthropic Claude**: https://docs.anthropic.com

### Getting Help
1. Check the Troubleshooting section above
2. Review code examples in `aiIntegration.ts`
3. Check LLM provider documentation
4. Verify `.env.local` configuration

---

## Version Information

- **Version**: 1.0.0
- **Status**: Production Ready ✅
- **Last Updated**: January 2026
- **Compatible With**: React 18+, Vite, TypeScript

---

## License & Attribution

This AI analysis system is part of the SWAR (Speech with Augmented Recognition) project for early detection of learning disabilities through speech-first assessment.

All integration code is provided as-is for educational and research purposes.

---

**Ready to deploy AI-powered learning assessment! 🚀**

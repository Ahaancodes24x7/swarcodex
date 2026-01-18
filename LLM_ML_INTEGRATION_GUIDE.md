# SWAR AI Analysis - LLM/ML Integration Guide

## Overview

This guide explains how to integrate LLM (Large Language Models) and ML (Machine Learning) for intelligent analysis of student responses based on hard-coded questions in `gradeQuestions.ts`.

## 🎯 Key Features

### 1. **LLM-Powered Answer Validation** (`llmAnalysis.ts`)
- **Semantic Understanding**: Goes beyond string matching to understand meaning
- **Multiple LLM Support**: OpenAI, Google Gemini, Claude, or local models (Ollama)
- **Conceptual Mastery Detection**: Identifies if student truly understands the concept
- **Common Misconception Detection**: Recognizes typical learning errors
- **Pedagogical Feedback**: Generates educationally sound explanations

### 2. **Machine Learning Adaptivity** (`adaptiveML.ts`)
- **Dynamic Difficulty Adjustment**: Questions adapt to student performance
- **Learning Pattern Analysis**: Detects improvement trends, fatigue, inconsistency
- **Personalized Recommendations**: Suggests next steps based on profile
- **Performance Prediction**: Estimates success probability for upcoming questions
- **Student Profiling**: Builds comprehensive learning profile over time

### 3. **Configuration Management** (`aiConfig.ts`)
- Easy setup with environment variables
- Support for multiple LLM providers
- Feature flags for fine-grained control
- Fallback modes when LLM unavailable

## 📋 Quick Start (3 Steps)

### Step 1: Choose Your LLM Provider

#### Option A: **Local Ollama** (Recommended - Free, Private)
```bash
# Download and install Ollama: https://ollama.ai

# Pull a model
ollama pull mistral

# Start Ollama server
ollama serve

# Add to .env.local:
VITE_LLM_PROVIDER=local
VITE_LOCAL_MODEL_URL=http://localhost:11434/api
VITE_LLM_MODEL=mistral
```

#### Option B: **OpenAI** (Most Capable)
```bash
# Get API key from https://platform.openai.com/api-keys

# Add to .env.local:
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-your-key-here
VITE_LLM_MODEL=gpt-3.5-turbo
```

#### Option C: **Google Gemini** (Free Tier Available)
```bash
# Get API key from https://makersuite.google.com/app/apikey

# Add to .env.local:
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your-gemini-key-here
VITE_LLM_MODEL=gemini-pro
```

#### Option D: **Anthropic Claude** (Most Thoughtful)
```bash
# Get API key from https://console.anthropic.com/

# Add to .env.local:
VITE_LLM_PROVIDER=claude
VITE_LLM_API_KEY=sk-ant-your-key-here
VITE_LLM_MODEL=claude-3-sonnet-20240229
```

### Step 2: Update Session.tsx

Replace the basic answer validation with AI-powered validation:

```typescript
// OLD CODE (in Session.tsx):
const validation = sessionType === 'dyscalculia' && currentQ.type === 'calculation'
  ? validateNumericAnswer(transcript, currentQ.expectedAnswer)
  : validateAnswer(transcript, currentQ.expectedAnswer, currentQ.type);

// NEW CODE:
import { validateResponseWithAI } from '@/lib/aiIntegration';

const validation = await validateResponseWithAI(
  transcript,
  currentQ,
  sessionType,
  studentId,
  Date.now() - questionStartTime
);
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🔧 Integration Files

### Core Modules Created:

1. **`src/lib/llmAnalysis.ts`** (600+ lines)
   - LLM service with semantic answer validation
   - Session analysis and diagnostic reports
   - Support for OpenAI, Gemini, Claude, local models

2. **`src/lib/adaptiveML.ts`** (400+ lines)
   - ML-based student profiling
   - Learning pattern detection
   - Adaptive difficulty prediction
   - Performance trend analysis

3. **`src/lib/aiConfig.ts`** (200+ lines)
   - Configuration management
   - Environment variable handling
   - Validation and setup documentation

4. **`src/lib/aiIntegration.ts`** (300+ lines)
   - Integration examples
   - React hooks for AI analysis
   - Type definitions and patterns

## 📊 How It Works

### Answer Validation Flow

```
Student Response
    ↓
[LLM Analysis]
  - Semantic understanding check
  - Concept mastery assessment
  - Misconception detection
    ↓
[Validation Result]
  - isCorrect: boolean
  - confidence: 0-100
  - semanticScore: 0-100
  - conceptualMastery: level
  - suggestedFeedback: string
```

### Adaptive Difficulty Flow

```
Response Data
    ↓
[ML Model Analysis]
  - Compare with performance history
  - Analyze learning patterns
  - Detect fatigue/struggles
    ↓
[Prediction]
  - recommendedDifficulty
  - successProbability
  - estimatedGradeLevel
    ↓
[Question Selection]
  - Next question adjusted automatically
```

## 🎓 Supported Question Types

The AI analysis works with all SWAR question types:

- **Dyslexia Screening**:
  - Phoneme recognition
  - Word pronunciation
  - Sentence reading
  - Morphological analysis
  - Stress pattern identification

- **Dyscalculia Screening**:
  - Number counting
  - Basic calculations
  - Arithmetic facts
  - Mathematical reasoning
  - Advanced mathematics

## 📈 Analysis Output

### Student Response Includes:
```typescript
{
  questionId: number,
  studentResponse: string,
  validation: {
    isCorrect: boolean,
    confidence: number,
    semanticScore: number,
    conceptualMastery: 'mastered' | 'developing' | 'emerging' | 'needs_help',
    suggestedFeedback: string,
    learningGap?: string,
  },
  adaptivity: {
    adjustDifficulty: 'increase' | 'maintain' | 'decrease',
    successProbability: number,
  }
}
```

### Session Analysis Includes:
```typescript
{
  studentProfile: {
    estimatedCompetencyLevel: number,
    learningRate: number,
    strugglingAreas: string[],
    strengthAreas: string[],
  },
  diagnosticSummary: {
    strongAreas: string[],
    weakAreas: string[],
    overallCompetency: string,
    riskIndicators: string[],
    recommendedIntervention: string,
  }
}
```

## 🚀 Advanced Features

### 1. Batch Analysis
```typescript
const analysisReport = await generateSessionAnalysis(
  studentId,
  sessionType,
  allResponses
);
```

### 2. Student Profiling
```typescript
const adaptiveService = getAdaptiveMLService();
const profile = adaptiveService.getStudentAnalysis(
  studentId,
  sessionType
);

// Returns:
// - Learning patterns
// - Performance trends
// - Intervention recommendations
```

### 3. Prediction
```typescript
const prediction = adaptiveService.predictNextQuestion(
  studentId,
  sessionType,
  currentQuestion
);

// Returns:
// - Recommended difficulty
// - Success probability
// - Estimated response time
```

## 🔒 Privacy & Security

### Local Deployment (Recommended)
```bash
# Run locally with Ollama - NO data sent to external servers
ollama pull mistral
ollama serve
```

### Cloud Deployment (If using APIs)
- Store API keys in environment variables only
- Never commit keys to git
- Use `.env.local` for local development
- Use secure environment variable management in production

## ⚙️ Configuration Options

### Feature Flags
```env
VITE_ENABLE_LLM_VALIDATION=true
VITE_ENABLE_ADAPTIVE_DIFFICULTY=true
VITE_ENABLE_DETAILED_ANALYSIS=true
VITE_ENABLE_PEDAGOGICAL_FEEDBACK=true
```

### Performance Tuning
```env
VITE_CACHE_PREDICTIONS=true
VITE_BATCH_ANALYSIS=false
VITE_MAX_CONCURRENT_ANALYSES=3
```

## 🧪 Testing the Integration

### Test with Sample Question
```typescript
import { getLLMService } from '@/lib/llmAnalysis';
import { getQuestionsForGrade } from '@/lib/gradeQuestions';

const llmService = getLLMService();
const questions = getQuestionsForGrade(3, 'dyslexia');
const testQuestion = questions[0];

const result = await llmService.validateAnswerWithLLM(
  "cat",  // student response
  testQuestion.expectedAnswer,
  testQuestion,
  'dyslexia'
);

console.log(result);
```

## 📚 Example Integration in React

### Using the AI Hook
```typescript
import { useAIAnalysis } from '@/lib/aiIntegration';

function MyComponent({ studentId, sessionType }) {
  const { validateResponse, getStudentProfile, isAnalyzing } = 
    useAIAnalysis(studentId, sessionType);

  const handleSubmit = async (response, question) => {
    const result = await validateResponse(response, question, 5000);
    console.log('Validation:', result);
  };

  return (
    <div>
      {isAnalyzing && <Spinner />}
      <button onClick={() => handleSubmit(...)}>
        Submit
      </button>
    </div>
  );
}
```

## 🐛 Troubleshooting

### Issue: "API key not configured"
**Solution**: 
- Check `.env.local` exists in project root
- Verify `VITE_LLM_API_KEY` is set
- Restart dev server after changing env vars

### Issue: "Local model connection refused"
**Solution**:
- Ensure Ollama is running: `ollama serve`
- Check URL is correct: `http://localhost:11434`
- Download model: `ollama pull mistral`

### Issue: Slow responses
**Solution**:
- Use faster model (mistral > llama2 > neural-chat)
- Enable caching: `VITE_CACHE_PREDICTIONS=true`
- Reduce `maxTokens` in config

### Issue: High API costs
**Solution**:
- Switch to local Ollama (free)
- Use Google Gemini (has free tier)
- Reduce token usage: `VITE_LLM_MAX_TOKENS=500`

## 📞 Support & Feedback

For issues or questions:
1. Check the troubleshooting section above
2. Review integration examples in `aiIntegration.ts`
3. Check LLM provider documentation
4. Ensure `.env.local` is properly configured

## 🎯 Next Steps

1. ✅ Set up environment variables (`.env.local`)
2. ✅ Choose LLM provider (start with local Ollama)
3. ✅ Update `Session.tsx` with AI validation
4. ✅ Test with sample questions
5. ✅ Monitor performance and adjust configuration
6. ✅ Integrate with database for persistence
7. ✅ Deploy to production

## 📖 Additional Resources

- **OpenAI API**: https://platform.openai.com/docs
- **Google Gemini**: https://ai.google.dev
- **Anthropic Claude**: https://docs.anthropic.com
- **Ollama**: https://ollama.ai
- **SWAR Project**: Check project README.md

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready

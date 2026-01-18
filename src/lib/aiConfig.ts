/**
 * LLM/ML Configuration Module
 * Manages API keys and model selection for SWAR AI Analysis
 */

import { LLMProvider, LLMConfig } from './llmAnalysis';

// ============================================
// Environment Configuration
// ============================================

export interface AIConfig {
  // LLM Settings
  llmProvider: LLMProvider;
  llmApiKey?: string;
  llmModel?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;

  // Local ML Settings (if using local models)
  localModelBaseURL?: string;
  localModelName?: string;

  // Feature Flags
  enableLLMValidation: boolean;
  enableAdaptiveDifficulty: boolean;
  enableDetailedAnalysis: boolean;
  enablePedagogicalFeedback: boolean;

  // Performance Tuning
  cachePredictions: boolean;
  batchAnalysis: boolean;
  maxConcurrentAnalyses: number;
}

// ============================================
// Default Configuration
// ============================================

const defaultConfig: AIConfig = {
  llmProvider: 'local', // Default to local for privacy
  llmTemperature: 0.3,
  llmMaxTokens: 1000,
  localModelBaseURL: 'http://localhost:11434/api',
  localModelName: 'mistral',
  enableLLMValidation: true,
  enableAdaptiveDifficulty: true,
  enableDetailedAnalysis: true,
  enablePedagogicalFeedback: true,
  cachePredictions: true,
  batchAnalysis: false,
  maxConcurrentAnalyses: 3,
};

// ============================================
// Configuration Management
// ============================================

class AIConfigManager {
  private config: AIConfig = { ...defaultConfig };

  /**
   * Initialize configuration from environment variables
   */
  initializeFromEnv(): void {
    // Only use import.meta.env for browser environment (Vite)
    const provider = (import.meta.env.VITE_LLM_PROVIDER || 'local') as LLMProvider;
    if (provider) {
      this.config.llmProvider = provider;
    }

    const apiKey = import.meta.env.VITE_LLM_API_KEY;
    if (apiKey) {
      this.config.llmApiKey = apiKey;
    }

    const model = import.meta.env.VITE_LLM_MODEL || 'mistral';
    if (model) {
      this.config.llmModel = model;
    }

    const baseURL = import.meta.env.VITE_LOCAL_MODEL_URL || 'http://localhost:11434/api';
    if (baseURL) {
      this.config.localModelBaseURL = baseURL;
    }
  }

  /**
   * Set configuration manually
   */
  setConfig(partialConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...partialConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Get LLM configuration for LLMAnalysisService
   */
  getLLMConfig(): LLMConfig {
    return {
      provider: this.config.llmProvider,
      apiKey: this.config.llmApiKey,
      model: this.config.llmModel,
      baseURL: this.config.localModelBaseURL,
      temperature: this.config.llmTemperature,
      maxTokens: this.config.llmMaxTokens,
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.llmProvider !== 'local') {
      if (!this.config.llmApiKey) {
        errors.push(
          `API key required for provider: ${this.config.llmProvider}`
        );
      }
    }

    if (this.config.llmProvider === 'local') {
      if (!this.config.localModelBaseURL) {
        errors.push('Local model base URL not configured');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.config = { ...defaultConfig };
  }
}

// ============================================
// Singleton Instance
// ============================================

let configManager: AIConfigManager | null = null;

export function getAIConfigManager(): AIConfigManager {
  if (!configManager) {
    configManager = new AIConfigManager();
    configManager.initializeFromEnv();
  }
  return configManager;
}

// ============================================
// Environment Variables Documentation
// ============================================

export const ENV_VARS_DOCUMENTATION = `
# SWAR AI Configuration Environment Variables

## LLM Provider Configuration

### For OpenAI:
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-...your-key...
VITE_LLM_MODEL=gpt-3.5-turbo  # or gpt-4

### For Google Gemini:
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your-gemini-api-key
VITE_LLM_MODEL=gemini-pro

### For Anthropic Claude:
VITE_LLM_PROVIDER=claude
VITE_LLM_API_KEY=sk-ant-...your-key...
VITE_LLM_MODEL=claude-3-sonnet-20240229

### For Local Models (Ollama, etc.):
VITE_LLM_PROVIDER=local
VITE_LOCAL_MODEL_URL=http://localhost:11434/api
VITE_LLM_MODEL=mistral

## Feature Flags:
VITE_ENABLE_LLM_VALIDATION=true
VITE_ENABLE_ADAPTIVE_DIFFICULTY=true
VITE_ENABLE_DETAILED_ANALYSIS=true

## How to Setup:

1. Create .env.local file in project root:
   cp .env.example .env.local

2. Add your configuration:
   VITE_LLM_PROVIDER=openai
   VITE_LLM_API_KEY=your-api-key

3. Restart development server:
   npm run dev

## Recommended Setup for Production:
- Use local models (Ollama with Mistral) for privacy
- Or use managed APIs with rate limiting
- Store API keys in environment variables, never in code
`;

export default AIConfigManager;

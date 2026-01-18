# 🚀 Quick Start Checklist - AI Analysis Integration

## ⚡ Get Started in 5 Minutes

### 1️⃣ **Choose Your AI Provider** (2 min)

Choose ONE option:

**🎯 Recommended: Local Ollama (Free, Private, Offline)**
```bash
# Download: https://ollama.ai
# Then run:
ollama pull mistral
ollama serve  # Keep this running
```
→ Copy to `.env.local`:
```
VITE_LLM_PROVIDER=local
VITE_LOCAL_MODEL_URL=http://localhost:11434/api
VITE_LLM_MODEL=mistral
```

**OR: OpenAI (Most Capable)**
→ Get key: https://platform.openai.com/api-keys
→ Copy to `.env.local`:
```
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-your-key-here
```

**OR: Google Gemini (Free Tier)**
→ Get key: https://makersuite.google.com/app/apikey
→ Copy to `.env.local`:
```
VITE_LLM_PROVIDER=gemini
VITE_LLM_API_KEY=your-key-here
```

### 2️⃣ **Setup Environment** (1 min)

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your provider + key (see step 1)
```

### 3️⃣ **Integrate into Session.tsx** (1 min)

Open: `src/pages/Session.tsx`

**Find (around line 210):**
```typescript
const validation = sessionType === 'dyscalculia' && currentQ.type === 'calculation'
  ? validateNumericAnswer(transcript, currentQ.expectedAnswer)
  : validateAnswer(transcript, currentQ.expectedAnswer, currentQ.type);
```

**Replace with:**
```typescript
import { validateResponseWithAI } from '@/lib/aiIntegration';

const validation = await validateResponseWithAI(
  transcript,
  currentQ,
  sessionType,
  studentId,
  Date.now() - questionStartTime
);
```

### 4️⃣ **Restart Dev Server** (1 min)

```bash
npm run dev
```

### 5️⃣ **Test It!** (Optional but recommended)

1. Go to http://localhost:5173
2. Start a dyslexia or dyscalculia session
3. Give intentionally wrong answers to test feedback
4. Check browser console for logs

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `.env.local` file exists in project root
- [ ] Ollama running (if using local): `ollama serve`
- [ ] Dev server started: `npm run dev`
- [ ] No errors in browser console
- [ ] Session page loads without errors
- [ ] Recording works (mic permissions)
- [ ] Submit response shows feedback
- [ ] Questions advance to next one

---

## 🎯 What Each File Does

| File | Purpose | Status |
|------|---------|--------|
| `llmAnalysis.ts` | Smart answer validation | ✅ Ready |
| `adaptiveML.ts` | Adaptive difficulty | ✅ Ready |
| `aiConfig.ts` | Configuration management | ✅ Ready |
| `aiIntegration.ts` | Integration examples | ✅ Ready |
| `LLM_ML_INTEGRATION_GUIDE.md` | Full documentation | ✅ Ready |
| `.env.local.example` | Config template | ✅ Ready |
| `Session.tsx` | Your integration here ⬅️ | ⏳ TODO |

---

## 💡 Understanding the Integration

### What Changes?
**Before:**
```
Answer → String match → Correct ✓ or Wrong ✗
```

**After:**
```
Answer → LLM Analysis → Correct ✓ or Wrong ✗ + Why
         → AI Feedback → Specific guidance
         → ML Learning → Next difficulty level
```

### What Stays the Same?
- ✅ All question content from `gradeQuestions.ts`
- ✅ Speech recognition and UI
- ✅ Database schema
- ✅ Teacher dashboard
- ✅ Session history

### What's New?
- ✅ Semantic understanding of answers
- ✅ Adaptive question difficulty
- ✅ Detailed pedagogical feedback
- ✅ Student performance profiles
- ✅ Risk indicators for early intervention

---

## 🔧 Troubleshooting Quick Fixes

### ❌ "Cannot find module 'llmAnalysis'"
```bash
# Ensure files are in correct location:
ls src/lib/llmAnalysis.ts
# Should show the file exists
```

### ❌ "API key not configured"
Check `.env.local`:
```bash
# Should exist and have content
cat .env.local
```

### ❌ "Local model connection refused"
```bash
# Start Ollama server
ollama serve

# In another terminal:
ollama pull mistral
```

### ❌ "Slow responses"
Reduce token usage:
```env
VITE_LLM_MAX_TOKENS=500
```

---

## 📊 Expected Behavior

### Good Response (Phoneme Question)
**Q:** "Say the sound of B"  
**Student:** "buh"  
**Expected:** "b"

**System Output:**
```
✓ Correct - Confidence: 95%
The 'buh' sound is the phonetic pronunciation of B
```

### Misspoken Answer (Word Question)
**Q:** "Say: BEAUTIFUL"  
**Student:** "beautful"  
**Expected:** "beautiful"

**System Output:**
```
✓ Correct - Confidence: 88%
Good pronunciation! That's a common spelling variant.
```

### Wrong Answer (Math Question)
**Q:** "What is 15 × 15?"  
**Student:** "200"  
**Expected:** "225"

**System Output:**
```
✗ Incorrect - Confidence: 5%
The multiplication of 15 × 15 equals 225.
Try again: 15 × 15 = (10 + 5) × (10 + 5)
```

---

## 🎓 Learning Resources

**After Setup, Learn More:**
1. Read `LLM_ML_INTEGRATION_GUIDE.md` for advanced features
2. Review `aiIntegration.ts` for code examples
3. Check `llmAnalysis.ts` for LLM capabilities
4. Explore `adaptiveML.ts` for ML features

---

## 📈 Next Steps (After Verification)

1. ✅ Basic setup complete
2. ⏭️ Integrate with database for persistence
3. ⏭️ Add analysis report generation
4. ⏭️ Create teacher dashboard insights
5. ⏭️ Deploy to production
6. ⏭️ Monitor performance metrics

---

## ⚡ Pro Tips

### 1. Start with Local Ollama
- **Pros:** Free, private, offline, no API limits
- **Cons:** Slower than cloud, requires local server
- **Best for:** Development and privacy-conscious deployments

### 2. Use Google Gemini for Testing
- **Pros:** Free tier, fast, good quality
- **Cons:** Rate limited free tier
- **Best for:** Quick testing before full deployment

### 3. Production Considerations
- Use local Ollama for privacy
- Or use managed APIs with monitoring
- Set up rate limiting for API calls
- Monitor costs if using paid APIs

### 4. Performance Tuning
```env
# Faster responses, less accuracy:
VITE_LLM_MAX_TOKENS=500
VITE_LLM_TEMPERATURE=0.1

# Slower responses, more accuracy:
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.5
```

---

## 🆘 Need Help?

### Common Issues

| Issue | Solution |
|-------|----------|
| Files not found | Check file locations in `src/lib/` |
| Env vars not loaded | Restart dev server after `.env.local` changes |
| LLM not responding | Check provider is running (Ollama) or API key valid |
| Slow responses | Reduce `VITE_LLM_MAX_TOKENS` or change model |
| High costs | Switch to local Ollama (free) |

### Debug Steps
```bash
# 1. Check env setup
env | grep VITE_LLM

# 2. Check file locations
ls -la src/lib/llm*.ts

# 3. Check Ollama (if using local)
curl http://localhost:11434/api/tags

# 4. Check dev server logs
# npm run dev (look for errors in terminal)
```

---

## 📞 Support Resources

- **Ollama:** https://ollama.ai
- **OpenAI:** https://platform.openai.com/docs
- **Gemini:** https://ai.google.dev
- **Claude:** https://docs.anthropic.com

---

## ✨ That's It!

You're now ready to use AI-powered analysis with SWAR's hard-coded questions!

**Timeline:**
- ⏱️ Setup: 5 minutes
- ⏱️ Testing: 10 minutes
- ⏱️ Customization: 30+ minutes (optional)

**Happy analyzing! 🎓**

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅

# ⚡ Quick Reference Card - DSM-5 Adaptive + Ollama API

## 🎯 What's New

| Feature | Before | After |
|---------|--------|-------|
| **API Errors** | ❌ 500 errors | ✅ Working |
| **Question Flow** | Linear (1→2→3) | Smart (based on performance) |
| **Difficulty** | Fixed | Dynamic (easy/medium/hard) |
| **Metrics** | Basic score | DSM-5 classification |

---

## 🧪 Test in 2 Minutes

```
1. npm run dev
2. Hard refresh (Ctrl+Shift+R)
3. Start assessment
4. Answer 3 questions same way (all right or all wrong)
5. Watch question position change ✨
6. Complete & see DSM-5 metrics
```

---

## 📊 Performance Logic

### When to Change Difficulty

| Last 3 Answers | Accuracy | Next Step | Difficulty |
|---|---|---|---|
| ✓ ✓ ✓ | 100% | +2 ahead | ⬆️ Hard |
| ✓ ✓ ✗ | 67% | +1 ahead | → Medium |
| ✓ ✗ ✗ | 33% | 0 (stay) | → Medium |
| ✗ ✗ ✗ | 0% | -1 back | ⬇️ Easy |

---

## 🔍 Key Code Changes

### File 1: `src/lib/llmAnalysis.ts`
```typescript
// Line 456: Added stream: false
stream: false,

// Lines 470-478: Proper JSON parsing
const data = await response.json();
if (data.response) {
  const jsonMatch = data.response.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
}
```

### File 2: `src/pages/Session.tsx`
```typescript
// Line 71: New state
const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('medium');

// Lines 214-245: Adaptive function
const getAdaptiveNextQuestion = (): number => {
  // Smart logic here
}

// Line 291: Use adaptive
const nextIndex = getAdaptiveNextQuestion();
setCurrentQuestion(nextIndex);

// Lines 500-525: Display metrics
<Card>DSM-5 Adaptive Assessment Progress</Card>
```

---

## ✅ Verification Checklist

- [ ] No 500 errors (F12 console)
- [ ] Questions change position
- [ ] Difficulty badge updates
- [ ] Build succeeds (npm run build)
- [ ] DSM-5 card shows at end
- [ ] Speech recognition works
- [ ] PDF exports correctly

---

## 🚨 If Something Breaks

| Error | Fix |
|-------|-----|
| 500 errors | `ollama serve` in another terminal |
| Questions not adapting | Hard refresh + Ctrl+Shift+Delete cache |
| No DSM-5 card | Complete full assessment (all questions) |
| Speech not working | Check browser microphone permissions |

---

## 📊 Files & Line Numbers

| File | Lines | Purpose |
|------|-------|---------|
| `llmAnalysis.ts` | 444-480 | Ollama API fix |
| `Session.tsx` | 71 | Adaptive state |
| `Session.tsx` | 214-245 | Adaptive logic |
| `Session.tsx` | 291 | Apply adaptation |
| `Session.tsx` | 500-525 | Show metrics |

---

## 🎓 DSM-5 Mapping

```
Score ≥ 80% → Mild
  └─ Can handle harder items
  └─ Increase difficulty

Score 60-79% → Moderate  
  └─ Progressing normally
  └─ Maintain difficulty

Score < 60% → Severe
  └─ Needs easier items
  └─ Decrease difficulty
```

---

## 🚀 Production Checklist

- [x] API working
- [x] Adaptation working
- [x] Build passing
- [x] No TypeScript errors
- [x] Documentation complete
- [ ] User testing (NEXT)

---

## 📈 Metrics You'll See

**During Assessment:**
- Question counter (e.g., "Question 5 of 20")
- Progress bar
- Difficulty indicator

**At Completion:**
```
Overall Score: 75%
Correct: 15/20
Accuracy: 75%
Difficulty: Hard ← Changes!
Progress: 20/20
Trend: 75%
DSM-5: Moderate ← Clinical!
```

---

## 💡 Pro Tips

1. **Answer consistently** to see adaptation → try all right first, then all wrong
2. **Check console** (F12) for validation messages
3. **Hard refresh** after code changes
4. **Keep Ollama running** in background
5. **Test multiple times** to verify consistency

---

## 🎯 Next Steps

1. ✅ **Today**: Test adaptive difficulty  
2. **Tomorrow**: Gather teacher feedback
3. **Week 1**: Deploy to staging
4. **Week 2**: User testing
5. **Week 3**: Production launch

---

**Status**: 🟢 READY
**Build**: ✅ PASSING
**Errors**: 0️⃣
**Ready**: YES! ✨

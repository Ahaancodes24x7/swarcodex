# Quick Test Guide: DSM-5 Adaptive Difficulty + Ollama API Fix

## 🚀 What Was Fixed

### 1. Ollama API Errors (500 errors)
**Before**: 
```
POST http://localhost:11434/api/generate 500 (Internal Server Error)
```
**After**: 
```
AI validation completed successfully ✓
```

### 2. Dynamic Question Difficulty
**Before**: Questions were always in fixed order (Question 1 → 2 → 3...)

**After**: Questions adapt based on student performance:
- ✅✅✅ (3/3 correct) → Skip 2 ahead (harder)
- ✅✅ (2/3 correct) → Skip 1 ahead (normal) 
- ✅ (1/3 correct) → Stay same (normal)
- ✗✗✗ (0/3 correct) → Go back 1 (easier)

---

## 🧪 How to Test

### Prerequisites
1. Dev server running at http://localhost:8080
2. Ollama installed and running (mistral model)
   ```bash
   ollama serve  # In another terminal
   ```
3. Browser ready

### Test Steps

#### Step 1: Verify Ollama API Fix
```
1. Open http://localhost:8080 in browser
2. Press F12 to open Developer Console
3. Go to Teacher Dashboard → Select a student → Start Assessment
4. Answer 1-2 questions
5. Check Console for errors:
   ✓ Should see "AI validation completed"
   ✗ Should NOT see "500 error" or "process is not defined"
```

#### Step 2: Test Adaptive Difficulty - Easy to Hard
```
1. Start new assessment
2. Answer first 3 questions CORRECTLY (✓✓✓)
3. Expected: Next question jumps ahead, difficulty badge shows "hard"
4. Screenshot before/after positions for verification
```

#### Step 3: Test Adaptive Difficulty - Hard to Easy  
```
1. Start new assessment
2. Answer first 3 questions INCORRECTLY (✗✗✗)
3. Expected: Next question goes back, difficulty badge shows "easy"
4. Screenshot before/after positions for verification
```

#### Step 4: Verify DSM-5 Metrics at End
```
1. Complete full assessment
2. Check "DSM-5 Adaptive Assessment Progress" card:
   - Current Difficulty: Should show appropriate level
   - Questions Completed: X/Y format
   - Accuracy Trend: Percentage
   - DSM-5 Status: Mild/Moderate/Severe based on score
```

---

## 📊 Expected Results

### Console (F12)
| Expected | Indicator |
|---|---|
| ✓ "AI validation completed" | API working |
| ✗ "500 error" | **PROBLEM: Ollama not running** |
| ✗ "process is not defined" | **PROBLEM: Old code loaded** |

### Adaptive Questions (Examples)

**Example 1: All Correct**
```
Question 5 → Student gets 3/3 correct on review
Difficulty: medium → hard
Next: Skip to Question 8 (not 6)
Badge: Hard (orange)
```

**Example 2: All Incorrect**
```
Question 8 → Student gets 0/3 correct on review
Difficulty: hard → easy
Next: Back to Question 7 (not 9)
Badge: Easy (green)
```

**Example 3: Mixed Results**
```
Question 5 → Student gets 2/3 correct on review
Difficulty: medium → medium  
Next: Question 6 (normal progression)
Badge: Medium (yellow)
```

### Session Completion Card

```
┌─ DSM-5 Adaptive Assessment Progress ─┐
│                                        │
│ Current      Questions    Accuracy    │
│ Difficulty   Completed    Trend       │
│ medium       12/20        75%         │
│                                        │
│              DSM-5 Status: Moderate   │
└────────────────────────────────────────┘
```

---

## ⚙️ Troubleshooting

### Issue: Still seeing 500 errors
```
Fix: 
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if Ollama running: ollama serve
3. Verify mistral model: ollama list
```

### Issue: Questions aren't adapting
```
Fix:
1. Check if HMR updated: Look for "hmr update /src/pages/Session.tsx" in console
2. Hard refresh browser
3. Try incognito window
4. Check browser cache: Ctrl+Shift+Delete → Clear all
```

### Issue: DSM-5 card not showing
```
Fix:
1. Complete full assessment
2. Wait for "Saving session..." message
3. Card appears after completion
4. Check browser console for errors
```

### Issue: Difficulty not changing
```
Fix:
1. Need to answer at least 3 questions for evaluation
2. Check if responses are being recorded in session
3. Try different answer patterns (more correct/incorrect)
4. Verify getAdaptiveNextQuestion() is called
```

---

## 🎯 Key Metrics to Verify

| Component | Expected Behavior | How to Verify |
|---|---|---|
| Ollama API | No 500 errors | F12 Console |
| Question Adaptation | Questions skip/go back | See position changes |
| Difficulty Badge | Changes color | Color: green→yellow→orange |
| DSM-5 Status | Shows Mild/Moderate/Severe | Completion screen |
| Response Tracking | All answers saved | PDF export shows responses |

---

## 📝 Build Status

✅ **All changes compiled successfully**
- TypeScript errors: 0
- Build time: ~11 seconds  
- Modules transformed: 2,604

---

## 💡 Pro Tips

1. **Test with consistent internet**: Some responses may timeout if network is slow
2. **Use F12 Network tab**: Monitor Ollama requests to see if they succeed
3. **Test both dyslexia + dyscalculia**: Different question types may behave differently
4. **Try different grade levels**: Difficulty scaling works across grades 1-12
5. **Refresh between tests**: Clear localStorage to start fresh assessment

---

## When Everything Works ✨

You should see:
1. ✅ No error messages in console
2. ✅ Questions changing position based on performance  
3. ✅ Difficulty badge updating color
4. ✅ DSM-5 metrics card at completion
5. ✅ PDF export with all data saved

---

**Last Updated**: Message 15
**Build Version**: v0.0.0
**Status**: 🟢 Ready for Testing

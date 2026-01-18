# 🔍 OLLAMA CONNECTION DEBUGGING

## Step-by-Step Verification

### **1. Verify Ollama is Running**

In PowerShell, run:
```bash
ollama list
```

You should see:
```
NAME      ID              SIZE
mistral   2dfb3e54c59b    4.1GB
```

If nothing shows, Ollama isn't running. Start it:
```bash
ollama serve
```

---

### **2. Verify Model is Available**

```bash
ollama pull mistral
```

Should say: `pulling manifest` or `already pulled`

---

### **3. Check Browser Console for AI Logs**

1. Open: http://localhost:8080
2. Press: **F12** (DevTools)
3. Go to: **Console** tab
4. Take an assessment
5. Look for ONE of these messages:

**✅ SUCCESS** (Ollama working):
```
AI validation completed: { isCorrect: true, confidence: 0.92 }
```

**❌ ERROR** (Ollama not connected):
```
LLM validation error: TypeError: Failed to fetch
Using fallback validation
```

OR

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

---

### **4. Test Ollama Directly**

In PowerShell, test if Ollama responds:

```powershell
# Test basic connection
curl http://localhost:11434/api/tags

# Test with a simple prompt
$body = @{
    model = "mistral"
    prompt = "What is 2+2?"
    stream = $false
} | ConvertTo-Json

curl -Method POST http://localhost:11434/api/generate -Body $body -ContentType "application/json"
```

Should return model info or generate response.

---

## 🚨 Common Issues & Fixes

### **Issue 1: "NET::ERR_CONNECTION_REFUSED"**

**Cause**: Ollama not running

**Fix**:
```bash
ollama serve
```

---

### **Issue 2: "Model not found: mistral"**

**Cause**: Model not downloaded

**Fix**:
```bash
ollama pull mistral
```

---

### **Issue 3: "Using fallback validation" (in console)**

**Cause**: Ollama running but not responding to requests

**Causes**:
1. Ollama service crashed
2. Model didn't load properly
3. Port conflict

**Fix**:
```bash
# Kill and restart Ollama
ollama serve
```

---

### **Issue 4: Speech Recognition Deteriorated**

**Possible cause**: High CPU usage from Ollama

**Fix**:
- Use smaller model: `ollama pull neural-chat`
- Switch to cloud provider (OpenAI/Gemini)
- Reduce `VITE_LLM_MAX_TOKENS` in `.env.local` to 500

---

## 📊 What You Should See in Console

### **When Ollama is Connected:**
```
✓ llmAnalysis.ts:148 - Validating response with LLM
✓ llmAnalysis.ts:156 - LLM returned: { isCorrect: true, confidence: 92 }
✓ Session.tsx:220 - AI validation completed successfully
✓ Displaying AI feedback: "Good job!"
```

### **When Ollama is NOT Connected:**
```
✗ Failed to fetch http://localhost:11434/api/generate
✗ TypeError: Failed to fetch
✗ Falling back to basic validation
```

---

## 🧪 Alternative: Test Without Ollama

If Ollama isn't working, test with **OpenAI**:

1. Get API key: https://platform.openai.com/api-keys

2. Edit `.env.local`:
```env
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-your-actual-key-here
VITE_LLM_MODEL=gpt-3.5-turbo
```

3. Restart dev server: `npm run dev`

4. Try assessment - should work immediately

---

## 📝 Checklist for Working AI

- [ ] `ollama serve` running in terminal (should say "Listening on 127.0.0.1:11434")
- [ ] `ollama list` shows mistral model
- [ ] `.env.local` has `VITE_LLM_PROVIDER=local`
- [ ] Dev server restarted after `.env.local` changes
- [ ] Browser hard refresh: `Ctrl+Shift+R`
- [ ] Console shows "AI validation completed" (not "LLM validation error")
- [ ] Assessment feedback shows confidence score
- [ ] No "Failed to fetch" errors in console

---

## 🎯 Expected Behavior with Ollama

**Before Ollama**:
- Takes assessment
- Gets simple "Correct/Incorrect"
- No confidence score
- No AI feedback

**After Ollama**:
- Takes assessment
- Gets "Correct/Incorrect" + reason
- Shows confidence score (e.g., "92%")
- Shows "AI Analysis" section
- Shows phoneme error rate (if dyslexia assessment)

---

## 🚀 Quick Fix: Restart Everything

If nothing works, restart in this order:

1. **Stop dev server**: Close the terminal or press `Ctrl+C`

2. **Close Ollama**: Close that window or press `Ctrl+C`

3. **Restart Ollama**:
```bash
ollama serve
```

4. **Wait 10 seconds** for Ollama to fully start

5. **Restart dev server** (new terminal):
```bash
cd swarcodex-main
npm run dev
```

6. **Hard refresh browser**: `Ctrl+Shift+R`

7. **Check console**: `F12 → Console tab`

8. **Take assessment**

---

## 📞 Need More Help?

Run this diagnostic command and share the output:

```powershell
# Check Ollama version
ollama --version

# List models
ollama list

# Check if listening
netstat -ano | findstr :11434

# Check running processes
Get-Process ollama -ErrorAction SilentlyContinue
```

---

**Once you see "AI validation completed" in console, Ollama is working! ✅**

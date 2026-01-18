# 🚀 OLLAMA SETUP GUIDE - Enable Dynamic AI Analysis

## What is Ollama?
Ollama allows you to run AI models **locally on your computer** - completely private, free, and fast.

---

## ⚡ Quick Setup (5 minutes)

### **Step 1: Download Ollama**
1. Go to: https://ollama.ai
2. Click **Download**
3. Choose **Windows**
4. Run the installer
5. **Restart your computer**

### **Step 2: Start Ollama Service**
```bash
# Open PowerShell or Command Prompt
ollama serve
```

You should see:
```
Listening on 127.0.0.1:11434
```

**Leave this window open!** (minimize it)

### **Step 3: Pull a Model (New Terminal/PowerShell)**
Open a **new** terminal and run:
```bash
ollama pull mistral
```

This downloads the AI model (~4GB). Takes 2-5 minutes depending on internet speed.

### **Step 4: Verify Installation**
```bash
ollama list
```

Should show:
```
NAME          ID              SIZE
mistral       2dfb3e54c59b    4.1GB
```

---

## ✅ That's It!

Your app at **http://localhost:8080** will now:
- ✅ Connect to Ollama automatically
- ✅ Use AI for smart answer validation
- ✅ Generate better feedback
- ✅ Track confidence scores
- ✅ Adapt difficulty dynamically

---

## 🔄 How to Use

### **Every Time You Want to Use the App:**

**Terminal 1: Start Ollama**
```bash
ollama serve
```

**Terminal 2: Start Dev Server**
```bash
cd swarcodex-main
npm run dev
```

**Browser: Open App**
```
http://localhost:8080
```

---

## 🧪 Verify It's Working

1. Open browser DevTools (F12)
2. Go to Console tab
3. Take an assessment
4. Look for: **"AI validation completed"**

If you see that message, Ollama is connected! ✅

---

## ⚠️ Troubleshooting

### **"Failed to load resource: ...11434/api/generate"**
- Ollama service not running
- Run: `ollama serve` in terminal

### **"Unexpected identifier 'serve'"**
- PowerShell issue
- Use Command Prompt instead
- Or try: `ollama.exe serve`

### **App says "Using fallback validation"**
- Ollama isn't responding
- Check if `ollama serve` is running
- Check if it says "Listening on 127.0.0.1:11434"

### **"File not found: mistral"**
- Model not downloaded
- Run: `ollama pull mistral`
- Wait for download to complete

---

## 🎯 What to Expect

### **Without Ollama:**
```
"Is your answer 'cat'?"
Student: "feline"
Result: ❌ Incorrect
```

### **With Ollama:**
```
"Is your answer 'cat'?"
Student: "feline"
Result: ✅ Correct
AI Feedback: "Great! You correctly identified the animal"
Confidence: 92%
Next Difficulty: Medium
```

---

## 💾 Storage & Performance

- **Model Size**: ~4GB (download once)
- **RAM Usage**: ~500MB when running
- **Response Time**: 2-5 seconds per answer
- **Cost**: FREE

---

## 🔗 Alternative: Cloud Models

If you prefer not to download Ollama, use cloud models instead:

### **OpenAI (Paid, but faster)**
```
1. Get API key: https://platform.openai.com/api-keys
2. Edit .env.local:
   VITE_LLM_PROVIDER=openai
   VITE_LLM_API_KEY=sk-your-key
   VITE_LLM_MODEL=gpt-3.5-turbo
3. Restart app
```

### **Google Gemini (Free tier)**
```
1. Get API key: https://makersuite.google.com/app/apikey
2. Edit .env.local:
   VITE_LLM_PROVIDER=gemini
   VITE_LLM_API_KEY=your-key
   VITE_LLM_MODEL=gemini-pro
3. Restart app
```

---

## ✨ Features Enabled After Ollama Setup

✅ **Semantic Answer Validation** - Understanding meaning, not just string matching
✅ **Confidence Scoring** - AI tells you how sure it is
✅ **Adaptive Difficulty** - Questions adjust to student level
✅ **AI Feedback** - Explanations for every answer
✅ **Learning Patterns** - Track progress over time
✅ **Better Reports** - Detailed analysis with charts

---

## 📚 More Models Available

After setup, try other models:

```bash
ollama pull neural-chat    # Faster, smaller
ollama pull llama2         # Larger, more capable
ollama pull dolphin        # Good for analysis
ollama pull orca-mini      # Fast & efficient
```

Switch model by editing `.env.local`:
```env
VITE_LLM_MODEL=neural-chat
```

---

## 🎓 How Dynamic AI Analysis Works

```
Student Answers Question
    ↓
Speech converted to text
    ↓
Sent to Ollama (LLM)
    ↓
Ollama analyzes semantically:
  - Checks if answer is correct
  - Calculates confidence (0-100%)
  - Generates feedback
  - Suggests next difficulty
    ↓
Better report generated
    ↓
System learns student patterns
```

---

## ✅ Checklist

- [ ] Downloaded Ollama
- [ ] Installed Ollama
- [ ] Ran `ollama serve`
- [ ] Pulled model with `ollama pull mistral`
- [ ] Verified with `ollama list`
- [ ] Dev server running at http://localhost:8080
- [ ] Took an assessment
- [ ] Saw "AI validation completed" in console
- [ ] Got better feedback & analysis!

---

## 🚀 You're Ready!

Ollama is now running your AI system locally. All student data stays on your computer. All assessments use intelligent semantic analysis.

**Start using it now!** 🎓

Questions? Check console (F12) for detailed AI logs.

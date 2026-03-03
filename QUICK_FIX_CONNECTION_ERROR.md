# Quick Fix: "Connection Failed" Error

## Problem
```
❌ Connection failed. Please try again.
```

## Solution (1 Command)

```bash
npm run dev
```

## That's It!

The backend server wasn't running. Now it is. Try registration again! ✅

---

## Detailed Steps (If Needed)

### 1. Open Terminal
- Windows: `Win + R` → type `cmd` → Enter
- Mac: `Cmd + Space` → type `terminal` → Enter
- VS Code: Press `` Ctrl + ` ``

### 2. Go to Project Folder
```bash
cd "D:/neuropath-–-learning-dna-system (1)"
```

### 3. Start Server
```bash
npm run dev
```

### 4. Wait for This:
```
Server running on http://localhost:3000
```

### 5. Try Registration Again
Go to `http://localhost:5173` and register!

---

## Common Issues

### "npm: command not found"
Install Node.js: https://nodejs.org/

### "Port 3000 already in use"
**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Then run `npm run dev` again.

### "Cannot find module"
```bash
npm install
npm run dev
```

---

## Verify It's Working

### Terminal Should Show:
```
✅ Server running on http://localhost:3000
✅ Vite dev server running on http://localhost:5173
```

### Browser Should Show:
```
✅ App loads at localhost:5173
✅ Registration form works
✅ No "Connection failed" error
```

---

## Test Registration Flow

1. Fill in personal info
2. Click "Next: Face Capture"
3. Capture face
4. Click "Complete Registration"
5. See: **"Registration Successful!"** ✅

---

## Summary

**Problem:** Backend server not running
**Solution:** Run `npm run dev`
**Result:** Registration works!

That's all! 🚀

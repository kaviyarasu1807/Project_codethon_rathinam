# Quick Start - Fix "Connection Failed"

## 🚨 The Problem

Your login shows "Connection failed" because the backend server is not running.

## ⚡ Quick Fix (2 Minutes)

### Step 1: Update MongoDB Password

Open `.env` file and change this line:

**BEFORE:**
```
DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

**AFTER:**
```
DATABASE_URL=mongodb+srv://kavi:YourRealPassword@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

Replace `YourRealPassword` with your actual MongoDB password!

**Don't have password?**
1. Go to https://cloud.mongodb.com/
2. Database Access → Edit user "kavi" → Edit Password
3. Set new password, write it down!

### Step 2: Start Backend Server

Open terminal and run:
```bash
npm run dev:mongodb
```

Wait for:
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

### Step 3: Start Frontend

Open ANOTHER terminal and run:
```bash
npm run dev
```

Wait for:
```
➜  Local:   http://localhost:3000/
```

### Step 4: Test

Open browser: http://localhost:3000

Try login - should work now! ✅

---

## 📊 Your Server Setup

You need 3 terminals running:

```
┌─────────────────────────────────────────────────────────┐
│ Terminal 1: Backend (MongoDB)                           │
│ Command: npm run dev:mongodb                            │
│ Port: 5000                                              │
│ Status: ✅ MongoDB Connected Successfully               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Terminal 2: Frontend                                    │
│ Command: npm run dev                                    │
│ Port: 3000                                              │
│ Status: ✅ VITE ready                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Terminal 3: ML Server (Optional)                        │
│ Command: cd ml-model && python ml_api_server.py        │
│ Port: 5001                                              │
│ Status: ✅ Running on http://0.0.0.0:5001               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Quick Checks

### Is Backend Running?
```bash
curl http://localhost:5000/api/admin/videos
```
✅ Should return JSON  
❌ If error, backend not running

### Is Frontend Running?
Open: http://localhost:3000  
✅ Should see login page  
❌ If blank, frontend not running

### Is MongoDB Connected?
Check Terminal 1 for:
```
✅ MongoDB Connected Successfully
```
❌ If you see "MongoDB Connection Failed", password is wrong

---

## 🐛 Troubleshooting

### "MongoDB Connection Failed"
→ Update password in `.env` file  
→ Save file (Ctrl+S)  
→ Restart: `Ctrl+C` then `npm run dev:mongodb`

### "Port 5000 already in use"
→ Kill process: `taskkill /PID XXXX /F`  
→ Restart: `npm run dev:mongodb`

### Still "Connection failed"
→ Check all 3 boxes:
- [ ] Backend running (Terminal 1)
- [ ] Frontend running (Terminal 2)
- [ ] MongoDB connected (see ✅ in Terminal 1)

---

## 📝 Checklist

Before testing login:

- [ ] Updated `.env` with real MongoDB password
- [ ] Saved `.env` file (Ctrl+S)
- [ ] Started backend: `npm run dev:mongodb`
- [ ] See "✅ MongoDB Connected Successfully"
- [ ] Started frontend: `npm run dev`
- [ ] See "VITE ready"
- [ ] Opened http://localhost:3000
- [ ] Login page loads (no "Connection failed")

---

## 🎯 Summary

**Problem:** Backend not running → "Connection failed"  
**Fix:** Update `.env` password → Start servers  
**Result:** Login works! ✅

**Commands:**
```bash
# Terminal 1
npm run dev:mongodb

# Terminal 2
npm run dev
```

**Test:** http://localhost:3000

---

**Need detailed help?** Read `FIX_CONNECTION_FAILED.md`

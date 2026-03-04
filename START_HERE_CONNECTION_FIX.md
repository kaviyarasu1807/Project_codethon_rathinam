# 🚀 START HERE - Fix "Connection Failed"

## What's Wrong?

Your login page shows **"Connection failed"** because:
- ❌ Backend server is NOT running
- ❌ MongoDB password is NOT set in `.env` file

## Fix It Now (3 Steps)

### 📝 Step 1: Set MongoDB Password

1. **Open `.env` file** in your project root
2. **Find this line:**
   ```
   DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0...
   ```
3. **Replace `<db_password>` with your real password:**
   ```
   DATABASE_URL=mongodb+srv://kavi:MyActualPassword@cluster0...
   ```
4. **Save the file** (Ctrl+S)

**Don't know your password?**
- Go to: https://cloud.mongodb.com/
- Click: Database Access → Edit user "kavi" → Edit Password
- Set a new password (write it down!)

### 🖥️ Step 2: Start Backend Server

**Open a NEW terminal** and run:
```bash
npm run dev:mongodb
```

**Wait for this message:**
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

**If you see "MongoDB Connection Failed":**
- Go back to Step 1
- Make sure you replaced `<db_password>` with actual password
- Make sure you saved the file
- Try again

### 🌐 Step 3: Start Frontend

**Open ANOTHER terminal** and run:
```bash
npm run dev
```

**Wait for this message:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

### ✅ Test It!

1. Open browser: **http://localhost:3000**
2. You should see the login page
3. Try to login
4. **"Connection failed" should be GONE!** ✅

---

## Your Running Servers

After following the steps, you should have:

### ✅ Terminal 1: Backend (Port 5000)
```bash
npm run dev:mongodb
```
Shows: `✅ MongoDB Connected Successfully`

### ✅ Terminal 2: Frontend (Port 3000)
```bash
npm run dev
```
Shows: `VITE ready`

### ✅ Terminal 3: ML Server (Port 5001) - Already Running!
```bash
cd ml-model
python ml_api_server.py
```
Shows: `Running on http://0.0.0.0:5001`

---

## Quick Verification

### Check 1: Backend Running?
```bash
curl http://localhost:5000/api/admin/videos
```
✅ Should return JSON data  
❌ If error → Backend not running

### Check 2: Frontend Running?
Open: http://localhost:3000  
✅ Should see login page  
❌ If blank → Frontend not running

### Check 3: MongoDB Connected?
Look at Terminal 1:  
✅ Should see "MongoDB Connected Successfully"  
❌ If "Connection Failed" → Wrong password in .env

---

## Common Issues

### Issue: "MongoDB Connection Failed"

**Cause:** Password in `.env` is wrong or not set

**Fix:**
1. Open `.env` file
2. Check `DATABASE_URL` line
3. Make sure `<db_password>` is replaced
4. No `<` or `>` brackets
5. No spaces
6. Save file (Ctrl+S)
7. Restart: Press `Ctrl+C` in Terminal 1, then run `npm run dev:mongodb` again

### Issue: "Port 5000 already in use"

**Fix:**
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it (replace XXXX with the PID number)
taskkill /PID XXXX /F

# Start again
npm run dev:mongodb
```

### Issue: Still seeing "Connection failed"

**Check ALL of these:**
- [ ] Did you update `.env` with real password?
- [ ] Did you save the `.env` file?
- [ ] Is Terminal 1 showing "MongoDB Connected Successfully"?
- [ ] Is Terminal 2 showing "VITE ready"?
- [ ] Did you restart backend after changing `.env`?

---

## Example: Correct .env File

```env
# MongoDB Connection
DATABASE_URL=mongodb+srv://kavi:MyPassword123@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
DATABASE_NAME=neuropath_learning_dna

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Key points:**
- ✅ Real password (not `<db_password>`)
- ✅ No brackets `<` `>`
- ✅ No spaces

---

## Visual Guide

```
┌─────────────────────────────────────────────────────┐
│ 1. Update .env file                                 │
│    Replace: <db_password>                           │
│    With: YourActualPassword                         │
│    Save: Ctrl+S                                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. Terminal 1: Start Backend                        │
│    Command: npm run dev:mongodb                     │
│    Wait for: ✅ MongoDB Connected Successfully      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Terminal 2: Start Frontend                       │
│    Command: npm run dev                             │
│    Wait for: VITE ready                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. Test in Browser                                  │
│    Open: http://localhost:3000                      │
│    Result: Login works! No "Connection failed" ✅   │
└─────────────────────────────────────────────────────┘
```

---

## Summary

**Problem:** Backend not running → "Connection failed"  
**Cause:** MongoDB password not set in `.env`  
**Solution:**
1. Update `.env` with real password
2. Start backend: `npm run dev:mongodb`
3. Start frontend: `npm run dev`

**Result:** Login works! ✅

---

## Need More Help?

- **Detailed guide:** Read `FIX_CONNECTION_FAILED.md`
- **Quick reference:** Read `QUICK_START_SERVERS.md`
- **MongoDB password help:** Read `FIX_VIDEO_UPLOAD_ERROR.md`

---

**Ready? Start with Step 1 above! ⬆️**

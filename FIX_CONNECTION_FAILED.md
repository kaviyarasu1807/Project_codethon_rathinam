# Fix "Connection Failed" Error - Complete Guide

## The Problem

You're seeing "Connection failed" on the login page because:
1. The backend server (port 5000) is not running
2. The `.env` file still has `<db_password>` placeholder instead of your real MongoDB password

## Quick Fix (3 Steps)

### Step 1: Update MongoDB Password in .env

1. Open the `.env` file in your project root
2. Find this line:
   ```
   DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
   ```
3. Replace `<db_password>` with your actual MongoDB password
4. Example (if your password is `MyPass123`):
   ```
   DATABASE_URL=mongodb+srv://kavi:MyPass123@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
   ```
5. Save the file (Ctrl+S)

**Don't have the password?**
- Go to https://cloud.mongodb.com/
- Login → Database Access → Edit user "kavi" → Edit Password
- Set a new password and write it down!

### Step 2: Start MongoDB Backend Server

Open a terminal and run:
```bash
npm run dev:mongodb
```

Wait for:
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

**If you see "MongoDB Connection Failed":**
- Check that you updated the password in Step 1
- Make sure you saved the .env file
- Restart the terminal and try again

### Step 3: Start Frontend

Open ANOTHER terminal and run:
```bash
npm run dev
```

Wait for:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

## Test the Fix

1. Open browser: http://localhost:3000
2. Try to login with:
   - Email: `kaviyarasur013@gmailcom`
   - Password: (your password)
3. Should NOT see "Connection failed" anymore!

## Your 3 Servers Should Be Running

You need 3 terminals running simultaneously:

### Terminal 1: Frontend (Port 3000)
```bash
npm run dev
```
Status: ✅ Should show "VITE ready"

### Terminal 2: MongoDB Backend (Port 5000)
```bash
npm run dev:mongodb
```
Status: ✅ Should show "MongoDB Connected Successfully"

### Terminal 3: ML Server (Port 5001)
```bash
cd ml-model
python ml_api_server.py
```
Status: ✅ Should show "Running on http://0.0.0.0:5001"

## Troubleshooting

### Issue 1: "MongoDB Connection Failed"

**Cause:** Password not set or incorrect in .env

**Solution:**
1. Open `.env` file
2. Check `DATABASE_URL` line
3. Make sure `<db_password>` is replaced with actual password
4. No `<` or `>` brackets
5. No spaces
6. Save file
7. Restart server: `Ctrl+C` then `npm run dev:mongodb`

### Issue 2: "Port 5000 is already in use"

**Cause:** Another process is using port 5000

**Solution:**
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it (replace XXXX with PID from above)
taskkill /PID XXXX /F

# Restart server
npm run dev:mongodb
```

### Issue 3: Still seeing "Connection failed"

**Check these:**
- [ ] Is backend server running? (Terminal 2 should show "Server running on http://localhost:5000")
- [ ] Is MongoDB connected? (Should see "✅ MongoDB Connected Successfully")
- [ ] Is frontend running? (Terminal 1 should show "VITE ready")
- [ ] Did you save the .env file after editing?
- [ ] Did you restart the backend server after changing .env?

### Issue 4: "Cannot find module"

**Solution:**
```bash
npm install
```

Then restart servers.

### Issue 5: Frontend shows blank page

**Solution:**
```bash
# Clear cache and restart
Ctrl+C
npm run dev
```

## Verify Servers Are Running

### Check Backend (Port 5000)
```bash
curl http://localhost:5000/api/admin/videos
```

Should return JSON (not error).

### Check Frontend (Port 3000)
Open browser: http://localhost:3000

Should see login page (not blank).

### Check ML Server (Port 5001)
```bash
curl http://localhost:5001/health
```

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

## Common Mistakes

### Mistake 1: Didn't replace password
```
❌ DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0...
✅ DATABASE_URL=mongodb+srv://kavi:YourActualPassword@cluster0...
```

### Mistake 2: Left brackets
```
❌ DATABASE_URL=mongodb+srv://kavi:<MyPassword>@cluster0...
✅ DATABASE_URL=mongodb+srv://kavi:MyPassword@cluster0...
```

### Mistake 3: Added spaces
```
❌ DATABASE_URL=mongodb+srv://kavi: MyPassword @cluster0...
✅ DATABASE_URL=mongodb+srv://kavi:MyPassword@cluster0...
```

### Mistake 4: Didn't save .env file
After editing, press **Ctrl+S** to save!

### Mistake 5: Didn't restart server
After changing .env, you MUST restart:
```bash
Ctrl+C
npm run dev:mongodb
```

## Step-by-Step Checklist

- [ ] 1. Open `.env` file
- [ ] 2. Find `DATABASE_URL` line
- [ ] 3. Replace `<db_password>` with actual password
- [ ] 4. Remove `<` and `>` brackets
- [ ] 5. Save file (Ctrl+S)
- [ ] 6. Open Terminal 1: `npm run dev:mongodb`
- [ ] 7. Wait for "✅ MongoDB Connected Successfully"
- [ ] 8. Open Terminal 2: `npm run dev`
- [ ] 9. Wait for "VITE ready"
- [ ] 10. Open browser: http://localhost:3000
- [ ] 11. Try login - should work!

## What Each Server Does

### Frontend (Port 3000)
- Serves the React app
- Login page, dashboard, etc.
- Connects to backend on port 5000

### Backend (Port 5000)
- Handles API requests
- Connects to MongoDB
- Manages authentication, data, etc.

### ML Server (Port 5001)
- Provides ML predictions
- Cognitive twin analysis
- Learning recommendations

## Quick Commands

### Start All Servers

**Terminal 1:**
```bash
npm run dev:mongodb
```

**Terminal 2:**
```bash
npm run dev
```

**Terminal 3:**
```bash
cd ml-model
python ml_api_server.py
```

### Stop All Servers

Press `Ctrl+C` in each terminal.

### Restart Backend Only

```bash
# In Terminal 1
Ctrl+C
npm run dev:mongodb
```

## Summary

**Problem:** Backend server not running because MongoDB password not set  
**Solution:** Update `.env` with real password, restart backend server  
**Result:** Login works, no more "Connection failed"! ✅

## Next Steps

1. **Update .env** with MongoDB password
2. **Start backend**: `npm run dev:mongodb`
3. **Start frontend**: `npm run dev`
4. **Test login** at http://localhost:3000

The "Connection failed" error will be fixed! 🎉

---

**Need help getting MongoDB password?**
See: `FIX_VIDEO_UPLOAD_ERROR.md` for detailed MongoDB Atlas instructions.

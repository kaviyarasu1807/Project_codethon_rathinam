# Fix Registration "Connection Failed" - Step by Step

## Current Problem
```
❌ Connection failed. Please try again.
```

## Root Cause
**Backend server is not running!**

## Fix (3 Simple Steps)

### Step 1: Open Terminal
- **Windows:** Press `Win + R`, type `cmd`, press Enter
- **Mac:** Press `Cmd + Space`, type `terminal`, press Enter
- **VS Code:** Press `` Ctrl + ` `` (backtick)

### Step 2: Navigate to Project Folder
```bash
cd D:/neuropath-–-learning-dna-system (1)
```
(Or wherever your project is located)

### Step 3: Start the Server
```bash
npm run dev
```

## What You'll See

### Terminal Output:
```
> react-example@0.0.0 dev
> tsx server.ts

Database initialized
Server running on http://localhost:3000

  VITE v6.2.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Browser:
- Automatically opens to `http://localhost:5173`
- Or manually open browser and go to that URL

## Now Test Registration

### 1. Fill Personal Info
```
Name: John Doe
Email: john@example.com
Password: password123
Role: Student
Domain: Engineering
Department: Computer Science
Mobile: +1234567890
College: Tech University
Address: 123 Main St
```

### 2. Click "Next: Face Capture"
- Camera will start automatically
- You'll see live video feed

### 3. Capture Face
- Click "Capture Face" button
- Green checkmark appears
- "Face Captured Successfully!" message

### 4. Complete Registration
- Click "Complete Registration"
- Button shows "Completing Registration..." with spinner
- Wait 1-2 seconds

### 5. Success!
```
✅ Registration Successful!
   You can now sign in to your account.
   
   [Go to Login]
```

## Troubleshooting

### Problem: "npm: command not found"
**Solution:** Install Node.js
1. Go to https://nodejs.org/
2. Download LTS version
3. Install
4. Restart terminal
5. Try again: `npm run dev`

### Problem: "Port 3000 already in use"
**Solution:** Kill existing process

**Windows:**
```bash
netstat -ano | findstr :3000
# Note the PID (last column)
taskkill /PID <PID> /F
npm run dev
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Problem: "Cannot find module 'tsx'"
**Solution:** Install dependencies
```bash
npm install
npm run dev
```

### Problem: "Database is locked"
**Solution:** Close other instances
1. Close all terminals
2. Open new terminal
3. Run: `npm run dev`

### Problem: Still getting "Connection failed"
**Solution:** Check if server is actually running

**Test 1:** Check terminal
- Should see "Server running on http://localhost:3000"
- Should NOT see any errors

**Test 2:** Test endpoint
```bash
curl http://localhost:3000/api/register
```
Should get response (even if error about missing fields)

**Test 3:** Check browser console
- Press F12
- Go to Console tab
- Look for errors
- Should see POST request to /api/register

## Visual Flow

```
┌─────────────────────────────────────┐
│  1. Open Terminal                   │
│     cd to project folder            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Run: npm run dev                │
│     Wait for "Server running..."    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Open Browser                    │
│     Go to localhost:5173            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Register                        │
│     Fill form → Capture face        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Complete Registration           │
│     ✅ Success!                     │
└─────────────────────────────────────┘
```

## Verification Checklist

Before trying registration:
- [ ] Terminal is open
- [ ] In correct project directory
- [ ] Ran `npm run dev`
- [ ] See "Server running on http://localhost:3000"
- [ ] Browser open to http://localhost:5173
- [ ] No errors in terminal

After registration:
- [ ] No "Connection failed" error
- [ ] See "Completing Registration..." spinner
- [ ] See "Registration Successful!" screen
- [ ] Can click "Go to Login"
- [ ] Can log in with credentials

## Quick Reference

### Start Server
```bash
npm run dev
```

### Stop Server
Press `Ctrl + C` in terminal

### Restart Server
```bash
# Press Ctrl + C to stop
npm run dev
```

### Check if Running
```bash
curl http://localhost:3000/api/register
```

### View Database
```bash
sqlite3 neuropath.db "SELECT * FROM students;"
```

## Expected Terminal Output

### When Starting:
```
> react-example@0.0.0 dev
> tsx server.ts

Database initialized
Server running on http://localhost:3000
```

### When Registration Succeeds:
```
POST /api/register 200 45ms
```

### When Registration Fails:
```
POST /api/register 400 12ms
Email already exists
```

## Success Indicators

✅ Terminal shows "Server running"
✅ Browser loads app
✅ Registration form works
✅ Face capture works
✅ "Complete Registration" works
✅ See success screen
✅ Can navigate to login

## Still Having Issues?

### Check 1: Node.js Version
```bash
node --version
```
Should be v18 or higher

### Check 2: NPM Version
```bash
npm --version
```
Should be v9 or higher

### Check 3: Dependencies
```bash
npm list express better-sqlite3 tsx
```
All should be installed

### Check 4: Database File
```bash
ls -la neuropath.db
```
Should exist in project root

### Check 5: Server File
```bash
ls -la server.ts
```
Should exist in project root

## Summary

**The Fix:**
1. Open terminal
2. Run `npm run dev`
3. Try registration again

**That's it!** 🎉

The "Connection failed" error happens because the backend server isn't running. Starting it with `npm run dev` fixes everything.

---

**Need Help?**
- Check terminal for errors
- Check browser console (F12)
- Make sure you're in the right directory
- Make sure Node.js is installed
- Make sure dependencies are installed (`npm install`)

**Quick Test:**
```bash
# In project directory
npm run dev

# Should see:
# Server running on http://localhost:3000
```

If you see that, registration will work! ✅

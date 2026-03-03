# Fix "Connection Failed" Error - Registration

## Problem
When clicking "Complete Registration", you see: **"Connection failed. Please try again."**

## Root Cause
The backend server is not running, so the frontend cannot connect to the `/api/register` endpoint.

## Solution

### Step 1: Start the Backend Server

Open a terminal in your project directory and run:

```bash
npm run dev
```

This command starts both:
- **Backend server** on `http://localhost:3000`
- **Frontend dev server** (Vite) on `http://localhost:5173`

### Step 2: Verify Server is Running

You should see output like:
```
Server running on http://localhost:3000
Vite dev server running on http://localhost:5173
```

### Step 3: Test Registration

1. Open your browser to `http://localhost:5173`
2. Go to registration page
3. Fill in personal information
4. Click "Next: Face Capture"
5. Capture your face
6. Click "Complete Registration"
7. Should now work! ✅

## Alternative: Check if Server is Already Running

If you get an error like "Port 3000 is already in use":

### Windows:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Then start server again
npm run dev
```

### Mac/Linux:
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Then start server again
npm run dev
```

## Verify Backend is Working

### Test 1: Check Server Health
Open browser to: `http://localhost:3000`

You should see the Vite app or a response (not an error).

### Test 2: Test Registration Endpoint
Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "domain": "Engineering",
    "department": "Computer Science"
  }'
```

Expected response:
```json
{
  "success": true,
  "userId": 1
}
```

## Common Issues

### Issue 1: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue 2: "tsx: command not found"
**Solution:** 
```bash
npm install
```

### Issue 3: Port 3000 already in use
**Solution:** Kill the process using port 3000 (see above)

### Issue 4: Database error
**Solution:** 
```bash
# Delete old database
rm neuropath.db

# Restart server (will recreate database)
npm run dev
```

### Issue 5: Module not found errors
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Quick Start Checklist

- [ ] Node.js installed (v18 or higher)
- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm run dev`)
- [ ] Browser open to `http://localhost:5173`
- [ ] No port conflicts
- [ ] Database file exists (`neuropath.db`)

## Testing the Full Flow

### 1. Start Server
```bash
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173`

### 3. Register New Student
- Fill in all fields
- Click "Next: Face Capture"
- Capture face
- Click "Complete Registration"
- Should see: "Registration Successful!" ✅

### 4. Verify in Database
```bash
# Install sqlite3 if needed
npm install -g sqlite3

# Query database
sqlite3 neuropath.db "SELECT * FROM students;"
```

You should see your registered user!

## Server Logs

When registration works, you'll see in terminal:
```
POST /api/register 200 - 45ms
```

When it fails, you'll see:
```
POST /api/register 400 - 12ms
```
or no log at all (server not running).

## Environment Variables

Check if you need any environment variables:

### Create .env file (if needed)
```bash
# Copy example
cp .env.example .env

# Edit .env and add your values
```

### Common variables:
```env
PORT=3000
DATABASE_URL=./neuropath.db
NODE_ENV=development
```

## Production Deployment

When deploying to production:

### 1. Build Frontend
```bash
npm run build
```

### 2. Start Production Server
```bash
NODE_ENV=production node server.ts
```

### 3. Update API URL
In production, update the fetch URL in `App.tsx`:
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:3000/api';

const res = await fetch(`${API_URL}/register`, {...});
```

## Debugging Tips

### 1. Check Browser Console
Press F12 → Console tab
Look for errors like:
- `Failed to fetch`
- `Network error`
- `CORS error`

### 2. Check Network Tab
Press F12 → Network tab
Look for the `/api/register` request:
- Status: Should be 200 (success) or 400 (validation error)
- Response: Check the JSON response

### 3. Check Server Logs
Look at terminal where server is running:
- Should see POST requests
- Should see any errors

### 4. Test with curl
```bash
# Test if server is responding
curl http://localhost:3000/api/register

# Should get error about missing fields (but proves server is running)
```

## Summary

**Most Common Fix:**
```bash
# Just start the server!
npm run dev
```

Then test registration again. It should work! ✅

## Still Not Working?

If you still see "Connection failed" after starting the server:

### Check 1: Correct Port
Verify frontend is calling the right port:
```typescript
// In App.tsx, the fetch should be:
fetch('/api/register', {...})  // Vite proxy handles this
// OR
fetch('http://localhost:3000/api/register', {...})  // Direct call
```

### Check 2: CORS Issues
If calling from different port, you might need CORS:
```typescript
// In server.ts, add:
import cors from 'cors';
app.use(cors());
```

### Check 3: Firewall
Disable firewall temporarily to test:
```bash
# Windows
netsh advfirewall set allprofiles state off

# Mac
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

## Success Indicators

When everything works:
1. ✅ Server starts without errors
2. ✅ Browser loads app at localhost:5173
3. ✅ Registration form submits successfully
4. ✅ "Registration Successful!" screen appears
5. ✅ Can click "Go to Login"
6. ✅ Can log in with new credentials

---

**Quick Fix:** Just run `npm run dev` and try again! 🚀

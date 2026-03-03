# Server Status Check

## Quick Diagnosis

Your 500 error means the MongoDB server either:
1. Crashed
2. Lost connection to MongoDB
3. Isn't running

## Check Server Status

### Step 1: Check if server is running

Look at the terminal where you ran `npm run dev:mongodb`

**If you see errors**, the server crashed. Common errors:
- MongoDB connection lost
- Port already in use
- Syntax error in code

**If terminal is closed**, the server stopped. Restart it:
```bash
npm run dev:mongodb
```

### Step 2: Check MongoDB Connection

In the server terminal, you should see:
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

**If you see:**
```
⚠️  MongoDB Connection Failed
```

Then MongoDB disconnected. This happens if:
- Internet connection dropped
- MongoDB Atlas cluster paused
- IP whitelist changed
- Password changed

### Step 3: Restart Server

1. Go to terminal with `npm run dev:mongodb`
2. Press `Ctrl+C` to stop
3. Run again: `npm run dev:mongodb`
4. Wait for success message

### Step 4: Test Connection

```bash
curl http://localhost:5000/api/admin/videos
```

Should return:
```json
{
  "success": true,
  "videos": [...],
  "total": 0
}
```

## Common Issues

### Issue 1: Server Not Running

**Symptom:** Terminal is closed or shows no output

**Fix:**
```bash
npm run dev:mongodb
```

### Issue 2: MongoDB Connection Lost

**Symptom:** Server shows "MongoDB Connection Failed"

**Fix:**
1. Check internet connection
2. Check MongoDB Atlas cluster is running (not paused)
3. Verify IP is whitelisted (0.0.0.0/0)
4. Restart server

### Issue 3: Port Already in Use

**Symptom:** Error: "Port 5000 is already in use"

**Fix:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Then restart
npm run dev:mongodb
```

### Issue 4: Code Error

**Symptom:** Server crashes with error message

**Fix:**
1. Read the error message
2. Check if any files were recently modified
3. Restart server
4. If error persists, check server-mongodb.ts for syntax errors

## Quick Fix Checklist

- [ ] Server terminal is open and running
- [ ] See "✅ MongoDB Connected Successfully"
- [ ] No error messages in terminal
- [ ] Can access http://localhost:5000/api/admin/videos
- [ ] Frontend is running on http://localhost:3000
- [ ] Both terminals are active

## Restart Everything

If nothing works, restart everything:

### Terminal 1: Stop and restart MongoDB server
```bash
# Press Ctrl+C
npm run dev:mongodb
```

### Terminal 2: Stop and restart frontend
```bash
# Press Ctrl+C
npm run dev
```

Wait for both to start successfully.

## Check Logs

Look at the MongoDB server terminal for error messages. Common errors:

**Authentication Failed:**
```
MongoServerError: Authentication failed
```
Fix: Check password in .env file

**Connection Timeout:**
```
MongoServerError: Connection timeout
```
Fix: Check internet, IP whitelist, cluster status

**Port in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Fix: Kill process on port 5000 and restart

## Test After Restart

1. Server shows success message
2. Test API: `curl http://localhost:5000/api/admin/videos`
3. Open browser: http://localhost:3000
4. Login as admin
5. Go to Video Suggestions
6. Try adding a video

## Still Not Working?

If server keeps crashing:

1. **Check .env file** - Make sure password is correct
2. **Check MongoDB Atlas** - Cluster should be running (green status)
3. **Check IP whitelist** - Should have 0.0.0.0/0
4. **Check internet** - Must be connected
5. **Check server logs** - Read error messages carefully

## Get Help

If you're stuck:
1. Copy the EXACT error message from server terminal
2. Check which line number the error is on
3. Look at that file and line
4. The error message usually tells you what's wrong

---

**Most likely fix: Just restart the MongoDB server!**

```bash
npm run dev:mongodb
```

# Complete Video Upload Solution

## Problem Summary

You're getting 500 errors when trying to add videos. Here's the complete solution.

## Root Cause

The MongoDB server is either:
1. Not running
2. Not connected to MongoDB Atlas
3. Password in .env is incorrect

## Complete Fix (Step by Step)

### STEP 1: Fix MongoDB Password

1. Open your `.env` file
2. Check the DATABASE_URL line
3. If it has `<db_password>`, replace it with your actual password

**Get your password:**
- Go to https://cloud.mongodb.com/
- Click "Database Access"
- Click "Edit" on user "kavi"
- Click "Edit Password"
- Click "Autogenerate Secure Password"
- COPY the password
- Click "Update User"

**Update .env:**
```env
# Before
DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0.pfapz1p.mongodb.net/?appName=Cluster0

# After (use YOUR password)
DATABASE_URL=mongodb+srv://kavi:YourActualPassword123@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

### STEP 2: Whitelist Your IP

1. Go to https://cloud.mongodb.com/
2. Click "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere"
5. Enter: `0.0.0.0/0`
6. Click "Confirm"
7. Wait 1-2 minutes

### STEP 3: Install Required Packages

```bash
npm install multer @types/multer
```

### STEP 4: Create Upload Directories

```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path uploads/videos
New-Item -ItemType Directory -Force -Path uploads/thumbnails

# Or Git Bash / Linux
mkdir -p uploads/videos uploads/thumbnails
```

### STEP 5: Restart MongoDB Server

```bash
# Stop current server (Ctrl+C)
npm run dev:mongodb
```

**Wait for:**
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

### STEP 6: Restart Frontend

```bash
# In another terminal
# Stop current (Ctrl+C)
npm run dev
```

### STEP 7: Test Video Upload

1. Open http://localhost:3000
2. Login as admin
3. Go to "Video Suggestions" tab
4. Click "Add Video"
5. Fill in the form:
   - Title: Test Video
   - Description: This is a test
   - Video URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   - Difficulty: beginner
   - Domain: Computer Science
   - Concepts: testing, demo
   - Tags: test
6. Click "Add Video"

**Success:** You should see "Video added successfully!"

## Troubleshooting

### Error: "500 Internal Server Error"

**Cause:** MongoDB not connected

**Fix:**
1. Check server terminal for errors
2. Verify password in .env is correct
3. Check IP is whitelisted
4. Restart server

### Error: "Failed to execute 'json' on 'Response'"

**Cause:** Server returned empty response (crashed)

**Fix:**
1. Check server terminal for crash errors
2. Restart server: `npm run dev:mongodb`
3. Check MongoDB connection message

### Error: "Authentication failed"

**Cause:** Wrong password in .env

**Fix:**
1. Get new password from MongoDB Atlas
2. Update .env file
3. Restart server

### Error: "Connection timeout"

**Cause:** IP not whitelisted or internet issue

**Fix:**
1. Check internet connection
2. Whitelist 0.0.0.0/0 in MongoDB Atlas
3. Wait 1-2 minutes
4. Restart server

### Error: "Port 5000 already in use"

**Cause:** Another process using port 5000

**Fix:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Then restart
npm run dev:mongodb
```

## Verify Everything Works

### Test 1: Check Server
```bash
curl http://localhost:5000/api/admin/videos
```

Should return:
```json
{
  "success": true,
  "videos": [],
  "total": 0
}
```

### Test 2: Check Frontend
- Open http://localhost:3000
- Should load without errors
- Login should work

### Test 3: Add Video
- Go to Video Suggestions
- Click "Add Video"
- Fill form
- Submit
- Should see success message

## Complete Checklist

Before trying to upload:

- [ ] .env file has real password (not `<db_password>`)
- [ ] IP whitelisted in MongoDB Atlas (0.0.0.0/0)
- [ ] MongoDB cluster is running (not paused)
- [ ] multer package installed
- [ ] uploads/videos directory exists
- [ ] uploads/thumbnails directory exists
- [ ] MongoDB server running (Terminal 1)
- [ ] See "✅ MongoDB Connected Successfully"
- [ ] Frontend running (Terminal 2)
- [ ] No errors in either terminal
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/api/admin/videos

## If Still Not Working

### Check Server Logs

Look at the MongoDB server terminal. Common errors:

**1. MongoDB Connection Failed**
```
⚠️  MongoDB Connection Failed
```
→ Fix password in .env

**2. Authentication Error**
```
MongoServerError: Authentication failed
```
→ Password is wrong, update .env

**3. Network Error**
```
MongoServerError: Connection timeout
```
→ Check internet, whitelist IP

**4. Port Error**
```
Error: listen EADDRINUSE
```
→ Kill process on port 5000

### Get Detailed Error

If server crashes, you'll see an error message. Read it carefully:
- It tells you what's wrong
- Shows which file has the error
- Shows the line number

## Alternative: Use YouTube Links Only

If video file upload is too complex, you can just use YouTube links:

1. Skip multer installation
2. Skip directory creation
3. Just use YouTube URLs in the form
4. Thumbnails auto-generate from YouTube

This is simpler and works immediately once MongoDB is connected.

## Success Indicators

When everything works:

**Server Terminal:**
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

**Frontend:**
- No errors in browser console
- Can login
- Can see Video Suggestions tab
- Can click "Add Video"
- Form appears
- Can submit successfully
- See success message
- Video appears in list

## Quick Commands Reference

```bash
# Check if server is running
curl http://localhost:5000/api/admin/videos

# Kill process on port 5000 (Windows)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Start MongoDB server
npm run dev:mongodb

# Start frontend
npm run dev

# Install multer
npm install multer @types/multer

# Create directories (Windows)
New-Item -ItemType Directory -Force -Path uploads/videos
New-Item -ItemType Directory -Force -Path uploads/thumbnails

# Create directories (Linux/Mac)
mkdir -p uploads/videos uploads/thumbnails
```

## Final Notes

The video upload feature has two parts:

1. **YouTube Links** (Working now)
   - Just paste YouTube URL
   - Thumbnail auto-generates
   - No file upload needed

2. **File Upload** (Optional)
   - Requires multer
   - Requires upload directories
   - Can upload actual video files
   - See VIDEO_UPLOAD_API_GUIDE.md

For now, focus on getting YouTube links working. Once that works, you can add file upload later.

---

**Most Important:** Make sure MongoDB server is running and connected before trying to add videos!

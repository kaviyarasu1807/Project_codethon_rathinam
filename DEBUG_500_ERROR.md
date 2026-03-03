# Debug 500 Internal Server Error

## What's Happening

You're getting a 500 error when trying to add a video. This means the server is crashing when processing your request.

## Step 1: Check Server Terminal

Look at the terminal window where you ran `npm run dev:mongodb`. You should see detailed error logs.

### What to Look For:

```
📥 POST /api/admin/videos - Request received
Request body: { ... }
Extracted fields: { ... }
Creating video with data: { ... }
Saving to database...
❌ Failed to add video suggestion:
Error name: [ERROR NAME]
Error message: [ERROR MESSAGE]
Error stack: [STACK TRACE]
```

## Common Causes & Solutions

### Cause 1: MongoDB Not Connected

**Server logs show:**
```
❌ MongoDB not connected
```

**Solution:**
1. Check `.env` file has real MongoDB password (not `<db_password>`)
2. Restart server: `npm run dev:mongodb`
3. Wait for: `✅ MongoDB Connected Successfully`

---

### Cause 2: Invalid created_by Field

**Server logs show:**
```
❌ Missing created_by field
```
or
```
ValidationError: created_by: Cast to ObjectId failed
```

**Solution:**
The `created_by` field must be a valid MongoDB ObjectId or number. Check that `adminId` is being passed correctly.

**Fix in frontend:**
```typescript
// Make sure adminId is valid
console.log('Admin ID:', adminId);

// If adminId is undefined, you need to pass it from parent component
<AdminVideoSuggestions adminId={user.id} />
```

---

### Cause 3: Validation Error

**Server logs show:**
```
ValidationError: [field]: [error message]
```

**Solution:**
Check which field is causing the validation error and fix the data format.

Common validation errors:
- `difficulty_level` must be: beginner, intermediate, or advanced
- `domain` is required
- `created_by` must be valid ObjectId

---

### Cause 4: Database Write Error

**Server logs show:**
```
MongoServerError: [error message]
```

**Solution:**
- Check MongoDB Atlas cluster is running (not paused)
- Verify database permissions
- Check network connection

---

## Step 2: Check Browser Console

Open browser DevTools (F12) and look at the Console tab.

You should see:
```
Submitting video: { ... }
Server response status: 500
Server response body: { "success": false, "error": "..." }
```

The error message will tell you what went wrong.

---

## Step 3: Test with cURL

Test the API directly to isolate the issue:

```bash
curl -X POST http://localhost:5000/api/admin/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "description": "Test description",
    "video_url": "https://www.youtube.com/watch?v=test123",
    "difficulty_level": "beginner",
    "domain": "Computer Science",
    "concepts": ["testing"],
    "created_by": 1
  }'
```

**If this works:** The issue is in the frontend data
**If this fails:** The issue is in the backend

---

## Step 4: Check MongoDB Connection

In server terminal, you should see at startup:
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

**If you see:**
```
⚠️  MongoDB Connection Failed
```

Then MongoDB is not connected. Fix:
1. Update `.env` with real password
2. Whitelist IP (0.0.0.0/0) in MongoDB Atlas
3. Restart server

---

## Step 5: Check Request Data

The data being sent is:
```json
{
  "title": "sda",
  "description": "asx",
  "video_url": "https://youtu.be/edugenome_demo6",
  "thumbnail_url": "https://img.youtube.com/vi/edugenome_demo6/maxresdefault.jpg",
  "duration": "7",
  "difficulty_level": "beginner",
  "concepts": ["..."],
  "domain": "Computer Science",
  "category": "Tutorial",
  "tags": ["..."],
  "created_by": ???
}
```

**Check:** What is the value of `created_by`? It must be a valid number or MongoDB ObjectId.

---

## Most Likely Causes

Based on the error pattern, the most likely causes are:

### 1. created_by is undefined or invalid
```typescript
// Check in AdminVideoSuggestions component
console.log('Admin ID:', adminId);

// If undefined, check parent component
<AdminVideoSuggestions adminId={user.id} />
```

### 2. MongoDB not connected
```
Check server terminal for:
✅ MongoDB Connected Successfully
```

### 3. Validation error
```
Check server logs for specific validation error
```

---

## Quick Fix Steps

1. **Check server terminal** - Look for error message
2. **Copy the exact error** - Post it here
3. **Check MongoDB connection** - Should see ✅ 
4. **Check adminId** - Add `console.log('Admin ID:', adminId)` in component
5. **Restart server** - `Ctrl+C` then `npm run dev:mongodb`

---

## Get the Error Message

To see the exact error:

1. **Server Terminal:**
   - Look for red error messages
   - Copy the full error stack trace

2. **Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "Server response body"
   - Copy the error message

3. **Share the error:**
   - Post the server terminal error
   - Post the browser console error
   - This will help identify the exact issue

---

## Example Error Messages

### Good Error (Shows the problem):
```
❌ Failed to add video suggestion:
Error name: ValidationError
Error message: AdminVideoSuggestion validation failed: created_by: Cast to ObjectId failed for value "undefined"
```
**Solution:** created_by is undefined, need to pass adminId

### Good Error (Shows the problem):
```
❌ MongoDB not connected
```
**Solution:** Fix MongoDB connection

### Good Error (Shows the problem):
```
Error: Invalid difficulty_level. Must be: beginner, intermediate, or advanced
```
**Solution:** Check difficulty_level value

---

## Next Steps

1. Look at your server terminal NOW
2. Find the error message (starts with ❌)
3. Copy the full error
4. Share it so we can fix the exact issue

The server logs will tell us exactly what's wrong!

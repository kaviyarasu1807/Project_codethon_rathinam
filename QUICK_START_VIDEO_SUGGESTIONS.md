# Quick Start: Video Suggestions Feature

## Prerequisites

Before using the Video Suggestions feature, ensure:

1. ✅ MongoDB Atlas account created
2. ✅ Cluster is running (not paused)
3. ✅ Connection string copied
4. ✅ Password updated in `.env` file
5. ✅ IP whitelisted (0.0.0.0/0)

## Step-by-Step Setup

### 1. Update Environment Variables

Edit `.env` file:

```env
DATABASE_URL=mongodb+srv://kavi:YOUR_ACTUAL_PASSWORD@cluster0.pfapz1p.mongodb.net/
DATABASE_NAME=neuropath_learning_dna
PORT=5000
```

**Replace `YOUR_ACTUAL_PASSWORD` with your real MongoDB password!**

### 2. Start MongoDB Server

Open Terminal 1:

```bash
npm run dev:mongodb
```

Wait for success message:
```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

### 3. Start Frontend

Open Terminal 2:

```bash
npm run dev
```

Wait for:
```
  ➜  Local:   http://localhost:3000/
```

### 4. Login as Admin

1. Open browser: http://localhost:3000
2. Click "Sign In"
3. Select "Staff" role
4. Enter admin credentials:
   - Email: your admin email
   - Password: your admin password
5. Click "Sign In to NeuroPath"

### 5. Access Video Suggestions

1. You're now in the admin dashboard
2. Click the **"Video Suggestions"** tab at the top
3. You should see the Video Suggestions Management page

### 6. Add Your First Video

1. Click the green **"Add Video"** button
2. Fill in the form:
   - **Title**: "Introduction to Data Structures"
   - **Description**: "Learn the basics of arrays, linked lists, and more"
   - **Video URL**: "https://www.youtube.com/watch?v=RBSGKlAvoiM"
   - **Duration**: "15:30" (optional)
   - **Difficulty Level**: Select "beginner"
   - **Domain**: Select "Computer Science"
   - **Category**: Select "Tutorial"
   - **Concepts**: "Data Structures, Arrays" (comma-separated)
   - **Tags**: "programming, fundamentals" (comma-separated)
3. Click **"Add Video"**
4. You should see a success message!

## Troubleshooting

### Error: "Connection failed"

**Cause**: MongoDB server not running or not connected

**Fix**:
1. Check Terminal 1 for MongoDB server logs
2. Look for "✅ MongoDB Connected Successfully"
3. If you see "⚠️ MongoDB Connection Failed", check:
   - Password in `.env` is correct
   - IP is whitelisted in MongoDB Atlas
   - Cluster is running (not paused)

### Error: "500 Internal Server Error"

**Cause**: Database connection issue

**Fix**:
1. Restart MongoDB server (Ctrl+C, then `npm run dev:mongodb`)
2. Check `.env` file has correct credentials
3. Verify MongoDB Atlas cluster is running
4. Check IP whitelist includes 0.0.0.0/0

### Error: "Missing required fields"

**Cause**: Form validation failed

**Fix**:
1. Make sure all required fields are filled:
   - Title ✓
   - Description ✓
   - Video URL ✓
   - Difficulty Level ✓
   - Domain ✓
   - Concepts ✓
2. Check Video URL is a valid URL (starts with https://)

## Features Overview

### Admin Can:

1. **Add Videos**
   - Click "Add Video"
   - Fill form
   - Submit

2. **View All Videos**
   - See statistics (total, active, inactive, views, ratings)
   - Filter by domain, difficulty, status
   - Search by title/description/concepts

3. **Edit Videos**
   - Click "Edit" button on any video
   - Update fields
   - Click "Update"

4. **Delete Videos**
   - Click trash icon
   - Confirm deletion
   - Video removed permanently

5. **Activate/Deactivate**
   - Click "Hide" to deactivate
   - Click "Show" to activate
   - Only active videos shown to students

### Students Will See:

- Personalized video recommendations
- Based on their weak concepts
- Matched to their skill level
- Sorted by rating and popularity

## Example Videos to Add

### Video 1: Beginner
```
Title: Python Basics for Beginners
Description: Learn Python programming from scratch
Video URL: https://www.youtube.com/watch?v=rfscVS0vtbw
Duration: 4:26:52
Difficulty: beginner
Domain: Computer Science
Category: Tutorial
Concepts: Python, Programming Basics
Tags: python, beginner, tutorial
```

### Video 2: Intermediate
```
Title: Data Structures and Algorithms
Description: Master DSA concepts with examples
Video URL: https://www.youtube.com/watch?v=RBSGKlAvoiM
Duration: 2:30:00
Difficulty: intermediate
Domain: Computer Science
Category: Explanation
Concepts: Data Structures, Algorithms
Tags: dsa, algorithms, interview-prep
```

### Video 3: Advanced
```
Title: System Design Interview Prep
Description: Learn to design scalable systems
Video URL: https://www.youtube.com/watch?v=UzLMhqg3_Wc
Duration: 1:45:00
Difficulty: advanced
Domain: Computer Science
Category: Practice
Concepts: System Design, Scalability
Tags: system-design, architecture, advanced
```

## Testing Checklist

After setup, verify:

- [ ] Can login as admin
- [ ] Can see "Video Suggestions" tab
- [ ] Can click "Add Video" button
- [ ] Form appears correctly
- [ ] Can fill all fields
- [ ] Can submit form
- [ ] Success message appears
- [ ] Video appears in list
- [ ] Can edit video
- [ ] Can delete video
- [ ] Can activate/deactivate video
- [ ] Statistics update correctly
- [ ] Filters work
- [ ] Search works

## Next Steps

Once videos are added:

1. **Test Student View**
   - Login as a student
   - Take a quiz
   - Check if personalized videos appear

2. **Add More Videos**
   - Add videos for different domains
   - Add videos for different difficulty levels
   - Cover various concepts

3. **Monitor Usage**
   - Check view counts
   - Check ratings
   - Adjust recommendations based on feedback

## Support

If you encounter issues:

1. Check `FIX_VIDEO_SUGGESTIONS_ERROR.md` for detailed troubleshooting
2. Check server logs in Terminal 1
3. Check browser console (F12) for errors
4. Verify MongoDB Atlas cluster status

## Success! 🎉

When everything works, you should see:

- ✅ Videos listed in the admin panel
- ✅ Statistics showing correct counts
- ✅ Filters and search working
- ✅ Edit/delete actions working
- ✅ Students seeing personalized recommendations

Enjoy the Video Suggestions feature!

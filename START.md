# 🚀 Quick Start Guide

## Start Your NeuroPath Application

### Step 1: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 2: Start the Application
```bash
npm run dev
```

### Step 3: Open Your Browser
The application will automatically open at:
```
http://localhost:5173
```

## That's It! 🎉

Your backend is already connected and running!

## What Happens When You Run `npm run dev`?

1. ✅ Express server starts on port 3000
2. ✅ SQLite database is created/initialized
3. ✅ All database tables are created
4. ✅ Vite development server starts on port 5173
5. ✅ Frontend connects to backend automatically
6. ✅ Browser opens to the login page

## Test the Application

### As a Student:
1. Click "Create Account"
2. Fill in your details
3. Capture your face (for identity verification)
4. Login with your credentials
5. Take the quiz
6. View your LSTM-powered recommendations

### As Staff/Admin:
1. Register with "Staff/Admin" role
2. Login
3. View the admin dashboard
4. See all student metrics:
   - Quiz scores
   - Time taken
   - Voice detection
   - Typing speed
   - Tab switches
   - Emotional states (stress, happiness, focus)

## Features You Can Test

✅ **Authentication**
- Register (with face capture for students)
- Login
- Forgot password

✅ **Quiz System**
- Face verification before quiz
- Real-time tracking:
  - Voice detection
  - Typing speed
  - Tab switches
  - Focus level
  - Stress level
  - Happiness level
- Question timing
- LSTM recommendations after completion

✅ **Student Dashboard**
- View quiz results
- See LSTM recommendations
- Learning style identification
- Personalized study schedule
- Resource recommendations

✅ **Admin Dashboard**
- View all students
- Detailed metrics for each student
- Real-time emotional states
- Performance tracking
- Critical concept identification

## Troubleshooting

### If the server doesn't start:
```bash
# Make sure ports 3000 and 5173 are free
# On Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill any process using these ports if needed
```

### If you see module errors:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### If database issues occur:
```bash
# Delete and recreate database
rm neuropath.db
npm run dev
```

## Need Help?

Check these files for detailed information:
- `BACKEND_CONNECTION_GUIDE.md` - Complete backend documentation
- `LSTM_RECOMMENDATION_SYSTEM.md` - LSTM algorithm details
- `ENVIRONMENT_TRACKING_FEATURES.md` - Tracking features
- `ADMIN_DASHBOARD_GUIDE.md` - Admin dashboard guide

## System Requirements

- Node.js v18 or higher
- npm v8 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Camera access (for face verification)
- Microphone access (for voice detection)

## Default Test Accounts

After starting, you can create your own accounts. The system supports:
- Multiple students
- Multiple staff/admin users
- Different domains (Engineering, Medical, Computer Science, Arts)

Enjoy using NeuroPath Learning DNA System! 🧠✨

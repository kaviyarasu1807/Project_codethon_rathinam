# Start Server - Quick Guide

## The Problem
You're seeing: **"Connection failed. Please try again."**

## The Solution (1 Command!)

Open your terminal in the project folder and run:

```bash
npm run dev
```

That's it! ✅

## What This Does

1. Starts the backend server on port 3000
2. Starts the frontend dev server on port 5173
3. Opens your browser automatically

## You Should See:

```
> react-example@0.0.0 dev
> tsx server.ts

Server running on http://localhost:3000
Vite dev server running on http://localhost:5173
```

## Now Test Registration:

1. Go to `http://localhost:5173` in your browser
2. Click "Register" or "Create Account"
3. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
   - Role: Student
   - Domain: Engineering
   - Department: Computer Science
   - Mobile: +1234567890
   - College: Your College
   - Address: Your Address

4. Click "Next: Face Capture"
5. Allow camera access
6. Click "Capture Face"
7. Click "Complete Registration"

## Expected Result:

✅ "Registration Successful!"
✅ "Go to Login" button appears
✅ No more "Connection failed" error!

## If Port 3000 is Already in Use:

### Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

### Mac/Linux:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

## If You Don't Have Dependencies:

```bash
npm install
npm run dev
```

## Verify It's Working:

Open a new terminal and test:
```bash
curl http://localhost:3000/api/register
```

You should see an error about missing fields (that's good! It means the server is responding).

## Common Errors:

### "npm: command not found"
Install Node.js: https://nodejs.org/

### "tsx: command not found"
Run: `npm install`

### "Cannot find module"
Run: `npm install`

### "EADDRINUSE: address already in use"
Port 3000 is busy. Kill the process (see above).

## That's It!

Just run `npm run dev` and you're good to go! 🚀

---

**TL;DR:** Run `npm run dev` in your terminal, then try registration again.

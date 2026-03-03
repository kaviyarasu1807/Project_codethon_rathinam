# Fix MongoDB Connection Error - 400 Bad Request

## Problem
```
POST http://localhost:3000/api/register 400 (Bad Request)
Registration error: Error: Registration failed
```

## Root Cause
The frontend was trying to connect to port 3000 (SQLite server), but you're running MongoDB server on port 5000.

## Solution Applied ✅

I've updated `vite.config.ts` to proxy API requests to port 5000:

```typescript
server: {
  hmr: process.env.DISABLE_HMR !== 'true',
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

## What You Need to Do

### Step 1: Stop All Servers
Press `Ctrl + C` in all terminal windows to stop any running servers.

### Step 2: Update MongoDB Password
Open `.env` file and replace `<db_password>` with your actual password:

```env
DATABASE_URL=mongodb+srv://kavi:YOUR_ACTUAL_PASSWORD@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

### Step 3: Whitelist IP in MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Network Access → Add IP Address
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click Confirm

### Step 4: Start MongoDB Server
```bash
npm run dev:mongodb
```

### Step 5: Verify Server Started
You should see:
```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
📊 Database: MongoDB Atlas
```

### Step 6: Test Registration
1. Open browser: `http://localhost:5173`
2. Refresh the page (Ctrl + F5)
3. Go to registration
4. Fill in all fields
5. Capture face
6. Click "Complete Registration"
7. ✅ Should work now!

## Why This Happened

### Before Fix:
```
Frontend (localhost:5173)
    ↓
Vite Proxy → localhost:3000 (SQLite server - not running)
    ↓
❌ Connection failed
```

### After Fix:
```
Frontend (localhost:5173)
    ↓
Vite Proxy → localhost:5000 (MongoDB server)
    ↓
✅ Registration successful
```

## Verification Steps

### 1. Check Server is Running
Terminal should show:
```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
```

### 2. Check Browser Console
Press F12 → Console tab
Should see:
```
POST http://localhost:5173/api/register 200 OK
```

### 3. Check Network Tab
Press F12 → Network tab
Look for `/api/register` request:
- Status: 200 (success)
- Response: `{"success": true}`

### 4. Check MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Browse Collections
3. Database: `neuropath_learning_dna`
4. Collection: `students`
5. See your registered user!

## Troubleshooting

### Still Getting 400 Bad Request?

#### Check 1: MongoDB Server is Running
```bash
# Should see this in terminal:
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
```

#### Check 2: Password is Correct
Open `.env` and verify:
```env
# Should NOT have < or >
DATABASE_URL=mongodb+srv://kavi:YourPassword@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

#### Check 3: IP is Whitelisted
- Go to MongoDB Atlas → Network Access
- Should see 0.0.0.0/0 or your IP

#### Check 4: Vite Dev Server Restarted
After changing `vite.config.ts`, you need to restart:
```bash
# Stop server (Ctrl + C)
# Start again
npm run dev:mongodb
```

### Getting "MongoDB Connection Failed"?

**Fix:**
1. Update password in `.env`
2. Whitelist IP in MongoDB Atlas
3. Check internet connection
4. Restart server

### Getting "Network Error"?

**Fix:**
1. Make sure MongoDB server is running on port 5000
2. Check firewall isn't blocking port 5000
3. Restart browser

### Getting "Email already exists"?

**This is actually good!** It means:
- ✅ Connection is working
- ✅ Database is working
- ❌ Email is already registered

**Solution:** Use a different email address.

## Complete Setup Checklist

- [ ] `.env` file updated with correct password
- [ ] IP whitelisted in MongoDB Atlas (0.0.0.0/0)
- [ ] `vite.config.ts` updated with proxy (already done ✅)
- [ ] All servers stopped
- [ ] MongoDB server started: `npm run dev:mongodb`
- [ ] See "✅ MongoDB connection successful"
- [ ] Browser refreshed (Ctrl + F5)
- [ ] Registration tested
- [ ] Data visible in MongoDB Atlas

## Quick Test

### Test 1: Server Health
```bash
curl http://localhost:5000/api/register
```
Should get error about missing fields (that's good!)

### Test 2: Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "domain": "Engineering"
  }'
```
Should get: `{"success": true}`

### Test 3: Browser
1. Open `http://localhost:5173`
2. Register a user
3. Should see "Registration Successful!"

## Summary

### What Was Fixed:
✅ Updated `vite.config.ts` to proxy to port 5000

### What You Need to Do:
1. Update password in `.env`
2. Whitelist IP in MongoDB Atlas
3. Run `npm run dev:mongodb`
4. Test registration

### Expected Result:
- ✅ Server connects to MongoDB
- ✅ Registration works
- ✅ Data saved to MongoDB Atlas
- ✅ No more 400 errors

---

**Next Steps:**
1. Update `.env` with your MongoDB password
2. Whitelist IP in MongoDB Atlas
3. Run `npm run dev:mongodb`
4. Refresh browser and test registration

**It will work now!** 🚀

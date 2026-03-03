# Quick Fix - Do This Now!

## The Problem
You're getting: `POST http://localhost:3000/api/register 400 (Bad Request)`

## The Fix (4 Steps)

### Step 1: Stop All Servers
Press `Ctrl + C` in your terminal

### Step 2: Update Password in .env
Open `.env` file and change this line:

```env
# Replace <db_password> with your actual MongoDB password
DATABASE_URL=mongodb+srv://kavi:YOUR_PASSWORD@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

**Get your password:**
- Go to https://cloud.mongodb.com/
- Database Access → Edit user `kavi` → Edit Password
- Copy password and paste in `.env`

### Step 3: Whitelist IP
1. Go to https://cloud.mongodb.com/
2. Network Access → Add IP Address
3. Choose "Allow Access from Anywhere"
4. Click Confirm

### Step 4: Start MongoDB Server
```bash
npm run dev:mongodb
```

## Expected Output

```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
📊 Database: MongoDB Atlas
```

## Test Registration

1. Open browser: `http://localhost:5173`
2. Press `Ctrl + F5` to refresh
3. Register a new user
4. ✅ Should work!

## What I Fixed

✅ Updated `vite.config.ts` to proxy API requests to port 5000 (MongoDB server)

## What You Need to Do

1. ✅ Update password in `.env`
2. ✅ Whitelist IP in MongoDB Atlas
3. ✅ Run `npm run dev:mongodb`
4. ✅ Test registration

---

**Do these 4 steps and it will work!** 🚀

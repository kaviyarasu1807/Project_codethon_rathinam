# MongoDB Setup Checklist

## ✅ Quick Setup (3 Steps)

### Step 1: Update Password in .env
Open `.env` file and replace `<db_password>` with your actual MongoDB password:

```env
DATABASE_URL=mongodb+srv://kavi:YOUR_PASSWORD@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

**Don't know your password?**
1. Go to https://cloud.mongodb.com/
2. Database Access → Edit user `kavi` → Edit Password
3. Copy the password
4. Paste in `.env` file

### Step 2: Whitelist Your IP
1. Go to https://cloud.mongodb.com/
2. Network Access → Add IP Address
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click Confirm

### Step 3: Start Server
```bash
npm run dev:mongodb
```

## ✅ Verification Checklist

- [ ] Password updated in `.env` (no `<` or `>` brackets)
- [ ] IP address whitelisted in MongoDB Atlas
- [ ] Internet connection working
- [ ] Server started with `npm run dev:mongodb`
- [ ] See "✅ MongoDB connection successful" in terminal
- [ ] Browser open to `http://localhost:5173`
- [ ] Registration works
- [ ] Data visible in MongoDB Atlas

## Expected Terminal Output

```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
📊 Database: MongoDB Atlas
🌐 Environment: development
```

## If You See This Instead

```
⚠️  MongoDB Connection Failed
⚠️  Server will start in FALLBACK MODE
```

**Fix:**
1. Check password in `.env` is correct
2. Check IP is whitelisted
3. Check internet connection
4. Check MongoDB Atlas cluster is running

## Test Registration

1. Open: `http://localhost:5173`
2. Fill registration form
3. Capture face
4. Click "Complete Registration"
5. Should see: "Registration Successful!" ✅

## Verify Data

1. Go to: https://cloud.mongodb.com/
2. Browse Collections
3. Database: `neuropath_learning_dna`
4. Collection: `students`
5. See your data! ✅

## Common Issues

### Issue: "Authentication failed"
**Fix:** Check password in `.env` is correct

### Issue: "Network timeout"
**Fix:** Whitelist IP address in MongoDB Atlas

### Issue: "Connection refused"
**Fix:** Check internet connection

### Issue: "Database not found"
**Fix:** Database will be created automatically on first insert

## Quick Commands

### Start MongoDB Server:
```bash
npm run dev:mongodb
```

### Stop Server:
Press `Ctrl + C`

### Check if Running:
```bash
curl http://localhost:5000/api/register
```

## Summary

**Before:**
```bash
npm run dev  # SQLite, port 3000
```

**Now:**
```bash
npm run dev:mongodb  # MongoDB, port 5000
```

**That's it!** 🚀

---

**Next:** Update password in `.env` and run `npm run dev:mongodb`

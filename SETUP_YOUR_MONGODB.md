# Setup Your MongoDB Connection

## Current Status
✅ MongoDB URL updated in `.env` file
⚠️ You need to replace `<db_password>` with your actual password

## Step 1: Get Your MongoDB Password

### Option A: You Know Your Password
If you already know your MongoDB password, skip to Step 2.

### Option B: Reset Your Password
If you don't know your password:

1. Go to https://cloud.mongodb.com/
2. Sign in with your account
3. Select your project
4. Go to **Database Access** (left sidebar)
5. Find user `kavi`
6. Click **Edit** button
7. Click **Edit Password**
8. Choose:
   - **Autogenerate Secure Password** (recommended)
   - Or enter your own password
9. Copy the password
10. Click **Update User**

## Step 2: Update .env File

Open your `.env` file and replace `<db_password>` with your actual password:

### Before:
```env
DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

### After (example):
```env
DATABASE_URL=mongodb+srv://kavi:MySecurePassword123@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

**Important:** 
- No spaces in the password
- No `<` or `>` brackets
- If password has special characters, URL encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`

### Example with Special Characters:
If password is: `MyPass@123#`
Use: `MyPass%40123%23`

```env
DATABASE_URL=mongodb+srv://kavi:MyPass%40123%23@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

## Step 3: Whitelist Your IP Address

1. Go to https://cloud.mongodb.com/
2. Select your project
3. Go to **Network Access** (left sidebar)
4. Click **Add IP Address**
5. Choose one:
   - **Add Current IP Address** (your current IP)
   - **Allow Access from Anywhere** (0.0.0.0/0) - easier for development
6. Click **Confirm**

## Step 4: Start MongoDB Server

```bash
npm run dev:mongodb
```

## Step 5: Verify Connection

You should see:
```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
📊 Database: MongoDB Atlas
```

If you see this instead:
```
⚠️  MongoDB Connection Failed
```

Check the troubleshooting section below.

## Step 6: Test Registration

1. Open browser: `http://localhost:5173`
2. Go to registration
3. Fill in all fields
4. Capture face
5. Click "Complete Registration"
6. Should see: "Registration Successful!" ✅

## Step 7: Verify Data in MongoDB

1. Go to https://cloud.mongodb.com/
2. Select your cluster
3. Click **Browse Collections**
4. You should see:
   - Database: `neuropath_learning_dna`
   - Collection: `students`
   - Your registered user data!

## Complete .env File Example

```env
# MongoDB Connection
DATABASE_URL=mongodb+srv://kavi:YourActualPassword@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
DATABASE_NAME=neuropath_learning_dna

# Supabase Connection (optional)
SUPABASE_URL=https://fdydjjwtwqbjmyydolmo.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Server Configuration
PORT=5000
NODE_ENV=development

# YouTube API (Optional)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Session Secret
SESSION_SECRET=your_secret_key_here_change_in_production
```

## Troubleshooting

### Error: "MongoDB Connection Failed"

#### Check 1: Password is Correct
```env
# Make sure you replaced <db_password> with actual password
DATABASE_URL=mongodb+srv://kavi:YourPassword@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

#### Check 2: Special Characters Encoded
If password has special characters, encode them:
```
@ → %40
# → %23
$ → %24
% → %25
& → %26
```

#### Check 3: IP Address Whitelisted
1. Go to MongoDB Atlas → Network Access
2. Add your IP or use 0.0.0.0/0

#### Check 4: Cluster is Running
1. Go to MongoDB Atlas → Database
2. Check if cluster status is "Active"

#### Check 5: Internet Connection
```bash
ping google.com
```

### Error: "Authentication failed"

**Solution:**
1. Verify username is `kavi`
2. Verify password is correct
3. Check user has read/write permissions

### Error: "Network timeout"

**Possible causes:**
- Firewall blocking connection
- VPN interfering
- IP not whitelisted

**Solutions:**
1. Disable firewall temporarily
2. Disable VPN
3. Add IP to whitelist

### Error: "Database not found"

**Solution:**
The database will be created automatically when you first insert data. Just register a user and it will be created!

## Quick Test

### Test Connection:
```bash
# Start server
npm run dev:mongodb

# Should see:
# ✅ MongoDB connection successful
```

### Test Registration:
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

Expected response:
```json
{
  "success": true
}
```

## Security Best Practices

### 1. Strong Password
Use a strong password with:
- At least 12 characters
- Mix of uppercase and lowercase
- Numbers and special characters

### 2. IP Whitelist
For production, whitelist only specific IPs:
- Your server IP
- Your office IP
- Not 0.0.0.0/0

### 3. Environment Variables
Never commit `.env` file to git:
```bash
# .gitignore should have:
.env
```

### 4. Rotate Passwords
Change your MongoDB password regularly.

## MongoDB Atlas Dashboard

### View Collections:
1. Go to https://cloud.mongodb.com/
2. Database → Browse Collections
3. Select `neuropath_learning_dna`
4. View collections:
   - students
   - quizresults
   - emotionalstates
   - etc.

### Monitor Performance:
- Metrics tab: CPU, memory, connections
- Performance Advisor: Query optimization tips
- Real-time Performance Panel: Live metrics

### Backup:
- Automated backups enabled by default
- Point-in-time recovery available
- Download backups manually if needed

## Summary

### Steps to Complete:
1. ✅ Get your MongoDB password
2. ✅ Update `.env` file (replace `<db_password>`)
3. ✅ Whitelist your IP address
4. ✅ Run `npm run dev:mongodb`
5. ✅ Test registration
6. ✅ Verify data in MongoDB Atlas

### Your Connection String:
```env
DATABASE_URL=mongodb+srv://kavi:YOUR_PASSWORD_HERE@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

### Start Server:
```bash
npm run dev:mongodb
```

### Open Browser:
```
http://localhost:5173
```

---

**Need Help?**
- Check MongoDB Atlas dashboard
- Verify password is correct
- Ensure IP is whitelisted
- Check internet connection
- Look at server logs for errors

**Once connected, registration will save data to MongoDB Atlas cloud database!** 🚀

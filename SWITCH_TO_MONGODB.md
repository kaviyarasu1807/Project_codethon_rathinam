# Switch to MongoDB Database - Complete Guide

## Current Setup
✅ MongoDB connection string is already configured in `.env`
✅ MongoDB server file exists: `server-mongodb.ts`
✅ All endpoints are ready for MongoDB

## Quick Switch (1 Command)

Instead of running:
```bash
npm run dev  # This uses SQLite
```

Run this:
```bash
npm run dev:mongodb  # This uses MongoDB
```

That's it! ✅

## What This Does

### Using SQLite (Old):
```bash
npm run dev
```
- Uses `server.ts`
- Database: `neuropath.db` (local SQLite file)
- Port: 3000

### Using MongoDB (New):
```bash
npm run dev:mongodb
```
- Uses `server-mongodb.ts`
- Database: MongoDB Atlas (cloud)
- Port: 5000
- Connection: `mongodb+srv://...`

## Step-by-Step Instructions

### Step 1: Stop Current Server
If you have a server running, stop it:
- Press `Ctrl + C` in the terminal

### Step 2: Start MongoDB Server
```bash
npm run dev:mongodb
```

### Step 3: Verify Connection
You should see:
```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
📊 Database: MongoDB Atlas
🌐 Environment: development
```

### Step 4: Update Frontend URL
The MongoDB server runs on port 5000 (not 3000), so update your browser:
- Old: `http://localhost:5173` (Vite proxies to port 3000)
- New: `http://localhost:5173` (Vite proxies to port 5000)

Actually, Vite will automatically proxy to the correct port! Just open:
```
http://localhost:5173
```

## Testing Registration with MongoDB

### 1. Open Browser
Navigate to: `http://localhost:5173`

### 2. Register New Student
- Fill in all fields
- Click "Next: Face Capture"
- Capture face
- Click "Complete Registration"

### 3. Expected Result
```
✅ "Completing Registration..." (spinner)
✅ Data saved to MongoDB Atlas
✅ "Registration Successful!" screen
✅ "Go to Login" button
```

### 4. Verify in MongoDB
Your data is now stored in MongoDB Atlas cloud database!

## MongoDB vs SQLite Comparison

| Feature | SQLite (server.ts) | MongoDB (server-mongodb.ts) |
|---------|-------------------|----------------------------|
| Database | Local file | Cloud (MongoDB Atlas) |
| Port | 3000 | 5000 |
| Connection | Automatic | Requires internet |
| Scalability | Limited | High |
| Backup | Manual file copy | Automatic |
| Multi-user | Limited | Excellent |
| Production | Not recommended | Recommended |

## MongoDB Connection Details

### From .env file:
```env
DATABASE_URL=mongodb+srv://sivasudhanoffical_db_user:H59DKTUBjEhPeUX6@cluster0.zwhafdk.mongodb.net/?appName=Cluster0
DATABASE_NAME=neuropath_learning_dna
PORT=5000
```

### Collections Created:
- `students` - Student accounts
- `quizresults` - Quiz submissions
- `emotionalstates` - Emotional tracking
- `proctoringviolations` - Proctoring logs
- `safaconceptmastery` - SAFA mastery data
- `safaanswerattempts` - SAFA answer history
- `safafeedbacklog` - SAFA feedback logs
- `safarevisionqueue` - SAFA revision queue
- `learninganalyticsreports` - Analytics reports
- `videorecommendations` - Video recommendations
- `videowatchhistory` - Watch history

## Troubleshooting

### Issue 1: "MongoDB Connection Failed"
**Symptoms:**
```
⚠️  MongoDB Connection Failed
⚠️  Server will start in FALLBACK MODE
```

**Solutions:**

1. **Check Internet Connection**
   ```bash
   ping google.com
   ```

2. **Verify MongoDB Atlas Cluster is Running**
   - Go to https://cloud.mongodb.com/
   - Check if cluster is active

3. **Check IP Whitelist**
   - Go to MongoDB Atlas → Network Access
   - Add your IP address or use `0.0.0.0/0` (allow all)

4. **Verify Connection String**
   - Check `.env` file
   - Ensure `DATABASE_URL` is correct

### Issue 2: "Port 5000 already in use"
**Solution:**

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
npm run dev:mongodb
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
npm run dev:mongodb
```

### Issue 3: "Cannot find module 'mongodb'"
**Solution:**
```bash
npm install
npm run dev:mongodb
```

### Issue 4: "Connection timeout"
**Possible causes:**
- Firewall blocking connection
- VPN interfering
- MongoDB Atlas cluster paused

**Solutions:**
1. Disable firewall temporarily
2. Disable VPN
3. Check MongoDB Atlas cluster status

### Issue 5: "Authentication failed"
**Solution:**
- Verify username and password in `.env`
- Check MongoDB Atlas user permissions

## Verify MongoDB is Working

### Test 1: Check Server Logs
Terminal should show:
```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
```

### Test 2: Test Registration Endpoint
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

### Test 3: Check MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Navigate to your cluster
3. Click "Browse Collections"
4. Check `neuropath_learning_dna` database
5. Check `students` collection
6. You should see your registered users!

## Benefits of MongoDB

### 1. Cloud-Based
- Access from anywhere
- No local file management
- Automatic backups

### 2. Scalable
- Handles millions of records
- Distributed architecture
- High performance

### 3. Flexible Schema
- Easy to add new fields
- No migrations needed
- JSON-like documents

### 4. Production-Ready
- Used by major companies
- Reliable and tested
- Great for web apps

### 5. Rich Queries
- Complex aggregations
- Full-text search
- Geospatial queries

## MongoDB Atlas Dashboard

### View Your Data:
1. Go to https://cloud.mongodb.com/
2. Sign in with your credentials
3. Select your cluster
4. Click "Browse Collections"
5. Select `neuropath_learning_dna` database
6. View collections:
   - students
   - quizresults
   - emotionalstates
   - etc.

### Monitor Performance:
- Real-time metrics
- Query performance
- Storage usage
- Connection stats

## Package.json Scripts

### Available Commands:
```json
{
  "dev": "tsx server.ts",              // SQLite (port 3000)
  "dev:mongodb": "tsx watch server-mongodb.ts",  // MongoDB (port 5000)
  "start:mongodb": "tsx server-mongodb.ts"       // MongoDB production
}
```

### Development:
```bash
npm run dev:mongodb
```

### Production:
```bash
npm run start:mongodb
```

## Environment Variables

### Required for MongoDB:
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=neuropath_learning_dna
PORT=5000
```

### Optional:
```env
NODE_ENV=development
SESSION_SECRET=your_secret_key
```

## Migration from SQLite to MongoDB

If you have existing data in SQLite and want to migrate:

### Step 1: Export SQLite Data
```bash
sqlite3 neuropath.db .dump > backup.sql
```

### Step 2: Convert to MongoDB Format
(Manual process - convert SQL to JSON)

### Step 3: Import to MongoDB
```bash
mongoimport --uri="mongodb+srv://..." --collection=students --file=students.json
```

Or use a migration script (we can create one if needed).

## Production Deployment

### Step 1: Set Environment Variables
```env
NODE_ENV=production
DATABASE_URL=your_production_mongodb_url
PORT=5000
```

### Step 2: Build Frontend
```bash
npm run build
```

### Step 3: Start Server
```bash
npm run start:mongodb
```

### Step 4: Use Process Manager
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server-mongodb.ts --name neuropath

# Monitor
pm2 monit

# Logs
pm2 logs neuropath
```

## Summary

### To Use MongoDB:
1. ✅ Stop current server (`Ctrl + C`)
2. ✅ Run `npm run dev:mongodb`
3. ✅ Open `http://localhost:5173`
4. ✅ Test registration
5. ✅ Verify in MongoDB Atlas

### Key Differences:
- Port: 5000 (instead of 3000)
- Database: MongoDB Atlas (instead of SQLite)
- Connection: Requires internet
- Data: Stored in cloud

### Benefits:
- ✅ Cloud-based storage
- ✅ Scalable architecture
- ✅ Production-ready
- ✅ Automatic backups
- ✅ Better performance

---

**Quick Start:**
```bash
npm run dev:mongodb
```

Then open `http://localhost:5173` and test registration! 🚀

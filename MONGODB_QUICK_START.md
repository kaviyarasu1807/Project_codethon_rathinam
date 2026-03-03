# MongoDB Quick Start

## Switch to MongoDB (1 Command)

```bash
npm run dev:mongodb
```

That's it! ✅

## What You'll See

```
✅ MongoDB connection successful
🚀 Server running on http://localhost:5000
📊 Database: MongoDB Atlas
```

## Open Browser

```
http://localhost:5173
```

## Test Registration

1. Fill form
2. Capture face
3. Click "Complete Registration"
4. ✅ Success!

## Verify Data

Go to: https://cloud.mongodb.com/
- Browse Collections
- Database: `neuropath_learning_dna`
- Collection: `students`
- See your data!

## Troubleshooting

### "Connection Failed"
**Fix:** Check internet connection

### "Port 5000 in use"
**Fix:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

Then run `npm run dev:mongodb` again.

## SQLite vs MongoDB

| Feature | SQLite | MongoDB |
|---------|--------|---------|
| Command | `npm run dev` | `npm run dev:mongodb` |
| Port | 3000 | 5000 |
| Database | Local file | Cloud |
| Internet | Not needed | Required |

## Summary

**Old (SQLite):**
```bash
npm run dev  # Port 3000, local database
```

**New (MongoDB):**
```bash
npm run dev:mongodb  # Port 5000, cloud database
```

Both work! Choose based on your needs.

---

**Recommended:** Use MongoDB for production! 🚀

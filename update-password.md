# Update MongoDB Password - Quick Guide

## Current Issue

Your `.env` file has:
```
DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

The `<db_password>` needs to be replaced with your actual password.

## Quick Fix (3 Steps)

### 1. Open .env File

Open the `.env` file in your project root directory.

### 2. Replace Password

Find this line:
```
DATABASE_URL=mongodb+srv://kavi:<db_password>@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

Replace `<db_password>` with your actual MongoDB password:
```
DATABASE_URL=mongodb+srv://kavi:YOUR_ACTUAL_PASSWORD_HERE@cluster0.pfapz1p.mongodb.net/?appName=Cluster0
```

### 3. Save and Restart

1. Save the `.env` file
2. Stop the server (Ctrl+C)
3. Start again: `npm run dev:mongodb`

## Don't Have Your Password?

### Get New Password from MongoDB Atlas

1. Go to: https://cloud.mongodb.com/
2. Login
3. Click "Database Access" (left sidebar)
4. Find user "kavi"
5. Click "Edit"
6. Click "Edit Password"
7. Click "Autogenerate Secure Password"
8. **COPY THE PASSWORD** (you won't see it again!)
9. Click "Update User"
10. Paste the password in your `.env` file

## Special Characters in Password?

If your password has special characters, encode them:

| Character | Replace With |
|-----------|--------------|
| @         | %40          |
| #         | %23          |
| $         | %24          |
| %         | %25          |
| /         | %2F          |
| :         | %3A          |
| ?         | %3F          |
| &         | %26          |

**Example:**
- Password: `MyPass@123`
- Encoded: `MyPass%40123`

## Verify It Works

After updating, you should see:

```
✅ MongoDB Connected Successfully
📊 Database: neuropath_learning_dna
🚀 Server running on http://localhost:5000
```

## Still Not Working?

Check these:
- [ ] Password has no `<` or `>` brackets
- [ ] No spaces in the password
- [ ] Special characters are URL encoded
- [ ] IP is whitelisted (0.0.0.0/0) in MongoDB Atlas
- [ ] Cluster is running (not paused)

## Need Help?

See detailed guides:
- `FIX_DATABASE_PASSWORD.md` - Full troubleshooting
- `FIX_VIDEO_SUGGESTIONS_ERROR.md` - Connection issues
- `QUICK_START_VIDEO_SUGGESTIONS.md` - Complete setup

---

**Remember:** Never share your password or commit the `.env` file to Git!

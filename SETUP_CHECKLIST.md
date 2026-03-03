# Setup Checklist ✅

## Your Supabase Project: fdydjjwtwqbjmyydolmo

Follow these steps in order:

---

## ☐ Step 1: Get Your Anon Key

1. Go to: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/settings/api
2. Find the **"anon public"** key (starts with `eyJ...`)
3. Copy it

**Note:** You shared a publishable key, but you need the anon key for backend.

---

## ☐ Step 2: Update .env File

Open `.env` and replace `YOUR_ANON_KEY_HERE` with your actual anon key:

```env
SUPABASE_URL=https://fdydjjwtwqbjmyydolmo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ☐ Step 3: Create Database Schema

### Option A: Supabase Dashboard (Recommended)

1. Go to: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/sql/new
2. Open file: `backend/supabase-schema.sql`
3. Copy ALL contents (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click **"Run"** (or Ctrl+Enter)
6. Wait for "Success" message

### Option B: Supabase CLI

```bash
supabase db push
```

---

## ☐ Step 4: Verify Tables Created

1. Go to: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/editor
2. Check these tables exist:
   - ☐ students
   - ☐ staff
   - ☐ quiz_results
   - ☐ recommendations
   - ☐ emotional_states
   - ☐ learning_analytics_reports
   - ☐ video_recommendations
   - ☐ video_watch_history

---

## ☐ Step 5: Seed Database

Run in terminal:

```bash
npm run seed:supabase
```

**Expected:** Should see "✅ Created X students" messages

---

## ☐ Step 6: Verify Data

1. Go to: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/editor
2. Click **"students"** table
3. Should see 8 students (Alice, Bob, Carol, etc.)

---

## ☐ Step 7: Start Server

```bash
npm run dev
```

**Expected:** Server starts on http://localhost:5000

---

## ☐ Step 8: Test Login

Open browser: http://localhost:5000

Try logging in:
- Email: `alice.johnson@example.com`
- Password: `password123`

---

## ☐ Step 9: Explore Features

As Student:
- ☐ View dashboard
- ☐ Check quiz scores
- ☐ See emotional intelligence charts
- ☐ Try AI chatbot
- ☐ Check weak topics

As Admin (logout and login as admin):
- Email: `admin@example.com`
- Password: `password123`
- ☐ View admin panel
- ☐ See all students
- ☐ Check analytics
- ☐ Try admin chatbot

---

## Troubleshooting

### ❌ "Invalid API key"
→ Check `.env` has correct anon key from Supabase dashboard

### ❌ "relation does not exist"
→ Run schema SQL in Supabase SQL Editor

### ❌ "Cannot connect"
→ Check internet connection and Supabase project is active

### ❌ Login fails
→ Verify seed completed successfully, check browser console

---

## Quick Links

**Your Supabase Project:**
- 🏠 Dashboard: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo
- 📝 SQL Editor: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/sql
- 📊 Table Editor: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/editor
- 🔑 API Keys: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/settings/api

**Documentation:**
- `YOUR_SUPABASE_SETUP.md` - Detailed setup guide
- `QUICK_START.md` - Quick reference
- `DATABASE_SETUP_COMPLETE.md` - Complete overview

---

## Test Credentials

**Students:**
```
alice.johnson@example.com / password123
bob.smith@example.com / password123
carol.williams@example.com / password123
david.brown@example.com / password123
emma.davis@example.com / password123
frank.miller@example.com / password123
grace.wilson@example.com / password123
henry.moore@example.com / password123
```

**Admin:**
```
admin@example.com / password123
```

---

## ✅ All Done!

Once all steps are checked, you're ready to develop!

**Next:** Start building features, testing, and customizing your app.

---

**Need Help?** Check `YOUR_SUPABASE_SETUP.md` for detailed instructions.

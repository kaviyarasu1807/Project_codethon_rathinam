# Your Supabase Setup Guide

## Step 1: Get Your Anon Key

You need to get the correct API key from Supabase:

1. Go to: **https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/settings/api**

2. Look for the **"anon public"** key (it's a long string starting with `eyJ...`)

3. Copy that key

4. Update your `.env` file:
   ```env
   SUPABASE_URL=https://fdydjjwtwqbjmyydolmo.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeWRqand0d3Fiam15eWRvbG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTg1Nzc2OTYwMH0.YOUR_SIGNATURE_HERE
   ```
   (Replace with your actual anon key)

## Step 2: Create Database Schema

### Option A: Using Supabase Dashboard (Easiest)

1. Go to: **https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/sql/new**

2. Copy the entire contents of `backend/supabase-schema.sql`

3. Paste into the SQL Editor

4. Click **"Run"** button (or press Ctrl+Enter)

5. You should see: "Success. No rows returned"

6. Verify tables were created:
   - Go to: **https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/editor**
   - You should see these tables:
     - students
     - staff
     - quiz_results
     - recommendations
     - emotional_states
     - learning_analytics_reports
     - video_recommendations
     - video_watch_history

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Already linked
supabase link --project-ref fdydjjwtwqbjmyydolmo

# Create migration
supabase migration new initial_schema

# Copy schema to migration file
# Then push
supabase db push
```

## Step 3: Seed the Database

Once your `.env` is updated with the correct anon key:

```bash
npm run seed:supabase
```

**Expected Output:**
```
🌱 Starting Supabase database seeding...

🗑️  Clearing existing data...
✅ Existing data cleared

📚 Seeding students...
✅ Created 8 students
👨‍💼 Seeding staff...
✅ Created 1 staff members
📝 Seeding quiz results...
✅ Created 15 quiz results
😊 Seeding emotional states...
✅ Created 87 emotional states
📊 Seeding learning analytics...
✅ Created 8 learning analytics reports
🎥 Seeding video recommendations...
✅ Created 8 video recommendations
✅ Created 18 watch history entries

📈 Database Seeding Summary:
================================
Students: 8
Staff: 1
Quiz Results: 15
Emotional States: 87
Learning Analytics: 8
Video Recommendations: 8
Watch History: 18
================================

✅ Supabase database seeding completed successfully!

📝 Test Credentials:
Student: alice.johnson@example.com / password123
Admin: admin@example.com / password123
```

## Step 4: Verify Data

Check your data in Supabase:

1. Go to: **https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/editor**

2. Click on **"students"** table

3. You should see 8 students:
   - Alice Johnson
   - Bob Smith
   - Carol Williams
   - David Brown
   - Emma Davis
   - Frank Miller
   - Grace Wilson
   - Henry Moore

4. Check other tables to verify data

## Step 5: Start Your Application

```bash
npm run dev
```

Open browser: **http://localhost:5000** (or your configured port)

## Step 6: Test Login

Try logging in with these credentials:

**Students:**
- alice.johnson@example.com / password123
- bob.smith@example.com / password123
- carol.williams@example.com / password123

**Admin:**
- admin@example.com / password123

## Troubleshooting

### Error: "Invalid API key"

**Problem:** Wrong anon key in `.env`

**Solution:**
1. Go to: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/settings/api
2. Copy the **"anon public"** key (long string starting with `eyJ`)
3. Update `.env` file
4. Restart your server

### Error: "relation does not exist"

**Problem:** Database schema not created

**Solution:**
1. Go to SQL Editor: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/sql/new
2. Copy and run `backend/supabase-schema.sql`
3. Verify tables exist in Table Editor

### Error: "Cannot connect to Supabase"

**Problem:** Network or configuration issue

**Solution:**
1. Check internet connection
2. Verify SUPABASE_URL is correct: `https://fdydjjwtwqbjmyydolmo.supabase.co`
3. Verify anon key is correct
4. Check Supabase project status (not paused)

### Seed Script Hangs

**Problem:** RLS policies or network issue

**Solution:**
1. Check Supabase Dashboard logs: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/logs
2. Verify RLS policies allow inserts
3. Try clearing data manually and reseeding

## Quick Reference

**Your Supabase Project:**
- Dashboard: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo
- SQL Editor: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/sql
- Table Editor: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/editor
- API Settings: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/settings/api
- Logs: https://app.supabase.com/project/fdydjjwtwqbjmyydolmo/logs

**Commands:**
```bash
# Seed database
npm run seed:supabase

# Start server
npm run dev

# View logs
# Check Supabase Dashboard
```

**Test Credentials:**
```
Student: alice.johnson@example.com / password123
Admin: admin@example.com / password123
```

## What's Next?

After successful setup:

1. ✅ Explore student dashboard
2. ✅ Test admin panel
3. ✅ Try AI chatbot
4. ✅ Check analytics features
5. ✅ Test coding platform
6. ✅ Review video recommendations

## Important Notes

### Security:
- ⚠️ Never commit `.env` file to git
- ⚠️ Change default passwords in production
- ⚠️ Update RLS policies for production use

### Data:
- All seeded data is fake/synthetic
- Safe for testing and development
- Can be cleared and reseeded anytime

### Support:
- Check `SUPABASE_SETUP_GUIDE.md` for detailed info
- Review `DATABASE_SETUP_COMPLETE.md` for overview
- Check Supabase docs: https://supabase.com/docs

---

**You're all set! Happy coding! 🚀**

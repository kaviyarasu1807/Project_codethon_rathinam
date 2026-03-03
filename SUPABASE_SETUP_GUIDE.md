# Supabase Setup & Seeding Guide

## Overview
Complete guide to set up and populate your Supabase database for the NeuroPath Learning DNA System.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install globally
   ```bash
   npm install -g supabase
   ```
3. **Project Created**: Create a new project in Supabase dashboard

## Step-by-Step Setup

### Step 1: Link Your Supabase Project

You've already started this with:
```bash
supabase link --project-ref fdydjjwtwqbjmyydolmo
```

This connects your local project to your Supabase cloud project.

### Step 2: Configure Environment Variables

Create or update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://fdydjjwtwqbjmyydolmo.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Get these from: Supabase Dashboard > Settings > API
```

**To find your keys:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### Step 3: Create Database Schema

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `backend/supabase-schema.sql`
3. Paste into SQL Editor
4. Click **Run**

#### Option B: Using Supabase CLI
```bash
# Create a new migration
supabase migration new initial_schema

# This creates: supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql
```

Then copy the schema from `backend/supabase-schema.sql` into the migration file.

```bash
# Push to Supabase
supabase db push
```

### Step 4: Verify Schema Creation

Check in Supabase Dashboard:
1. Go to **Table Editor**
2. You should see these tables:
   - students
   - staff
   - quiz_results
   - recommendations
   - emotional_states
   - learning_analytics_reports
   - video_recommendations
   - video_watch_history

### Step 5: Seed the Database

Run the seeding script:

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

### Step 6: Verify Data

Check in Supabase Dashboard:
1. Go to **Table Editor**
2. Click on **students** table
3. You should see 8 students
4. Check other tables for data

### Step 7: Test Login

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open browser: `http://localhost:3000`

3. Login with test credentials:
   - **Student**: `alice.johnson@example.com` / `password123`
   - **Admin**: `admin@example.com` / `password123`

## Supabase CLI Commands Reference

### Project Management
```bash
# Link to existing project
supabase link --project-ref YOUR_PROJECT_REF

# Check project status
supabase status

# Login to Supabase
supabase login
```

### Database Migrations
```bash
# Create new migration
supabase migration new migration_name

# List migrations
supabase migration list

# Push migrations to remote
supabase db push

# Pull remote changes
supabase db pull

# Reset local database
supabase db reset
```

### Local Development
```bash
# Start local Supabase (Docker required)
supabase start

# Stop local Supabase
supabase stop

# View local dashboard
# Opens at: http://localhost:54323
```

## Troubleshooting

### Error: "Invalid API key"
**Solution:**
1. Check `.env` file has correct `SUPABASE_ANON_KEY`
2. Regenerate key in Supabase Dashboard if needed
3. Restart your server after updating `.env`

### Error: "relation does not exist"
**Solution:**
1. Schema not created yet
2. Run the SQL schema in Supabase Dashboard SQL Editor
3. Or use `supabase db push` with migration file

### Error: "duplicate key value violates unique constraint"
**Solution:**
1. Data already exists
2. The seed script clears data first, but if it fails:
   ```sql
   -- Run in SQL Editor
   DELETE FROM emotional_states;
   DELETE FROM quiz_results;
   DELETE FROM video_watch_history;
   DELETE FROM video_recommendations;
   DELETE FROM learning_analytics_reports;
   DELETE FROM students;
   DELETE FROM staff;
   ```
3. Run seed script again

### Error: "Cannot connect to Supabase"
**Solution:**
1. Check internet connection
2. Verify `SUPABASE_URL` is correct
3. Check Supabase project is active (not paused)
4. Verify API keys are valid

### Seed Script Hangs
**Solution:**
1. Check Supabase Dashboard for errors
2. Look at **Logs** in Dashboard
3. Verify RLS policies allow inserts
4. Try seeding one table at a time

## Database Schema Overview

### Core Tables

#### students
- User accounts for students
- Stores face descriptors for proctoring
- Links to quiz results and emotional states

#### staff
- Admin/staff user accounts
- Access to analytics and reports

#### quiz_results
- Student quiz scores and performance
- Missed and critical concepts
- AI-generated guidance

#### emotional_states
- Real-time stress and happiness tracking
- Captured during quizzes
- Used for analytics

#### learning_analytics_reports
- Comprehensive student health reports
- Performance trends
- Intervention flags

#### video_recommendations
- Personalized video suggestions
- Study plans
- Learning resources

#### video_watch_history
- Video viewing tracking
- Completion rates
- Engagement metrics

### Relationships
```
students (1) ──→ (many) quiz_results
students (1) ──→ (many) emotional_states
students (1) ──→ (many) learning_analytics_reports
students (1) ──→ (many) video_recommendations
students (1) ──→ (many) video_watch_history
```

## Row Level Security (RLS)

The schema includes RLS policies for security:

### Current Policies:
- **Public read** on recommendations
- **Students** can read their own data
- **Staff** can read all student data
- **Insert** allowed for quiz results and emotional states

### Customizing RLS:
Edit policies in Supabase Dashboard:
1. Go to **Authentication** > **Policies**
2. Select table
3. Add/Edit policies

Example policy:
```sql
-- Students can only see their own data
CREATE POLICY "Students see own data"
ON students
FOR SELECT
USING (auth.uid() = id);
```

## Data Management

### Viewing Data
```bash
# Using Supabase Dashboard
1. Go to Table Editor
2. Select table
3. View/Edit rows

# Using SQL Editor
SELECT * FROM students LIMIT 10;
SELECT * FROM quiz_results WHERE score > 80;
```

### Exporting Data
```bash
# From Supabase Dashboard
1. Go to Table Editor
2. Select table
3. Click "..." menu
4. Choose "Download as CSV"
```

### Backing Up Data
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Restore
supabase db reset
psql -h db.PROJECT_REF.supabase.co -U postgres -f backup.sql
```

## Production Considerations

### Before Going Live:

1. **Update RLS Policies**
   - Restrict data access properly
   - Test with real user accounts

2. **Change Default Passwords**
   - Don't use `password123` in production
   - Implement proper password hashing

3. **Enable Email Confirmation**
   - Configure in Supabase Auth settings
   - Set up email templates

4. **Set Up Backups**
   - Enable automatic backups in Supabase
   - Schedule regular exports

5. **Monitor Usage**
   - Check Supabase Dashboard metrics
   - Set up alerts for errors

6. **Optimize Queries**
   - Add indexes for frequently queried columns
   - Use views for complex queries

## Test Credentials

### Students:
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

### Admin:
```
admin@example.com / password123
```

## Quick Reference

```bash
# Setup
supabase link --project-ref YOUR_PROJECT_REF
npm run seed:supabase

# Development
npm run dev

# Check data
# Go to: https://app.supabase.com/project/YOUR_PROJECT_REF/editor

# Reseed
npm run seed:supabase

# View logs
# Go to: https://app.supabase.com/project/YOUR_PROJECT_REF/logs
```

## Next Steps

1. ✅ Link Supabase project
2. ✅ Configure environment variables
3. ✅ Create database schema
4. ✅ Seed database
5. ✅ Test login
6. 🔄 Customize for your needs
7. 🚀 Deploy to production

## Support

**Issues?**
- Check [Supabase Documentation](https://supabase.com/docs)
- Review [Supabase Discord](https://discord.supabase.com)
- Check error logs in Supabase Dashboard

**Questions?**
- Review this guide
- Check `backend/supabase-schema.sql`
- Review `scripts/seed-supabase.ts`

---

**Happy building with Supabase! 🚀**

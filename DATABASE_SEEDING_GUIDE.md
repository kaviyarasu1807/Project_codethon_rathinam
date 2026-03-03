# Database Seeding Guide

## Overview
This guide explains how to populate your NeuroPath Learning DNA database with sample data for testing and development.

## Prerequisites

### 1. Database Setup
Make sure you have either:
- **MongoDB Atlas** connection configured in `.env`
- **Supabase** connection configured in `.env`

### 2. Environment Variables
Ensure your `.env` file contains:

```env
# For MongoDB
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=neuropath_learning_dna

# OR for Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Seeding Options

### Option 1: Quick Seed (Recommended for Testing)
Creates minimal test data (3 users, basic quiz results, emotional states)

```bash
npm run seed:quick
```

**What it creates:**
- 2 students + 1 admin
- 2 quiz results
- 10 emotional state records

**Test Credentials:**
- Student: `student@test.com` / `password123`
- Admin: `admin@test.com` / `password123`
- Student 2: `jane@test.com` / `password123`

**Use when:**
- Quick testing needed
- Development environment
- CI/CD pipelines
- Demo purposes

### Option 2: Full Seed (Comprehensive Data)
Creates realistic, comprehensive sample data

```bash
npm run seed
```

**What it creates:**
- 10 students + 1 admin
- 15-30 quiz results
- 100-300 emotional states
- 50+ SAFA concept mastery records
- 100+ answer attempt records
- 10-30 learning analytics reports
- 10+ video recommendations
- 20-50 video watch history entries

**Test Credentials:**
- Student: `alice.johnson@example.com` / `password123`
- Admin: `admin@example.com` / `password123`
- More students: `bob.smith@example.com`, `carol.williams@example.com`, etc.

**Use when:**
- Testing analytics features
- Performance testing
- Demonstrating full system capabilities
- Production-like environment

## Sample Data Details

### Students Created

#### Quick Seed:
1. **Test Student** - Computer Science
2. **Test Admin** - Administrator
3. **Jane Doe** - Engineering

#### Full Seed:
1. **Alice Johnson** - Computer Science (MIT)
2. **Bob Smith** - Engineering (Stanford)
3. **Carol Williams** - Medical (Harvard)
4. **David Brown** - Computer Science (UC Berkeley)
5. **Emma Davis** - Engineering (Carnegie Mellon)
6. **Frank Miller** - Medical (Oxford)
7. **Grace Wilson** - Computer Science (Stanford)
8. **Henry Moore** - Engineering (IIT Bombay)
9. **Ivy Taylor** - Arts (Cambridge)
10. **Jack Anderson** - Computer Science (MIT)
11. **Admin User** - Administrator

### Data Characteristics

#### Quiz Results:
- Scores: 40-100%
- Levels: Beginner, Intermediate, Advanced
- Missed concepts based on domain
- Critical concepts for struggling areas
- Timing data (10-30 minutes per quiz)
- Behavioral metrics (typing speed, tab switches, etc.)

#### Emotional States:
- Stress levels: 20-80%
- Happiness levels: 40-90%
- Focus levels: 50-90%
- Timestamps spread over last 30 days
- Realistic patterns and variations

#### SAFA Data:
- Concept mastery scores: 0-100%
- Multiple attempts per concept
- Success rates: 30-80%
- Trend analysis (improving/declining/stable)
- Confidence levels (low/medium/high)

#### Learning Analytics:
- Health scores: 0-100
- Overall health: excellent/good/fair/poor/critical
- Performance trends
- Engagement levels
- Learning style identification
- Intervention flags for struggling students

#### Video Recommendations:
- Personalized video suggestions
- Study plans (immediate/weekly/monthly)
- Watch history with completion rates
- Resource links and articles
- Estimated study times

## Running the Seeds

### Step 1: Ensure Database Connection
Test your database connection first:

```bash
# For MongoDB
npm run dev:mongodb

# For Supabase
npm run dev
```

If you see connection errors, fix your `.env` configuration first.

### Step 2: Run Seed Script

For quick testing:
```bash
npm run seed:quick
```

For comprehensive data:
```bash
npm run seed
```

### Step 3: Verify Data
The script will output a summary:

```
📈 Database Seeding Summary:
================================
Students: 11
Quiz Results: 23
Emotional States: 187
SAFA Concept Masteries: 55
SAFA Answer Attempts: 142
Learning Analytics Reports: 18
Video Recommendations: 11
Video Watch History: 43
================================
```

## Using the Seeded Data

### Login to Application
1. Start the server:
   ```bash
   npm run dev:mongodb
   ```

2. Open browser: `http://localhost:3000`

3. Login with test credentials:
   - Student: `student@test.com` / `password123`
   - Admin: `admin@test.com` / `password123`

### Explore Features

#### As Student:
- View dashboard with quiz scores
- See emotional intelligence history
- Check weak topics analysis
- Access video recommendations
- Use AI chatbot for help

#### As Admin:
- View all students
- See class-wide analytics
- Identify struggling students
- Access intervention recommendations
- Use admin AI chatbot

## Customizing Seed Data

### Modify Student Count
Edit `scripts/seed-database.ts`:

```typescript
// Add more students to the array
const students = [
  // ... existing students
  {
    name: 'Your Name',
    email: 'your.email@example.com',
    // ... other fields
  }
];
```

### Adjust Data Ranges
Modify the random ranges:

```typescript
// Change score range (currently 40-100)
const score = Math.floor(Math.random() * 60) + 40;

// Change to 60-100
const score = Math.floor(Math.random() * 40) + 60;
```

### Add Custom Concepts
Edit the concepts object:

```typescript
const concepts = {
  'Engineering': ['Your Concept', 'Another Concept', ...],
  // ... other domains
};
```

## Troubleshooting

### Error: "Cannot connect to database"
**Solution:**
1. Check `.env` file exists
2. Verify DATABASE_URL is correct
3. Ensure network access (MongoDB Atlas IP whitelist)
4. Test connection manually

### Error: "Duplicate key error"
**Solution:**
The seed script clears existing data first. If you see this:
1. Manually clear collections
2. Run seed again
3. Or use different email addresses

### Error: "Module not found"
**Solution:**
```bash
npm install
```

### Slow Seeding
**Solution:**
- Use `seed:quick` for faster seeding
- Check network connection
- Reduce number of records in seed script

## Clearing Database

### Manual Clear
```bash
# MongoDB
mongosh "your-connection-string"
use neuropath_learning_dna
db.dropDatabase()

# Supabase
# Use Supabase dashboard SQL editor
DELETE FROM students;
DELETE FROM quiz_results;
-- etc.
```

### Programmatic Clear
The seed scripts automatically clear data before seeding.

## Best Practices

### Development:
- Use `seed:quick` for daily development
- Run full seed weekly to test analytics
- Keep test credentials simple

### Testing:
- Run full seed before major testing
- Document which seed version was used
- Reset database between test runs

### Demo/Production:
- Never use seed scripts in production
- Create real user accounts
- Use migration scripts for schema changes

## Data Privacy

### Important Notes:
- All seeded data is **fake/synthetic**
- Email addresses use `@example.com` or `@test.com`
- Phone numbers use fake format
- Addresses are fictional
- Face descriptors are random arrays

### GDPR Compliance:
- No real personal data
- Safe for demos and testing
- Can be freely shared in development

## Advanced Usage

### Seed Specific Collections
Create custom seed scripts:

```typescript
// scripts/seed-students-only.ts
import { connectMongoDB, Student } from '../backend/mongodb';

async function seedStudentsOnly() {
  await connectMongoDB();
  await Student.deleteMany({});
  await Student.insertMany([/* your students */]);
}
```

### Seed from CSV
```typescript
import fs from 'fs';
import csv from 'csv-parser';

const students = [];
fs.createReadStream('students.csv')
  .pipe(csv())
  .on('data', (row) => students.push(row))
  .on('end', () => Student.insertMany(students));
```

### Seed with Faker.js
```bash
npm install @faker-js/faker
```

```typescript
import { faker } from '@faker-js/faker';

const student = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  address: faker.location.streetAddress(),
  // ...
};
```

## Support

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Verify environment variables
4. Test database connection
5. Check MongoDB/Supabase dashboard

## Summary

**Quick Start:**
```bash
# 1. Configure .env
# 2. Run quick seed
npm run seed:quick

# 3. Start server
npm run dev:mongodb

# 4. Login
# student@test.com / password123
```

**Full Data:**
```bash
npm run seed
```

**Clear & Reseed:**
```bash
npm run seed:quick  # Automatically clears first
```

---

Happy seeding! 🌱

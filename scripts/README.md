# Database Seeding Scripts

This folder contains scripts to populate the database with sample data for testing and development.

## Available Scripts

### 1. `seed-database.ts` - Full Seed
Comprehensive seeding with realistic data for all collections.

**Usage:**
```bash
npm run seed
```

**Creates:**
- 10 students + 1 admin (11 total users)
- 15-30 quiz results with varied scores
- 100-300 emotional state records
- 50+ SAFA concept mastery records
- 100+ answer attempt records
- 10-30 learning analytics reports
- 10+ video recommendations
- 20-50 video watch history entries

**Time:** ~10-30 seconds

**Best for:**
- Full system testing
- Analytics feature testing
- Performance testing
- Demonstrations
- Production-like environment

---

### 2. `quick-seed.ts` - Quick Seed
Minimal seeding for rapid testing.

**Usage:**
```bash
npm run seed:quick
```

**Creates:**
- 2 students + 1 admin (3 total users)
- 2 quiz results
- 10 emotional state records

**Time:** ~2-5 seconds

**Best for:**
- Daily development
- Quick testing
- CI/CD pipelines
- Unit tests
- Rapid iteration

---

## Test Credentials

### Quick Seed:
```
Student: student@test.com / password123
Admin:   admin@test.com / password123
Student: jane@test.com / password123
```

### Full Seed:
```
Student: alice.johnson@example.com / password123
Admin:   admin@example.com / password123

More students:
- bob.smith@example.com
- carol.williams@example.com
- david.brown@example.com
- emma.davis@example.com
- frank.miller@example.com
- grace.wilson@example.com
- henry.moore@example.com
- ivy.taylor@example.com
- jack.anderson@example.com
```

All passwords: `password123`

---

## How It Works

### 1. Connection
Scripts connect to MongoDB using environment variables:
```typescript
import { connectMongoDB } from '../backend/mongodb';
await connectMongoDB();
```

### 2. Clear Existing Data
Before seeding, all existing data is cleared:
```typescript
await Student.deleteMany({});
await QuizResult.deleteMany({});
// ... etc
```

### 3. Generate Data
Realistic data is generated using:
- Random number generation
- Predefined arrays (domains, departments, colleges)
- Calculated relationships (mastery scores, trends)
- Time-based data (timestamps, durations)

### 4. Insert Data
Data is inserted in batches:
```typescript
const students = await Student.insertMany([...]);
const quizResults = await QuizResult.insertMany([...]);
```

### 5. Summary
Final counts are displayed:
```
📈 Database Seeding Summary:
================================
Students: 11
Quiz Results: 23
...
```

---

## Data Characteristics

### Students
- **Domains:** Engineering, Medical, Computer Science, Arts
- **Departments:** Domain-specific (e.g., Software Engineering, Mechanical)
- **Colleges:** Top universities (MIT, Stanford, Harvard, etc.)
- **Face Descriptors:** 128-dimensional random arrays
- **Contact Info:** Fake phone numbers and addresses

### Quiz Results
- **Scores:** 40-100% (realistic distribution)
- **Levels:** Beginner (40-59), Intermediate (60-79), Advanced (80-100)
- **Concepts:** Domain-specific (e.g., Data Structures for CS)
- **Timing:** 10-30 minutes per quiz
- **Behavioral:** Typing speed, tab switches, voice detection

### Emotional States
- **Stress:** 20-80% (varied patterns)
- **Happiness:** 40-90% (generally positive)
- **Focus:** 50-90% (high engagement)
- **Timestamps:** Spread over last 30 days

### SAFA Data
- **Mastery Scores:** 0-100% per concept
- **Attempts:** 5-20 per concept
- **Success Rates:** 30-80% (realistic learning curves)
- **Trends:** Improving, declining, or stable
- **Confidence:** Low, medium, or high

### Learning Analytics
- **Health Scores:** 0-100
- **Health Levels:** Excellent, good, fair, poor, critical
- **Trends:** Improving, declining, stable, fluctuating
- **Engagement:** High, medium, low
- **Learning Styles:** Visual, auditory, kinesthetic, reading-writing, mixed

### Video Recommendations
- **Videos:** 3-5 per student
- **Resources:** Articles and practice problems
- **Study Plans:** Immediate, weekly, monthly goals
- **Watch History:** 2-5 videos watched per student
- **Completion:** 30-80% watch rates

---

## Customization

### Add More Students
Edit `seed-database.ts`:
```typescript
const students = [
  // ... existing students
  {
    name: 'New Student',
    email: 'new@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'student',
    domain: 'Computer Science',
    department: 'AI/ML',
    // ... other fields
  }
];
```

### Change Data Ranges
Modify random generation:
```typescript
// Current: 40-100
const score = Math.floor(Math.random() * 60) + 40;

// Change to: 60-100
const score = Math.floor(Math.random() * 40) + 60;
```

### Add Custom Concepts
Edit concepts object:
```typescript
const concepts = {
  'Engineering': ['New Concept', 'Another Concept', ...],
  'Medical': [...],
  'Computer Science': [...],
  'Arts': [...]
};
```

### Adjust Quantities
Change loop counts:
```typescript
// Current: 1-3 quizzes per student
const numQuizzes = Math.floor(Math.random() * 3) + 1;

// Change to: 3-5 quizzes
const numQuizzes = Math.floor(Math.random() * 3) + 3;
```

---

## Troubleshooting

### "Cannot connect to database"
**Check:**
1. `.env` file exists
2. `DATABASE_URL` is correct
3. Network access (MongoDB Atlas IP whitelist)
4. Database is running

**Fix:**
```bash
# Test connection
npm run dev:mongodb
```

### "Duplicate key error"
**Cause:** Email already exists

**Fix:**
Scripts clear data first, but if error persists:
```typescript
// Use different emails
email: `student${Date.now()}@test.com`
```

### "Module not found"
**Fix:**
```bash
npm install
```

### Slow Performance
**Solutions:**
1. Use `quick-seed` instead
2. Reduce data quantities
3. Check network speed
4. Use local MongoDB instead of Atlas

---

## Development Tips

### Daily Development
```bash
npm run seed:quick
```
Fast, minimal data for quick testing.

### Feature Testing
```bash
npm run seed
```
Full data to test analytics, reports, etc.

### Before Commits
```bash
npm run seed:quick
npm run dev:mongodb
# Test all features
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
- name: Seed Database
  run: npm run seed:quick
  
- name: Run Tests
  run: npm test
```

---

## Best Practices

### ✅ Do:
- Run seed scripts in development/test environments
- Clear data before seeding
- Use fake/synthetic data
- Document which seed was used
- Version control seed scripts

### ❌ Don't:
- Run seeds in production
- Use real personal data
- Commit `.env` files
- Seed without clearing first
- Hardcode sensitive data

---

## File Structure

```
scripts/
├── README.md              # This file
├── seed-database.ts       # Full comprehensive seed
└── quick-seed.ts          # Minimal quick seed
```

---

## Future Enhancements

### Planned Features:
- [ ] Seed from CSV files
- [ ] Seed with Faker.js for more realistic data
- [ ] Partial seeding (specific collections only)
- [ ] Seed with custom configurations
- [ ] Seed data validation
- [ ] Seed rollback functionality

### Contribution:
To add new seed scripts:
1. Create new file in `scripts/` folder
2. Import necessary models
3. Implement seed logic
4. Add npm script to `package.json`
5. Document in this README

---

## Support

**Issues?**
1. Check `DATABASE_SEEDING_GUIDE.md`
2. Review error messages
3. Verify environment variables
4. Test database connection
5. Check MongoDB/Supabase dashboard

**Questions?**
- Review code comments in seed files
- Check MongoDB documentation
- Review Mongoose documentation

---

## Quick Reference

```bash
# Quick seed (3 users, minimal data)
npm run seed:quick

# Full seed (11 users, comprehensive data)
npm run seed

# Start server after seeding
npm run dev:mongodb

# Login credentials
student@test.com / password123
admin@test.com / password123
```

---

**Happy seeding! 🌱**

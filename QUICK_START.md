# Quick Start - Database Seeding

## 🚀 Get Started in 3 Steps

### For Supabase (Your Current Setup)

```bash
# 1. Add credentials to .env
SUPABASE_URL=https://fdydjjwtwqbjmyydolmo.supabase.co
SUPABASE_ANON_KEY=your-key-here

# 2. Run schema in Supabase SQL Editor
# Copy backend/supabase-schema.sql and run it

# 3. Seed and start
npm run seed:supabase && npm run dev
```

**Login:** `alice.johnson@example.com` / `password123`

---

### For MongoDB

```bash
# 1. Add credentials to .env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=neuropath_learning_dna

# 2. Seed and start
npm run seed:quick && npm run dev:mongodb
```

**Login:** `student@test.com` / `password123`

---

## 📝 Test Credentials

### Supabase:
- **Student:** `alice.johnson@example.com` / `password123`
- **Admin:** `admin@example.com` / `password123`

### MongoDB:
- **Student:** `student@test.com` / `password123`
- **Admin:** `admin@test.com` / `password123`

---

## 🛠️ Available Commands

```bash
npm run seed:supabase    # Seed Supabase (8 students + 1 admin)
npm run seed:quick       # Seed MongoDB quick (3 users)
npm run seed             # Seed MongoDB full (11 users)

npm run dev              # Start with Supabase
npm run dev:mongodb      # Start with MongoDB
```

---

## 📚 Full Documentation

- **`DATABASE_SETUP_COMPLETE.md`** - Complete overview
- **`SUPABASE_SETUP_GUIDE.md`** - Supabase detailed guide
- **`DATABASE_SEEDING_GUIDE.md`** - General seeding guide

---

## ✅ What You Get

- Multiple test users (students + admin)
- Quiz results with scores
- Emotional intelligence data
- Learning analytics reports
- Video recommendations
- Complete working system

---

## 🆘 Troubleshooting

**Can't connect?**
- Check `.env` file
- Verify credentials
- Check internet connection

**Schema errors?**
- Run SQL schema in Supabase Dashboard
- Or let MongoDB create automatically

**Login fails?**
- Verify seed completed successfully
- Check server is running
- Use correct credentials

---

**Need help?** Check `DATABASE_SETUP_COMPLETE.md` for detailed instructions.

# NeuroPath Learning DNA System

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🎓 Intelligent Learning Platform with AI-Powered Adaptive Feedback

NeuroPath Learning DNA is a comprehensive educational platform that combines AI-driven learning analytics, adaptive feedback algorithms, face recognition proctoring, and personalized video recommendations to create a truly intelligent learning experience.

---

## ✨ Key Features

### 🧠 Smart Adaptive Feedback Algorithm (SAFA)
- Real-time error classification and analysis
- Dynamic mastery score calculation
- Multi-level feedback (micro, guided, detailed, comprehensive)
- Adaptive question difficulty
- Personalized revision recommendations

### 📊 Learning Analytics AI
- Root problem identification (6 types)
- Health score calculation (0-100)
- Performance trend analysis
- Learning style detection
- Personalized action plans

### 🎥 Video Recommendation Engine
- YouTube video search based on weak concepts
- Intelligent ranking algorithm
- Personalized study plans
- Watch progress tracking
- Estimated study time calculation

### 👤 Face Recognition Proctoring
- Real-time face verification
- Violation detection (no face, multiple faces, face mismatch)
- Screenshot capture
- Auto-submit after violations

### 😊 Emotional Intelligence Tracking
- Real-time stress level monitoring
- Happiness level tracking
- Focus level measurement
- Typing speed analysis

### 📈 Adaptive Learning Dashboard
- Skill analysis (strengths & weaknesses)
- Progress analytics
- Personalized study plans
- Performance trends

### 💻 Coding Platform
- Multi-language code editor (JavaScript, Python, Java, C++)
- Real-time code execution
- Automated test case validation
- LeetCode-style programming challenges
- Syntax highlighting and themes
- Code download and sharing
- Performance metrics

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (for cloud database) OR MongoDB local installation

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd neuropath-learning-dna-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# MongoDB Connection
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
DATABASE_NAME=neuropath_learning_dna

# Server Configuration
PORT=5000
NODE_ENV=development

# YouTube API (Optional)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

4. **Start the server**

**Option 1: SQLite Server (Recommended for Development)**
```bash
npm run dev
```
- Server: http://localhost:3000
- Database: Local SQLite file
- No network required

**Option 2: MongoDB Server (Cloud Database)**
```bash
npm run dev:mongodb
```
- Server: http://localhost:5000
- Database: MongoDB Atlas (cloud)
- Requires network connectivity

5. **Open your browser**
Navigate to http://localhost:3000 (SQLite) or http://localhost:5000 (MongoDB)

---

## 📁 Project Structure

```
neuropath-learning-dna-system/
├── backend/
│   ├── mongodb.ts                      # MongoDB schemas and connection
│   ├── safa-algorithm.ts              # Smart Adaptive Feedback Algorithm
│   ├── learning-analytics-ai.ts       # Learning Analytics AI Engine
│   ├── video-recommendation-engine.ts # Video Recommendation System
│   └── adaptive-learning.ts           # Adaptive Learning Functions
├── src/
│   ├── App.tsx                        # Main React application
│   ├── main.tsx                       # React entry point
│   └── index.css                      # Global styles
├── server-mongodb.ts                  # MongoDB Express Server
├── server.ts                          # SQLite Express Server
├── .env                               # Environment configuration
├── package.json                       # Dependencies and scripts
└── README.md                          # This file
```

---

## 🗄️ Database

### MongoDB Collections (11 Total)
1. **students** - User authentication and profiles
2. **quizresults** - Quiz submissions and performance
3. **emotionalstates** - Real-time emotional tracking
4. **proctoringviolations** - Face recognition violations
5. **safaconceptmasteries** - SAFA mastery tracking
6. **safaanswerattempts** - SAFA answer logs
7. **safafeedbacklogs** - SAFA feedback generation
8. **safarevisionqueues** - SAFA revision management
9. **learninganalyticsreports** - AI analytics reports
10. **videorecommendations** - Personalized video suggestions
11. **videowatchhistories** - Video watch tracking

---

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Quiz System
- `POST /api/quiz/submit` - Submit quiz results
- `GET /api/student/stats/:studentId` - Get student statistics

### Emotional Tracking
- `POST /api/emotional-state` - Save emotional state

### Proctoring
- `POST /api/proctoring/violation` - Log proctoring violation

### SAFA (Smart Adaptive Feedback Algorithm)
- `POST /api/safa/submit-answer` - Submit answer with adaptive feedback
- `GET /api/safa/mastery/:studentId` - Get mastery overview
- `GET /api/safa/revision-queue/:studentId` - Get revision queue
- `GET /api/safa/answer-history/:studentId` - Get answer history
- `GET /api/safa/analytics/:studentId` - Get feedback analytics

### Learning Analytics AI
- `POST /api/analytics/analyze-behavior` - Analyze student behavior
- `GET /api/analytics/health-report/:studentId` - Get health report

### Video Recommendations
- `POST /api/recommendations/generate` - Generate video recommendations
- `GET /api/recommendations/:studentId` - Get latest recommendations
- `POST /api/recommendations/track-watch` - Track video watch
- `GET /api/recommendations/watch-history/:studentId` - Get watch history

### Admin
- `GET /api/admin/students` - Get all students with latest data
- `GET /api/admin/emotional-summary` - Get emotional summary

---

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Player** - Video playback

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Cloud database (Atlas)
- **Mongoose** - MongoDB ODM
- **SQLite** - Local database (fallback)
- **bcryptjs** - Password hashing

### AI & ML
- **TensorFlow.js** - Machine learning
- **face-api.js** - Face recognition
- **Custom SAFA Algorithm** - Adaptive feedback
- **Custom Analytics AI** - Learning analytics

### APIs
- **YouTube Data API** - Video recommendations
- **Google APIs** - YouTube integration

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 30 seconds
- **[BACKEND_CONNECTION_GUIDE.md](BACKEND_CONNECTION_GUIDE.md)** - Complete setup guide
- **[CONNECTION_STATUS.md](CONNECTION_STATUS.md)** - Troubleshooting guide
- **[MONGODB_INTEGRATION_SUMMARY.md](MONGODB_INTEGRATION_SUMMARY.md)** - Technical details
- **[FINAL_STATUS.md](FINAL_STATUS.md)** - Project status report
- **[SAFA_DOCUMENTATION.md](SAFA_DOCUMENTATION.md)** - SAFA algorithm details
- **[LEARNING_ANALYTICS_AI.md](LEARNING_ANALYTICS_AI.md)** - Analytics AI details
- **[VIDEO_RECOMMENDATIONS_GUIDE.md](VIDEO_RECOMMENDATIONS_GUIDE.md)** - Video system guide
- **[CODING_PLATFORM_GUIDE.md](CODING_PLATFORM_GUIDE.md)** - Coding platform documentation

---

## 🔧 Development

### Available Scripts

```bash
# Start SQLite server (development)
npm run dev

# Start MongoDB server (development with auto-reload)
npm run dev:mongodb

# Start MongoDB server (production)
npm run start:mongodb

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Check for TypeScript errors
npm run lint

# Clean build directory
npm run clean
```

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "domain": "Computer Science"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

---

## 🔐 Security

### Implemented
- ✅ Password hashing with bcryptjs
- ✅ Environment variables for sensitive data
- ✅ Input validation in schemas
- ✅ Error handling without exposing internals
- ✅ Role-based access control

### Recommended for Production
- JWT authentication tokens
- Rate limiting middleware
- CORS configuration
- HTTPS only
- Request logging
- Input sanitization
- MongoDB Atlas IP whitelist
- Regular security audits

---

## 🚀 Deployment

### MongoDB Atlas Setup
1. Create account at https://cloud.mongodb.com/
2. Create a new cluster
3. Add database user
4. Whitelist IP addresses
5. Get connection string
6. Update `.env` file

### Production Deployment
1. Build the frontend: `npm run build`
2. Set environment variables
3. Start production server: `npm run start:mongodb`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificate
6. Configure domain name

---

## 📊 Features Overview

| Feature | Description | Status |
|---------|-------------|--------|
| User Authentication | Register, login, role-based access | ✅ Complete |
| Quiz System | Interactive quizzes with scoring | ✅ Complete |
| Coding Platform | Multi-language code editor & compiler | ✅ Complete |
| SAFA Algorithm | Adaptive feedback and mastery tracking | ✅ Complete |
| Learning Analytics | AI-powered behavior analysis | ✅ Complete |
| Video Recommendations | Personalized YouTube videos | ✅ Complete |
| Face Proctoring | Real-time face verification | ✅ Complete |
| Emotional Tracking | Stress, happiness, focus monitoring | ✅ Complete |
| Admin Dashboard | Student overview and analytics | ✅ Complete |
| MongoDB Integration | Cloud database support | ✅ Complete |
| SQLite Fallback | Local database option | ✅ Complete |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Development Team** - Initial work and MongoDB integration

---

## 🙏 Acknowledgments

- TensorFlow.js team for ML capabilities
- face-api.js for face recognition
- MongoDB team for excellent database platform
- React team for amazing UI framework
- All contributors and testers

---

## 📞 Support

For support, please:
1. Check the documentation in the `docs/` folder
2. Review troubleshooting guides
3. Open an issue on GitHub
4. Contact the development team

---

## 🔄 Version History

- **v1.0.0** (March 2026)
  - Initial release
  - Complete MongoDB integration
  - All core features implemented
  - Comprehensive documentation

---

## 🎯 Roadmap

### Upcoming Features
- [ ] JWT authentication
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Gamification features
- [ ] Social learning features
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Microservices architecture

---

**Built with ❤️ by the NeuroPath Team**

**Status**: ✅ Production Ready  
**Last Updated**: March 3, 2026  
**Version**: 1.0.0
#   P r o j e c t _ c o d e t h o n _ r a t h i n a m  
 
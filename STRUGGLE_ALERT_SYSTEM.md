# Automated Student Struggle Alert System

## Overview
Intelligent monitoring system that automatically detects when students are struggling with questions and alerts administrators for timely intervention.

## Features

### 🎯 Automated Detection
- **Real-time Monitoring:** Continuously analyzes student performance
- **Multi-factor Analysis:** Considers time spent, stress levels, tab switches, voice alerts
- **Severity Classification:** Categorizes struggles as Low, Medium, High, or Critical
- **Smart Thresholds:** Adaptive detection based on multiple behavioral indicators

### 📊 Comprehensive Metrics
- Questions attempted vs struggled
- Struggle percentage calculation
- Average time per question
- High-stress question count
- Tab switch tracking
- Voice alert integration
- Last activity timestamp

### 🚨 Alert System
- **Alert Types:**
  - Struggle: Student having difficulty with questions
  - Stress: High stress levels detected
  - Cheating: Suspicious activity (tab switches, voice alerts)
  - Performance: General performance concerns

- **Severity Levels:**
  - **Critical:** Immediate intervention required (>70% struggle rate)
  - **High:** Urgent attention needed (50-70% struggle rate)
  - **Medium:** Monitor closely (30-50% struggle rate)
  - **Low:** Minor concerns (<30% struggle rate)

### 🔔 Admin Dashboard
- Real-time alert notifications
- Unacknowledged alert counter
- Critical student banner
- Detailed metrics table
- Alert acknowledgment system
- Auto-refresh capability
- Manual alert generation

## Components

### 1. Backend: struggle-detection.ts

**Location:** `backend/struggle-detection.ts`

**Core Functions:**

#### detectStruggle()
Determines if a student is struggling based on:
- Time spent (>2-3 minutes)
- Stress level (>45-75%)
- Tab switches (>2-5)
- Multiple attempts (>1-3)
- Wrong answers

**Scoring System:**
```typescript
Time > 3 min: +2 points
Time > 2 min: +1 point
Stress > 75%: +3 points
Stress > 60%: +2 points
Stress > 45%: +1 point
Tab switches > 5: +2 points
Tab switches > 2: +1 point
Attempts > 3: +2 points
Attempts > 1: +1 point
Wrong answer: +2 points

Struggle threshold: ≥5 points
```

#### calculateSeverity()
Determines alert severity based on:
- Struggle percentage
- High-stress question count
- Tab switches
- Voice alerts

**Severity Scoring:**
```typescript
Struggle > 70%: +4 points
Struggle > 50%: +3 points
Struggle > 30%: +2 points
Struggle > 15%: +1 point

High stress > 10: +3 points
High stress > 5: +2 points
High stress > 2: +1 point

Tab switches > 20: +3 points
Tab switches > 10: +2 points
Tab switches > 5: +1 point

Voice alerts > 5: +3 points
Voice alerts > 2: +2 points
Voice alerts > 0: +1 point

Critical: ≥10 points
High: 7-9 points
Medium: 4-6 points
Low: <4 points
```

#### getStudentStruggleMetrics()
Retrieves comprehensive metrics for all students:
```sql
SELECT 
  - Total questions attempted
  - Questions struggled with
  - Average time per question
  - High-stress question count
  - Tab switches
  - Voice alerts
  - Last activity
FROM quiz_results + voice_analysis
WHERE last 7 days
```

#### generateAutomatedAlerts()
Automatically creates alerts for students needing attention:
- Runs periodically (recommended: every 5-10 minutes)
- Checks for existing recent alerts (prevents duplicates)
- Creates alerts for critical/high severity students
- Returns count of alerts created

**API Endpoints:**

**GET /api/admin/struggle-metrics**
```json
{
  "metrics": [...],
  "criticalStudents": [...],
  "summary": {
    "totalStudents": 45,
    "criticalCount": 3,
    "highCount": 7,
    "mediumCount": 12,
    "lowCount": 23
  }
}
```

**GET /api/admin/alerts**
```json
{
  "alerts": [...],
  "statistics": {
    "total_alerts": 28,
    "unacknowledged": 5,
    "critical_count": 2,
    "high_count": 8,
    "struggle_alerts": 15,
    "stress_alerts": 8,
    "cheating_alerts": 5
  }
}
```

**POST /api/admin/alerts/:id/acknowledge**
```json
{
  "adminId": 1
}
```

**GET /api/admin/difficult-questions**
```json
{
  "questions": [
    {
      "question_id": "q123",
      "question_text": "...",
      "students_struggled": 15,
      "avg_time_spent": 245,
      "avg_stress_level": 78
    }
  ]
}
```

**POST /api/admin/generate-alerts**
```json
{
  "success": true,
  "alertsCreated": 3
}
```

### 2. Frontend: StruggleAlerts.tsx

**Location:** `src/StruggleAlerts.tsx`

**Features:**

#### Statistics Cards
- Unacknowledged alerts count
- Critical alerts count
- Struggling students count
- Students needing attention

#### Critical Students Banner
- Animated alert for critical cases
- Shows top 3 students needing immediate attention
- Displays struggle percentage and question counts
- Severity badges

#### Alerts List
- Real-time alert feed
- Color-coded by severity
- Alert type icons
- Detailed metrics display
- Acknowledge button
- Show/hide acknowledged alerts
- Auto-refresh toggle

#### Metrics Table
- Complete student performance overview
- Sortable columns
- Visual progress bars
- Severity indicators
- Hover effects

**Props:**
```typescript
interface StruggleAlertsProps {
  adminId: number;
}
```

**Usage:**
```tsx
import StruggleAlerts from './StruggleAlerts';

<StruggleAlerts adminId={admin.id} />
```

### 3. Database Schema

**struggle_alerts Table:**
```sql
CREATE TABLE struggle_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  metrics TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  acknowledged INTEGER DEFAULT 0,
  acknowledged_by INTEGER,
  acknowledged_at TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);
```

**Indexes:**
- idx_struggle_alerts_student
- idx_struggle_alerts_acknowledged
- idx_struggle_alerts_severity
- idx_struggle_alerts_timestamp

## Integration

### Add to Admin Dashboard

```tsx
import StruggleAlerts from './StruggleAlerts';

function AdminDashboard() {
  return (
    <div>
      {/* Existing admin content */}
      
      {/* Add Struggle Alerts */}
      <StruggleAlerts adminId={user.id} />
    </div>
  );
}
```

### Add API Routes to Server

```typescript
import {
  handleGetStruggleMetrics,
  handleGetAlerts,
  handleAcknowledgeAlert,
  handleGetDifficultQuestions,
  handleGenerateAlerts
} from './backend/struggle-detection';

// Routes
app.get('/api/admin/struggle-metrics', (req, res) => 
  handleGetStruggleMetrics(req, res, db));
app.get('/api/admin/alerts', (req, res) => 
  handleGetAlerts(req, res, db));
app.post('/api/admin/alerts/:id/acknowledge', (req, res) => 
  handleAcknowledgeAlert(req, res, db));
app.get('/api/admin/difficult-questions', (req, res) => 
  handleGetDifficultQuestions(req, res, db));
app.post('/api/admin/generate-alerts', (req, res) => 
  handleGenerateAlerts(req, res, db));
```

### Set Up Automated Alert Generation

**Option 1: Cron Job (Recommended)**
```typescript
import cron from 'node-cron';
import { generateAutomatedAlerts } from './backend/struggle-detection';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const alertsCreated = await generateAutomatedAlerts(db);
  console.log(`Generated ${alertsCreated} alerts`);
});
```

**Option 2: Interval**
```typescript
setInterval(async () => {
  await generateAutomatedAlerts(db);
}, 5 * 60 * 1000); // 5 minutes
```

**Option 3: Manual Trigger**
Admin can click "Generate Alerts" button in dashboard

## Alert Examples

### Struggle Alert
```
Message: "John Doe is struggling with 75% of questions (15/20)"
Type: struggle
Severity: high
Metrics: {
  questions_struggled: 15,
  total_questions: 20,
  avg_time: 185s,
  high_stress: 8
}
```

### Stress Alert
```
Message: "Jane Smith shows high stress on 12 questions"
Type: stress
Severity: high
Metrics: {
  high_stress_questions: 12,
  avg_stress_level: 82%
}
```

### Cheating Alert
```
Message: "Bob Johnson has suspicious activity: 25 tab switches, 4 voice alerts"
Type: cheating
Severity: critical
Metrics: {
  tab_switches: 25,
  voice_alerts: 4
}
```

## Customization

### Adjust Thresholds

**In detectStruggle():**
```typescript
// Change time threshold
if (metrics.timeSpent > 240) // 4 minutes instead of 3

// Change stress threshold
if (metrics.stressLevel > 80) // 80% instead of 75%

// Change struggle score threshold
return struggleScore >= 6; // 6 instead of 5
```

**In calculateSeverity():**
```typescript
// Change severity thresholds
if (severityScore >= 12) return 'critical'; // 12 instead of 10
if (severityScore >= 9) return 'high'; // 9 instead of 7
```

### Add Custom Alert Types

```typescript
// In backend/struggle-detection.ts
export type AlertType = 
  | 'struggle' 
  | 'stress' 
  | 'cheating' 
  | 'performance'
  | 'attendance'  // New type
  | 'engagement'; // New type
```

### Customize Alert Messages

```typescript
// In generateAutomatedAlerts()
if (metric.struggle_percentage > 70) {
  message = `🚨 URGENT: ${metric.student_name} needs immediate help!`;
}
```

## Performance Optimization

1. **Database Indexes:** Already created for fast queries
2. **Caching:** Cache metrics for 1-2 minutes
3. **Batch Processing:** Process alerts in batches
4. **Pagination:** Limit alerts displayed (50-100)
5. **Lazy Loading:** Load metrics on demand

## Monitoring & Analytics

### Track Alert Effectiveness
```sql
SELECT 
  alert_type,
  severity,
  COUNT(*) as count,
  AVG(CASE WHEN acknowledged = 1 THEN 1 ELSE 0 END) as ack_rate
FROM struggle_alerts
GROUP BY alert_type, severity;
```

### Identify Patterns
```sql
SELECT 
  student_id,
  COUNT(*) as alert_count,
  AVG(struggle_percentage) as avg_struggle
FROM struggle_alerts
GROUP BY student_id
HAVING alert_count > 5;
```

## Best Practices

1. **Acknowledge Promptly:** Review and acknowledge alerts within 1 hour
2. **Follow Up:** Contact students with critical/high alerts
3. **Track Trends:** Monitor if alerts decrease after intervention
4. **Adjust Thresholds:** Fine-tune based on your institution's needs
5. **Privacy:** Ensure alerts are only visible to authorized staff
6. **Documentation:** Keep notes on interventions taken

## Testing

### Manual Testing
1. Create test student with poor performance
2. Generate alerts manually
3. Verify alerts appear in dashboard
4. Test acknowledgment functionality
5. Check auto-refresh

### Automated Testing
```typescript
// Test struggle detection
test('detectStruggle identifies struggling student', () => {
  const result = detectStruggle({
    timeSpent: 200,
    stressLevel: 80,
    tabSwitches: 6,
    attempts: 4,
    correctAnswer: false
  });
  expect(result).toBe(true);
});
```

## Troubleshooting

**No alerts appearing:**
- Check if generateAutomatedAlerts() is running
- Verify database has quiz_results data
- Check time window (last 7 days)

**Too many alerts:**
- Increase thresholds in detectStruggle()
- Increase time window for duplicate prevention
- Adjust severity calculation

**Performance issues:**
- Add database indexes
- Implement caching
- Reduce auto-refresh frequency

## Future Enhancements

1. **Email Notifications:** Send alerts to admin email
2. **SMS Alerts:** Critical alerts via SMS
3. **Predictive Analytics:** Predict struggles before they happen
4. **Intervention Tracking:** Track which interventions work
5. **Student Self-Help:** Suggest resources to struggling students
6. **Parent Notifications:** Alert parents of struggling students
7. **AI Recommendations:** AI-suggested interventions
8. **Mobile App:** Mobile alerts for administrators

## Build Status
✅ TypeScript compilation successful
✅ No errors or warnings
✅ All components properly typed
✅ Database schema included
✅ API endpoints documented

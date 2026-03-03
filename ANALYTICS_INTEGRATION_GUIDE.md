# Learning Analytics AI - Integration Guide

## Quick Start

### Step 1: Database Setup

Run the SQL schema to create the analytics table:

```sql
-- Already included in backend/supabase-schema.sql
-- Run the entire file or just the Learning Analytics section
```

### Step 2: Test the API

```bash
# Start server
npm run dev

# Test analytics endpoint
curl -X POST http://localhost:5000/api/analytics/analyze-behavior \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "questionId": "q_1",
    "conceptId": "Data Structures",
    "answer": "0",
    "correctAnswer": "2",
    "timeSpent": 15,
    "expectedTime": 30,
    "attemptNumber": 3,
    "difficulty": "medium",
    "confidenceLevel": 2,
    "hesitationTime": 5,
    "revisionCount": 1,
    "focusLevel": 35,
    "stressLevel": 80
  }'
```

### Step 3: Integrate with Quiz Component

Add to `src/App.tsx` in the `handleAnswer` function:

```typescript
const handleAnswer = async (optionIdx: number | string) => {
  const timeSpent = (Date.now() - questionStartTime) / 1000;
  
  // ... existing SAFA code ...
  
  // Add Learning Analytics AI
  try {
    const analyticsResponse = await fetch('/api/analytics/analyze-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: userId,
        questionId: questionId,
        conceptId: conceptId,
        answer: String(optionIdx),
        correctAnswer: String(correctAnswer),
        timeSpent: timeSpent,
        expectedTime: 60, // or calculate based on difficulty
        attemptNumber: currentAttempt,
        difficulty: currentQuestion.difficulty || 'medium',
        confidenceLevel: 3, // Could add UI for this
        hesitationTime: 0, // Track time to first interaction
        revisionCount: 0, // Track answer changes
        focusLevel: focusLevel,
        stressLevel: stressLevel
      })
    });
    
    const { report } = await analyticsResponse.json();
    
    // Handle the report
    if (report.interventionRequired) {
      // Show intervention modal
      setShowInterventionModal(true);
      setAnalyticsReport(report);
    }
    
    if (report.mentorAlert) {
      // Notify mentor (could be email, notification, etc.)
      console.log('Mentor alert triggered for student:', userId);
    }
    
    // Store report for dashboard
    setLatestHealthReport(report);
    
  } catch (error) {
    console.error('Analytics error:', error);
    // Continue without analytics
  }
  
  // ... rest of existing code ...
};
```

### Step 4: Create Health Dashboard Component

```typescript
const HealthDashboard = ({ report }: { report: AnalyticsReport }) => {
  if (!report) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      {/* Health Score */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Learning Health</h3>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${
            report.overallHealth === 'excellent' ? 'text-green-600' :
            report.overallHealth === 'good' ? 'text-blue-600' :
            report.overallHealth === 'fair' ? 'text-yellow-600' :
            report.overallHealth === 'poor' ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {report.healthScore}
          </div>
          <div>
            <p className="text-sm font-semibold capitalize">{report.overallHealth}</p>
            <p className="text-xs text-stone-500">
              {report.performanceTrend === 'improving' ? '📈 Improving' :
               report.performanceTrend === 'declining' ? '📉 Declining' :
               report.performanceTrend === 'fluctuating' ? '📊 Fluctuating' :
               '➡️ Stable'}
            </p>
          </div>
        </div>
      </div>

      {/* Problems */}
      {report.problems.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold mb-3">Issues Detected</h4>
          <div className="space-y-3">
            {report.problems.map((problem, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                problem.severity === 'critical' ? 'bg-red-50 border-red-500' :
                problem.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                problem.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold capitalize">
                    {problem.type.replace('_', ' ')}
                  </p>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    problem.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    problem.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                    problem.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {problem.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-stone-700 mb-2">{problem.description}</p>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 font-semibold">
                    View Action Plan
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="font-bold">Immediate:</p>
                      <ul className="list-disc list-inside">
                        {problem.actionPlan.immediate.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {report.strengths.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold mb-3">Your Strengths</h4>
          <div className="space-y-2">
            {report.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="text-green-600">✓</span>
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement & Learning Style */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-stone-500">Engagement</p>
          <p className="font-bold capitalize">{report.engagementLevel}</p>
        </div>
        <div>
          <p className="text-stone-500">Learning Style</p>
          <p className="font-bold capitalize">{report.learningStyle}</p>
        </div>
      </div>
    </div>
  );
};
```

### Step 5: Add Intervention Modal

```typescript
const InterventionModal = ({ report, onClose }: { report: AnalyticsReport, onClose: () => void }) => {
  if (!report || !report.interventionRequired) return null;

  const criticalProblems = report.problems.filter(p => 
    p.severity === 'critical' || p.severity === 'high'
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold">Learning Support Needed</h2>
        </div>

        <p className="text-stone-600 mb-6">
          We've detected some challenges in your learning journey. Let's work together to address them!
        </p>

        {criticalProblems.map((problem, idx) => (
          <div key={idx} className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <h3 className="font-bold text-lg mb-2 capitalize">
              {problem.type.replace('_', ' ')}
            </h3>
            <p className="text-sm text-stone-700 mb-4">{problem.rootCause}</p>
            
            <div className="mb-4">
              <p className="font-bold text-sm mb-2">What to do right now:</p>
              <ul className="space-y-2">
                {problem.actionPlan.immediate.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 mt-1">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-stone-500">
              Estimated recovery time: {problem.estimatedRecoveryTime}
            </p>
          </div>
        ))}

        {report.mentorAlert && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm">
              <strong>Good news!</strong> We've notified your mentor about these challenges. 
              They'll reach out soon to provide personalized support.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-bold"
        >
          I Understand - Let's Improve!
        </button>
      </motion.div>
    </motion.div>
  );
};
```

---

## Complete Integration Checklist

- [ ] Database schema updated
- [ ] API endpoints tested
- [ ] Quiz component integrated
- [ ] Health dashboard created
- [ ] Intervention modal added
- [ ] Mentor alert system configured
- [ ] Analytics tracking enabled
- [ ] UI components styled
- [ ] Error handling implemented
- [ ] Testing completed

---

## Testing Scenarios

### Test 1: Concept Gap Detection
```javascript
// Answer 3 questions wrong in same concept
// Expected: Concept Gap problem detected
```

### Test 2: Speed Issue Detection
```javascript
// Take 2x expected time on 3+ questions
// Expected: Speed Issue problem detected
```

### Test 3: Guessing Habit Detection
```javascript
// Answer quickly (<15s) and incorrectly 2+ times
// Expected: Guessing Habit problem detected
```

### Test 4: Engagement Issue Detection
```javascript
// Set focusLevel < 40% for 3+ questions
// Expected: Engagement Issue problem detected
```

### Test 5: Critical Health
```javascript
// Trigger multiple high/critical problems
// Expected: Intervention modal + Mentor alert
```

---

## Mentor Dashboard (Optional)

Create an admin view to see students needing intervention:

```typescript
const MentorDashboard = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch students with mentor alerts
    fetch('/api/analytics/mentor-alerts')
      .then(res => res.json())
      .then(data => setAlerts(data.alerts));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Students Needing Support</h2>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.studentId} className="bg-white p-4 rounded-xl border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{alert.studentName}</h3>
                <p className="text-sm text-stone-500">{alert.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                alert.overallHealth === 'critical' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {alert.overallHealth.toUpperCase()}
              </span>
            </div>
            <p className="text-sm mb-2">Health Score: {alert.healthScore}/100</p>
            <p className="text-xs text-stone-600">
              Problems: {JSON.parse(alert.problems).length} detected
            </p>
            <button className="mt-3 text-sm text-blue-600 font-semibold">
              View Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

**Status**: ✅ Ready for Integration

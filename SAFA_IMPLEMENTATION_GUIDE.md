# SAFA Implementation Guide

## Quick Start

### Step 1: Database Setup
The database tables are automatically created when you start the server. No manual setup required!

### Step 2: Test the API

#### Test Answer Submission
```bash
curl -X POST http://localhost:3000/api/safa/submit-answer \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "questionId": "q1",
    "conceptId": "algebra_basics",
    "answer": "42",
    "correctAnswer": "45",
    "attemptNumber": 1,
    "timeSpent": 45,
    "difficulty": "medium"
  }'
```

#### Get Mastery Overview
```bash
curl http://localhost:3000/api/safa/mastery/1
```

#### Get Revision Queue
```bash
curl http://localhost:3000/api/safa/revision-queue/1
```

#### Get Analytics
```bash
curl http://localhost:3000/api/safa/analytics/1
```

### Step 3: Frontend Integration

#### Add SAFA Hook to Quiz Component
```typescript
// In src/App.tsx - Quiz component

const [safaFeedback, setSafaFeedback] = useState<any>(null);
const [showFeedback, setShowFeedback] = useState(false);
const [masteryScores, setMasteryScores] = useState<any>({});

// Submit answer with SAFA
const handleAnswerWithSAFA = async (answer: number | string) => {
  const questionStartTime = Date.now();
  const timeSpent = (questionStartTime - questionStartTime) / 1000;
  
  try {
    const response = await fetch('/api/safa/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: userId,
        questionId: questions[currentIdx].q,
        conceptId: questions[currentIdx].concept,
        answer: answer,
        correctAnswer: questions[currentIdx].correct,
        attemptNumber: 1,
        timeSpent: timeSpent,
        difficulty: questions[currentIdx].difficulty || 'medium'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setSafaFeedback(data.feedback);
      setShowFeedback(true);
      
      // Update mastery display
      setMasteryScores(prev => ({
        ...prev,
        [data.feedback.masteryUpdate.conceptId]: data.feedback.masteryUpdate
      }));
    }
  } catch (error) {
    console.error('SAFA feedback error:', error);
  }
};
```

#### Display Feedback Component
```typescript
// Feedback Display Component
{showFeedback && safaFeedback && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={() => setShowFeedback(false)}
  >
    <div 
      className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">
          {safaFeedback.errorClassification.errorType === 'careless' 
            ? '✅ Correct!' 
            : '💡 Let\'s Learn Together'}
        </h3>
        <button onClick={() => setShowFeedback(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Confidence Boost */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl mb-4">
        <p className="text-lg font-semibold text-center">
          {safaFeedback.confidenceBoost}
        </p>
      </div>
      
      {/* Mastery Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-stone-600">
            Mastery Score: {safaFeedback.masteryUpdate.conceptName}
          </span>
          <span className="text-2xl font-bold text-emerald-600">
            {safaFeedback.masteryUpdate.masteryScore}%
          </span>
        </div>
        <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
            style={{ width: `${safaFeedback.masteryUpdate.masteryScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-stone-500 mt-1">
          <span>Trend: {safaFeedback.masteryUpdate.trend}</span>
          <span>Confidence: {safaFeedback.masteryUpdate.confidenceLevel}</span>
        </div>
      </div>
      
      {/* Feedback Content */}
      {safaFeedback.feedbackLevel.content.hint && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm font-bold text-blue-900 mb-2">💡 Hint</p>
          <p className="text-blue-800">{safaFeedback.feedbackLevel.content.hint}</p>
        </div>
      )}
      
      {safaFeedback.feedbackLevel.content.explanation && (
        <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm font-bold text-purple-900 mb-2">📖 Explanation</p>
          <p className="text-purple-800">{safaFeedback.feedbackLevel.content.explanation}</p>
        </div>
      )}
      
      {safaFeedback.feedbackLevel.content.steps && (
        <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm font-bold text-amber-900 mb-2">📝 Step-by-Step</p>
          <ol className="list-decimal list-inside space-y-2">
            {safaFeedback.feedbackLevel.content.steps.map((step, idx) => (
              <li key={idx} className="text-amber-800">{step}</li>
            ))}
          </ol>
        </div>
      )}
      
      {/* Revision Recommendation */}
      {safaFeedback.revisionRecommended && (
        <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-sm font-bold text-red-900 mb-2">⚠️ Revision Recommended</p>
          <p className="text-red-800 mb-2">
            We recommend reviewing these concepts:
          </p>
          <ul className="list-disc list-inside">
            {safaFeedback.revisionConcepts.map((concept, idx) => (
              <li key={idx} className="text-red-700">{concept}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Next Question Info */}
      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
        <span className="text-sm text-stone-600">Next Question Difficulty:</span>
        <span className={`font-bold ${
          safaFeedback.nextQuestionDifficulty === 'easier' ? 'text-green-600' :
          safaFeedback.nextQuestionDifficulty === 'harder' ? 'text-red-600' :
          'text-blue-600'
        }`}>
          {safaFeedback.nextQuestionDifficulty.toUpperCase()}
        </span>
      </div>
      
      {/* Continue Button */}
      <button
        onClick={() => {
          setShowFeedback(false);
          // Move to next question
        }}
        className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
      >
        Continue
      </button>
    </div>
  </motion.div>
)}
```

#### Display Mastery Dashboard
```typescript
// Mastery Overview Component
const MasteryDashboard = ({ studentId }: { studentId: number }) => {
  const [mastery, setMastery] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`/api/safa/mastery/${studentId}`)
      .then(res => res.json())
      .then(data => setMastery(data.mastery));
  }, [studentId]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mastery.map(concept => (
        <div key={concept.concept_id} className="bg-white p-4 rounded-xl border border-stone-200">
          <h4 className="font-bold text-stone-900 mb-2">{concept.concept_name}</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-emerald-600">
              {concept.mastery_score}%
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              concept.trend === 'improving' ? 'bg-green-100 text-green-700' :
              concept.trend === 'declining' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {concept.trend}
            </span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500"
              style={{ width: `${concept.mastery_score}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-stone-500">
            {concept.total_attempts} attempts • {concept.correct_attempts} correct
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Testing Scenarios

### Scenario 1: First Attempt - Correct Answer
```json
{
  "attemptNumber": 1,
  "answer": "45",
  "correctAnswer": "45",
  "timeSpent": 30
}
```
**Expected**: Micro hint, mastery increases, next question same/harder

### Scenario 2: First Attempt - Wrong Answer (Quick)
```json
{
  "attemptNumber": 1,
  "answer": "42",
  "correctAnswer": "45",
  "timeSpent": 15
}
```
**Expected**: Careless error, guided hint, mastery slight decrease

### Scenario 3: Multiple Attempts - Still Wrong
```json
{
  "attemptNumber": 3,
  "answer": "40",
  "correctAnswer": "45",
  "timeSpent": 90
}
```
**Expected**: Conceptual error, detailed explanation, revision recommended

### Scenario 4: Slow but Correct
```json
{
  "attemptNumber": 1,
  "answer": "45",
  "correctAnswer": "45",
  "timeSpent": 120
}
```
**Expected**: Procedural issue noted, mastery increases moderately

## Monitoring Dashboard

### Key Metrics to Track
1. **Average Mastery Score**: Overall student performance
2. **Error Distribution**: Most common error types
3. **Feedback Effectiveness**: Improvement after feedback
4. **Time Efficiency**: Average time vs expected
5. **Revision Completion Rate**: How many students complete revisions

### SQL Queries for Monitoring

```sql
-- Average mastery by concept
SELECT concept_id, AVG(mastery_score) as avg_mastery
FROM safa_concept_mastery
GROUP BY concept_id
ORDER BY avg_mastery ASC;

-- Error type distribution
SELECT error_type, COUNT(*) as count
FROM safa_answer_attempts
WHERE is_correct = 0
GROUP BY error_type;

-- Feedback effectiveness
SELECT 
  feedback_level,
  AVG(mastery_score_after - mastery_score_before) as avg_improvement
FROM safa_answer_attempts
GROUP BY feedback_level;

-- Students needing intervention
SELECT student_id, concept_id, mastery_score
FROM safa_concept_mastery
WHERE mastery_score < 40
ORDER BY mastery_score ASC;
```

## Best Practices

### Do's ✅
- Track time spent accurately
- Use appropriate difficulty levels
- Provide clear correct answers
- Update mastery after each attempt
- Show feedback immediately
- Encourage revision completion

### Don'ts ❌
- Don't skip attempt numbers
- Don't use generic concept IDs
- Don't ignore revision recommendations
- Don't overwhelm with too much feedback
- Don't hide mastery scores from students

## Troubleshooting

### Issue: Mastery not updating
**Solution**: Check that concept_id matches between questions and mastery table

### Issue: Feedback too intense
**Solution**: Adjust error classification thresholds in algorithm

### Issue: No revision recommendations
**Solution**: Lower mastery threshold or increase error severity weights

## Next Steps

1. ✅ Database tables created
2. ✅ API endpoints ready
3. ✅ Algorithm implemented
4. 🔄 Integrate with frontend
5. 🔄 Add analytics dashboard
6. 🔄 Test with real students
7. 🔄 Collect feedback and iterate

## Support

Questions? Check:
- `SAFA_DOCUMENTATION.md` for detailed specs
- `backend/safa-algorithm.ts` for algorithm code
- API logs for debugging

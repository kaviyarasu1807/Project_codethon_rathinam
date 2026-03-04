# Start ML Server - Quick Guide

## The Problem

You're getting:
```
ML Service Error
Failed to execute 'json' on 'Response': Unexpected end of JSON input
Make sure the Python ML server is running on port 5001
```

This means the Python ML server is not running.

## Solution

### Step 1: Install Python Dependencies

Open a NEW terminal (separate from your Node.js server) and run:

```bash
# Navigate to ml-model directory
cd ml-model

# Install dependencies
pip install -r requirements.txt
```

This will install:
- pandas, numpy, scikit-learn, xgboost (ML libraries)
- shap (explainability)
- matplotlib, seaborn (visualization)
- flask, flask-cors (API server)

### Step 2: Start ML Server

In the same terminal (still in ml-model directory):

```bash
python ml_api_server.py
```

You should see:
```
============================================================
NEUROPATH ML API SERVER
============================================================

Endpoints:
  GET  /health                    - Health check
  POST /api/ml/predict            - Single prediction
  POST /api/ml/batch-predict      - Batch predictions
  GET  /api/ml/model-info         - Model information
  POST /api/ml/retrain            - Retrain model
  GET  /api/ml/feature-importance - Feature importance

============================================================

 * Running on http://0.0.0.0:5001
```

### Step 3: Keep It Running

Keep this terminal open! The ML server needs to run alongside your Node.js server.

You should now have 3 terminals running:
1. **Terminal 1:** Frontend (`npm run dev`) - Port 3000
2. **Terminal 2:** MongoDB Backend (`npm run dev:mongodb`) - Port 5000
3. **Terminal 3:** ML Server (`python ml_api_server.py`) - Port 5001

## Quick Commands

### Windows PowerShell:
```powershell
# Terminal 3 (NEW)
cd ml-model
pip install -r requirements.txt
python ml_api_server.py
```

### If pip is not found:
```powershell
python -m pip install -r requirements.txt
```

## Verify ML Server is Running

Open browser and go to:
```
http://localhost:5001/health
```

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

## Troubleshooting

### Issue 1: "pip is not recognized"

**Solution:**
```bash
python -m pip install -r requirements.txt
```

### Issue 2: "No module named 'flask'"

**Solution:**
```bash
pip install flask flask-cors
```

### Issue 3: Port 5001 already in use

**Solution:**
```bash
# Find and kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID [PID_NUMBER] /F
```

### Issue 4: Model training takes long time

**First run:** The server will train the ML model, which may take 1-2 minutes. Be patient!

**Subsequent runs:** Model is saved and loads instantly.

### Issue 5: "ModuleNotFoundError: No module named 'xgboost'"

**Solution:**
```bash
pip install xgboost
```

## What the ML Server Does

The ML server provides cognitive twin predictions:
- Predicts student learning categories
- Analyzes learning patterns
- Provides personalized recommendations
- Explains predictions with SHAP values

## API Endpoints

### Health Check
```
GET http://localhost:5001/health
```

### Single Prediction
```
POST http://localhost:5001/api/ml/predict
Body: {
  "avg_quiz_score": 65.5,
  "assignment_completion_rate": 80.0,
  "avg_session_time": 45.0,
  "mistakes_per_topic": 3,
  "revision_frequency": 4,
  "attention_score": 0.75,
  "confidence_score": 0.70,
  "stress_index": 0.35
}
```

### Model Info
```
GET http://localhost:5001/api/ml/model-info
```

## Integration with Node.js Backend

The Node.js backend (server-mongodb.ts) calls the ML server:
- `/api/ml/predict-student/:studentId` - Get prediction for student
- `/api/ml/batch-predict-all` - Batch predictions
- `/api/ml/model-info` - Get model information
- `/api/ml/feature-importance` - Get feature importance

## Summary

1. Open NEW terminal
2. `cd ml-model`
3. `pip install -r requirements.txt`
4. `python ml_api_server.py`
5. Keep terminal open
6. ML server runs on port 5001

The error will be fixed once the ML server is running!

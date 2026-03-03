"""
Flask API Server for NeuroPath Cognitive Twin Model
Serves ML predictions to Express.js backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from cognitive_twin_model import CognitiveTwinModel
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Express.js integration

# Initialize model
model = CognitiveTwinModel()

# Load trained model if exists
MODEL_PATH = 'cognitive_twin_model.pkl'
if os.path.exists(MODEL_PATH):
    try:
        model.load_model(MODEL_PATH)
        print("✓ Model loaded successfully")
    except Exception as e:
        print(f"⚠️  Could not load model: {e}")
        print("   Training new model...")
        # Train new model
        X_train, X_test, y_train, y_test, data = model.load_and_preprocess_data()
        model.build_and_train_model(X_train, y_train, X_test, y_test)
        model.evaluate_model(X_train, y_train, X_test, y_test)
        model.explain_predictions(X_train, X_test)
        model.save_model(MODEL_PATH)
else:
    print("⚠️  No trained model found. Training new model...")
    X_train, X_test, y_train, y_test, data = model.load_and_preprocess_data()
    model.build_and_train_model(X_train, y_train, X_test, y_test)
    model.evaluate_model(X_train, y_train, X_test, y_test)
    model.explain_predictions(X_train, X_test)
    model.save_model(MODEL_PATH)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model.model is not None,
        'version': '1.0.0'
    })


@app.route('/api/ml/predict', methods=['POST'])
def predict_student():
    """
    Predict student learning category
    
    Request body:
    {
        "student_id": 101,
        "avg_quiz_score": 65.5,
        "assignment_completion_rate": 80.0,
        "avg_session_time": 45.0,
        "mistakes_per_topic": 3,
        "revision_frequency": 4,
        "attention_score": 0.75,
        "confidence_score": 0.70,
        "stress_index": 0.35
    }
    
    Response:
    {
        "success": true,
        "prediction": { ... cognitive twin output ... }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'avg_quiz_score',
            'assignment_completion_rate',
            'avg_session_time',
            'mistakes_per_topic',
            'revision_frequency',
            'attention_score',
            'confidence_score',
            'stress_index'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Make prediction
        prediction = model.predict_student_profile(data)
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/batch-predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction for multiple students
    
    Request body:
    {
        "students": [
            { student_data_1 },
            { student_data_2 },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        students = data.get('students', [])
        
        if not students:
            return jsonify({
                'success': False,
                'error': 'No student data provided'
            }), 400
        
        predictions = []
        for student in students:
            try:
                prediction = model.predict_student_profile(student)
                predictions.append(prediction)
            except Exception as e:
                predictions.append({
                    'student_id': student.get('student_id'),
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'total': len(predictions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/model-info', methods=['GET'])
def model_info():
    """Get model information and metrics"""
    try:
        info = {
            'model_type': 'XGBoost Classifier',
            'features': model.feature_names,
            'categories': model.category_mapping,
            'evaluation_metrics': model.evaluation_metrics if hasattr(model, 'evaluation_metrics') else None,
            'feature_importance': model.feature_importance.to_dict('records') if hasattr(model, 'feature_importance') else None
        }
        
        return jsonify({
            'success': True,
            'info': info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/retrain', methods=['POST'])
def retrain_model():
    """
    Retrain model with new data
    
    Request body:
    {
        "data": [
            { student_data_with_learning_category },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        training_data = data.get('data', [])
        
        if not training_data:
            return jsonify({
                'success': False,
                'error': 'No training data provided'
            }), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(training_data)
        
        # Retrain model
        X_train, X_test, y_train, y_test, processed_data = model.load_and_preprocess_data(df=df)
        model.build_and_train_model(X_train, y_train, X_test, y_test)
        metrics = model.evaluate_model(X_train, y_train, X_test, y_test)
        model.explain_predictions(X_train, X_test)
        model.save_model(MODEL_PATH)
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'metrics': metrics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance rankings"""
    try:
        if not hasattr(model, 'feature_importance'):
            return jsonify({
                'success': False,
                'error': 'Feature importance not available. Train model first.'
            }), 400
        
        return jsonify({
            'success': True,
            'feature_importance': model.feature_importance.to_dict('records')
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("NEUROPATH ML API SERVER")
    print("=" * 60)
    print("\nEndpoints:")
    print("  GET  /health                    - Health check")
    print("  POST /api/ml/predict            - Single prediction")
    print("  POST /api/ml/batch-predict      - Batch predictions")
    print("  GET  /api/ml/model-info         - Model information")
    print("  POST /api/ml/retrain            - Retrain model")
    print("  GET  /api/ml/feature-importance - Feature importance")
    print("\n" + "=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)

"""
NeuroPath Digital Cognitive Twin - XGBoost Model
Multi-class classification for student learning category prediction
"""

import pandas as pd
import numpy as np
import pickle
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)
from sklearn.impute import SimpleImputer
import xgboost as xgb
import shap
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class CognitiveTwinModel:
    """
    Digital Cognitive Twin Model for NeuroPath Learning System
    Predicts student learning category: Strong / Moderate / Weak
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = [
            'avg_quiz_score',
            'assignment_completion_rate',
            'avg_session_time',
            'mistakes_per_topic',
            'revision_frequency',
            'attention_score',
            'confidence_score',
            'stress_index'
        ]
        self.category_mapping = {0: 'Weak', 1: 'Moderate', 2: 'Strong'}
        self.explainer = None
        
    def load_and_preprocess_data(self, filepath=None, df=None):
        """
        STEP 1: DATA HANDLING
        Load and preprocess the dataset
        """
        print("=" * 60)
        print("STEP 1: DATA HANDLING")
        print("=" * 60)
        
        # Load data
        if df is not None:
            data = df.copy()
        elif filepath:
            data = pd.read_csv(filepath)
        else:
            # Generate synthetic data for demonstration
            data = self._generate_synthetic_data(1000)
        
        print(f"✓ Dataset loaded: {data.shape[0]} rows, {data.shape[1]} columns")
        
        # 1. Handle missing values
        print("\n1. Handling missing values...")
        numeric_columns = data.select_dtypes(include=[np.number]).columns
        imputer = SimpleImputer(strategy='median')
        data[numeric_columns] = imputer.fit_transform(data[numeric_columns])
        print(f"   ✓ Missing values imputed using median strategy")
        
        # 2. Remove duplicates
        print("\n2. Removing duplicates...")
        before_dup = len(data)
        data = data.drop_duplicates()
        after_dup = len(data)
        print(f"   ✓ Removed {before_dup - after_dup} duplicate rows")
        
        # 3. Encode categorical labels
        print("\n3. Encoding categorical labels...")
        if 'learning_category' in data.columns:
            data['learning_category_encoded'] = data['learning_category'].map({
                'Strong': 2,
                'Moderate': 1,
                'Weak': 0
            })
            print("   ✓ Labels encoded: Strong=2, Moderate=1, Weak=0")
        
        # 4. Detect and handle outliers using IQR method
        print("\n4. Detecting and handling outliers...")
        outliers_removed = 0
        for col in self.feature_names:
            if col in data.columns:
                Q1 = data[col].quantile(0.25)
                Q3 = data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                before = len(data)
                data = data[(data[col] >= lower_bound) & (data[col] <= upper_bound)]
                outliers_removed += (before - len(data))
        
        print(f"   ✓ Removed {outliers_removed} outlier rows")
        
        # 5. Feature scaling
        print("\n5. Scaling numeric features...")
        X = data[self.feature_names]
        y = data['learning_category_encoded']
        
        X_scaled = self.scaler.fit_transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=self.feature_names)
        print("   ✓ Features normalized using StandardScaler")
        
        # 6. Train-test split
        print("\n6. Splitting dataset...")
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        print(f"   ✓ Training set: {len(X_train)} samples (80%)")
        print(f"   ✓ Testing set: {len(X_test)} samples (20%)")
        
        print("\n" + "=" * 60)
        print("DATA PREPROCESSING COMPLETE")
        print("=" * 60 + "\n")
        
        return X_train, X_test, y_train, y_test, data
    
    def build_and_train_model(self, X_train, y_train, X_test, y_test):
        """
        STEP 2: MODEL BUILDING
        Build and train XGBoost model with hyperparameter tuning
        """
        print("=" * 60)
        print("STEP 2: MODEL BUILDING")
        print("=" * 60)
        
        # Define parameter grid for GridSearchCV
        param_grid = {
            'learning_rate': [0.01, 0.05, 0.1],
            'max_depth': [3, 5, 7],
            'n_estimators': [100, 200, 300],
            'subsample': [0.8, 1.0],
            'colsample_bytree': [0.8, 1.0]
        }
        
        print("\n1. Initializing XGBoost Classifier...")
        base_model = xgb.XGBClassifier(
            objective='multi:softprob',
            num_class=3,
            eval_metric='mlogloss',
            random_state=42,
            use_label_encoder=False
        )
        print("   ✓ Base model initialized")
        
        print("\n2. Performing GridSearchCV for hyperparameter tuning...")
        print("   This may take a few minutes...")
        
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=param_grid,
            cv=5,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=10,
            verbose=False
        )
        
        self.model = grid_search.best_estimator_
        
        print("\n3. Best hyperparameters found:")
        for param, value in grid_search.best_params_.items():
            print(f"   • {param}: {value}")
        
        print(f"\n4. Best cross-validation score: {grid_search.best_score_:.4f}")
        
        print("\n" + "=" * 60)
        print("MODEL TRAINING COMPLETE")
        print("=" * 60 + "\n")
        
        return self.model
    
    def evaluate_model(self, X_train, y_train, X_test, y_test):
        """
        STEP 3: MODEL EVALUATION
        Comprehensive model evaluation with multiple metrics
        """
        print("=" * 60)
        print("STEP 3: MODEL EVALUATION")
        print("=" * 60)
        
        # Predictions
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)
        y_test_proba = self.model.predict_proba(X_test)
        
        # 1. Accuracy
        train_accuracy = accuracy_score(y_train, y_train_pred)
        test_accuracy = accuracy_score(y_test, y_test_pred)
        
        print("\n1. ACCURACY SCORES:")
        print(f"   • Training Accuracy: {train_accuracy:.4f}")
        print(f"   • Testing Accuracy:  {test_accuracy:.4f}")
        
        # Overfitting detection
        if train_accuracy - test_accuracy > 0.1:
            print("   ⚠️  WARNING: Possible overfitting detected!")
        else:
            print("   ✓ No significant overfitting detected")
        
        # 2. Precision, Recall, F1-Score
        print("\n2. CLASSIFICATION METRICS:")
        precision = precision_score(y_test, y_test_pred, average='weighted')
        recall = recall_score(y_test, y_test_pred, average='weighted')
        f1 = f1_score(y_test, y_test_pred, average='weighted')
        
        print(f"   • Precision: {precision:.4f}")
        print(f"   • Recall:    {recall:.4f}")
        print(f"   • F1-Score:  {f1:.4f}")
        
        # 3. Confusion Matrix
        print("\n3. CONFUSION MATRIX:")
        cm = confusion_matrix(y_test, y_test_pred)
        print("\n   Predicted →")
        print("   Actual ↓     Weak  Moderate  Strong")
        for i, row in enumerate(cm):
            label = ['Weak', 'Moderate', 'Strong'][i]
            print(f"   {label:10s}  {row[0]:4d}  {row[1]:8d}  {row[2]:6d}")
        
        # 4. Classification Report
        print("\n4. DETAILED CLASSIFICATION REPORT:")
        report = classification_report(
            y_test, y_test_pred,
            target_names=['Weak', 'Moderate', 'Strong']
        )
        print(report)
        
        # 5. ROC-AUC Score (multi-class)
        try:
            roc_auc = roc_auc_score(y_test, y_test_proba, multi_class='ovr')
            print(f"5. ROC-AUC SCORE (One-vs-Rest): {roc_auc:.4f}")
        except:
            print("5. ROC-AUC SCORE: Could not compute")
        
        print("\n" + "=" * 60)
        print("MODEL EVALUATION COMPLETE")
        print("=" * 60 + "\n")
        
        # Store evaluation metrics
        self.evaluation_metrics = {
            'train_accuracy': float(train_accuracy),
            'test_accuracy': float(test_accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'confusion_matrix': cm.tolist(),
            'roc_auc': float(roc_auc) if 'roc_auc' in locals() else None
        }
        
        return self.evaluation_metrics
    
    def explain_predictions(self, X_train, X_test):
        """
        STEP 4: EXPLAINABILITY
        Use SHAP to explain model predictions
        """
        print("=" * 60)
        print("STEP 4: EXPLAINABILITY (SHAP)")
        print("=" * 60)
        
        print("\n1. Initializing SHAP explainer...")
        self.explainer = shap.TreeExplainer(self.model)
        print("   ✓ SHAP TreeExplainer initialized")
        
        print("\n2. Computing SHAP values...")
        shap_values = self.explainer.shap_values(X_test)
        print("   ✓ SHAP values computed")
        
        print("\n3. TOP CONTRIBUTING FEATURES:")
        feature_importance = np.abs(shap_values).mean(axis=1).mean(axis=0)
        feature_importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False)
        
        for idx, row in feature_importance_df.iterrows():
            print(f"   {row['feature']:30s} {row['importance']:.4f}")
        
        self.feature_importance = feature_importance_df
        
        print("\n" + "=" * 60)
        print("EXPLAINABILITY ANALYSIS COMPLETE")
        print("=" * 60 + "\n")
        
        return shap_values, feature_importance_df
    
    def predict_student_profile(self, student_data):
        """
        STEP 5: PREDICTION ENGINE
        Predict learning category and provide recommendations
        """
        # Prepare input data
        if isinstance(student_data, dict):
            input_df = pd.DataFrame([student_data])
        else:
            input_df = student_data.copy()
        
        # Ensure all features are present
        for feature in self.feature_names:
            if feature not in input_df.columns:
                input_df[feature] = 0
        
        # Scale features
        X_input = self.scaler.transform(input_df[self.feature_names])
        
        # Predict
        prediction = self.model.predict(X_input)[0]
        probabilities = self.model.predict_proba(X_input)[0]
        
        # Get SHAP values for explanation
        shap_values = self.explainer.shap_values(X_input)
        
        # Identify weakness factors
        weakness_factors = []
        feature_contributions = {}
        
        for i, feature in enumerate(self.feature_names):
            value = input_df[feature].values[0]
            shap_contribution = np.abs(shap_values[prediction][0][i])
            feature_contributions[feature] = shap_contribution
            
            # Identify weaknesses
            if feature == 'avg_quiz_score' and value < 50:
                weakness_factors.append(f"Low quiz score ({value:.1f}%)")
            elif feature == 'assignment_completion_rate' and value < 60:
                weakness_factors.append(f"Low assignment completion ({value:.1f}%)")
            elif feature == 'attention_score' and value < 0.5:
                weakness_factors.append(f"Low attention score ({value:.2f})")
            elif feature == 'stress_index' and value > 0.7:
                weakness_factors.append(f"High stress level ({value:.2f})")
            elif feature == 'confidence_score' and value < 0.5:
                weakness_factors.append(f"Low confidence ({value:.2f})")
            elif feature == 'revision_frequency' and value < 3:
                weakness_factors.append(f"Insufficient revision ({value:.0f} times)")
        
        # Sort by SHAP contribution
        top_factors = sorted(feature_contributions.items(), key=lambda x: x[1], reverse=True)[:3]
        key_weakness_factors = [f"{factor[0]}" for factor in top_factors]
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            input_df[self.feature_names].iloc[0].to_dict(),
            prediction
        )
        
        # Determine risk level
        confidence = probabilities[prediction]
        if prediction == 0:  # Weak
            risk_level = "High" if confidence > 0.7 else "Medium"
        elif prediction == 1:  # Moderate
            risk_level = "Medium"
        else:  # Strong
            risk_level = "Low"
        
        # STEP 6: OUTPUT FOR DIGITAL COGNITIVE TWIN
        result = {
            "student_id": int(input_df.get('student_id', [0])[0]) if 'student_id' in input_df.columns else None,
            "predicted_category": self.category_mapping[prediction],
            "confidence_probability": float(confidence),
            "probabilities": {
                "weak": float(probabilities[0]),
                "moderate": float(probabilities[1]),
                "strong": float(probabilities[2])
            },
            "risk_level": risk_level,
            "key_weakness_factors": key_weakness_factors if weakness_factors else ["No significant weaknesses detected"],
            "detailed_weaknesses": weakness_factors if weakness_factors else [],
            "recommended_actions": recommendations,
            "feature_contributions": {k: float(v) for k, v in feature_contributions.items()},
            "timestamp": datetime.now().isoformat()
        }
        
        return result
    
    def _generate_recommendations(self, features, prediction):
        """Generate personalized intervention strategies"""
        recommendations = []
        
        # Quiz performance
        if features['avg_quiz_score'] < 50:
            recommendations.append("📚 Schedule daily practice sessions with immediate feedback")
        elif features['avg_quiz_score'] < 70:
            recommendations.append("📝 Focus on weak topics with targeted quizzes")
        
        # Assignment completion
        if features['assignment_completion_rate'] < 60:
            recommendations.append("✅ Break assignments into smaller milestones with deadlines")
        
        # Session time
        if features['avg_session_time'] < 20:
            recommendations.append("⏰ Increase study session duration to 30-45 minutes")
        elif features['avg_session_time'] > 90:
            recommendations.append("⏱️ Take regular breaks to maintain focus (Pomodoro technique)")
        
        # Mistakes
        if features['mistakes_per_topic'] > 5:
            recommendations.append("🎯 Review common mistakes and create error logs")
        
        # Revision
        if features['revision_frequency'] < 3:
            recommendations.append("🔄 Implement spaced repetition schedule (3-5 revisions per topic)")
        
        # Attention
        if features['attention_score'] < 0.5:
            recommendations.append("👁️ Use focus techniques: eliminate distractions, active recall")
        
        # Confidence
        if features['confidence_score'] < 0.5:
            recommendations.append("💪 Start with easier problems to build confidence gradually")
        
        # Stress
        if features['stress_index'] > 0.7:
            recommendations.append("🧘 Practice stress management: meditation, exercise, adequate sleep")
        elif features['stress_index'] > 0.5:
            recommendations.append("😌 Monitor stress levels and take regular mental health breaks")
        
        # Category-specific recommendations
        if prediction == 0:  # Weak
            recommendations.append("🆘 PRIORITY: Schedule immediate one-on-one tutoring session")
            recommendations.append("📊 Create personalized learning plan with mentor")
        elif prediction == 1:  # Moderate
            recommendations.append("📈 Focus on consistency and gradual improvement")
        else:  # Strong
            recommendations.append("🏆 Challenge with advanced topics and peer mentoring opportunities")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _generate_synthetic_data(self, n_samples=1000):
        """Generate synthetic student data for demonstration"""
        np.random.seed(42)
        
        data = {
            'student_id': range(1, n_samples + 1),
            'avg_quiz_score': np.random.normal(65, 20, n_samples).clip(0, 100),
            'assignment_completion_rate': np.random.normal(70, 25, n_samples).clip(0, 100),
            'avg_session_time': np.random.normal(45, 20, n_samples).clip(5, 120),
            'mistakes_per_topic': np.random.poisson(4, n_samples).clip(0, 20),
            'revision_frequency': np.random.poisson(3, n_samples).clip(0, 10),
            'attention_score': np.random.beta(5, 3, n_samples).clip(0, 1),
            'confidence_score': np.random.beta(5, 3, n_samples).clip(0, 1),
            'stress_index': np.random.beta(3, 5, n_samples).clip(0, 1)
        }
        
        df = pd.DataFrame(data)
        
        # Generate learning categories based on features
        def categorize(row):
            score = (
                row['avg_quiz_score'] * 0.3 +
                row['assignment_completion_rate'] * 0.2 +
                row['attention_score'] * 100 * 0.2 +
                row['confidence_score'] * 100 * 0.15 +
                (1 - row['stress_index']) * 100 * 0.15
            )
            if score >= 70:
                return 'Strong'
            elif score >= 50:
                return 'Moderate'
            else:
                return 'Weak'
        
        df['learning_category'] = df.apply(categorize, axis=1)
        
        return df
    
    def save_model(self, filepath='cognitive_twin_model.pkl'):
        """Save trained model and scaler"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'category_mapping': self.category_mapping,
            'evaluation_metrics': self.evaluation_metrics if hasattr(self, 'evaluation_metrics') else None
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"✓ Model saved to {filepath}")
    
    def load_model(self, filepath='cognitive_twin_model.pkl'):
        """Load trained model and scaler"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.category_mapping = model_data['category_mapping']
        self.evaluation_metrics = model_data.get('evaluation_metrics')
        
        # Reinitialize explainer
        if self.model:
            self.explainer = shap.TreeExplainer(self.model)
        
        print(f"✓ Model loaded from {filepath}")


def main():
    """
    Main execution pipeline for Cognitive Twin Model
    """
    print("\n" + "=" * 60)
    print("NEUROPATH DIGITAL COGNITIVE TWIN")
    print("XGBoost-Based Learning Category Prediction")
    print("=" * 60 + "\n")
    
    # Initialize model
    model = CognitiveTwinModel()
    
    # STEP 1: Load and preprocess data
    X_train, X_test, y_train, y_test, data = model.load_and_preprocess_data()
    
    # STEP 2: Build and train model
    trained_model = model.build_and_train_model(X_train, y_train, X_test, y_test)
    
    # STEP 3: Evaluate model
    metrics = model.evaluate_model(X_train, y_train, X_test, y_test)
    
    # STEP 4: Explainability
    shap_values, feature_importance = model.explain_predictions(X_train, X_test)
    
    # STEP 5 & 6: Test prediction engine
    print("=" * 60)
    print("TESTING PREDICTION ENGINE")
    print("=" * 60 + "\n")
    
    # Test with sample students
    test_students = [
        {
            'student_id': 101,
            'avg_quiz_score': 35,
            'assignment_completion_rate': 45,
            'avg_session_time': 25,
            'mistakes_per_topic': 8,
            'revision_frequency': 1,
            'attention_score': 0.3,
            'confidence_score': 0.4,
            'stress_index': 0.85
        },
        {
            'student_id': 102,
            'avg_quiz_score': 85,
            'assignment_completion_rate': 92,
            'avg_session_time': 60,
            'mistakes_per_topic': 2,
            'revision_frequency': 5,
            'attention_score': 0.9,
            'confidence_score': 0.85,
            'stress_index': 0.2
        }
    ]
    
    for student in test_students:
        result = model.predict_student_profile(student)
        print(f"\nStudent ID: {result['student_id']}")
        print(json.dumps(result, indent=2))
        print("\n" + "-" * 60)
    
    # Save model
    model.save_model('cognitive_twin_model.pkl')
    
    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE - MODEL READY FOR PRODUCTION")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Activity,
  BarChart3,
  Lightbulb,
  X,
  RefreshCw
} from 'lucide-react';

interface MLPrediction {
  student_id: number | null;
  predicted_category: 'Strong' | 'Moderate' | 'Weak';
  confidence_probability: number;
  probabilities: {
    weak: number;
    moderate: number;
    strong: number;
  };
  risk_level: 'Low' | 'Medium' | 'High';
  key_weakness_factors: string[];
  detailed_weaknesses: string[];
  recommended_actions: string[];
  feature_contributions: Record<string, number>;
  timestamp: string;
}

interface MLCognitiveTwinDashboardProps {
  studentId: number;
  studentName: string;
  onClose: () => void;
}

export default function MLCognitiveTwinDashboard({
  studentId,
  studentName,
  onClose
}: MLCognitiveTwinDashboardProps) {
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMLPrediction();
  }, [studentId]);

  const fetchMLPrediction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/ml/predict-student/${studentId}`, {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setPrediction(data.prediction);
      } else {
        setError(data.error || 'Failed to get ML prediction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to ML service');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-700 font-semibold">Analyzing with AI...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md"
        >
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-900 mb-2 text-center">ML Service Error</h3>
          <p className="text-stone-600 text-center mb-4">{error}</p>
          <p className="text-sm text-stone-500 text-center mb-4">
            Make sure the Python ML server is running on port 5001
          </p>
          <div className="flex gap-2">
            <button
              onClick={fetchMLPrediction}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-stone-200 text-stone-700 py-2 rounded-lg font-semibold hover:bg-stone-300"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strong': return 'from-emerald-500 to-green-600';
      case 'Moderate': return 'from-amber-500 to-orange-600';
      case 'Weak': return 'from-red-500 to-red-600';
      default: return 'from-stone-500 to-stone-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'High': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(prediction.predicted_category)} p-6 rounded-t-3xl relative overflow-hidden`}>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{studentName}</h2>
                  <p className="text-white/90">XGBoost ML Cognitive Twin Analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <p className="text-white/80 text-xs">Predicted Category</p>
                  <p className="text-white text-2xl font-bold">{prediction.predicted_category}</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <p className="text-white/80 text-xs">Confidence</p>
                  <p className="text-white text-2xl font-bold">{(prediction.confidence_probability * 100).toFixed(1)}%</p>
                </div>

                <div className={`px-4 py-2 rounded-xl border-2 ${getRiskColor(prediction.risk_level)}`}>
                  <p className="text-xs font-semibold">Risk Level</p>
                  <p className="text-lg font-bold">{prediction.risk_level}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Probability Distribution */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-stone-900 text-lg">Probability Distribution</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-stone-700">Weak</span>
                  <span className="text-sm font-bold text-red-600">{(prediction.probabilities.weak * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 rounded-full h-3 transition-all duration-500"
                    style={{ width: `${prediction.probabilities.weak * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-stone-700">Moderate</span>
                  <span className="text-sm font-bold text-amber-600">{(prediction.probabilities.moderate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full h-3 transition-all duration-500"
                    style={{ width: `${prediction.probabilities.moderate * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-stone-700">Strong</span>
                  <span className="text-sm font-bold text-emerald-600">{(prediction.probabilities.strong * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full h-3 transition-all duration-500"
                    style={{ width: `${prediction.probabilities.strong * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Weakness Factors */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-stone-900 text-lg">Key Contributing Factors</h3>
            </div>
            
            <div className="space-y-2">
              {prediction.key_weakness_factors.map((factor, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-stone-700 font-medium">{factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-stone-900 text-lg">AI-Recommended Actions</h3>
            </div>
            
            <div className="space-y-3">
              {prediction.recommended_actions.map((action, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-emerald-200 flex items-start gap-3">
                  <div className="bg-emerald-100 rounded-full p-1 flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-stone-700">{action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Contributions */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-stone-900 text-lg">Feature Importance (SHAP Values)</h3>
            </div>
            
            <div className="space-y-2">
              {Object.entries(prediction.feature_contributions)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([feature, contribution], idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-stone-700 w-48">
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="flex-1 bg-stone-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full h-2"
                        style={{ width: `${(contribution / Math.max(...Object.values(prediction.feature_contributions))) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-stone-600 w-12 text-right">
                      {contribution.toFixed(3)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>Analysis Timestamp: {new Date(prediction.timestamp).toLocaleString()}</span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Powered by XGBoost ML
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 rounded-b-3xl border-t border-stone-200 flex justify-between items-center">
          <p className="text-stone-500 text-sm">
            ML Model Confidence: {(prediction.confidence_probability * 100).toFixed(1)}%
          </p>
          <button
            onClick={onClose}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </motion.div>
    </div>
  );
}

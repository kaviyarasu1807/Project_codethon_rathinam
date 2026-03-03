/**
 * Struggle Alerts Component for Admin Dashboard
 * Displays automated alerts for students struggling with questions
 */

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Bell, CheckCircle2, XCircle, Clock, TrendingUp, 
  Users, Brain, Shield, Eye, EyeOff, RefreshCw, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StruggleMetrics {
  student_id: number;
  student_name: string;
  total_questions_attempted: number;
  questions_struggled: number;
  struggle_percentage: number;
  avg_time_per_question: number;
  high_stress_questions: number;
  tab_switches: number;
  voice_alerts: number;
  last_activity: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Alert {
  id: number;
  student_id: number;
  alert_type: 'struggle' | 'stress' | 'cheating' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertStatistics {
  total_alerts: number;
  unacknowledged: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  struggle_alerts: number;
  stress_alerts: number;
  cheating_alerts: number;
}

export default function StruggleAlerts({ adminId }: { adminId: number }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<StruggleMetrics[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAlerts();
    fetchMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchAlerts();
        fetchMetrics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/alerts');
      const data = await response.json();
      setAlerts(data.alerts);
      setStatistics(data.statistics);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/struggle-metrics');
      const data = await response.json();
      setMetrics(data.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: number) => {
    try {
      await fetch(`/api/admin/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const generateAlerts = async () => {
    try {
      const response = await fetch('/api/admin/generate-alerts', {
        method: 'POST'
      });
      const data = await response.json();
      alert(`Generated ${data.alertsCreated} new alerts`);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to generate alerts:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'blue';
      default: return 'stone';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'struggle': return Brain;
      case 'stress': return AlertTriangle;
      case 'cheating': return Shield;
      case 'performance': return TrendingUp;
      default: return Bell;
    }
  };

  const criticalStudents = metrics.filter(m => m.severity === 'critical' || m.severity === 'high');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Student Struggle Alerts</h2>
          <p className="text-stone-500">Automated monitoring and intervention system</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              autoRefresh
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-sm font-bold">Auto-refresh</span>
          </button>

          <button
            onClick={generateAlerts}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Generate Alerts
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-bold uppercase">Unacknowledged</p>
                <p className="text-2xl font-bold text-stone-900">{statistics.unacknowledged}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-bold uppercase">Critical</p>
                <p className="text-2xl font-bold text-stone-900">{statistics.critical_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-bold uppercase">Struggling</p>
                <p className="text-2xl font-bold text-stone-900">{statistics.struggle_alerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-bold uppercase">Need Attention</p>
                <p className="text-2xl font-bold text-stone-900">{criticalStudents.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Students Alert Banner */}
      {criticalStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                {criticalStudents.length} Student{criticalStudents.length > 1 ? 's' : ''} Need Immediate Attention
              </h3>
              <div className="space-y-2">
                {criticalStudents.slice(0, 3).map(student => (
                  <div key={student.student_id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-bold text-stone-900">{student.student_name}</p>
                      <p className="text-sm text-stone-600">
                        Struggling with {student.questions_struggled}/{student.total_questions_attempted} questions 
                        ({student.struggle_percentage}%)
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      student.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {student.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">Recent Alerts</h3>
          <button
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
          >
            {showAcknowledged ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          <AnimatePresence>
            {alerts
              .filter(alert => showAcknowledged || !alert.acknowledged)
              .map(alert => {
                const Icon = getAlertTypeIcon(alert.alert_type);
                const color = getSeverityColor(alert.severity);
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 hover:bg-stone-50 transition-colors ${
                      alert.acknowledged ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`bg-${color}-100 p-2 rounded-lg flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${color}-100 text-${color}-700`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-stone-500">
                            {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm text-stone-900 font-medium mb-2">
                          {alert.message}
                        </p>

                        {alert.metrics && (
                          <div className="flex flex-wrap gap-3 text-xs text-stone-600">
                            {(() => {
                              try {
                                const metrics = JSON.parse(alert.metrics);
                                return (
                                  <>
                                    <span>📊 {metrics.questions_struggled} questions</span>
                                    <span>⏱️ {metrics.avg_time_per_question}s avg</span>
                                    <span>😰 {metrics.high_stress_questions} high stress</span>
                                    {metrics.tab_switches > 0 && (
                                      <span>🔄 {metrics.tab_switches} tab switches</span>
                                    )}
                                    {metrics.voice_alerts > 0 && (
                                      <span>🎤 {metrics.voice_alerts} voice alerts</span>
                                    )}
                                  </>
                                );
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        )}
                      </div>

                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex-shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Acknowledge
                        </button>
                      )}

                      {alert.acknowledged && (
                        <div className="flex items-center gap-2 text-emerald-600 flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Acknowledged</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {alerts.filter(alert => showAcknowledged || !alert.acknowledged).length === 0 && (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-stone-600 font-medium">No alerts to display</p>
              <p className="text-sm text-stone-500">All students are performing well!</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 p-4">
          <h3 className="font-bold text-stone-900">Student Struggle Metrics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">Student</th>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">Questions</th>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">Struggled</th>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">Struggle %</th>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">Avg Time</th>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">High Stress</th>
                <th className="p-3 text-left text-xs font-bold text-stone-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {metrics.map(metric => (
                <tr key={metric.student_id} className="hover:bg-stone-50">
                  <td className="p-3">
                    <p className="font-medium text-stone-900">{metric.student_name}</p>
                  </td>
                  <td className="p-3 text-sm text-stone-600">
                    {metric.total_questions_attempted}
                  </td>
                  <td className="p-3 text-sm font-bold text-red-600">
                    {metric.questions_struggled}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-stone-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.struggle_percentage > 70 ? 'bg-red-500' :
                            metric.struggle_percentage > 50 ? 'bg-orange-500' :
                            metric.struggle_percentage > 30 ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${metric.struggle_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-stone-900">
                        {metric.struggle_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-stone-600">
                    {metric.avg_time_per_question}s
                  </td>
                  <td className="p-3 text-sm font-bold text-orange-600">
                    {metric.high_stress_questions}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      metric.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      metric.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      metric.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {metric.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

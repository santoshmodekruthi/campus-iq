import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import EngagementForm from '../components/EngagementForm';
import EngagementChart from '../components/EngagementChart';
import { studentAPI } from '../services/api';

const StudentDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleEventSubmit = async (eventData) => {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await studentAPI.submitEvent(eventData);
      if (response.data.success) {
        setSuccessMessage('Event submitted successfully! Your profile has been updated.');
        // Reload dashboard to show updated data
        await loadDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const { profile, recentEvents, metrics } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user.course} - Year {user.year}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Risk Status Card */}
        <div className="card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Risk Status</h2>
            <RiskBadge level={profile?.riskLevel || 'Low'} />
          </div>
          
          {profile?.riskLevel === 'Low' ? (
            <div className="text-gray-700">
              <p className="mb-2">✅ Great job! You're on track.</p>
              <p className="text-sm text-gray-600">Keep up the good work with your attendance and assignments!</p>
            </div>
          ) : (
            <div className="text-gray-700">
              <p className="mb-2 font-semibold">⚠️ Reason: {profile?.riskReason}</p>
              <p className="text-sm text-gray-600 mb-3">We recommend taking the following actions:</p>
              <ul className="text-sm space-y-1 ml-4">
                {profile?.riskReason?.includes('absence') && (
                  <>
                    <li>• Attend classes regularly</li>
                    <li>• Contact your mentor if facing difficulties</li>
                  </>
                )}
                {profile?.riskReason?.includes('assignment') && (
                  <>
                    <li>• Submit pending assignments</li>
                    <li>• Seek help from peers or instructors</li>
                  </>
                )}
                {profile?.riskReason?.includes('performance') && (
                  <>
                    <li>• Review study materials</li>
                    <li>• Consider tutoring or study groups</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Attendance Rate</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {metrics?.attendancePercentage || 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.statistics?.presentCount || 0} present / {profile?.statistics?.totalAttendance || 0} total
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Assignment Completion</h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {metrics?.assignmentCompletionRate || 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.statistics?.assignmentsSubmitted || 0} submitted / {(profile?.statistics?.assignmentsSubmitted || 0) + (profile?.statistics?.assignmentsMissed || 0)} total
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Performance</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {profile?.statistics?.averagePerformance?.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Based on {profile?.statistics?.performanceScores?.length || 0} tests
            </p>
          </div>
        </div>

        {/* Engagement Form and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EngagementForm onSubmit={handleEventSubmit} loading={submitting} />
          </div>

          <div className="lg:col-span-2">
            <EngagementChart events={recentEvents} />
          </div>
        </div>

        {/* Recent Activity */}
        {recentEvents && recentEvents.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-medium capitalize">{event.eventType}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {event.eventType === 'attendance' && `- ${event.eventData.status}`}
                      {event.eventType === 'assignment' && `- ${event.eventData.assignmentName} (${event.eventData.submitted ? 'Submitted' : 'Missed'})`}
                      {event.eventType === 'performance' && `- ${event.eventData.testName} (${event.eventData.score}%)`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;








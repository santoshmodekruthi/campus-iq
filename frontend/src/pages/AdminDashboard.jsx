import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import { adminAPI } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getOverview();
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

  const { userCounts, riskDistribution, eventCounts, averageStatistics, highRiskStudents } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard 🎯
          </h1>
          <p className="text-gray-600">Institution-wide monitoring and analytics</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Students</h3>
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <p className="text-4xl font-bold text-blue-600">{userCounts?.totalStudents || 0}</p>
            </div>
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Mentors</h3>
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <p className="text-4xl font-bold text-purple-600">{userCounts?.totalMentors || 0}</p>
            </div>
            <div className="card bg-gray-50 border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Admins</h3>
                <span className="text-2xl">⚙️</span>
              </div>
              <p className="text-4xl font-bold text-gray-600">{userCounts?.totalAdmins || 0}</p>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">High Risk</h3>
                <span className="text-2xl">🚨</span>
              </div>
              <p className="text-4xl font-bold text-red-600">{riskDistribution?.highRisk || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                {userCounts?.totalStudents > 0 
                  ? ((riskDistribution?.highRisk / userCounts.totalStudents) * 100).toFixed(1) 
                  : 0}% of students
              </p>
            </div>
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Medium Risk</h3>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-4xl font-bold text-yellow-600">{riskDistribution?.mediumRisk || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                {userCounts?.totalStudents > 0 
                  ? ((riskDistribution?.mediumRisk / userCounts.totalStudents) * 100).toFixed(1) 
                  : 0}% of students
              </p>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Low Risk</h3>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-4xl font-bold text-green-600">{riskDistribution?.lowRisk || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                {userCounts?.totalStudents > 0 
                  ? ((riskDistribution?.lowRisk / userCounts.totalStudents) * 100).toFixed(1) 
                  : 0}% of students
              </p>
            </div>
          </div>
        </div>

        {/* Event Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{eventCounts?.total || 0}</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Attendance</h3>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{eventCounts?.attendance || 0}</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Assignments</h3>
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{eventCounts?.assignment || 0}</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Performance</h3>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{eventCounts?.performance || 0}</p>
            </div>
          </div>
        </div>

        {/* Average Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Institution Averages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Attendance Rate</h3>
              <p className="text-3xl font-bold text-blue-600">{averageStatistics?.attendanceRate || 0}%</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Assignment Completion</h3>
              <p className="text-3xl font-bold text-green-600">{averageStatistics?.assignmentCompletionRate || 0}%</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Performance Score</h3>
              <p className="text-3xl font-bold text-purple-600">{averageStatistics?.averagePerformance || 0}%</p>
            </div>
          </div>
        </div>

        {/* High Risk Students */}
        {highRiskStudents && highRiskStudents.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 High-Risk Students (Requires Attention)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Risk Reason</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskStudents.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.student.name}</div>
                          <div className="text-sm text-gray-500">{item.student.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{item.student.course}</div>
                          <div className="text-gray-500">Year {item.student.year}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-red-600 font-medium">{item.riskReason}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {userCounts?.totalStudents === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              The system is ready! Data will appear here once students register and start submitting engagement events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;








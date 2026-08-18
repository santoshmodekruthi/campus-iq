import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import { mentorAPI } from '../services/api';

const MentorDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await mentorAPI.getDashboard();
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

  const loadStudentDetails = async (studentId) => {
    try {
      const response = await mentorAPI.getStudentDetails(studentId);
      if (response.data.success) {
        setStudentDetails(response.data.data);
        setSelectedStudent(studentId);
      }
    } catch (err) {
      setError('Failed to load student details');
      console.error(err);
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

  const { students, summary } = dashboardData || {};

  // Filter students based on risk level
  const filteredStudents = filterRisk === 'all' 
    ? students 
    : students?.filter(s => s.profile.riskLevel === filterRisk);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mentor Dashboard 👨‍🏫
          </h1>
          <p className="text-gray-600">Monitor student engagement and intervention needs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">{summary?.totalStudents || 0}</p>
          </div>
          <div className="card bg-red-50 border-red-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">High Risk</h3>
            <p className="text-3xl font-bold text-red-600">{summary?.highRisk || 0}</p>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Medium Risk</h3>
            <p className="text-3xl font-bold text-yellow-600">{summary?.mediumRisk || 0}</p>
          </div>
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Low Risk</h3>
            <p className="text-3xl font-bold text-green-600">{summary?.lowRisk || 0}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Student List</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by risk:</span>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="card">
          {filteredStudents && filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Risk Level</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Attendance</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Assignments</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Performance</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const stats = student.profile?.statistics || {};
                    const attendanceRate = stats.totalAttendance > 0 
                      ? ((stats.presentCount / stats.totalAttendance) * 100).toFixed(0)
                      : 0;
                    const totalAssignments = stats.assignmentsSubmitted + stats.assignmentsMissed;
                    const assignmentRate = totalAssignments > 0
                      ? ((stats.assignmentsSubmitted / totalAssignments) * 100).toFixed(0)
                      : 0;

                    return (
                      <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{student.course}</div>
                            <div className="text-gray-500">Year {student.year}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <RiskBadge level={student.profile?.riskLevel || 'Low'} />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {attendanceRate}%
                          <div className="text-xs text-gray-500">{stats.presentCount}/{stats.totalAttendance}</div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {assignmentRate}%
                          <div className="text-xs text-gray-500">{stats.assignmentsSubmitted}/{totalAssignments}</div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium">
                          {stats.averagePerformance?.toFixed(1) || 0}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => loadStudentDetails(student._id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No students found</p>
              <p className="text-sm">Students will appear here once they register and start submitting engagement data.</p>
            </div>
          )}
        </div>

        {/* Student Details Modal */}
        {selectedStudent && studentDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Student Details</h2>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{studentDetails.student.name}</h3>
                    <p className="text-gray-600">{studentDetails.student.email}</p>
                    <p className="text-sm text-gray-500">{studentDetails.student.course} - Year {studentDetails.student.year}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Risk Level:</span>
                    <RiskBadge level={studentDetails.profile?.riskLevel || 'Low'} />
                  </div>

                  {studentDetails.profile?.riskReason && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">
                        Reason: {studentDetails.profile.riskReason}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Recent Events</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {studentDetails.events && studentDetails.events.length > 0 ? (
                        studentDetails.events.slice(0, 10).map((event, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium capitalize">{event.eventType}</span>
                              <span className="text-gray-500">{new Date(event.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-gray-600 text-xs mt-1">
                              {event.eventType === 'attendance' && `Status: ${event.eventData.status}`}
                              {event.eventType === 'assignment' && `${event.eventData.assignmentName} - ${event.eventData.submitted ? 'Submitted' : 'Missed'}`}
                              {event.eventType === 'performance' && `${event.eventData.testName} - Score: ${event.eventData.score}%`}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No events yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;








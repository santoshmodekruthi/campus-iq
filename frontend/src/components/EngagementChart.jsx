import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EngagementChart = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="card text-center text-gray-500">
        <p>No engagement data yet. Submit your first event to see trends!</p>
      </div>
    );
  }

  // Prepare data for performance chart
  const performanceData = events
    .filter(e => e.eventType === 'performance')
    .reverse()
    .slice(0, 10)
    .map((e, idx) => ({
      name: e.eventData.testName || `Test ${idx + 1}`,
      score: e.eventData.score,
    }));

  // Prepare data for attendance overview
  const attendanceEvents = events.filter(e => e.eventType === 'attendance');
  const presentCount = attendanceEvents.filter(e => e.eventData.status === 'present').length;
  const absentCount = attendanceEvents.filter(e => e.eventData.status === 'absent').length;

  const attendanceData = [
    { name: 'Present', value: presentCount, fill: '#10b981' },
    { name: 'Absent', value: absentCount, fill: '#ef4444' },
  ];

  // Assignment data
  const assignmentEvents = events.filter(e => e.eventType === 'assignment');
  const submittedCount = assignmentEvents.filter(e => e.eventData.submitted).length;
  const missedCount = assignmentEvents.filter(e => !e.eventData.submitted).length;

  const assignmentData = [
    { name: 'Submitted', value: submittedCount, fill: '#3b82f6' },
    { name: 'Missed', value: missedCount, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {performanceData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attendanceEvents.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {assignmentEvents.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Assignment Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={assignmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementChart;








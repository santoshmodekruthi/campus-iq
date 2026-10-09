import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const EngagementChart = ({ events = [], student }) => {
  const performanceTrend = (student?.performanceHistory || []).map((entry) => ({
    name: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: entry.value,
  }));
  const attendanceTrend = (student?.attendanceHistory || []).map((entry) => ({
    name: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    attendance: entry.percentage,
  }));
  const eventPerformance = events
    .filter((event) => event.eventType === 'performance')
    .slice()
    .reverse()
    .map((event, index) => ({ name: event.eventData.testName || `Activity ${index + 1}`, score: event.eventData.score }));
  const eventAttendance = events.filter((event) => event.eventType === 'attendance');
  const assignmentEvents = events.filter((event) => event.eventType === 'assignment');
  const activityCounts = [
    { name: 'Present', value: eventAttendance.filter((event) => event.eventData.status === 'present').length },
    { name: 'Absent', value: eventAttendance.filter((event) => event.eventData.status === 'absent').length },
    { name: 'Submitted', value: assignmentEvents.filter((event) => event.eventData.submitted).length },
    { name: 'Missed', value: assignmentEvents.filter((event) => !event.eventData.submitted).length },
  ];
  const hasCharts = performanceTrend.length || attendanceTrend.length || eventPerformance.length || activityCounts.some((item) => item.value > 0);

  if (!hasCharts) {
    return <div className="card text-center text-gray-500">Academic trends will appear as verified data becomes available.</div>;
  }

  return (
    <div className="space-y-6">
      {performanceTrend.length > 0 ? (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Academic performance trend · GPA</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name="GPA" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : eventPerformance.length > 0 ? (
        <div className="card">
          <h3 className="text-lg font-semibold mb-1">Student-reported test activities</h3>
          <p className="text-xs text-gray-500 mb-4">Not official academic marks</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={eventPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" name="Reported score" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {attendanceTrend.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Attendance trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#059669" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {activityCounts.some((item) => item.value > 0) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-1">Student-reported activity counts</h3>
          <p className="text-xs text-gray-500 mb-4">These events do not alter verified academic records.</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activityCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Activities" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EngagementChart;

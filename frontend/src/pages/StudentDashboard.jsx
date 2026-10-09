import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import EngagementForm from '../components/EngagementForm';
import EngagementChart from '../components/EngagementChart';
import { studentAPI } from '../services/api';

const StudentDashboard = ({ user, onUserUpdate, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email, mobileNumber: user.mobileNumber || '' });

  const loadDashboard = async () => {
    try {
      const response = await studentAPI.getDashboard();
      setDashboardData(response.data.data);
      const student = response.data.data.student;
      setProfileForm({ name: student.name, email: student.email, mobileNumber: student.mobileNumber || '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleEventSubmit = async (event) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await studentAPI.submitEvent(event);
      setSuccess('Your activity was saved. Official academic records remain unchanged.');
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save activity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    setSuccess('');
    try {
      const response = await studentAPI.updateProfile(profileForm);
      onUserUpdate(response.data.data.user);
      setDashboardData((data) => ({ ...data, student: response.data.data.user }));
      setEditingProfile(false);
      setSuccess('Your profile was updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar user={user} onLogout={onLogout} /><div className="p-12 text-center text-gray-600">Loading your student records...</div></div>;

  const { student, profile, recentEvents = [], metrics = {} } = dashboardData || {};
  if (!student) {
    return <div className="min-h-screen bg-gray-50"><Navbar user={user} onLogout={onLogout} /><div className="max-w-3xl mx-auto p-8"><div role="alert" className="card text-red-700">{error || 'Your student record could not be loaded.'}<button onClick={loadDashboard} className="btn-secondary ml-4">Retry</button></div></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={student} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">{student.college} · {student.registrationNumber}</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Welcome, {student.name}</h1>
            <p className="text-gray-600 mt-1">{student.department} · Semester {student.semester} · Academic year {student.academicYear}</p>
          </div>
          <button className="btn-secondary" onClick={() => setEditingProfile((editing) => !editing)}>{editingProfile ? 'Cancel profile edit' : 'Edit permitted profile details'}</button>
        </header>

        {error && <div role="alert" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
        {success && <div role="status" className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

        {editingProfile && (
          <form onSubmit={handleProfileSave} className="card mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['name', 'Full name', 'text'],
              ['email', 'Email address', 'email'],
              ['mobileNumber', 'Mobile number', 'tel'],
            ].map(([name, label, type]) => (
              <label key={name} className="text-sm font-medium text-gray-700">{label}
                <input className="input-field mt-1" type={type} value={profileForm[name]} onChange={(event) => setProfileForm({ ...profileForm, [name]: event.target.value })} required />
              </label>
            ))}
            <div className="md:col-span-3"><button disabled={savingProfile} className="btn-primary disabled:opacity-50">{savingProfile ? 'Saving...' : 'Save profile'}</button></div>
          </form>
        )}

        <section className="card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><p className="text-sm text-gray-600">Academic risk assessment</p><h2 className="text-xl font-bold text-gray-900 mt-1">Your current standing</h2></div>
            <RiskBadge level={metrics.riskLevel || student.riskLevel} />
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Indicators</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {(profile.riskReasons || []).map((reason) => <li key={reason}>• {reason}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Recommended next steps</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {(profile.recommendations || []).map((recommendation) => <li key={recommendation}>• {recommendation}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {[
            ['Attendance', `${metrics.attendancePercentage ?? 0}%`, 'Verified attendance'],
            ['Current GPA', `${Number(metrics.gpa ?? 0).toFixed(2)} / 10`, 'Current academic record'],
            ['Assignments', `${metrics.assignmentCompletionRate ?? 0}%`, 'Completion rate'],
            ['Academic marks', student.academicMarks?.length || 0, 'Recorded assessments'],
          ].map(([label, value, subtitle]) => (
            <div key={label} className="card"><p className="text-sm font-medium text-gray-500">{label}</p><p className="text-3xl font-bold text-blue-700 mt-2">{value}</p><p className="text-xs text-gray-500 mt-2">{subtitle}</p></div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1"><EngagementForm onSubmit={handleEventSubmit} loading={submitting} /></div>
          <div className="lg:col-span-2"><EngagementChart events={recentEvents} student={student} /></div>
        </section>

        {recentEvents.length > 0 && (
          <section className="card mt-6">
            <h2 className="text-lg font-semibold mb-4">Student-reported activity</h2>
            <ul className="divide-y divide-gray-100">
              {recentEvents.slice(0, 8).map((event) => (
                <li key={event._id} className="py-3 flex flex-wrap justify-between gap-2 text-sm">
                  <span><strong className="capitalize">{event.eventType}</strong> · {event.eventType === 'attendance' ? event.eventData.status : event.eventType === 'assignment' ? `${event.eventData.assignmentName} (${event.eventData.submitted ? 'submitted' : 'missed'})` : `${event.eventData.testName} (${event.eventData.score})`}</span>
                  <time className="text-gray-500">{new Date(event.createdAt).toLocaleDateString()}</time>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;

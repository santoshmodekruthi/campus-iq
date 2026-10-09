import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { adminAPI } from '../services/api';
import { COLLEGES } from '../config/colleges';

const pageSize = 25;
const riskColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business', 'Undeclared'];
const number = (value, digits = 1) => Number(value || 0).toFixed(digits);

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';

const AdminDashboard = ({ user, onLogout }) => {
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [filters, setFilters] = useState({ search: '', college: '', department: '', semester: '', riskLevel: '' });
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState('gpa');
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const query = useMemo(() => ({
    ...filters,
    page,
    limit: pageSize,
    sort,
    direction,
  }), [filters, page, sort, direction]);

  const loadOverview = async () => {
    try {
      const response = await adminAPI.getOverview();
      setOverview(response.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load administrator analytics.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await adminAPI.getStudents(query);
      setRows(response.data.data.students);
      setPagination(response.data.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load student records.');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => { loadOverview(); }, []);
  useEffect(() => { loadStudents(); }, [query]);

  const openDetails = async (student) => {
    setSelected(student);
    setDetails(null);
    setForm({
      name: student.name,
      email: student.email,
      dateOfBirth: toDateInput(student.dateOfBirth),
      college: student.college,
      registrationNumber: student.registrationNumber,
      mobileNumber: student.mobileNumber,
      department: student.department,
      semester: student.semester,
      academicYear: student.academicYear,
      attendancePercentage: student.attendancePercentage,
      academicMarks: (student.academicMarks || []).join(', '),
      assignmentCompletion: student.assignmentCompletion,
      gpa: student.gpa,
      enrollmentStatus: student.enrollmentStatus,
      interventionNote: '',
    });
    try {
      const response = await adminAPI.getStudent(student._id);
      setDetails(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load student details.');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selected || !form) return;
    setSaving(true);
    setError('');
    try {
      const updates = {
        ...form,
        semester: Number(form.semester),
        academicYear: Number(form.academicYear),
        attendancePercentage: Number(form.attendancePercentage),
        assignmentCompletion: Number(form.assignmentCompletion),
        gpa: Number(form.gpa),
        academicMarks: form.academicMarks.split(',').map((mark) => Number(mark.trim())).filter(Number.isFinite),
      };
      if (!updates.interventionNote.trim()) delete updates.interventionNote;
      const response = await adminAPI.updateStudent(selected._id, updates);
      const updatedStudent = response.data.data.student;
      setSelected(updatedStudent);
      setDetails((current) => current ? {
        ...current,
        student: updatedStudent,
        audit: [response.data.data.audit, ...(current.audit || [])],
      } : current);
      setForm((current) => ({ ...current, academicMarks: (updatedStudent.academicMarks || []).join(', '), interventionNote: '' }));
      await Promise.all([loadOverview(), loadStudents()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save student changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminAPI.exportStudents(filters);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'campus-iq-students.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to export the filtered records.');
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters({ ...filters, search: searchText.trim() });
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar user={user} onLogout={onLogout} /><div className="p-12 text-center text-gray-600">Loading CAMPUS IQ analytics...</div></div>;
  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <main className="max-w-3xl mx-auto p-8">
          <div role="alert" className="card text-red-700">
            {error || 'Administrator analytics are unavailable.'}
            <button onClick={loadOverview} className="btn-secondary ml-4">Retry</button>
          </div>
        </main>
      </div>
    );
  }

  const totals = overview?.totals || {};
  const riskData = [
    { name: 'High', value: totals.highRisk || 0 },
    { name: 'Medium', value: totals.mediumRisk || 0 },
    { name: 'Low', value: totals.lowRisk || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-7">
          <p className="text-sm font-semibold text-blue-700 tracking-wide">ADMIN PORTAL</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Student success analytics</h1>
          <p className="text-gray-600 mt-2">Database-backed overview across the 10 configured colleges.</p>
        </header>
        {error && <div role="alert" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[
            ['Total students', totals.totalStudents, 'Enrolled student records'],
            ['Colleges', totals.totalColleges, 'Fixed participating colleges'],
            ['High risk', totals.highRisk, 'Immediate review recommended'],
            ['Medium risk', totals.mediumRisk, 'Monitor and offer support'],
            ['Low risk', totals.lowRisk, 'No current warning indicators'],
            ['Average attendance', `${number(totals.averageAttendance)}%`, 'Across all student records'],
            ['Average GPA', `${number(totals.averageGpa, 2)} / 10`, 'Across all student records'],
            ['Declining / intervention', `${totals.declining || 0} / ${totals.intervention || 0}`, 'Declining performance / intervention queue'],
          ].map(([label, value, caption]) => (
            <div className="card" key={label}>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{value ?? 0}</p>
              <p className="text-xs text-gray-500 mt-2">{caption}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="card xl:col-span-2">
            <h2 className="text-lg font-semibold mb-4">College-wise student and risk comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overview?.collegeComparisons || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="lowRisk" name="Low risk" stackId="risk" fill={riskColors.Low} />
                <Bar dataKey="mediumRisk" name="Medium risk" stackId="risk" fill={riskColors.Medium} />
                <Bar dataKey="highRisk" name="High risk" stackId="risk" fill={riskColors.High} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-2">Risk distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                  {riskData.map((entry) => <Cell key={entry.name} fill={riskColors[entry.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Academic averages by college</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-3 pr-4">College</th><th className="py-3 pr-4">Students</th><th className="py-3 pr-4">Average attendance</th><th className="py-3 pr-4">Average GPA</th><th className="py-3 pr-4">High risk</th>
              </tr></thead>
              <tbody>{(overview?.collegeComparisons || []).map((college) => (
                <tr key={college._id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium">{college._id}</td>
                  <td className="py-3 pr-4">{college.students}</td>
                  <td className="py-3 pr-4">{number(college.averageAttendance)}%</td>
                  <td className="py-3 pr-4">{number(college.averageGpa, 2)} / 10</td>
                  <td className="py-3 pr-4">{college.highRisk}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="text-lg font-semibold mb-2">Academic performance trend</h2>
          {(overview?.performanceTrends || []).length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overview.performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageGpa" name="Average GPA" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 py-8 text-center">Performance trends will appear after student academic history is recorded.</p>}
        </section>

        <section className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div><h2 className="text-xl font-bold">Student records</h2><p className="text-sm text-gray-500">{pagination.total} matching records · server-paginated</p></div>
            <button onClick={handleExport} className="btn-secondary">Export filtered CSV</button>
          </div>
          <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-5">
            <input aria-label="Search students" className="input-field xl:col-span-2" placeholder="Search name, email, registration number" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
            <select aria-label="Filter college" className="input-field" value={filters.college} onChange={(event) => { setFilters({ ...filters, college: event.target.value }); setPage(1); }}>
              <option value="">All colleges</option>{COLLEGES.map((college) => <option key={college}>{college}</option>)}
            </select>
            <select aria-label="Filter department" className="input-field" value={filters.department} onChange={(event) => { setFilters({ ...filters, department: event.target.value }); setPage(1); }}>
              <option value="">All departments</option>{departments.map((department) => <option key={department}>{department}</option>)}
            </select>
            <select aria-label="Filter semester" className="input-field" value={filters.semester} onChange={(event) => { setFilters({ ...filters, semester: event.target.value }); setPage(1); }}>
              <option value="">All semesters</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>Semester {index + 1}</option>)}
            </select>
            <select aria-label="Filter risk" className="input-field" value={filters.riskLevel} onChange={(event) => { setFilters({ ...filters, riskLevel: event.target.value }); setPage(1); }}>
              <option value="">All risk levels</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <button className="btn-primary">Search</button>
            <select aria-label="Sort records" className="input-field" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="gpa">Sort by GPA</option><option value="attendance">Sort by attendance</option><option value="risk">Sort by risk</option><option value="name">Sort by name</option>
            </select>
            <select aria-label="Sort direction" className="input-field" value={direction} onChange={(event) => setDirection(event.target.value)}>
              <option value="desc">Descending</option><option value="asc">Ascending</option>
            </select>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-3 pr-4">Student</th><th className="py-3 pr-4">College / Department</th><th className="py-3 pr-4">Semester</th><th className="py-3 pr-4">GPA</th><th className="py-3 pr-4">Attendance</th><th className="py-3 pr-4">Risk</th><th className="py-3">Details</th>
              </tr></thead>
              <tbody>
                {studentsLoading ? <tr><td colSpan="7" className="py-8 text-center text-gray-500">Loading student records...</td></tr> :
                  rows.length === 0 ? <tr><td colSpan="7" className="py-8 text-center text-gray-500">No students match these filters.</td></tr> :
                    rows.map((student) => (
                      <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 pr-4"><div className="font-medium text-gray-900">{student.name}</div><div className="text-gray-500">{student.registrationNumber}</div><div className="text-xs text-gray-500">{student.email}</div></td>
                        <td className="py-3 pr-4">{student.college}<div className="text-xs text-gray-500">{student.department}</div></td>
                        <td className="py-3 pr-4">{student.semester}</td>
                        <td className="py-3 pr-4">{number(student.gpa, 2)}</td>
                        <td className="py-3 pr-4">{number(student.attendancePercentage)}%</td>
                        <td className="py-3 pr-4"><RiskBadge level={student.riskLevel} /></td>
                        <td className="py-3"><button className="text-blue-700 font-medium hover:underline" onClick={() => openDetails(student)}>View / edit</button></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Page {pagination.page || page} of {Math.max(1, pagination.pages || 1)}</p>
            <div className="flex gap-2">
              <button className="btn-secondary disabled:opacity-50" disabled={page <= 1 || studentsLoading} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <button className="btn-secondary disabled:opacity-50" disabled={page >= pagination.pages || studentsLoading} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
        </section>

        {selected && form && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="student-detail-title">
            <section className="max-w-5xl mx-auto my-6 bg-white rounded-2xl shadow-xl p-5 md:p-7">
              <div className="flex justify-between items-start gap-4 mb-5">
                <div><p className="text-sm font-semibold text-blue-700">{selected.registrationNumber}</p><h2 id="student-detail-title" className="text-2xl font-bold">Student details and record editor</h2></div>
                <button className="btn-secondary" onClick={() => { setSelected(null); setDetails(null); setForm(null); }}>Close</button>
              </div>
              {!details ? <p className="py-8 text-center text-gray-500">Loading complete student details...</p> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ['name', 'Full name', 'text'], ['email', 'Email', 'email'],
                        ['dateOfBirth', 'Date of birth', 'date'], ['mobileNumber', 'Mobile number', 'tel'],
                        ['registrationNumber', 'Registration number', 'text'], ['department', 'Department', 'text'],
                        ['semester', 'Semester', 'number'], ['academicYear', 'Academic year', 'number'],
                        ['attendancePercentage', 'Attendance %', 'number'], ['assignmentCompletion', 'Assignment completion %', 'number'],
                        ['gpa', 'GPA (0-10)', 'number'], ['academicMarks', 'Academic marks (comma separated)', 'text'],
                      ].map(([key, label, type]) => (
                        <label key={key} className="text-sm font-medium text-gray-700">{label}
                          <input className="input-field mt-1" type={type} value={form[key] ?? ''} min={type === 'number' ? 0 : undefined} max={key === 'gpa' ? 10 : key.includes('Percentage') ? 100 : undefined} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required />
                        </label>
                      ))}
                      <label className="text-sm font-medium text-gray-700">College
                        <select className="input-field mt-1" value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })}>{COLLEGES.map((college) => <option key={college}>{college}</option>)}</select>
                      </label>
                      <label className="text-sm font-medium text-gray-700">Enrollment status
                        <select className="input-field mt-1" value={form.enrollmentStatus} onChange={(event) => setForm({ ...form, enrollmentStatus: event.target.value })}>{['Active', 'On leave', 'Withdrawn', 'Graduated'].map((status) => <option key={status}>{status}</option>)}</select>
                      </label>
                      <label className="text-sm font-medium text-gray-700 sm:col-span-2">Add intervention note
                        <textarea className="input-field mt-1" rows="3" maxLength="1000" value={form.interventionNote} onChange={(event) => setForm({ ...form, interventionNote: event.target.value })} />
                      </label>
                      <div className="sm:col-span-2 flex items-center gap-3">
                        <button disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save audited changes'}</button>
                        <RiskBadge level={details.student.riskLevel} />
                      </div>
                    </form>
                  </div>
                  <aside className="bg-gray-50 rounded-xl p-4 text-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Current record</h3>
                    <p><strong>Student ID:</strong> {details.student.studentId}</p>
                    <p className="mt-1"><strong>Risk indicators:</strong> {details.student.riskReasons?.join('; ') || 'None'}</p>
                    <p className="mt-1"><strong>Recommendations:</strong> {details.student.recommendations?.join(' ') || 'None'}</p>
                    <h3 className="font-semibold text-gray-900 mt-5 mb-2">Intervention notes</h3>
                    <ul className="space-y-2 max-h-40 overflow-auto">{(details.student.interventionNotes || []).slice().reverse().map((note, index) => <li key={`${note.createdAt}-${index}`} className="border-l-2 border-blue-300 pl-2"><p>{note.note}</p><p className="text-xs text-gray-500">{note.createdBy} · {new Date(note.createdAt).toLocaleDateString()}</p></li>)}</ul>
                    <h3 className="font-semibold text-gray-900 mt-5 mb-2">Recent audit entries</h3>
                    <ul className="space-y-2 max-h-40 overflow-auto">{(details.audit || []).map((entry) => <li key={entry._id} className="border-l-2 border-gray-300 pl-2"><p>{entry.actorUsername}: {entry.action}</p><p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p></li>)}</ul>
                  </aside>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

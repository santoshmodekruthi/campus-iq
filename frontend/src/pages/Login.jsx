import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { COLLEGES } from '../config/colleges';

const Login = ({ portal, onLogin }) => {
  const isAdmin = portal === 'admin';
  const navigate = useNavigate();
  const [form, setForm] = useState({ college: '', registrationNumber: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = isAdmin
        ? await authAPI.loginAdmin({ username: form.username, password: form.password })
        : await authAPI.loginStudent({
          college: form.college,
          registrationNumber: form.registrationNumber.trim().toUpperCase(),
          password: form.password,
        });
      const { user, token } = response.data.data;
      onLogin(user, token);
      navigate(user.mustChangePassword ? '/change-password' : '/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Sign in failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="max-w-md w-full">
        <header className="text-center mb-8">
          <p className="text-sm font-semibold tracking-[0.24em] text-blue-700 mb-2">CAMPUS IQ</p>
          <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? 'Admin Portal' : 'Student Portal'}</h1>
          <p className="text-gray-600 mt-2">AI-Powered Student Analytics and Success Platform</p>
        </header>
        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{isAdmin ? 'Administrator sign in' : 'Welcome back'}</h2>
          {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Administrator username</label>
                <input id="username" name="username" value={form.username} onChange={handleChange} className="input-field" autoComplete="username" required />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="college">College</label>
                  <select id="college" name="college" value={form.college} onChange={handleChange} className="input-field" required>
                    <option value="">Select your college</option>
                    {COLLEGES.map((college) => <option key={college} value={college}>{college}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="registrationNumber">Registration number</label>
                  <input id="registrationNumber" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} className="input-field" autoComplete="username" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input id="password" type="password" name="password" value={form.password} onChange={handleChange} className="input-field" autoComplete={isAdmin ? 'current-password' : 'current-password'} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Signing in...' : isAdmin ? 'Sign in to Admin Portal' : 'Sign in to Student Portal'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            {isAdmin ? (
              <>Student? <Link to="/login/student" className="text-blue-600 font-medium">Go to Student Portal</Link></>
            ) : (
              <>{'New student? '}<Link to="/register" className="text-blue-600 font-medium">Create an account</Link><div className="mt-3">Administrator? <Link to="/login/admin" className="text-blue-600 font-medium">Go to Admin Portal</Link></div></>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;

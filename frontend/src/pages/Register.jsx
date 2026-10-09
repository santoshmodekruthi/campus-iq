import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { COLLEGES } from '../config/colleges';

const initialForm = {
  name: '',
  email: '',
  dateOfBirth: '',
  college: '',
  registrationNumber: '',
  password: '',
  confirmPassword: '',
  mobileNumber: '',
};

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.registrationNumber.toUpperCase().startsWith(form.college)) {
      setError('Your registration number must start with your college code.');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.register({
        ...form,
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
      });
      onLogin(response.data.data.user, response.data.data.token);
      navigate('/dashboard');
    } catch (requestError) {
      const message = requestError.response?.data?.message
        || (requestError.response
          ? `Registration request failed (HTTP ${requestError.response.status}). Please retry or contact an administrator.`
          : requestError.code === 'ERR_NETWORK'
            ? 'Cannot reach the CAMPUS IQ API. Confirm the backend is running at http://localhost:5000, then retry.'
            : `Registration request failed: ${requestError.message || 'unknown client error'}`);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="max-w-xl w-full">
        <header className="text-center mb-8">
          <p className="text-sm font-semibold tracking-[0.24em] text-blue-700 mb-2">CAMPUS IQ</p>
          <h1 className="text-3xl font-bold text-gray-900">Student registration</h1>
          <p className="text-gray-600 mt-2">AI-Powered Student Analytics and Success Platform</p>
        </header>
        <section className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Create your student account</h2>
          {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="input-field" autoComplete="name" minLength="2" maxLength="100" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} className="input-field" autoComplete="email" required />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <input id="dateOfBirth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">College name</label>
              <select id="college" name="college" value={form.college} onChange={handleChange} className="input-field" required>
                <option value="">Select your college</option>
                {COLLEGES.map((college) => <option value={college} key={college}>{college}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">Registration / roll number</label>
              <input id="registrationNumber" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} className="input-field" autoCapitalize="characters" minLength="3" maxLength="31" required />
              {form.college && <p className="mt-1 text-xs text-gray-500">Must begin with {form.college}.</p>}
            </div>
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
              <input id="mobileNumber" type="tel" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className="input-field" autoComplete="tel" pattern="\+?[0-9]{10,15}" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="password" type="password" name="password" value={form.password} onChange={handleChange} className="input-field" autoComplete="new-password" minLength="8" maxLength="128" required />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field" autoComplete="new-password" minLength="8" maxLength="128" required />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create student account'}
              </button>
            </div>
          </form>
          <p className="mt-5 text-center text-sm text-gray-600">
            Already registered? <Link to="/login/student" className="text-blue-600 font-medium">Sign in to Student Portal</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Register;

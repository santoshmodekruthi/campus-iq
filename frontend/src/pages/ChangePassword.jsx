import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ChangePassword = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.changePassword(form);
      onUserUpdate(response.data.data.user);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <section className="card max-w-md w-full">
        <p className="text-sm font-semibold tracking-[0.2em] text-blue-700 mb-2">CAMPUS IQ</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set a new password</h1>
        <p className="text-sm text-gray-600 mb-5">For your account security, {user.name}, change your initial password before continuing.</p>
        {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">Current password
            <input type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} className="input-field mt-1" autoComplete="current-password" required />
          </label>
          <label className="block text-sm font-medium text-gray-700">New password
            <input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} className="input-field mt-1" autoComplete="new-password" minLength="8" maxLength="128" required />
          </label>
          <label className="block text-sm font-medium text-gray-700">Confirm new password
            <input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} className="input-field mt-1" autoComplete="new-password" minLength="8" maxLength="128" required />
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Saving...' : 'Change password'}</button>
        </form>
      </section>
    </main>
  );
};

export default ChangePassword;

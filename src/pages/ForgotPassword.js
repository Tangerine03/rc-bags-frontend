import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { API_URL as BASE_URL } from '../config';
const API_URL = `${BASE_URL}/api/auth`;

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      alert('Password updated. Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError('Something went wrong. Check your connection and try again.');
    }
    setSubmitting(false);
  }

  return (
    <div className="login-page">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
  <label>New Password</label>
  <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
</div>
<div className="form-group">
  <label>Confirm New Password</label>
  <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
</div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Password'}</button>
      </form>
      <p className="login-note"><Link to="/login">Back to Login</Link></p>
    </div>
  );
}

export default ForgotPassword;
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { API_URL as BASE_URL } from '../config';
const API_URL = `${BASE_URL}/api/auth`;

const ADMIN_EMAIL = 'admin@rcbags.com';
const ADMIN_PASSWORD = 'staxbags123';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validateLogin() {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!validateLogin()) return;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ email: data.error });
        setSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(redirectTo);
    } catch (err) {
      setErrors({ email: 'Something went wrong. Check your connection and try again.' });
    }
    setSubmitting(false);
  }

  function validateRegister() {
    const newErrors = {};
    if (!regName.trim() || regName.trim().length < 2) newErrors.regName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) newErrors.regEmail = 'Enter a valid email address.';
    if (!/^\d{10}$/.test(regPhone)) newErrors.regPhone = 'Enter a valid 10-digit phone number.';
    if (regPassword.length < 6) newErrors.regPassword = 'Password must be at least 6 characters.';
    if (regConfirmPassword !== regPassword) newErrors.regConfirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (!validateRegister()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ regEmail: data.error });
        setSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(redirectTo);
    } catch (err) {
      setErrors({ regEmail: 'Something went wrong. Check your connection and try again.' });
    }
    setSubmitting(false);
  }

  return (
    <div className="login-page">
      {mode === 'login' ? (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div className="form-group">
  <label>Password</label>
  <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
  {errors.password && <p className="field-error">{errors.password}</p>}
</div>
            <button type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</button>
          </form>
          <p className="login-note"><Link to="/forgot-password">Forgot password?</Link></p>
          <p className="login-note">
            New here?{' '}
            <span className="auth-toggle-link" onClick={() => { setMode('register'); setErrors({}); }}>Register</span>
          </p>
        </>
      ) : (
        <>
          <h2>Register</h2>
          <form onSubmit={handleRegisterSubmit} noValidate>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} />
              {errors.regName && <p className="field-error">{errors.regName}</p>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              {errors.regEmail && <p className="field-error">{errors.regEmail}</p>}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))} maxLength="10" />
              {errors.regPhone && <p className="field-error">{errors.regPhone}</p>}
            </div>
            <div className="form-group">
  <label>Password</label>
  <PasswordInput value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
  {errors.regPassword && <p className="field-error">{errors.regPassword}</p>}
</div>
            <div className="form-group">
  <label>Confirm Password</label>
  <PasswordInput value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
  {errors.regConfirmPassword && <p className="field-error">{errors.regConfirmPassword}</p>}
</div>
            <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create Account'}</button>
          </form>
          <p className="login-note">
            Already have an account?{' '}
            <span className="auth-toggle-link" onClick={() => { setMode('login'); setErrors({}); }}>Login</span>
          </p>
        </>
      )}
    </div>
  );
}

export default Login;
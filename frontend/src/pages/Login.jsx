import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authApi';
import { validateLoginForm } from '../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthToken } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateLoginForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await login(form.email.trim(), form.password);
      setAuthToken(response.token);
      navigate('/home');
    } catch (error) {
      if (error.errors) {
        setFieldErrors(error.errors);
      } else {
        setServerError(error.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="brand" aria-label="SmartAccessories">
          Smart<span>Accessories</span>
        </div>
        <h1>Log In</h1>
        <p className="subtitle">Sign in to your account</p>

        {successMessage && <div className="success">{successMessage}</div>}
        {serverError && <div className="alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
            {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <div className="link-row">
          New user? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

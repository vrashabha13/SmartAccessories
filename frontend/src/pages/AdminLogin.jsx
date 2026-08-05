import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authApi';
import { validateLoginForm } from '../utils/validation';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (response.user.role?.toUpperCase() !== 'ADMIN') {
        setServerError('Access denied. This portal is restricted to administrators.');
        return;
      }
      setAuthToken(response.token, response.user);
      navigate('/admin/dashboard');
    } catch (error) {
      if (error.errors) {
        setFieldErrors(error.errors);
      } else {
        setServerError(error.message || 'Invalid administrative credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <style>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
          background: radial-gradient(circle at 10% 20%, rgba(90, 20, 150, 0.4) 0%, rgba(10, 12, 25, 1) 90%);
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
          overflow: hidden;
        }

        .admin-login-card {
          width: 100%;
          max-width: 440px;
          padding: 45px 40px;
          border-radius: 20px;
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(20px);
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.05);
          animation: adminFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes adminFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .admin-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.5px;
          color: #fff;
        }

        .admin-brand span {
          background: linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-login-card h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .admin-subtitle {
          color: #94a3b8;
          text-align: center;
          margin-bottom: 35px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .admin-form-group {
          margin-bottom: 24px;
        }

        .admin-form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #cbd5e1;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-form-group input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          background: rgba(15, 23, 42, 0.6);
          font-size: 15px;
          color: #fff;
          transition: all 0.3s ease;
        }

        .admin-form-group input:focus {
          outline: none;
          border-color: #8b5cf6;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
        }

        .admin-btn {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 15px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
        }

        .admin-btn:active {
          transform: scale(0.98);
        }

        .admin-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .admin-alert {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .admin-error-text {
          color: #fca5a5;
          margin-top: 6px;
          font-size: 0.8rem;
        }

        .admin-link-row {
          text-align: center;
          margin-top: 24px;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .admin-link-row a {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 700;
          transition: .25s;
        }

        .admin-link-row a:hover {
          color: #c084fc;
          text-decoration: underline;
        }
      `}</style>

      <div className="admin-login-card">
        <div className="admin-brand">
          <img src="/logo.png" alt="" height="50" style={{ verticalAlign: 'middle' }} />
          <span>SmartAccessories</span>
        </div>
        <h1>Control Panel</h1>
        <p className="admin-subtitle">Administrator Login</p>

        {serverError && <div className="admin-alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@smartaccessories.com"
              value={form.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <p className="admin-error-text">{fieldErrors.email}</p>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Security Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            {fieldErrors.password && <p className="admin-error-text">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'Authorizing Access...' : 'Verify Identity'}
          </button>
        </form>

        <div className="admin-link-row">
          Not an Administrator? <Link to="/login">Customer Login</Link>
        </div>
      </div>
    </div>
  );
}

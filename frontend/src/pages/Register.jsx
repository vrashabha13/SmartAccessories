import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authApi';
import { validateRegisterForm } from '../utils/validation';

const initialForm = {
  fullName: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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

    const errors = validateRegisterForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      await register(form);
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (error) {
      if (error.errors) {
        setFieldErrors(error.errors);
      } else {
        setServerError(error.message || 'Registration failed');
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
        <h1>Create Account</h1>
        <p className="subtitle">Register to access the e-commerce platform</p>

        {serverError && <div className="alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
            />
            {fieldErrors.fullName && <p className="error-text">{fieldErrors.fullName}</p>}
          </div>

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
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="text"
              value={form.mobileNumber}
              onChange={handleChange}
            />
            {fieldErrors.mobileNumber && <p className="error-text">{fieldErrors.mobileNumber}</p>}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {fieldErrors.confirmPassword && (
              <p className="error-text">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="link-row">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

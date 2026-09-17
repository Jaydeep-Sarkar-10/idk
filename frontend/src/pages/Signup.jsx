import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      if (err && typeof err === 'object') {
        if (err.detail) setError(err.detail);
        else setFieldErrors(err);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await googleLogin(idToken);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log('Google login cancelled by user');
      } else if (err && typeof err === 'object') {
        if (err.error) setError(err.error);
        else if (err.detail) setError(err.detail);
        else setError('Google login failed. Please try again.');
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="username" className="auth-label">Username</label>
            <input
              id="username" name="username" type="text" required
              value={formData.username} onChange={handleChange}
              className="auth-input"
            />
            {fieldErrors.username && <p className="auth-input-error">{fieldErrors.username}</p>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Email address</label>
            <input
              id="email" name="email" type="email" required
              value={formData.email} onChange={handleChange}
              className="auth-input"
            />
            {fieldErrors.email && <p className="auth-input-error">{fieldErrors.email}</p>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="mobile_number" className="auth-label">Mobile number</label>
            <input
              id="mobile_number" name="mobile_number" type="tel" required
              value={formData.mobile_number} onChange={handleChange}
              className="auth-input"
            />
            {fieldErrors.mobile_number && <p className="auth-input-error">{fieldErrors.mobile_number}</p>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password" name="password" type={showPassword ? 'text' : 'password'} required
              value={formData.password} onChange={handleChange}
              className="auth-input"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-password-toggle">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {fieldErrors.password && <p className="auth-input-error">{fieldErrors.password}</p>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirm_password" className="auth-label">Confirm Password</label>
            <input
              id="confirm_password" name="confirm_password" type={showPassword ? 'text' : 'password'} required
              value={formData.confirm_password} onChange={handleChange}
              className="auth-input"
            />
            {fieldErrors.confirm_password && <p className="auth-input-error">{fieldErrors.confirm_password}</p>}
          </div>

          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          
          <button 
            type="button" 
            className="auth-btn-google" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            {loading ? 'Please wait...' : 'Continue with Google'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

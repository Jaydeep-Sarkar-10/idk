import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      if (err && err.error) {
        setError(err.error);
      } else if (err && err.detail) {
        setError(err.detail);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await googleLogin(idToken);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User cancelled, do nothing or show silent error
        console.log('Google login cancelled by user');
      } else if (err && err.error) {
        setError(err.error);
      } else if (err && err.detail) {
        setError(err.detail);
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
        <h2 className="auth-title">Log in to your account</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="identifier" className="auth-label">Email or Mobile number</label>
            <input
              id="identifier" name="identifier" type="text" required
              value={formData.identifier} onChange={handleChange}
              className="auth-input"
            />
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
          </div>

          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? 'Logging in...' : 'Log in'}
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
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

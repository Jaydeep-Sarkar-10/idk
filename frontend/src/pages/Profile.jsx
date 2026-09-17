import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import './Auth.css';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingMobile, setIsEditingMobile] = useState(!user?.mobile_number);
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveMobile = async () => {
    setError('');
    setSuccess('');
    
    if (!mobileNumber) {
      setError('Mobile number is required.');
      return;
    }
    
    // Basic validation for numbers only
    if (!/^\d+$/.test(mobileNumber)) {
      setError('Mobile number must contain only digits.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const updatedUser = await authAPI.updateMe(token, { mobile_number: mobileNumber });
      setUser(updatedUser);
      setSuccess('Mobile number updated successfully!');
      setIsEditingMobile(false);
    } catch (err) {
      if (err.mobile_number) {
        setError(err.mobile_number.join(' '));
      } else {
        setError(err.error || err.detail || 'Failed to update mobile number.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <button onClick={handleLogout} className="profile-logout-btn">
            Log out
          </button>
        </div>
        
        {error && <div className="auth-error" style={{ marginBottom: '1rem', color: 'red' }}>{error}</div>}
        {success && <div className="auth-success" style={{ marginBottom: '1rem', color: 'green' }}>{success}</div>}
        
        <div className="profile-grid">
          <div className="profile-field">
            <div className="profile-label">Username</div>
            <div className="profile-value">{user.username}</div>
          </div>
          
          <div className="profile-field">
            <div className="profile-label">Email</div>
            <div className="profile-value">{user.email}</div>
          </div>
          
          <div className="profile-field">
            <div className="profile-label">Mobile Number</div>
            <div className="profile-value" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {isEditingMobile ? (
                <>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="auth-input"
                    style={{ margin: 0, flex: 1 }}
                  />
                  <button 
                    onClick={handleSaveMobile} 
                    disabled={isSaving}
                    className="auth-button"
                    style={{ width: 'auto', padding: '0.5rem 1rem' }}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  {user.mobile_number && (
                    <button 
                      onClick={() => {
                        setIsEditingMobile(false);
                        setMobileNumber(user.mobile_number);
                        setError('');
                        setSuccess('');
                      }} 
                      className="auth-button"
                      style={{ width: 'auto', padding: '0.5rem 1rem', background: '#ccc', color: '#333' }}
                    >
                      Cancel
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span>{user.mobile_number}</span>
                  <button 
                    onClick={() => setIsEditingMobile(true)}
                    className="auth-button"
                    style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="profile-field">
            <div className="profile-label">Member Since</div>
            <div className="profile-value">
              {new Date(user.date_joined).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

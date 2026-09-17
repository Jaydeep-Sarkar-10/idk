import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
            <div className="profile-value">{user.mobile_number}</div>
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

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, PlusSquare, User, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, loading } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
             <span className="logo-icon">S</span>
             Sasta OLX
          </Link>
          <div className="nav-links desktop-only">
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/marketplace?cat=RENT">Rentals</Link>
            <Link to="/requests">Requests</Link>
          </div>
        </div>
        <div className="nav-actions desktop-only">
          <Link to="/sell" className="nav-btn-accent"><PlusSquare size={18}/> Sell</Link>
          <Link to="/chat" className="nav-icon-btn"><MessageSquare size={22}/></Link>
          <Link to="/notifications" className="nav-icon-btn"><Bell size={22}/></Link>
          
          {loading ? (
            <div className="nav-icon-btn" style={{opacity: 0.5}}><User size={22}/></div>
          ) : user ? (
            <Link to="/profile" className="nav-icon-btn"><User size={22}/></Link>
          ) : (
            <Link to="/login" className="nav-btn-accent" style={{background: 'var(--color-primary-light)'}}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import MobileMenu from './MobileMenu';
import './Header.css';

const Header = () => {
  const { user, logout } = useUserAuth();

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="header-brand">
          <h1>🇱🇷 Connect Liberia</h1>
        </Link>
        <div className="header-actions">
          <MobileMenu />
          <div className="desktop-nav">
            {user ? (
              <>
                <span className="user-greeting">👋 {user.username}</span>
                <Link to="/favorites" className="header-link">❤️ Favorites</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-link">Login</Link>
                <Link to="/register" className="header-link register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="header-subtitle">Find information about institutions across Liberia</p>
    </header>
  );
};

export default Header;
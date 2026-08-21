import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import './Layout.css';

const Header = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>Connect Liberia Admin</h1>
      </div>
      <div className="header-right">
        <button onClick={onLogout} className="logout-btn">
          <LogoutIcon />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
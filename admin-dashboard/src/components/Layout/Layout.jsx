import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header onLogout={logout} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
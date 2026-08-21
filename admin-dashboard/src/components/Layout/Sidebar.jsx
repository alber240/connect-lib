import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import './Layout.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h2>🇱🇷 CL</h2>
        <span>Admin</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/institutions" className={({ isActive }) => isActive ? 'active' : ''}>
          <BusinessIcon />
          <span>Institutions</span>
        </NavLink>
        <NavLink to="/suggestions" className={({ isActive }) => isActive ? 'active' : ''}>
          <LightbulbIcon />
          <span>Suggestions</span>
        </NavLink>
        <NavLink to="/news" className={({ isActive }) => isActive ? 'active' : ''}>
          <NewspaperIcon />
          <span>News</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
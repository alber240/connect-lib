import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import './MobileMenu.css';

const MobileMenu = () => {
    const { user, logout } = useUserAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
                <span className={`hamburger ${isOpen ? 'active' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={closeMenu}></div>

            <nav className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <span className="mobile-menu-brand">🇱🇷 Connect Liberia</span>
                    <button className="mobile-menu-close" onClick={closeMenu}>×</button>
                </div>

                <ul className="mobile-menu-links">
                    <li>
                        <Link to="/" onClick={closeMenu}>
                            🏠 Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/search" onClick={closeMenu}>
                            🔍 Search
                        </Link>
                    </li>
                    <li>
                        <Link to="/news" onClick={closeMenu}>
                            📰 News
                        </Link>
                    </li>
                    <li>
                        <Link to="/suggest" onClick={closeMenu}>
                            💡 Suggest
                        </Link>
                    </li>
                    {user && (
                        <li>
                            <Link to="/favorites" onClick={closeMenu}>
                                ❤️ Favorites
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="mobile-menu-footer">
                    {user ? (
                        <>
                            <span className="mobile-user">👋 {user.username}</span>
                            <button onClick={() => { logout(); closeMenu(); }} className="mobile-logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu} className="mobile-login">
                                Login
                            </Link>
                            <Link to="/register" onClick={closeMenu} className="mobile-register">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
};

export default MobileMenu;
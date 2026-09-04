import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { trackPageView } from './utils/analytics';
import './App.css';
import { UserAuthProvider } from './context/UserAuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import InstitutionDetail from './pages/InstitutionDetail';
import Suggest from './pages/Suggest';
import Login from './pages/Login';
import Register from './pages/Register';
import NewsPage from './pages/NewsPage';
import SearchPage from './pages/SearchPage';
import Favorites from './pages/Favorites';
import { PasswordResetRequest, PasswordResetConfirm } from './pages/PasswordReset';

// Component to track route changes
function RouteTracker() {
    const location = useLocation();
    
    useEffect(() => {
        trackPageView(location.pathname, document.title);
    }, [location]);
    
    return null;
}

function App() {
    return (
        <UserAuthProvider>
            <ToastProvider>
                <Router>
                    <RouteTracker />
                    <div className="app">
                        <Header />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/institution/:id" element={<InstitutionDetail />} />
                            <Route path="/news" element={<NewsPage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/suggest" element={<Suggest />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/reset-password" element={<PasswordResetRequest />} />
                            <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirm />} />
                        </Routes>
                    </div>
                </Router>
            </ToastProvider>
        </UserAuthProvider>
    );
}

function AboutPage() {
    return (
        <div className="about-page">
            <div className="about-container">
                <h1>🇱🇷 About Connect Liberia</h1>
                <p>Connect Liberia is a platform designed to make information about institutions, organizations, and services across Liberia easily accessible to everyone.</p>
                <h2>🎯 Our Mission</h2>
                <p>To bridge the information gap by providing a centralized, user-friendly directory of institutions in Liberia.</p>
                <h2>🌍 What We Offer</h2>
                <ul>
                    <li>🏛️ Comprehensive directory of institutions</li>
                    <li>📍 Location-based search</li>
                    <li>📰 Latest news and updates</li>
                    <li>💡 Community-powered suggestions</li>
                </ul>
                <Link to="/" className="btn-primary">Start Exploring</Link>
            </div>
        </div>
    );
}

export default App;
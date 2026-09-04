import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                'https://connect-lib.onrender.com/api/password-reset/request/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                }
            );
            const data = await response.json();
            setSubmitted(true);
            showToast('✅ Password reset link sent to your email!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showToast('❌ Error sending reset link. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-back">
                        <Link to="/" className="back-home-link">← Back to Home</Link>
                    </div>
                    <h1>📧 Check Your Email</h1>
                    <p>We've sent a password reset link to <strong>{email}</strong></p>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '16px' }}>
                        Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)} 
                        className="btn-primary"
                        style={{ marginTop: '16px' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-back">
                    <Link to="/" className="back-home-link">← Back to Home</Link>
                </div>
                <h1>🔑 Reset Password</h1>
                <p>Enter your email address and we'll send you a link to reset your password.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="auth-switch">
                    Remember your password? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export const PasswordResetConfirm = () => {
    const { uid, token } = useParams();
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            showToast('❌ Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('❌ Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                'https://connect-lib.onrender.com/api/password-reset/confirm/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uid,
                        token,
                        new_password: password,
                    }),
                }
            );
            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                showToast('✅ Password reset successfully! Please login.', 'success');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                showToast(`❌ ${data.error || 'Failed to reset password'}`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('❌ Error resetting password. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h1>✅ Password Reset</h1>
                    <p>Your password has been reset successfully!</p>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
                        Redirecting to login...
                    </p>
                    <Link to="/login" className="btn-primary" style={{ marginTop: '16px' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>🔑 Set New Password</h1>
                <p>Enter your new password below.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoFocus
                        />
                        <small>Must be at least 6 characters</small>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};
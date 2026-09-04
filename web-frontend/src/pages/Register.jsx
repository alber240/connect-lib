import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== password2) {
            setError('Passwords do not match');
            showToast('❌ Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            showToast('❌ Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                'https://connect-lib.onrender.com/api/register/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        password2,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                showToast('✅ Registration successful! Please login.', 'success');
                navigate('/login');
            } else {
                const errorMsg = data.error || data.message || 'Registration failed';
                setError(errorMsg);
                showToast(`❌ ${errorMsg}`, 'error');
            }
        } catch (err) {
            const errorMsg = 'Registration failed. Please try again.';
            setError(errorMsg);
            showToast(`❌ ${errorMsg}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Back to Home Button */}
                <div className="auth-back">
                    <Link to="/" className="back-home-link">← Back to Home</Link>
                </div>
                <h1>📝 Register</h1>
                <p>Create an account to save favorites and submit suggestions</p>

                <form onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            minLength={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email (optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
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
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
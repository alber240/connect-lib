import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCounties, submitSuggestion } from '../services/api';
import './Suggest.css';

const Suggest = () => {
    const [counties, setCounties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        institution_name: '',
        suggestion_type: 'add',
        new_info: '',
        suggester_name: '',
        suggester_phone: '',
        suggester_email: '',
    });

    useEffect(() => {
        loadCounties();
    }, []);

    const loadCounties = async () => {
        try {
            const data = await getCounties();
            setCounties(data);
        } catch (err) {
            console.error('Error loading counties:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await submitSuggestion(formData);
            if (response) {
                setSubmitted(true);
                setFormData({
                    institution_name: '',
                    suggestion_type: 'add',
                    new_info: '',
                    suggester_name: '',
                    suggester_phone: '',
                    suggester_email: '',
                });
            }
        } catch (err) {
            console.error('Error submitting suggestion:', err);
            setError(err.error || 'Failed to submit suggestion. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="suggest-page">
                <div className="suggest-container">
                    <div className="success-message">
                        <h2>✅ Thank You!</h2>
                        <p>Your suggestion has been submitted successfully.</p>
                        <p className="success-subtext">
                            Our team will review it and add the institution if it meets our criteria.
                        </p>
                        <div className="success-actions">
                            <Link to="/" className="btn-primary">Return Home</Link>
                            <button onClick={() => setSubmitted(false)} className="btn-secondary">
                                Submit Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="suggest-page">
            <div className="suggest-container">
                <div className="suggest-header">
                    <h1>💡 Suggest a Place</h1>
                    <p>
                        Know an institution that's not listed? Help us grow our database by suggesting it below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="suggest-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Institution Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="institution_name"
                            value={formData.institution_name}
                            onChange={handleChange}
                            placeholder="e.g., New Hospital Name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Suggestion Type <span className="required">*</span></label>
                        <select
                            name="suggestion_type"
                            value={formData.suggestion_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="add">Add New Institution</option>
                            <option value="update">Update Existing Institution</option>
                            <option value="remove">Remove Institution</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Details / Information <span className="required">*</span></label>
                        <textarea
                            name="new_info"
                            value={formData.new_info}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Provide as much information as possible: address, phone, services, etc."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            name="suggester_name"
                            value={formData.suggester_name}
                            onChange={handleChange}
                            placeholder="Your name (optional)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Your Phone Number</label>
                        <input
                            type="tel"
                            name="suggester_phone"
                            value={formData.suggester_phone}
                            onChange={handleChange}
                            placeholder="+231 555 555 555 (optional)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Your Email</label>
                        <input
                            type="email"
                            name="suggester_email"
                            value={formData.suggester_email}
                            onChange={handleChange}
                            placeholder="you@example.com (optional)"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Suggestion'}
                        </button>
                        <Link to="/" className="btn-secondary">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Suggest;
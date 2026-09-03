import React from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <Link to="/" className="back-home-link">← Back to Home</Link>
          <h1>📧 Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <h3>Email</h3>
                <a href="mailto:support@connectliberia.com">support@connectliberia.com</a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <h3>Phone</h3>
                <a href="tel:+231555555555">+250790362843</a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <h3>Address</h3>
                <p>Monrovia, Liberia</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">💬</span>
              <div>
                <h3>Social Media</h3>
                <div className="social-links">
                  <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                  <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                  <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h3>Send us a message</h3>
            <form>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Your email" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Your message..."></textarea>
              </div>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
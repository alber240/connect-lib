import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    if (!isVisible) return null;

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{icons[type] || 'ℹ️'}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={() => {
                setIsVisible(false);
                if (onClose) setTimeout(onClose, 300);
            }}>×</button>
        </div>
    );
};

export default Toast;
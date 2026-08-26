import React from 'react';
import './VerificationBadge.css';

const VerificationBadge = ({ isVerified, source }) => {
    if (!isVerified && !source) return null;

    return (
        <div className="verification-badge">
            {isVerified && (
                <span className="badge verified">
                    ✅ Verified
                </span>
            )}
            {source && (
                <span className="badge source">
                    📎 Source: {source}
                </span>
            )}
        </div>
    );
};

export default VerificationBadge;
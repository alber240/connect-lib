import React from 'react';
import './Skeleton.css';

export const SkeletonCard = ({ count = 4 }) => {
    return (
        <div className="skeleton-grid">
            {Array(count).fill(0).map((_, i) => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-body">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SkeletonDetail = () => {
    return (
        <div className="skeleton-detail">
            <div className="skeleton-cover"></div>
            <div className="skeleton-content">
                <div className="skeleton-title large"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text half"></div>
            </div>
        </div>
    );
};

export const SkeletonList = ({ count = 5 }) => {
    return (
        <div className="skeleton-list">
            {Array(count).fill(0).map((_, i) => (
                <div key={i} className="skeleton-list-item">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-list-body">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text short"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonCard;
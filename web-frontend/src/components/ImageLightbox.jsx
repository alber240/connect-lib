import React, { useState, useEffect, useCallback } from 'react';
import './ImageLightbox.css';

const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const nextImage = useCallback(() => {
        if (!isTransitioning && images.length > 1) {
            setIsTransitioning(true);
            setCurrentIndex((prev) => (prev + 1) % images.length);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    }, [images.length, isTransitioning]);

    const prevImage = useCallback(() => {
        if (!isTransitioning && images.length > 1) {
            setIsTransitioning(true);
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    }, [images.length, isTransitioning]);

    // Use useCallback for onClose to avoid dependency issues
    const handleClose = useCallback(() => {
        if (onClose) onClose();
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (onClose) onClose();
            }
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextImage, prevImage]); // Removed onClose from dependencies

    if (!images || images.length === 0) return null;

    return (
        <div className="lightbox-overlay" onClick={handleClose}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <button className="lightbox-close" onClick={handleClose} aria-label="Close">
                    ✕
                </button>

                <div className="lightbox-counter">
                    {currentIndex + 1} / {images.length}
                </div>

                {images.length > 1 && (
                    <>
                        <button className="lightbox-nav prev" onClick={prevImage} aria-label="Previous">
                            ‹
                        </button>
                        <button className="lightbox-nav next" onClick={nextImage} aria-label="Next">
                            ›
                        </button>
                    </>
                )}

                <div className="lightbox-image-container">
                    <img 
                        src={images[currentIndex]} 
                        alt={`Image ${currentIndex + 1}`}
                        className={isTransitioning ? 'transitioning' : ''}
                        loading="lazy"
                    />
                </div>

                {images.length > 1 && (
                    <div className="lightbox-thumbnails">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                <img src={img} alt={`Thumbnail ${index + 1}`} loading="lazy" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageLightbox;
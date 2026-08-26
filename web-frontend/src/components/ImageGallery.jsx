import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';
import './ImageGallery.css';

const ImageGallery = ({ images, title = 'Gallery' }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const openLightbox = (index) => {
        setSelectedIndex(index);
        setLightboxOpen(true);
    };

    // If only one image, display it differently
    if (images.length === 1) {
        return (
            <div className="gallery-single">
                <img 
                    src={images[0]} 
                    alt={title}
                    onClick={() => openLightbox(0)}
                    className="gallery-single-image"
                />
                {lightboxOpen && (
                    <ImageLightbox
                        images={images}
                        initialIndex={0}
                        onClose={() => setLightboxOpen(false)}
                    />
                )}
            </div>
        );
    }

    // Multiple images - grid layout
    const mainImage = images[0];
    const thumbnails = images.slice(1, 5);
    const remainingCount = images.length - 5;

    return (
        <div className="gallery-grid">
            {/* Main Image */}
            <div className="gallery-main" onClick={() => openLightbox(0)}>
                <img src={mainImage} alt={`${title} - Main`} />
                {images.length > 1 && (
                    <div className="gallery-badge">{images.length} photos</div>
                )}
            </div>

            {/* Thumbnails */}
            {thumbnails.length > 0 && (
                <div className="gallery-thumbnails">
                    {thumbnails.map((img, index) => (
                        <div 
                            key={index}
                            className="gallery-thumb"
                            onClick={() => openLightbox(index + 1)}
                        >
                            <img src={img} alt={`${title} - ${index + 2}`} />
                            {index === 3 && remainingCount > 0 && (
                                <div className="gallery-more">
                                    +{remainingCount + 1}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={images}
                    initialIndex={selectedIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
};

export default ImageGallery;
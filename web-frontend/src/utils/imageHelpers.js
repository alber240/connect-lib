// web-frontend/src/utils/imageHelpers.js

const SUPABASE_URL = 'https://pkuzqojtxxkkmfmmapzm.supabase.co';
const STORAGE_BUCKET = 'institutions'; // Your bucket name

export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it's a relative path from Supabase
    if (imagePath.startsWith('/storage/v1/')) {
        return `${SUPABASE_URL}${imagePath}`;
    }
    
    // If it's a path without the bucket
    if (imagePath.startsWith('/')) {
        return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}${imagePath}`;
    }
    
    // Default: full Supabase URL
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imagePath}`;
};

export default getImageUrl;
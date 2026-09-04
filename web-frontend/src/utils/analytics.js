const GA_MEASUREMENT_ID = 'G-QJ31TL72VW';

// Track page views using gtag
export const trackPageView = (path, title) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: path,
            page_title: title || document.title
        });
    }
};

// Track custom events using gtag
export const trackEvent = (category, action, label = null, value = null) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
};

// Track institution views
export const trackInstitutionView = (institutionName, institutionId) => {
    trackEvent('Institution', 'View', `${institutionName} (${institutionId})`);
};

// Track search queries
export const trackSearch = (query, resultsCount) => {
    trackEvent('Search', 'Search Query', query, resultsCount);
};

// Track favorites
export const trackFavorite = (institutionName, action) => {
    trackEvent('Favorite', action, institutionName);
};

// Track ratings
export const trackRating = (institutionName, rating) => {
    trackEvent('Rating', 'Submit', institutionName, rating);
};

// Track suggestions
export const trackSuggestion = (institutionName, suggestionType) => {
    trackEvent('Suggestion', 'Submit', `${suggestionType}: ${institutionName}`);
};

// Track login
export const trackLogin = (username) => {
    trackEvent('Auth', 'Login', username);
};

// Track register
export const trackRegister = (username) => {
    trackEvent('Auth', 'Register', username);
};

// Track logout
export const trackLogout = (username) => {
    trackEvent('Auth', 'Logout', username);
};

export default {
    trackPageView,
    trackEvent,
    trackInstitutionView,
    trackSearch,
    trackFavorite,
    trackRating,
    trackSuggestion,
    trackLogin,
    trackRegister,
    trackLogout
};
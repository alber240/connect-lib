import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-QJ31TL72VW';

// Initialize GA
export const initGA = () => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (path, title) => {
    ReactGA.send({ 
        hitType: "pageview", 
        page: path,
        title: title || document.title
    });
};

// Track custom events
export const trackEvent = (category, action, label = null, value = null) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value
    });
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
    // action should be 'Add' or 'Remove'
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

// Track user actions
export const trackUserAction = (action, label = null) => {
    trackEvent('User', action, label);
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
    initGA,
    trackPageView,
    trackEvent,
    trackInstitutionView,
    trackSearch,
    trackFavorite,
    trackRating,
    trackSuggestion,
    trackUserAction,
    trackLogin,
    trackRegister,
    trackLogout
};
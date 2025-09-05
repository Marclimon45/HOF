// Firebase Configuration
// Xin's Hall of Fame Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyA2uc4XlwTgXh9yvawGv9XWOkLDOc7DrYI",
    authDomain: "xin-s-hall-of-fame.firebaseapp.com",
    projectId: "xin-s-hall-of-fame",
    storageBucket: "xin-s-hall-of-fame.firebasestorage.app",
    messagingSenderId: "692691719687",
    appId: "1:692691719687:web:7bd1656dec1613e2a87ca2",
    measurementId: "G-5Q7JKXX6Q2"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}

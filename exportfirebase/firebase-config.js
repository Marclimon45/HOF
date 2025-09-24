// Firebase Configuration
// Xin's Hall of Fame Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyA2uc4XlwTgXh9yvawGv9XWOkLDOc7DrYI",
    authDomain: "xin-s-hall-of-fame.firebaseapp.com",
    projectId: "xin-s-hall-of-fame",
    storageBucket: "xin-s-hall-of-fame.firebasestorage.app",
    messagingSenderId: "692691719687",
    appId: "1:692691719687:web:6b9f13cf1d3f9328a87ca2",
    measurementId: "G-4F4QM0QENJ"
};

// Site configuration
const siteConfig = {
    site: "csulbcpxlab"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, siteConfig };
} else {
    window.firebaseConfig = firebaseConfig;
    window.siteConfig = siteConfig;
}

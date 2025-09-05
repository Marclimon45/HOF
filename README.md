# HOF - Home of Innovation

A clean, responsive website built with HTML, Tailwind CSS, and Firebase integration.

## Features

- **Responsive Design**: Mobile-first approach with hamburger menu for small screens
- **Firebase Integration**: Authentication and Firestore database support
- **Dynamic Content**: Homepage content changes based on user authentication state and user type
- **Modern UI**: Clean design using Tailwind CSS
- **User Types**: Support for guest, user, admin, and premium user types

## Project Structure

```
HOF/
├── index.html              # Main HTML file
├── firebase-config.js      # Firebase configuration
├── package.json            # Project dependencies and scripts
└── README.md              # This file
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Copy your Firebase configuration
6. Update the `firebaseConfig` object in `index.html` with your actual values:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### 2. Firestore Database Rules

Set up your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Running the Website

#### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

#### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```

#### Option 3: Live Server (VS Code Extension)
Install the "Live Server" extension in VS Code and right-click on `index.html` → "Open with Live Server"

## User Types

The website supports different user types with customized content:

- **Guest**: Default state for non-authenticated users
- **User**: Basic authenticated users
- **Admin**: Platform administrators
- **Premium**: Users with premium subscriptions

## Features Overview

### Navigation
- Responsive navigation bar
- Hamburger menu for mobile devices
- Dynamic authentication buttons

### Hero Section
- Dynamic content based on user state
- Call-to-action buttons that change per user type
- Responsive design

### Site Map
- Grid layout showcasing platform features
- Hover effects and smooth transitions
- Font Awesome icons

### Footer
- Social media links
- Quick navigation
- Support links
- Responsive grid layout

## Customization

### Styling
The website uses Tailwind CSS for styling. You can customize:
- Colors in the `bg-gradient-to-r from-blue-600 to-purple-600` classes
- Spacing and layout using Tailwind utility classes
- Typography with Tailwind text classes

### Content
- Update the hero section content in the `updateHeroContent()` function
- Modify the site map items in the HTML
- Customize footer links and information

### Firebase Integration
- Add more user fields in Firestore
- Implement additional authentication methods
- Add real-time data updates

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use this project as a starting point for your own website.

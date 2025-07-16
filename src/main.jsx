// src/index.js (or index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import './index.css'; // Your global styles
import App from './App';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap your App component */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
// src/components/Header.jsx
import React from 'react';

function Header({ navigateTo, currentUser, onLogout }) {
    return (
        <header>
            <h1>FLAVORFINDER</h1>
            <p>Discover delicious recipes your way!</p>
            <nav id="main-nav">
                <ul>
                    <li><button onClick={() => navigateTo('mode-selection')}>Home</button></li>
                    <li><button onClick={() => navigateTo('preferences-section')}>My Preferences</button></li>
                    <li><button onClick={() => navigateTo('favorites-section')}>Favorites</button></li>
                    <li><button onClick={() => navigateTo('feedback-section')}>Feedback</button></li>
                    <li><button onClick={() => navigateTo('contact-section')}>Contact Us</button></li>
                    {currentUser && ( // Only show if user is logged in
                        <>
                            {/* Logout button */}
                            <li><button onClick={onLogout}>Logout</button></li>
                        </>
                    )}
                    {/* Login/Signup buttons are removed from here as they are now the primary entry point */}
                </ul>
            </nav>
        </header>
    );
}

export default Header;
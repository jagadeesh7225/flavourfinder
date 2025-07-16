// src/components/WelcomePreferencesModal.js
import React, { useState } from 'react';
import MessageArea from './MessageArea';

function WelcomePreferencesModal({ show, onSave, onClose }) {
    const [foodTypes, setFoodTypes] = useState([]);
    const [favoriteDish, setFavoriteDish] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleFoodTypeChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setFoodTypes(prev => [...prev, value]);
        } else {
            setFoodTypes(prev => prev.filter(type => type !== value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!foodTypes.length && !favoriteDish.trim()) {
            setMessage('Please select at least one food type or enter a favorite dish.');
            setMessageType('error');
            return;
        }
        setMessage('');
        setMessageType('');
        onSave({ foodTypes, favoriteDish });
    };

    if (!show) {
        return null;
    }

    return (
        <div id="welcome-preferences-modal" className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Welcome to FlavorFinder!</h2>
                <p>To personalize your experience, tell us a bit about your food preferences:</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select preferred food types:</label>
                        {['Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Ketogenic', 'Paleo'].map(type => (
                            <div key={type}>
                                <input
                                    type="checkbox"
                                    id={`welcome-foodType-${type}`}
                                    value={type}
                                    checked={foodTypes.includes(type)}
                                    onChange={handleFoodTypeChange}
                                />
                                <label htmlFor={`welcome-foodType-${type}`}>{type}</label>
                            </div>
                        ))}
                    </div>

                    <div className="form-group">
                        <label htmlFor="welcome-favorite-dish">Your favorite dish (optional):</label>
                        <input
                            type="text"
                            id="welcome-favorite-dish"
                            placeholder="e.g., Pizza, Tacos"
                            value={favoriteDish}
                            onChange={(e) => setFavoriteDish(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn">Save Preferences & Continue</button>
                    <MessageArea message={message} type={messageType} />
                </form>
            </div>
        </div>
    );
}

export default WelcomePreferencesModal;
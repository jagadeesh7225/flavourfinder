// src/components/Feedback.jsx (Example - modify based on your actual Feedback component)
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseconfig'; // Import your initialized db

function Feedback() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatusMessage({ type: '', text: '' }); // Clear previous messages

        if (!name || !email || !message) {
            setStatusMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        try {
            // Add a new document with a generated ID to the 'feedback' collection
            await addDoc(collection(db, 'feedback'), {
                name: name,
                email: email,
                message: message,
                timestamp: serverTimestamp() // Use serverTimestamp for consistent timestamps
            });
            setStatusMessage({ type: 'success', text: 'Thank you for your feedback! It has been submitted.' });
            // Clear form fields
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error("Error adding document: ", error);
            setStatusMessage({ type: 'error', text: 'There was an issue submitting your feedback. Please try again.' });
        }
    };

    return (
        <section id="feedback-section" className="section active-section">
            <h2>Your Feedback Matters!</h2>
            <p>Help us improve FlavorFinder by sharing your thoughts.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="feedback-name">Your Name</label>
                    <input
                        type="text"
                        id="feedback-name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="feedback-email">Your Email</label>
                    <input
                        type="email"
                        id="feedback-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="feedback-message">Your Feedback</label>
                    <textarea
                        id="feedback-message"
                        placeholder="Tell us what you think..."
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit">Submit Feedback</button>
            </form>
            {statusMessage.text && (
                <div className={`message-${statusMessage.type}`} id="message-area" style={{ display: 'block', marginTop: '20px' }}>
                    {statusMessage.text}
                </div>
            )}
        </section>
    );
}

export default Feedback;
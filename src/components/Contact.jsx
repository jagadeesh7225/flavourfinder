// src/components/Contact.jsx (Example - modify based on your actual Contact component)
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseconfig'; // Import your initialized db

function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatusMessage({ type: '', text: '' }); // Clear previous messages

        if (!name || !email || !subject || !message) {
            setStatusMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        try {
            // Add a new document with a generated ID to the 'contactMessages' collection
            await addDoc(collection(db, 'contactMessages'), { // Using 'contactMessages' as collection name
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: serverTimestamp() // Use serverTimestamp for consistent timestamps
            });
            setStatusMessage({ type: 'success', text: 'Your message has been sent successfully!' });
            // Clear form fields
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error("Error adding document: ", error);
            setStatusMessage({ type: 'error', text: 'There was an issue sending your message. Please try again.' });
        }
    };

    return (
        <section id="contact-section" className="section active-section">
            <h2>Contact Us</h2>
            <p>Have questions, suggestions, or just want to say hello? Reach out to us!</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="contact-name">Your Name</label>
                    <input
                        type="text"
                        id="contact-name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contact-email">Your Email</label>
                    <input
                        type="email"
                        id="contact-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contact-subject">Subject</label>
                    <input
                        type="text"
                        id="contact-subject"
                        placeholder="Subject of your message"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contact-message">Your Message</label>
                    <textarea
                        id="contact-message"
                        placeholder="Type your message here..."
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit">Send Message</button>
            </form>
            {statusMessage.text && (
                <div className={`message-${statusMessage.type}`} id="message-area" style={{ display: 'block', marginTop: '20px' }}>
                    {statusMessage.text}
                </div>
            )}
            <div className="contact-details">
                <h3>Our Details:</h3>
                <p><strong>Email:</strong> jagadeeshbabu659@gmail.com</p>
                <p><strong>Phone:</strong> +91 9087654321</p>
                <p><strong>Address:</strong> 123 Recipe Lane, Culinary City, Foodland</p>
            </div>
        </section>
    );
}

export default Contact;
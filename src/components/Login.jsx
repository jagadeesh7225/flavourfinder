// src/components/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx'; // Ensure .js extension
import './AuthForms.css';

function Signup({ onSwitchForm }) { // Receive onSwitchForm prop
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        setError('');
        setLoading(true);

        try {
            await signup(email, password);
            // On successful signup, AuthContext will update currentUser.
            // App.jsx (the parent) will automatically detect this change and render the main app.
            alert('Account created successfully!');
            // No need to clear fields or navigate here, App.jsx handles the redirect based on auth state
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use. Please use a different email or log in.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. It should be at least 6 characters.');
            } else {
                setError('Failed to create an account: ' + err.message);
            }
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="signup-section" className="auth-section section active-section">
            <h2>Create Your FlavorFinder Account</h2>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="signup-email">Email</label>
                    <input
                        type="email"
                        id="signup-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="signup-password">Password</label>
                    <input
                        type="password"
                        id="signup-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="signup-password-confirm">Confirm Password</label>
                    <input
                        type="password"
                        id="signup-password-confirm"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>Sign Up</button>
            </form>
            <div className="auth-link">
                Already have an account? <button type="button" onClick={onSwitchForm}>Log In</button>
            </div>
        </section>
    );
}

export default Signup;
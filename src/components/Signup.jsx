// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx'; // Ensure .js extension
import './AuthForms.css';

function Login({ onSwitchForm }) { // Receive onSwitchForm prop
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // On successful login, AuthContext will update currentUser.
            // App.jsx (the parent) will automatically detect this change and render the main app.
            alert('Logged in successfully!');
            // No need to clear fields or navigate here, App.jsx handles the redirect based on auth state
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to log in: ' + err.message);
            }
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="login-section" className="auth-section section active-section">
            <h2>Log In to FlavorFinder</h2>
            {error && <div className="auth-message error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>Log In</button>
            </form>
            <div className="auth-link">
                Don't have an account? <button type="button" onClick={onSwitchForm}>Sign Up</button>
            </div>
        </section>
    );
}

export default Login;
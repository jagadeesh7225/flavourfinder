// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseconfig'; // Import your auth instance
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export function useAuth() {
    return useContext(AuthContext);
}

// Auth Provider component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // State to indicate if auth status is still loading

    // Firebase Authentication methods
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    // Effect to listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user); // user will be null if logged out, or a user object if logged in
            setLoading(false); // Auth state has been determined
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    // Value provided by the context
    const value = {
        currentUser,
        signup,
        login,
        logout
    };

    return (
        // Only render children when authentication state has been loaded
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
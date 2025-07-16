import React, { useState, useEffect } from 'react';
import './index.css';

import Header from './components/Header';
import ModeSelection from './components/ModeSelection';
import RecipeSearch from './components/RecipeSearch';
import Preferences from './components/Preferences';
import Favorites from './components/Favorites';
import Feedback from './components/Feedback';
import Contact from './components/Contact';
import RecipeDetailsModal from './components/RecipeDetailsModal';
import SpiceLoader from './components/SpiceLoader';

import Login from './components/Login';
import Signup from './components/Signup';

import { useAuth } from './contexts/AuthContext.jsx';

const SPOONACULAR_API_KEY = '8a8295b5f3ef4ae1bd320653164918e6';

function App() {
    const { currentUser, logout, loading: authLoading } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [activeSection, setActiveSection] = useState('mode-selection');
    const [showRecipeDetailsModal, setShowRecipeDetailsModal] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [userPreferences, setUserPreferences] = useState(() => {
        const saved = localStorage.getItem('flavorFinder_userPreferences');
        return saved ? JSON.parse(saved) : { foodTypes: [], favoriteDish: '' };
    });

    const [favoriteRecipes, setFavoriteRecipes] = useState(() => {
        const saved = localStorage.getItem('flavorFinder_favoriteRecipes');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (authLoading) return;

        if (!currentUser) {
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        const recipeIdParam = params.get('recipe');

        if (recipeIdParam) {
            setSelectedRecipeId(parseInt(recipeIdParam));
            setShowRecipeDetailsModal(true);
            const previousView = history.state?.previousView || 'mode-selection';
            setActiveSection(previousView);
        } else if (viewParam) {
            setActiveSection(viewParam);
        } else {
            setActiveSection('mode-selection');
        }
    }, [authLoading, currentUser]);

    useEffect(() => {
        if (authLoading || !currentUser) return;

        const handlePopstate = (event) => {
            const state = event.state;
            if (state) {
                if (state.view === 'recipe-details') {
                    if (state.recipeId) {
                        setSelectedRecipeId(state.recipeId);
                        setShowRecipeDetailsModal(true);
                        if (state.previousView) {
                            setActiveSection(state.previousView);
                        }
                    } else {
                        setShowRecipeDetailsModal(false);
                        setActiveSection(state.previousView || 'mode-selection');
                    }
                } else {
                    setShowRecipeDetailsModal(false);
                    setActiveSection(state.view);
                }
            } else {
                setActiveSection('mode-selection');
                setShowRecipeDetailsModal(false);
            }
        };

        window.addEventListener('popstate', handlePopstate);
        return () => window.removeEventListener('popstate', handlePopstate);
    }, [authLoading, currentUser, activeSection]);

    useEffect(() => {
        if (showRecipeDetailsModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    }, [showRecipeDetailsModal]);

    const navigateTo = (sectionId, pushState = true) => {
        if (!currentUser) return;
        setActiveSection(sectionId);
        const url = `?view=${sectionId}`;
        if (pushState) {
            window.history.pushState({ view: sectionId }, '', url);
        } else {
            window.history.replaceState({ view: sectionId }, '', url);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenRecipeModal = (recipeId) => {
        if (!currentUser) return;
        setSelectedRecipeId(recipeId);
        setShowRecipeDetailsModal(true);
        const currentSectionId = activeSection;
        window.history.pushState(
            { view: 'recipe-details', recipeId, previousView: currentSectionId },
            '',
            `?recipe=${recipeId}`
        );
    };

    const handleCloseRecipeModal = () => {
        setShowRecipeDetailsModal(false);
        setSelectedRecipeId(null);
        if (window.history.state?.view === 'recipe-details') {
            window.history.back();
        } else {
            navigateTo(activeSection, false);
        }
    };

    const handleSavePreferences = (prefs) => {
        setUserPreferences(prefs);
        localStorage.setItem('flavorFinder_userPreferences', JSON.stringify(prefs));
        alert('Your preferences have been updated!');
    };

    const toggleFavoriteRecipe = (recipeId, title, image) => {
        const existingIndex = favoriteRecipes.findIndex(r => r.id === recipeId);
        let updatedFavorites;
        if (existingIndex > -1) {
            updatedFavorites = favoriteRecipes.filter(r => r.id !== recipeId);
        } else {
            updatedFavorites = [...favoriteRecipes, { id: recipeId, title, image }];
        }
        setFavoriteRecipes(updatedFavorites);
        localStorage.setItem('flavorFinder_favoriteRecipes', JSON.stringify(updatedFavorites));
    };

    const isRecipeFavorite = (recipeId) => {
        return favoriteRecipes.some(r => r.id === recipeId);
    };

    const handleLogout = async () => {
        try {
            await logout();
            alert('Logged out successfully!');
            setActiveSection('mode-selection');
            setIsLoginView(true);
            setUserPreferences({ foodTypes: [], favoriteDish: '' });
            setFavoriteRecipes([]);
            localStorage.removeItem('flavorFinder_userPreferences');
            localStorage.removeItem('flavorFinder_favoriteRecipes');
            window.history.replaceState({}, '', window.location.pathname);
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to log out.');
        }
    };

    const getMainContentClassName = () => {
        switch (activeSection) {
            case 'mode-selection': return 'content-spacing-home';
            case 'preferences-section': return 'content-spacing-preferences';
            case 'feedback-section': return 'content-spacing-feedback';
            case 'contact-section': return 'content-spacing-contact';
            default: return '';
        }
    };

    if (authLoading) {
        return <SpiceLoader show={true} message="Loading user session..." />;
    }

    if (!currentUser) {
        return (
            <main id="auth-container">
                {isLoginView ? (
                    <Login onSwitchForm={() => setIsLoginView(false)} />
                ) : (
                    <Signup onSwitchForm={() => setIsLoginView(true)} />
                )}
            </main>
        );
    }

    return (
        <div className="app-layout">
            <Header
                navigateTo={navigateTo}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <main id="app-container" className={getMainContentClassName()}>
                {activeSection === 'mode-selection' && (
                    <ModeSelection navigateTo={navigateTo} />
                )}
                {activeSection === 'ingredients-search-section' && (
                    <RecipeSearch
                        mode="ingredients"
                        api_key={SPOONACULAR_API_KEY}
                        onRecipeClick={handleOpenRecipeModal}
                        toggleFavorite={toggleFavoriteRecipe}
                        isFavorite={isRecipeFavorite}
                        setIsLoading={setIsLoading}
                    />
                )}
                {activeSection === 'recipe-search-section' && (
                    <RecipeSearch
                        mode="recipe-search"
                        api_key={SPOONACULAR_API_KEY}
                        onRecipeClick={handleOpenRecipeModal}
                        toggleFavorite={toggleFavoriteRecipe}
                        isFavorite={isRecipeFavorite}
                        setIsLoading={setIsLoading}
                    />
                )}
                {activeSection === 'preferences-section' && (
                    <Preferences
                        userPreferences={userPreferences}
                        onSavePreferences={handleSavePreferences}
                        api_key={SPOONACULAR_API_KEY}
                        onRecipeClick={handleOpenRecipeModal}
                        toggleFavorite={toggleFavoriteRecipe}
                        isFavorite={isRecipeFavorite}
                        setIsLoading={setIsLoading}
                    />
                )}
                {activeSection === 'favorites-section' && (
                    <Favorites
                        favoriteRecipes={favoriteRecipes}
                        onRecipeClick={handleOpenRecipeModal}
                        toggleFavorite={toggleFavoriteRecipe}
                        isFavorite={isRecipeFavorite}
                    />
                )}
                {activeSection === 'feedback-section' && <Feedback />}
                {activeSection === 'contact-section' && <Contact />}
            </main>

            <RecipeDetailsModal
                show={showRecipeDetailsModal}
                recipeId={selectedRecipeId}
                onClose={handleCloseRecipeModal}
                api_key={SPOONACULAR_API_KEY}
                setIsLoading={setIsLoading}
            />

            <footer className="footer">
                All rights reserved! FlavorFinder © 2025
            </footer>
        </div>
    );
}

export default App;

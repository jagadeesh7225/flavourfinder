// src/components/Favorites.js
import React, { useEffect } from 'react';
import RecipeCard from './RecipeCard';
import MessageArea from './MessageArea';

function Favorites({ favoriteRecipes, onRecipeClick, toggleFavorite, isFavorite }) {
    useEffect(() => {
        console.log("→ FAVORITES recipes array:", favoriteRecipes);
    }, [favoriteRecipes]);

    return (
        <section id="favorites-section" className="section">
            <h2>Your Favorite Recipes</h2>

            {favoriteRecipes.length === 0 && (
                <MessageArea
                    message="You have no favorite recipes yet. Add some from search results!"
                    type="info"
                />
            )}

            {favoriteRecipes.length > 0 && (
                <div className="recipe-grid">
                    {favoriteRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onRecipeClick={onRecipeClick}
                            toggleFavorite={toggleFavorite}
                            isFavorite={isFavorite}
                            show={true} // If you want the fade-in effect
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default Favorites;

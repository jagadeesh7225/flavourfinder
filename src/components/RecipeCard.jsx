// src/components/RecipeCard.js
import React from 'react';

function RecipeCard({ recipe, onRecipeClick, toggleFavorite, isFavorite, show }) {
    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent modal from opening when star is clicked
        toggleFavorite(recipe.id, recipe.title, recipe.image);
    };

    // Dynamically apply 'fade-in' class based on the 'show' prop
    const cardClassName = `recipe-card ${show ? 'fade-in' : ''}`;

    return (
        <div className={cardClassName}>
            {/* Clickable Image */}
            <img
                src={recipe.image}
                alt={recipe.title}
                onClick={() => onRecipeClick(recipe.id)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x150/EEEEEE/888888?text=No+Image';
                }}
            />
            <div className="recipe-card-content">
                {/* Clickable Title */}
                <h3
                    onClick={() => onRecipeClick(recipe.id)}
                    style={{ cursor: 'pointer' }}
                >
                    {recipe.title}
                </h3>

                {/* Favorite Button */}
                <button
                    className={`favorite-btn ${isFavorite(recipe.id) ? 'active' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite(recipe.id) ? "Remove from favorites" : "Add to favorites"}
                >
                    &#9733;
                </button>
            </div>
        </div>
    );
}

export default RecipeCard;

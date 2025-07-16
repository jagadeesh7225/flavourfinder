// src/components/RecipeDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import SpiceLoader from './SpiceLoader'; // Assuming you have a SpiceLoader component

function RecipeDetailsModal({ show, recipeId, onClose, api_key, setIsLoading }) {
    // THIS IS THE CRUCIAL LOG I NEED TO SEE IN YOUR CONSOLE
    console.log('RecipeDetailsModal rendered. show prop:', show);

    const [recipeDetails, setRecipeDetails] = useState(null);
    const [modalLoading, setModalLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Only fetch if modal is shown and a recipeId is provided
        if (show && recipeId) {
            setModalLoading(true);
            setError(null);
            const fetchRecipeDetails = async () => {
                try {
                    // You might want to use setIsLoading from props as well for global loading
                    setIsLoading(true); // Indicate global loading
                    const response = await fetch(
                        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${api_key}&includeNutrition=false`
                    );
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setRecipeDetails(data);
                } catch (err) {
                    console.error("Error fetching recipe details:", err);
                    setError("Failed to fetch recipe details. Please try again.");
                } finally {
                    setModalLoading(false);
                    setIsLoading(false); // End global loading
                }
            };
            fetchRecipeDetails();
        } else if (!show) {
            // Reset state when modal is closed
            setRecipeDetails(null);
            setError(null);
            setModalLoading(false);
        }
    }, [show, recipeId, api_key, setIsLoading]);

    // This is the primary condition that prevents rendering anything if 'show' is false
    if (!show) {
        return null;
    }

    // Apply 'active' class based on the 'show' prop
    // This allows CSS to control visibility and animations
    return (
        <div className={`modal ${show ? 'active' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}> {/* Prevent clicks inside from closing modal */}
                <span className="close-button" onClick={onClose}>&times;</span>
                {modalLoading ? (
                    <SpiceLoader show={true} message="Loading recipe details..." />
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : recipeDetails ? (
                    <div id="recipe-details-content">
                        <h2>{recipeDetails.title}</h2>
                        {recipeDetails.image && (
                            <img src={recipeDetails.image} alt={recipeDetails.title} />
                        )}
                        <p dangerouslySetInnerHTML={{ __html: recipeDetails.summary }}></p>
                        <h3>Ingredients:</h3>
                        <ul>
                            {recipeDetails.extendedIngredients && recipeDetails.extendedIngredients.map((ingredient, index) => (
                                <li key={index}>{ingredient.original}</li>
                            ))}
                        </ul>
                        <h3>Instructions:</h3>
                        <p dangerouslySetInnerHTML={{ __html: recipeDetails.instructions }}></p>
                        {recipeDetails.sourceUrl && (
                            <a href={recipeDetails.sourceUrl} target="_blank" rel="noopener noreferrer" className="button-link">
                                View Full Recipe
                            </a>
                        )}
                    </div>
                ) : (
                    <p>No recipe details available.</p>
                )}
            </div>
        </div>
    );
}

export default RecipeDetailsModal;
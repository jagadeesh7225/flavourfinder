import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import MessageArea from './MessageArea';
import RecipeDetailsModal from './RecipeDetailsModal';

const cuisineOptions = [
    "African", "Asian", "American", "British", "Cajun", "Caribbean",
    "Chinese", "Eastern European", "European", "French", "German", "Greek",
    "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean",
    "Latin American", "Mediterranean", "Mexican", "Middle Eastern", "Nordic",
    "Southern", "Spanish", "Thai", "Vietnamese", "Vegetarian", "Vegan",
    "Gluten Free", "Dairy Free", "Keto", "Paleo", "Non-Vegetarian"
];

const foodTypesOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten Free",
    "Dairy Free",
    "Ketogenic",
    "Paleo",
    "Non-Vegetarian"
];

function Preferences({
    userPreferences,
    onSavePreferences,
    api_key,
    toggleFavorite,
    isFavorite,
    setIsLoading
}) {
    const [foodTypes, setFoodTypes] = useState(userPreferences.foodTypes || []);
    const [cuisines, setCuisines] = useState(userPreferences.cuisines || []);
    const [favoriteDish, setFavoriteDish] = useState(userPreferences.favoriteDish || '');
    const [recommendedRecipes, setRecommendedRecipes] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    useEffect(() => {
        setFoodTypes(userPreferences.foodTypes || []);
        setCuisines(userPreferences.cuisines || []);
        setFavoriteDish(userPreferences.favoriteDish || '');
    }, [userPreferences]);

    const handleFoodTypeChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setFoodTypes(prev => [...prev, value]);
        } else {
            setFoodTypes(prev => prev.filter(type => type !== value));
        }
    };

    const handleCuisineChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setCuisines(selectedOptions);
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        onSavePreferences({
            foodTypes,
            cuisines,
            favoriteDish
        });
        fetchRecommendations();
    };

    const handleRecipeClick = (recipe) => {
        setSelectedRecipeId(recipe.id);
        setShowModal(true);
    };

    const fetchRecommendations = async () => {
        if (!foodTypes.length && !cuisines.length && !favoriteDish.trim()) {
            setRecommendedRecipes([]);
            setMessage('Please select at least one preference or enter a favorite dish to get recommendations.');
            setMessageType('info');
            return;
        }

        setIsLoading(true);
        setMessage('');
        setMessageType('');
        setRecommendedRecipes([]);

        let query = '';
        if (favoriteDish.trim()) {
            query = favoriteDish.trim();
        } else if (foodTypes.length > 0 || cuisines.length > 0) {
            const combined = [...foodTypes, ...cuisines];
            query = combined.join(',');
        } else {
            setIsLoading(false);
            return;
        }

        const endpoint = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&addRecipeInformation=true&apiKey=${api_key}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                if (response.status === 402) {
                    throw new Error('Spoonacular API quota limit reached or API Key is invalid. Please try again later or check your API key.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched recipes:", data.results);

            if (data.results && data.results.length > 0) {
                setRecommendedRecipes(
                    data.results.map(recipe => ({
                        id: recipe.id,
                        title: recipe.title,
                        image: recipe.image
                    }))
                );
                setMessage(`Here are some recommendations based on your preferences!`);
                setMessageType('success');
            } else {
                setMessage('No specific recommendations found for your current preferences. Try adjusting them!');
                setMessageType('info');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setMessage(`Error fetching recommendations: ${error.message}.`);
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="preferences-section" className="section">
            {/* Heading updated with a class */}
            <h2 className="preferences-title">What flavors excite you?</h2>
            <form id="preferences-form" onSubmit={handleSaveClick}>
                <div className="form-group">
                    <label className="preferences-label">Select preferred food types:</label>
                    <div className="checkbox-group">
                        {foodTypesOptions.map(type => (
                            <div className="checkbox-item" key={type}>
                                <input
                                    type="checkbox"
                                    id={`foodType-${type}`}
                                    value={type}
                                    checked={foodTypes.includes(type)}
                                    onChange={handleFoodTypeChange}
                                />
                                <label htmlFor={`foodType-${type}`}>{type}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="food-types" className="preferences-label">
                        What types of cuisine do you enjoy?
                    </label>
                    <select
                        id="food-types"
                        multiple
                        value={cuisines}
                        onChange={handleCuisineChange}
                        size={8}
                    >
                        {cuisineOptions.map(cuisine => (
                            <option key={cuisine} value={cuisine}>
                                {cuisine}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="favorite-dish" className="preferences-label">
                        Your favorite dish (e.g., chicken, paneer):
                    </label>
                    <input
                        type="text"
                        id="favorite-dish"
                        placeholder="e.g., Spaghetti Carbonara"
                        value={favoriteDish}
                        onChange={(e) => setFavoriteDish(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn">
                    Save Preferences & Get Recommendations
                </button>
            </form>

            <MessageArea message={message} type={messageType} />

            {recommendedRecipes.length > 0 && (
                <div id="recipe-grid" className="recipe-grid">
                    {recommendedRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onRecipeClick={() => handleRecipeClick(recipe)}
                            toggleFavorite={toggleFavorite}
                            isFavorite={isFavorite}
                            show={true}
                        />
                    ))}
                </div>
            )}

            <RecipeDetailsModal
                show={showModal}
                recipeId={selectedRecipeId}
                onClose={() => setShowModal(false)}
                api_key={api_key}
                setIsLoading={setIsLoading}
            />
        </section>
    );
}

export default Preferences;

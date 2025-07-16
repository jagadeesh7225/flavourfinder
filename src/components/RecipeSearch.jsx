import React, { useState } from 'react';
import RecipeCard from './RecipeCard';
import MessageArea from './MessageArea';

function RecipeSearch({
    mode,
    api_key,
    onRecipeClick,
    toggleFavorite,
    isFavorite,
    setIsLoading
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showRecipes, setShowRecipes] = useState(false);

    const placeholderText = mode === 'ingredients'
        ? 'e.g., chicken, onion, garlic'
        : 'e.g., Pasta Carbonara, Chicken Curry';

    const sectionTitle = mode === 'ingredients'
        ? 'Find Recipes by Ingredients'
        : 'Search Recipes by Name';

    const searchEndpoint =
        mode === 'ingredients'
            ? `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${searchTerm}&number=10&apiKey=${api_key}`
            : `https://api.spoonacular.com/recipes/complexSearch?query=${searchTerm}&number=10&addRecipeInformation=true&apiKey=${api_key}`;

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setMessage('Please enter ingredients or a recipe name to search.');
            setMessageType('info');
            setRecipes([]);
            setShowRecipes(false);
            return;
        }

        setIsLoading(true);
        setMessage('');
        setMessageType('');
        setRecipes([]);
        setShowRecipes(false);

        try {
            const response = await fetch(searchEndpoint);
            if (!response.ok) {
                if (response.status === 402) {
                    throw new Error(
                        'Spoonacular API quota limit reached or API Key is invalid. Please try again later or check your API key.'
                    );
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let fetchedRecipes = [];

            if (mode === 'ingredients') {
                fetchedRecipes = data.map(recipe => ({
                    id: recipe.id,
                    title: recipe.title,
                    image: recipe.image,
                }));
            } else {
                fetchedRecipes = data.results.map(recipe => ({
                    id: recipe.id,
                    title: recipe.title,
                    image: recipe.image,
                }));
            }

            if (fetchedRecipes.length > 0) {
                setRecipes(fetchedRecipes);
                setMessage(`Found ${fetchedRecipes.length} recipes!`);
                setMessageType('success');
                setShowRecipes(true);
            } else {
                setMessage('No recipes found for your search. Try different terms!');
                setMessageType('info');
                setRecipes([]);
                setShowRecipes(false);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setMessage(`Error searching for recipes: ${error.message}. Please try again.`);
            setMessageType('error');
            setRecipes([]);
            setShowRecipes(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
  <section
    id={`${mode}-section`}
    className={`find-recipes-section ${mode === 'ingredients' ? 'ingredients-mode' : 'name-mode'}`}
  >
    <h2>{sectionTitle}</h2>

    <div className="form-group">
      <label htmlFor={`${mode}-input`}>
        {mode === 'ingredients'
          ? 'Enter ingredients (comma-separated):'
          : 'Enter recipe name:'}
      </label>
      <input
        type="text"
        id={`${mode}-input`}
        placeholder={placeholderText}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
      />
    </div>

    <button className="btn" onClick={handleSearch}>
      Search Recipes
    </button>

    <MessageArea message={message} type={messageType} />

    {recipes.length > 0 && (
      <div
        className={`recipe-grid ${showRecipes ? 'recipes-visible' : ''}`}
      >
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onRecipeClick={onRecipeClick}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            show={showRecipes}
          />
        ))}
      </div>
    )}
  </section>
);
}

export default RecipeSearch;

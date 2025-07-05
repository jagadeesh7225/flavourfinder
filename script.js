// REMOVED: import { initializeApp } from "firebase/app";
// REMOVED: import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdyfjSa7nOC23fYzAMkc8snqrnhLnDuTI", // Replace with your actual API key from Firebase Project Settings
    authDomain: "flavorfinderfeedback.firebaseapp.com",
    projectId: "flavorfinderfeedback",
    storageBucket: "flavorfinderfeedback.firebasestorage.app",
    messagingSenderId: "1020798096498",
    appId: "1:1020798096498:web:96def282d9607dcf821eeb"
};
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- DOM Elements ---
    const appContainer = document.getElementById('app-container');
    const mainNavButtons = document.querySelectorAll('#main-nav button');
    const modeButtons = document.querySelectorAll('.mode-buttons button'); // Selects buttons within mode-selection

    const ingredientsInput = document.getElementById('ingredients-input');
    const searchIngredientsBtn = document.getElementById('search-ingredients-btn');
    const ingredientsSearchResults = document.getElementById('ingredients-search-results');
    const ingredientsMessageArea = document.getElementById('ingredients-message-area');

    const recipeNameInput = document.getElementById('recipe-name-input');
    const searchRecipeBtn = document.getElementById('search-recipe-btn');
    const recipeSearchResults = document.getElementById('recipe-search-results');
    const recipeMessageArea = document.getElementById('recipe-message-area');

    const preferencesSection = document.getElementById('preferences-section');
    const preferencesForm = document.getElementById('preferences-form');
    const foodTypesSelect = document.getElementById('food-types');
    const favoriteDishInput = document.getElementById('favorite-dish');
    const recommendationsDisplay = document.getElementById('recommendations-display');

    const favoritesSection = document.getElementById('favorites-section');
    const favoriteRecipesDisplay = document.getElementById('favorite-recipes-display');

    const feedbackForm = document.getElementById('feedback-form');
    const feedbackMessageArea = document.getElementById('feedback-message-area');

    const contactForm = document.getElementById('contact-form');
    const contactMessageArea = document.getElementById('contact-message-area'); // Added this line

    // Recipe Details Modal Elements
    const recipeDetailsModal = document.getElementById('recipe-details-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const detailTitle = document.getElementById('detail-title');
    const detailImage = document.getElementById('detail-image');
    const detailIngredients = document.getElementById('detail-ingredients');
    const detailInstructions = document.getElementById('detail-instructions');
    const sourceUrl = document.getElementById('source-url');
    const numPersonsInput = document.getElementById('num-persons');
    const originalServingsInfo = document.getElementById('original-servings-info');

    // Welcome Preferences Modal Elements
    const welcomePreferencesModal = document.getElementById('welcome-preferences-modal');
    const closeWelcomeModalBtn = document.getElementById('close-welcome-modal-btn');
    const welcomePreferencesForm = document.getElementById('welcome-preferences-form');
    const welcomeFoodTypesSelect = document.getElementById('welcome-food-types');
    const welcomeFavoriteDishInput = document.getElementById('welcome-favorite-dish');

    // --- State Variables ---
    let currentServings = 1;
    let originalRecipeServings = 1;
    let originalRecipeIngredients = [];
    let favorites = JSON.parse(localStorage.getItem('flavorFinderFavorites')) || [];
    let userPreferences = JSON.parse(localStorage.getItem('flavorFinderPreferences')) || {};
    let firstVisit = localStorage.getItem('flavorFinderFirstVisit') === null; // Check if it's the first visit

    // --- Helper Functions ---

    /**
     * Shows a specific application section and hides others.
     * @param {string} sectionId The ID of the section to show.
     */
    function showSection(sectionId) {
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active-section');
        });
        document.getElementById(sectionId).classList.add('active-section');

        // Update active class on nav buttons
        mainNavButtons.forEach(button => {
            if (button.dataset.section === sectionId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        clearAllMessages(); // Clear messages when switching sections
    }

    /**
     * Displays a message in a specific message area.
     * @param {HTMLElement} messageArea The DOM element to display the message in.
     * @param {string} message The message text.
     * @param {string} type The type of message ('success', 'error', 'info').
     */
    function showMessage(messageArea, message, type = 'info') {
        messageArea.innerHTML = `<p class="message ${type}">${message}</p>`;
        messageArea.style.display = 'block';
    }

    /**
     * Clears a specific message area.
     * @param {HTMLElement} messageArea The DOM element to clear.
     */
    function clearMessage(messageArea) {
        if (messageArea) { // Check if messageArea exists before trying to clear
            messageArea.innerHTML = '';
            messageArea.style.display = 'none';
        }
    }

    /**
     * Clears all message areas in the application.
     */
    function clearAllMessages() {
        clearMessage(ingredientsMessageArea);
        clearMessage(recipeMessageArea);
        clearMessage(feedbackMessageArea);
        clearMessage(contactMessageArea); // Clear contact form messages too
        // Add any other message areas if they exist
    }


    /**
     * Renders recipe cards in a specified container.
     * @param {Array} recipes An array of recipe objects.
     * @param {HTMLElement} container The DOM element to render recipes into.
     */
    function renderRecipes(recipes, container) {
        container.innerHTML = ''; // Clear previous results
        if (recipes.length === 0) {
            showMessage(container.previousElementSibling, 'No recipes found. Try different ingredients or search terms.', 'info');
            return;
        }
        clearMessage(container.previousElementSibling); // Clear message if recipes are found

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');

            const isFavorite = favorites.some(fav => fav.uri === recipe.uri);
            const favoriteIconClass = isFavorite ? 'fas' : 'far'; // Solid or regular heart

            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.label}">
                <h3>${recipe.label}</h3>
                <p>Cuisine: ${recipe.cuisineType ? recipe.cuisineType.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') : 'N/A'}</p>
                <p>Meal Type: ${recipe.mealType ? recipe.mealType.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') : 'N/A'}</p>
                <div class="card-actions">
                    <button class="view-recipe-btn btn secondary-btn" data-uri="${recipe.uri}">View Recipe</button>
                    <button class="favorite-btn" data-uri="${recipe.uri}">
                        <i class="${favoriteIconClass} fa-heart"></i>
                    </button>
                </div>
            `;
            container.appendChild(recipeCard);
        });

        // Add event listeners to newly created buttons
        container.querySelectorAll('.view-recipe-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeUri = event.target.dataset.uri;
                const selectedRecipe = recipes.find(r => r.uri === recipeUri);
                if (selectedRecipe) {
                    displayRecipeDetails(selectedRecipe);
                }
            });
        });

        container.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeUri = event.target.dataset.uri;
                const recipe = recipes.find(r => r.uri === recipeUri);
                if (recipe) {
                    toggleFavorite(recipe, event.target.querySelector('i'));
                }
            });
        });
    }

    /**
     * Displays detailed information for a single recipe in a modal.
     * @param {object} recipe The recipe object to display.
     */
    function displayRecipeDetails(recipe) {
        detailTitle.textContent = recipe.label;
        detailImage.src = recipe.image;
        detailImage.alt = recipe.label;

        originalRecipeServings = recipe.yield;
        originalRecipeIngredients = recipe.ingredients.map(ing => ({
            text: ing.text,
            quantity: ing.quantity,
            measure: ing.measure,
            food: ing.food
        }));

        numPersonsInput.value = originalRecipeServings; // Default to original servings
        originalServingsInfo.textContent = `(Original: ${originalRecipeServings} servings)`;

        updateIngredientsDisplay(originalRecipeIngredients, originalRecipeServings);

        // Display instructions - Edamam API often provides instructions as part of 'url' or a 'digest'
        // For detailed instructions, it's best to link to the source.
        if (recipe.url) {
            sourceUrl.href = recipe.url;
            sourceUrl.style.display = 'inline-block';
            detailInstructions.innerHTML = `<p>For detailed instructions, please visit the full recipe source:</p>`;
        } else {
            sourceUrl.style.display = 'none';
            detailInstructions.innerHTML = `<p>Detailed instructions not available directly via API. Please refer to the source if available.</p>`;
        }

        recipeDetailsModal.style.display = 'block'; // Show the modal
    }

    /**
     * Updates the displayed ingredients based on the number of servings.
     * @param {Array} ingredients The original ingredients list.
     * @param {number} servings The current number of servings.
     */
    function updateIngredientsDisplay(ingredients, servings) {
        detailIngredients.innerHTML = '';
        const ratio = servings / originalRecipeServings;

        ingredients.forEach(ing => {
            const li = document.createElement('li');
            let quantityText = '';
            if (ing.quantity && !isNaN(ing.quantity) && ing.quantity > 0) {
                const adjustedQuantity = (ing.quantity * ratio);
                // Round to 2 decimal places, or display as whole number if it's integer
                quantityText = adjustedQuantity % 1 === 0 ? adjustedQuantity.toFixed(0) : adjustedQuantity.toFixed(2);
                quantityText += ` ${ing.measure || ''}`;
            }
            li.textContent = `${quantityText} ${ing.food || ing.text}`;
            detailIngredients.appendChild(li);
        });
    }

    /**
     * Toggles a recipe's favorite status and updates local storage and UI.
     * @param {object} recipe The recipe object.
     * @param {HTMLElement} iconElement The Font Awesome icon element.
     */
    function toggleFavorite(recipe, iconElement) {
        const index = favorites.findIndex(fav => fav.uri === recipe.uri);
        if (index > -1) {
            favorites.splice(index, 1); // Remove from favorites
            iconElement.classList.remove('fas');
            iconElement.classList.add('far');
            showMessage(feedbackMessageArea, `"${recipe.label}" removed from favorites.`, 'info');
        } else {
            favorites.push(recipe); // Add to favorites
            iconElement.classList.remove('far');
            iconElement.classList.add('fas');
            showMessage(feedbackMessageArea, `"${recipe.label}" added to favorites!`, 'success');
        }
        localStorage.setItem('flavorFinderFavorites', JSON.stringify(favorites));
        renderFavorites(); // Re-render favorites section if visible
    }

    /**
     * Renders the favorite recipes in the favorites section.
     */
    function renderFavorites() {
        if (favorites.length === 0) {
            favoriteRecipesDisplay.innerHTML = `
                <p class="message info"><i class="fas fa-info-circle"></i> No favorites yet! Click the heart icon on a recipe card to save it.</p>
            `;
        } else {
            favoriteRecipesDisplay.innerHTML = '';
            // Pass a copy of favorites array for rendering, ensuring the heart icon is solid
            renderRecipes(favorites.map(fav => ({ ...fav, isFavorite: true })), favoriteRecipesDisplay);
        }
    }

    /**
     * Fetches recommendations based on user preferences.
     * This is a simplified recommendation logic. For a real app, this would involve
     * more complex algorithms or a backend.
     */
    async function fetchRecommendations() {
        recommendationsDisplay.innerHTML = `<p class="message info">Generating recommendations...</p>`;

        const preferredCuisines = userPreferences.foodTypes && userPreferences.foodTypes.length > 0
            ? userPreferences.foodTypes.join(',')
            : '';
        const favoriteDish = userPreferences.favoriteDish || '';

        let query = preferredCuisines || favoriteDish;

        if (!query) {
            recommendationsDisplay.innerHTML = `<p class="message info">Enter your preferences to get recommendations!</p>`;
            return;
        }

        try {
            // Prioritize searching by favorite dish if available, otherwise by cuisine
            const searchParam = favoriteDish ? `q=${encodeURIComponent(favoriteDish)}` : `cuisineType=${encodeURIComponent(preferredCuisines)}`;
            const response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&${searchParam}&app_id=${API_ID}&app_key=${API_KEY}`);
            const data = await response.json();

            if (data.hits && data.hits.length > 0) {
                const recommendedRecipes = data.hits.map(hit => hit.recipe).slice(0, 8); // Get top 8 recommendations
                renderRecipes(recommendedRecipes, recommendationsDisplay);
                clearMessage(recommendationsDisplay.previousElementSibling); // Clear 'Generating recommendations' message
            } else {
                recommendationsDisplay.innerHTML = `<p class="message info">No recommendations found for your current preferences. Try adjusting them!</p>`;
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            recommendationsDisplay.innerHTML = `<p class="message error">Failed to load recommendations. Please try again later.</p>`;
        }
    }

    // --- Event Listeners ---

    // Navigation buttons
    mainNavButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionId = event.target.dataset.section;
            showSection(sectionId);
            // Specific actions for sections
            if (sectionId === 'favorites-section') {
                renderFavorites();
            } else if (sectionId === 'preferences-section') {
                // Populate preferences form if preferences exist
                if (userPreferences.foodTypes) {
                    Array.from(foodTypesSelect.options).forEach(option => {
                        option.selected = userPreferences.foodTypes.includes(option.value);
                    });
                }
                favoriteDishInput.value = userPreferences.favoriteDish || '';
                fetchRecommendations(); // Fetch recommendations when preferences section is viewed
            }
        });
    });

    // Mode selection buttons (Cook with What I Have, Find a Specific Recipe)
    modeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionId = event.target.dataset.section;
            showSection(sectionId);
        });
    });

    // Ingredients Search
    searchIngredientsBtn.addEventListener('click', async () => {
        const ingredients = ingredientsInput.value.trim();
        if (ingredients) {
            showMessage(ingredientsMessageArea, 'Searching for recipes...', 'info');
            ingredientsSearchResults.innerHTML = ''; // Clear previous results

            try {
                const response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(ingredients)}&app_id=${API_ID}&app_key=${API_KEY}`);
                const data = await response.json();

                if (data.hits && data.hits.length > 0) {
                    renderRecipes(data.hits.map(hit => hit.recipe), ingredientsSearchResults);
                    clearMessage(ingredientsMessageArea);
                } else {
                    showMessage(ingredientsMessageArea, 'No recipes found with these ingredients. Try different ones!', 'info');
                }
            } catch (error) {
                console.error('Error fetching ingredients recipes:', error);
                showMessage(ingredientsMessageArea, 'Failed to fetch recipes. Please try again later.', 'error');
            }
        } else {
            showMessage(ingredientsMessageArea, 'Please enter some ingredients to search!', 'error');
        }
    });

    // Recipe Name Search
    searchRecipeBtn.addEventListener('click', async () => {
        const recipeName = recipeNameInput.value.trim();
        if (recipeName) {
            showMessage(recipeMessageArea, 'Searching for recipes...', 'info');
            recipeSearchResults.innerHTML = ''; // Clear previous results

            try {
                const response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(recipeName)}&app_id=${API_ID}&app_key=${API_KEY}`);
                const data = await response.json();

                if (data.hits && data.hits.length > 0) {
                    renderRecipes(data.hits.map(hit => hit.recipe), recipeSearchResults);
                    clearMessage(recipeMessageArea);
                } else {
                    showMessage(recipeMessageArea, 'No recipes found with that name. Try a different search term!', 'info');
                }
            } catch (error) {
                console.error('Error fetching recipe by name:', error);
                showMessage(recipeMessageArea, 'Failed to fetch recipes. Please try again later.', 'error');
            }
        } else {
            showMessage(recipeMessageArea, 'Please enter a recipe name to search!', 'error');
        }
    });

    // Preferences Form Submission
    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        userPreferences.foodTypes = Array.from(foodTypesSelect.selectedOptions).map(option => option.value);
        userPreferences.favoriteDish = favoriteDishInput.value.trim();
        localStorage.setItem('flavorFinderPreferences', JSON.stringify(userPreferences));
        showMessage(feedbackMessageArea, 'Your preferences have been saved!', 'success');
        fetchRecommendations(); // Refresh recommendations based on new preferences
    });

    // Feedback Form Submission
    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('feedback-name').value.trim();
        const email = document.getElementById('feedback-email').value.trim();
        const message = document.getElementById('feedback-message').value.trim();

        if (message) {
            try {
                await db.collection('feedback').add({
                    name: name || 'Anonymous',
                    email: email || 'N/A',
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                showMessage(feedbackMessageArea, 'Thank you for your feedback! It has been submitted.', 'success');
                feedbackForm.reset();
            } catch (e) {
                console.error("Error adding document: ", e);
                showMessage(feedbackMessageArea, 'Failed to send feedback. Please try again.', 'error');
            }
        } else {
            showMessage(feedbackMessageArea, 'Please enter your feedback message.', 'error');
        }
    });

    // Contact Form Submission
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (name && email && message) {
            try {
                await db.collection('contactMessages').add({
                    name: name,
                    email: email,
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                showMessage(contactMessageArea, 'Your message has been sent successfully! We will get back to you soon.', 'success');
                contactForm.reset();
            } catch (e) {
                console.error("Error sending contact message: ", e);
                showMessage(contactMessageArea, 'Failed to send message. Please try again.', 'error');
            }
        } else {
            showMessage(contactMessageArea, 'Please fill in all required fields to send your message.', 'error');
        }
    });


    // Recipe Details Modal Close Button
    closeModalBtn.addEventListener('click', () => {
        recipeDetailsModal.style.display = 'none';
    });

    // Welcome Preferences Modal Close Button
    closeWelcomeModalBtn.addEventListener('click', () => {
        welcomePreferencesModal.style.display = 'none';
        localStorage.setItem('flavorFinderFirstVisit', 'false'); // Mark as not first visit after closing
    });

    // Welcome Preferences Form Submission
    welcomePreferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        userPreferences.foodTypes = Array.from(welcomeFoodTypesSelect.selectedOptions).map(option => option.value);
        userPreferences.favoriteDish = welcomeFavoriteDishInput.value.trim();
        localStorage.setItem('flavorFinderPreferences', JSON.stringify(userPreferences));
        localStorage.setItem('flavorFinderFirstVisit', 'false'); // Mark as not first visit
        welcomePreferencesModal.style.display = 'none'; // Close modal
        showMessage(feedbackMessageArea, 'Welcome! Your preferences are saved. Start exploring recipes!', 'success');
        // Optionally, redirect to home or recommendations
        showSection('mode-selection');
    });

    // Adjust servings in recipe details modal
    numPersonsInput.addEventListener('input', (event) => {
        const newServings = parseInt(event.target.value);
        if (!isNaN(newServings) && newServings > 0) {
            currentServings = newServings;
            updateIngredientsDisplay(originalRecipeIngredients, currentServings);
        }
    });

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === recipeDetailsModal) {
            recipeDetailsModal.style.display = 'none';
        }
        if (event.target === welcomePreferencesModal) {
            // Only close welcome modal if it's not the very first visit (to ensure user fills it)
            if (!firstVisit) {
                welcomePreferencesModal.style.display = 'none';
            }
        }
    });

    // --- Initial Load Logic ---
    if (firstVisit && Object.keys(userPreferences).length === 0) {
        welcomePreferencesModal.style.display = 'block';
    } else {
        // If not first visit or preferences already exist, hide modal and show home
        welcomePreferencesModal.style.display = 'none';
        showSection('mode-selection'); // Start on the home section
    }

    // Initial render of favorites (if any exist)
    renderFavorites();
});

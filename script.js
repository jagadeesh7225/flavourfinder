// Remove these lines entirely:
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdyfjSa7nOC23fYzAMkc8snqrnhLnDuTI",
    authDomain: "flavorfinderfeedback.firebaseapp.com",
    projectId: "flavorfinderfeedback",
    storageBucket: "flavorfinderfeedback.firebasestorage.app",
    messagingSenderId: "1020798096498",
    appId: "1:1020798096498:web:96def282d9607dcf821eeb"
};

// Initialize Firebase using the global `firebase` object provided by the compat SDKs
const app = firebase.initializeApp(firebaseConfig);
// Get a reference to the Firestore service using the global `firebase` object
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {

    // --- API Key ---
    const API_KEY = '8a8295b5f3ef4ae1bd320653164918e6'; // <--- REMEMBER TO REPLACE WITH YOUR ACTUAL API KEY

    // --- DOM Element References ---
    const appSections = document.querySelectorAll('.app-section');
    const navButtons = document.querySelectorAll('#main-nav button, .mode-buttons button');

    // Modals
    const recipeDetailsModal = document.getElementById('recipe-details-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const welcomePreferencesModal = document.getElementById('welcome-preferences-modal');
    const closeWelcomeModalBtn = document.getElementById('close-welcome-modal-btn');

    // Recipe Details Modal Elements
    const detailTitle = document.getElementById('detail-title');
    const detailImage = document.getElementById('detail-image');
    const numPersonsInput = document.getElementById('num-persons');
    const originalServingsInfo = document.getElementById('original-servings-info');
    const detailIngredientsList = document.getElementById('detail-ingredients');
    const detailInstructions = document.getElementById('detail-instructions');
    const sourceUrlLink = document.getElementById('source-url');

    // Search Sections & Elements
    const modeSelectionSection = document.getElementById('mode-selection');
    const ingredientsSearchSection = document.getElementById('ingredients-search-section');
    const recipeSearchSection = document.getElementById('recipe-search-section');

    const ingredientsInput = document.getElementById('ingredients-input');
    const searchIngredientsBtn = document.getElementById('search-ingredients-btn');
    const ingredientsResults = document.getElementById('ingredients-search-results');
    const ingredientsMessageArea = document.getElementById('ingredients-message-area');

    const recipeNameInput = document.getElementById('recipe-name-input');
    const searchRecipeBtn = document.getElementById('search-recipe-btn');
    const recipeResults = document.getElementById('recipe-search-results');
    const recipeMessageArea = document.getElementById('recipe-message-area');

    // Preferences Section Elements
    const preferencesForm = document.getElementById('preferences-form');
    const foodTypesSelect = document.getElementById('food-types');
    const favoriteDishInput = document.getElementById('favorite-dish');
    // Removed direct reference to favoriteRecipesDisplay as it's now in favorites-section
    const recommendationsDisplay = document.getElementById('recommendations-display');

    // Welcome Preferences Form Elements
    const welcomePreferencesForm = document.getElementById('welcome-preferences-form');
    const welcomeFoodTypesSelect = document.getElementById('welcome-food-types');
    const welcomeFavoriteDishInput = document.getElementById('welcome-favorite-dish');

    // Feedback Section
    const feedbackForm = document.getElementById('feedback-form');
    // You might also want a message area for feedback form
    const feedbackMessageArea = document.getElementById('feedback-message-area'); // Added: Assuming you will add this to your HTML


    // --- Global Variables for Recipe Details and Scaling ---
    let currentRecipeDetails = null;
    let originalRecipeServings = 1;

    // --- Local Storage Keys ---
    const HAS_VISITED_KEY = 'flavorFinder_hasVisited';
    const USER_PREFERENCES_KEY = 'flavorFinder_userPreferences';
    const FAVORITE_RECIPES_KEY = 'flavorFinder_favoriteRecipes';

    // --- Section Management ---
    /**
     * Shows a specific section and hides all others.
     * Updates the browser history state.
     * @param {string} sectionId - The ID of the section to show.
     * @param {boolean} pushState - True to push a new state, false to replace current state.
     */
    function showSection(sectionId, pushState = true) {
        appSections.forEach(section => {
            section.classList.remove('active-section');
        });

        // Hide specific search-related elements if not on a search section
        if (sectionId !== 'ingredients-search-section' && sectionId !== 'recipe-search-section') {
            ingredientsResults.innerHTML = ''; // Clear results
            ingredientsInput.value = ''; // Clear input
            clearMessage(ingredientsMessageArea); // Clear messages

            recipeResults.innerHTML = ''; // Clear results
            recipeNameInput.value = ''; // Clear input
            clearMessage(recipeMessageArea); // Clear messages
        }

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active-section');

            // Explicitly hide mode-selection if navigating to a search section
            if (sectionId === 'ingredients-search-section' || sectionId === 'recipe-search-section') {
                modeSelectionSection.classList.remove('active-section');
            } else if (sectionId === 'mode-selection') {
                // Ensure mode-selection is visible when home is clicked
                modeSelectionSection.classList.add('active-section');
            }

            // Re-render content specific to sections when they are shown
            if (sectionId === 'preferences-section') {
                displayUserPreferences();
                displayRecommendedRecipes();
            } else if (sectionId === 'favorites-section') { // Load favorites when this section is active
                displayFavoriteRecipes();
            }

            // Update browser history
            const url = `?view=${sectionId}`;
            if (pushState) {
                history.pushState({ view: sectionId }, '', url);
            } else {
                history.replaceState({ view: sectionId }, '', url);
            }
        }
    }

    // --- Event Listeners for Navigation ---
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionId = event.target.dataset.section;
            if (sectionId) {
                clearAllMessages();
                showSection(sectionId, true);
            }
        });
    });

    // --- Common Modal Logic ---
    closeModalBtn.addEventListener('click', () => {
        recipeDetailsModal.classList.remove('active');
        if (history.state && history.state.view === 'recipe-details') {
            history.back();
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === recipeDetailsModal) {
            recipeDetailsModal.classList.remove('active');
            if (history.state && history.state.view === 'recipe-details') {
                history.back();
            }
        }
    });

    numPersonsInput.addEventListener('input', () => {
        const newServings = parseInt(numPersonsInput.value);
        if (!isNaN(newServings) && newServings >= 1) {
            displayIngredientsForServings(newServings);
        } else if (numPersonsInput.value === '') {
            displayIngredientsForServings(originalRecipeServings);
        }
    });

    // Function to open recipe details modal
    async function openRecipeModal(recipeId) {
        const currentSectionId = document.querySelector('.app-section.active-section')?.id || 'mode-selection';
        history.pushState({ view: 'recipe-details', recipeId: recipeId, previousView: currentSectionId }, '', `?recipe=${recipeId}`);
        await fetchRecipeDetails(recipeId);
    }

    // --- Message Display Functions ---
    function displayMessage(msg, type = 'info', targetArea) {
        targetArea.innerHTML = '';
        let messageHtml = `<div class="message ${type}">`;
        if (type === 'loading') {
            messageHtml += `
                <div class="spice-loader">
                    <div class="spice-particle"></div>
                    <div class="spice-particle"></div>
                    <div class="spice-particle"></div>
                    <div class="spice-particle"></div>
                    <div class="spice-particle"></div>
                </div>
                <span>${msg}</span>`;
        } else {
            messageHtml += `${msg}`;
        }
        messageHtml += `</div>`;
        targetArea.innerHTML = messageHtml;
    }

    function clearMessage(targetArea) {
        targetArea.innerHTML = '';
    }

    function clearAllMessages() {
        clearMessage(ingredientsMessageArea);
        clearMessage(recipeMessageArea);
        clearMessage(feedbackMessageArea); // Added: Clear feedback message area
    }

    // --- Search Logic (Cook with What I Have) ---
    searchIngredientsBtn.addEventListener('click', () => {
        fetchAndDisplayRecipes('ingredients', ingredientsInput.value.trim(), ingredientsResults, ingredientsMessageArea);
    });

    ingredientsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchAndDisplayRecipes('ingredients', ingredientsInput.value.trim(), ingredientsResults, ingredientsMessageArea);
        }
    });

    // --- Search Logic (Find a Specific Recipe) ---
    searchRecipeBtn.addEventListener('click', () => {
        fetchAndDisplayRecipes('recipe-search', recipeNameInput.value.trim(), recipeResults, recipeMessageArea);
    });

    recipeNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchAndDisplayRecipes('recipe-search', recipeNameInput.value.trim(), recipeResults, recipeMessageArea);
        }
    });

    /**
     * Fetches recipes from Spoonacular API and displays them.
     * @param {'ingredients'|'recipe-search'} mode - The search mode.
     * @param {string} query - The search query.
     * @param {HTMLElement} resultsContainer - The DOM element to render recipe cards into.
     * @param {HTMLElement} messageArea - The DOM element to display messages.
     */
    async function fetchAndDisplayRecipes(mode, query, resultsContainer, messageArea) {
        resultsContainer.innerHTML = '';
        clearMessage(messageArea);

        if (!query) {
            displayMessage(`Please enter a ${mode === 'ingredients' ? 'few ingredients (e.g., chicken, rice, soy sauce)' : 'recipe name (e.g., Pizza, Curry, Cake)'} to search.`, 'error', messageArea);
            return;
        }

        displayMessage(`Searching for recipes...`, 'loading', messageArea);

        let url = '';
        if (mode === 'ingredients') {
            url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=15&ranking=1&ignorePantry=true&apiKey=${API_KEY}`;
        } else if (mode === 'recipe-search') {
            url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=15&apiKey=${API_KEY}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorText}`);
            }
            const data = await response.json();

            const results = mode === 'recipe-search' ? data.results : data;

            if (results.length === 0) {
                displayMessage(`No recipes found for "${query}". Try different ${mode === 'ingredients' ? 'ingredients' : 'keywords'}!`, 'no-results', messageArea);
                return;
            }

            clearMessage(messageArea);
            renderRecipeCards(results, resultsContainer.id);

        } catch (error) {
            console.error(`Error fetching recipes by ${mode}:`, error);
            displayMessage(`Failed to fetch recipes. Please check your API key and try again. Error: ${error.message}`, 'error', messageArea);
        }
    }

    // --- Reusable Function: Render Recipe Cards ---
    /**
     * Renders recipe cards into a specified container.
     * @param {Array<Object>} recipes - An array of recipe objects.
     * @param {string} containerId - The ID of the DOM element to render cards into.
     */
    function renderRecipeCards(recipes, containerId) {
        const containerDiv = document.getElementById(containerId);
        if (!containerDiv) {
            console.error(`Container div with ID "${containerId}" not found.`);
            return;
        }
        containerDiv.innerHTML = '';

        if (recipes && recipes.length > 0) {
            recipes.forEach((recipe, index) => {
                const recipeCard = document.createElement('div');
                recipeCard.classList.add('recipe-card');
                recipeCard.innerHTML = `
                    <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${recipe.title}">
                    <h3>${recipe.title}</h3>
                    <button class="favorite-btn" data-recipe-id="${recipe.id}">
                        <i class="far fa-heart"></i>
                    </button>
                `;

                const favoriteBtn = recipeCard.querySelector('.favorite-btn');
                const heartIcon = favoriteBtn.querySelector('i');
                if (isFavorite(recipe.id)) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                }

                recipeCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.favorite-btn')) {
                        openRecipeModal(recipe.id);
                    }
                });

                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // Animate the heart icon
                    heartIcon.classList.remove('heart-pop'); // Remove to allow re-triggering animation
                    void heartIcon.offsetWidth; // Trigger reflow to restart animation
                    heartIcon.classList.add('heart-pop');

                    toggleFavoriteRecipe(recipe.id, recipe.title, recipe.image || 'https://via.placeholder.com/300x200?text=No+Image');

                    // Toggle heart icon class immediately for visual feedback (filled/outlined)
                    if (heartIcon.classList.contains('far')) {
                        heartIcon.classList.remove('far');
                        heartIcon.classList.add('fas');
                    } else {
                        heartIcon.classList.remove('fas');
                        heartIcon.classList.add('far');
                    }

                    // If the Favorites section is currently active, re-render it to reflect changes
                    if (document.getElementById('favorites-section').classList.contains('active-section')) {
                        displayFavoriteRecipes();
                    }
                });

                containerDiv.appendChild(recipeCard);

                setTimeout(() => {
                    recipeCard.classList.add('fade-in');
                }, 100 * index);
            });
        } else {
            if (containerId === 'favorite-recipes-display') {
                containerDiv.innerHTML = '<p class="message info"><i class="fas fa-info-circle"></i> No favorites yet! Click the heart icon on a recipe card to save it.</p>';
            } else {
                containerDiv.innerHTML = '<p class="message info">No recipes to display.</p>';
            }
        }
    }

    // --- Unified Function: Fetch & Display Detailed Recipe Information ---
    async function fetchRecipeDetails(recipeId) {
        detailTitle.textContent = '';
        detailImage.src = '';
        detailImage.alt = '';
        numPersonsInput.value = 1;
        originalServingsInfo.textContent = '';
        detailIngredientsList.innerHTML = '';
        detailInstructions.innerHTML = '';
        sourceUrlLink.href = '#';
        sourceUrlLink.style.display = 'none';

        detailTitle.textContent = 'Loading Recipe...';
        detailImage.alt = 'Loading...';
        detailInstructions.innerHTML = '<div class="message loading"><div class="spice-loader"><div class="spice-particle"></div><div class="spice-particle"></div><div class="spice-particle"></div><div class="spice-particle"></div><div class="spice-particle"></div></div><span>Fetching details...</span></div>';

        recipeDetailsModal.classList.add('active');

        const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorText}`);
            }
            const recipe = await response.json();

            currentRecipeDetails = recipe;
            originalRecipeServings = recipe.servings || 1;

            detailTitle.textContent = recipe.title;
            detailImage.src = recipe.image || 'https://via.placeholder.com/400x250?text=No+Image';
            detailImage.alt = recipe.title;
            detailInstructions.innerHTML = recipe.instructions || '<p>No detailed instructions available for this recipe. Please check the source link.</p>';
            originalServingsInfo.textContent = ` (Original: ${recipe.servings || 'N/A'} servings)`;
            numPersonsInput.value = originalRecipeServings;

            displayIngredientsForServings(originalRecipeServings);

            if (recipe.sourceUrl) {
                sourceUrlLink.href = recipe.sourceUrl;
                sourceUrlLink.style.display = 'inline-block';
            } else {
                sourceUrlLink.style.display = 'none';
            }

        } catch (error) {
            console.error('Error fetching recipe details:', error);
            detailInstructions.innerHTML = `<div class="message error"><i class="fas fa-exclamation-triangle"></i> Failed to load recipe details. Please try again. Error: ${error.message}</div>`;
            detailTitle.textContent = 'Recipe Not Found';
            detailImage.src = 'https://via.placeholder.com/400x250?text=Error';
            detailImage.alt = 'Error loading recipe';
        }
    }

    // --- Core Function: Dynamically Scale and Display Ingredients ---
    function displayIngredientsForServings(targetServings) {
        detailIngredientsList.innerHTML = '';

        if (!currentRecipeDetails || !currentRecipeDetails.extendedIngredients || currentRecipeDetails.extendedIngredients.length === 0) {
            detailIngredientsList.innerHTML = '<li>Ingredients not available for scaling.</li>';
            return;
        }

        const ratio = targetServings / originalRecipeServings;

        currentRecipeDetails.extendedIngredients.forEach(ingredient => {
            const li = document.createElement('li');
            let quantity = ingredient.amount;
            let unit = ingredient.unit || '';
            let originalString = ingredient.original || '';

            if (typeof quantity === 'number' && !isNaN(quantity)) {
                quantity = (quantity * ratio);

                if (quantity === 0) {
                    li.textContent = `0 ${unit} ${ingredient.name}`;
                } else if (quantity < 0.001) {
                    li.textContent = `trace ${unit} ${ingredient.name}`;
                } else if (quantity < 1 && quantity > 0) {
                    li.textContent = `${quantity.toFixed(2).replace(/^0+/, '')} ${unit} ${ingredient.name}`;
                } else if (quantity % 1 === 0) {
                    li.textContent = `${Math.round(quantity)} ${unit} ${ingredient.name}`;
                } else {
                    li.textContent = `${quantity.toFixed(1)} ${unit} ${ingredient.name}`;
                }
            } else {
                li.textContent = originalString;
            }
            detailIngredientsList.appendChild(li);
        });
    }

    // --- Local Storage and Preferences Functions ---
    function getUserPreferences() {
        const preferencesJson = localStorage.getItem(USER_PREFERENCES_KEY);
        return preferencesJson ? JSON.parse(preferencesJson) : {
            foodTypes: [],
            favoriteDish: ''
        };
    }

    function saveUserPreferences(preferences) {
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    }

    function saveWelcomePreferences() {
        const selectedCuisines = Array.from(welcomeFoodTypesSelect.selectedOptions).map(option => option.value);
        const favoriteDish = welcomeFavoriteDishInput.value.trim();

        const preferences = {
            foodTypes: selectedCuisines,
            favoriteDish: favoriteDish
        };
        saveUserPreferences(preferences);
        localStorage.setItem(HAS_VISITED_KEY, 'true');
    }

    function displayUserPreferences() {
        const savedPreferences = getUserPreferences();
        Array.from(foodTypesSelect.options).forEach(option => {
            option.selected = savedPreferences.foodTypes.includes(option.value);
        });
        favoriteDishInput.value = savedPreferences.favoriteDish;
    }

    async function displayRecommendedRecipes() {
        recommendationsDisplay.innerHTML = '<p class="message loading"><div class="spice-loader"><div class="spice-particle"></div><div class="spice-particle"></div><div class="spice-particle"></div><div class="spice-particle"></div><div class="spice-particle"></div></div><span>Loading recommendations...</span></p>';
        const preferences = getUserPreferences();
        let query = preferences.foodTypes.join(', ');
        if (!query && preferences.favoriteDish) {
            query = preferences.favoriteDish;
        }

        if (!query) {
            recommendationsDisplay.innerHTML = '<p>Enter your preferences to get recommendations!</p>';
            return;
        }

        const dietaryRestrictions = preferences.foodTypes.filter(type => ['Vegan', 'Vegetarian', 'Gluten Free', 'Dairy Free'].includes(type));
        const tags = dietaryRestrictions.length > 0 ? `&diet=${dietaryRestrictions.join(',')}` : '';

        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&sort=popularity&minFat=0&minProtein=0&minCarbs=0${tags}&apiKey=${API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                renderRecipeCards(data.results, 'recommendations-display');
            } else {
                recommendationsDisplay.innerHTML = '<p class="message info">No recommendations found based on your preferences. Try broadening them!</p>';
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            recommendationsDisplay.innerHTML = `<p class="message error"><i class="fas fa-exclamation-triangle"></i> Failed to load recommendations. Please try again later. Error: ${error.message}</p>`;
        }
    }

    function getFavoriteRecipes() {
        const favoritesJson = localStorage.getItem(FAVORITE_RECIPES_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    }

    function saveFavoriteRecipes(favorites) {
        localStorage.setItem(FAVORITE_RECIPES_KEY, JSON.stringify(favorites));
    }

    function isFavorite(recipeId) {
        const favorites = getFavoriteRecipes();
        return favorites.some(recipe => recipe.id === recipeId);
    }

    function toggleFavoriteRecipe(id, title, image) {
        let favorites = getFavoriteRecipes();
        const existingIndex = favorites.findIndex(recipe => recipe.id === id);

        if (existingIndex > -1) {
            favorites.splice(existingIndex, 1);
        } else {
            favorites.push({ id, title, image });
        }
        saveFavoriteRecipes(favorites);
    }

    /**
     * Displays the user's favorite recipes in the favorite-recipes-display div.
     */
    function displayFavoriteRecipes() {
        const favorites = getFavoriteRecipes();
        const favoritesDisplay = document.getElementById('favorite-recipes-display');
        favoritesDisplay.innerHTML = '';

        if (favorites.length === 0) {
            favoritesDisplay.innerHTML = '<p class="message info"><i class="fas fa-info-circle"></i> No favorites yet! Click the heart icon on a recipe card to save it.</p>';
            return;
        }

        renderRecipeCards(favorites, 'favorite-recipes-display');
    }

    // --- Feedback Section Logic ---
    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('feedback-name').value;
        const email = document.getElementById('feedback-email').value;
        const message = document.getElementById('feedback-message').value;

        // Basic validation
        if (!message) {
            displayMessage('Please enter your feedback message.', 'error', feedbackMessageArea); // Use displayMessage
            return;
        }

        displayMessage('Sending feedback...', 'loading', feedbackMessageArea); // Display loading message

        try {
            // Add a new document (feedback message) to the "feedback" collection
            // Use db.collection("collectionName").add() for compatibility SDK
            await db.collection("feedback").add({
                name: name,
                email: email,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Feedback submitted successfully.");
            displayMessage('Thank you for your feedback! It has been submitted.', 'success', feedbackMessageArea); // Use displayMessage
            feedbackForm.reset(); // Clear the form

        } catch (error) {
            console.error("Error adding feedback: ", error);
            displayMessage(`There was an error submitting your feedback: ${error.message}`, 'error', feedbackMessageArea); // Use displayMessage
        }
    });

    // --- Initial Page Load Handling ---
    function handleInitialLoad() {
        const hasVisited = localStorage.getItem(HAS_VISITED_KEY);
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        const recipeIdParam = params.get('recipe');

        if (recipeIdParam) {
            openRecipeModal(parseInt(recipeIdParam));
            const previousView = history.state?.previousView || 'mode-selection';
            showSection(previousView, false);
        } else if (viewParam) {
            if (viewParam === 'welcome-modal' && !hasVisited) {
                welcomePreferencesModal.classList.add('active');
                history.replaceState({ view: 'welcome-modal' }, '', `?view=welcome-modal`);
            } else {
                showSection(viewParam, false);
            }
        } else if (!hasVisited) {
            welcomePreferencesModal.classList.add('active');
            localStorage.setItem(HAS_VISITED_KEY, 'true');
            history.replaceState({ view: 'welcome-modal' }, '', `?view=welcome-modal`);
        } else {
            showSection('mode-selection', false);
        }
    }

    // Welcome Preferences Modal Event Listeners
    closeWelcomeModalBtn.addEventListener('click', () => {
        welcomePreferencesModal.classList.remove('active');
        showSection('mode-selection');
    });

    welcomePreferencesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveWelcomePreferences();
        welcomePreferencesModal.classList.remove('active');
        showSection('mode-selection');
        alert('Your preferences have been saved! Enjoy discovering new flavors.');
    });

    // Main Preferences Form Event Listener
    preferencesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedCuisines = Array.from(foodTypesSelect.selectedOptions).map(option => option.value);
        const favoriteDish = favoriteDishInput.value.trim();
        saveUserPreferences({ foodTypes: selectedCuisines, favoriteDish: favoriteDish });
        alert('Your preferences have been updated!');
        displayRecommendedRecipes();
    });

    // --- History API Listener for Back/Forward Buttons ---
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state) {
            if (state.view === 'recipe-details') {
                if (state.recipeId) {
                    fetchRecipeDetails(state.recipeId);
                }
            } else if (state.view === 'welcome-modal') {
                welcomePreferencesModal.classList.add('active');
                recipeDetailsModal.classList.remove('active');
                appSections.forEach(section => section.classList.remove('active-section'));
            } else {
                recipeDetailsModal.classList.remove('active');
                welcomePreferencesModal.classList.remove('active');
                showSection(state.view, false);
            }
        } else {
            showSection('mode-selection', false);
            recipeDetailsModal.classList.remove('active');
            welcomePreferencesModal.classList.remove('active');
        }
    });

    // Call this function when the DOM is fully loaded
    handleInitialLoad();
});

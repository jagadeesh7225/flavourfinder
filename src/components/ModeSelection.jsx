// src/components/ModeSelection.jsx
import React from 'react';

function ModeSelection({ navigateTo }) {
    return (
        <section id="mode-selection" className="section">
            <h2>How would you like to find recipes?</h2>
            {/* CHANGE: className from "button-group" to "mode-buttons" */}
            <div className="mode-buttons">
                {/* CHANGE: Remove 'className="btn"' and 'className="btn btn-secondary"' */}
                <button onClick={() => navigateTo('ingredients-search-section')}>
                    Find by Ingredients
                </button>
                <button onClick={() => navigateTo('recipe-search-section')}>
                    Search by Recipe Name
                </button>
            </div>
        </section>
    );
}

export default ModeSelection;
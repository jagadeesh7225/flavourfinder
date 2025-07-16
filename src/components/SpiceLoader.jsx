// src/components/SpiceLoader.js
import React from 'react';

function SpiceLoader({ show }) {
    if (!show) {
        return null;
    }

    return (
        <div id="loader-overlay" className={`loader-overlay ${show ? 'show' : ''}`}>
            <div className="spice-loader">
                <div className="spice"></div>
                <div className="spice"></div>
                <div className="spice"></div>
                <div className="spice"></div>
                <div className="spice"></div>
            </div>
        </div>
    );
}

export default SpiceLoader;
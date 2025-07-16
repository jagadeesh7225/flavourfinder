import React from 'react';

function MessageArea({ message, type }) {
    if (!message) return null; // Don't render if no message

    const className = `message-${type || 'info'}`; // Default to 'info' type

    return (
        <div id="message-area" className={className} style={{ display: 'block' }}>
            {message}
        </div>
    );
}

export default MessageArea;
import { useState } from 'react';
import './CharacterImage.css';

const API_URL = import.meta.env.VITE_API_URL;

const SIZES = {
    small: 48,
    medium: 96,
    large: 200,
};

function CharacterImage({ imageFileName, characterName, size = 'medium' }) {
    const [hasError, setHasError] = useState(false);

    const pixelSize = SIZES[size] || SIZES.medium;
    const firstLetter = characterName?.charAt(0)?.toUpperCase() || '?';

    const imageUrl = imageFileName
        ? `${API_URL}/assets/characters/${imageFileName}`
        : null;

    const showPlaceholder = !imageUrl || hasError;

    const handleError = () => {
        setHasError(true);
    };

    return (
        <div
            className={`character-image character-image-${size}`}
            style={{ width: pixelSize, height: pixelSize }}
        >
            {showPlaceholder ? (
                <div className="character-image-placeholder">
                    <span className="character-image-letter">{firstLetter}</span>
                </div>
            ) : (
                <img
                    src={imageUrl}
                    alt={characterName || 'Character'}
                    onError={handleError}
                    className="character-image-img"
                />
            )}
        </div>
    );
}

export default CharacterImage;

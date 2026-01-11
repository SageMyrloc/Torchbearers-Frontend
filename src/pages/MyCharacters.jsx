import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterAPI } from '../services/api';
import CharacterImage from '../components/CharacterImage';
import './MyCharacters.css';

const STATUS_CONFIG = {
    PendingApproval: { label: 'Pending Approval', color: 'yellow' },
    Active: { label: 'Active', color: 'green' },
    Retired: { label: 'Retired', color: 'gray' },
    Dead: { label: 'Dead', color: 'red' },
};

function MyCharacters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [slotInfo, setSlotInfo] = useState({ used: 0, max: 3 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await characterAPI.getMyCharacters();
            const data = response.data;

            setCharacters(data.characters || []);
            setSlotInfo({
                used: data.characterCount || 0,
                max: data.maxCharacterSlots || 3,
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    const handleCharacterClick = (id) => {
        navigate(`/characters/${id}`);
    };

    const handleCreateCharacter = () => {
        navigate('/characters/create');
    };

    const isAtSlotLimit = slotInfo.used >= slotInfo.max;

    if (loading) {
        return (
            <div className="my-characters-page">
                <div className="my-characters-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading your characters...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-characters-page">
                <div className="my-characters-container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchCharacters}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-characters-page">
            <div className="my-characters-container">
                <div className="my-characters-header">
                    <div className="header-title">
                        <h1>My Characters</h1>
                        <span className="slot-usage">
                            Characters: {slotInfo.used}/{slotInfo.max}
                        </span>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreateCharacter}
                        disabled={isAtSlotLimit}
                        title={isAtSlotLimit ? 'You have reached your character slot limit' : ''}
                    >
                        Create New Character
                    </button>
                </div>

                {characters.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⚔</div>
                        <h2>No Characters Yet</h2>
                        <p>Begin your adventure by creating your first character.</p>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateCharacter}
                            disabled={isAtSlotLimit}
                        >
                            Create Your First Character
                        </button>
                    </div>
                ) : (
                    <div className="characters-grid">
                        {characters.map((character) => {
                            const statusConfig = STATUS_CONFIG[character.status] || STATUS_CONFIG.Active;
                            return (
                                <div
                                    key={character.id}
                                    className="character-card"
                                    onClick={() => handleCharacterClick(character.id)}
                                >
                                    <div className="character-card-image">
                                        <CharacterImage
                                            imageFileName={character.imageFileName}
                                            characterName={character.name}
                                            size="medium"
                                        />
                                    </div>
                                    <div className="character-info">
                                        <h3 className="character-name">{character.name}</h3>
                                        <span className={`status-badge status-${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyCharacters;

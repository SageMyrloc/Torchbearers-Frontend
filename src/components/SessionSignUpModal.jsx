import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionAPI, characterAPI } from '../services/api';
import CharacterImage from './CharacterImage';
import './SessionSignUpModal.css';

function SessionSignUpModal({ isOpen, onClose, onSuccess, sessionId }) {
    const [characters, setCharacters] = useState([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCharacters();
        }
    }, [isOpen]);

    const fetchCharacters = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await characterAPI.getMyCharacters();
            const activeChars = (response.data.characters || []).filter(
                (c) => c.status === 'Active'
            );
            setCharacters(activeChars);
            setSelectedCharacterId(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCharacterId) return;

        try {
            setSubmitting(true);
            setError('');
            await sessionAPI.signUp(sessionId, selectedCharacterId);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Failed to sign up. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setSelectedCharacterId(null);
            setError('');
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleCharacterSelect = (charId) => {
        if (!submitting) {
            setSelectedCharacterId(charId);
            setError('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content signup-modal">
                <div className="modal-header">
                    <h2>Sign Up for Session</h2>
                    <button
                        className="modal-close"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="server-error">{error}</div>}

                    {loading ? (
                        <div className="modal-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading your characters...</p>
                        </div>
                    ) : characters.length === 0 ? (
                        <div className="no-characters">
                            <p>You have no active characters. Create or get a character approved first.</p>
                            <Link to="/characters" className="btn btn-primary" onClick={handleClose}>
                                Go to My Characters
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p className="modal-subtitle">Select a character to sign up:</p>

                            <div className="character-list">
                                {characters.map((char) => (
                                    <div
                                        key={char.id}
                                        className={`character-option ${selectedCharacterId === char.id ? 'selected' : ''}`}
                                        onClick={() => handleCharacterSelect(char.id)}
                                    >
                                        <input
                                            type="radio"
                                            name="character"
                                            value={char.id}
                                            checked={selectedCharacterId === char.id}
                                            onChange={() => handleCharacterSelect(char.id)}
                                            disabled={submitting}
                                            className="character-radio"
                                        />
                                        <div className="character-thumbnail">
                                            <CharacterImage
                                                imageFileName={char.imageFileName}
                                                characterName={char.name}
                                                size="small"
                                            />
                                        </div>
                                        <span className="character-option-name">{char.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={handleClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !selectedCharacterId}
                                >
                                    {submitting ? 'Signing Up...' : 'Sign Up'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SessionSignUpModal;

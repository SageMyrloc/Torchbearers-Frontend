import { useState } from 'react';
import { characterAPI } from '../services/api';
import './CreateCharacterModal.css';

const NAME_REGEX = /^[\p{L}\s\-']+$/u;
const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

function CreateCharacterModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const validateName = (value) => {
        if (!value.trim()) {
            return 'Character name is required';
        }
        if (value.trim().length < MIN_LENGTH) {
            return `Name must be at least ${MIN_LENGTH} characters`;
        }
        if (value.trim().length > MAX_LENGTH) {
            return `Name must be no more than ${MAX_LENGTH} characters`;
        }
        if (!NAME_REGEX.test(value.trim())) {
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return '';
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        setError(validateName(value));
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateName(name);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSubmitting(true);
            setServerError('');
            await characterAPI.createCharacter({ name: name.trim() });
            setName('');
            setError('');
            onSuccess?.();
            onClose();
        } catch (err) {
            setServerError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Failed to create character. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setName('');
            setError('');
            setServerError('');
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const isValid = name.trim() && !error;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create New Character</h2>
                    <button
                        className="modal-close"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="characterName">Character Name</label>
                        <input
                            type="text"
                            id="characterName"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Enter character name"
                            maxLength={MAX_LENGTH}
                            disabled={submitting}
                            autoFocus
                        />
                        {error && <span className="validation-error">{error}</span>}
                    </div>

                    {serverError && (
                        <div className="server-error">{serverError}</div>
                    )}

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
                            disabled={submitting || !isValid}
                        >
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCharacterModal;

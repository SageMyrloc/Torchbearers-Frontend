import { useState, useEffect } from 'react';
import { dmSessionAPI } from '../services/api';
import './CompleteSessionModal.css';

function CompleteSessionModal({ isOpen, onClose, onSuccess, session }) {
    const [formData, setFormData] = useState({
        goldReward: '',
        experienceReward: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                goldReward: '',
                experienceReward: '',
            });
            setErrors({});
            setServerError('');
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors = {};

        if (formData.goldReward) {
            const gold = parseInt(formData.goldReward, 10);
            if (isNaN(gold) || gold < 0) {
                newErrors.goldReward = 'Must be 0 or greater';
            }
        }

        if (formData.experienceReward) {
            const xp = parseInt(formData.experienceReward, 10);
            if (isNaN(xp) || xp < 0) {
                newErrors.experienceReward = 'Must be 0 or greater';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const rewards = {
            goldReward: formData.goldReward ? parseInt(formData.goldReward, 10) : 0,
            experienceReward: formData.experienceReward ? parseInt(formData.experienceReward, 10) : 0,
        };

        try {
            setSubmitting(true);
            setServerError('');
            await dmSessionAPI.completeSession(session.id, rewards);
            onSuccess?.();
            onClose();
        } catch (err) {
            setServerError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Failed to complete session. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen || !session) return null;

    const attendees = session.signups || [];
    const attendeeCount = attendees.length;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content complete-session-modal">
                <div className="modal-header">
                    <h2>Complete Session</h2>
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
                    <div className="session-info">
                        <h3 className="session-title">{session.title}</h3>
                    </div>

                    <div className="attendees-section">
                        <h4>Attending Characters</h4>
                        {attendeeCount === 0 ? (
                            <p className="no-attendees">No characters signed up for this session.</p>
                        ) : (
                            <ul className="attendees-list">
                                {attendees.map((signup) => (
                                    <li key={signup.characterId} className="attendee-item">
                                        <span className="character-name">{signup.characterName}</span>
                                        <span className="player-name">{signup.playerName}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="rewards-section">
                            <h4>Rewards</h4>
                            {attendeeCount > 0 && (
                                <p className="rewards-info">
                                    These rewards will be given to all {attendeeCount} attending character{attendeeCount !== 1 ? 's' : ''}.
                                </p>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="goldReward">Gold Reward</label>
                                    <input
                                        type="number"
                                        id="goldReward"
                                        name="goldReward"
                                        value={formData.goldReward}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        disabled={submitting}
                                    />
                                    {errors.goldReward && (
                                        <span className="validation-error">{errors.goldReward}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="experienceReward">Experience Reward</label>
                                    <input
                                        type="number"
                                        id="experienceReward"
                                        name="experienceReward"
                                        value={formData.experienceReward}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        disabled={submitting}
                                    />
                                    {errors.experienceReward && (
                                        <span className="validation-error">{errors.experienceReward}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {serverError && <div className="server-error">{serverError}</div>}

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
                                className="btn btn-success"
                                disabled={submitting}
                            >
                                {submitting ? 'Completing...' : 'Complete Session'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CompleteSessionModal;

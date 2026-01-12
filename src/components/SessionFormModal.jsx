import { useState, useEffect } from 'react';
import { dmSessionAPI } from '../services/api';
import './SessionFormModal.css';

function SessionFormModal({ isOpen, onClose, onSuccess, session }) {
    const isEditing = !!session;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledAt: '',
        maxPlayers: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (session) {
                // Pre-populate fields for editing
                const scheduledDate = session.scheduledAt
                    ? new Date(session.scheduledAt).toISOString().slice(0, 16)
                    : '';
                setFormData({
                    title: session.title || '',
                    description: session.description || '',
                    scheduledAt: scheduledDate,
                    maxPlayers: session.maxPlayers?.toString() || '',
                });
            } else {
                // Reset form for creating
                setFormData({
                    title: '',
                    description: '',
                    scheduledAt: '',
                    maxPlayers: '',
                });
            }
            setErrors({});
            setServerError('');
        }
    }, [isOpen, session]);

    const validate = () => {
        const newErrors = {};

        // Title validation: 3-100 characters
        const trimmedTitle = formData.title.trim();
        if (!trimmedTitle) {
            newErrors.title = 'Title is required';
        } else if (trimmedTitle.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (trimmedTitle.length > 100) {
            newErrors.title = 'Title must be no more than 100 characters';
        }

        // Date validation: required, must be in future for new sessions
        if (!formData.scheduledAt) {
            newErrors.scheduledAt = 'Date and time is required';
        } else if (!isEditing) {
            const selectedDate = new Date(formData.scheduledAt);
            if (selectedDate <= new Date()) {
                newErrors.scheduledAt = 'Date must be in the future';
            }
        }

        // Max party size validation: 1-10 if provided
        if (formData.maxPlayers) {
            const max = parseInt(formData.maxPlayers, 10);
            if (isNaN(max) || max < 1) {
                newErrors.maxPlayers = 'Must be at least 1';
            } else if (max > 10) {
                newErrors.maxPlayers = 'Maximum 10 players allowed';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const data = {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            scheduledAt: new Date(formData.scheduledAt).toISOString(),
            maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers, 10) : null,
        };

        try {
            setSubmitting(true);
            setServerError('');

            if (isEditing) {
                await dmSessionAPI.updateSession(session.id, data);
            } else {
                await dmSessionAPI.createSession(data);
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setServerError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                `Failed to ${isEditing ? 'update' : 'create'} session. Please try again.`
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content session-form-modal">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Session' : 'Create New Session'}</h2>
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
                        <label htmlFor="session-title">
                            Title <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="session-title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter session title"
                            maxLength={100}
                            disabled={submitting}
                            autoFocus
                        />
                        {errors.title && <span className="validation-error">{errors.title}</span>}
                        <span className="char-count">{formData.title.length}/100</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="session-description">Description</label>
                        <textarea
                            id="session-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional session description or adventure hook..."
                            rows={4}
                            disabled={submitting}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="session-date">
                                Date & Time <span className="required">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="session-date"
                                name="scheduledAt"
                                value={formData.scheduledAt}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                            {errors.scheduledAt && (
                                <span className="validation-error">{errors.scheduledAt}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="session-max-players">Max Party Size</label>
                            <input
                                type="number"
                                id="session-max-players"
                                name="maxPlayers"
                                value={formData.maxPlayers}
                                onChange={handleChange}
                                placeholder="No limit"
                                min="1"
                                max="10"
                                disabled={submitting}
                            />
                            {errors.maxPlayers && (
                                <span className="validation-error">{errors.maxPlayers}</span>
                            )}
                            <span className="field-hint">1-10 players</span>
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
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting
                                ? (isEditing ? 'Saving...' : 'Creating...')
                                : (isEditing ? 'Save' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SessionFormModal;

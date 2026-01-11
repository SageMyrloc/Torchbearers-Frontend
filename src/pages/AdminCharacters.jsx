import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dmAPI, adminAPI } from '../services/api';
import CharacterImage from '../components/CharacterImage';
import './AdminCharacters.css';

const STATUS_CONFIG = {
    PendingApproval: { label: 'Pending', color: 'yellow' },
    Active: { label: 'Active', color: 'green' },
    Retired: { label: 'Retired', color: 'gray' },
    Dead: { label: 'Dead', color: 'red' },
};

function AdminCharacters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Edit modal state
    const [editModal, setEditModal] = useState({
        isOpen: false,
        characterId: null,
        characterName: '',
        field: null, // 'gold' or 'xp'
        value: '',
    });
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        characterId: null,
        characterName: '',
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dmAPI.getAllCharacters();
            setCharacters(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const openEditModal = (character, field) => {
        setEditModal({
            isOpen: true,
            characterId: character.id,
            characterName: character.name,
            field,
            value: field === 'gold' ? character.gold?.toString() || '0' : character.experience?.toString() || '0',
        });
        setError(null);
    };

    const closeEditModal = () => {
        setEditModal({
            isOpen: false,
            characterId: null,
            characterName: '',
            field: null,
            value: '',
        });
    };

    const handleEditSave = async () => {
        const numValue = parseInt(editModal.value, 10);
        if (isNaN(numValue) || numValue < 0) {
            setError('Please enter a valid non-negative number');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editModal.field === 'gold') {
                await adminAPI.updateCharacterGold(editModal.characterId, numValue);
            } else {
                await adminAPI.updateCharacterExperience(editModal.characterId, numValue);
            }

            // Update local state
            setCharacters((prev) =>
                prev.map((c) =>
                    c.id === editModal.characterId
                        ? { ...c, [editModal.field === 'gold' ? 'gold' : 'experience']: numValue }
                        : c
                )
            );

            showSuccess(`${editModal.field === 'gold' ? 'Gold' : 'Experience'} updated successfully`);
            closeEditModal();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to update ${editModal.field}`);
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (character) => {
        setDeleteModal({
            isOpen: true,
            characterId: character.id,
            characterName: character.name,
        });
        setError(null);
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            characterId: null,
            characterName: '',
        });
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError(null);

            await adminAPI.deleteCharacter(deleteModal.characterId);

            // Remove from local state
            setCharacters((prev) => prev.filter((c) => c.id !== deleteModal.characterId));

            showSuccess('Character deleted successfully');
            closeDeleteModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete character');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-characters-page">
                <div className="admin-characters-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading characters...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-characters-page">
            <div className="admin-characters-container">
                <div className="admin-characters-header">
                    <h1>Admin Panel</h1>
                    <p className="header-subtitle">Manage players and characters</p>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-link">Player Management</Link>
                    <Link to="/admin/characters" className="admin-nav-link active">Character Management</Link>
                </nav>

                {error && <div className="error-banner">{error}</div>}
                {successMessage && <div className="success-banner">{successMessage}</div>}

                {characters.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⚔</div>
                        <h3>No Characters</h3>
                        <p>No characters have been created yet.</p>
                    </div>
                ) : (
                    <div className="characters-table-wrapper">
                        <table className="characters-table">
                            <thead>
                                <tr>
                                    <th className="th-image"></th>
                                    <th>Name</th>
                                    <th>Player</th>
                                    <th>Status</th>
                                    <th>Gold</th>
                                    <th>XP</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {characters.map((character) => {
                                    const statusConfig = STATUS_CONFIG[character.status] || STATUS_CONFIG.Active;
                                    return (
                                        <tr key={character.id}>
                                            <td className="col-image">
                                                <CharacterImage
                                                    imageFileName={character.imageFileName}
                                                    characterName={character.name}
                                                    size="small"
                                                />
                                            </td>
                                            <td className="col-name">{character.name}</td>
                                            <td className="col-player">
                                                {character.playerUsername || character.player?.username || 'Unknown'}
                                            </td>
                                            <td className="col-status">
                                                <span className={`status-badge status-${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="col-gold">
                                                <button
                                                    className="editable-value gold-value"
                                                    onClick={() => openEditModal(character, 'gold')}
                                                    title="Click to edit"
                                                >
                                                    {character.gold ?? 0}
                                                </button>
                                            </td>
                                            <td className="col-xp">
                                                <button
                                                    className="editable-value"
                                                    onClick={() => openEditModal(character, 'xp')}
                                                    title="Click to edit"
                                                >
                                                    {character.experience ?? 0}
                                                </button>
                                            </td>
                                            <td className="col-actions">
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => openDeleteModal(character)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal */}
                {editModal.isOpen && (
                    <div className="modal-overlay" onClick={closeEditModal}>
                        <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>
                                Edit {editModal.field === 'gold' ? 'Gold' : 'Experience'}
                            </h2>
                            <p className="modal-subtitle">
                                Character: <strong>{editModal.characterName}</strong>
                            </p>

                            <div className="form-group">
                                <label htmlFor="editValue">
                                    {editModal.field === 'gold' ? 'Gold Amount' : 'Experience Points'}
                                </label>
                                <input
                                    type="number"
                                    id="editValue"
                                    min="0"
                                    value={editModal.value}
                                    onChange={(e) =>
                                        setEditModal((prev) => ({ ...prev, value: e.target.value }))
                                    }
                                    autoFocus
                                />
                            </div>

                            <div className="modal-buttons">
                                <button
                                    className="btn btn-outline"
                                    onClick={closeEditModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleEditSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.isOpen && (
                    <div className="modal-overlay" onClick={closeDeleteModal}>
                        <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Delete Character?</h2>
                            <p>
                                Are you sure you want to permanently delete{' '}
                                <strong>{deleteModal.characterName}</strong>?
                            </p>
                            <p className="warning-text">This action cannot be undone.</p>

                            <div className="modal-buttons">
                                <button
                                    className="btn btn-outline"
                                    onClick={closeDeleteModal}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCharacters;

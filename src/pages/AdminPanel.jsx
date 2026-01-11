import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
    const [players, setPlayers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Slots edit modal state
    const [slotsModal, setSlotsModal] = useState({
        isOpen: false,
        playerId: null,
        playerName: '',
        value: '',
    });
    const [savingSlots, setSavingSlots] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [playersRes, rolesRes] = await Promise.all([
                adminAPI.getUsers(),
                adminAPI.getRoles()
            ]);
            setPlayers(playersRes.data);
            setRoles(rolesRes.data);
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async (playerId, roleId) => {
        setError('');
        setSuccessMessage('');
        try {
            await adminAPI.assignRole(playerId, roleId);
            setSuccessMessage('Role assigned successfully');
            await loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to assign role. Please try again.');
            console.error('Error assigning role:', err);
        }
    };

    const handleRemoveRole = async (playerId, roleId) => {
        setError('');
        setSuccessMessage('');
        try {
            await adminAPI.removeRole(playerId, roleId);
            setSuccessMessage('Role removed successfully');
            await loadData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to remove role. Please try again.');
            console.error('Error removing role:', err);
        }
    };

    const getRoleById = (roleId) => {
        return roles.find(r => r.id === roleId);
    };

    const playerHasRole = (player, roleName) => {
        return player.roles?.includes(roleName);
    };

    const openSlotsModal = (player) => {
        setSlotsModal({
            isOpen: true,
            playerId: player.id,
            playerName: player.username,
            value: (player.maxCharacterSlots || 3).toString(),
        });
        setError('');
    };

    const closeSlotsModal = () => {
        setSlotsModal({
            isOpen: false,
            playerId: null,
            playerName: '',
            value: '',
        });
    };

    const handleSaveSlots = async () => {
        const numValue = parseInt(slotsModal.value, 10);
        if (isNaN(numValue) || numValue < 1 || numValue > 10) {
            setError('Please enter a number between 1 and 10');
            return;
        }

        try {
            setSavingSlots(true);
            setError('');
            await adminAPI.updatePlayerSlots(slotsModal.playerId, numValue);

            // Update local state
            setPlayers((prev) =>
                prev.map((p) =>
                    p.id === slotsModal.playerId
                        ? { ...p, maxCharacterSlots: numValue }
                        : p
                )
            );

            setSuccessMessage('Character slots updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            closeSlotsModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update character slots');
        } finally {
            setSavingSlots(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-panel">
                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <h1 className="admin-title">Admin Panel</h1>
                <p className="admin-subtitle">Manage players and their roles</p>
            </header>

            <nav className="admin-nav">
                <Link to="/admin" className="admin-nav-link active">Player Management</Link>
                <Link to="/admin/characters" className="admin-nav-link">Character Management</Link>
            </nav>

            {error && (
                <div className="admin-message admin-error">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="admin-message admin-success">
                    {successMessage}
                </div>
            )}

            <section className="admin-section">
                <h2 className="section-title">Players ({players.length})</h2>

                <div className="players-table-container">
                    <table className="players-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Roles</th>
                                <th>Max Slots</th>
                                <th>Characters</th>
                                <th>Role Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id}>
                                    <td className="player-username">{player.username}</td>
                                    <td className="player-roles">
                                        {player.roles && player.roles.length > 0 ? (
                                            <div className="role-tags">
                                                {player.roles.map(role => (
                                                    <span
                                                        key={role}
                                                        className={`role-tag role-${role.toLowerCase()}`}
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="no-roles">No roles</span>
                                        )}
                                    </td>
                                    <td className="player-slots">
                                        <button
                                            className="editable-value"
                                            onClick={() => openSlotsModal(player)}
                                            title="Click to edit"
                                        >
                                            {player.maxCharacterSlots ?? 3}
                                        </button>
                                    </td>
                                    <td className="player-character-count">
                                        {player.characterCount ?? 0}
                                    </td>
                                    <td className="player-actions">
                                        <div className="action-buttons">
                                            {roles.map(role => {
                                                const hasRole = playerHasRole(player, role.name);
                                                return (
                                                    <button
                                                        key={role.id}
                                                        className={`action-btn ${hasRole ? 'btn-remove' : 'btn-add'}`}
                                                        onClick={() => hasRole
                                                            ? handleRemoveRole(player.id, role.id)
                                                            : handleAssignRole(player.id, role.id)
                                                        }
                                                        title={hasRole ? `Remove ${role.name}` : `Add ${role.name}`}
                                                    >
                                                        {hasRole ? '−' : '+'} {role.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {players.length === 0 && (
                    <div className="empty-state">
                        <p>No players found.</p>
                    </div>
                )}
            </section>

            <section className="admin-section">
                <h2 className="section-title">Available Roles</h2>
                <div className="roles-grid">
                    {roles.map(role => (
                        <div key={role.id} className={`role-card role-${role.name.toLowerCase()}`}>
                            <h3 className="role-name">{role.name}</h3>
                            <p className="role-id">ID: {role.id}</p>
                            <p className="role-count">
                                {players.filter(p => playerHasRole(p, role.name)).length} player(s)
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Slots Edit Modal */}
            {slotsModal.isOpen && (
                <div className="modal-overlay" onClick={closeSlotsModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Edit Character Slots</h2>
                        <p className="modal-subtitle">
                            Player: <strong>{slotsModal.playerName}</strong>
                        </p>

                        <div className="form-group">
                            <label htmlFor="maxSlots">Max Character Slots</label>
                            <input
                                type="number"
                                id="maxSlots"
                                min="1"
                                max="10"
                                value={slotsModal.value}
                                onChange={(e) =>
                                    setSlotsModal((prev) => ({ ...prev, value: e.target.value }))
                                }
                                autoFocus
                            />
                            <span className="input-hint">Enter a number between 1 and 10</span>
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="btn btn-outline"
                                onClick={closeSlotsModal}
                                disabled={savingSlots}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveSlots}
                                disabled={savingSlots}
                            >
                                {savingSlots ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
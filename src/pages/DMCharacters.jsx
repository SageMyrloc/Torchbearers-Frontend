import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dmAPI } from '../services/api';
import CharacterImage from '../components/CharacterImage';
import './DMCharacters.css';

const STATUS_CONFIG = {
    PendingApproval: { label: 'Pending', color: 'yellow' },
    Active: { label: 'Active', color: 'green' },
    Retired: { label: 'Retired', color: 'gray' },
    Dead: { label: 'Dead', color: 'red' },
};

function DMCharacters() {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'all' ? 'all' : 'pending';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [pendingCharacters, setPendingCharacters] = useState([]);
    const [allCharacters, setAllCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingCharacters();
        } else {
            fetchAllCharacters();
        }
    }, [activeTab]);

    const fetchPendingCharacters = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dmAPI.getPendingCharacters();
            setPendingCharacters(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load pending characters');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCharacters = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dmAPI.getAllCharacters();
            setAllCharacters(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, e) => {
        e.stopPropagation();
        try {
            setActionLoading(id);
            await dmAPI.approveCharacter(id);
            await fetchPendingCharacters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve character');
        } finally {
            setActionLoading(null);
        }
    };

    const handleKill = async (id, e) => {
        e.stopPropagation();
        try {
            setActionLoading(id);
            await dmAPI.killCharacter(id);
            await fetchAllCharacters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to kill character');
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (id, e) => {
        e.stopPropagation();
        try {
            setActionLoading(id);
            await dmAPI.activateCharacter(id);
            await fetchAllCharacters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to activate character');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRowClick = (id) => {
        navigate(`/characters/${id}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderPendingTab = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading pending characters...</p>
                </div>
            );
        }

        if (pendingCharacters.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">✓</div>
                    <h3>No Pending Characters</h3>
                    <p>All character submissions have been reviewed.</p>
                </div>
            );
        }

        return (
            <div className="characters-table">
                <div className="table-header">
                    <div className="col-image"></div>
                    <div className="col-name">Character Name</div>
                    <div className="col-player">Player</div>
                    <div className="col-date">Created</div>
                    <div className="col-actions">Actions</div>
                </div>
                {pendingCharacters.map((character) => (
                    <div
                        key={character.id}
                        className="table-row"
                        onClick={() => handleRowClick(character.id)}
                    >
                        <div className="col-image">
                            <CharacterImage
                                imageFileName={character.imageFileName}
                                characterName={character.name}
                                size="small"
                            />
                        </div>
                        <div className="col-name">{character.name}</div>
                        <div className="col-player">{character.playerUsername || character.player?.username || 'Unknown'}</div>
                        <div className="col-date">{formatDate(character.createdAt)}</div>
                        <div className="col-actions">
                            <button
                                className="btn btn-sm btn-success"
                                onClick={(e) => handleApprove(character.id, e)}
                                disabled={actionLoading === character.id}
                            >
                                {actionLoading === character.id ? 'Approving...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderAllTab = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading characters...</p>
                </div>
            );
        }

        if (allCharacters.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">⚔</div>
                    <h3>No Characters</h3>
                    <p>No characters have been created yet.</p>
                </div>
            );
        }

        return (
            <div className="characters-table">
                <div className="table-header">
                    <div className="col-image"></div>
                    <div className="col-name">Character Name</div>
                    <div className="col-player">Player</div>
                    <div className="col-status">Status</div>
                    <div className="col-actions">Actions</div>
                </div>
                {allCharacters.map((character) => {
                    const statusConfig = STATUS_CONFIG[character.status] || STATUS_CONFIG.Active;
                    const isActive = character.status === 'Active';
                    const canActivate = character.status === 'Retired' || character.status === 'Dead';

                    return (
                        <div
                            key={character.id}
                            className="table-row"
                            onClick={() => handleRowClick(character.id)}
                        >
                            <div className="col-image">
                                <CharacterImage
                                    imageFileName={character.imageFileName}
                                    characterName={character.name}
                                    size="small"
                                />
                            </div>
                            <div className="col-name">{character.name}</div>
                            <div className="col-player">{character.playerUsername || character.player?.username || 'Unknown'}</div>
                            <div className="col-status">
                                <span className={`status-badge status-${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <div className="col-actions">
                                {isActive && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={(e) => handleKill(character.id, e)}
                                        disabled={actionLoading === character.id}
                                    >
                                        {actionLoading === character.id ? 'Killing...' : 'Kill'}
                                    </button>
                                )}
                                {canActivate && (
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={(e) => handleActivate(character.id, e)}
                                        disabled={actionLoading === character.id}
                                    >
                                        {actionLoading === character.id ? 'Activating...' : 'Activate'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="dm-characters-page">
            <div className="dm-characters-container">
                <div className="dm-characters-header">
                    <h1>DM Panel - Characters</h1>
                </div>

                {error && (
                    <div className="error-banner">{error}</div>
                )}

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Approval
                        {pendingCharacters.length > 0 && activeTab !== 'pending' && (
                            <span className="tab-badge">{pendingCharacters.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Characters
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'pending' ? renderPendingTab() : renderAllTab()}
                </div>
            </div>
        </div>
    );
}

export default DMCharacters;

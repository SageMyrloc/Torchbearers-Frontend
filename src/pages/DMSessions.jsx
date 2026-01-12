import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dmSessionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SessionFormModal from '../components/SessionFormModal';
import CompleteSessionModal from '../components/CompleteSessionModal';
import './DMSessions.css';

const STATUS_CONFIG = {
    Planned: { label: 'Planned', color: 'blue' },
    InProgress: { label: 'In Progress', color: 'yellow' },
    Completed: { label: 'Completed', color: 'green' },
    Cancelled: { label: 'Cancelled', color: 'gray' },
};

function DMSessions() {
    const { hasRole } = useAuth();
    const navigate = useNavigate();
    const isAdmin = hasRole('Admin');

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    // Confirmation states
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dmSessionAPI.getMySessions();
            setSessions(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (session, e) => {
        e.stopPropagation();
        setConfirmAction({ type: 'start', session });
    };

    const handleCancel = async (session, e) => {
        e.stopPropagation();
        setConfirmAction({ type: 'cancel', session });
    };

    const handleComplete = (session, e) => {
        e.stopPropagation();
        setSelectedSession(session);
        setShowCompleteModal(true);
    };

    const confirmStartSession = async () => {
        const session = confirmAction.session;
        try {
            setActionLoading(session.id);
            await dmSessionAPI.startSession(session.id);
            setConfirmAction(null);
            await fetchSessions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start session');
        } finally {
            setActionLoading(null);
        }
    };

    const confirmCancelSession = async () => {
        const session = confirmAction.session;
        try {
            setActionLoading(session.id);
            await dmSessionAPI.cancelSession(session.id);
            setConfirmAction(null);
            await fetchSessions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel session');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRowClick = (id) => {
        navigate(`/sessions/${id}`);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getPartyCount = (session) => {
        const count = session.signedUpCount ?? session.signups?.length ?? 0;
        if (session.maxPlayers) {
            return `${count}/${session.maxPlayers}`;
        }
        return count.toString();
    };

    const renderActions = (session) => {
        const isLoading = actionLoading === session.id;

        switch (session.status) {
            case 'Planned':
                return (
                    <div className="action-buttons">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSession(session);
                                setShowFormModal(true);
                            }}
                            disabled={isLoading}
                        >
                            Edit
                        </button>
                        <button
                            className="btn btn-sm btn-success"
                            onClick={(e) => handleStart(session, e)}
                            disabled={isLoading}
                        >
                            Start
                        </button>
                        <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => handleCancel(session, e)}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                );
            case 'InProgress':
                return (
                    <div className="action-buttons">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={(e) => handleComplete(session, e)}
                            disabled={isLoading}
                        >
                            Complete
                        </button>
                    </div>
                );
            case 'Completed':
            case 'Cancelled':
                return (
                    <div className="action-buttons">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/sessions/${session.id}`);
                            }}
                        >
                            View
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading sessions...</p>
                </div>
            );
        }

        if (sessions.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No Sessions</h3>
                    <p>You haven't created any sessions yet.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowFormModal(true)}
                    >
                        Create Your First Session
                    </button>
                </div>
            );
        }

        return (
            <div className="sessions-table">
                <div className="table-header">
                    <div className="col-title">Title</div>
                    <div className="col-datetime">Date & Time</div>
                    <div className="col-status">Status</div>
                    <div className="col-party">Party</div>
                    <div className="col-actions">Actions</div>
                </div>
                {sessions.map((session) => {
                    const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.Planned;
                    return (
                        <div
                            key={session.id}
                            className="table-row"
                            onClick={() => handleRowClick(session.id)}
                        >
                            <div className="col-title">{session.title}</div>
                            <div className="col-datetime">{formatDateTime(session.scheduledAt)}</div>
                            <div className="col-status">
                                <span className={`status-badge status-${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <div className="col-party">{getPartyCount(session)}</div>
                            <div className="col-actions">{renderActions(session)}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="dm-sessions-page">
            <div className="dm-sessions-container">
                <div className="dm-sessions-header">
                    <h1>DM Panel - Sessions</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedSession(null);
                            setShowFormModal(true);
                        }}
                    >
                        Create New Session
                    </button>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="tab-content">
                    {renderContent()}
                </div>
            </div>

            <SessionFormModal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setSelectedSession(null);
                }}
                onSuccess={fetchSessions}
                session={selectedSession}
            />

            <CompleteSessionModal
                isOpen={showCompleteModal}
                onClose={() => {
                    setShowCompleteModal(false);
                    setSelectedSession(null);
                }}
                onSuccess={fetchSessions}
                session={selectedSession}
            />

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>
                            {confirmAction.type === 'start' ? 'Start Session?' : 'Cancel Session?'}
                        </h2>
                        <p>
                            {confirmAction.type === 'start'
                                ? `Are you sure you want to start "${confirmAction.session.title}"? This will mark the session as in progress.`
                                : `Are you sure you want to cancel "${confirmAction.session.title}"? This action cannot be undone.`}
                        </p>
                        <div className="modal-buttons">
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmAction(null)}
                                disabled={actionLoading}
                            >
                                No, Go Back
                            </button>
                            <button
                                className={`btn ${confirmAction.type === 'start' ? 'btn-success' : 'btn-danger'}`}
                                onClick={confirmAction.type === 'start' ? confirmStartSession : confirmCancelSession}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? (confirmAction.type === 'start' ? 'Starting...' : 'Cancelling...')
                                    : (confirmAction.type === 'start' ? 'Yes, Start' : 'Yes, Cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DMSessions;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SessionSignUpModal from '../components/SessionSignUpModal';
import './SessionDetail.css';

const STATUS_CONFIG = {
    Planned: { label: 'Planned', color: 'blue' },
    InProgress: { label: 'In Progress', color: 'yellow' },
    Completed: { label: 'Completed', color: 'green' },
    Cancelled: { label: 'Cancelled', color: 'gray' },
};

function SessionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sign up modal state
    const [showSignUpModal, setShowSignUpModal] = useState(false);

    // Withdraw state
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        fetchSession();
    }, [id]);

    const fetchSession = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await sessionAPI.getSession(id);
            setSession(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load session');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const mySignup = getMySignup();
        if (!mySignup) return;

        try {
            setWithdrawing(true);
            await sessionAPI.withdraw(id, mySignup.characterId);
            setShowWithdrawConfirm(false);
            await fetchSession();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to withdraw');
            setShowWithdrawConfirm(false);
        } finally {
            setWithdrawing(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatPartySize = () => {
        const signups = session?.signups || [];
        const current = signups.length;
        if (session?.maxPlayers) {
            return `${current}/${session.maxPlayers} players`;
        }
        return `${current} players`;
    };

    const getMySignup = () => {
        if (!user?.playerId || !session?.signups) return null;
        return session.signups.find((s) => s.playerId === user.playerId);
    };

    const handleSignUpSuccess = () => {
        fetchSession();
    };

    if (loading) {
        return (
            <div className="session-detail-page">
                <div className="session-detail-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading session...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !session) {
        return (
            <div className="session-detail-page">
                <div className="session-detail-container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/sessions')}>
                            Back to Sessions
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[session?.status] || STATUS_CONFIG.Planned;
    const mySignup = getMySignup();
    const canSignUp = session?.status === 'Planned' && !mySignup;
    const canWithdraw = session?.status === 'Planned' && mySignup;
    const isCompleted = session?.status === 'Completed';

    return (
        <div className="session-detail-page">
            <div className="session-detail-container">
                <button className="back-button" onClick={() => navigate('/sessions')}>
                    &larr; Back to Sessions
                </button>

                {error && <div className="error-banner">{error}</div>}

                <div className="session-detail-content">
                    <div className="session-header">
                        <h1 className="session-title">{session?.title}</h1>
                        <span className={`status-badge status-${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>

                    {session?.description && (
                        <div className="session-description">
                            <p>{session.description}</p>
                        </div>
                    )}

                    <div className="session-info-grid">
                        <div className="info-item">
                            <span className="info-label">Date & Time</span>
                            <span className="info-value">{formatDateTime(session?.scheduledAt)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Game Master</span>
                            <span className="info-value">
                                {session?.dmName || session?.dm?.username || 'TBD'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Party Size</span>
                            <span className="info-value">{formatPartySize()}</span>
                        </div>
                    </div>

                    {isCompleted && (session?.goldAwarded > 0 || session?.xpAwarded > 0) && (
                        <div className="session-rewards">
                            <h3>Rewards</h3>
                            <div className="rewards-grid">
                                {session.goldAwarded > 0 && (
                                    <div className="reward-item">
                                        <span className="reward-value gold-value">
                                            {session.goldAwarded}
                                        </span>
                                        <span className="reward-label">Gold</span>
                                    </div>
                                )}
                                {session.xpAwarded > 0 && (
                                    <div className="reward-item">
                                        <span className="reward-value">{session.xpAwarded}</span>
                                        <span className="reward-label">XP</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(canSignUp || canWithdraw) && (
                        <div className="session-actions">
                            {canSignUp && (
                                <button className="btn btn-primary" onClick={() => setShowSignUpModal(true)}>
                                    Sign Up
                                </button>
                            )}
                            {canWithdraw && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowWithdrawConfirm(true)}
                                >
                                    Withdraw
                                </button>
                            )}
                        </div>
                    )}

                    <div className="attendees-section">
                        <h2>Adventurers</h2>
                        {(!session?.signups || session.signups.length === 0) ? (
                            <div className="empty-attendees">
                                <p>No adventurers signed up yet</p>
                            </div>
                        ) : (
                            <div className="attendees-list">
                                {session.signups.map((signup) => (
                                    <div key={signup.characterId} className="attendee-item">
                                        <span className="attendee-character">
                                            {signup.characterName}
                                        </span>
                                        <span className="attendee-player">
                                            {signup.playerName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <SessionSignUpModal
                    isOpen={showSignUpModal}
                    onClose={() => setShowSignUpModal(false)}
                    onSuccess={handleSignUpSuccess}
                    sessionId={id}
                />

                {/* Withdraw Confirmation Modal */}
                {showWithdrawConfirm && (
                    <div
                        className="modal-overlay"
                        onClick={() => !withdrawing && setShowWithdrawConfirm(false)}
                    >
                        <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Withdraw from Session?</h2>
                            <p>
                                Are you sure you want to withdraw{' '}
                                <strong>{mySignup?.characterName}</strong> from this session?
                            </p>
                            <div className="modal-buttons">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowWithdrawConfirm(false)}
                                    disabled={withdrawing}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleWithdraw}
                                    disabled={withdrawing}
                                >
                                    {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SessionDetail;

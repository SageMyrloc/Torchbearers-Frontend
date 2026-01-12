import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import './MySessions.css';

const STATUS_CONFIG = {
    Planned: { label: 'Planned', color: 'blue' },
    InProgress: { label: 'In Progress', color: 'yellow' },
    Completed: { label: 'Completed', color: 'green' },
    Cancelled: { label: 'Cancelled', color: 'gray' },
};

function MySessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMySessions();
    }, []);

    const fetchMySessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await sessionAPI.getMySessions();
            setSessions(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load your sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = (id) => {
        navigate(`/sessions/${id}`);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="my-sessions-page">
                <div className="my-sessions-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading your sessions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-sessions-page">
                <div className="my-sessions-container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchMySessions}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-sessions-page">
            <div className="my-sessions-container">
                <div className="my-sessions-header">
                    <h1>My Sessions</h1>
                </div>

                <div className="sessions-tabs">
                    <Link to="/sessions" className="sessions-tab">
                        Upcoming Sessions
                    </Link>
                    <Link to="/sessions/my" className="sessions-tab active">
                        My Sessions
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h2>No Sessions Yet</h2>
                        <p>You haven't signed up for any sessions yet.</p>
                        <Link to="/sessions" className="btn btn-primary">
                            Browse Sessions
                        </Link>
                    </div>
                ) : (
                    <div className="sessions-grid">
                        {sessions.map((session) => {
                            const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.Planned;
                            return (
                                <div
                                    key={session.id}
                                    className="session-card"
                                    onClick={() => handleSessionClick(session.id)}
                                >
                                    <div className="session-card-header">
                                        <h3 className="session-title">{session.title}</h3>
                                        <span className={`status-badge status-${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <div className="session-card-body">
                                        <div className="session-detail">
                                            <span className="detail-label">Date & Time</span>
                                            <span className="detail-value">{formatDateTime(session.scheduledAt)}</span>
                                        </div>
                                        <div className="session-detail">
                                            <span className="detail-label">Game Master</span>
                                            <span className="detail-value">{session.dmName || session.dm?.username || 'TBD'}</span>
                                        </div>
                                        <div className="session-detail attending-detail">
                                            <span className="detail-label">Your Character</span>
                                            <span className="detail-value character-name">
                                                {session.myCharacterName || session.characterName || 'Unknown'}
                                            </span>
                                        </div>
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

export default MySessions;

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import './Sessions.css';

const STATUS_CONFIG = {
    Planned: { label: 'Planned', color: 'blue' },
    InProgress: { label: 'In Progress', color: 'yellow' },
    Completed: { label: 'Completed', color: 'green' },
    Cancelled: { label: 'Cancelled', color: 'gray' },
};

function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await sessionAPI.getUpcomingSessions();
            setSessions(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = (id) => {
        navigate(`/sessions/${id}`);
    };

    const formatDateTime = (dateString) => {
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

    const formatPartySize = (session) => {
        const current = session.currentPartySize || 0;
        if (session.maxPartySize) {
            return `${current}/${session.maxPartySize} players`;
        }
        return `${current} players`;
    };

    if (loading) {
        return (
            <div className="sessions-page">
                <div className="sessions-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading sessions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sessions-page">
                <div className="sessions-container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchSessions}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sessions-page">
            <div className="sessions-container">
                <div className="sessions-header">
                    <h1>Sessions</h1>
                </div>

                <div className="sessions-tabs">
                    <Link to="/sessions" className="sessions-tab active">
                        Upcoming Sessions
                    </Link>
                    <Link to="/sessions/my" className="sessions-tab">
                        My Sessions
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h2>No Upcoming Sessions</h2>
                        <p>No upcoming sessions scheduled</p>
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
                                            <span className="detail-value">{session.gameMasterName || 'TBD'}</span>
                                        </div>
                                        <div className="session-detail">
                                            <span className="detail-label">Party Size</span>
                                            <span className="detail-value">{formatPartySize(session)}</span>
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

export default Sessions;

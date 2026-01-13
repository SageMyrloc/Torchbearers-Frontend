import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        const fetchUpcomingSessions = async () => {
            try {
                const response = await sessionAPI.getUpcomingSessions();
                setUpcomingSessions(response.data.slice(0, 3));
            } catch (err) {
                console.error('Failed to load upcoming sessions:', err);
            } finally {
                setLoadingSessions(false);
            }
        };
        fetchUpcomingSessions();
    }, []);

    const formatSessionDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Torch Bearers</h1>
                    <p className="hero-subtitle">A westmarch style game set in a world of mist and soul lanterns</p>

                    <div className="hero-divider" />

                    <div className="hero-dots">
                        <div className="hero-line" />
                        <div className="hero-dot" />
                        <div className="hero-line" />
                    </div>
                </div>
            </section>

            <section className="sessions-section">
                <h2 className="sessions-title">Upcoming Adventures</h2>
                <p className="sessions-subtitle">Gather your party, light your torches</p>

                {loadingSessions ? (
                    <div className="loading-state">Loading adventures...</div>
                ) : upcomingSessions.length === 0 ? (
                    <div className="empty-state">
                        <p>No upcoming adventures scheduled</p>
                    </div>
                ) : (
                    <div className="sessions-grid">
                        {upcomingSessions.map((session, index) => (
                            <article
                                key={session.id}
                                className={`session-card ${index === 0 ? 'session-next' : ''}`}
                                onClick={() => navigate(`/sessions/${session.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {index === 0 && <div className="small-label">Next Session</div>}
                                <h3 className="session-title">{session.title}</h3>
                                {session.description && (
                                    <p className="session-desc">{session.description}</p>
                                )}

                                <div className="session-divider" />

                                <ul className="session-meta">
                                    <li>
                                        <span className="meta-icon">📅</span>
                                        {formatSessionDate(session.scheduledAt)}
                                    </li>
                                    <li>
                                        <span className="meta-icon">🎭</span>
                                        {session.gameMasterName}
                                    </li>
                                    <li>
                                        <span className="meta-icon">⚔️</span>
                                        {session.currentPartySize}
                                        {session.maxPartySize ? `/${session.maxPartySize}` : ''} adventurers
                                    </li>
                                </ul>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
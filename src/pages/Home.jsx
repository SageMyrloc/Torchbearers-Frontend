import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    return (
        <div className="container">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon" aria-hidden>
                        ??
                    </div>
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

                <div className="sessions-grid">
                    <article className="session-card session-next">
                        <div className="small-label">Next Session</div>
                        <h3 className="session-title">The Mist Walker's Path</h3>
                        <p className="session-desc">
                            The party ventures deeper into the Shrouded Vale, following rumors of an ancient soul lantern that may hold the key to lifting the curse.
                        </p>

                        <div className="session-divider" />

                        <ul className="session-meta">
                            <li><span className="meta-icon">??</span> Saturday, January 11th - 7:00 PM</li>
                            <li><span className="meta-icon">??</span> The Withered Oak Inn</li>
                            <li><span className="meta-icon">??</span> Kira, Thorin, Sera, Malik</li>
                        </ul>
                    </article>

                    <article className="session-card">
                        <h3 className="session-title">Embers of the Fallen</h3>
                        <p className="session-desc">
                            A merchant caravan has gone missing near the old watchtower. Strange lights have been seen dancing in the ruins at night.
                        </p>

                        <div className="session-divider" />

                        <ul className="session-meta">
                            <li><span className="meta-icon">??</span> Saturday, January 25th - 7:00 PM</li>
                            <li><span className="meta-icon">??</span> The Ashen Ruins</li>
                            <li><span className="meta-icon">??</span> Kira, Thorin, Lyra, Bram</li>
                        </ul>
                    </article>

                    <article className="session-card">
                        <h3 className="session-title">Echoes in the Mire</h3>
                        <p className="session-desc">
                            Faint songs lure the unwary into the bog. The party must decide whether to follow the music or hunt for those who vanished.
                        </p>

                        <div className="session-divider" />

                        <ul className="session-meta">
                            <li><span className="meta-icon">??</span> Saturday, February 8th - 7:00 PM</li>
                            <li><span className="meta-icon">??</span> The Blackfen</li>
                            <li><span className="meta-icon">??</span> Sera, Malik, Bram, Lyra</li>
                        </ul>
                    </article>
                </div>
            </section>
        </div>
    );
};

export default Home;
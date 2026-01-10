import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { isAuthenticated, user, login, register, logout } = useAuth();
    const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(loginData);
            // Dropdown closes automatically because isAuthenticated becomes true
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register({ username: registerData.username, password: registerData.password });
            // Dropdown closes automatically because isAuthenticated becomes true
        } catch (err) {
            setError('Registration failed. Username may already exist.');
        }
    };

    const handleCancel = () => {
        setAuthDropdownOpen(false);
        setError('');
        setLoginData({ username: '', password: '' });
        setRegisterData({ username: '', password: '', confirmPassword: '' });
    };

    return (
        <header className="navbar">
            <nav className="navbar-container">
                <Link to="/" className="home-button">
                    <div className="home-icon">TB</div>
                </Link>

                <div className="nav-links">
                    <Link to="/sessions" className="nav-link">Sessions</Link>
                    <Link to="/characters" className="nav-link">Characters</Link>
                    <Link to="/map" className="nav-link">Map</Link>
                    <Link to="/rules" className="nav-link">Rules</Link>
                </div>

                <div className="auth-section">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <span className="welcome-text">Welcome, {user?.username}</span>
                            <button className="btn btn-outline" onClick={logout}>Logout</button>
                        </div>
                    ) : (
                        <div className="auth-dropdown">
                            <button
                                className="btn btn-primary"
                                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                            >
                                Login / Register
                            </button>

                            {authDropdownOpen && (
                                <div className="auth-dropdown-menu">
                                    <div className="auth-tabs">
                                        <button
                                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                                            onClick={() => { setActiveTab('login'); setError(''); }}
                                        >
                                            Login
                                        </button>
                                        <button
                                            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                                            onClick={() => { setActiveTab('register'); setError(''); }}
                                        >
                                            Register
                                        </button>
                                    </div>

                                    {error && <div className="auth-error">{error}</div>}

                                    {activeTab === 'login' ? (
                                        <form className="auth-form" onSubmit={handleLoginSubmit}>
                                            <div className="form-group">
                                                <label>Username</label>
                                                <input
                                                    type="text"
                                                    value={loginData.username}
                                                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <input
                                                    type="password"
                                                    value={loginData.password}
                                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="auth-buttons-row">
                                                <button type="submit" className="btn btn-primary">Login</button>
                                                <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <form className="auth-form" onSubmit={handleRegisterSubmit}>
                                            <div className="form-group">
                                                <label>Username</label>
                                                <input
                                                    type="text"
                                                    value={registerData.username}
                                                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <input
                                                    type="password"
                                                    value={registerData.password}
                                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Confirm Password</label>
                                                <input
                                                    type="password"
                                                    value={registerData.confirmPassword}
                                                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="auth-buttons-row">
                                                <button type="submit" className="btn btn-primary">Register</button>
                                                <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
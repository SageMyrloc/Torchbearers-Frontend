import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { isAuthenticated, user, login, register, logout, hasRole } = useAuth();
    const location = useLocation();
    const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [dmDropdownOpen, setDmDropdownOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

    const dmDropdownRef = useRef(null);
    const adminDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dmDropdownRef.current && !dmDropdownRef.current.contains(event.target)) {
                setDmDropdownOpen(false);
            }
            if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
                setAdminDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const isActive = (path) => {
        if (path === '/sessions') {
            return location.pathname === '/sessions' || location.pathname.startsWith('/sessions/');
        }
        if (path === '/characters') {
            return location.pathname === '/characters' || location.pathname.startsWith('/characters/');
        }
        return location.pathname === path;
    };

    const isDropdownActive = (paths) => {
        return paths.some(path => location.pathname.startsWith(path));
    };

    return (
        <header className="navbar">
            <nav className="navbar-container">
                <Link to="/" className="home-button">
                    <div className="home-icon">TB</div>
                </Link>

                <div className="nav-links">
                    {isAuthenticated && (
                        <>
                            <Link
                                to="/sessions"
                                className={`nav-link ${isActive('/sessions') ? 'active' : ''}`}
                            >
                                Sessions
                            </Link>
                            <Link
                                to="/characters"
                                className={`nav-link ${isActive('/characters') ? 'active' : ''}`}
                            >
                                My Characters
                            </Link>
                        </>
                    )}
                    <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>Map</Link>
                    <Link to="/rules" className={`nav-link ${isActive('/rules') ? 'active' : ''}`}>Rules</Link>

                    {/* DM Panel Dropdown */}
                    {isAuthenticated && (hasRole('DM') || hasRole('Admin')) && (
                        <div className="nav-dropdown" ref={dmDropdownRef}>
                            <button
                                className={`nav-link nav-link-dm nav-dropdown-toggle ${isDropdownActive(['/dm/']) ? 'active' : ''}`}
                                onClick={() => {
                                    setDmDropdownOpen(!dmDropdownOpen);
                                    setAdminDropdownOpen(false);
                                }}
                            >
                                DM Panel
                                <span className="dropdown-arrow">{dmDropdownOpen ? '▴' : '▾'}</span>
                            </button>
                            {dmDropdownOpen && (
                                <div className="nav-dropdown-menu nav-dropdown-dm">
                                    <Link
                                        to="/dm/sessions"
                                        className={`nav-dropdown-item ${location.pathname === '/dm/sessions' ? 'active' : ''}`}
                                        onClick={() => setDmDropdownOpen(false)}
                                    >
                                        Manage Sessions
                                    </Link>
                                    <Link
                                        to="/dm/characters"
                                        className={`nav-dropdown-item ${location.pathname === '/dm/characters' && !location.search.includes('tab=all') ? 'active' : ''}`}
                                        onClick={() => setDmDropdownOpen(false)}
                                    >
                                        Pending Approvals
                                    </Link>
                                    <Link
                                        to="/dm/characters?tab=all"
                                        className={`nav-dropdown-item ${location.pathname === '/dm/characters' && location.search.includes('tab=all') ? 'active' : ''}`}
                                        onClick={() => setDmDropdownOpen(false)}
                                    >
                                        All Characters
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Dropdown */}
                    {isAuthenticated && hasRole('Admin') && (
                        <div className="nav-dropdown" ref={adminDropdownRef}>
                            <button
                                className={`nav-link nav-link-admin nav-dropdown-toggle ${isDropdownActive(['/admin']) ? 'active' : ''}`}
                                onClick={() => {
                                    setAdminDropdownOpen(!adminDropdownOpen);
                                    setDmDropdownOpen(false);
                                }}
                            >
                                Admin
                                <span className="dropdown-arrow">{adminDropdownOpen ? '▴' : '▾'}</span>
                            </button>
                            {adminDropdownOpen && (
                                <div className="nav-dropdown-menu nav-dropdown-admin">
                                    <Link
                                        to="/admin"
                                        className={`nav-dropdown-item ${location.pathname === '/admin' ? 'active' : ''}`}
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Users & Roles
                                    </Link>
                                    <Link
                                        to="/admin/characters"
                                        className={`nav-dropdown-item ${location.pathname === '/admin/characters' ? 'active' : ''}`}
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Character Management
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
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
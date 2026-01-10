import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [showAuthDropdown, setShowAuthDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });

    const [openDropdown, setOpenDropdown] = useState(null); // track which nav dropdown is open
    const dropdownTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current);
            }
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowAuthDropdown(false);
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement login logic with API
        console.log('Login:', loginData);
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement register logic with API
        console.log('Register:', registerData);
    };

    // Dynamic navigation items - can be extended or fetched from backend
    const navigationItems = [
        { label: 'Characters', path: '/characters' },
        { label: 'Sessions', path: '/sessions' },
        { label: 'Hexmap', path: '/hexmap' },
        { label: 'Shops', dropdown: true, subItems: [
            { label: "Myrloc's Mysticanum", path: '/mysticanum' },
            { label: "Thorgrim's Irongoods", path: '/irongoods' },
        ]},
    ];

    // Show immediately
    const handleDropdownEnter = (label) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }
        setOpenDropdown(label);
    };

    // Hide after small delay (200ms)
    const handleDropdownLeave = () => {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        dropdownTimeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
            dropdownTimeoutRef.current = null;
        }, 200);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Home Button (left) */}
                <Link to="/" className="home-button">
                    <div className="home-icon">TB</div>
                </Link>

                {/* Centered Navigation Links */}
                <div className="nav-links">
                    {navigationItems.map((item) => (
                        item.dropdown ? (
                            <div key={item.label} className="dropdown">
                                {/* attach handlers on both the trigger and the menu to avoid gaps */}
                                <button
                                    className="nav-link dropdown-toggle"
                                    onMouseEnter={() => handleDropdownEnter(item.label)}
                                    onMouseLeave={handleDropdownLeave}
                                >
                                    {item.label}
                                </button>

                                {openDropdown === item.label && (
                                    <div
                                        className="dropdown-menu dropdown-menu-large"
                                        onMouseEnter={() => handleDropdownEnter(item.label)}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <div className="menu-items">
                                            {item.subItems.map(sub => (
                                                <Link
                                                    key={sub.label}
                                                    to={sub.path}
                                                    className="dropdown-item"
                                                    onClick={() => setOpenDropdown(null)}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link key={item.label} to={item.path} className="nav-link">
                                {item.label}
                            </Link>
                        )
                    ))}
                </div>

                {/* Auth Section (right) */}
                <div className="auth-section">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <span className="welcome-text">Welcome, {user?.username}</span>
                            <button onClick={handleLogout} className="btn btn-outline">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-dropdown">
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                            >
                                Sign In
                            </button>
                            
                            {showAuthDropdown && (
                                <div className="auth-dropdown-menu" onMouseEnter={() => {
                                    if (dropdownTimeoutRef.current) { clearTimeout(dropdownTimeoutRef.current); dropdownTimeoutRef.current = null; }
                                }} onMouseLeave={() => {
                                    // small delay before hiding so pointer can move
                                    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                                    dropdownTimeoutRef.current = setTimeout(() => setShowAuthDropdown(false), 200);
                                }}>
                                    {/* Tabs */}
                                    <div className="auth-tabs">
                                        <button
                                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('login')}
                                        >
                                            Login
                                        </button>
                                        <button
                                            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('register')}
                                        >
                                            Register
                                        </button>
                                    </div>

                                    {/* Login Form */}
                                    {activeTab === 'login' && (
                                        <form onSubmit={handleLoginSubmit} className="auth-form">
                                            <div className="form-group">
                                                <label htmlFor="login-username">Username</label>
                                                <input
                                                    type="text"
                                                    id="login-username"
                                                    name="username"
                                                    placeholder="torchbearer"
                                                    value={loginData.username}
                                                    onChange={handleLoginChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="login-password">Password</label>
                                                <input
                                                    type="password"
                                                    id="login-password"
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-block">
                                                Enter the Mists
                                            </button>
                                        </form>
                                    )}

                                    {/* Register Form */}
                                    {activeTab === 'register' && (
                                        <form onSubmit={handleRegisterSubmit} className="auth-form">
                                            <div className="form-group">
                                                <label htmlFor="register-username">Username</label>
                                                <input
                                                    type="text"
                                                    id="register-username"
                                                    name="username"
                                                    placeholder="torchbearer"
                                                    value={registerData.username}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="register-password">Password</label>
                                                <input
                                                    type="password"
                                                    id="register-password"
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={registerData.password}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="register-confirm">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    id="register-confirm"
                                                    name="confirmPassword"
                                                    placeholder="••••••••"
                                                    value={registerData.confirmPassword}
                                                    onChange={handleRegisterChange}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-block">
                                                Enter the Mists
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
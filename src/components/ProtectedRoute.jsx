import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check single role
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="access-denied">
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    // Check multiple roles (user needs ANY of the listed roles)
    if (requiredRoles && requiredRoles.length > 0) {
        const hasAnyRole = requiredRoles.some((role) => hasRole(role));
        if (!hasAnyRole) {
            return (
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;
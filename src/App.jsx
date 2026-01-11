import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import MyCharacters from './pages/MyCharacters';
import CharacterDetail from './pages/CharacterDetail';
import DMCharacters from './pages/DMCharacters';
import AdminCharacters from './pages/AdminCharacters';
import './App.css';

function App() {
    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="Admin">
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/characters"
                        element={
                            <ProtectedRoute>
                                <MyCharacters />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/characters/:id"
                        element={
                            <ProtectedRoute>
                                <CharacterDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dm/characters"
                        element={
                            <ProtectedRoute requiredRoles={['DM', 'Admin']}>
                                <DMCharacters />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/characters"
                        element={
                            <ProtectedRoute requiredRole="Admin">
                                <AdminCharacters />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
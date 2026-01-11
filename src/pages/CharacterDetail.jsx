import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { characterAPI } from '../services/api';
import CharacterImage from '../components/CharacterImage';
import './CharacterDetail.css';

const STATUS_CONFIG = {
    PendingApproval: { label: 'Pending Approval', color: 'yellow' },
    Active: { label: 'Active', color: 'green' },
    Retired: { label: 'Retired', color: 'gray' },
    Dead: { label: 'Dead', color: 'red' },
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function CharacterDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Image upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);

    // Retire confirmation state
    const [showRetireConfirm, setShowRetireConfirm] = useState(false);
    const [retiring, setRetiring] = useState(false);

    useEffect(() => {
        fetchCharacter();
    }, [id]);

    const fetchCharacter = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await characterAPI.getCharacter(id);
            setCharacter(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load character');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError('');

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Please select a JPG or PNG image');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setUploadError('Image must be less than 2MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleUploadConfirm = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            setUploadError('');

            const formData = new FormData();
            formData.append('image', selectedFile);

            await characterAPI.uploadCharacterImage(id, formData);

            // Reset and refresh
            setSelectedFile(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await fetchCharacter();
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadCancel = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRetire = async () => {
        try {
            setRetiring(true);
            await characterAPI.retireCharacter(id);
            navigate('/characters');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retire character');
            setShowRetireConfirm(false);
        } finally {
            setRetiring(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="character-detail-page">
                <div className="character-detail-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading character...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !character) {
        return (
            <div className="character-detail-page">
                <div className="character-detail-container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/characters')}>
                            Back to Characters
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[character?.status] || STATUS_CONFIG.Active;
    const canRetire = character?.status === 'Active';

    return (
        <div className="character-detail-page">
            <div className="character-detail-container">
                <button className="back-button" onClick={() => navigate('/characters')}>
                    &larr; Back to Characters
                </button>

                {error && (
                    <div className="error-banner">{error}</div>
                )}

                <div className="character-detail-content">
                    <div className="character-image-section">
                        <div className="character-image-large">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                            ) : (
                                <CharacterImage
                                    imageFileName={character?.imageFileName}
                                    characterName={character?.name}
                                    size="large"
                                />
                            )}
                        </div>

                        <div className="image-upload-section">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                id="image-upload"
                            />

                            {!selectedFile ? (
                                <label htmlFor="image-upload" className="btn btn-outline upload-btn">
                                    {character?.imageFileName ? 'Change Image' : 'Upload Image'}
                                </label>
                            ) : (
                                <div className="upload-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleUploadConfirm}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleUploadCancel}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {uploadError && (
                                <p className="upload-error">{uploadError}</p>
                            )}
                            <p className="upload-hint">JPG or PNG, max 2MB</p>
                        </div>
                    </div>

                    <div className="character-info-section">
                        <div className="character-header">
                            <h1 className="character-name">{character?.name}</h1>
                            <span className={`status-badge status-${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>

                        <div className="character-stats">
                            <div className="stat-item">
                                <span className="stat-label">Gold</span>
                                <span className="stat-value gold-value">{character?.gold ?? 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Experience</span>
                                <span className="stat-value">{character?.experience ?? 0} XP</span>
                            </div>
                        </div>

                        <div className="character-dates">
                            <div className="date-item">
                                <span className="date-label">Created</span>
                                <span className="date-value">{formatDate(character?.createdAt)}</span>
                            </div>
                            {character?.approvedAt && (
                                <div className="date-item">
                                    <span className="date-label">Approved</span>
                                    <span className="date-value">{formatDate(character.approvedAt)}</span>
                                </div>
                            )}
                        </div>

                        {canRetire && (
                            <div className="character-actions">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowRetireConfirm(true)}
                                >
                                    Retire Character
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Retire Confirmation Modal */}
                {showRetireConfirm && (
                    <div className="modal-overlay" onClick={() => !retiring && setShowRetireConfirm(false)}>
                        <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Retire Character?</h2>
                            <p>
                                Are you sure you want to retire <strong>{character?.name}</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="modal-buttons">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowRetireConfirm(false)}
                                    disabled={retiring}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleRetire}
                                    disabled={retiring}
                                >
                                    {retiring ? 'Retiring...' : 'Yes, Retire'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CharacterDetail;

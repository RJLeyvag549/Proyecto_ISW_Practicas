import { useState } from 'react';
import '../styles/applications.css';

const ApplicationStatusModal = ({ application, onClose, onSubmit }) => {
    const [status, setStatus] = useState('');
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!application) return null;

    const studentName = application.student?.nombreCompleto || 'Estudiante';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!status) {
            setError('Debes seleccionar un estado');
            return;
        }

        if ((status === 'rejected' || status === 'needsInfo') && !comments.trim()) {
            setError('Debes ingresar comentarios para rechazar o solicitar información');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(application.id, status, comments);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al actualizar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-modal-overlay" onClick={onClose}>
            <div className="app-modal-content app-modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="app-modal-header">
                    <h2>Gestionar Solicitud</h2>
                    <button className="app-btn-close" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="app-modal-body">
                        <p className="app-modal-subtitle">
                            Solicitud de: <strong>{studentName}</strong>
                        </p>

                        {error && (
                            <div className="app-error-message">
                                <i className="fa-solid fa-exclamation-triangle"></i>
                                {error}
                            </div>
                        )}

                        <div className="app-form-group">
                            <label>Nuevo Estado:</label>
                            <div className="status-options">
                                <label className={`status-option ${status === 'accepted' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="accepted"
                                        checked={status === 'accepted'}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    <i className="fa-solid fa-check-circle"></i>
                                    Aprobar
                                </label>
                                <label className={`status-option ${status === 'rejected' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="rejected"
                                        checked={status === 'rejected'}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    <i className="fa-solid fa-times-circle"></i>
                                    Rechazar
                                </label>
                                <label className={`status-option ${status === 'needsInfo' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="needsInfo"
                                        checked={status === 'needsInfo'}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    <i className="fa-solid fa-exclamation-circle"></i>
                                    Solicitar Info
                                </label>
                            </div>
                        </div>

                        <div className="app-form-group">
                            <label>
                                Comentarios: 
                                {(status === 'rejected' || status === 'needsInfo') && (
                                    <span className="required">*</span>
                                )}
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Ingresa comentarios para el estudiante..."
                                rows={4}
                                maxLength={1000}
                            />
                            <small>{comments.length}/1000 caracteres</small>
                        </div>
                    </div>

                    <div className="app-modal-footer">
                        <button type="button" className="app-btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="app-btn-primary" disabled={loading || !status}>
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Procesando...
                                </>
                            ) : (
                                'Confirmar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationStatusModal;

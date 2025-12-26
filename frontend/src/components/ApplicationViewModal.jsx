import { useState } from 'react';
import Swal from 'sweetalert2';
import { deleteOwnApplication } from '@services/practiceApplication.service.js';
import EditExternalApplicationModal from './EditExternalApplicationModal.jsx';
import '../styles/applications.css';

const getStatusInfo = (status) => {
    const statusMap = {
        pending: { label: 'Pendiente', class: 'status-pending' },
        accepted: { label: 'Aprobada', class: 'status-accepted' },
        rejected: { label: 'Rechazada', class: 'status-rejected' },
        needsInfo: { label: 'Requiere Info', class: 'status-needsinfo' }
    };
    return statusMap[status] || statusMap.pending;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ApplicationViewModal = ({ application, onClose, onDelete }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!application) return null;

    const statusInfo = getStatusInfo(application.status);
    const isExternal = application.applicationType === 'external';
    const student = application.student || {};
    const internship = application.internship || {};
    const externalData = application.internshipExternal || {};
    const isEditable = isExternal && ['pending', 'needsInfo'].includes(application.status);

    const attachments = (() => {
        try {
            return JSON.parse(application.attachments || '[]');
        } catch {
            return [];
        }
    })();

    const handleDeleteClick = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar solicitud?',
            text: 'Esta acción no se puede deshacer. Se eliminarán permanentemente los datos de la empresa y la solicitud.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setIsDeleting(true);
            try {
                const response = await deleteOwnApplication(application.id);
                
                if (response.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.error,
                        confirmButtonColor: '#6cc4c2'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminada!',
                        text: 'La solicitud ha sido eliminada correctamente.',
                        confirmButtonColor: '#6cc4c2'
                    }).then(() => {
                        onDelete?.();
                        onClose();
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar la solicitud.',
                    confirmButtonColor: '#6cc4c2'
                });
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        onDelete?.(); // Trigger refresh de la lista
    };

    if (showEditModal && isExternal) {
        return (
            <EditExternalApplicationModal
                application={application}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
            />
        );
    }

    return (
        <div className="app-modal-overlay" onClick={onClose}>
            <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="app-modal-header">
                    <h2>Detalle de Solicitud</h2>
                    <button className="app-btn-close" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="app-modal-body">
                    {/* Estado */}
                    <div className="info-section">
                        <h3>Estado de la Solicitud</h3>
                        <span className={`status-badge-large ${statusInfo.class}`}>
                            {statusInfo.label}
                        </span>
                        {application.coordinatorComments && (
                            <div className="coordinator-comments">
                                <strong>Comentarios del coordinador:</strong>
                                <p>{application.coordinatorComments}</p>
                            </div>
                        )}
                    </div>

                    {/* Información del Estudiante */}
                    <div className="info-section">
                        <h3><i className="fa-solid fa-user"></i> Información del Estudiante</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Nombre:</label>
                                <span>{student.nombreCompleto || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>RUT:</label>
                                <span>{student.rut || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{student.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información de la Práctica */}
                    <div className="info-section">
                        <h3>
                            <i className="fa-solid fa-briefcase"></i> 
                            {isExternal ? ' Práctica Externa' : ' Oferta de Práctica'}
                        </h3>
                        {isExternal ? (
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Empresa:</label>
                                    <span>{externalData.companyName || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Dirección:</label>
                                    <span>{externalData.companyAddress || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Industria:</label>
                                    <span>{externalData.companyIndustry || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Supervisor:</label>
                                    <span>{externalData.supervisorName || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Cargo Supervisor:</label>
                                    <span>{externalData.supervisorPosition || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Email Supervisor:</label>
                                    <span>{externalData.supervisorEmail || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Departamento:</label>
                                    <span>{externalData.department || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Título Práctica:</label>
                                    <span>{externalData.title || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Descripción:</label>
                                    <span>{externalData.description || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Duración Estimada:</label>
                                    <span>{externalData.estimatedDuration || 'N/A'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Título:</label>
                                    <span>{internship.title || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Empresa:</label>
                                    <span>{internship.company?.name || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Descripción:</label>
                                    <span>{internship.description || 'N/A'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documentos Adjuntos */}
                    {attachments.length > 0 && (
                        <div className="info-section">
                            <h3><i className="fa-solid fa-paperclip"></i> Documentos Adjuntos</h3>
                            <ul className="attachments-list">
                                {attachments.map((doc, index) => (
                                    <li key={index}>
                                        <i className="fa-solid fa-file"></i>
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fechas */}
                    <div className="info-section">
                        <h3><i className="fa-solid fa-calendar"></i> Fechas</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Creada:</label>
                                <span>{formatDate(application.createdAt)}</span>
                            </div>
                            <div className="info-item">
                                <label>Actualizada:</label>
                                <span>{formatDate(application.updatedAt)}</span>
                            </div>
                            {application.isClosed && (
                                <>
                                    <div className="info-item">
                                        <label>Cerrada:</label>
                                        <span>{formatDate(application.closedAt)}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Promedio Final:</label>
                                        <span>{application.finalAverage || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Resultado:</label>
                                        <span className={application.finalResult === 'approved' ? 'text-success' : 'text-danger'}>
                                            {application.finalResult === 'approved' ? 'Aprobada' : 'Reprobada'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="app-modal-footer">
                    {isEditable && (
                        <>
                            <button 
                                className="app-btn-warning"
                                onClick={() => setShowEditModal(true)}
                                title="Solo puedes editar solicitudes pendientes"
                            >
                                <i className="fa-solid fa-edit"></i> Editar
                            </button>
                            <button 
                                className="app-btn-danger"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                title="Solo puedes eliminar solicitudes pendientes"
                            >
                                {isDeleting ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-trash"></i> Eliminar
                                    </>
                                )}
                            </button>
                        </>
                    )}
                    <button className="app-btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationViewModal;

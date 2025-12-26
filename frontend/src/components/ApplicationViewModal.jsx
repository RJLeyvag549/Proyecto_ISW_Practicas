import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { deleteOwnApplication, updateOwnApplication } from '@services/practiceApplication.service.js';
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

const ApplicationViewModal = ({ application, onClose, onDelete, autoEdit = false }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState('');
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        activities: '',
        estimatedDuration: '',
        schedule: '',
        specialtyArea: '',
        companyName: '',
        companyAddress: '',
        companyIndustry: '',
        companyWebsite: '',
        companyPhone: '',
        companyEmail: '',
        supervisorName: '',
        supervisorPosition: '',
        supervisorEmail: '',
        supervisorPhone: '',
        department: ''
    });
    const [editAttachments, setEditAttachments] = useState([]);

    if (!application) return null;

    // Inicializar form data cuando se abre el modal de edición
    const hydrateEditForm = () => {
        const externalData = application.internshipExternal || {};
        setEditFormData({
            title: externalData.title || '',
            description: externalData.description || '',
            activities: externalData.activities || '',
            estimatedDuration: externalData.estimatedDuration || '',
            schedule: externalData.schedule || '',
            specialtyArea: externalData.specialtyArea || '',
            companyName: externalData.companyName || '',
            companyAddress: externalData.companyAddress || '',
            companyIndustry: externalData.companyIndustry || '',
            companyWebsite: externalData.companyWebsite || '',
            companyPhone: externalData.companyPhone || '',
            companyEmail: externalData.companyEmail || '',
            supervisorName: externalData.supervisorName || '',
            supervisorPosition: externalData.supervisorPosition || '',
            supervisorEmail: externalData.supervisorEmail || '',
            supervisorPhone: externalData.supervisorPhone || '',
            department: externalData.department || ''
        });
        try {
            const current = JSON.parse(application.attachments || '[]');
            setEditAttachments(Array.isArray(current) ? current : []);
        } catch {
            setEditAttachments([]);
        }
    };

    const handleEditClick = () => {
        hydrateEditForm();
        setEditError('');
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
        setEditError('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError('');
        setIsUpdating(true);

        try {
            const response = await updateOwnApplication(application.id, editFormData, editAttachments);
            
            if (response.error) {
                setEditError(response.error);
            } else {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizada!',
                    text: 'La solicitud ha sido actualizada correctamente.',
                    confirmButtonColor: '#6cc4c2'
                }).then(() => {
                    setShowEditModal(false);
                    onDelete?.(); // Trigger refresh
                });
            }
        } catch (err) {
            setEditError('Error al actualizar la solicitud');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddFiles = (e) => {
        // TODO: Implementar upload de archivos
    };

    const handleRemoveAttachment = (idx) => {
        // TODO: Implementar eliminación de archivos
    };

    const statusInfo = getStatusInfo(application.status);
    const isExternal = application.applicationType === 'external';
    const student = application.student || {};
    const internship = application.internship || {};
    const externalData = application.internshipExternal || {};
    const isEditable = isExternal && ['pending', 'needsInfo'].includes(application.status);

    useEffect(() => {
        if (autoEdit && isEditable) {
            hydrateEditForm();
            setShowEditModal(true);
        }
    }, [autoEdit, isEditable]);

    useEffect(() => {
        if (showEditModal) {
            hydrateEditForm();
        }
    }, [showEditModal]);

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
            <div className="app-modal-overlay" onClick={() => setShowEditModal(false)}>
                <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="app-modal-header">
                        <h2>Editar Solicitud de Práctica Externa</h2>
                        <button className="app-btn-close" onClick={() => setShowEditModal(false)}>
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="app-modal-form">
                        <div className="app-modal-body">
                            {editError && (
                                <div className="alert alert-error">
                                    <i className="fa-solid fa-exclamation-circle"></i>
                                    {editError}
                                </div>
                            )}

                            {/* Información de la Empresa */}
                            <div className="form-section">
                                <h3>Información de la Empresa</h3>
                                <div className="form-group">
                                    <label>Nombre de la Empresa *</label>
                                    <input 
                                        type="text"
                                        name="companyName"
                                        value={editFormData.companyName}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dirección *</label>
                                    <input 
                                        type="text"
                                        name="companyAddress"
                                        value={editFormData.companyAddress}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Industria</label>
                                    <input 
                                        type="text"
                                        name="companyIndustry"
                                        value={editFormData.companyIndustry}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sitio Web</label>
                                    <input 
                                        type="text"
                                        name="companyWebsite"
                                        value={editFormData.companyWebsite}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input 
                                        type="tel"
                                        name="companyPhone"
                                        value={editFormData.companyPhone}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="text"
                                        inputMode="email"
                                        name="companyEmail"
                                        value={editFormData.companyEmail}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            </div>

                            {/* Información del Supervisor */}
                            <div className="form-section">
                                <h3>Información del Supervisor</h3>
                                <div className="form-group">
                                    <label>Nombre Completo *</label>
                                    <input 
                                        type="text"
                                        name="supervisorName"
                                        value={editFormData.supervisorName}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cargo *</label>
                                    <input 
                                        type="text"
                                        name="supervisorPosition"
                                        value={editFormData.supervisorPosition}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input 
                                        type="text"
                                        inputMode="email"
                                        name="supervisorEmail"
                                        value={editFormData.supervisorEmail}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input 
                                        type="tel"
                                        name="supervisorPhone"
                                        value={editFormData.supervisorPhone}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Departamento</label>
                                    <input 
                                        type="text"
                                        name="department"
                                        value={editFormData.department}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            </div>

                            {/* Información de la Práctica */}
                            <div className="form-section">
                                <h3>Información de la Práctica</h3>
                                <div className="form-group">
                                    <label>Título *</label>
                                    <input 
                                        type="text"
                                        name="title"
                                        value={editFormData.title}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Descripción *</label>
                                    <textarea 
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Actividades a Desarrollar *</label>
                                    <textarea 
                                        name="activities"
                                        value={editFormData.activities}
                                        onChange={handleEditChange}
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duración Estimada *</label>
                                    <input 
                                        type="text"
                                        name="estimatedDuration"
                                        value={editFormData.estimatedDuration}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Horarios *</label>
                                    <textarea 
                                        name="schedule"
                                        value={editFormData.schedule}
                                        onChange={handleEditChange}
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Área de Especialidad</label>
                                    <input 
                                        type="text"
                                        name="specialtyArea"
                                        value={editFormData.specialtyArea}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            </div>

                            {/* Documentos Adjuntos */}
                            <div className="form-section">
                                <h3>Documentos</h3>
                                <div className="form-group">
                                    <label>Agregar archivos (próximamente)</label>
                                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleAddFiles} disabled />
                                    <small className="text-muted">La funcionalidad de subida de archivos se implementará próximamente</small>
                                </div>
                                {editAttachments?.length > 0 && (
                                    <div className="file-list">
                                        {editAttachments.map((doc, index) => (
                                            <div key={index} className="file-item">
                                                <span><i className="fa-solid fa-file" /> {doc}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="app-modal-footer">
                            <button 
                                type="submit"
                                className="app-btn-success"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-save"></i> Guardar Cambios
                                    </>
                                )}
                            </button>
                            <button 
                                type="button"
                                className="app-btn-secondary"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
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

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from '@services/root.service.js';
import { deleteOwnApplication, updateOwnApplication, uploadAttachmentsFiles } from '@services/practiceApplication.service.js';
import { getUserProfile } from '@services/profile.service.js';
import ProfileViewModal from './ProfileViewModal.jsx';
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

const ApplicationViewModal = ({ application, onClose, onDelete, autoEdit = false, isAdmin = false }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
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
    const [editAttachments, setEditAttachments] = useState([]); // Documentos existentes
    const [newFiles, setNewFiles] = useState([]); // Nuevos archivos reales a subir
    const [documentsToDelete, setDocumentsToDelete] = useState([]); // IDs de documentos a eliminar

    if (!application) return null;

    // Inicializar form data cuando se abre el modal de edición
    const hydrateEditForm = useCallback(() => {
        if (!application) return;
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
        setNewFiles([]);
        setDocumentsToDelete([]);

        // Cargar documentos existentes desde documents
        if (application.documents && Array.isArray(application.documents)) {
            setEditAttachments(application.documents);
        } else {
            setEditAttachments([]);
        }
    }, [application]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
        setEditError('');
    };

    const validateEditForm = () => {
        // Empresa
        if (!editFormData.companyName?.trim()) {
            setEditError('El nombre de la empresa es obligatorio.');
            return false;
        }
        if (editFormData.companyName.length < 5) {
            setEditError('El nombre de la empresa debe tener al menos 5 caracteres.');
            return false;
        }
        if (editFormData.companyAddress?.trim().length < 10) {
            setEditError('La dirección debe tener al menos 10 caracteres.');
            return false;
        }
        if (editFormData.companyEmail && editFormData.companyEmail.trim()) {
            if (!/^\S+@\S+\.\S+$/.test(editFormData.companyEmail)) {
                setEditError('El email de la empresa debe tener un formato válido.');
                return false;
            }
        }
        if (editFormData.companyIndustry && editFormData.companyIndustry.trim()) {
            if (editFormData.companyIndustry.trim().length < 3) {
                setEditError('La industria debe tener al menos 3 caracteres.');
                return false;
            }
        }
        if (editFormData.companyPhone && editFormData.companyPhone.trim()) {
            if (!/^[+]?[\d\s\-()]{7,25}$/.test(editFormData.companyPhone.trim())) {
                setEditError('El teléfono de la empresa debe tener un formato válido (ej: +56 9 1234 5678).');
                return false;
            }
        }
        if (editFormData.companyWebsite && editFormData.companyWebsite.trim()) {
            try {
                new URL(editFormData.companyWebsite.trim());
            } catch {
                setEditError('El sitio web debe ser una URL válida (ej: https://www.empresa.cl).');
                return false;
            }
        }

        // Supervisor
        if (!editFormData.supervisorName?.trim()) {
            setEditError('El nombre del supervisor es obligatorio.');
            return false;
        }
        if (editFormData.supervisorName.length < 3) {
            setEditError('El nombre del supervisor debe tener al menos 3 caracteres.');
            return false;
        }
        if (!editFormData.supervisorPosition?.trim() || editFormData.supervisorPosition.length < 3) {
            setEditError('El cargo del supervisor es obligatorio y debe tener al menos 3 caracteres.');
            return false;
        }
        if (!editFormData.supervisorEmail?.trim() || !/^\S+@\S+\.\S+$/.test(editFormData.supervisorEmail)) {
            setEditError('El email del supervisor debe tener un formato válido.');
            return false;
        }
        if (editFormData.supervisorPhone && editFormData.supervisorPhone.trim()) {
            if (!/^[+]?[\d\s\-()]{7,25}$/.test(editFormData.supervisorPhone.trim())) {
                setEditError('El teléfono del supervisor debe tener un formato válido (ej: +56 9 1234 5678).');
                return false;
            }
        }
        if (editFormData.department && editFormData.department.trim()) {
            if (editFormData.department.trim().length < 3) {
                setEditError('El departamento debe tener al menos 3 caracteres.');
                return false;
            }
        }

        // Práctica
        if (!editFormData.title?.trim() || editFormData.title.length < 5) {
            setEditError('El título de la práctica es obligatorio y debe tener al menos 5 caracteres.');
            return false;
        }
        if (!editFormData.description?.trim() || editFormData.description.length < 20) {
            setEditError('La descripción es obligatoria y debe tener al menos 20 caracteres.');
            return false;
        }
        if (!editFormData.activities?.trim() || editFormData.activities.length < 20) {
            setEditError('Las actividades son obligatorias y deben tener al menos 20 caracteres.');
            return false;
        }
        if (!editFormData.estimatedDuration?.trim()) {
            setEditError('La duración estimada es obligatoria.');
            return false;
        }
        if (editFormData.schedule && editFormData.schedule.trim()) {
            if (editFormData.schedule.trim().length < 5) {
                setEditError('El horario debe tener al menos 5 caracteres.');
                return false;
            }
        }
        if (editFormData.specialtyArea && editFormData.specialtyArea.trim()) {
            if (editFormData.specialtyArea.trim().length < 3) {
                setEditError('El área de especialidad debe tener al menos 3 caracteres.');
                return false;
            }
        }
        return true;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError('');

        if (!validateEditForm()) return;

        // Sanitizar datos opcionales: si están vacíos, no enviarlos para pasar validación Joi
        const optionalKeys = [
            'companyIndustry', 'companyWebsite', 'companyPhone', 'companyEmail',
            'supervisorPhone', 'department', 'schedule', 'specialtyArea'
        ];
        const cleanCompanyData = { ...editFormData };
        optionalKeys.forEach((key) => {
            if (cleanCompanyData[key] !== undefined && typeof cleanCompanyData[key] === 'string' && cleanCompanyData[key].trim() === '') {
                delete cleanCompanyData[key];
            }
        });
        setIsUpdating(true);

        try {
            // 1. Eliminar documentos marcados para eliminar
            if (documentsToDelete.length > 0) {
                for (const docId of documentsToDelete) {
                    try {
                        await axios.delete(`/documents/${docId}`);
                    } catch (error) {
                        console.error('Error al eliminar documento:', error);
                        setEditError('Error al eliminar algunos documentos');
                        setIsUpdating(false);
                        return;
                    }
                }
            }

            // 2. Actualizar datos de la solicitud
            const response = await updateOwnApplication(application.id, cleanCompanyData);

            if (response.error) {
                setEditError(response.error);
            } else {
                // 3. Subir archivos nuevos si se agregaron
                if (newFiles.length > 0) {
                    const uploadRes = await uploadAttachmentsFiles(application.id, newFiles);
                    if (uploadRes?.error) {
                        setEditError(uploadRes.error || 'Error al subir archivos');
                        setIsUpdating(false);
                        return;
                    }
                }

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
        } catch {
            setEditError('Error al actualizar la solicitud');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddFiles = (e) => {
        const files = Array.from(e.target.files);
        if (newFiles.length + files.length > 5) {
            setEditError('Máximo 5 archivos permitidos.');
            return;
        }
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                setEditError('Los archivos no pueden superar 5MB.');
                return;
            }
        }
        setNewFiles([...newFiles, ...files]);
    };

    const handleRemoveAttachment = (idx) => {
        setNewFiles(newFiles.filter((_, i) => i !== idx));
    };

    const handleRemoveExistingDocument = (docId) => {
        // Marcar documento para eliminar
        setDocumentsToDelete([...documentsToDelete, docId]);
        // Remover de la lista visible
        setEditAttachments(editAttachments.filter(doc => doc.id !== docId));
    };

    const statusInfo = getStatusInfo(application.status);
    const isExternal = application.applicationType === 'external';

    // Si es estudiante (no admin), usar datos del sessionStorage
    const loggedUser = !isAdmin ? JSON.parse(sessionStorage.getItem('usuario') || '{}') : {};
    const student = isAdmin ? (application.student || {}) : loggedUser;

    const internship = application.internship || {};
    const externalData = application.internshipExternal || {};
    // Solo el estudiante puede editar/eliminar (no el admin)
    const isEditable = !isAdmin && isExternal && ['pending', 'needsInfo'].includes(application.status);

    useEffect(() => {
        if (autoEdit && isEditable) {
            hydrateEditForm();
            setShowEditModal(true);
        }
    }, [autoEdit, hydrateEditForm, isEditable]);

    useEffect(() => {
        if (showEditModal) {
            hydrateEditForm();
        }
    }, [hydrateEditForm, showEditModal]);

    const attachments = (() => {
        // Usar documents si existen, sino array vacío
        if (application.documents && Array.isArray(application.documents)) {
            return application.documents;
        }
        return [];
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
            } catch {
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

    if (!application) return null;

    if (showEditModal && isExternal) {
        return (
            <div className="app-modal-overlay" onClick={() => setShowEditModal(false)}>
                <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="app-modal-header">
                        <h2>Editar Solicitud Externa</h2>
                        <button className="app-btn-close" onClick={() => setShowEditModal(false)}>
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={handleEditSubmit}>
                        <div className="app-modal-body">
                            {editError && (
                                <div className="app-error-message">
                                    <i className="fa-solid fa-exclamation-triangle"></i>
                                    {editError}
                                </div>
                            )}

                            {/* Datos de la Empresa */}
                            <h3 className="step-title">Datos de la Empresa</h3>

                            <div className="form-row">
                                <div className="app-form-group">
                                    <label>Nombre de la Empresa <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={editFormData.companyName}
                                        onChange={handleEditChange}
                                        placeholder="Ej: Empresa Tecnológica S.A."
                                    />
                                </div>

                                <div className="app-form-group">
                                    <label>Industria/Rubro</label>
                                    <input
                                        type="text"
                                        name="companyIndustry"
                                        value={editFormData.companyIndustry}
                                        onChange={handleEditChange}
                                        placeholder="Ej: Tecnología"
                                    />
                                </div>
                            </div>

                            <div className="app-form-group">
                                <label>Dirección <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="companyAddress"
                                    value={editFormData.companyAddress}
                                    onChange={handleEditChange}
                                    placeholder="Ej: Av. Principal 123, Concepción"
                                />
                            </div>

                            <div className="form-row">
                                <div className="app-form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        name="companyPhone"
                                        value={editFormData.companyPhone}
                                        onChange={handleEditChange}
                                        placeholder="Ej: +56 9 1234 5678"
                                    />
                                </div>

                                <div className="app-form-group">
                                    <label>Email de contacto</label>
                                    <input
                                        type="text"
                                        inputMode="email"
                                        name="companyEmail"
                                        value={editFormData.companyEmail}
                                        onChange={handleEditChange}
                                        placeholder="Ej: contacto@empresa.cl"
                                    />
                                </div>
                            </div>

                            <div className="app-form-group">
                                <label>Sitio Web</label>
                                <input
                                    type="text"
                                    name="companyWebsite"
                                    value={editFormData.companyWebsite}
                                    onChange={handleEditChange}
                                    placeholder="Ej: https://www.empresa.cl"
                                />
                            </div>

                            {/* Datos del Supervisor */}
                            <h3 className="step-title">Datos del Supervisor</h3>

                            <div className="form-row">
                                <div className="app-form-group">
                                    <label>Nombre Completo <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="supervisorName"
                                        value={editFormData.supervisorName}
                                        onChange={handleEditChange}
                                        placeholder="Ej: Juan Pérez González"
                                    />
                                </div>

                                <div className="app-form-group">
                                    <label>Cargo <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="supervisorPosition"
                                        value={editFormData.supervisorPosition}
                                        onChange={handleEditChange}
                                        placeholder="Ej: Jefe de Desarrollo"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="app-form-group">
                                    <label>Email <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        inputMode="email"
                                        name="supervisorEmail"
                                        value={editFormData.supervisorEmail}
                                        onChange={handleEditChange}
                                        placeholder="Ej: supervisor@empresa.cl"
                                    />
                                </div>

                                <div className="app-form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        name="supervisorPhone"
                                        value={editFormData.supervisorPhone}
                                        onChange={handleEditChange}
                                        placeholder="Ej: +56 9 8765 4321"
                                    />
                                </div>
                            </div>

                            <div className="app-form-group">
                                <label>Departamento</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={editFormData.department}
                                    onChange={handleEditChange}
                                    placeholder="Ej: TI"
                                />
                            </div>

                            {/* Datos de la Práctica */}
                            <h3 className="step-title">Datos de la Práctica</h3>

                            <div className="app-form-group">
                                <label>Título de la Práctica <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditChange}
                                    placeholder="Ej: Desarrollo de Sistema Web"
                                />
                            </div>

                            <div className="app-form-group">
                                <label>Descripción <span className="required">*</span></label>
                                <textarea
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    placeholder="Describe brevemente en qué consiste la práctica..."
                                    rows={3}
                                />
                            </div>

                            <div className="app-form-group">
                                <label>Actividades a Desarrollar <span className="required">*</span></label>
                                <textarea
                                    name="activities"
                                    value={editFormData.activities}
                                    onChange={handleEditChange}
                                    placeholder="Lista las principales actividades que realizarás..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="app-form-group">
                                    <label>Duración Estimada <span className="required">*</span></label>
                                    <select
                                        name="estimatedDuration"
                                        value={editFormData.estimatedDuration}
                                        onChange={handleEditChange}
                                    >
                                        <option value="">Selecciona una duración...</option>
                                        <option value="1-2 meses">1-2 meses</option>
                                        <option value="2-3 meses">2-3 meses</option>
                                        <option value="3-4 meses">3-4 meses</option>
                                        <option value="4-6 meses">4-6 meses</option>
                                        <option value="6+ meses">6+ meses</option>
                                    </select>
                                </div>

                                <div className="app-form-group">
                                    <label>Área de Especialidad (opcional)</label>
                                    <input
                                        type="text"
                                        name="specialtyArea"
                                        value={editFormData.specialtyArea}
                                        onChange={handleEditChange}
                                        placeholder="Ej: Desarrollo Web"
                                    />
                                </div>
                            </div>

                            <div className="app-form-group">
                                <label>Horarios (opcional)</label>
                                <textarea
                                    name="schedule"
                                    value={editFormData.schedule}
                                    onChange={handleEditChange}
                                    placeholder="Ej: Lunes a Viernes 9:00-18:00"
                                    rows={2}
                                />
                            </div>

                            <div className="app-form-group">
                                <label>Documentos (máx 5, 5MB c/u)</label>

                                {/* Mostrar documentos existentes */}
                                {editAttachments.length > 0 && (
                                    <div className="existing-documents">
                                        <strong>Documentos actuales:</strong>
                                        <div className="file-list">
                                            {editAttachments.map((doc, idx) => (
                                                <div key={doc.id || idx} className="file-item">
                                                    <span>
                                                        <i className="fa-solid fa-file"></i>
                                                        {doc.filename || doc}
                                                    </span>
                                                    {doc.id && (
                                                        <button
                                                            type="button"
                                                            className="app-btn-danger"
                                                            onClick={() => handleRemoveExistingDocument(doc.id)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i> Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    multiple
                                    onChange={handleAddFiles}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                                {newFiles.length > 0 && (
                                    <div className="file-list">
                                        <strong>Nuevos archivos a subir:</strong>
                                        {newFiles.map((file, idx) => (
                                            <div key={idx} className="file-item">
                                                <span><i className="fa-solid fa-file"></i> {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                                                <button
                                                    type="button"
                                                    className="app-btn-danger"
                                                    onClick={() => handleRemoveAttachment(idx)}
                                                >
                                                    <i className="fa-solid fa-trash"></i> Quitar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="app-modal-footer">
                            <button type="button" className="app-btn-secondary" onClick={() => setShowEditModal(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="app-btn-primary" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-save"></i>
                                        Guardar Cambios
                                    </>
                                )}
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

                        {isAdmin && (
                            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="app-btn-primary"
                                    onClick={async () => {
                                        setLoadingProfile(true);
                                        try {
                                            const profile = await getUserProfile(student.id);
                                            if (profile.error) {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Error',
                                                    text: profile.error,
                                                    confirmButtonColor: '#6cc4c2'
                                                });
                                            } else {
                                                setStudentProfile(profile);
                                                setShowProfileModal(true);
                                            }
                                        } catch (error) {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'No se pudo cargar el perfil',
                                                confirmButtonColor: '#6cc4c2'
                                            });
                                        } finally {
                                            setLoadingProfile(false);
                                        }
                                    }}
                                    disabled={loadingProfile}
                                >
                                    <i className="fa-solid fa-address-card"></i> {loadingProfile ? 'Cargando...' : 'Ver perfil completo'}
                                </button>
                            </div>
                        )}
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
                                    <label>Teléfono Empresa:</label>
                                    <span>{externalData.companyPhone || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Email Empresa:</label>
                                    <span>{externalData.companyEmail || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Sitio Web:</label>
                                    <span>{externalData.companyWebsite || 'N/A'}</span>
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
                                    <label>Teléfono Supervisor:</label>
                                    <span>{externalData.supervisorPhone || 'N/A'}</span>
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
                                    <label>Actividades:</label>
                                    <span>{externalData.activities || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Duración Estimada:</label>
                                    <span>{externalData.estimatedDuration || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Horarios:</label>
                                    <span>{externalData.schedule || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Área de Especialidad:</label>
                                    <span>{externalData.specialtyArea || 'N/A'}</span>
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
                                    <li key={doc.id || index}>
                                        <i className="fa-solid fa-file"></i>
                                        {doc.filename || doc}
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

            {showProfileModal && (
                <ProfileViewModal
                    student={student}
                    profile={studentProfile}
                    onClose={() => {
                        setShowProfileModal(false);
                        setStudentProfile(null);
                    }}
                />
            )}
        </div>
    );
};

export default ApplicationViewModal;

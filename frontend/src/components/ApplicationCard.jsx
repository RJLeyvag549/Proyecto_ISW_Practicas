import '../styles/applications.css';

const getStatusInfo = (status) => {
    const statusMap = {
        pending: { label: 'Pendiente', class: 'status-pending', icon: 'fa-clock' },
        accepted: { label: 'Aprobada', class: 'status-accepted', icon: 'fa-check-circle' },
        rejected: { label: 'Rechazada', class: 'status-rejected', icon: 'fa-times-circle' },
        needsInfo: { label: 'Requiere Info', class: 'status-needsinfo', icon: 'fa-exclamation-circle' }
    };
    return statusMap[status] || statusMap.pending;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const ApplicationCard = ({ data, onView, onEdit, onDelete, onUpdateStatus, isAdmin = false }) => {
    const statusInfo = getStatusInfo(data.status);
    const studentName = data.student?.nombreCompleto || 'Estudiante';
    const isExternal = data.applicationType === 'external';
    
    // Solo el estudiante puede editar/eliminar solicitudes externas pendientes
    const isEditable = !isAdmin && isExternal && ['pending', 'needsInfo'].includes(data.status);
    
    // El admin puede cambiar estado si está pendiente, necesita info o rechazada (no aprobada)
    const canChangeStatus = isAdmin && ['pending', 'needsInfo', 'rejected'].includes(data.status);
    
    // Obtener nombre de empresa
    const companyName = isExternal 
        ? data.internshipExternal?.companyName || 'Empresa Externa'
        : data.internship?.company?.name || 'Sin empresa';

    const internshipTitle = isExternal
        ? 'Práctica Externa'
        : data.internship?.title || 'Sin título';

    return (
        <div className="application-card">
            <div className="card-header">
                <div className="header-top">
                    <span className={`status-badge ${statusInfo.class}`}>
                        <i className={`fa-solid ${statusInfo.icon}`}></i>
                        {statusInfo.label}
                    </span>
                    <span className={`type-badge ${isExternal ? 'type-external' : 'type-existing'}`}>
                        {isExternal ? 'Externa' : 'Oferta'}
                    </span>
                </div>
                <h3>{studentName}</h3>
                <span className="company-tag">{companyName}</span>
            </div>
            
            <div className="card-body">
                <div className="card-details">
                    <div className="detail-item">
                        <i className="fa-solid fa-briefcase"></i>
                        <span>{internshipTitle}</span>
                    </div>
                    <div className="detail-item">
                        <i className="fa-solid fa-calendar"></i>
                        <span>Enviada: {formatDate(data.createdAt)}</span>
                    </div>
                    {(() => {
                        try {
                            const attachments = JSON.parse(data.attachments || '[]');
                            if (Array.isArray(attachments) && attachments.length > 0) {
                                return (
                                    <div className="detail-item">
                                        <i className="fa-solid fa-paperclip"></i>
                                        <span>{attachments.length} documento{attachments.length > 1 ? 's' : ''} adjunto{attachments.length > 1 ? 's' : ''}</span>
                                    </div>
                                );
                            }
                            return null;
                        } catch {
                            return null;
                        }
                    })()}
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-view" onClick={() => onView(data)} title="Ver detalles">
                    <i className="fa-solid fa-eye"></i>
                </button>
                
                {/* Botones para estudiante: editar y eliminar */}
                {isEditable && (
                    <>
                        <button className="btn-edit" onClick={() => onEdit?.(data)} title="Editar">
                            <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn-delete" onClick={() => onDelete?.(data)} title="Eliminar">
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </>
                )}
                
                {/* Botón para admin: cambiar estado */}
                {canChangeStatus && (
                    <button className="btn-status" onClick={() => onUpdateStatus?.(data)} title="Cambiar estado">
                        <i className="fa-solid fa-exchange-alt"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ApplicationCard;

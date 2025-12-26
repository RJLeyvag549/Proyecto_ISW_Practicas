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

const ApplicationCard = ({ data, onView, onUpdateStatus }) => {
    const statusInfo = getStatusInfo(data.status);
    const studentName = data.student?.nombreCompleto || 'Estudiante';
    const isExternal = data.applicationType === 'external';
    
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
                    {data.attachments && (
                        <div className="detail-item">
                            <i className="fa-solid fa-paperclip"></i>
                            <span>{JSON.parse(data.attachments || '[]').length} documentos</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-view" onClick={() => onView(data)} title="Ver detalles">
                    <i className="fa-solid fa-eye"></i>
                </button>
                {data.status === 'pending' && (
                    <button className="btn-edit" onClick={() => onUpdateStatus(data)} title="Gestionar">
                        <i className="fa-solid fa-edit"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ApplicationCard;

import { useEffect } from 'react';
import '@styles/viewModal.css';

const InternshipViewModal = ({ show, onClose, data }) => {
    if (!show || !data) return null;

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-content">
                        <h3>{data.title}</h3>
                        <span className="modal-company-tag">
                            {data.company?.name || 'Empresa Desconocida'}
                        </span>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Sección: Detalles de la Oferta */}
                    <h4 className="section-title">Detalles de la Oferta</h4>
                    <div className="info-grid box-style">
                        <div className="info-item">
                            <label>Cupos Ocupados</label>
                            <p>
                                <i className="fa-solid fa-users"></i>
                                {data.occupiedSlots || 0} / {data.totalSlots || 0}
                            </p>
                        </div>
                        <div className="info-item">
                            <label>Área</label>
                            <p>
                                <i className="fa-solid fa-briefcase"></i>
                                {data.specialtyArea || 'General'}
                            </p>
                        </div>
                        {(data.applicationDeadline || data.deadline) && (
                            <div className="info-item">
                                <label>Fecha Límite</label>
                                <p>
                                    <i className="fa-solid fa-calendar"></i>
                                    {new Date(data.applicationDeadline || data.deadline).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="description-section box-style">
                        <label>Descripción</label>
                        <div className="description-content">
                            {data.description}
                        </div>
                    </div>

                    {/* Sección: Empresa */}
                    {data.company && (
                        <>
                            <h4 className="section-title">Información de la Empresa</h4>
                            <div className="info-grid box-style">
                                <div className="info-item">
                                    <label>Industria</label>
                                    <p>{data.company.industry || 'No especificada'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Sitio Web</label>
                                    <p>
                                        {data.company.websiteUrl ? (
                                            <a href={data.company.websiteUrl} target="_blank" rel="noopener noreferrer" className="modal-link">
                                                <i className="fa-solid fa-globe"></i> Ver sitio
                                            </a>
                                        ) : 'No disponible'}
                                    </p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Contacto</label>
                                    <p>
                                        <i className="fa-solid fa-envelope"></i> {data.company.contactEmail}
                                        {data.company.contactPhone && (
                                            <span style={{ marginLeft: '1rem' }}>
                                                <i className="fa-solid fa-phone"></i> {data.company.contactPhone}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Dirección</label>
                                    <p><i className="fa-solid fa-location-dot"></i> {data.company.address}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Sección: Supervisor */}
                    {data.supervisor && (
                        <>
                            <h4 className="section-title">Supervisor Responsable</h4>
                            <div className="info-grid box-style">
                                <div className="info-item">
                                    <label>Nombre</label>
                                    <p><i className="fa-solid fa-user-tie"></i> {data.supervisor.fullName}</p>
                                </div>
                                <div className="info-item">
                                    <label>Área Especialidad</label>
                                    <p>{data.supervisor.specialtyArea || 'General'}</p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Contacto Directo</label>
                                    <p>
                                        <i className="fa-solid fa-envelope"></i> {data.supervisor.email}
                                        {data.supervisor.phone && (
                                            <span style={{ marginLeft: '1rem' }}>
                                                <i className="fa-solid fa-phone"></i> {data.supervisor.phone}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-modal-action" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InternshipViewModal;

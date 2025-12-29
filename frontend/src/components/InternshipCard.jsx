import '../styles/internship.css';
import { format } from "@formkit/tempo";

const InternshipCard = ({ data, onEdit, onDelete, onView, onApply, userRole, myApplications = [], hasApprovedApplication = false }) => {
    const { id, title, description, company, supervisor, occupiedSlots, totalSlots, specialtyArea, applicationDeadline } = data;
    const deadlineDate = applicationDeadline ? new Date(applicationDeadline) : null;
    const isValidDeadline = deadlineDate instanceof Date && !Number.isNaN(deadlineDate?.getTime());
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const isExpired = isValidDeadline ? deadlineDate < startOfToday : false;
    const isFull = occupiedSlots >= totalSlots;

    // Check application status for this specific internship
    const myApplication = myApplications.find(app => (app.internshipId === id || app.internship?.id === id));
    const applicationStatus = myApplication?.status || 'none';
    const isPending = applicationStatus.toLowerCase() === 'pending' || applicationStatus.toLowerCase() === 'pendiente';
    const isApproved = applicationStatus.toLowerCase() === 'approved' || applicationStatus.toLowerCase() === 'aceptada' || applicationStatus.toLowerCase() === 'accepted';
    const isRejected = applicationStatus.toLowerCase() === 'rejected' || applicationStatus.toLowerCase() === 'rechazada';

    // Determine if button should be disabled
    // Disabled if:
    // 1. User has an approved application anywhere (Global disable)
    // 2. User has a pending application for THIS internship
    // 3. Internship is expired or full (already handled, but good to note)
    const isActionDisabled = hasApprovedApplication || isPending;

    // Determine button text
    let buttonText = "Postular";
    let buttonIcon = "fa-paper-plane";

    if (isPending) {
        buttonText = "Pendiente";
        buttonIcon = "fa-clock";
    } else if (isApproved) { // Should not happen on this card if approved elsewhere, but for completeness
        buttonText = "Aceptado";
        buttonIcon = "fa-check";
    } else if (hasApprovedApplication) {
        buttonText = "No Disponible"; // Or just keep "Postular" but disabled
    }

    let deadlineLabel = 'Sin fecha';
    if (isValidDeadline) {
        try {
            deadlineLabel = format(deadlineDate, "short");
        } catch {
            deadlineLabel = deadlineDate.toLocaleDateString();
        }
    }

    return (
        <div className={`internship-card ${isExpired ? 'expired' : ''}`}>
            <div className="card-header" style={{ position: 'relative' }}>
                <h3>{title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="company-tag">{company?.name || 'Empresa Desconocida'}</span>
                    {isExpired && (
                        <span className="expired-badge" style={{
                            backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.6rem',
                            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #fecaca'
                        }}>VENCIDA</span>
                    )}
                    {isFull && (
                        <span className="full-badge" style={{
                            backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem',
                            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #fcd34d'
                        }}>LLENA</span>
                    )}
                </div>
            </div>

            <div className="card-body">
                <p className="description">{description}</p>
                <div className="card-details">
                    <div className="detail-item">
                        <i className="fa-solid fa-users"></i>
                        <span style={{ color: isFull ? '#ef4444' : 'inherit', fontWeight: isFull ? '600' : 'normal' }}>
                            {occupiedSlots || 0} / {totalSlots || 0} Cupos Ocupados
                        </span>
                    </div>
                    {/* ... other details ... */}
                    <div className="detail-item">
                        <i className="fa-solid fa-briefcase"></i>
                        <span>{specialtyArea || 'General'}</span>
                    </div>
                    {supervisor && (
                        <div className="detail-item">
                            <i className="fa-solid fa-user-tie"></i>
                            <span>{supervisor.fullName}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    <i className="fa-regular fa-calendar"></i>
                    <span>{deadlineLabel}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <button className="intern-btn-view" title="Ver Detalle" onClick={() => onView(data)}>
                        <i className="fa-solid fa-eye"></i>
                    </button>

                    {userRole === 'administrador' ? (
                        <>
                            <button onClick={() => onEdit(data)} className="intern-btn-edit" title="Editar">
                                <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onClick={() => onDelete(data.id)} className="intern-btn-delete" title="Eliminar">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </>
                    ) : (
                        !isExpired && !isFull && (
                            <button
                                className={`btn-apply ${isActionDisabled ? 'disabled' : ''}`}
                                onClick={() => onApply(data)}
                                disabled={isActionDisabled}
                                style={{
                                    opacity: isActionDisabled ? 0.6 : 1,
                                    cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                                    backgroundColor: isPending ? '#f59e0b' : (hasApprovedApplication ? '#9ca3af' : '')
                                }}
                            >
                                <i className={`fa-solid ${buttonIcon}`}></i>
                                {buttonText}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default InternshipCard;

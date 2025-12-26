import '@styles/internship.css';
import { format } from "@formkit/tempo";

const InternshipCard = ({ data, onEdit, onDelete, onView, onApply, userRole }) => {
    const { id, title, description, company, supervisor, occupiedSlots, totalSlots, specialtyArea, applicationDeadline } = data;

    const isExpired = applicationDeadline ? new Date(applicationDeadline) < new Date().setHours(0, 0, 0, 0) : false;
    const isFull = occupiedSlots >= totalSlots;

    return (
        <div className={`internship-card ${isExpired ? 'expired' : ''}`}>
            {/* ... header ... */}
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
                    <span>{applicationDeadline ? format(applicationDeadline, "short") : 'Sin fecha'}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <button className="btn-view" title="Ver Detalle" onClick={() => onView(data)}>
                        <i className="fa-solid fa-eye"></i>
                    </button>

                    {userRole === 'administrador' ? (
                        <>
                            <button onClick={() => onEdit(data)} className="btn-edit" title="Editar">
                                <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onClick={() => onDelete(data.id)} className="btn-delete" title="Eliminar">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </>
                    ) : (
                        !isExpired && !isFull && (
                            <button className="btn-apply" onClick={() => onApply(data)}>
                                <i className="fa-solid fa-paper-plane"></i>
                                Postular
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default InternshipCard;

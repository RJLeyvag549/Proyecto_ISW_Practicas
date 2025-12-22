import '@styles/internship.css';

const InternshipCard = ({ data, onEdit, onDelete }) => {
    const { title, description, company, supervisor, availableSlots, specialtyArea, deadline } = data;

    return (
        <div className="internship-card">
            <div className="card-header">
                <h3>{title}</h3>
                <span className="company-tag">{company?.name || 'Empresa Desconocida'}</span>
            </div>

            <div className="card-body">
                <p className="description">{description}</p>

                <div className="card-details">
                    <div className="detail-item">
                        <i className="fa-solid fa-users"></i>
                        <span>{availableSlots} Cupos</span>
                    </div>
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

            <div className="card-actions">
                <button className="btn-view" title="Ver Detalle" onClick={() => Swal.fire('Info', 'Funcionalidad de Ver Detalle pendiente.', 'info')}>
                    <i className="fa-solid fa-eye"></i>
                </button>
                <button onClick={() => onEdit(data)} className="btn-edit" title="Editar">
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={() => onDelete(data.id)} className="btn-delete" title="Eliminar">
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

export default InternshipCard;

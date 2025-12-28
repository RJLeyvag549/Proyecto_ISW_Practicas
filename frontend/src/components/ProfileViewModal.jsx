import '../styles/applications.css';

const ProfileViewModal = ({ student, profile, onClose }) => {
  if (!student) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <h2>Perfil del Estudiante</h2>
          <button className="app-btn-close" onClick={onClose} aria-label="Cerrar">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="app-modal-body">
          <div className="info-section">
            <h3><i className="fa-solid fa-id-card"></i> Datos de Usuario</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{student?.nombreCompleto || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>RUT:</label>
                <span>{student?.rut || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{student?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Rol:</label>
                <span>{student?.rol || 'estudiante'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3><i className="fa-solid fa-graduation-cap"></i> Perfil Académico</h3>

            {!profile ? (
              <p style={{ margin: 0 }}>No hay perfil académico registrado.</p>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Carrera:</label>
                  <span>{profile?.career || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Semestre:</label>
                  <span>{profile?.semester ?? 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Promedio (GPA):</label>
                  <span>{profile?.gpa ?? 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Perfil completo:</label>
                  <span>{profile?.profileCompleted ? 'Sí' : 'No'}</span>
                </div>

                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Biografía:</label>
                  <span>{profile?.bio || 'N/A'}</span>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Áreas de interés:</label>
                  <span>{profile?.areasOfInterest || 'N/A'}</span>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Conocimientos previos:</label>
                  <span>{profile?.previousKnowledge || 'N/A'}</span>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Comentarios adicionales:</label>
                  <span>{profile?.additionalComments || 'N/A'}</span>
                </div>

                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Disponibilidad:</label>
                  <span>{profile?.availableSchedule || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="info-section">
            <h3><i className="fa-solid fa-file"></i> Documentos del Perfil</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Currículum:</label>
                <span>{profile?.curriculum || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Carta de presentación:</label>
                <span>{profile?.coverLetter || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="app-modal-footer">
          <button className="app-btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;

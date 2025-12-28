import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { getMyProfile, changeMyPassword } from '@services/profile.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/popup.css';
import '@styles/profile.css';
import ProfileEditModal from '@components/ProfileEditModal.jsx';

const Perfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pwdForm, setPwdForm] = useState({ password: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMyProfile();
        if (mounted) setProfile(data);
      } catch (err) {
        if (mounted) setError(err?.message || 'Error al cargar el perfil');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const validatePasswordForm = () => {
    const { password, newPassword, confirmPassword } = pwdForm;
    const alnum = /^[a-zA-Z0-9]+$/;
    if (!password || !newPassword || !confirmPassword) return 'Completa todos los campos';
    if (newPassword !== confirmPassword) return 'La confirmación no coincide';
    if (newPassword.length < 8 || newPassword.length > 26) return 'La nueva contraseña debe tener entre 8 y 26 caracteres';
    if (!alnum.test(newPassword)) return 'La nueva contraseña solo puede contener letras y números';
    return null;
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    const msg = validatePasswordForm();
    if (msg) { showErrorAlert('Validación', msg); return; }
    try {
      setPwdLoading(true);
      await changeMyPassword(pwdForm.password, pwdForm.newPassword);
      showSuccessAlert('Listo', 'Tu contraseña se actualizó correctamente');
      setPwdForm({ password: '', newPassword: '', confirmPassword: '' });
      setShowPwdModal(false);
    } catch (err) {
      const message = err?.message || err?.error || 'No se pudo actualizar la contraseña';
      showErrorAlert('Error', message);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="profile-title">Mi Perfil</h1>
          <button className="app-btn-primary" onClick={() => setShowEditProfile(true)}>
            <i className="fa-solid fa-user-pen"></i> Editar perfil
          </button>
        </div>

        <section className="profile-section">
          <h2 className="profile-title" style={{ fontSize: '1.1rem' }}>Datos de Usuario</h2>
          <div className="profile-grid">
            <div>
              <span className="profile-label">Nombre:</span>
              <span className="profile-value">{user?.nombreCompleto || '-'}</span>
            </div>
            <div>
              <span className="profile-label">Correo:</span>
              <span className="profile-value">{user?.email || '-'}</span>
            </div>
            <div>
              <span className="profile-label">RUT:</span>
              <span className="profile-value">{user?.rut || '-'}</span>
            </div>
            <div>
              <span className="profile-label">Rol:</span>
              <span className="profile-value">{user?.rol || '-'}</span>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-title" style={{ fontSize: '1.1rem' }}>Perfil Académico</h2>
          {loading && <p>Cargando perfil...</p>}
          {error && <p className="profile-error">{error}</p>}
          {!loading && !error && (
            <div className="profile-grid">
              <div>
                <span className="profile-label">Carrera:</span>
                <span className="profile-value">{profile?.career || '-'}</span>
              </div>
              <div>
                <span className="profile-label">Semestre:</span>
                <span className="profile-value">{profile?.semester ?? '-'}</span>
              </div>
              <div>
                <span className="profile-label">Promedio (GPA):</span>
                <span className="profile-value">{profile?.gpa ?? '-'}</span>
              </div>
              <div>
                <span className="profile-label">Perfil Completo:</span>
                <span className="profile-value">{profile?.profileCompleted ? 'Sí' : 'No'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="profile-label">Biografía:</span>
                <span className="profile-value">{profile?.bio || '-'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="profile-label">Áreas de Interés:</span>
                <span className="profile-value">{profile?.areasOfInterest || '-'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="profile-label">Conocimientos Previos:</span>
                <span className="profile-value">{profile?.previousKnowledge || '-'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="profile-label">Comentarios:</span>
                <span className="profile-value">{profile?.additionalComments || '-'}</span>
              </div>
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2 className="profile-title" style={{ fontSize: '1.1rem' }}>Documentos Adjuntos</h2>
          {loading && <p>Cargando documentos...</p>}
          {!loading && !error && (
            <div>
              {profile?.curriculum ? (
                <div>
                  <span className="profile-label">Documentos subidos:</span>
                  <div className="profile-value">
                    {profile.curriculum.split(';').map((docPath, idx) => {
                      const fullFileName = docPath.split('/').pop();
                      const fileName = fullFileName.split('-').slice(2).join('-');
                      return (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                          <i className="fa-solid fa-file" style={{ marginRight: '8px', color: '#0066cc' }}></i>
                          {fileName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="profile-value">No hay documentos subidos</p>
              )}
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2 className="profile-title" style={{ fontSize: '1.1rem' }}>Seguridad</h2>
          <button className="app-btn-primary" onClick={() => setShowPwdModal(true)}>
            Cambiar contraseña
          </button>
        </section>
      </div>

      {showPwdModal && (
        <div className="bg" role="dialog" aria-modal="true" aria-labelledby="pwd-title">
          <div className="popup" style={{ padding: 24, height: 'auto', width: 600 }}>
            <button className='close' onClick={() => setShowPwdModal(false)} aria-label="Cerrar">×</button>
            <div className="form">
              <h1 id="pwd-title" className="title">Cambiar contraseña</h1>
              <form onSubmit={submitPasswordChange} style={{ marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 20px', marginBottom: 12 }}>
                  <div>
                    <label className="label" htmlFor="password">Contraseña actual</label>
                    <input id="password" type="password" className="input" value={pwdForm.password} onChange={(e) => setPwdForm(v => ({ ...v, password: e.target.value }))} autoComplete="current-password" required />
                  </div>
                  <div>
                    <label className="label" htmlFor="newPassword">Nueva contraseña</label>
                    <input id="newPassword" type="password" className="input" value={pwdForm.newPassword} onChange={(e) => setPwdForm(v => ({ ...v, newPassword: e.target.value }))} autoComplete="new-password" required />
                  </div>
                  <div>
                    <label className="label" htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                    <input id="confirmPassword" type="password" className="input" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm(v => ({ ...v, confirmPassword: e.target.value }))} autoComplete="new-password" required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="app-btn-primary" type="submit" disabled={pwdLoading}>
                    {pwdLoading ? 'Guardando...' : 'Actualizar contraseña'}
                  </button>
                  <button type="button" className="app-btn-secondary" onClick={() => setShowPwdModal(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditProfile && (
        <ProfileEditModal
          onClose={() => setShowEditProfile(false)}
          onSuccess={() => {
            setShowEditProfile(false);
            // refresh profile
            (async () => { const data = await getMyProfile(); setProfile(data); })();
          }}
        />
      )}
    </div>
  );
};

export default Perfil;

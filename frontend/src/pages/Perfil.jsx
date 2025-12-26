import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { getMyProfile, changeMyPassword } from '@services/profile.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/popup.css';

const Perfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pwdForm, setPwdForm] = useState({ password: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

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
    <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
      <div className="profile-card" style={{ width: '90%', maxWidth: 1100, background: '#fff', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: 24 }}>
        <h1 className="profile-title" style={{ margin: 0, marginBottom: 16, color: '#003366', fontSize: '1.8rem', fontWeight: 700 }}>Mi Perfil</h1>

        <section className="profile-section" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(16,24,40,0.08)' }}>
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: '1.1rem', color: '#0b2a45', fontWeight: 700 }}>Datos de Usuario</h2>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 20px' }}>
            <div>
              <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Nombre:</span>
              <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{user?.nombreCompleto || '-'}</span>
            </div>
            <div>
              <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Correo:</span>
              <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{user?.email || '-'}</span>
            </div>
            <div>
              <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>RUT:</span>
              <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{user?.rut || '-'}</span>
            </div>
            <div>
              <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Rol:</span>
              <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{user?.rol || '-'}</span>
            </div>
          </div>
        </section>

        <section className="profile-section" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(16,24,40,0.08)' }}>
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: '1.1rem', color: '#0b2a45', fontWeight: 700 }}>Perfil Académico</h2>
          {loading && <p>Cargando perfil...</p>}
          {error && <p style={{ color: '#ef4444' }}>{error}</p>}
          {!loading && !error && (
            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 20px' }}>
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Carrera:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.career || '-'}</span>
              </div>
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Semestre:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.semester ?? '-'}</span>
              </div>
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Promedio (GPA):</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.gpa ?? '-'}</span>
              </div>
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Perfil Completo:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.profileCompleted ? 'Sí' : 'No'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Biografía:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.bio || '-'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Áreas de Interés:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.areasOfInterest || '-'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Conocimientos Previos:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.previousKnowledge || '-'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Comentarios:</span>
                <span className="value" style={{ display: 'block', color: '#203040', fontWeight: 600 }}>{profile?.additionalComments || '-'}</span>
              </div>
            </div>
          )}
        </section>

        <section className="profile-section" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(16,24,40,0.08)' }}>
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: '1.1rem', color: '#0b2a45', fontWeight: 700 }}>Seguridad</h2>
          <button className="btn-primary" onClick={() => setShowPwdModal(true)} style={{ background: '#003366', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
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
                  <button className="btn-primary" type="submit" disabled={pwdLoading} style={{ background: '#003366', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                    {pwdLoading ? 'Guardando...' : 'Actualizar contraseña'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowPwdModal(false)} style={{ background: '#fff', color: '#203040', border: '1px solid rgba(16,24,40,0.15)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;

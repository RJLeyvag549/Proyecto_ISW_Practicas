import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile, uploadMyProfileDocument, deleteProfileDocuments } from '@services/profile.service.js';
import '@styles/profile.css';

export default function ProfileEditModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    bio: '',
    career: '',
    semester: '',
    gpa: '',
    availableSchedule: '',
    areasOfInterest: '',
    previousKnowledge: '',
    additionalComments: ''
  });

  const [docs, setDocs] = useState({
    curriculum: '',
    coverLetter: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileObjects, setFileObjects] = useState([]);
  const [existingDocs, setExistingDocs] = useState({
    curriculum: null,
    coverLetter: null
  });

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      setProfile(p);
      setForm({
        bio: p?.bio || '',
        career: p?.career || '',
        semester: p?.semester ?? '',
        gpa: p?.gpa ?? '',
        availableSchedule: p?.availableSchedule || '',
        areasOfInterest: p?.areasOfInterest || '',
        previousKnowledge: p?.previousKnowledge || '',
        additionalComments: p?.additionalComments || ''
      });
      setDocs({
        curriculum: p?.curriculum || '',
        coverLetter: p?.coverLetter || ''
      });
      setExistingDocs({
        curriculum: p?.curriculum || null,
        coverLetter: p?.coverLetter || null
      });
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDocsChange = (e) => {
    const { name, value } = e.target;
    setDocs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(f => f.name);
    setUploadedFiles([...uploadedFiles, ...fileNames]);
    setFileObjects([...fileObjects, ...files]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    setFileObjects(fileObjects.filter((_, i) => i !== index));
  };

  const handleRemoveExistingDoc = (docType) => {
    setExistingDocs(prev => ({ ...prev, [docType]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // client-side validation (mirror backend)
      const payload = { ...form };
      if (payload.semester === '') delete payload.semester; else payload.semester = Number(payload.semester);
      if (payload.gpa === '') delete payload.gpa; else payload.gpa = Number(payload.gpa);
      if (payload.semester !== undefined && (!Number.isInteger(payload.semester) || payload.semester < 1 || payload.semester > 12)) {
        throw new Error('El semestre debe ser un número entero entre 1 y 12');
      }
      if (payload.gpa !== undefined && (Number.isNaN(payload.gpa) || payload.gpa < 1.0 || payload.gpa > 7.0)) {
        throw new Error('El promedio (GPA) debe estar entre 1.0 y 7.0');
      }

      const resProfile = await updateMyProfile(payload);
      if (resProfile.error) throw new Error(resProfile.error);

      // Upload archivos reales con FormData
      if (fileObjects.length > 0) {
        await uploadMyProfileDocument(fileObjects);
      }

      // Eliminar documentos que fueron marcados para eliminar
      const docsToDelete = [];
      if (profile?.curriculum && !existingDocs.curriculum) {
        docsToDelete.push('curriculum');
      }
      if (profile?.coverLetter && !existingDocs.coverLetter) {
        docsToDelete.push('coverLetter');
      }
      
      if (docsToDelete.length > 0) {
        await deleteProfileDocuments(docsToDelete);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentName = (url) => {
    if (!url) return '';
    return url.split('/').pop();
  };

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal-content app-modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <h2>Editar Perfil</h2>
          <button className="app-btn-close" onClick={onClose}>
            <i className="fa-solid fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="app-modal-body profile-edit-body">
            {error && (
              <div className="app-error-message">
                <i className="fa-solid fa-exclamation-triangle" />
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="app-form-group">
                <label>Carrera</label>
                <input name="career" value={form.career} onChange={handleChange} />
              </div>
              <div className="app-form-group">
                <label>Semestre</label>
                <input name="semester" value={form.semester} onChange={handleChange} inputMode="numeric" />
                <small className="text-muted">Formato: entero 1-12 (opcional)</small>
              </div>
            </div>

            <div className="form-row">
              <div className="app-form-group">
                <label>Promedio (GPA)</label>
                <input name="gpa" value={form.gpa} onChange={handleChange} inputMode="decimal" />
                <small className="text-muted">Formato: 1.0 - 7.0 (opcional)</small>
              </div>
              <div className="app-form-group">
                <label>Disponibilidad Horaria</label>
                <input name="availableSchedule" value={form.availableSchedule} onChange={handleChange} />
                <small className="text-muted">Ej: L-V 09:00-18:00 (opcional)</small>
              </div>
            </div>

            <div className="app-form-group">
              <label>Biografía</label>
              <textarea name="bio" rows="3" value={form.bio} onChange={handleChange} />
            </div>

            <div className="app-form-group">
              <label>Áreas de Interés</label>
              <textarea name="areasOfInterest" rows="2" value={form.areasOfInterest} onChange={handleChange} />
            </div>

            <div className="app-form-group">
              <label>Conocimientos Previos</label>
              <textarea name="previousKnowledge" rows="3" value={form.previousKnowledge} onChange={handleChange} />
            </div>

            <div className="app-form-group">
              <label>Comentarios Adicionales</label>
              <textarea name="additionalComments" rows="2" value={form.additionalComments} onChange={handleChange} />
            </div>

            <h3 className="step-title">Documentos</h3>

            {/* Documentos existentes */}
            {(existingDocs.curriculum || existingDocs.coverLetter) && (
              <div className="app-form-group">
                <label>Documentos Subidos</label>
                <div className="file-list">
                  {existingDocs.curriculum && (
                    <div className="file-item">
                      <span>
                        <i className="fa-solid fa-file-pdf"></i> 
                        {getDocumentName(existingDocs.curriculum) || 'Currículum'}
                      </span>
                      <button
                        type="button"
                        className="app-btn-danger"
                        onClick={() => handleRemoveExistingDoc('curriculum')}
                        title="Eliminar currículum"
                      >
                        <i className="fa-solid fa-trash"></i> Quitar
                      </button>
                    </div>
                  )}
                  {existingDocs.coverLetter && (
                    <div className="file-item">
                      <span>
                        <i className="fa-solid fa-file-pdf"></i>
                        {getDocumentName(existingDocs.coverLetter) || 'Carta de Presentación'}
                      </span>
                      <button
                        type="button"
                        className="app-btn-danger"
                        onClick={() => handleRemoveExistingDoc('coverLetter')}
                        title="Eliminar carta de presentación"
                      >
                        <i className="fa-solid fa-trash"></i> Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="app-form-group">
              <label>Agregar/Actualizar Documentos</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <small className="text-muted">
                <strong>Documentos recomendados:</strong> Currículum Vitae (CV), Certificado de Alumno Regular, 
                Carta de Presentación, Concentración de Notas, Certificados de cursos o capacitaciones relevantes.
                <br />
                <strong>Formatos aceptados:</strong> PDF, DOC, DOCX, JPG, PNG (máximo 5 archivos, 5MB cada uno)
              </small>
              {uploadedFiles.length > 0 && (
                <div className="file-list">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="file-item">
                      <span><i className="fa-solid fa-file"></i> {file}</span>
                      <button
                        type="button"
                        className="app-btn-danger"
                        onClick={() => handleRemoveFile(idx)}
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
            <button type="submit" className="app-btn-primary" disabled={loading}>
              {loading ? (<><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</>) : (<><i className="fa-solid fa-save"></i> Guardar</>)}
            </button>
            <button type="button" className="app-btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

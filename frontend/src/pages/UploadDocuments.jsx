import { useState, useEffect } from 'react';
import { uploadDocument, getDocumentsByPractice } from '@services/document.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/documents.css';

export default function UploadDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [practiceApplicationId, setPracticeApplicationId] = useState('');
  const [formData, setFormData] = useState({
    type: 'informe_final',
    period: '',
    comments: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const documentTypes = [
    { value: 'informe_final', label: 'Informe Final' },
    { value: 'carta_evaluacion', label: 'Carta de Evaluación' },
    { value: 'bitacora', label: 'Bitácora' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showErrorAlert('Error', 'El archivo no debe superar los 10MB');
        e.target.value = '';
        return;
      }
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showErrorAlert('Error', 'Solo se permiten archivos PDF o Word');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showErrorAlert('Error', 'Debe seleccionar un archivo');
      return;
    }

    if (!practiceApplicationId) {
      showErrorAlert('Error', 'Debe ingresar el ID de la práctica');
      return;
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('practiceApplicationId', practiceApplicationId);
      uploadData.append('type', formData.type);
      uploadData.append('period', formData.period);
      uploadData.append('comments', formData.comments);

      const response = await uploadDocument(uploadData);
      
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Documento subido correctamente');
        // Limpiar formulario
        setSelectedFile(null);
        setFormData({
          type: 'informe_final',
          period: '',
          comments: ''
        });
        document.getElementById('fileInput').value = '';
        // Recargar documentos
        loadDocuments();
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      showErrorAlert('Error', error.message || 'No se pudo subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!practiceApplicationId) return;
    
    try {
      setLoading(true);
      const response = await getDocumentsByPractice(practiceApplicationId);
      if (response.status === 'Success') {
        setDocuments(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (practiceApplicationId) {
      loadDocuments();
    }
  }, [practiceApplicationId]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', class: 'status-pending' },
      approved: { label: 'Aprobado', class: 'status-approved' },
      rejected: { label: 'Rechazado', class: 'status-rejected' }
    };
    const statusInfo = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getDocumentTypeLabel = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>Subir Documentos Finales de Práctica</h1>
        <p className="subtitle">Sube los documentos requeridos para finalizar tu práctica profesional</p>
      </div>

      <div className="documents-content">
        {/* Formulario de subida */}
        <div className="upload-section">
          <h2>Nuevo Documento</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="practiceApplicationId">ID de Práctica *</label>
              <input
                type="number"
                id="practiceApplicationId"
                value={practiceApplicationId}
                onChange={(e) => setPracticeApplicationId(e.target.value)}
                placeholder="Ej: 1"
                required
              />
              <small>Ingresa el ID de tu solicitud de práctica</small>
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipo de Documento *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {documentTypes.map(docType => (
                  <option key={docType.value} value={docType.value}>
                    {docType.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="period">Período</label>
              <input
                type="text"
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                placeholder="Ej: 2024-1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comments">Comentarios</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="Agrega comentarios adicionales (opcional)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fileInput">Archivo *</label>
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
              />
              <small>Formatos permitidos: PDF, Word. Tamaño máximo: 10MB</small>
              {selectedFile && (
                <div className="file-preview">
                  <i className="fas fa-file-alt"></i>
                  <span>{selectedFile.name}</span>
                  <span className="file-size">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Subiendo...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Subir Documento
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de documentos subidos */}
        <div className="documents-list-section">
          <h2>Documentos Subidos</h2>
          {loading && !documents.length ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <p>No hay documentos subidos</p>
              <small>Los documentos que subas aparecerán aquí</small>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className="document-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="document-info">
                    <h3>{doc.filename}</h3>
                    <p className="document-type">{getDocumentTypeLabel(doc.type)}</p>
                    {doc.period && <p className="document-period">Período: {doc.period}</p>}
                    {doc.comments && <p className="document-comments">{doc.comments}</p>}
                    <p className="document-date">
                      Subido: {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                    </p>
                    {doc.grade && (
                      <p className="document-grade">
                        <strong>Calificación:</strong> {doc.grade}
                      </p>
                    )}
                  </div>
                  <div className="document-status">
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

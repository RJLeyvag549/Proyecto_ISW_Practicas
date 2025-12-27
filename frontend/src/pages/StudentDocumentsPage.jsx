import { useState, useEffect, useCallback } from 'react';
import api from '../services/root.service';
import Swal from 'sweetalert2';
import '../styles/studentDocuments.css';

const StudentDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewData, setReviewData] = useState({ status: 'pending', grade: null, weight: 0, comments: '' });
  const [studentAverages, setStudentAverages] = useState({});

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const [docsResponse, avgResponse] = await Promise.all([
        api.get('/documents'),
        api.get('/documents/averages')
      ]);
      setDocuments(docsResponse.data?.data || []);
      setStudentAverages(avgResponse.data?.data || {});
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los documentos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const groupedByStudent = documents.reduce((acc, doc) => {
    const student = doc.uploader?.nombreCompleto || `Usuario ${doc.uploadedBy ?? 'desconocido'}`;
    if (!acc[student]) acc[student] = [];
    acc[student].push(doc);
    return acc;
  }, {});

  const statistics = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Eliminar documento',
      text: '¿Está seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6cc4c2',
      cancelButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/documents/${id}`);
        setDocuments(documents.filter(d => d.id !== id));
        Swal.fire('Eliminado', 'Documento eliminado', 'success');
      } catch {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      Swal.fire('Error', 'No se pudo descargar', 'error');
    }
  };

  const handleReview = (doc) => {
    setSelectedDoc(doc);
    setReviewData({ 
      status: doc.status || 'pending', 
      grade: doc.grade || null, 
      weight: doc.weight || 0,
      comments: doc.comments || ''
    });
    setShowModal(true);
  };

  const handleSaveReview = async () => {
    if (!selectedDoc) return;

    try {
      await api.patch(`/documents/${selectedDoc.id}/status`, {
        status: reviewData.status,
        grade: reviewData.grade ? parseFloat(reviewData.grade) : null,
        weight: reviewData.weight ? parseFloat(reviewData.weight) : 0,
        comments: reviewData.comments || '',
      });

      Swal.fire('Éxito', 'Documento actualizado', 'success');
      setShowModal(false);
      fetchDocuments();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return statusMap[status] || 'status-pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#f59e0b';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando documentos...</p>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="header">
        <h2>Documentos de Estudiantes</h2>
      </div>

      <div className="statistics">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{statistics.total}</span>
        </div>
        <div className="stat-card stat-approved">
          <span className="stat-label">Aprobados</span>
          <span className="stat-value">{statistics.approved}</span>
        </div>
        <div className="stat-card stat-pending">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value">{statistics.pending}</span>
        </div>
        <div className="stat-card stat-rejected">
          <span className="stat-label">Rechazados</span>
          <span className="stat-value">{statistics.rejected}</span>
        </div>
      </div>

      {Object.entries(groupedByStudent).length === 0 ? (
        <div className="empty">No hay documentos</div>
      ) : (
        <div className="students-list">
          {Object.entries(groupedByStudent).map(([student, docs]) => {
            const studentId = docs[0]?.uploadedBy;
            const avgData = studentAverages[studentId];
            return (
            <div key={student} className="student-card">
              <div
                className="student-header"
                onClick={() =>
                  setExpandedStudent(expandedStudent === student ? null : student)
                }
              >
                <div className="student-info">
                  <span className="student-name">{student}</span>
                  {avgData && avgData.average !== null && (
                    <span className={`average-badge ${avgData.isComplete ? 'complete' : 'incomplete'}`}>
                      Promedio: {avgData.average} ({avgData.totalWeight}%)
                    </span>
                  )}
                </div>
                <span className="doc-count">{docs.length} documentos</span>
                <span className="toggle-icon">
                  {expandedStudent === student ? '▼' : '▶'}
                </span>
              </div>

              {expandedStudent === student && (
                <div className="documents-list">
                  {docs.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="doc-info">
                        <p className="doc-name">{doc.filename}</p>
                        <p className="doc-meta">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                        </p>
                        {doc.comments && (
                          <p className="doc-comments">
                            <strong>Comentarios:</strong> {doc.comments}
                          </p>
                        )}
                      </div>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          doc.status
                        )}`}
                        style={{ background: getStatusColor(doc.status) }}
                      >
                        {doc.status}
                      </span>
                      <span className="grade-badge">
                        {doc.grade ? `${doc.grade}` : '-'}
                      </span>
                      <span className="weight-badge">
                        {doc.weight ? `${doc.weight}%` : '0%'}
                      </span>
                      <div className="doc-actions">
                        <button
                          onClick={() => handleReview(doc)}
                          className="btn-icon"
                          title="Revisar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(doc.id, doc.filename)
                          }
                          className="btn-icon"
                          title="Descargar"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="btn-icon btn-danger"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}

      {showModal && selectedDoc && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Revisar Documento</h3>
            <div className="modal-content">
              <div className="doc-details">
                <p><strong>Archivo:</strong> {selectedDoc.filename}</p>
                <p><strong>Estudiante:</strong> {selectedDoc.uploader?.nombreCompleto || selectedDoc.uploadedBy}</p>
                <p><strong>Fecha:</strong> {selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <label>Estado</label>
                <select
                  value={reviewData.status}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, status: e.target.value })
                  }
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
              <div>
                <label>Calificación (1.0-7.0)</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  step="0.1"
                  value={reviewData.grade || ''}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, grade: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Porcentaje (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={reviewData.weight || 0}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, weight: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Comentarios</label>
                <textarea
                  rows="3"
                  placeholder="Agregar comentarios sobre la revisión..."
                  value={reviewData.comments || ''}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comments: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button onClick={handleSaveReview} className="btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentsPage;

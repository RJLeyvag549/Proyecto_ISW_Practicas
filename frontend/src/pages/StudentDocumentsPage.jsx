import { useState, useEffect, useCallback } from 'react';
import api from '../services/root.service';
import { closeApplication } from '../services/practiceApplication.service';
import Swal from 'sweetalert2';
import '../styles/studentDocuments.css';

const StudentDocumentsPage = () => {
  const [groupedStudents, setGroupedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewData, setReviewData] = useState({ status: 'pending', grade: null, weight: 0, comments: '' });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents/grouped');
      setGroupedStudents(response.data?.data || []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los documentos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const statistics = groupedStudents.reduce((acc, student) => {
    student.practices.forEach((p) => {
      p.documents.forEach((d) => {
        acc.total += 1;
        if (d.status === 'approved') acc.approved += 1;
        if (d.status === 'pending') acc.pending += 1;
        if (d.status === 'rejected') acc.rejected += 1;
      });
    });
    return acc;
  }, { total: 0, approved: 0, pending: 0, rejected: 0 });

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
        fetchDocuments();
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

  const handleClosePractice = async (practiceApplicationId, average) => {
    const result = await Swal.fire({
      title: 'Cerrar Práctica',
      html: `
        <p>¿Está seguro de cerrar esta práctica?</p>
        <p style="margin-top: 10px;"><strong>Promedio final: ${average}</strong></p>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Esta acción no se puede deshacer.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6cc4c2',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar práctica',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await closeApplication(practiceApplicationId);
      
      if (response.error) {
        Swal.fire('Error', response.error, 'error');
        return;
      }

      Swal.fire({
        title: '¡Práctica cerrada!',
        html: `
          <p>La práctica ha sido cerrada exitosamente.</p>
          <p style="margin-top: 10px;"><strong>Promedio final: ${response.data?.finalAverage || average}</strong></p>
          <p style="margin-top: 5px;"><strong>Resultado: ${response.data?.finalResult === 'approved' ? 'Aprobada' : 'Reprobada'}</strong></p>
        `,
        icon: 'success',
        confirmButtonColor: '#6cc4c2'
      });
      
      fetchDocuments();
    } catch (error) {
      console.error('Error al cerrar práctica:', error);
      Swal.fire('Error', 'No se pudo cerrar la práctica', 'error');
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

  const getDocumentTypeName = (type) => {
    const map = {
      PROGRESS_REPORT: 'Informe de Avance',
      FINAL_REPORT: 'Informe Final',
      PERFORMANCE_EVALUATION: 'Desempeño',
    };
    return map[type] || type || 'Sin tipo';
  };

  const getDocumentTypeColor = (type) => {
    const map = {
      PROGRESS_REPORT: '#3b82f6',
      FINAL_REPORT: '#8b5cf6',
      PERFORMANCE_EVALUATION: '#ec4899',
    };
    return map[type] || '#6b7280';
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
        <h2>Documentos Práctica</h2>
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

      {groupedStudents.length === 0 ? (
        <div className="empty">No hay documentos</div>
      ) : (
        <div className="students-list">
          {groupedStudents.map((student) => {
            return (
            <div key={student.studentId} className="student-card">
              <div
                className="student-header"
                onClick={() =>
                  setExpandedStudent(expandedStudent === student.studentId ? null : student.studentId)
                }
              >
                <div className="student-info">
                  <span className="student-name">{student.studentName}</span>
                </div>
                <span className="doc-count">{student.totalDocuments} documentos</span>
                <span className="toggle-icon">
                  {expandedStudent === student.studentId ? '▼' : '▶'}
                </span>
              </div>

              {expandedStudent === student.studentId && (
                <div className="documents-list">
                  {student.practices.map((practice) => (
                    <div key={`${practice.practiceApplicationId}-${practice.practiceLabel}`} className="practice-section">
                      <div className="practice-header">
                        <span className="practice-title">{practice.practiceLabel}</span>
                        <div className="practice-meta">
                          <span className="practice-count">{practice.documents.length} documentos</span>
                          <span className={`average-badge ${practice?.average?.isComplete ? 'complete' : 'incomplete'}`}>
                            Promedio práctica: {practice?.average?.average ?? '-'} ({practice?.average?.totalWeight ?? 0}%)
                          </span>
                          {practice?.average?.isComplete && 
                           practice?.average?.totalWeight === 100 && 
                           practice.practiceApplicationId && (
                            <button
                              onClick={() => handleClosePractice(practice.practiceApplicationId, practice.average.average)}
                              className="btn-close-practice"
                              title="Cerrar práctica (peso total 100%)"
                            >
                              <i className="fa-solid fa-check-circle"></i> Cerrar Práctica
                            </button>
                          )}
                        </div>
                      </div>
                      {practice.documents.map((doc) => (
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
                            className="type-badge"
                            style={{ background: getDocumentTypeColor(doc.type) }}
                            title={doc.type}
                          >
                            {getDocumentTypeName(doc.type)}
                          </span>
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
                              className="btn-icon btn-review"
                              title="Revisar"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(doc.id, doc.filename)
                              }
                              className="btn-icon btn-download"
                              title="Descargar"
                            >
                              <i className="fa-solid fa-download"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="btn-icon btn-danger"
                              title="Eliminar"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
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
                <p><strong>Tipo:</strong> <span style={{ color: getDocumentTypeColor(selectedDoc.type), fontWeight: 'bold' }}>{getDocumentTypeName(selectedDoc.type)}</span></p>
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

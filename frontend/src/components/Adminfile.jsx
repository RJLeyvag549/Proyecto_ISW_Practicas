import { useEffect, useState, useCallback } from 'react';
import api from '../services/root.service';
import Swal from 'sweetalert2';
import '../styles/adminfile.css';

const Adminfile = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewData, setReviewData] = useState({ status: 'pending', grade: null });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch {
      Swal.fire('Error', 'No pudimos cargar los documentos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = filter === 'all' || doc.status === filter;
    const matchesSearch =
      doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReview = (doc) => {
    setSelectedDoc(doc);
    setReviewData({ status: doc.status || 'pending', grade: doc.grade || null });
    setShowModal(true);
  };

  const handleSaveReview = async () => {
    if (!selectedDoc) return;

    try {
      await api.put(`/documents/${selectedDoc._id}`, {
        status: reviewData.status,
        grade: reviewData.grade ? parseFloat(reviewData.grade) : null,
      });

      Swal.fire('Éxito', 'Documento actualizado', 'success');
      setShowModal(false);
      fetchDocuments();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    }
  };

  const handleDelete = async (docId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6cc4c2',
      cancelButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/documents/${docId}`);
        Swal.fire('Eliminado', 'Documento eliminado', 'success');
        fetchDocuments();
      } catch {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.documentName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      Swal.fire('Error', 'No se pudo descargar', 'error');
    }
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
    <div className="adminfile-container">
      <div className="header">
        <h2>Gestionar Documentos de Estudiantes</h2>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Buscar por archivo o estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filters">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
            >
              {status === 'all' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="empty">No hay documentos</div>
      ) : (
        <table className="documents-table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Estudiante</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Calificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.documentName}</td>
                <td>{doc.uploadedBy}</td>
                <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ background: getStatusColor(doc.status) }}
                  >
                    {doc.status}
                  </span>
                </td>
                <td>{doc.grade || '-'}</td>
                <td>
                  <button
                    onClick={() => handleReview(doc)}
                    className="btn-icon"
                    title="Revisar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="btn-icon"
                    title="Descargar"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="btn-icon btn-danger"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Revisar Documento</h3>
            <div className="modal-content">
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
                <label>Calificación</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewData.grade || ''}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, grade: e.target.value })
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

export default Adminfile;

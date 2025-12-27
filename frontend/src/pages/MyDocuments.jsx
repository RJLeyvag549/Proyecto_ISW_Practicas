import { useState, useEffect, useCallback } from "react";
import api from "../services/root.service";
import Swal from "sweetalert2";
import "../styles/myDocuments.css";

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsResponse, avgResponse] = await Promise.all([
        api.get("/documents/my-documents"),
        api.get("/documents/my-average")
      ]);
      setDocuments(docsResponse.data?.data || []);
      setAverage(avgResponse.data?.data || null);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los documentos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (id, fileName) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      Swal.fire("Error", "No se pudo descargar el archivo", "error");
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected"
    };
    return statusMap[status] || "status-pending";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#10b981",
      rejected: "#ef4444"
    };
    return colors[status] || "#f59e0b";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado"
    };
    return texts[status] || status;
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
    <div className="my-documents-container">
      <div className="header">
        <h2>Mis Documentos</h2>
      </div>

      {average && average.average !== null && (
        <div className="average-card">
          <div className="average-header">
            <h3>Promedio de Práctica</h3>
            <span className={`average-value ${average.isComplete ? "complete" : "incomplete"}`}>
              {average.average}
            </span>
          </div>
          <div className="average-details">
            <p>
              <strong>Ponderación:</strong> {average.totalWeight}%
              {!average.isComplete && " (Faltan documentos por calificar)"}
            </p>
            {average.isComplete && (
              <p className="complete-message">✓ Todos los documentos calificados</p>
            )}
          </div>
        </div>
      )}

      <div className="documents-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{documents.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Aprobados</span>
          <span className="stat-value approved">{documents.filter(d => d.status === "approved").length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value pending">{documents.filter(d => d.status === "pending").length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Rechazados</span>
          <span className="stat-value rejected">{documents.filter(d => d.status === "rejected").length}</span>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No has subido documentos todavía</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-header">
                <h4 className="document-title">{doc.filename}</h4>
                <span
                  className={`status-badge ${getStatusBadgeClass(doc.status)}`}
                  style={{ background: getStatusColor(doc.status) }}
                >
                  {getStatusText(doc.status)}
                </span>
              </div>

              <div className="document-info">
                <div className="info-row">
                  <span className="info-label">Fecha:</span>
                  <span className="info-value">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{doc.type || "-"}</span>
                </div>

                {doc.period && (
                  <div className="info-row">
                    <span className="info-label">Período:</span>
                    <span className="info-value">{doc.period}</span>
                  </div>
                )}

                {doc.status === "approved" && (
                  <>
                    <div className="info-row grade-row">
                      <span className="info-label">Calificación:</span>
                      <span className="grade-value">{doc.grade || "-"}</span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Ponderación:</span>
                      <span className="weight-value">{doc.weight || 0}%</span>
                    </div>
                  </>
                )}

                {doc.comments && (
                  <div className="feedback-section">
                    <span className="feedback-label">Retroalimentación:</span>
                    <p className="feedback-text">{doc.comments}</p>
                  </div>
                )}
              </div>

              <div className="document-actions">
                <button
                  onClick={() => handleDownload(doc.id, doc.filename)}
                  className="btn-download"
                >
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDocuments;

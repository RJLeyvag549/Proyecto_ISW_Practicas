import { useState, useEffect, useCallback } from "react";
import api from "../services/root.service";
import Swal from "sweetalert2";
import "../styles/myDocuments.css";

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("PROGRESS_REPORT");
  const [period, setPeriod] = useState("");
  const [practiceId, setPracticeId] = useState("");

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

  useEffect(() => {
    // Cargar prácticas del estudiante para selección
    (async () => {
      try {
        const res = await api.get("/practiceApplications/my");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        console.log("Prácticas del estudiante:", list);
        // Solo prácticas aceptadas y no cerradas
        const enabled = list.filter((a) => a.status === "accepted" && !a.isClosed);
        console.log("Prácticas filtradas (aceptadas y no cerradas):", enabled);
        setApplications(enabled);
        if (enabled.length > 0) {
          setPracticeId(String(enabled[0].id));
        }
      } catch (error) {
        console.error("Error cargando prácticas:", error);
        Swal.fire("Error", "No se pudieron cargar tus prácticas", "error");
        setApplications([]);
      }
    })();
  }, []);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire("Archivo requerido", "Selecciona un documento", "warning");
      return;
    }
    if (!practiceId) {
      Swal.fire("Práctica requerida", "Selecciona la práctica destino", "warning");
      return;
    }
    if (docType === "PROGRESS_REPORT" && !period.trim()) {
      Swal.fire("Período requerido", "Ingresa el período del informe de avance", "warning");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", docType);
      formData.append("practiceApplicationId", Number(practiceId));
      if (docType === "PROGRESS_REPORT") formData.append("period", period.trim());

      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Listo", "Documento subido exitosamente", "success");
      setFile(null);
      setPeriod("");
      // Refrescar datos
      fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message || "No se pudo subir el documento";
      Swal.fire("Error", msg, "error");
    } finally {
      setUploading(false);
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

      <div className="upload-card">
        <h3>Subir Documento</h3>
        <form className="upload-form" onSubmit={handleUpload}>
          <div className="form-row">
            <label>Práctica</label>
            <select
              value={practiceId}
              onChange={(e) => setPracticeId(e.target.value)}
              disabled={applications.length === 0 || uploading}
            >
              {applications.length === 0 ? (
                <option value="">No tienes prácticas aceptadas</option>
              ) : (
                <>
                  <option value="">Selecciona una práctica</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.id} - {a.internship?.title || a.internshipExternal?.companyName || "Práctica"}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-row">
            <label>Tipo de documento</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} disabled={uploading}>
              <option value="PROGRESS_REPORT">Informe de avance</option>
              <option value="FINAL_REPORT">Informe final</option>
              <option value="PERFORMANCE_EVALUATION">Desempeño</option>
            </select>
          </div>

          {docType === "PROGRESS_REPORT" && (
            <div className="form-row">
              <label>Período</label>
              <input
                type="text"
                placeholder="Ej: Semana 1-2, Mes 1, etc."
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={uploading}
              />
            </div>
          )}

          <div className="form-row">
            <label>Archivo</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-upload"
              disabled={uploading || applications.length === 0 || !practiceId}
            >
              {uploading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </form>
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

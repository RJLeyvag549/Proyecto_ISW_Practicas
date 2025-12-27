import { useState } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";
import "@styles/uploadDocuments.css";

const typeOptions = [
  { value: "PROGRESS_REPORT", label: "Informe de Progreso" },
  { value: "FINAL_REPORT", label: "Informe Final" },
  { value: "PERFORMANCE_EVALUATION", label: "Evaluación de Desempeño" },
];

const UploadDocuments = () => {
  const [practiceId, setPracticeId] = useState("");
  const [docType, setDocType] = useState("");
  const [period, setPeriod] = useState("");
  const [comments, setComments] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setPracticeId("");
    setDocType("");
    setPeriod("");
    setComments("");
    setFile(null);
    const input = document.getElementById("doc-file-input");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!practiceId || !docType || !file) {
      Swal.fire("Faltan datos", "Práctica, tipo de documento y archivo son obligatorios.", "warning");
      return;
    }

    if (docType === "PROGRESS_REPORT" && !period) {
      Swal.fire("Falta período", "El período es requerido para informes de progreso.", "warning");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Archivo muy grande", "El archivo no debe superar los 10MB.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("practiceApplicationId", practiceId);
    formData.append("type", docType);
    if (period) formData.append("period", period);
    if (comments) formData.append("comments", comments);
    formData.append("document", file);

    setUploading(true);
    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Éxito", "Documento subido correctamente.", "success");
      resetForm();
    } catch (error) {
      const msg = error?.response?.data?.message || "No se pudo subir el documento.";
      Swal.fire("Error", msg, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-docs-page">
      <div className="upload-hero">
        <h1>Subir Documentos de Práctica</h1>
        <p>Adjunta tus informes, bitácoras o evaluaciones para tu proceso de práctica.</p>
      </div>

      <div className="upload-card">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="practiceId">ID de Práctica *</label>
              <input
                id="practiceId"
                type="text"
                value={practiceId}
                onChange={(e) => setPracticeId(e.target.value)}
                placeholder="Ej: 123"
                required
              />
              <small>Usa el ID de tu postulación/práctica</small>
            </div>

            <div className="form-field">
              <label htmlFor="docType">Tipo de Documento *</label>
              <select
                id="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                required
              >
                <option value="">Selecciona</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <small>Ej: Informe de Progreso, Informe Final, Evaluación</small>
            </div>
          </div>

          {docType === "PROGRESS_REPORT" && (
            <div className="form-field">
              <label htmlFor="period">Período (requerido para informe de progreso)</label>
              <input
                id="period"
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ej: 2025-1"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="comments">Comentarios (opcional)</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Notas para el supervisor o revisores"
              rows="3"
            />
          </div>

          <div className="form-field">
            <label htmlFor="doc-file-input">Archivo *</label>
            <input
              id="doc-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <small>Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX. Máx 10MB.</small>
            {file && <p className="file-name">Seleccionado: {file.name}</p>}
          </div>

          <button type="submit" className="submit-btn" disabled={uploading}>
            {uploading ? "Subiendo..." : "Subir Documento"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocuments;

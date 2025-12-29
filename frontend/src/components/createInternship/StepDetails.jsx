import { useState } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";

const StepDetails = ({ onBack, onComplete, company, supervisor, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        totalSlots: initialData?.totalSlots || 1,
        specialtyArea: initialData?.specialtyArea || "",
        applicationDeadline: initialData?.applicationDeadline ? initialData?.applicationDeadline.split('T')[0] : ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // POST or PUT based on if we are editing (logic handled by parent or here, assuming Create for wizard flow first)
            // Route: /internships/companies/:companyId/supervisors/:supervisorId
            const url = `/internships/companies/${company.id}/supervisors/${supervisor.id}`;

            await api.post(url, formData);

            Swal.fire("Éxito", "Oferta de práctica creada correctamente", "success");
            onComplete(); // Navigate back to list
        } catch (error) {
            console.error("Error creating internship:", error);
            Swal.fire("Error", "No se pudo crear la oferta. Verifica los datos.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wizard-step">
            <h3>Paso 3: Detalles de la Oferta</h3>
            <div className="summary-banner">
                <p><i className="fa-solid fa-building"></i> <strong>Empresa:</strong> {company.name}</p>
                <p><i className="fa-solid fa-user-tie"></i> <strong>Supervisor:</strong> {supervisor.fullName}</p>
            </div>

            <form onSubmit={handleSubmit} className="details-form">
                <div className="form-section">
                    <h4><i className="fa-solid fa-file-lines"></i> Detalles de la Oferta</h4>

                    <div className="form-group">
                        <label>Título de la Oferta</label>
                        <input
                            type="text" required
                            placeholder="Ej: Desarrollador Fullstack Junior"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Área de Especialidad</label>
                        <input
                            type="text"
                            placeholder="Ej: Web, Datos, Redes..."
                            value={formData.specialtyArea}
                            onChange={e => setFormData({ ...formData, specialtyArea: e.target.value })}
                        />
                    </div>

                    <div className="form-cols-2" style={{ marginTop: '1.25rem' }}>
                        <div className="form-group">
                            <label>Descripción de la Práctica</label>
                            <textarea
                                required rows="8"
                                placeholder="Describe las tareas, requisitos y lo que ofreces..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="side-settings">
                            <div className="form-group">
                                <label>Cupos Totales</label>
                                <input
                                    type="number" min="1" required
                                    value={formData.totalSlots}
                                    onChange={e => setFormData({ ...formData, totalSlots: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '3rem' }}>
                                <label>Fecha Límite para Postular</label>
                                <input
                                    type="date" required
                                    value={formData.applicationDeadline}
                                    onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="wizard-actions">
                    <button type="button" className="btn-secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left"></i> Anterior
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Creando..." : (
                            <>
                                <i className="fa-solid fa-check"></i> Finalizar y Crear Oferta
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StepDetails;

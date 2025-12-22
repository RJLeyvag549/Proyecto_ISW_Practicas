import { useState } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";

const StepDetails = ({ onBack, onComplete, company, supervisor, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        availableSlots: initialData?.availableSlots || 1,
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
                <p><strong>Empresa:</strong> {company.name}</p>
                <p><strong>Supervisor:</strong> {supervisor.fullName}</p>
            </div>

            <form onSubmit={handleSubmit} className="details-form">
                <div className="form-group">
                    <label>Título de la Oferta</label>
                    <input
                        type="text" required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                        required rows="4"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Cupos Disponibles</label>
                        <input
                            type="number" min="1" required
                            value={formData.availableSlots}
                            onChange={e => setFormData({ ...formData, availableSlots: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Área de Especialidad</label>
                        <input
                            type="text"
                            value={formData.specialtyArea}
                            onChange={e => setFormData({ ...formData, specialtyArea: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Fecha Límite de Postulación</label>
                    <input
                        type="date" required
                        value={formData.applicationDeadline}
                        onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    />
                </div>

                <div className="wizard-actions">
                    <button type="button" className="btn-secondary" onClick={onBack}>Anterior</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Creando..." : "Finalizar y Crear Oferta"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StepDetails;

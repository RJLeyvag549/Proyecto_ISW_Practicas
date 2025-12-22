import { useState, useEffect } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";

const StepSupervisor = ({ onNext, onBack, companyId, initialData }) => {
    const [supervisors, setSupervisors] = useState([]);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState(initialData?.id || "");
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state for new supervisor
    const [newSupervisor, setNewSupervisor] = useState({
        fullName: "",
        email: "",
        phone: "",
        specialtyArea: ""
    });

    useEffect(() => {
        if (companyId) {
            fetchSupervisors();
        }
    }, [companyId]);

    const fetchSupervisors = async () => {
        try {
            const response = await api.get(`/supervisors/${companyId}/supervisors`);
            setSupervisors(response.data.data);
        } catch (error) {
            console.error("Error fetching supervisors:", error);
        }
    };

    const handleCreateSupervisor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // POST /supervisors/:companyId/supervisors
            const response = await api.post(`/supervisors/${companyId}/supervisors`, newSupervisor);
            const createdSupervisor = response.data.data;
            setSupervisors([...supervisors, createdSupervisor]);
            setSelectedSupervisorId(createdSupervisor.id);
            setIsCreating(false);
            Swal.fire("Éxito", "Supervisor creado correctamente", "success");
        } catch (error) {
            console.error("Error creating supervisor:", error);
            Swal.fire("Error", "No se pudo crear el supervisor", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        const supervisor = supervisors.find(s => s.id === Number(selectedSupervisorId));
        if (supervisor) {
            onNext(supervisor);
        } else {
            Swal.fire("Atención", "Selecciona un supervisor para continuar", "warning");
        }
    };

    return (
        <div className="wizard-step">
            <h3>Paso 2: Seleccionar Supervisor</h3>

            {!isCreating ? (
                <div className="select-mode">
                    <div className="form-group">
                        <label>Supervisor Existente (de la empresa seleccionada):</label>
                        <select
                            value={selectedSupervisorId}
                            onChange={(e) => setSelectedSupervisorId(e.target.value)}
                            className="form-select"
                        >
                            <option value="">-- Selecciona un supervisor --</option>
                            {supervisors.map(sup => (
                                <option key={sup.id} value={sup.id}>
                                    {sup.fullName} ({sup.email})
                                </option>
                            ))}
                        </select>
                        {supervisors.length === 0 && <p className="hint">No hay supervisores registrados para esta empresa.</p>}
                    </div>

                    <div className="divider">O</div>

                    <button
                        className="btn-create-secondary"
                        onClick={() => setIsCreating(true)}
                    >
                        + Crear Nuevo Supervisor
                    </button>
                </div>
            ) : (
                <form onSubmit={handleCreateSupervisor} className="create-form">
                    <h4>Nuevo Supervisor</h4>
                    <input
                        type="text" placeholder="Nombre Completo" required
                        value={newSupervisor.fullName}
                        onChange={e => setNewSupervisor({ ...newSupervisor, fullName: e.target.value })}
                    />
                    <input
                        type="email" placeholder="Email" required
                        value={newSupervisor.email}
                        onChange={e => setNewSupervisor({ ...newSupervisor, email: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Teléfono"
                        value={newSupervisor.phone}
                        onChange={e => setNewSupervisor({ ...newSupervisor, phone: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Área de Especialidad"
                        value={newSupervisor.specialtyArea}
                        onChange={e => setNewSupervisor({ ...newSupervisor, specialtyArea: e.target.value })}
                    />

                    <div className="form-actions">
                        <button type="button" onClick={() => setIsCreating(false)}>Cancelar</button>
                        <button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Supervisor"}
                        </button>
                    </div>
                </form>
            )}

            <div className="wizard-actions">
                <button className="btn-secondary" onClick={onBack}>Anterior</button>
                <button className="btn-primary" onClick={handleNext}>Siguiente</button>
            </div>
        </div>
    );
};

export default StepSupervisor;

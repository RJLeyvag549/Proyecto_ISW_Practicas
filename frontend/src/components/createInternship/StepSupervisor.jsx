import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { updateSupervisor, deleteSupervisor, getSupervisorsByCompany, createSupervisor } from "../../services/supervisor.service.js";

const StepSupervisor = ({ onNext, onBack, companyId, initialData }) => {
    const [supervisors, setSupervisors] = useState([]);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState(initialData?.id || "");
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state for supervisor
    const [supervisorForm, setSupervisorForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        specialtyArea: ""
    });

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };


    useEffect(() => {
        if (companyId) {
            fetchSupervisors();
        }
    }, [companyId]);

    const fetchSupervisors = async () => {
        try {
            const data = await getSupervisorsByCompany(companyId);
            if (Array.isArray(data)) {
                setSupervisors(data);
            } else {
                console.error("Error fetching supervisors:", data);
                setSupervisors([]);
            }
        } catch (error) {
            console.error("Error fetching supervisors:", error);
            setSupervisors([]);
        }
    };

    const handleSaveSupervisor = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validarEmail(supervisorForm.email)) {
            Swal.fire("Error", "El correo electrónico del supervisor no es válido", "error");
            setLoading(false);
            return;
        }

        if (!companyId) {
            Swal.fire("Error", "ID de empresa no encontrado. Por favor, vuelve al paso anterior.", "error");
            setLoading(false);
            return;
        }

        const payload = {
            fullName: supervisorForm.fullName.trim(),
            email: supervisorForm.email.trim(),
            phone: supervisorForm.phone?.trim() || "",
            specialtyArea: supervisorForm.specialtyArea?.trim() || ""
        };

        try {
            if (isEditing) {
                await updateSupervisor(companyId, selectedSupervisorId, payload);
                Swal.fire("Éxito", "Supervisor actualizado correctamente", "success");
                await fetchSupervisors();
            } else {
                const response = await createSupervisor(companyId, payload);
                const createdSupervisor = response.data;

                if (createdSupervisor && createdSupervisor.id) {
                    await fetchSupervisors();
                    setSelectedSupervisorId(createdSupervisor.id);
                    Swal.fire("Éxito", "Supervisor creado correctamente", "success");
                } else {
                    throw new Error("Respuesta inválida del servidor");
                }
            }
            setIsCreating(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving supervisor:", error);
            const responseData = error.response?.data;
            const message = responseData?.details
                ? `${responseData.message}: ${JSON.stringify(responseData.details)}`
                : (responseData?.message || "No se pudo guardar el supervisor");
            Swal.fire("Error", message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supervisor) => {
        setSupervisorForm({
            fullName: supervisor.fullName,
            email: supervisor.email,
            phone: supervisor.phone || "",
            specialtyArea: supervisor.specialtyArea || ""
        });
        setSelectedSupervisorId(supervisor.id);
        setIsEditing(true);
        setIsCreating(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deleteSupervisor(companyId, id);
                setSupervisors(supervisors.filter(s => s.id !== id));
                if (selectedSupervisorId === id) setSelectedSupervisorId("");
                Swal.fire("Eliminado", "El supervisor ha sido eliminado.", "success");
            } catch (error) {
                console.error("Error deleting supervisor:", error);

                // Backend hardcodes 404 for any service error, including conflicts
                const responseData = error.response?.data;
                const isConflict = error.response?.status === 404 || error.response?.status === 400 || error.response?.status === 409;

                if (isConflict) {
                    Swal.fire({
                        title: "No se puede eliminar",
                        text: "Este supervisor está asignado a ofertas de práctica existentes. Por seguridad, el sistema no permite borrarlo para no perder el historial.",
                        icon: "error"
                    });
                } else {
                    Swal.fire("Error", "No se pudo eliminar el supervisor.", "error");
                }
            }
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

    const resetForm = () => {
        setSupervisorForm({
            fullName: "",
            email: "",
            phone: "",
            specialtyArea: ""
        });
        setIsCreating(false);
        setIsEditing(false);
    };

    return (
        <div className="wizard-step">
            <h3>Paso 2: Seleccionar Supervisor</h3>

            {!isCreating ? (
                <div className="select-mode">
                    <div className="selection-list">
                        {supervisors.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#64748b" }}>No hay supervisores para esta empresa.</p>
                        ) : (
                            supervisors.map(sup => (
                                <div
                                    key={sup.id}
                                    className={`selection-row ${selectedSupervisorId === sup.id ? "selected" : ""}`}
                                    onClick={() => setSelectedSupervisorId(sup.id)}
                                >
                                    <div className="row-info">
                                        <strong>{sup.fullName}</strong>
                                        <span>{sup.email}</span>
                                    </div>
                                    <div className="row-actions">
                                        <button
                                            className="btn-icon"
                                            title="Editar"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(sup); }}
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            title="Eliminar"
                                            onClick={(e) => handleDelete(e, sup.id)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="divider">O</div>

                    <button
                        className="btn-create-secondary"
                        onClick={() => setIsCreating(true)}
                    >
                        <i className="fa-solid fa-plus"></i> Registrar Nuevo Supervisor
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSaveSupervisor} className="create-form">
                    <h4>{isEditing ? "Editar Supervisor" : "Nuevo Supervisor"}</h4>
                    <div className="form-grid">
                        <input
                            type="text" placeholder="Nombre Completo" required
                            value={supervisorForm.fullName}
                            onChange={e => setSupervisorForm({ ...supervisorForm, fullName: e.target.value })}
                        />
                        <input
                            type="email" placeholder="Email" required
                            value={supervisorForm.email}
                            onChange={e => setSupervisorForm({ ...supervisorForm, email: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Teléfono"
                            value={supervisorForm.phone}
                            onChange={e => setSupervisorForm({ ...supervisorForm, phone: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Área de Especialidad"
                            value={supervisorForm.specialtyArea}
                            onChange={e => setSupervisorForm({ ...supervisorForm, specialtyArea: e.target.value })}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary-outline" onClick={resetForm}>
                            <i className="fa-solid fa-xmark"></i> Cancelar
                        </button>
                        <button type="submit" className="btn-primary-compact" disabled={loading}>
                            {loading ? "Guardando..." : (
                                <>
                                    <i className="fa-solid fa-check"></i> {isEditing ? "Actualizar Supervisor" : "Guardar Supervisor"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            <div className="wizard-actions">
                <button className="btn-secondary" onClick={onBack}><i className="fa-solid fa-arrow-left"></i> Anterior</button>
                <button className="btn-primary" onClick={handleNext}>Siguiente <i className="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    );
};

export default StepSupervisor;

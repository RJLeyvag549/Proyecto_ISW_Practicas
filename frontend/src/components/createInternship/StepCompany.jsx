import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from "../../services/company.service.js";

const StepCompany = ({ onNext, initialData }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(initialData?.id || "");
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state for company
    const [companyForm, setCompanyForm] = useState({
        name: "",
        industry: "",
        address: "",
        contactEmail: "",
        contactPhone: "",
        websiteUrl: ""
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await getAllCompanies();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    const handleSaveCompany = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: companyForm.name.trim(),
            industry: companyForm.industry.trim(),
            address: companyForm.address.trim(),
            contactEmail: companyForm.contactEmail.trim(),
            contactPhone: companyForm.contactPhone?.trim() || "",
            websiteUrl: companyForm.websiteUrl?.trim() || ""
        };

        try {
            if (isEditing) {
                await updateCompany(selectedCompanyId, payload);
                Swal.fire("Éxito", "Empresa actualizada correctamente", "success");
                await fetchCompanies();
            } else {
                const response = await createCompany(payload);
                const createdCompany = response.data;

                if (createdCompany && createdCompany.id) {
                    await fetchCompanies(); // Refresh to get relations if any
                    setSelectedCompanyId(createdCompany.id);
                    Swal.fire("Éxito", "Empresa creada correctamente", "success");
                } else {
                    throw new Error("Respuesta inválida del servidor");
                }
            }
            setIsCreating(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving company:", error);
            const responseData = error.response?.data;
            const message = responseData?.details
                ? `${responseData.message}: ${JSON.stringify(responseData.details)}`
                : (responseData?.message || "No se pudo guardar la empresa");
            Swal.fire("Error", message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (company) => {
        setCompanyForm({
            name: company.name,
            industry: company.industry,
            address: company.address,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone || "",
            websiteUrl: company.websiteUrl || ""
        });
        setSelectedCompanyId(company.id);
        setIsEditing(true);
        setIsCreating(true); // Re-use create form UI
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
                await deleteCompany(id);
                setCompanies(companies.filter(c => c.id !== id));
                if (selectedCompanyId === id) setSelectedCompanyId("");
                Swal.fire("Eliminado", "La empresa ha sido eliminada.", "success");
            } catch (error) {
                console.error("Error deleting company:", error);
                Swal.fire("Error", "No se pudo eliminar la empresa. Es posible que tenga ofertas asociadas.", "error");
            }
        }
    };

    const handleNext = () => {
        const company = companies.find(c => c.id === Number(selectedCompanyId));
        if (company) {
            onNext(company);
        } else {
            Swal.fire("Atención", "Selecciona una empresa para continuar", "warning");
        }
    };

    const resetForm = () => {
        setCompanyForm({
            name: "",
            industry: "",
            address: "",
            contactEmail: "",
            contactPhone: "",
            websiteUrl: ""
        });
        setIsCreating(false);
        setIsEditing(false);
    };

    return (
        <div className="wizard-step">
            <h3>Paso 1: Seleccionar Empresa</h3>

            {!isCreating ? (
                <div className="select-mode">
                    <div className="selection-list">
                        {companies.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#64748b" }}>Cargando empresas...</p>
                        ) : (
                            companies.map(company => {
                                const hasInternships = company.internships?.length > 0;
                                return (
                                    <div
                                        key={company.id}
                                        className={`selection-row ${selectedCompanyId === company.id ? "selected" : ""}`}
                                        onClick={() => setSelectedCompanyId(company.id)}
                                    >
                                        <div className="row-info">
                                            <strong>{company.name}</strong>
                                            <span>{company.contactEmail}</span>
                                        </div>
                                        <div className="row-actions">
                                            <button
                                                className="btn-icon"
                                                title="Editar"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(company); }}
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button
                                                className={`btn-icon delete ${hasInternships ? "locked" : ""}`}
                                                title={hasInternships ? "No se puede eliminar: tiene ofertas asociadas" : "Eliminar"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (hasInternships) {
                                                        Swal.fire("Atención", "No puedes eliminar esta empresa porque tiene ofertas de práctica asociadas.", "warning");
                                                    } else {
                                                        handleDelete(e, company.id);
                                                    }
                                                }}
                                            >
                                                <i className={`fa-solid ${hasInternships ? "fa-lock" : "fa-trash"}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="divider">O</div>

                    <button
                        className="btn-create-secondary"
                        onClick={() => setIsCreating(true)}
                    >
                        <i className="fa-solid fa-plus"></i> Registrar Nueva Empresa
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSaveCompany} className="create-form">
                    <h4>{isEditing ? "Editar Empresa" : "Nueva Empresa"}</h4>
                    <div className="form-grid">
                        <input
                            type="text" placeholder="Nombre" required
                            value={companyForm.name}
                            onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Industria" required
                            value={companyForm.industry}
                            onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Dirección" required
                            value={companyForm.address}
                            onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                        />
                        <input
                            type="email" placeholder="Email de Contacto" required
                            value={companyForm.contactEmail}
                            onChange={e => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Teléfono"
                            value={companyForm.contactPhone}
                            onChange={e => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Sitio Web"
                            value={companyForm.websiteUrl}
                            onChange={e => setCompanyForm({ ...companyForm, websiteUrl: e.target.value })}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary-outline" onClick={resetForm}>
                            <i className="fa-solid fa-xmark"></i> Cancelar
                        </button>
                        <button type="submit" className="btn-primary-compact" disabled={loading}>
                            {loading ? "Guardando..." : (
                                <>
                                    <i className="fa-solid fa-check"></i> {isEditing ? "Actualizar Empresa" : "Guardar Empresa"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            <div className="wizard-actions">
                <button className="btn-secondary" disabled>Anterior</button>
                <button className="btn-primary" onClick={handleNext}>Siguiente <i className="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    );
};

export default StepCompany;

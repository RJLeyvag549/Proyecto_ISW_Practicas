import { useState, useEffect } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";

const StepCompany = ({ onNext, initialData }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(initialData?.id || "");
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state for new company
    const [newCompany, setNewCompany] = useState({
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
            const response = await api.get("/companies");
            setCompanies(response.data.data);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post("/companies", newCompany);
            const createdCompany = response.data.data;
            setCompanies([...companies, createdCompany]);
            setSelectedCompanyId(createdCompany.id);
            setIsCreating(false);
            Swal.fire("Éxito", "Empresa creada correctamente", "success");
        } catch (error) {
            console.error("Error creating company:", error);
            Swal.fire("Error", "No se pudo crear la empresa", "error");
        } finally {
            setLoading(false);
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

    return (
        <div className="wizard-step">
            <h3>Paso 1: Seleccionar Empresa</h3>

            {!isCreating ? (
                <div className="select-mode">
                    <div className="form-group">
                        <label>Empresa Existente:</label>
                        <select
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            className="form-select"
                        >
                            <option value="">-- Selecciona una empresa --</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="divider">O</div>

                    <button
                        className="btn-create-secondary"
                        onClick={() => setIsCreating(true)}
                    >
                        + Crear Nueva Empresa
                    </button>
                </div>
            ) : (
                <form onSubmit={handleCreateCompany} className="create-form">
                    <h4>Nueva Empresa</h4>
                    <input
                        type="text" placeholder="Nombre" required
                        value={newCompany.name}
                        onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Industria" required
                        value={newCompany.industry}
                        onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Dirección" required
                        value={newCompany.address}
                        onChange={e => setNewCompany({ ...newCompany, address: e.target.value })}
                    />
                    <input
                        type="email" placeholder="Email de Contacto" required
                        value={newCompany.contactEmail}
                        onChange={e => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Teléfono"
                        value={newCompany.contactPhone}
                        onChange={e => setNewCompany({ ...newCompany, contactPhone: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Sitio Web"
                        value={newCompany.websiteUrl}
                        onChange={e => setNewCompany({ ...newCompany, websiteUrl: e.target.value })}
                    />

                    <div className="form-actions">
                        <button type="button" onClick={() => setIsCreating(false)}>Cancelar</button>
                        <button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Empresa"}
                        </button>
                    </div>
                </form>
            )}

            <div className="wizard-actions">
                <button className="btn-secondary" disabled>Anterior</button>
                <button className="btn-primary" onClick={handleNext}>Siguiente</button>
            </div>
        </div>
    );
};

export default StepCompany;

import { useEffect, useState } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";
import InternshipCard from "@components/InternshipCard.jsx";
import StepCompany from "@components/createInternship/StepCompany.jsx";
import StepSupervisor from "@components/createInternship/StepSupervisor.jsx";
import StepDetails from "@components/createInternship/StepDetails.jsx";
import InternshipViewModal from "@components/InternshipViewModal.jsx";
import InternshipEditModal from "@components/InternshipEditModal.jsx";
import '@styles/internship.css';

export default function InternshipPage() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // View State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'wizard'

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    company: null,
    supervisor: null,
    details: null
  });

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);

  useEffect(() => {
    fetchOfertas();
  }, []);

  const fetchOfertas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/internships");
      setOfertas(response.data.data);
    } catch (error) {
      console.error("Error al obtener ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/internships/${id}`);
        Swal.fire('Eliminado!', 'La oferta ha sido eliminada.', 'success');
        fetchOfertas();
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar la oferta.', 'error');
      }
    }
  };

  const handleView = (internship) => {
    setSelectedInternship(internship);
    setShowViewModal(true);
  };

  const handleEdit = (internship) => {
    setSelectedInternship(internship);
    setShowEditModal(true);
  };

  const handleCreateClick = () => {
    setWizardStep(1);
    setWizardData({ company: null, supervisor: null, details: null });
    setViewMode('wizard');
  };

  // Wizard Navigation Handlers
  const handleCompanySelect = (company) => {
    setWizardData({ ...wizardData, company });
    setWizardStep(2);
  };

  const handleSupervisorSelect = (supervisor) => {
    setWizardData({ ...wizardData, supervisor });
    setWizardStep(3);
  };

  const handleWizardComplete = () => {
    setViewMode('list');
    fetchOfertas();
  };

  const handleBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    } else {
      setViewMode('list');
    }
  };

  // Filter Logic
  const filteredOfertas = ofertas.filter(o =>
    o.title.toLowerCase().includes(filter.toLowerCase()) ||
    o.company?.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading && viewMode === 'list' && ofertas.length === 0) return <p>Cargando ofertas...</p>;

  return (
    <div className="page-container">
      <div className="top-table">
        <div className="header-title-container">
          <h2>{viewMode === 'list' ? 'OFERTAS DE PRACTICA' : 'Crear Nueva Oferta'}</h2>
        </div>

        {viewMode === 'list' && (
          <div className="filter-actions">
            <input
              type="text"
              placeholder="Buscar por título o empresa..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button className="btn-create" onClick={handleCreateClick}>
              + Crear Oferta
            </button>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="internship-grid">
          {filteredOfertas.length > 0 ? (
            filteredOfertas.map(oferta => (
              <InternshipCard
                key={oferta.id}
                data={oferta}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={() => handleDelete(oferta.id)}
              />
            ))
          ) : (
            <p>No se encontraron ofertas.</p>
          )}
        </div>
      ) : (
        <>
          <div className="wizard-nav-container">
            <button className="btn-back-wizard" onClick={() => setViewMode('list')} title="Volver al listado">
              <i className="fa-solid fa-arrow-left"></i>
              <span>Volver</span>
            </button>
          </div>

          <div className="wizard-container">
            <div className="wizard-steps">
              <div className={`step-indicator ${wizardStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <span>Empresa</span>
              </div>
              <div className={`step-indicator ${wizardStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <span>Supervisor</span>
              </div>
              <div className={`step-indicator ${wizardStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span>Detalles</span>
              </div>
            </div>

            <div className="wizard-content">
              {wizardStep === 1 && (
                <StepCompany
                  onNext={handleCompanySelect}
                  initialData={wizardData.company}
                />
              )}
              {wizardStep === 2 && (
                <StepSupervisor
                  companyId={wizardData.company?.id}
                  onNext={handleSupervisorSelect}
                  onBack={handleBack}
                  initialData={wizardData.supervisor}
                />
              )}
              {wizardStep === 3 && (
                <StepDetails
                  company={wizardData.company}
                  supervisor={wizardData.supervisor}
                  onBack={handleBack}
                  onComplete={handleWizardComplete}
                />
              )}
            </div>
          </div>
        </>
      )}

      <InternshipViewModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        data={selectedInternship}
      />

      <InternshipEditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={selectedInternship}
        onUpdate={fetchOfertas}
      />
    </div>
  );
}


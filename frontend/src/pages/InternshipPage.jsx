import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "@services/root.service.js";
import Swal from "sweetalert2";
import InternshipCard from "@components/InternshipCard.jsx";
import StepCompany from "@components/createInternship/StepCompany.jsx";
import StepSupervisor from "@components/createInternship/StepSupervisor.jsx";
import StepDetails from "@components/createInternship/StepDetails.jsx";
import InternshipViewModal from "@components/InternshipViewModal.jsx";
import InternshipEditModal from "@components/InternshipEditModal.jsx";
import { applyToInternship, getMyApplications } from "@services/practiceApplication.service.js";
import '../styles/internship.css';

export default function InternshipPage() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [myApplications, setMyApplications] = useState([]);
  const [hasApprovedApplication, setHasApprovedApplication] = useState(false);

  const user = useMemo(() => JSON.parse(sessionStorage.getItem('usuario')) || {}, []);
  const userRole = user?.rol;

  const [viewMode, setViewMode] = useState('list');

  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    company: null,
    supervisor: null,
    details: null
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const ofertasRef = useRef(ofertas);
  useEffect(() => {
    ofertasRef.current = ofertas;
  }, [ofertas]);

  const fetchOfertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/internships");
      setOfertas(response.data.data);
    } catch (error) {
      console.error("Error al obtener ofertas:", error);
      setError("No pudimos conectar con el servidor. Por favor, verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyApplications = useCallback(async () => {
    if (userRole === 'estudiante') {
      const apps = await getMyApplications();
      if (Array.isArray(apps)) {
        setMyApplications(apps);
        // Check if any application is approved (status 'approved' or 'aceptada' or 'accepted')
        const approved = apps.some(app => {
          const status = app.status ? app.status.toLowerCase() : '';
          return status === 'approved' || status === 'aceptada' || status === 'accepted';
        });
        setHasApprovedApplication(approved);
      }
    }
  }, [userRole]);

  useEffect(() => {
    fetchOfertas();
    fetchMyApplications();
  }, [fetchOfertas, fetchMyApplications]);

  useEffect(() => {
    if (viewMode === 'wizard' && userRole !== 'administrador') {
      setViewMode('list');
    }
  }, [viewMode, userRole]);

  useEffect(() => {
    // Verificación inicial inmediata
    if (ofertasRef.current.length > 0) {
      verificarAlertasAdministrador(ofertasRef.current);
    }

    const intervalId = setInterval(() => {
      const ahora = new Date();
      const minutos = ahora.getMinutes();

      // Revisar cada 10 minutos (0, 10, 20, 30, 40, 50)
      if (minutos % 10 === 0) {
        verificarAlertasAdministrador(ofertasRef.current);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // También ejecutar cuando cargan las ofertas por primera vez (si es admin)
  useEffect(() => {
    if (!loading && ofertas.length > 0 && userRole === 'administrador') {
      verificarAlertasAdministrador(ofertas);
    }
  }, [loading, ofertas, userRole]);

  const verificarAlertasAdministrador = (listaOfertas) => {
    if (!listaOfertas || listaOfertas.length === 0) return;
    if (userRole !== 'administrador') return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencidas = listaOfertas.filter(o => {
      const deadline = new Date(o.applicationDeadline);
      const deadlineDate = new Date(deadline.getTime() + deadline.getTimezoneOffset() * 60000);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate < hoy;
    });

    const llenas = listaOfertas.filter(o => (o.occupiedSlots || 0) >= (o.totalSlots || 0));

    // Si no hay nada que reportar, salir
    if (vencidas.length === 0 && llenas.length === 0) return;

    let htmlContent = '';

    if (vencidas.length > 0) {
      const listaVencidas = vencidas.map(o => `• ${o.title}`).join('<br>');
      htmlContent += `
        <p style="margin-top: 10px;"><strong>📅 Prácticas Vencidas:</strong></p>
        <div style="text-align: left; background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #f0ad4e;">
          ${listaVencidas}
          <div style="margin-top:5px; font-size: 0.9em; color: #666;">Se recomienda modificar la fecha o eliminar.</div>
        </div>`;
    }

    if (llenas.length > 0) {
      const listaLlenas = llenas.map(o => `• ${o.title}`).join('<br>');
      htmlContent += `
        <p style="margin-top: 10px;"><strong>👥 Prácticas con Cupos Llenos:</strong></p>
        <div style="text-align: left; background: #fef3c7; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #f59e0b;">
          ${listaLlenas}
          <div style="margin-top:5px; font-size: 0.9em; color: #666;">Ya no son visibles para estudiantes.</div>
        </div>`;
    }

    // Verificar si ya hay una alerta abierta para no spammear (opcional, pero buena práctica)
    if (Swal.isVisible()) return;

    Swal.fire({
      title: 'Atención Administrador',
      html: htmlContent,
      icon: 'info',
      confirmButtonColor: '#6cc4c2',
      confirmButtonText: 'Entendido'
    });
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

  const handleApply = async (internship) => {
    const result = await Swal.fire({
      title: '¿Confirmar postulación?',
      text: `Estás por postular a la práctica: ${internship.title}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6cc4c2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, postular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Enviando postulación...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const result = await applyToInternship(internship.id);

        if (result.error) {
          Swal.fire('Error', result.error, 'error');
        } else {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Tu postulación ha sido enviada y está en estado pendiente.',
            icon: 'success',
            confirmButtonColor: '#6cc4c2'
          });
          fetchOfertas();
          fetchMyApplications();
        }
      } catch {
        Swal.fire('Error', 'Hubo un problema al procesar tu solicitud.', 'error');
      }
    }
  };

  const handleCreateClick = () => {
    setWizardStep(1);
    setWizardData({ company: null, supervisor: null, details: null });
    setViewMode('wizard');
  };

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

  const filteredOfertas = useMemo(() => {
    return ofertas.filter(o => {
      const matchesFilter = o.title.toLowerCase().includes(filter.toLowerCase()) ||
        o.company?.name.toLowerCase().includes(filter.toLowerCase());

      if (userRole === 'administrador') return matchesFilter;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const deadline = new Date(o.applicationDeadline);
      const deadlineDate = new Date(deadline.getTime() + deadline.getTimezoneOffset() * 60000);
      deadlineDate.setHours(0, 0, 0, 0);

      const isFull = (o.occupiedSlots || 0) >= (o.totalSlots || 0);
      if (isFull) return false;

      return matchesFilter && deadlineDate >= hoy;
    });
  }, [ofertas, filter, userRole]);

  if (loading && viewMode === 'list' && ofertas.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando ofertas...</p>
      </div>
    );
  }


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
            {userRole === 'administrador' && (
              <button className="btn-create" onClick={handleCreateClick}>
                + Crear Oferta
              </button>
            )}
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
                onApply={handleApply}
                userRole={userRole}
                myApplications={myApplications}
                hasApprovedApplication={hasApprovedApplication}
              />
            ))
          ) : (
            <div className="status-state-container">
              {error ? (
                <div className="status-card error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <h3>Error de Conexión</h3>
                  <p>{error}</p>
                  <button className="btn-primary" onClick={fetchOfertas}>
                    <i className="fa-solid fa-rotate-right"></i> Reintentar
                  </button>
                </div>
              ) : filter ? (
                <div className="status-card empty">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <h3>Sin coincidencias</h3>
                  <p>No encontramos nada que coincida con "{filter}"</p>
                  <button className="btn-secondary" onClick={() => setFilter("")}>
                    Limpiar busqueda
                  </button>
                </div>
              ) : (
                <div className="status-card empty">
                  <i className="fa-solid fa-folder-open"></i>
                  <h3>No hay ofertas disponibles</h3>
                  {userRole === 'administrador' ? (
                    <>
                      <p>Aún no se han publicado ofertas de práctica.</p>
                      <button className="btn-primary" onClick={handleCreateClick}>
                        + Crear la primera oferta
                      </button>
                    </>
                  ) : (
                    <p>No hay ofertas de práctica activas en este momento. Por favor, vuelve más tarde.</p>
                  )}
                </div>
              )}
            </div>
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


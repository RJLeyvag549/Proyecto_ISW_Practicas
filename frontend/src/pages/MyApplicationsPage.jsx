import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ApplicationCard from "@components/ApplicationCard.jsx";
import ApplicationViewModal from "@components/ApplicationViewModal.jsx";
import ExternalApplicationModal from "@components/ExternalApplicationModal.jsx";
import { getMyApplications, deleteOwnApplication } from "@services/practiceApplication.service.js";
import '@styles/applications.css';

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [showExternalModal, setShowExternalModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [autoEdit, setAutoEdit] = useState(false);

    useEffect(() => {
        fetchMyApplications();
    }, []);

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const data = await getMyApplications();
            if (data.error) {
                console.error("Error:", data.error);
                setApplications([]);
            } else {
                setApplications(data || []);
            }
        } catch (error) {
            console.error("Error al obtener solicitudes:", error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExternalSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: '¡Solicitud enviada!',
            text: 'Tu solicitud de práctica externa ha sido enviada correctamente.',
            confirmButtonColor: '#6cc4c2'
        });
        fetchMyApplications();
    };

    const handleView = (application) => {
        setSelectedApplication(application);
        setAutoEdit(false);
        setShowViewModal(true);
    };

    const handleEdit = (application) => {
        setSelectedApplication(application);
        setAutoEdit(true);
        setShowViewModal(true);
    };

    const handleDelete = async (application) => {
        const result = await Swal.fire({
            title: '¿Eliminar solicitud?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteOwnApplication(application.id);
            if (response?.error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.error,
                    confirmButtonColor: '#6cc4c2'
                });
            } else {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada! ',
                    text: 'La solicitud ha sido eliminada correctamente.',
                    confirmButtonColor: '#6cc4c2'
                });
                fetchMyApplications();
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar la solicitud.',
                confirmButtonColor: '#6cc4c2'
            });
        }
    };

    // Filtrar por estado
    const filteredByStatus = statusFilter 
        ? applications.filter(app => app.status === statusFilter)
        : applications;

    // Filtrar por búsqueda de texto
    const filteredApplications = filteredByStatus.filter(app => {
        const companyName = app.applicationType === 'external'
            ? app.internshipExternal?.companyName?.toLowerCase() || ''
            : app.internship?.company?.name?.toLowerCase() || '';
        const internshipTitle = app.internship?.title?.toLowerCase() || '';
        
        const searchTerm = filter.toLowerCase();
        return companyName.includes(searchTerm) || internshipTitle.includes(searchTerm);
    });

    // Contadores por estado
    const statusCounts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        needsInfo: applications.filter(a => a.status === 'needsInfo').length,
    };

    if (loading && applications.length === 0) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Cargando tus solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="top-table">
                <div className="header-title-container">
                    <h2>MIS SOLICITUDES</h2>
                </div>

                <div className="filter-actions">
                    <input
                        type="text"
                        placeholder="Buscar por empresa o título..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <button 
                        className="btn-create-external"
                        onClick={() => setShowExternalModal(true)}
                    >
                        <i className="fa-solid fa-plus"></i>
                        Solicitud Externa
                    </button>
                </div>

                {/* Filtros por estado */}
                <div className="status-filters">
                    <button 
                        className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('')}
                    >
                        Todas ({statusCounts.all})
                    </button>
                    <button 
                        className={`filter-btn filter-pending ${statusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pendientes ({statusCounts.pending})
                    </button>
                    <button 
                        className={`filter-btn filter-accepted ${statusFilter === 'accepted' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('accepted')}
                    >
                        Aprobadas ({statusCounts.accepted})
                    </button>
                    <button 
                        className={`filter-btn filter-rejected ${statusFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('rejected')}
                    >
                        Rechazadas ({statusCounts.rejected})
                    </button>
                    <button 
                        className={`filter-btn filter-needsinfo ${statusFilter === 'needsInfo' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('needsInfo')}
                    >
                        Requieren Info ({statusCounts.needsInfo})
                    </button>
                </div>
            </div>

            <div className="applications-grid">
                {filteredApplications.length > 0 ? (
                    filteredApplications.map(app => (
                        <ApplicationCard
                            key={app.id}
                            data={app}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="no-results">
                        <i className="fa-solid fa-inbox"></i>
                        <p>No tienes solicitudes de práctica.</p>
                    </div>
                )}
            </div>

            {/* Modal de vista */}
            {showViewModal && (
                <ApplicationViewModal
                    application={selectedApplication}
                    autoEdit={autoEdit}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedApplication(null);
                        setAutoEdit(false);
                    }}
                    onDelete={fetchMyApplications}
                />
            )}

            {/* Modal de solicitud externa */}
            {showExternalModal && (
                <ExternalApplicationModal
                    onClose={() => setShowExternalModal(false)}
                    onSuccess={handleExternalSuccess}
                />
            )}
        </div>
    );
}

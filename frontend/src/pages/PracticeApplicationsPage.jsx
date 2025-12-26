import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ApplicationCard from "@components/ApplicationCard.jsx";
import ApplicationViewModal from "@components/ApplicationViewModal.jsx";
import ApplicationStatusModal from "@components/ApplicationStatusModal.jsx";
import { getAllApplications, updateApplicationStatus } from "@services/practiceApplication.service.js";
import '@styles/applications.css';

export default function PracticeApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            
            const data = await getAllApplications(filters);
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

    const handleView = (application) => {
        setSelectedApplication(application);
        setShowViewModal(true);
    };

    const handleUpdateStatus = (application) => {
        setSelectedApplication(application);
        setShowStatusModal(true);
    };

    const handleStatusSubmit = async (id, status, comments) => {
        const result = await updateApplicationStatus(id, status, comments);
        
        if (result.error) {
            throw new Error(result.error);
        }

        Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'La solicitud ha sido actualizada correctamente.',
            confirmButtonColor: '#6cc4c2'
        });

        fetchApplications();
    };

    // Filtrar por búsqueda de texto
    const filteredApplications = applications.filter(app => {
        const studentName = app.student?.nombreCompleto?.toLowerCase() || '';
        const companyName = app.applicationType === 'external'
            ? app.internshipExternal?.companyName?.toLowerCase() || ''
            : app.internship?.company?.name?.toLowerCase() || '';
        
        const searchTerm = filter.toLowerCase();
        return studentName.includes(searchTerm) || companyName.includes(searchTerm);
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
                    <p>Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="top-table">
                <div className="header-title-container">
                    <h2>SOLICITUDES DE PRÁCTICA</h2>
                </div>

                <div className="filter-actions">
                    <input
                        type="text"
                        placeholder="Buscar por estudiante o empresa..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
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
                            onUpdateStatus={handleUpdateStatus}
                        />
                    ))
                ) : (
                    <div className="no-results">
                        <i className="fa-solid fa-inbox"></i>
                        <p>No se encontraron solicitudes.</p>
                    </div>
                )}
            </div>

            {/* Modales */}
            {showViewModal && (
                <ApplicationViewModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedApplication(null);
                    }}
                />
            )}

            {showStatusModal && (
                <ApplicationStatusModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedApplication(null);
                    }}
                    onSubmit={handleStatusSubmit}
                />
            )}
        </div>
    );
}

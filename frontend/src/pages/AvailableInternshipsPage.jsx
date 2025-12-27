import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAllInternships } from "@services/internship.service.js";
import { applyToInternship } from "@services/practiceApplication.service.js";
import '@styles/applications.css';
import '@styles/internship.css';

export default function AvailableInternshipsPage() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const data = await getAllInternships();
            if (data.error) {
                console.error("Error:", data.error);
                setInternships([]);
            } else {
                setInternships(data || []);
            }
        } catch (error) {
            console.error("Error al obtener ofertas:", error);
            setInternships([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (internship) => {
        const result = await Swal.fire({
            title: '¿Postular a esta práctica?',
            html: `
                <div style="text-align: left;">
                    <p><strong>Título:</strong> ${internship.title}</p>
                    <p><strong>Empresa:</strong> ${internship.company?.name || 'N/A'}</p>
                    <p><strong>Descripción:</strong> ${internship.description || 'Sin descripción'}</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6cc4c2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, postular',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setApplying(true);
            try {
                const response = await applyToInternship(internship.id);
                
                if (response.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.error,
                        confirmButtonColor: '#6cc4c2'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Postulación enviada!',
                        text: 'Tu solicitud ha sido enviada correctamente. Puedes ver el estado en "Mis Solicitudes".',
                        confirmButtonColor: '#6cc4c2'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al enviar la postulación.',
                    confirmButtonColor: '#6cc4c2'
                });
            } finally {
                setApplying(false);
            }
        }
    };

    // Filtrar ofertas
    const list = Array.isArray(internships) ? internships : [];
    const filteredInternships = list.filter(i =>
        i.title?.toLowerCase().includes(filter.toLowerCase()) ||
        i.company?.name?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Cargando ofertas disponibles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="top-table">
                <div className="header-title-container">
                    <h2>OFERTAS DISPONIBLES</h2>
                </div>

                <div className="filter-actions">
                    <input
                        type="text"
                        placeholder="Buscar por título o empresa..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="internship-grid">
                {filteredInternships.length > 0 ? (
                    filteredInternships.map(internship => (
                        <div key={internship.id} className="internship-card">
                            <div className="card-header">
                                <h3>{internship.title}</h3>
                                <span className="company-tag">
                                    {internship.company?.name || 'Sin empresa'}
                                </span>
                            </div>
                            <div className="card-body">
                                <p className="description">
                                    {internship.description || 'Sin descripción disponible'}
                                </p>
                                <div className="card-details">
                                    {internship.modality && (
                                        <div className="detail-item">
                                            <i className="fa-solid fa-building"></i>
                                            <span>{internship.modality}</span>
                                        </div>
                                    )}
                                    {internship.address && (
                                        <div className="detail-item">
                                            <i className="fa-solid fa-location-dot"></i>
                                            <span>{internship.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-actions">
                                <button 
                                    className="btn-apply"
                                    onClick={() => handleApply(internship)}
                                    disabled={applying}
                                >
                                    <i className="fa-solid fa-paper-plane"></i>
                                    Postular
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <i className="fa-solid fa-briefcase"></i>
                        <p>No hay ofertas de práctica disponibles.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from "@services/root.service.js";
import Swal from "sweetalert2";
import '@styles/viewModal.css';

const InternshipEditModal = ({ show, onClose, data, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        totalSlots: 1,
        specialtyArea: "",
        applicationDeadline: ""
    });

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                description: data.description || "",
                totalSlots: data.totalSlots || 1,
                specialtyArea: data.specialtyArea || "",
                applicationDeadline: (data.applicationDeadline || data.deadline) ? (data.applicationDeadline || data.deadline).split('T')[0] : ""
            });
        }
    }, [data]);

    if (!show || !data) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/internships/${data.id}`, formData);
            Swal.fire("Actualizado", "La oferta ha sido actualizada correctamente.", "success");
            onUpdate(); // Refresh list
            onClose();
        } catch (error) {
            console.error("Error updating internship:", error);
            Swal.fire("Error", "No se pudo actualizar la oferta.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-content">
                        <h3>Editar Oferta</h3>
                        <span className="modal-company-tag">
                            {data.company?.name || 'Empresa Desconocida'}
                        </span>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Read-Only Context */}
                    <div className="box-style" style={{ backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>
                            <i className="fa-solid fa-circle-info" style={{ marginRight: '8px' }}></i>
                            Estás editando la oferta de práctica. La empresa y el supervisor no se pueden cambiar aquí.
                        </p>
                    </div>

                    {data.applicationDeadline && new Date(data.applicationDeadline) < new Date().setHours(0, 0, 0, 0) && (
                        <div className="box-style" style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3', marginTop: '1rem' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#be123c', fontWeight: '500' }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                                Esta oferta ha vencido, pero puedes editarla para extender el plazo o corregir datos.
                            </p>
                        </div>
                    )}

                    <h4 className="section-title">Detalles de la Oferta</h4>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Título</label>
                        <input
                            type="text"
                            className="modal-input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="info-grid box-style">
                        <div className="info-item">
                            <label>Cupos Totales</label>
                            <input
                                type="number"
                                min="1"
                                className="modal-input"
                                value={formData.totalSlots}
                                onChange={e => setFormData({ ...formData, totalSlots: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="info-item">
                            <label>Área</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={formData.specialtyArea}
                                onChange={e => setFormData({ ...formData, specialtyArea: e.target.value })}
                            />
                        </div>
                        <div className="info-item">
                            <label>Fecha Límite</label>
                            <input
                                type="date"
                                className="modal-input"
                                value={formData.applicationDeadline}
                                onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="description-section box-style">
                        <label>Descripción</label>
                        <textarea
                            rows="5"
                            className="modal-input"
                            style={{ width: '100%', resize: 'vertical' }}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-modal-action" style={{ background: '#9ca3af', marginRight: '1rem' }} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-modal-action" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InternshipEditModal;

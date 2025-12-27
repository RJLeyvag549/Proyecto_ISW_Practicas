import { useState, useEffect } from 'react';
import { applyExternal } from '@services/practiceApplication.service.js';
import '../styles/applications.css';

const ExternalApplicationModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Empresa, 2: Supervisor, 3: Práctica

    // Limpiar error cuando cambia el paso
    useEffect(() => {
        setError('');
    }, [step]);

    const [formData, setFormData] = useState({
        // Datos de la práctica
        title: '',
        description: '',
        activities: '',
        estimatedDuration: '',
        // Datos de la empresa
        companyName: '',
        companyAddress: '',
        companyIndustry: '',
        companyWebsite: '',
        companyPhone: '',
        companyEmail: '',
        // Datos del supervisor
        supervisorName: '',
        supervisorPosition: '',
        supervisorEmail: '',
        supervisorPhone: '',
        department: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Validaciones que coinciden con el backend
    const validateStep1 = () => {
        // companyName: min 2, max 255, pattern
        if (!formData.companyName?.trim()) {
            setError('El nombre de la empresa es obligatorio.');
            return false;
        }
        if (formData.companyName.length < 2) {
            setError('El nombre de la empresa debe tener al menos 2 caracteres.');
            return false;
        }
        if (formData.companyName.length > 255) {
            setError('El nombre de la empresa no puede superar los 255 caracteres.');
            return false;
        }
        
        // companyAddress: min 10, max 500, required
        if (!formData.companyAddress?.trim()) {
            setError('La dirección de la empresa es obligatoria.');
            return false;
        }
        if (formData.companyAddress.length < 10) {
            setError('La dirección debe tener al menos 10 caracteres.');
            return false;
        }
        if (formData.companyAddress.length > 500) {
            setError('La dirección no puede superar los 500 caracteres.');
            return false;
        }
        
        // companyIndustry: optional, min 3, max 100
        if (formData.companyIndustry && formData.companyIndustry.length > 0) {
            if (formData.companyIndustry.length < 3) {
                setError('La industria debe tener al menos 3 caracteres.');
                return false;
            }
            if (formData.companyIndustry.length > 100) {
                setError('La industria no puede superar los 100 caracteres.');
                return false;
            }
        }
        
        return true;
    };

    const validateStep2 = () => {
        // supervisorName: min 3, max 255, required
        if (!formData.supervisorName?.trim()) {
            setError('El nombre del supervisor es obligatorio.');
            return false;
        }
        if (formData.supervisorName.length < 3) {
            setError('El nombre del supervisor debe tener al menos 3 caracteres.');
            return false;
        }
        if (formData.supervisorName.length > 255) {
            setError('El nombre del supervisor no puede superar los 255 caracteres.');
            return false;
        }
        
        // supervisorPosition: min 3, max 100, required
        if (!formData.supervisorPosition?.trim()) {
            setError('El cargo del supervisor es obligatorio.');
            return false;
        }
        if (formData.supervisorPosition.length < 3) {
            setError('El cargo debe tener al menos 3 caracteres.');
            return false;
        }
        if (formData.supervisorPosition.length > 100) {
            setError('El cargo no puede superar los 100 caracteres.');
            return false;
        }
        
        // supervisorEmail: required, email format
        if (!formData.supervisorEmail?.trim()) {
            setError('El email del supervisor es obligatorio.');
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.supervisorEmail)) {
            setError('El email del supervisor debe tener un formato válido.');
            return false;
        }
        
        // supervisorPhone: optional, pattern 7-25 chars
        if (formData.supervisorPhone && formData.supervisorPhone.length > 0) {
            if (!/^[\+]?[\d\s\-\(\)]{7,25}$/.test(formData.supervisorPhone)) {
                setError('El teléfono del supervisor debe tener un formato válido (ej: +56 9 1234 5678).');
                return false;
            }
        }
        
        // department: optional, min 3, max 100
        if (formData.department && formData.department.length > 0) {
            if (formData.department.length < 3) {
                setError('El departamento debe tener al menos 3 caracteres.');
                return false;
            }
            if (formData.department.length > 100) {
                setError('El departamento no puede superar los 100 caracteres.');
                return false;
            }
        }
        
        return true;
    };

    const validateStep3 = () => {
        // title: min 5, max 200, required
        if (!formData.title?.trim()) {
            setError('El título de la práctica es obligatorio.');
            return false;
        }
        if (formData.title.length < 5) {
            setError('El título debe tener al menos 5 caracteres.');
            return false;
        }
        if (formData.title.length > 200) {
            setError('El título no puede superar los 200 caracteres.');
            return false;
        }
        
        // description: min 20, max 2000, required
        if (!formData.description?.trim()) {
            setError('La descripción de la práctica es obligatoria.');
            return false;
        }
        if (formData.description.length < 20) {
            setError('La descripción debe tener al menos 20 caracteres.');
            return false;
        }
        if (formData.description.length > 2000) {
            setError('La descripción no puede superar los 2000 caracteres.');
            return false;
        }
        
        // activities: min 20, max 2000, required
        if (!formData.activities?.trim()) {
            setError('Las actividades a desarrollar son obligatorias.');
            return false;
        }
        if (formData.activities.length < 20) {
            setError('Las actividades deben tener al menos 20 caracteres.');
            return false;
        }
        if (formData.activities.length > 2000) {
            setError('Las actividades no pueden superar los 2000 caracteres.');
            return false;
        }
        
        // estimatedDuration: no validación específica, pero required
        if (!formData.estimatedDuration?.trim()) {
            setError('Indica la duración estimada.');
            return false;
        }
        
        return true;
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        setError('');
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = (e) => {
        if (e) e.preventDefault();
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateStep3()) return;

        setLoading(true);
        try {
            const response = await applyExternal(formData);
            
            if (response.error) {
                // Mostrar el error detallado
                setError(typeof response.error === 'string' ? response.error : JSON.stringify(response.error));
            } else if (response.status === 'Client error') {
                // Error del backend con detalles
                setError(response.details || response.message || 'Error de validación');
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError('Error al enviar la solicitud. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="wizard-steps-modal">
            <div className={`step-indicator-modal ${step >= 1 ? 'active' : ''}`}>
                <div className="step-number-modal">1</div>
                <span>Empresa</span>
            </div>
            <div className={`step-indicator-modal ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number-modal">2</div>
                <span>Supervisor</span>
            </div>
            <div className={`step-indicator-modal ${step >= 3 ? 'active' : ''}`}>
                <div className="step-number-modal">3</div>
                <span>Práctica</span>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <>
            <h3 className="step-title">Datos de la Empresa</h3>
            
            <div className="app-form-group">
                <label>Nombre de la Empresa <span className="required">*</span></label>
                <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ej: Empresa Tecnológica S.A."
                />
            </div>

            <div className="app-form-group">
                <label>Dirección <span className="required">*</span></label>
                <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    placeholder="Ej: Av. Principal 123, Concepción"
                />
            </div>

            <div className="form-row">
                <div className="app-form-group">
                    <label>Industria/Rubro</label>
                    <input
                        type="text"
                        name="companyIndustry"
                        value={formData.companyIndustry}
                        onChange={handleChange}
                        placeholder="Ej: Tecnología"
                    />
                </div>

                <div className="app-form-group">
                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        placeholder="Ej: +56 9 1234 5678"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="app-form-group">
                    <label>Email de contacto</label>
                    <input
                        type="text"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        placeholder="Ej: contacto@empresa.cl"
                    />
                </div>

                <div className="app-form-group">
                    <label>Sitio Web</label>
                    <input
                        type="text"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="Ej: https://www.empresa.cl"
                    />
                </div>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h3 className="step-title">Datos del Supervisor</h3>
            
            <div className="app-form-group">
                <label>Nombre Completo <span className="required">*</span></label>
                <input
                    type="text"
                    name="supervisorName"
                    value={formData.supervisorName}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez González"
                />
            </div>

            <div className="form-row">
                <div className="app-form-group">
                    <label>Cargo <span className="required">*</span></label>
                    <input
                        type="text"
                        name="supervisorPosition"
                        value={formData.supervisorPosition}
                        onChange={handleChange}
                        placeholder="Ej: Jefe de Desarrollo"
                    />
                </div>

                <div className="app-form-group">
                    <label>Departamento</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Ej: TI"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="app-form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                        type="text"
                        name="supervisorEmail"
                        value={formData.supervisorEmail}
                        onChange={handleChange}
                        placeholder="Ej: supervisor@empresa.cl"
                    />
                </div>

                <div className="app-form-group">
                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="supervisorPhone"
                        value={formData.supervisorPhone}
                        onChange={handleChange}
                        placeholder="Ej: +56 9 8765 4321"
                    />
                </div>
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
            <h3 className="step-title">Datos de la Práctica</h3>
            
            <div className="app-form-group">
                <label>Título de la Práctica <span className="required">*</span></label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: Desarrollo de Sistema Web"
                />
            </div>

            <div className="app-form-group">
                <label>Descripción <span className="required">*</span></label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe brevemente en qué consiste la práctica..."
                    rows={3}
                />
            </div>

            <div className="app-form-group">
                <label>Actividades a Desarrollar <span className="required">*</span></label>
                <textarea
                    name="activities"
                    value={formData.activities}
                    onChange={handleChange}
                    placeholder="Lista las principales actividades que realizarás..."
                    rows={3}
                />
            </div>

            <div className="app-form-group">
                <label>Duración Estimada <span className="required">*</span></label>
                <input
                    type="text"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    placeholder="Ej: 3 meses, 360 horas"
                />
            </div>
        </>
    );

    return (
        <div className="app-modal-overlay">
            <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="app-modal-header">
                    <h2>Nueva Solicitud Externa</h2>
                    <button className="app-btn-close" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} onKeyDown={(e) => {
                    if (e.key === 'Enter' && step < 3) {
                        e.preventDefault();
                        handleNext(e);
                    }
                }}>
                    <div className="app-modal-body">
                        {renderStepIndicator()}

                        {error && (
                            <div className="app-error-message">
                                <i className="fa-solid fa-exclamation-triangle"></i>
                                {error}
                            </div>
                        )}

                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </div>

                    <div className="app-modal-footer">
                        {step > 1 && (
                            <button type="button" className="app-btn-secondary" onClick={handleBack}>
                                <i className="fa-solid fa-arrow-left"></i> Anterior
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button type="button" className="app-btn-primary" onClick={handleNext}>
                                Siguiente <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        ) : (
                            <button type="submit" className="app-btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane"></i>
                                        Enviar Solicitud
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExternalApplicationModal;

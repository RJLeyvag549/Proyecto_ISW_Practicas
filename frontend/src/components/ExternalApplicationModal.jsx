import { useState } from 'react';
import { applyExternal } from '@services/practiceApplication.service.js';
import '../styles/applications.css';

const ExternalApplicationModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Empresa, 2: Supervisor, 3: Práctica

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

    const validateStep1 = () => {
        if (!formData.companyName || formData.companyName.length < 2) {
            setError('El nombre de la empresa debe tener al menos 2 caracteres');
            return false;
        }
        if (!formData.companyAddress || formData.companyAddress.length < 10) {
            setError('La dirección debe tener al menos 10 caracteres');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.supervisorName || formData.supervisorName.length < 2) {
            setError('El nombre del supervisor debe tener al menos 2 caracteres');
            return false;
        }
        if (!formData.supervisorPosition || formData.supervisorPosition.length < 2) {
            setError('El cargo del supervisor debe tener al menos 2 caracteres');
            return false;
        }
        if (!formData.supervisorEmail || !/\S+@\S+\.\S+/.test(formData.supervisorEmail)) {
            setError('Ingresa un email válido para el supervisor');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.title || formData.title.length < 5) {
            setError('El título debe tener al menos 5 caracteres');
            return false;
        }
        if (!formData.description || formData.description.length < 20) {
            setError('La descripción debe tener al menos 20 caracteres');
            return false;
        }
        if (!formData.activities || formData.activities.length < 20) {
            setError('Las actividades deben tener al menos 20 caracteres');
            return false;
        }
        if (!formData.estimatedDuration || formData.estimatedDuration.length < 2) {
            setError('Indica la duración estimada');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        setError('');
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
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
                setError(response.error);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError('Error al enviar la solicitud');
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
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        placeholder="Ej: contacto@empresa.cl"
                    />
                </div>

                <div className="app-form-group">
                    <label>Sitio Web</label>
                    <input
                        type="url"
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
                        type="email"
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
        <div className="app-modal-overlay" onClick={onClose}>
            <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="app-modal-header">
                    <h2>Nueva Solicitud Externa</h2>
                    <button className="app-btn-close" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
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

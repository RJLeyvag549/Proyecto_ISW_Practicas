import { useState, useEffect } from 'react';
import { applyExternal, uploadAttachmentsFiles } from '@services/practiceApplication.service.js';
import '../styles/applications.css';

const ExternalApplicationModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Empresa, 2: Supervisor, 3: Práctica
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Limpiar error cuando cambia el paso
    useEffect(() => {
        setError('');
    }, [step]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        activities: '',
        estimatedDuration: '',
        schedule: '',
        specialtyArea: '',
        companyName: '',
        companyAddress: '',
        companyIndustry: '',
        companyWebsite: '',
        companyPhone: '',
        companyEmail: '',
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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (uploadedFiles.length + files.length > 5) {
            setError('Máximo 5 archivos permitidos.');
            return;
        }
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Los archivos no pueden superar 5MB.');
                return;
            }
        }
        setUploadedFiles([...uploadedFiles, ...files]);
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    // Validaciones del Paso 1: Empresa
    const validateStep1 = () => {
        if (!formData.companyName?.trim()) {
            setError('El nombre de la empresa es obligatorio.');
            return false;
        }
        if (formData.companyName.length < 5) {
            setError('El nombre de la empresa debe tener al menos 5 caracteres.');
            return false;
        }
        
        if (!formData.companyAddress?.trim()) {
            setError('La dirección de la empresa es obligatoria.');
            return false;
        }
        if (formData.companyAddress.length < 10) {
            setError('La dirección debe tener al menos 10 caracteres.');
            return false;
        }
        
        // Validar email de empresa si se ingresó
        if (formData.companyEmail && formData.companyEmail.trim()) {
            if (!/^\S+@\S+\.\S+$/.test(formData.companyEmail)) {
                setError('El email de la empresa debe tener un formato válido.');
                return false;
            }
        }

        // Validar industria (mín 3 caracteres si se ingresa)
        if (formData.companyIndustry && formData.companyIndustry.trim()) {
            if (formData.companyIndustry.trim().length < 3) {
                setError('La industria debe tener al menos 3 caracteres.');
                return false;
            }
        }

        // Validar teléfono de empresa (formato válido si se ingresa)
        if (formData.companyPhone && formData.companyPhone.trim()) {
            if (!/^[+]?[\d\s\-()]{7,25}$/.test(formData.companyPhone.trim())) {
                setError('El teléfono de la empresa debe tener un formato válido (ej: +56 9 1234 5678).');
                return false;
            }
        }

        // Validar sitio web (debe ser URL válida si se ingresa)
        if (formData.companyWebsite && formData.companyWebsite.trim()) {
            try {
                new URL(formData.companyWebsite.trim());
            } catch {
                setError('El sitio web debe ser una URL válida (ej: https://www.empresa.cl).');
                return false;
            }
        }
        
        return true;
    };

    // Validaciones del Paso 2: Supervisor
    const validateStep2 = () => {
        if (!formData.supervisorName?.trim()) {
            setError('El nombre del supervisor es obligatorio.');
            return false;
        }
        if (formData.supervisorName.length < 3) {
            setError('El nombre del supervisor debe tener al menos 3 caracteres.');
            return false;
        }
        
        if (!formData.supervisorPosition?.trim()) {
            setError('El cargo del supervisor es obligatorio.');
            return false;
        }
        if (formData.supervisorPosition.length < 3) {
            setError('El cargo debe tener al menos 3 caracteres.');
            return false;
        }
        
        if (!formData.supervisorEmail?.trim()) {
            setError('El email del supervisor es obligatorio.');
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.supervisorEmail)) {
            setError('El email del supervisor debe tener un formato válido.');
            return false;
        }

        // Validar teléfono del supervisor (formato válido si se ingresa)
        if (formData.supervisorPhone && formData.supervisorPhone.trim()) {
            if (!/^[+]?[\d\s\-()]{7,25}$/.test(formData.supervisorPhone.trim())) {
                setError('El teléfono del supervisor debe tener un formato válido (ej: +56 9 1234 5678).');
                return false;
            }
        }

        // Validar departamento (mín 3 caracteres si se ingresa)
        if (formData.department && formData.department.trim()) {
            if (formData.department.trim().length < 3) {
                setError('El departamento debe tener al menos 3 caracteres.');
                return false;
            }
        }
        
        return true;
    };

    // Validaciones del Paso 3: Práctica
    const validateStep3 = () => {
        if (!formData.title?.trim()) {
            setError('El título de la práctica es obligatorio.');
            return false;
        }
        if (formData.title.length < 5) {
            setError('El título debe tener al menos 5 caracteres.');
            return false;
        }
        
        if (!formData.description?.trim()) {
            setError('La descripción de la práctica es obligatoria.');
            return false;
        }
        if (formData.description.length < 20) {
            setError('La descripción debe tener al menos 20 caracteres.');
            return false;
        }
        
        if (!formData.activities?.trim()) {
            setError('Las actividades a desarrollar son obligatorias.');
            return false;
        }
        if (formData.activities.length < 20) {
            setError('Las actividades deben tener al menos 20 caracteres.');
            return false;
        }
        
        if (!formData.estimatedDuration?.trim()) {
            setError('La duración estimada es obligatoria.');
            return false;
        }

        // Horario es opcional, pero si se ingresa debe tener mín 5 caracteres
        if (formData.schedule && formData.schedule.trim()) {
            if (formData.schedule.trim().length < 5) {
                setError('El horario debe tener al menos 5 caracteres.');
                return false;
            }
        }

        // Área de especialidad es opcional, pero si se ingresa debe tener mín 3 caracteres
        if (formData.specialtyArea && formData.specialtyArea.trim()) {
            if (formData.specialtyArea.trim().length < 3) {
                setError('El área de especialidad debe tener al menos 3 caracteres.');
                return false;
            }
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

        // Validar paso 3 antes de enviar
        if (!validateStep3()) return;

        setLoading(true);

        try {
            // Primero crea la solicitud (solo datos JSON)
            const response = await applyExternal(formData);

            if (response.error) {
                setError(typeof response.error === 'string' ? response.error : JSON.stringify(response.error));
            } else if (response.status === 'Client error') {
                setError(response.details || response.message || 'Error de validación');
            } else {
                // Luego sube archivos reales si existen
                if (uploadedFiles.length > 0) {
                    const appId = response?.data?.id || response?.id;
                    if (!appId) {
                        setError('No se pudo obtener el ID de la solicitud para subir archivos.');
                        setLoading(false);
                        return;
                    }

                    const uploadRes = await uploadAttachmentsFiles(appId, uploadedFiles);
                    if (uploadRes?.error) {
                        setError(uploadRes.error || 'Error al subir archivos');
                        setLoading(false);
                        return;
                    }
                }

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
                        inputMode="email"
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
                        inputMode="email"
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
                <select
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                >
                    <option value="">Selecciona una duración...</option>
                    <option value="1-2 meses">1-2 meses</option>
                    <option value="2-3 meses">2-3 meses</option>
                    <option value="3-4 meses">3-4 meses</option>
                    <option value="4-6 meses">4-6 meses</option>
                    <option value="6+ meses">6+ meses</option>
                </select>
            </div>

            <div className="app-form-group">
                <label>Horarios (opcional)</label>
                <textarea
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    placeholder="Ej: Lunes a Viernes 9:00-18:00"
                    rows={2}
                />
            </div>

            <div className="app-form-group">
                <label>Área de Especialidad (opcional)</label>
                <input
                    type="text"
                    name="specialtyArea"
                    value={formData.specialtyArea}
                    onChange={handleChange}
                    placeholder="Ej: Desarrollo Web"
                />
            </div>

            <div className="app-form-group">
                <label>Documentos (máx 5, 5MB c/u)</label>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                {uploadedFiles.length > 0 && (
                    <div className="file-list">
                        {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="file-item">
                                <span><i className="fa-solid fa-file"></i> {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                                <button
                                    type="button"
                                    className="app-btn-danger"
                                    onClick={() => handleRemoveFile(idx)}
                                >
                                    <i className="fa-solid fa-trash"></i> Quitar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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

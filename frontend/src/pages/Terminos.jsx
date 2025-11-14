import { Link } from 'react-router-dom';
import '@styles/terminos.css';

const Terminos = () => {
    return (
        <div className="terminos-container">
            <div className="terminos-content">
                <h1>Términos y Condiciones</h1>
                
                <section>
                    <h2>1. Aceptación de los Términos</h2>
                    <p>
                        Al registrarte y utilizar este sistema de gestión de prácticas profesionales, 
                        aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo 
                        con alguna parte de estos términos, no debes utilizar el servicio.
                    </p>
                </section>

                <section>
                    <h2>2. Uso del Servicio</h2>
                    <p>
                        Este sistema está diseñado exclusivamente para la gestión de prácticas profesionales. 
                        Te comprometes a:
                    </p>
                    <ul>
                        <li>Proporcionar información veraz y actualizada durante el registro</li>
                        <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
                        <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
                        <li>No utilizar el servicio para fines ilegales o no autorizados</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Responsabilidades del Usuario</h2>
                    <p>
                        Como estudiante registrado, eres responsable de:
                    </p>
                    <ul>
                        <li>Mantener actualizada tu información de perfil</li>
                        <li>Subir documentos auténticos y en los formatos requeridos</li>
                        <li>Cumplir con los plazos establecidos para la entrega de documentos</li>
                        <li>Responder a las solicitudes de información adicional por parte de los coordinadores</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Privacidad y Protección de Datos</h2>
                    <p>
                        Nos comprometemos a proteger tu información personal de acuerdo con las 
                        leyes de privacidad aplicables. Tu información será utilizada únicamente 
                        para la gestión de prácticas profesionales y no será compartida con terceros 
                        sin tu consentimiento, excepto cuando sea requerido por ley.
                    </p>
                </section>

                <section>
                    <h2>5. Documentos y Calificaciones</h2>
                    <p>
                        Los documentos subidos al sistema serán revisados y calificados por los 
                        coordinadores asignados. Las calificaciones son definitivas y forman parte 
                        del registro académico oficial.
                    </p>
                </section>

                <section>
                    <h2>6. Modificaciones del Servicio</h2>
                    <p>
                        Nos reservamos el derecho de modificar o discontinuar el servicio en 
                        cualquier momento, con o sin previo aviso. No seremos responsables ante 
                        ti o terceros por cualquier modificación, suspensión o discontinuación 
                        del servicio.
                    </p>
                </section>

                <section>
                    <h2>7. Limitación de Responsabilidad</h2>
                    <p>
                        El servicio se proporciona &quot;tal cual&quot; sin garantías de ningún tipo. No 
                        nos hacemos responsables por interrupciones del servicio, pérdida de datos 
                        o cualquier daño directo o indirecto que pueda resultar del uso del sistema.
                    </p>
                </section>

                <section>
                    <h2>8. Contacto</h2>
                    <p>
                        Si tienes preguntas sobre estos términos y condiciones, por favor contacta 
                        al coordinador de prácticas de tu institución.
                    </p>
                </section>

                <div className="terminos-footer">
                    <p><strong>Última actualización:</strong> Noviembre 2025</p>
                    <Link to="/register" className="btn-volver">Volver al Registro</Link>
                </div>
            </div>
        </div>
    );
};

export default Terminos;

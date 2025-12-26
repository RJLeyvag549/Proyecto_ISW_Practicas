import { useNavigate, Link } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';
import Form from '@components/Form';
import useLogin from '@hooks/auth/useLogin.jsx';
import '@styles/form.css';
import '@styles/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange
    } = useLogin();

    const loginSubmit = async (data) => {
        try {
            const response = await login(data);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                // If the error is about account status (pending), show a user-friendly alert
                if (response.details && response.details.dataInfo === 'status') {
                    showErrorAlert('Acceso restringido', response.details.message);
                } else {
                    errorData(response.details);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-left">
                <div className="left-content">
                    <h2>Hola, ¡Bienvenido!</h2>
                    <p className="left-sub">¿No tienes una cuenta?</p>
                    <Link to="/register" className="btn-outline">Regístrate</Link>
                </div>
            </section>
            <section className="auth-right">
                <div className="form-wrapper">
                    <Form
                        title="Iniciar sesión"
                        fields={[
                            {
                                label: "Correo electrónico",
                                name: "email",
                                placeholder: "example@correo.com",
                                fieldType: 'input',
                                type: "email",
                                required: true,
                                minLength: 6,
                                maxLength: 100,
                                errorMessageData: errorEmail,
                                onChange: (e) => handleInputChange('email', e.target.value),
                            },
                            {
                                label: "Contraseña",
                                name: "password",
                                placeholder: "**********",
                                fieldType: 'input',
                                type: "password",
                                required: true,
                                minLength: 8,
                                maxLength: 26,
                                pattern: /^[a-zA-Z0-9]+$/,
                                patternMessage: "Debe contener solo letras y números",
                                errorMessageData: errorPassword,
                                onChange: (e) => handleInputChange('password', e.target.value)
                            },
                        ]}
                        buttonText="Iniciar sesión"
                        onSubmit={loginSubmit}
                        footerContent={
                            <p>
                                ¿No tienes cuenta? <Link to="/register">¡Regístrate aquí!</Link>
                            </p>
                        }
                    />
                </div>
            </section>
        </main>
    );
};

export default Login;
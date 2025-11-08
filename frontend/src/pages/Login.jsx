import { useNavigate } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';
import Form from '@components/Form';
import useLogin from '@hooks/auth/useLogin.jsx';
import '@styles/form.css';

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
        <main className="container">
            <Form
                title="Iniciar sesión"
                fields={[
                    {
                        label: "Correo electrónico",
                        name: "email",
                        placeholder: "example@gmail.cl",
                        fieldType: 'input',
                        type: "email",
                        required: true,
                        minLength: 15,
                        maxLength: 30,
                        errorMessageData: errorEmail,
                        validate: {
                            emailDomain: (value) => value.endsWith('@gmail.cl') || 'El correo debe ser institucional (@gmail.cl)'
                        },
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
                        ¿No tienes cuenta?, <a href="/register">¡Regístrate aquí!</a>
                    </p>
                }
            />
        </main>
    );
};

export default Login;
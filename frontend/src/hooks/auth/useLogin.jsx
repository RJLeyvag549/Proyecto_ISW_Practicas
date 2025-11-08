import { useState, useEffect } from 'react';

const useLogin = () => {
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [errorGeneral, setErrorGeneral] = useState('');
    const [inputData, setInputData] = useState({ email: '', password: '' });

    useEffect(() => {
        if (inputData.email) setErrorEmail('');
        if (inputData.password) setErrorPassword('');
    }, [inputData.email, inputData.password]);

    const errorData = (dataMessage) => {
        if (dataMessage.dataInfo === 'email') {
            setErrorEmail(dataMessage.message);
        } else if (dataMessage.dataInfo === 'password') {
            setErrorPassword(dataMessage.message);
        } else if (dataMessage.dataInfo === 'status') {
            setErrorGeneral(dataMessage.message);
        }
    };

    const handleInputChange = (field, value) => {
        setInputData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    return {
        errorEmail,
        errorPassword,
        errorGeneral,
        inputData,
        errorData,
        handleInputChange,
    };
};

export default useLogin;
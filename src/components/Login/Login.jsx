import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
    const [credenciales, setCredenciales] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredenciales({
            ...credenciales,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Petición al backend para iniciar sesión
            const response = await api.post(
                '/api/auth/login',
                credenciales
            );

            // 1. Guardar el token en localStorage
            localStorage.setItem('token', response.data.token);

            // 2. Redirigir al Panel Administrativo (CRUD)
            navigate('/productos');

        } catch (error) {
            setError('Credenciales inválidas. Intente nuevamente.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">

                    <h3 className="text-center mb-4">
                        Iniciar Sesión
                    </h3>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="card p-4 shadow-sm"
                    >
                        <div className="mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Contraseña
                            </label>

                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                        >
                            Ingresar
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Login;
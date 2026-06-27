import { useState } from 'react';
import { solicitarRecuperacion } from '../services/usuarioService';
import { Link } from 'react-router-dom';

export default function SolicitarRecuperacion() {
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');
        setCargando(true);
        try {
            const data = await solicitarRecuperacion(correo);
            setMensaje(data.mensaje);
        } catch (err) {
            setError(err.response?.data?.error || 'Ocurrió un error inesperado.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ingresa tu correo para recibir un enlace de restauración estable.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="ejemplo@correo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />
                    </div>

                    {mensaje && <div className="text-green-600 text-sm bg-green-50 p-2 rounded text-center">{mensaje}</div>}
                    {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
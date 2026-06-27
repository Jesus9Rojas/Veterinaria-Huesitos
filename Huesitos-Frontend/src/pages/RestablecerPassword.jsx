import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { restablecerPassword } from '../services/usuarioService';

export default function RestablecerPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');

        if (nuevaPassword !== confirmarPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);
        try {
            const data = await restablecerPassword(token, nuevaPassword);
            setMensaje(data.mensaje);
            setTimeout(() => {
                navigate('/login'); // Redirigir al login tras 3 segundos
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo restablecer la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Crea una nueva contraseña
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={nuevaPassword}
                                onChange={(e) => setNuevaPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {mensaje && <div className="text-green-600 text-sm bg-green-50 p-2 rounded text-center">{mensaje} Redirigiendo...</div>}
                    {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={cargando || !token}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {cargando ? 'Actualizando...' : 'Restablecer contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
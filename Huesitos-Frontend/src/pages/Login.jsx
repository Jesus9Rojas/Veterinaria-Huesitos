import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/Logo Huesitos.png';
import { sileo } from 'sileo';
import { ShieldPlus, Microscope, Stethoscope, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const BG_IMAGE_URL = null;

// Mismo lenguaje visual que Landing.jsx — acento serif itálico autocontenido.
const accentFont = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const VetLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8080/api/autenticacion/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password
        }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioCorreo', data.correo);
        localStorage.setItem('usuarioRol', data.rol);
        localStorage.setItem('usuarioId', data.id || data.usuarioId);
        localStorage.setItem('usuarioNombre', data.nombreCompleto || data.nombre || 'Usuario');
        localStorage.setItem('usuarioFoto', data.fotoPerfilUrl || '/uploads/defecto-usuario.png');

        sileo.success({ title: '¡Bienvenido!', description: 'Iniciando sesión...' });

        if (data.rol === 'ADMINISTRADOR') {
          navigate('/admin');
        } else if (data.rol === 'CLIENTE') {
          navigate('/');
        } else if (data.rol === 'VETERINARIO') {
          navigate('/veterinario');
        } else if (data.rol === 'RECEPCIONISTA') {
          navigate('/recepcion');
        } else if (data.rol === 'AUXILIAR_VETERINARIO') {
          navigate('/auxiliar');
        } else {
          navigate('/');
        }
      } else {
        const errorText = await response.text();
        setErrorMsg(errorText || 'Credenciales incorrectas');
        sileo.error({ title: 'Acceso Denegado', description: errorText || 'Verifica tu correo y contraseña' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorMsg('Error de conexión con el servidor.');
      sileo.error({ title: 'Error de Red', description: 'No hay conexión con el servidor' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div
        {...fadeUp(0)}
        className="flex w-full max-w-[840px] rounded-[28px] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-900/10 relative bg-white"
      >

        {/* PANEL IZQUIERDO */}
        <div
          className="hidden sm:flex w-[52%] relative flex-col justify-between overflow-hidden min-h-[600px]"
          style={BG_IMAGE_URL
            ? { backgroundImage: `url(${BG_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, #0284c7 0%, #020617 100%)' }}
        >
          <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(160deg, rgba(2,6,23,0.45) 0%, rgba(2,6,23,0.8) 50%, rgba(2,6,23,0.97) 100%)' }} />
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 z-0" />

          <div className="relative z-10 p-9 pb-0">
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/30">
              <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain p-1.5" />
            </div>
          </div>

          <div className="relative z-10 px-9 pb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-4 backdrop-blur-md">
              <ShieldPlus size={14} className="text-sky-200" />
              <span className="text-[11px] text-sky-200 font-semibold tracking-wide">Medicina veterinaria de vanguardia</span>
            </div>
            <h2 className="text-2xl font-semibold text-white leading-snug mb-2.5">
              Excelencia médica para <span className="italic text-sky-200" style={accentFont}>quienes más amas</span>
            </h2>
            <p className="text-[13px] text-slate-300 leading-relaxed mb-5 max-w-[280px]">
              Las consultas médicas nos ayudan a monitorear la salud de tu mascota con tecnología de vanguardia y especialistas certificados.
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: <Microscope size={13} />, label: 'Laboratorio 24h' },
                { icon: <Stethoscope size={13} />, label: 'Especialistas' },
                { icon: <Phone size={13} />, label: 'Emergencias 24/7' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/[0.08] border border-white/15 rounded-full px-3 py-1.5 text-[12px] text-slate-100">
                  {icon} {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-full sm:w-[48%] bg-white p-8 sm:p-10 flex flex-col justify-center relative">

          <button
            onClick={() => navigate('/')}
            className="absolute top-5 right-5 flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[13px] font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center shadow-md shadow-sky-400/30">
              <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain p-1.5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">Huesitos</div>
              <div className="text-[11px] text-sky-600 uppercase tracking-[0.06em] font-semibold">Clínica Veterinaria</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-0.5">Iniciar sesión</h2>
            <p className="text-[13px] text-slate-500">Bienvenido de nuevo a Huesitos</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-xl px-3.5 py-2.5 text-[12px] mb-4">
              {errorMsg}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Correo electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full h-[44px] pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-[44px] pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="text-right mb-5">
            <a href="#" className="text-[12px] text-sky-600 font-medium hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-[46px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[14px] font-semibold transition-colors shadow-lg shadow-slate-900/15"
          >
            Ingresar
          </button>

          <div className="flex items-center gap-2.5 my-4">
            <hr className="flex-1 border-t border-slate-200" />
          </div>

          <p className="text-center text-[12px] text-slate-500">
            ¿Nuevo aquí? <Link to="/registro" className="text-sky-600 font-semibold hover:underline">Crea una cuenta</Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default VetLogin;
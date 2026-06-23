import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';
import { motion } from 'framer-motion';
import logo from '../assets/Logo Huesitos.png';
import { ShieldPlus, User, Phone, MapPin, Mail, Lock, ArrowLeft } from 'lucide-react';

const BG_IMAGE_URL = null;

// Mismo lenguaje visual que Landing.jsx — acento serif itálico autocontenido.
const accentFont = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const inputClass = "w-full h-[42px] pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all";

const RegistroClientePage = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    correo: '',
    password: ''
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'telefono') {
      value = value.replace(/\D/g, '');
    }

    setForm({ ...form, [name]: value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (form.telefono.length !== 9) {
      return sileo.warning({ title: 'Atención', description: 'El teléfono celular debe tener exactamente 9 dígitos.' });
    }

    setCargando(true);

    try {
      const payload = {
        nombreCompleto: `${form.nombre} ${form.apellidos}`,
        telefono: form.telefono,
        direccion: form.direccion,
        usuario: {
          correo: form.correo,
          contrasena: form.password,
          rol: 'CLIENTE',
          activo: true,
          fotoPerfilUrl: '/uploads/defecto-usuario.png'
        }
      };

      const peticion = axios.post('http://localhost:8080/api/autenticacion/registro', payload);

      sileo.promise(peticion, {
        loading: { title: 'Creando cuenta...' },
        success: { title: '¡Perfecto!' },
        error: (err) => ({
          title: 'Error de Registro',
          description: err.response?.data?.message || 'El correo o teléfono ya están registrados.'
        })
      });

      await peticion;

      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        text: 'Bienvenido a Vet.Huesitos. Ya puedes iniciar sesión para agendar tu primera cita.',
        confirmButtonText: 'Ir a Iniciar Sesión',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-slate-100',
          title: 'text-2xl font-black text-slate-800',
          htmlContainer: 'text-slate-600 font-medium',
          confirmButton: 'bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl px-6 py-3 mt-4 w-full transition-colors shadow-md'
        }
      }).then(() => navigate('/login'));

    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
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
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-0" />

          <div className="relative z-10 p-9 pb-0">
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/30">
              <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain p-1.5" />
            </div>
          </div>

          <div className="relative z-10 px-9 pb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-4 backdrop-blur-md">
              <ShieldPlus size={14} className="text-sky-200" />
              <span className="text-[11px] text-sky-200 font-semibold tracking-wide">Tu familia es nuestra prioridad</span>
            </div>
            <h2 className="text-2xl font-semibold text-white leading-snug mb-2.5">
              Únete a la <span className="italic text-sky-200" style={accentFont}>Familia Huesitos</span>
            </h2>
            <p className="text-[13px] text-slate-300 leading-relaxed max-w-[280px]">
              Crea tu cuenta gratuita para agendar citas en línea y llevar un control perfecto de la salud de tus engreídos.
            </p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-full sm:w-[48%] bg-white p-8 sm:p-10 flex flex-col justify-center relative">

          <button
            onClick={() => navigate('/login')}
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

          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 mb-0.5">Crear mi cuenta</h2>
            <p className="text-[13px] text-slate-500">Por favor, completa tus datos personales</p>
          </div>

          <form onSubmit={handleRegistro}>
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombres</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Apellidos</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="telefono" maxLength="9" value={form.telefono} onChange={handleChange} required placeholder="987654321" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dirección</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Calle Ej. 123" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="ejemplo@correo.com" className={inputClass} />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full h-[46px] bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-semibold transition-colors shadow-lg shadow-slate-900/15 flex items-center justify-center"
            >
              {cargando ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          <div className="flex items-center gap-2.5 my-4">
            <hr className="flex-1 border-t border-slate-200" />
          </div>

          <p className="text-center text-[12px] text-slate-500">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-sky-600 font-semibold hover:underline">Inicia sesión</Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default RegistroClientePage;
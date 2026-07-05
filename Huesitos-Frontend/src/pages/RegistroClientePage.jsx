import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';
import { motion } from 'framer-motion';
import logo from '../assets/Logo Huesitos.png';
import { ShieldPlus, User, Phone, MapPin, Mail, Lock, ArrowLeft } from 'lucide-react';

const BG_IMAGE_URL = null;
const accentFont = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    <div className="flex min-h-screen bg-white font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      <div 
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-slate-950"
        style={BG_IMAGE_URL ? { backgroundImage: `url(${BG_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute inset-0 z-[1]" style={BG_IMAGE_URL ? { background: 'linear-gradient(160deg, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.9) 100%)' } : { background: 'linear-gradient(145deg, #020617 0%, #0f172a 100%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 z-0" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 p-1">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="block text-xl font-black text-white tracking-tight leading-none">Vet.Huesitos</span>
            <span className="block text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-0.5">Clínica Especializada</span>
          </div>
        </div>

        <div className="relative z-10 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-6 backdrop-blur-md">
              <ShieldPlus size={16} className="text-sky-300" />
              <span className="text-xs text-sky-100 font-semibold tracking-wide">Tu familia es nuestra prioridad</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Únete a la <br /><span className="italic text-sky-300" style={accentFont}>Familia Huesitos</span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md mb-10 font-medium">
              Crea tu cuenta de forma gratuita para agendar citas en línea y llevar un control perfecto de la salud de tus engreídos en todo momento.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col relative bg-white overflow-y-auto custom-scrollbar">
        
        <div className="absolute top-6 right-6 z-20">
          <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full text-xs font-bold transition-all">
            <ArrowLeft size={14} /> Volver
          </button>
        </div>

        <div className="m-auto w-full max-w-[500px] px-6 py-12">
          
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 p-2">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            
            <motion.div variants={itemVariants} className="text-center lg:text-left mb-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Crear mi cuenta</h2>
              <p className="text-slate-500 text-sm font-medium">Por favor, completa tus datos personales</p>
            </motion.div>

            <form className="space-y-5" onSubmit={handleRegistro}>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Nombres</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Apellidos</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input
                      type="text"
                      name="apellidos"
                      value={form.apellidos}
                      onChange={handleChange}
                      required
                      className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Teléfono</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input
                      type="text"
                      name="telefono"
                      maxLength="9"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="987654321"
                      required
                      className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Dirección</label>
                  <div className="relative group">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      placeholder="Calle Ej. 123"
                      required
                      className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                    className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full h-[52px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800/70 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {cargando ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Registrarme'
                  )}
                </button>
              </motion.div>

            </form>

            <motion.div variants={itemVariants} className="text-center pt-2">
              <p className="text-sm font-medium text-slate-500">
                ¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">Inicia sesión</Link>
              </p>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default RegistroClientePage;
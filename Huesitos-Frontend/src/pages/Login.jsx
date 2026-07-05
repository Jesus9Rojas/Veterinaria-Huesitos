import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/Logo Huesitos.png';
import { sileo } from 'sileo';
import { ShieldPlus, Microscope, Stethoscope, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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

const VetLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:8080/api/autenticacion/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password }),
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

        if (data.rol === 'ADMINISTRADOR') navigate('/admin');
        else if (data.rol === 'CLIENTE') navigate('/');
        else if (data.rol === 'VETERINARIO') navigate('/veterinario');
        else if (data.rol === 'RECEPCIONISTA') navigate('/recepcion');
        else if (data.rol === 'AUXILIAR_VETERINARIO') navigate('/auxiliar');
        else navigate('/');
      } else {
        const errorText = await response.text();
        setErrorMsg(errorText || 'Credenciales incorrectas');
        sileo.error({ title: 'Acceso Denegado', description: errorText || 'Verifica tu correo y contraseña' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorMsg('Error de conexión con el servidor.');
      sileo.error({ title: 'Error de Red', description: 'No hay conexión con el servidor' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* PANEL IZQUIERDO - BRANDING (Visual) */}
      <div 
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-slate-950"
        style={BG_IMAGE_URL ? { backgroundImage: `url(${BG_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* Capas de fondo y efectos Glassmorphism */}
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
              <span className="text-xs text-sky-100 font-semibold tracking-wide">Medicina veterinaria de vanguardia</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Excelencia médica <br />para <span className="italic text-sky-300" style={accentFont}>quienes más amas</span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md mb-10 font-medium">
              Accede a tu panel para gestionar citas, revisar historiales clínicos y brindar el mejor cuidado a tus pacientes con tecnología de punta.
            </p>

            <div className="flex gap-3 flex-wrap">
              {[
                { icon: <Microscope size={14} />, label: 'Laboratorio 24h' },
                { icon: <Stethoscope size={14} />, label: 'Especialistas' },
                { icon: <Phone size={14} />, label: 'Emergencias 24/7' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                  {icon} {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* PANEL DERECHO - FORMULARIO (Interactivo) */}
      <div className="w-full lg:w-[55%] flex flex-col relative bg-white">
        
        {/* Botón Volver */}
        <div className="absolute top-6 right-6 z-20">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full text-xs font-bold transition-all">
            <ArrowLeft size={14} /> Volver a la web
          </button>
        </div>

        <div className="m-auto w-full max-w-[420px] px-6 py-12">
          
          {/* Logo visible solo en móvil */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 p-2">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            
            {/* Header del Formulario */}
            <motion.div variants={itemVariants} className="text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Iniciar sesión</h2>
              <p className="text-slate-500 text-sm font-medium">Ingresa tus credenciales para acceder a tu cuenta.</p>
            </motion.div>

            {errorMsg && (
              <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                {errorMsg}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Input Correo */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </motion.div>

              {/* Input Contraseña */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contraseña</label>
                  <Link to="/recuperar-cuenta" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                    ¿Olvidaste tu clave?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-[52px] pl-11 pr-12 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Botón Submit */}
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full h-[52px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800/70 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {cargando ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Ingresar a mi cuenta'
                  )}
                </button>
              </motion.div>

            </form>

            {/* Footer Formulario */}
            <motion.div variants={itemVariants} className="text-center pt-4">
              <p className="text-sm font-medium text-slate-500">
                ¿No tienes cuenta aún? <Link to="/registro" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">Regístrate aquí</Link>
              </p>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default VetLogin;
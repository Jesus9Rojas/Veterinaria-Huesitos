import { useState } from 'react';
import { solicitarRecuperacion } from '../services/usuarioService';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/Logo Huesitos.png';
import { Mail, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

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
              <ShieldCheck size={16} className="text-sky-300" />
              <span className="text-xs text-sky-100 font-semibold tracking-wide">Recuperación Segura</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Tranquilo, te ayudamos a <br /><span className="italic text-sky-300" style={accentFont}>recuperar tu acceso</span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md mb-10 font-medium">
              Recibirás un enlace cifrado en tu bandeja de entrada para restablecer tu contraseña y continuar gestionando la salud de tus mascotas de forma segura.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col relative bg-white">

        <div className="m-auto w-full max-w-[420px] px-6 py-12">
          

          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 p-2">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            
            <motion.div variants={itemVariants} className="text-center lg:text-left">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-5 mx-auto lg:mx-0">
                <KeyRound size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Olvidé mi contraseña</h2>
              <p className="text-slate-500 text-sm font-medium">Ingresa el correo electrónico asociado a tu cuenta para enviarte las instrucciones.</p>
            </motion.div>

            {mensaje && (
              <motion.div variants={itemVariants} className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-xs font-bold flex items-start gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></div>
                <p>{mensaje}</p>
              </motion.div>
            )}
            
            {error && (
              <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-4 py-3 text-xs font-bold flex items-start gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></div>
                <p>{error}</p>
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ejemplo@correo.com"
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
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Procesando...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>
              </motion.div>

            </form>

            <motion.div variants={itemVariants} className="text-center pt-4">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors">
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </div>
  );
}
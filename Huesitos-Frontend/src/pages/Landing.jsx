import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Stethoscope, Syringe, Activity, Microscope, HeartPulse, 
  Phone, MapPin, Mail, CheckCircle2, ShieldPlus,
  Home, Clock
} from 'lucide-react';

// === IMPORTACIONES DE TUS IMÁGENES LOCALES ===
import imagenNosotros from '../assets/veterinario.jpg';
import portada from '../assets/portada.jpg';
import iconoFacebook from '../assets/facebook.png';
import iconoInstagram from '../assets/social.png';
import iconoTwitter from '../assets/gorjeo.png';
import iconoYoutube from '../assets/youtube.png';
import logo from '../assets/Logo Huesitos.png';

const App = () => {
  
  // Animación principal
  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  // Animación para elementos hijos
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } }
  };

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('consultas');

  // === ESTADO DINÁMICO DE CONFIGURACIÓN ===
  // Nombres de variables actualizados para coincidir con el nuevo Backend
  const [config, setConfig] = useState({
    telefonoRegular: "(01) 628-2000",
    celularEmergencias: "+51 994 142 421",
    correoElectronico: "VeterinariaHuesito@gmail.com",
    direccionFisica: "Santo Domingo De Marcona C-22, Ica, Ica, 11001",
    horarioSemana: "Lunes a Sábado: 08:00 AM - 08:00 PM",
    horarioDomingo: "Domingos: 09:00 AM - 02:00 PM"
  });

  // === EFECTO PARA TRAER DATOS REALES DEL BACKEND ===
  useEffect(() => {
    // Uso de axios directo para leer datos públicos
    axios.get("http://localhost:8080/api/configuracion-negocio")
      .then(res => {
        if(res.data) setConfig(res.data);
      })
      .catch(err => console.error("No se pudo cargar la configuración", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth selection:bg-blue-600 selection:text-white">
      
      {/* NAVEGACIÓN */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          
          {/* Logo y Nombre */}
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-400/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
             <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-3xl text-slate-900 tracking-tight">Huesitos</span>
              <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase">Clínica Veterinaria</span>
            </div>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm tracking-wide">
            <a href="#inicio" className="hover:text-blue-600 transition-colors">Inicio</a>
            <a href="#nosotros" className="hover:text-blue-600 transition-colors">Nosotros</a>
            <a href="#servicios" className="hover:text-blue-600 transition-colors">Servicios</a>
            <a href="#ubicacion" className="hover:text-blue-600 transition-colors">Ubicación</a>
            <a href="#emergencias" className="text-red-500 font-bold hover:text-red-600 transition-colors">Emergencias 24/7</a>
          </nav>

          {/* Botón Iniciar Sesión */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={() => window.location.href = '/login'}
              className="flex items-center gap-2 bg-gradient-to-tr from-sky-500 to-cyan-300 hover:from-sky-700 hover:to-cyan-500 text-white px-7 py-3 rounded-xl font-semibold shadow-xl shadow-sky-400/30 hover:shadow-sky-600/40 transition-all duration-500 ease-in-out hover:-translate-y-0.5"
            >
              Iniciar Sesión
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button className="md:hidden text-slate-600 p-2" onClick={() => setMenuAbierto(!menuAbierto)}>
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-all ${menuAbierto ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-current transition-all ${menuAbierto ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-current transition-all ${menuAbierto ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <motion.section
        id="inicio" 
        className="relative pt-36 pb-48 flex items-center justify-center overflow-hidden bg-cover bg-center"
        variants={fadeUp} 
        style={{ backgroundImage: `url(${portada})` }}
      >
        <div className="absolute inset-0 bg-slate-950/70 z-0"></div>

        <div className="max-w-5xl mx-auto px-4 text-center space-y-10 relative z-10 text-white animate-in fade-in zoom-in-95 duration-700">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold tracking-wide border border-blue-500/30 backdrop-blur-md shadow-sm">
            <ShieldPlus size={16} />
            <span>Medicina veterinaria de vanguardia</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-white drop-shadow-sm">
            Excelencia médica para <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
              quienes más amas
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed drop-shadow">
            Las consultas médicas nos ayudan a monitorear el estado de salud de tu mascota y detectar cualquier malestar. Contamos con tecnología de vanguardia y un equipo de especialistas dedicados a facilitar su pronta recuperación.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-6">
             <div className="flex items-center justify-center gap-3 text-white font-medium bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-white/10">
               <Activity className="text-sky-300" />
               Laboratorio Propio 24h
             </div>
             <div className="flex items-center justify-center gap-3 text-white font-medium bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-white/10">
               <Stethoscope className="text-sky-300" />
               Especialistas Certificados
             </div>
          </div>
        </div>
      </motion.section>

      {/* SECCIÓN: NOSOTROS (Texto Fijo "Huesitos") */}
      <motion.section id="nosotros" className="py-32 bg-white relative" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-sky-100 rounded-[3rem] transform -rotate-3 group-hover:rotate-0 transition-all duration-500 -z-10"></div>
              <img 
                src={imagenNosotros} 
                alt="Equipo médico de la clínica" 
                className="rounded-3xl shadow-2xl object-cover w-full h-[550px] transform group-hover:scale-[1.01] transition-all duration-500 grayscale-[15%] group-hover:grayscale-0"
              />
              <div className="absolute -bottom-8 -right-8 bg-blue-900 text-white p-8 rounded-3xl shadow-xl hidden md:block">
                <p className="text-5xl font-black">10+</p>
                <p className="text-blue-200 font-medium mt-1">Años de Trayectoria</p>
              </div>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase">Sobre Nosotros</h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Comprometidos con la salud y el bienestar animal.</h3>
              </div>
              
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  En <strong>Clínica Veterinaria Huesitos</strong> nos dedicamos a elevar el estándar de la atención médica veterinaria. Combinamos un trato profundamente humano y empático con rigurosos protocolos médicos y quirúrgicos.
                </p>
                <p>
                  Contamos con infraestructura diseñada para mitigar el estrés de los pacientes, salas de procedimientos equipadas con tecnología avanzada y sistemas estrictos de control de bioseguridad.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-6">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xl">Nuestra Misión</h4>
                  <p className="text-slate-600 text-sm">Ofrecer diagnósticos certeros y soluciones médicas oportunas que faciliten la recuperación de cada mascota en un entorno seguro.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShieldPlus />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xl">Nuestra Visión</h4>
                  <p className="text-slate-600 text-sm">Consolidarnos como el centro hospitalario de referencia veterinaria, destacados por nuestra excelencia tecnológica y especialidades complejas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECCIÓN: SERVICIOS Y TARIFAS */}
      <motion.section id="servicios" className="py-32 bg-sky-100 border-y border-sky-200" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900">Servicios Médicos y Tarifas</h2>
            <p className="text-lg text-slate-700">Catálogo de atenciones estructurado. Transparencia total en los costos.</p>
          </div>

          {/* Selector de Categorías */}
          <div className="flex flex-wrap justify-center gap-4 border-b border-slate-200 pb-8">
            {[
              { id: 'consultas', nombre: 'Consultas Médicas', icono: <Stethoscope size={18}/> },
              { id: 'especialidades', nombre: 'Especialidades', icono: <Activity size={18}/> },
              { id: 'vacunas', nombre: 'Vacunas', icono: <Syringe size={18}/> },
              { id: 'laboratorio', nombre: 'Laboratorio e Imágenes', icono: <Microscope size={18}/> },
              { id: 'internamiento', nombre: 'Internamiento', icono: <Home size={18}/> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoriaActiva(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  categoriaActiva === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.icono}
                {tab.nombre}
              </button>
            ))}
          </div>

          {/* Tablas de Contenido */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="p-8 md:p-12">
              
              {/* TAB: Consultas */}
              {categoriaActiva === 'consultas' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-8 items-center mb-6">
                    <p className="text-slate-600 leading-relaxed">Las consultas médicas nos ayudan a monitorear el estado de salud de tu mascota y detectar cualquier malestar o enfermedad. Nuestro equipo veterinario le brindará la atención oportuna para facilitar su recuperación.</p>
                    <div className="bg-slate-50 p-5 rounded-2xl text-xs text-slate-500 space-y-2 border border-slate-100">
                      <p><strong>Urgencia:</strong> Atención no programada el mismo día por signos clínicos agudos que generan malestar.</p>
                      <p><strong>Emergencia:</strong> Situación médica crítica e inmediata que representa un riesgo grave e inminente para la vida de la mascota.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-4 font-bold">Tipo de Consulta</th>
                          <th className="py-4 font-bold text-right">Precio Regular</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4">Consulta general</td><td className="py-4 text-right">S/ 80.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4">Consulta general - Medicina felina</td><td className="py-4 text-right">S/ 100.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4 text-amber-600">Consulta de urgencia</td><td className="py-4 text-right text-amber-600">S/ 120.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4">Consulta a domicilio</td><td className="py-4 text-right">S/ 150.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4 text-red-600 font-bold">Consulta de emergencia</td><td className="py-4 text-right text-red-600 font-bold">S/ 160.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Especialidades */}
              {categoriaActiva === 'especialidades' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-slate-600">Contamos con los mejores especialistas en diversas ramas de la medicina veterinaria. La medicina especializada facilita encontrar el diagnóstico específico y efectivo para condiciones médicas complejas.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-4 font-bold">Especialidad Clínica</th>
                          <th className="py-4 font-bold text-right">Precio Regular</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {['Cardiología', 'Dermatología', 'Cirugía', 'Oncología', 'Endocrinología', 'Neurología'].map(e => (
                          <tr key={e} className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Consulta de {e}</td><td className="py-3.5 text-right">S/ 250.00</td></tr>
                        ))}
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Consulta de Nutrición</td><td className="py-3.5 text-right">S/ 335.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Consulta de Medicina Física / Fisioterapia</td><td className="py-3.5 text-right">S/ 175.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Consulta de Traumatología y Ortopedia</td><td className="py-3.5 text-right">S/ 275.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Consulta de Oftalmología</td><td className="py-3.5 text-right">S/ 300.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Vacunas */}
              {categoriaActiva === 'vacunas' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-slate-600">Las vacunas son fundamentales como parte de la atención preventiva integral. Nos ayudan a evitar complicaciones en las enfermedades más peligrosas. Diseñamos un plan personalizado según el entorno de tu engreído.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-4 font-bold">Vacuna</th>
                          <th className="py-4 font-bold text-right">Precio Regular</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Antirrábica</td><td className="py-3.5 text-right">S/ 50.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Quíntuple</td><td className="py-3.5 text-right">S/ 100.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Triple Felina</td><td className="py-3.5 text-right">S/ 90.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Leptospirosis</td><td className="py-3.5 text-right">S/ 45.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Puppy DP</td><td className="py-3.5 text-right">S/ 60.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Cuádruple</td><td className="py-3.5 text-right">S/ 70.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3.5">Vacuna Leucemia Felina</td><td className="py-3.5 text-right">S/ 90.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Laboratorio */}
              {categoriaActiva === 'laboratorio' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-slate-900">Análisis Clínicos</h4>
                      <p className="text-slate-600 text-sm">Esenciales para detectar enfermedades y sus causas. Equipos propios automatizados para resultados veloces.</p>
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase text-xs">
                            <th className="py-2 font-bold">Tipo de Prueba</th>
                            <th className="py-2 font-bold text-right">Precio Regular</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3 text-sky-700">Chequeo Preventivo Integral*</td><td className="py-3 text-right text-sky-700">S/ 425.00</td></tr>
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3">Hemograma Completo</td><td className="py-3 text-right">S/ 65.00</td></tr>
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3">Coprológico Completo</td><td className="py-3 text-right">S/ 90.00</td></tr>
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3">Examen Completo de Orina</td><td className="py-3 text-right">S/ 40.00</td></tr>
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3">Perfil Bioquímico Pre-Anestésico</td><td className="py-3 text-right">S/ 320.00</td></tr>
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3">Perfil Bioquímico Diagnóstico</td><td className="py-3 text-right">S/ 200.00</td></tr>
                          <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-3">Perfil Bioquímico Integral</td><td className="py-3 text-right">S/ 270.00</td></tr>
                        </tbody>
                      </table>
                      <p className="text-xs text-slate-400">*Incluye: 1 hemograma completo, 1 toma de rayos X, 1 examen coprológico y 1 prueba de descarte de parásitos.</p>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-8 rounded-3xl self-start space-y-6 shadow-lg shadow-slate-900/10">
                      <div>
                        <h4 className="text-lg font-bold flex items-center gap-2"><Activity className="text-sky-400" size={20}/> Pruebas de Imagenología</h4>
                        <p className="text-slate-400 text-sm mt-1">Tecnología digital de alta definición para diagnósticos eficaces y no invasivos.</p>
                      </div>
                      <ul className="space-y-3.5 text-sm text-slate-300 font-medium">
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-sky-400" size={16}/> Radiografía digital de alta definición</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-sky-400" size={16}/> Ecografía abdominal</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-sky-400" size={16}/> Ecocardiografía</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-sky-400" size={16}/> Ecografía gestacional y torácica</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-sky-400" size={16}/> Endoscopía y colonoscopía</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Internamiento */}
              {categoriaActiva === 'internamiento' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-slate-600">Ofrecemos hospitalización con un equipo médico disponible las 24 horas, en espacios separados para perros y gatos para reducir el estrés de tu mascota durante su estancia de recuperación o post-procedimiento.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-4 font-bold">Tipo de Internamiento</th>
                          <th className="py-4 font-bold text-right">Precio Regular</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4">Internamiento de Día (incluye fluidoterapia)</td><td className="py-4 text-right">S/ 120.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4">Internamiento Día Completo (incluye fluidoterapia)</td><td className="py-4 text-right">S/ 200.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4 text-purple-700">Internamiento de Día (incluye fluidoterapia) - Paciente infeccioso*</td><td className="py-4 text-right text-purple-700">S/ 170.00</td></tr>
                        <tr className="hover:bg-slate-50/50 transition-colors"><td className="py-4 text-purple-700">Internamiento Día Completo (incluye fluidoterapia) - Paciente infeccioso*</td><td className="py-4 text-right text-purple-700">S/ 250.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">*Se considera paciente infeccioso a todo aquel con diagnóstico confirmado o signos compatibles con enfermedades contagiosas, requiriendo un aislamiento diferenciado y estrictas medidas de bioseguridad.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </motion.section>

      {/* SECCIÓN: UBICACIÓN Y CONTACTO (Datos Dinámicos) */}
      <motion.section id="ubicacion" className="py-24 bg-white border-t border-slate-200" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">Visítanos</h2>
                <h3 className="text-4xl font-black text-slate-900">Nuestra Ubicación</h3>
              </div>
              <p className="text-lg text-slate-600">
                Estamos estratégicamente ubicados para atender cualquier emergencia con rapidez y brindar el mejor cuidado médico a tu engreído en instalaciones de primer nivel.
              </p>
              
              <div className="space-y-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <div className="flex items-start gap-4">
                  <MapPin className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Dirección Principal</h4>
                    {/* DIRECCIÓN DINÁMICA */}
                    <p className="text-slate-600 mt-1">{config.direccionFisica}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Horarios de Atención</h4>
                    {/* HORARIOS DINÁMICOS */}
                    <p className="text-slate-600 mt-1">
                      {config.horarioSemana} <br/>
                      {config.horarioDomingo}
                    </p>
                    <span className="inline-block mt-2 text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full border border-red-200">Emergencias 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa de Google Maps Integrado */}
            <div className="w-full h-[450px] rounded-3xl shadow-lg overflow-hidden relative border border-slate-200">
              <iframe 
                title="Ubicación Clínica Veterinaria"
                src="https://maps.google.com/maps?q=Santo%20Domingo%20De%20Marcona%20C-22,%20Ica,%20Peru&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>

          </div>
        </div>
      </motion.section>
      
      {/* SECCIÓN EMERGENCIAS (Teléfono Dinámico) */}
      <motion.section id="emergencias" className="py-24 bg-sky-100 border-t border-sky-200" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="inline-block p-4 bg-sky-200 rounded-2xl border border-sky-300">
            <ShieldPlus size={40} className="text-sky-700" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">¿Tienes una Emergencia?</h2>
          <p className="text-lg text-slate-700">
            Si tu mascota presenta signos críticos, no esperes. Contamos con atención de emergencia las 24 horas del día. 
            Comunícate inmediatamente para recibir asistencia prioritaria.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href={`tel:${config.celularEmergencias}`} className="bg-sky-700 hover:bg-sky-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all">
              Llamar a Emergencias: {config.celularEmergencias}
            </a>
          </div>
        </div>
      </motion.section>

      {/* FOOTER (Datos Dinámicos) */}
      <motion.footer className="bg-slate-950 text-slate-400 border-t border-slate-900 relative overflow-hidden" variants={fadeUp}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* 1. Info Principal de Marca */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <HeartPulse size={32} className="text-blue-500" />
                <span className="font-extrabold text-3xl text-white tracking-tight">Huesitos</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed pr-4">
                Nuestra vocación es salvar vidas y procurar el mayor bienestar para tu familia. Laboratorio, sala de procedimientos e internamiento.
              </p>
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-xs font-bold w-fit">
                <Activity size={14} />
                <span>Emergencias 24 Horas Activas</span>
              </div>
            </div>

            {/* 2. Secciones de la Página */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg tracking-wide">Secciones</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-300">
                <li><a href="#inicio" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Inicio</a></li>
                <li><a href="#nosotros" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Nosotros</a></li>
                <li><a href="#servicios" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Servicios Médicos</a></li>
                <li><a href="#ubicacion" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Ubicación</a></li>
              </ul>
            </div>

            {/* 3. Conversa con nosotros */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg tracking-wide">Contacto</h4>
              <div className="space-y-3 text-sm font-medium text-slate-300">
                <p className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <Phone size={16} className="text-blue-500" />
                  <span>{config.telefonoRegular}</span>
                </p>
                <p className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <span className="text-blue-500 font-bold text-base w-4 text-center">+</span>
                  <span>{config.celularEmergencias}</span>
                </p>
                <p className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                  <Mail size={16} className="text-blue-500" />
                  <span>{config.correoElectronico}</span>
                </p>
              </div>
            </div>

            {/* 4. Síguenos (Redes Sociales) */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg tracking-wide">Síguenos</h4>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#" className="w-11 h-11 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                  <img src={iconoFacebook} alt="Facebook" className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </a>
                <a href="#" className="w-11 h-11 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden hover:border-pink-500 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                  <img src={iconoInstagram} alt="Instagram" className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </a>
                <a href="#" className="w-11 h-11 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden hover:border-slate-400 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                  <img src={iconoTwitter} alt="Twitter" className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </a>
                <a href="#" className="w-11 h-11 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden hover:border-red-500 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                  <img src={iconoYoutube} alt="Youtube" className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>

          </div>
        </div>
        
        {/* Copyright Dinámico */}
        <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 relative z-10">
          <p>© {new Date().getFullYear()} Clínica Veterinaria Huesitos. Todos los derechos reservados.</p>
        </div>
      </motion.footer>

    </div>
  );
};

export default App;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import {
  Stethoscope, Syringe, Activity, Microscope, HeartPulse,
  Phone, MapPin, Mail, CheckCircle2, ShieldPlus,
  Home, Clock, CalendarPlus, User, ChevronDown, LogOut, LayoutDashboard,
  ArrowRight
} from 'lucide-react';

import imagenNosotros from '../assets/veterinario.jpg';
import portada from '../assets/portada.jpg';
import iconoFacebook from '../assets/facebook.png';
import iconoInstagram from '../assets/social.png';
import iconoTwitter from '../assets/gorjeo.png';
import iconoYoutube from '../assets/youtube.png';
import logo from '../assets/Logo Huesitos.png';

import ModalReservaCliente from '../components/ModalReservaCliente';

const accentFont = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: '-80px' }, 
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const Landing = () => {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('consultas');

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('usuarioRol');
    return Boolean(token && rol === 'CLIENTE');
  });

  const [usuarioNombre, setUsuarioNombre] = useState(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('usuarioRol');
    const nombre = localStorage.getItem('usuarioNombre');
    return (token && rol === 'CLIENTE') ? (nombre || 'Cliente') : '';
  });

  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);

  const [config, setConfig] = useState({
    telefonoRegular: "(01) 628-2000",
    celularEmergencias: "+51 994 142 421",
    correoElectronico: "VeterinariaHuesito@gmail.com",
    direccionFisica: "Santo Domingo De Marcona C-22, Ica, Ica, 11001",
    horarioSemana: "Lunes a Sábado: 08:00 AM - 08:00 PM",
    horarioDomingo: "Domingos: 09:00 AM - 02:00 PM"
  });

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/configuracion-negocio");
        if (res.data) setConfig(res.data);
      } catch (err) {
        console.error("Error cargando la configuración: ", err);
        sileo.error({ title: 'Modo Offline', description: 'Usando información de contacto de respaldo.' });
      }
    };
    cargarConfig();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsuarioNombre('');
    setPerfilAbierto(false);
    sileo.success({ title: 'Sesión Cerrada', description: '¡Vuelve pronto!' });
    navigate('/');
  };

  const tabsServicio = [
    { id: 'consultas', nombre: 'Consultas Médicas', icono: <Stethoscope size={17} /> },
    { id: 'especialidades', nombre: 'Especialidades', icono: <Activity size={17} /> },
    { id: 'vacunas', nombre: 'Vacunas', icono: <Syringe size={17} /> },
    { id: 'laboratorio', nombre: 'Laboratorio e Imágenes', icono: <Microscope size={17} /> },
    { id: 'internamiento', nombre: 'Internamiento', icono: <Home size={17} /> },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans scroll-smooth selection:bg-sky-500 selection:text-white">

      {/* NAVBAR — frosted, fijo, sin bordes duros */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        <div className="max-w-7xl mx-auto h-[68px] flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] px-5">

          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-300 flex items-center justify-center shadow-md shadow-sky-400/30 group-hover:rotate-3 transition-transform duration-300">
              <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Huesitos</span>
              <span className="text-[10px] font-semibold text-sky-600 tracking-[2px] uppercase">Clínica Veterinaria</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500">
            {[
              { href: '#inicio', label: 'Inicio' },
              { href: '#nosotros', label: 'Nosotros' },
              { href: '#servicios', label: 'Servicios' },
              { href: '#ubicacion', label: 'Ubicación' },
            ].map((item) => (
              <a key={item.href} href={item.href} className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-900/5 transition-colors">
                {item.label}
              </a>
            ))}
            <a href="#emergencias" className="px-3 py-2 rounded-lg text-rose-600 font-semibold hover:bg-rose-50 transition-colors">
              Emergencias 24/7
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setModalReservaAbierto(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5"
                >
                  <CalendarPlus size={16} /> Agendar Cita
                </button>

                <div className="relative">
                  <button
                    onClick={() => setPerfilAbierto(!perfilAbierto)}
                    className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 border border-slate-200 hover:border-slate-300 bg-white rounded-full transition-colors"
                  >
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><User size={14} /></div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{usuarioNombre}</span>
                    <ChevronDown size={15} className={`text-slate-400 transition-transform ${perfilAbierto ? 'rotate-180' : ''}`} />
                  </button>

                  {perfilAbierto && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setPerfilAbierto(false)}></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">

                        <button
                          onClick={() => { setPerfilAbierto(false); navigate('/cliente'); }}
                          className="w-full text-left px-4 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-50 flex items-center gap-2 transition-colors border-b border-slate-100"
                        >
                          <LayoutDashboard size={16} /> Ir a mi Panel
                        </button>

                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors">
                          <LogOut size={16} /> Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/login'}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          <button className="md:hidden text-slate-700 p-2" onClick={() => setMenuAbierto(!menuAbierto)}>
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-all ${menuAbierto ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-current transition-all ${menuAbierto ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-current transition-all ${menuAbierto ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {menuAbierto && (
          <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl px-5 py-4 space-y-3 shadow-xl">
            <a href="#inicio" onClick={() => setMenuAbierto(false)} className="block text-sm font-semibold text-slate-600">Inicio</a>
            <a href="#nosotros" onClick={() => setMenuAbierto(false)} className="block text-sm font-semibold text-slate-600">Nosotros</a>
            <a href="#servicios" onClick={() => setMenuAbierto(false)} className="block text-sm font-semibold text-slate-600">Servicios</a>
            <a href="#ubicacion" onClick={() => setMenuAbierto(false)} className="block text-sm font-semibold text-slate-600">Ubicación</a>
            <a href="#emergencias" onClick={() => setMenuAbierto(false)} className="block text-sm font-semibold text-rose-600">Emergencias 24/7</a>
            <div className="h-px bg-slate-100"></div>
            {isLoggedIn ? (
              <div className="space-y-2 pt-1">
                <button onClick={() => { setModalReservaAbierto(true); setMenuAbierto(false); }} className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                  <CalendarPlus size={18} /> Agendar Cita
                </button>
                <button onClick={() => { setMenuAbierto(false); navigate('/cliente'); }} className="w-full py-3 border border-sky-200 bg-sky-50 text-sky-600 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  <LayoutDashboard size={18} /> Ir a mi Panel
                </button>
                <button onClick={handleLogout} className="w-full py-3 bg-rose-50 text-rose-500 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <button onClick={() => window.location.href = '/login'} className="w-full py-3 border border-slate-200 text-center text-sm font-semibold text-slate-700 rounded-xl">
                Iniciar Sesión
              </button>
            )}
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center pt-28" style={{ backgroundImage: `url(${portada})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/85 z-0"></div>

        <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/10 text-sky-200 text-xs font-semibold tracking-wide border border-white/15 backdrop-blur-md mb-8">
            <ShieldPlus size={15} />
            <span>Medicina veterinaria de vanguardia</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold leading-[1.08] tracking-tight text-white">
            Excelencia médica para
            <br className="hidden md:block" />
            <span className="italic font-normal text-sky-200" style={accentFont}>quienes más amas</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mt-7">
            Las consultas médicas nos ayudan a monitorear el estado de salud de tu mascota y detectar cualquier malestar. Contamos con tecnología de vanguardia y un equipo de especialistas dedicados a facilitar su pronta recuperación.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <a href="#servicios" className="group flex items-center gap-2 bg-white text-slate-900 px-7 py-3.5 rounded-full font-semibold text-sm shadow-xl transition-all hover:-translate-y-0.5">
              Ver servicios y tarifas
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="#emergencias" className="flex items-center gap-2 border border-white/25 bg-white/5 backdrop-blur-md text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-all">
              Atención de emergencia
            </a>
          </div>
        </motion.div>

        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white to-transparent z-[1]"></div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="py-28 md:py-36 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            <motion.div {...fadeUp(0)} className="relative">
              <img src={imagenNosotros} alt="Equipo médico" className="rounded-3xl shadow-2xl object-cover w-full h-[500px]" />
              <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-7 rounded-2xl shadow-xl hidden md:block border border-white/10">
                <p className="text-4xl font-bold">10+</p>
                <p className="text-slate-300 text-sm font-medium mt-1">Años de Trayectoria</p>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="space-y-9">
              <div className="space-y-4">
                <h2 className="text-xs font-semibold text-sky-600 tracking-[3px] uppercase">Sobre Nosotros</h2>
                <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight tracking-tight">
                  Comprometidos con la <span className="italic text-sky-600" style={accentFont}>salud</span> y el bienestar animal.
                </h3>
              </div>
              <div className="space-y-5 text-base text-slate-600 leading-relaxed">
                <p>En <strong className="text-slate-900">Clínica Veterinaria Huesitos</strong> nos dedicamos a elevar el estándar de la atención médica veterinaria. Combinamos un trato profundamente humano y empático con rigurosos protocolos médicos y quirúrgicos.</p>
                <p>Contamos con infraestructura diseñada para mitigar el estrés de los pacientes, salas de procedimientos equipadas con tecnología avanzada y sistemas estrictos de control de bioseguridad.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5 pt-4">
                <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                  <h4 className="font-semibold text-slate-900 text-base">Nuestra Misión</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Ofrecer diagnósticos certeros y soluciones médicas oportunas que faciliten la recuperación de cada mascota en un entorno seguro.</p>
                </div>
                <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><ShieldPlus size={20} /></div>
                  <h4 className="font-semibold text-slate-900 text-base">Nuestra Visión</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Consolidarnos como el centro hospitalario de referencia veterinaria, destacados por nuestra excelencia tecnológica y especialidades complejas.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-28 md:py-36 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <motion.div {...fadeUp(0)} className="text-center space-y-5 max-w-2xl mx-auto">
            <h2 className="text-xs font-semibold text-sky-600 tracking-[3px] uppercase">Catálogo Médico</h2>
            <h3 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight">
              Servicios y <span className="italic text-sky-600" style={accentFont}>tarifas</span>
            </h3>
            <p className="text-base text-slate-500">Catálogo de atenciones estructurado. Transparencia total en los costos.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-2">
            {tabsServicio.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoriaActiva(tab.id)}
                className="relative px-5 py-2.5 rounded-full font-medium text-sm transition-colors"
              >
                {categoriaActiva === tab.id && (
                  <motion.span
                    layoutId="tab-activa"
                    className="absolute inset-0 rounded-full bg-slate-900"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${categoriaActiva === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {tab.icono}
                  {tab.nombre}
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[380px]">
            <div className="p-7 md:p-10">
              {categoriaActiva === 'consultas' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-4 font-semibold">Tipo de Consulta</th>
                        <th className="py-4 font-semibold text-right">Precio Regular</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-4">Consulta general</td><td className="py-4 text-right">S/ 80.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-4">Consulta general - Medicina felina</td><td className="py-4 text-right">S/ 100.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 flex items-center gap-2">Consulta de urgencia <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Prioritaria</span></td>
                        <td className="py-4 text-right text-amber-600">S/ 120.00</td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-4">Consulta a domicilio</td><td className="py-4 text-right">S/ 150.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 flex items-center gap-2 font-semibold">Consulta de emergencia <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">24/7</span></td>
                        <td className="py-4 text-right text-rose-600 font-semibold">S/ 160.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {categoriaActiva === 'especialidades' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-4 font-semibold">Especialidad Clínica</th>
                        <th className="py-4 font-semibold text-right">Precio Regular</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {['Cardiología', 'Dermatología', 'Cirugía', 'Oncología', 'Endocrinología', 'Neurología'].map(e => (
                        <tr key={e} className="hover:bg-slate-50/80 transition-colors"><td className="py-3.5">Consulta de {e}</td><td className="py-3.5 text-right">S/ 250.00</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {categoriaActiva === 'vacunas' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-4 font-semibold">Vacuna</th>
                        <th className="py-4 font-semibold text-right">Precio Regular</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3.5">Vacuna Antirrábica</td><td className="py-3.5 text-right">S/ 50.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3.5">Vacuna Quíntuple</td><td className="py-3.5 text-right">S/ 100.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3.5">Vacuna Triple Felina</td><td className="py-3.5 text-right">S/ 90.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3.5">Vacuna Leptospirosis</td><td className="py-3.5 text-right">S/ 45.00</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {categoriaActiva === 'laboratorio' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-xs">
                        <th className="py-2 font-semibold">Tipo de Prueba</th>
                        <th className="py-2 font-semibold text-right">Precio Regular</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 flex items-center gap-2 text-sky-700">Chequeo Preventivo Integral <span className="text-[10px] font-bold uppercase tracking-wide text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">Pack</span></td>
                        <td className="py-3 text-right text-sky-700">S/ 425.00</td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3">Hemograma Completo</td><td className="py-3 text-right">S/ 65.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3">Coprológico Completo</td><td className="py-3 text-right">S/ 90.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-3">Examen Completo de Orina</td><td className="py-3 text-right">S/ 40.00</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {categoriaActiva === 'internamiento' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-4 font-semibold">Tipo de Internamiento</th>
                        <th className="py-4 font-semibold text-right">Precio Regular</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-4">Internamiento de Día</td><td className="py-4 text-right">S/ 120.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors"><td className="py-4">Internamiento Día Completo</td><td className="py-4 text-right">S/ 200.00</td></tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 flex items-center gap-2 text-violet-700">Internamiento de Día - Paciente infeccioso <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Aislado</span></td>
                        <td className="py-4 text-right text-violet-700">S/ 170.00</td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 flex items-center gap-2 text-violet-700">Internamiento Día Completo - Paciente infeccioso <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">Aislado</span></td>
                        <td className="py-4 text-right text-violet-700">S/ 250.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section id="ubicacion" className="py-28 md:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp(0)} className="space-y-8">
              <div>
                <h2 className="text-xs font-semibold text-sky-600 tracking-[3px] uppercase mb-2">Visítanos</h2>
                <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">Nuestra <span className="italic text-sky-600" style={accentFont}>ubicación</span></h3>
              </div>
              <p className="text-base text-slate-600 leading-relaxed">
                Estamos estratégicamente ubicados para atender cualquier emergencia con rapidez y brindar el mejor cuidado médico a tu engreído en instalaciones de primer nivel.
              </p>

              <div className="space-y-5 bg-slate-50 p-7 rounded-3xl border border-slate-100">
                <div className="flex items-start gap-4">
                  <MapPin className="text-sky-600 mt-1" size={22} />
                  <div>
                    <h4 className="font-semibold text-slate-900">Dirección Principal</h4>
                    <p className="text-slate-500 text-sm mt-1">{config.direccionFisica}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="text-sky-600 mt-1" size={22} />
                  <div>
                    <h4 className="font-semibold text-slate-900">Horarios de Atención</h4>
                    <p className="text-slate-500 text-sm mt-1">
                      {config.horarioSemana} <br />
                      {config.horarioDomingo}
                    </p>
                    <span className="inline-block mt-2 text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-200">Emergencias 24/7</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="w-full h-[420px] rounded-3xl shadow-lg overflow-hidden relative border border-slate-200">
              <iframe title="Ubicación Clínica Veterinaria" src="https://maps.google.com/maps?q=Santo%20Domingo%20De%20Marcona%20C-22,%20Ica,%20Peru&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full"></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EMERGENCIAS — el momento de mayor contraste de la página */}
      <section id="emergencias" className="relative py-28 md:py-36 bg-slate-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto px-4 text-center space-y-7 relative z-10">
          <div className="inline-flex p-3.5 bg-rose-500/10 rounded-2xl border border-rose-500/20"><ShieldPlus size={32} className="text-rose-400" /></div>
          <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
            ¿Tienes una <span className="italic text-rose-400" style={accentFont}>emergencia</span>?
          </h2>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed">
            Si tu mascota presenta signos críticos, no esperes. Contamos con atención de emergencia las 24 horas del día.
            Comunícate inmediatamente para recibir asistencia prioritaria.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={`tel:${config.celularEmergencias}`} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-xl font-semibold text-base shadow-lg shadow-rose-900/40 transition-all hover:-translate-y-0.5">
              <Phone size={18} /> Llamar a Emergencias: {config.celularEmergencias}
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <HeartPulse size={28} className="text-sky-500" />
                <span className="font-semibold text-2xl text-white tracking-tight">Huesitos</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed pr-4">Nuestra vocación es salvar vidas y procurar el mayor bienestar para tu familia. Laboratorio, sala de procedimientos e internamiento.</p>
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 text-xs font-semibold w-fit">
                <Activity size={14} />
                <span>Emergencias 24 Horas Activas</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm tracking-wide uppercase">Secciones</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-300">
                <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a></li>
                <li><a href="#servicios" className="hover:text-white transition-colors">Servicios Médicos</a></li>
                <li><a href="#ubicacion" className="hover:text-white transition-colors">Ubicación</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm tracking-wide uppercase">Contacto</h4>
              <div className="space-y-3 text-sm font-medium text-slate-300">
                <p className="flex items-center gap-3"><Phone size={16} className="text-sky-500" />{config.telefonoRegular}</p>
                <p className="flex items-center gap-3"><span className="text-sky-500 font-bold">+</span>{config.celularEmergencias}</p>
                <p className="flex items-center gap-3"><Mail size={16} className="text-sky-500" />{config.correoElectronico}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm tracking-wide uppercase">Síguenos</h4>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="#" className="w-11 h-11 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:border-sky-500/50 hover:bg-white/10 transition-all"><img src={iconoFacebook} alt="Facebook" className="w-5 h-5 opacity-70 hover:opacity-100" /></a>
                <a href="#" className="w-11 h-11 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:border-rose-500/50 hover:bg-white/10 transition-all"><img src={iconoInstagram} alt="Instagram" className="w-5 h-5 opacity-70 hover:opacity-100" /></a>
                <a href="#" className="w-11 h-11 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:border-slate-400/50 hover:bg-white/10 transition-all"><img src={iconoTwitter} alt="Twitter" className="w-5 h-5 opacity-70 hover:opacity-100" /></a>
                <a href="#" className="w-11 h-11 bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:border-rose-500/50 hover:bg-white/10 transition-all"><img src={iconoYoutube} alt="Youtube" className="w-5 h-5 opacity-70 hover:opacity-100" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Clínica Veterinaria Huesitos. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* MODAL DE RESERVA */}
      {modalReservaAbierto && (
        <ModalReservaCliente cerrarModal={() => setModalReservaAbierto(false)} />
      )}

    </div>
  );
};

export default Landing;
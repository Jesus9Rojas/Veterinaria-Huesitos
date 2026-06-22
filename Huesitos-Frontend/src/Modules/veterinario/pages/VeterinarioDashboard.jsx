import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, CalendarDays, Users, Clock, 
  LogOut, Menu, X, Bell, User, ChevronDown, Stethoscope, CheckCircle2, UserCircle
} from 'lucide-react';
import logo from '../../../assets/Logo Huesitos.png';
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../../services/notificacionService';

const VeterinarioDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [menuNotificacionesOpen, setMenuNotificacionesOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  
  const [imgError, setImgError] = useState(false);
  
  const usuarioCorreo = localStorage.getItem('usuarioCorreo') || 'doctor@huesitos.com';
  let nombreReal = localStorage.getItem('usuarioNombre');
  const usuarioNombre = (!nombreReal || nombreReal === 'null') ? 'Veterinario' : nombreReal;
  const usuarioRol = localStorage.getItem('usuarioRol') || 'VETERINARIO';

  const [usuarioId] = useState(() => {
    let id = localStorage.getItem('usuarioId') || localStorage.getItem('id');
    if (!id) {
      try {
        const userObj = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (userObj && userObj.id) id = userObj.id;
      } catch (error) { console.debug(error); }
    }
    return id;
  });

  let fotoLocal = localStorage.getItem('usuarioFoto');
  if (!fotoLocal || fotoLocal === 'null' || fotoLocal === 'undefined') {
    fotoLocal = '/uploads/defecto-usuario.png';
  }
  const usuarioFoto = fotoLocal;
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem('usuarioRol');
    if (rol !== 'VETERINARIO' && rol !== 'ADMINISTRADOR') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchNotificaciones = async () => {
      if (!usuarioId) return;
      try {
        const data = await obtenerNotificaciones(usuarioId);
        if (isMounted) {
          setNotificaciones(data);
        }
      } catch (error) {
        console.error("Error cargando la campanita:", error);
      }
    };

    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 15000); 
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [usuarioId]);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const handleLeerNotificacion = async (notificacion) => {
    if (notificacion.leida) return;
    try {
      await marcarNotificacionLeida(notificacion.id);
      setNotificaciones(notificaciones.map(n => n.id === notificacion.id ? { ...n, leida: true } : n));
    } catch (error) {
      console.error("Error al marcar como leída", error);
    }
  };

  const handleLimpiarTodas = async () => {
    if (!usuarioId) return;
    try {
      await axios.delete(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/todas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotificaciones([]);
      setMenuNotificacionesOpen(false);
    } catch (error) {
      console.error("Error al limpiar notificaciones", error);
    }
  };

  const menuItems = [
    { path: '/veterinario', Icon: LayoutDashboard, label: 'Inicio Médico' },
    { path: '/veterinario/consultas', Icon: Stethoscope, label: 'Mi Consultorio (Hoy)' },
    { path: '/veterinario/agenda', Icon: CalendarDays, label: 'Mi Agenda Global' },
    { path: '/veterinario/pacientes', Icon: Users, label: 'Mis Pacientes' },
    { path: '/veterinario/horarios', Icon: Clock, label: 'Mis Horarios' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const baseBtnClass = "w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-4 text-sm tracking-wide group";
  const activeBtnClass = `${baseBtnClass} bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 translate-x-1`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* SIDEBAR TIPO ADMINISTRADOR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-950 flex flex-col border-r border-slate-800 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 shrink-0`}>
        
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 p-1">
              <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight leading-tight">Vet.Huesitos</span>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Área Médica</span>
            </div>
          </div>
          <button className="ml-auto md:hidden text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="pt-2 pb-2"><p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Gestión Clínica</p></div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/veterinario' && location.pathname.startsWith(item.path));
            const Icono = item.Icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setSidebarOpen(false)} 
                className={isActive ? activeBtnClass : inactiveBtnClass}
              >
                <Icono size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN CERRAR SESIÓN ROJO COMO EL ADMIN */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 border border-red-500/20 hover:shadow-lg hover:shadow-red-500/20">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL Y HEADER */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md h-20 px-4 sm:px-8 flex justify-between items-center shadow-sm z-10 border-b border-slate-200/60 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700 bg-white p-2 rounded-lg border border-slate-200 shadow-sm" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">Centro Médico Veterinario</h1>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative">
              <button 
                onClick={() => { setMenuNotificacionesOpen(!menuNotificacionesOpen); setMenuPerfilOpen(false); }} 
                className={`relative p-2.5 transition-colors rounded-full border ${noLeidas > 0 ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-sky-500'}`}
              >
                <Bell size={20} className={noLeidas > 0 ? 'animate-pulse' : ''} />
                {noLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white text-[10px] font-black text-white items-center justify-center">
                      {noLeidas}
                    </span>
                  </span>
                )}
              </button>

              {menuNotificacionesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuNotificacionesOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-lg">Notificaciones</h3>
                        {noLeidas > 0 && <span className="bg-sky-100 text-sky-600 text-xs font-black px-2 py-0.5 rounded-full">{noLeidas}</span>}
                      </div>
                      {notificaciones.length > 0 && (
                        <button onClick={handleLimpiarTodas} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                          Limpiar todas
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col bg-white">
                      {notificaciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                          <Bell size={40} className="text-slate-200 mb-3" strokeWidth={1.5} />
                          <p className="text-sm text-slate-400 font-medium">No tienes notificaciones nuevas</p>
                        </div>
                      ) : (
                        notificaciones.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleLeerNotificacion(notif)}
                            className={`p-4 border-b border-slate-50 cursor-pointer transition-colors flex gap-3 ${notif.leida ? 'bg-white opacity-60' : 'bg-sky-50/40 hover:bg-sky-50'}`}
                          >
                            <div className="mt-1 shrink-0">
                              {notif.leida ? <CheckCircle2 size={16} className="text-slate-300"/> : <div className="w-2.5 h-2.5 mt-1 bg-sky-500 rounded-full shadow-sm shadow-sky-500/50"></div>}
                            </div>
                            <div>
                              <p className={`text-[13px] leading-snug ${notif.leida ? 'font-medium text-slate-500' : 'font-bold text-slate-700'}`}>{notif.mensaje}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                {new Date(notif.fechaCreacion).toLocaleString('es-PE', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PERFIL DROPDOWN */}
            <div className="relative">
              <button onClick={() => { setMenuPerfilOpen(!menuPerfilOpen); setMenuNotificacionesOpen(false); }} className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-2xl transition-colors cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">{usuarioNombre}</p>
                  <p className="text-[10px] font-black uppercase text-sky-600 tracking-widest">{usuarioRol}</p>
                </div>

                {/* ESCUDO DE IMAGEN CABECERA */}
                {!imgError ? (
                  <img 
                    src={`http://localhost:8080${usuarioFoto}`} 
                    alt="Perfil" 
                    className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover bg-white shadow-sm shrink-0" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <UserCircle size={24} strokeWidth={1.5} />
                  </div>
                )}
                
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {menuPerfilOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuPerfilOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                      
                      {/* ESCUDO DE IMAGEN DROPDOWN */}
                      {!imgError ? (
                        <img 
                          src={`http://localhost:8080${usuarioFoto}`} 
                          alt="" 
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white shrink-0" 
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <UserCircle size={28} strokeWidth={1.5} />
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">{usuarioNombre}</p>
                        <p className="text-xs text-slate-500 truncate">{usuarioCorreo}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link 
                        to="/veterinario/perfil" 
                        onClick={() => setMenuPerfilOpen(false)} 
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <User size={16} /> Mi Perfil
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50 custom-scrollbar">
          <Outlet /> 
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default VeterinarioDashboard;
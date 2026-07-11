import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, CalendarDays, Users, Clock, 
  LogOut, Menu, Bell, User, ChevronDown, Stethoscope, CheckCircle2, UserCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import logo from '../../../assets/Logo Huesitos.png';
import { obtenerNotificaciones, marcarNotificacionLeida } from '../../../services/notificacionService';

const VeterinarioDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [menuNotificacionesOpen, setMenuNotificacionesOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [imgError, setImgError] = useState(false);

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
      await axios.delete(`https://veterinaria-huesitos-production.up.railway.app/api/notificaciones/usuario/${usuarioId}/todas`, {
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

  const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const baseBtnClass = `group relative flex items-center p-3 rounded-xl mb-1 cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : 'gap-4'}`;
  const activeBtnClass = `${baseBtnClass} bg-white/5 text-white`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:text-white hover:bg-white/5`;

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      <aside className={`relative my-4 ml-4 rounded-[2rem] bg-[#121520] shadow-2xl transition-all duration-300 flex flex-col shrink-0 z-50 ${isCollapsed ? 'w-20' : 'w-71'} ${sidebarOpen ? 'absolute inset-y-0 left-0 translate-x-0' : 'hidden md:flex'}`}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-16 w-7 h-7 bg-sky-500 hover:bg-sky-400 text-white rounded-full items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        <div className={`pt-10 pb-6 px-6 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white p-1 shrink-0 shadow-lg">
            <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Área Médica</span>
              <span className="text-sm font-bold text-white truncate">Vet. Huesitos</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <div className="pt-2 pb-1"><p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestión Clínica</p></div>}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/veterinario' && location.pathname.startsWith(item.path));
            const Icono = item.Icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setSidebarOpen(false)} 
                className={isActive ? activeBtnClass : inactiveBtnClass}
                title={isCollapsed ? item.label : ""}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-sky-500 rounded-r-full shadow-[0_0_12px_rgba(14,165,233,0.6)]"></div>}
                <Icono size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "group-hover:text-white transition-colors"} />
                {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white p-3 rounded-xl transition-colors font-semibold text-sm ${isCollapsed ? 'px-0' : ''}`} title="Cerrar Sesión">
            <LogOut size={20} /> {!isCollapsed && "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-transparent h-24 px-6 md:px-8 flex justify-between items-center z-40 pt-4">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 bg-white p-2 rounded-xl shadow-sm" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden md:flex text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm capitalize">
              {fechaActual}
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            
            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative">
              <button 
                onClick={() => { setMenuNotificacionesOpen(!menuNotificacionesOpen); setMenuPerfilOpen(false); }} 
                className={`relative p-3 rounded-2xl bg-white shadow-sm border border-slate-200 transition-colors ${noLeidas > 0 ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500 hover:border-sky-200'}`}
              >
                <Bell size={20} className={noLeidas > 0 ? 'animate-pulse' : ''} />
                {noLeidas > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-red-500 rounded-full border-2 border-white text-[10px] font-black text-white items-center justify-center">{noLeidas}</span>}
              </button>

              {menuNotificacionesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuNotificacionesOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-800 text-base">Notificaciones</h3>
                        {noLeidas > 0 && <span className="bg-sky-100 text-sky-600 text-xs font-black px-2 py-0.5 rounded-full">{noLeidas}</span>}
                      </div>
                      {notificaciones.length > 0 && (
                        <button onClick={handleLimpiarTodas} className="text-[10px] font-bold uppercase tracking-widest text-sky-500 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
                          Limpiar todas
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col bg-white">
                      {notificaciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                          <Bell size={40} className="text-slate-200 mb-3" strokeWidth={1.5} />
                          <p className="text-sm text-slate-400 font-medium">Bandeja vacía</p>
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

            <div className="relative">
              <button onClick={() => { setMenuPerfilOpen(!menuPerfilOpen); setMenuNotificacionesOpen(false); }} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-sky-300">
                {!imgError ? (
                  <img 
                    src={`https://veterinaria-huesitos-production.up.railway.app${usuarioFoto}`} 
                    alt="Perfil" 
                    className="w-10 h-10 rounded-xl border border-slate-200 object-cover bg-slate-100 shrink-0" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <UserCircle size={24} strokeWidth={1.5} />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{usuarioNombre}</p>
                  <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{usuarioRol}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${menuPerfilOpen ? 'rotate-180' : ''}`}/>
              </button>

              {menuPerfilOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuPerfilOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 z-50 overflow-hidden py-2 animate-in slide-in-from-top-2">
                    <div className="px-5 py-3 border-b border-slate-50 mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conectado como</p>
                      <p className="text-sm font-black text-slate-800 truncate">{usuarioNombre}</p>
                    </div>
                    <Link to="/veterinario/perfil" onClick={() => setMenuPerfilOpen(false)} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                      <User size={18}/> Mi Perfil
                    </Link>
                    <div className="h-px bg-slate-100 my-1 mx-3"></div>
                    <button onClick={handleLogout} className="w-full px-5 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                      <LogOut size={18}/> Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar text-left text-slate-800">
          <Outlet /> 
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default VeterinarioDashboard;
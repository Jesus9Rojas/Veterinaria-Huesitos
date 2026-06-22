import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarDays, Users, Wallet, 
  ShoppingBag, LogOut, Menu, X, Bell, User, ChevronUp, Trash2, CheckCircle2, UserCircle 
} from 'lucide-react';
import logo from '../../../assets/Logo Huesitos.png';
import { 
  obtenerNotificaciones, 
  marcarNotificacionLeida, 
  eliminarNotificacion, 
  limpiarTodasNotificaciones 
} from '../../../services/notificacionService';

const RecepcionDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  
  // ESTADO DE DEFENSA: Evita bucle infinito si la imagen del usuario no carga
  const [imgError, setImgError] = useState(false);
  
  const usuarioId = localStorage.getItem('usuarioId');
  const usuarioCorreo = localStorage.getItem('usuarioCorreo') || 'usuario@huesitos.com';
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Recepcionista';
  const usuarioRol = localStorage.getItem('usuarioRol') || 'RECEPCIONISTA';
  const usuarioFoto = localStorage.getItem('usuarioFoto') || '/uploads/defecto-usuario.png';
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem('usuarioRol');
    if (rol !== 'RECEPCIONISTA' && rol !== 'ADMINISTRADOR') {
      navigate('/');
      return; 
    }

    const cargarNotificaciones = async () => {
      try {
        const data = await obtenerNotificaciones(usuarioId);
        setNotificaciones(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn("La bandeja de notificaciones está vacía o hubo un error de red.", error);
        setNotificaciones([]);
      }
    };

    if (usuarioId) {
      cargarNotificaciones();
    }
  }, [navigate, usuarioId]); 

  const handleLeerNotificacion = async (id) => {
    try {
      if (typeof id === 'number') await marcarNotificacionLeida(id);
      setNotificaciones(notificaciones.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const handleEliminarNotificacion = async (id) => {
    try {
      if (typeof id === 'number') await eliminarNotificacion(id);
      setNotificaciones(notificaciones.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  const handleLimpiarTodas = async () => {
    try {
      if (usuarioId) await limpiarTodasNotificaciones(usuarioId);
      setNotificaciones([]);
      setNotificacionesOpen(false);
    } catch (error) {
      console.error("Error al limpiar notificaciones:", error);
    }
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const menuItems = [
    { path: '/recepcion', icon: <LayoutDashboard size={20} />, label: 'Panel de Control' },
    { path: '/recepcion/citas', icon: <CalendarDays size={20} />, label: 'Agenda y Citas' },
    { path: '/recepcion/clientes', icon: <Users size={20} />, label: 'Admisión (Clientes)' },
    { path: '/recepcion/caja', icon: <Wallet size={20} />, label: 'Caja y Pagos' },
    { path: '/recepcion/tienda', icon: <ShoppingBag size={20} />, label: 'Ventas Tienda' },
  ];

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
  };

  const baseBtnClass = "w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-4 text-sm tracking-wide group";
  const activeBtnClass = `${baseBtnClass} bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 translate-x-1`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100`;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans selection:bg-sky-500 selection:text-white">
      
      {/* SIDEBAR CON ESTILO ADMIN */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-950 flex flex-col border-r border-slate-800 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 shrink-0`}>
        
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 p-1">
              <img src={logo} alt="Logo de la clínica" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight leading-tight">Vet.Huesitos</span>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Panel Recepción</span>
            </div>
          </div>
          <button className="ml-auto md:hidden text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Gestión Diaria</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setSidebarOpen(false)} 
                className={isActive ? activeBtnClass : inactiveBtnClass}
              >
                <div className={isActive ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ÁREA DE PERFIL INFERIOR */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 shrink-0 relative">
          {menuPerfilOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuPerfilOpen(false)}></div>
              <div className="absolute bottom-full mb-2 left-4 right-4 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                <div className="p-4 bg-slate-800 border-b border-slate-700">
                  <p className="font-bold text-white truncate">{usuarioNombre}</p>
                  <p className="text-xs text-slate-400 truncate">{usuarioCorreo}</p>
                </div>
                <div className="p-2">
                  <Link 
                    to="/recepcion/perfil" 
                    onClick={() => setMenuPerfilOpen(false)} 
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-sky-400 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <User size={16} /> Mi Perfil
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2 mt-1"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}

          <button 
            onClick={() => { setMenuPerfilOpen(!menuPerfilOpen); setNotificacionesOpen(false); }}
            className="w-full flex items-center justify-between gap-3 hover:bg-slate-800/50 rounded-2xl p-3 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              
              {/* LÓGICA DE ESCUDO ANTI-BUCLE APLICADA AQUÍ */}
              {!imgError ? (
                <img 
                  src={`http://localhost:8080${usuarioFoto}`} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover bg-slate-900 shrink-0" 
                  onError={() => setImgError(true)} 
                />
              ) : (
                <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center text-slate-400">
                  <UserCircle size={24} strokeWidth={1.5} />
                </div>
              )}

              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold text-white truncate group-hover:text-sky-400 transition-colors">{usuarioNombre}</p>
                <p className="text-[10px] font-black uppercase text-sky-500 tracking-widest truncate">{usuarioRol}</p>
              </div>
            </div>
            <ChevronUp size={16} className={`text-slate-500 shrink-0 transition-transform ${menuPerfilOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700 bg-white p-2 rounded-lg border border-slate-200 shadow-sm" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-800 hidden sm:block">Panel de Control General</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative">
              <button 
                onClick={() => setNotificacionesOpen(!notificacionesOpen)}
                className={`relative p-2.5 transition-colors rounded-full border ${notificacionesNoLeidas > 0 ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-sky-500'}`}
              >
                <Bell size={20} className={notificacionesNoLeidas > 0 ? 'animate-pulse' : ''} />
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white text-[10px] font-black text-white items-center justify-center">
                      {notificacionesNoLeidas}
                    </span>
                  </span>
                )}
              </button>

              {notificacionesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificacionesOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-lg">Notificaciones</h3>
                        {notificacionesNoLeidas > 0 && <span className="bg-sky-100 text-sky-600 text-xs font-black px-2 py-0.5 rounded-full">{notificacionesNoLeidas}</span>}
                      </div>
                      
                      {notificaciones.length > 0 && (
                        <button 
                          onClick={handleLimpiarTodas}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                        >
                          Limpiar todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {notificaciones.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                          <Bell size={32} className="opacity-20" />
                          <p className="text-sm">No tienes notificaciones nuevas</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {notificaciones.map((notif) => (
                            <div key={notif.id} className={`p-4 transition-colors hover:bg-slate-50 group flex gap-3 ${!notif.leida ? 'bg-sky-50/30' : ''}`}>
                              <div className={`mt-0.5 shrink-0 ${!notif.leida ? 'text-sky-500' : 'text-slate-300'}`}>
                                {!notif.leida ? <div className="w-2.5 h-2.5 mt-1 bg-sky-500 rounded-full shadow-sm shadow-sky-500/50"></div> : <CheckCircle2 size={16} />}
                              </div>
                              <div className="flex-1 min-w-0" onClick={() => handleLeerNotificacion(notif.id)}>
                                <p className={`text-[13px] leading-snug cursor-pointer ${!notif.leida ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                  {notif.mensaje}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                  {new Date(notif.fechaCreacion).toLocaleString('es-PE', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEliminarNotificacion(notif.id)} className="text-slate-300 hover:text-red-500" title="Eliminar">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800">Caja Activa</p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Abierta
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <Outlet /> 
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default RecepcionDashboard;
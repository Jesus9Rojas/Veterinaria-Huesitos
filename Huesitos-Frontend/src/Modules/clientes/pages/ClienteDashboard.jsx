import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, CalendarPlus, Heart, CalendarDays, UserCircle, Home, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import logo from '../../../assets/Logo Huesitos.png';
import ModalReservaCliente from '../../../components/ModalReservaCliente';

const ClienteDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
  const [imgError, setImgError] = useState(false); 
  
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Cliente';
  const usuarioFoto = localStorage.getItem('usuarioFoto') || '../../assets/defecto-usuario.jpg';
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('usuarioRol') !== 'CLIENTE') navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { path: '/cliente/mascotas', icon: Heart, label: 'Mis Mascotas' },
    { path: '/cliente/citas', icon: CalendarDays, label: 'Mis Citas e Historial' }
  ];

  const baseBtnClass = `group relative flex items-center p-3 rounded-xl mb-1 cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : 'gap-4'}`;
  const activeBtnClass = `${baseBtnClass} bg-white/5 text-white`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:text-white hover:bg-white/5`;

  const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Portal Cliente</span>
              <span className="text-sm font-bold text-white truncate">Vet. Huesitos</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Mi Panel</p>}
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icono = item.icon;
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
          <button onClick={() => navigate('/')} className={`w-full flex items-center justify-center gap-3 text-slate-400 hover:text-sky-400 p-3 rounded-xl transition-colors font-semibold text-sm mb-1 ${isCollapsed ? 'px-0' : ''}`} title="Volver a la Web">
            <Home size={20} /> {!isCollapsed && "Volver a la Web"}
          </button>
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
            <div className="hidden md:flex flex-col">
              <h2 className="text-xl font-black text-slate-800">¡Hola de nuevo, {usuarioNombre}!</h2>
              <span className="text-xs font-semibold text-slate-500 capitalize">{fechaActual}</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setModalReservaAbierto(true)}
              className="flex items-center gap-2 bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <CalendarPlus size={18} /> <span className="hidden sm:inline">Nueva Cita</span>
            </button>

            <div className="relative">
              <button onClick={() => setMenuPerfilOpen(!menuPerfilOpen)} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-sky-300">
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
                  <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Cliente</p>
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
                    <button onClick={() => navigate('/')} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                      <Home size={18}/> Volver a la Web
                    </button>
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
      
      {modalReservaAbierto && <ModalReservaCliente cerrarModal={() => setModalReservaAbierto(false)} />}
    </div>
  );
};

export default ClienteDashboard;
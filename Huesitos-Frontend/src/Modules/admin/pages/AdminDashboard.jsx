import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Stethoscope, ShieldCheck, Users, 
  Wallet, Settings, LogOut, User, ChevronDown, ChevronLeft, ChevronRight, Clock, Menu
} from 'lucide-react';

import DashboardAnalytics from '../pages/DashboardAnaliticas';
import ConfiguracionDinamica from '../pages/ConfiguracionDinamica';
import UsuariosPage from '../pages/UsuariosPage';
import FinanzasPage from '../pages/FinanzasPage';
import ServicioPage from '../pages/ServicioPage';
import DuenosPage from '../pages/DuenosPage';
import AdminPerfilPage from '../pages/AdminPerfilPage';
import GestionHorariosPage from '../pages/GestionHorariosPage';
import logo from '../../../assets/Logo Huesitos.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);

  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Administrador';
  const usuarioRol = localStorage.getItem('usuarioRol') || 'ADMINISTRADOR';
  const usuarioFoto = localStorage.getItem('usuarioFoto') || '/uploads/defecto-usuario.png';

  useEffect(() => {
    const rol = localStorage.getItem('usuarioRol');
    if (rol !== 'ADMINISTRADOR') navigate('/');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'dashboard': return <DashboardAnalytics />;
      case 'servicios': return <ServicioPage/>;
      case 'usuarios': return <UsuariosPage />;
      case 'duenos': return <DuenosPage />;
      case 'finanzas': return <FinanzasPage />;
      case 'configuracion': return <ConfiguracionDinamica />;
      case 'perfil': return <AdminPerfilPage />;
      case 'horarios': return <GestionHorariosPage />;
      default: return <DashboardAnalytics />;
    }
  };

  const fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const baseBtnClass = `group relative flex items-center p-3 rounded-xl mb-1 cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : 'gap-4'}`;
  const activeBtnClass = `${baseBtnClass} bg-white/5 text-white`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:text-white hover:bg-white/5`;

  const renderSidebarItem = (id, Icon, label) => {
    const isActive = vistaActual === id;
    return (
      <button 
        onClick={() => { setVistaActual(id); setSidebarOpen(false); }}
        className={isActive ? activeBtnClass : inactiveBtnClass}
        title={isCollapsed ? label : ""}
      >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-sky-500 rounded-r-full shadow-[0_0_12px_rgba(14,165,233,0.6)]"></div>}
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "group-hover:text-white transition-colors"} />
        {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{label}</span>}
      </button>
    );
  };

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
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Portal Admin</span>
              <span className="text-sm font-bold text-white truncate">Vet. Huesitos</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {renderSidebarItem('dashboard', LayoutDashboard, 'Panel de Control')}
          
          {!isCollapsed && <div className="pt-4 pb-1"><p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestión Clínica</p></div>}
          {isCollapsed && <div className="h-4"></div>}
          {renderSidebarItem('servicios', Stethoscope, 'Servicios Médicos')}
          {renderSidebarItem('duenos', Users, 'Directorio Clientes')}

          {!isCollapsed && <div className="pt-4 pb-1"><p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administración</p></div>}
          {isCollapsed && <div className="h-4"></div>}
          {renderSidebarItem('finanzas', Wallet, 'Caja y Finanzas')}
          {renderSidebarItem('usuarios', ShieldCheck, 'Usuarios y Roles')}
          {renderSidebarItem('horarios', Clock, 'Gestión de Horarios')}
          {renderSidebarItem('configuracion', Settings, 'Configuración Global')}
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
            <div className="relative">
              <button onClick={() => setMenuPerfilOpen(!menuPerfilOpen)} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-200 transition-colors hover:border-sky-300">
                <img 
                  src={`http://localhost:8080${usuarioFoto}`} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-xl border border-slate-200 object-cover bg-slate-100" 
                  onError={(e) => { 
                    if (!e.target.dataset.error) {
                      e.target.dataset.error = true;
                      e.target.src = '/uploads/defecto-usuario.png'; 
                    }
                  }} 
                />
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
                    <button onClick={() => { setMenuPerfilOpen(false); setVistaActual('perfil'); }} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                      <User size={18}/> Mi Perfil
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
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderizarVista()}
          </div>
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminDashboard;
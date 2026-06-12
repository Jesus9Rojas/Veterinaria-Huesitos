import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarDays, PawPrint, Clock, 
  User, LogOut, Menu, X, Bell,
} from 'lucide-react';
import logo from '../../../assets/Logo Huesitos.png';

const VeterinarioDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Extraemos el correo del veterinario logueado desde la sesión
  const [correo] = useState(localStorage.getItem('usuarioCorreo') || 'veterinario@huesitos.com');
  
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/veterinario', icon: <LayoutDashboard size={20} />, label: 'Inicio' },
    { path: '/veterinario/agenda', icon: <CalendarDays size={20} />, label: 'Mi Agenda' },
    { path: '/veterinario/pacientes', icon: <PawPrint size={20} />, label: 'Mis Pacientes' },
    { path: '/veterinario/horarios', icon: <Clock size={20} />, label: 'Mis Horarios' },
    { path: '/veterinario/perfil', icon: <User size={20} />, label: 'Mi Perfil' },
  ];

  const handleLogout = () => {
    localStorage.clear(); // Limpia el Token y la sesión
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* SIDEBAR (MENÚ LATERAL) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 shadow-sm transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col shrink-0`}>
        {/* Logo de la Clínica */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 p-1">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-lg tracking-tight leading-none">Vet.Huesitos</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Panel Medico/Veterinario</p>
          </div>
          <button className="ml-auto md:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Links de Navegación del Médico */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          <p className="px-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Consultorio</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <div className={`${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>{item.icon}</div>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Perfil del Especialista en la parte inferior */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                Dr
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">Especialista</p>
                <p className="text-xs font-medium text-slate-500 truncate" title={correo}>{correo}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DE LA DERECHA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Cabecera Superior (Navbar) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700 bg-white p-2 rounded-lg border border-slate-200 shadow-sm" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-800 hidden sm:block">Módulo de Atención Médica</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-indigo-500 transition-colors bg-slate-50 rounded-full border border-slate-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-50"></span>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800">Estado de Turno</p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
              </p>
            </div>
          </div>
        </header>

        {/* ÁREA DE TRABAJO CON SCROLL INDEPENDIENTE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet /> 
        </div>
      </main>

      {/* Capa oscura de fondo para menús móviles abiertos */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default VeterinarioDashboard;
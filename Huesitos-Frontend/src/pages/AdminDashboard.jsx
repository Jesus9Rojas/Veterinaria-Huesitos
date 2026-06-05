import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  ShieldCheck, 
  Users, 
  Wallet, 
  Settings, 
  LogOut, 
  User,
  PackageSearch // <-- Ícono para el Inventario
} from 'lucide-react';

import ServiciosPage from './ServicioPage';
import DashboardAnalytics from '../Modules/admin/pages/DashboardAnaliticas';
import ConfiguracionDinamica from '../Modules/admin/pages/ConfiguracionDinamica';
import UsuariosPage from '../Modules/admin/pages/UsuariosPage';
import FinanzasPage from '../Modules/admin/pages/FinanzasPage';
import InventarioPage from '../Modules/admin/pages/InventarioPage';
import DuenosPage from '../Modules/admin/pages/DuenosPage';
import logo from '../assets/Logo Huesitos.png';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [correo] = useState(localStorage.getItem('usuarioCorreo') || 'Admin');
  const [vistaActual, setVistaActual] = useState('dashboard');

  useEffect(() => {
    const rol = localStorage.getItem('usuarioRol');
    if (rol !== 'ADMINISTRADOR') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'dashboard': return <DashboardAnalytics />;
      case 'servicios': return <ServiciosPage />;
      case 'usuarios': return <UsuariosPage />;
      case 'duenos': return <DuenosPage />;
      case 'finanzas': return <FinanzasPage />;
      case 'configuracion': return <ConfiguracionDinamica />;
      case 'inventario': return <InventarioPage />;
      default: return <DashboardAnalytics />;
    }
  };

  // Clases CSS extraídas para el menú lateral
  const baseBtnClass = "w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-4 text-sm tracking-wide group";
  
  // Estilo activo: Usa el mismo gradiente cyan/sky de tu Landing Page
  const activeBtnClass = `${baseBtnClass} bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 translate-x-1`;
  
  // Estilo inactivo: Transparente con hover suave
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* SIDEBAR LATERAL (Estilo Moderno Oscuro) */}
      <aside className="w-72 bg-slate-950 flex flex-col border-r border-slate-800 relative z-20 shadow-2xl">
        {/* Logo de la Clínica */}
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                           <img 
                              src={logo} 
                              alt="Logo de la clínica" 
                            />

            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight leading-tight">Vet.Huesitos</span>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Panel Admin</span>
            </div>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <button onClick={() => setVistaActual('dashboard')} className={vistaActual === 'dashboard' ? activeBtnClass : inactiveBtnClass}>
            <LayoutDashboard size={20} className={vistaActual === 'dashboard' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Panel de Control
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Gestión Clínica</p>
          </div>
          
          <button onClick={() => setVistaActual('servicios')} className={vistaActual === 'servicios' ? activeBtnClass : inactiveBtnClass}>
            <Stethoscope size={20} className={vistaActual === 'servicios' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Servicios Médicos
          </button>

          {/* --- AQUÍ ESTÁ EL NUEVO BOTÓN DEL INVENTARIO --- */}
          <button onClick={() => setVistaActual('inventario')} className={vistaActual === 'inventario' ? activeBtnClass : inactiveBtnClass}>
            <PackageSearch size={20} className={vistaActual === 'inventario' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Inventario y Productos
          </button>
          
          <button onClick={() => setVistaActual('duenos')} className={vistaActual === 'duenos' ? activeBtnClass : inactiveBtnClass}>
            <Users size={20} className={vistaActual === 'duenos' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Directorio Clientes
          </button>

          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Administración</p>
          </div>

          <button onClick={() => setVistaActual('finanzas')} className={vistaActual === 'finanzas' ? activeBtnClass : inactiveBtnClass}>
            <Wallet size={20} className={vistaActual === 'finanzas' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Caja y Finanzas
          </button>

          <button onClick={() => setVistaActual('usuarios')} className={vistaActual === 'usuarios' ? activeBtnClass : inactiveBtnClass}>
            <ShieldCheck size={20} className={vistaActual === 'usuarios' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Usuarios y Roles
          </button>
          
          <button onClick={() => setVistaActual('configuracion')} className={vistaActual === 'configuracion' ? activeBtnClass : inactiveBtnClass}>
            <Settings size={20} className={vistaActual === 'configuracion' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> 
            Configuración Global
          </button>
        </nav>

        {/* Botón Cerrar Sesión */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 border border-red-500/20 hover:shadow-lg hover:shadow-red-500/20">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER SUPERIOR (Glassmorphism sutil) */}
        <header className="bg-white/80 backdrop-blur-md h-20 px-8 flex justify-between items-center shadow-sm z-10 border-b border-slate-200/60 sticky top-0">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Centro de Administración</h1>
          
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-full pr-5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-300 shadow-sm flex items-center justify-center text-white">
              <User size={16} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-slate-600">{correo}</span>
          </div>
        </header>

        {/* CONTENEDOR DINÁMICO DE PÁGINAS */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderizarVista()}
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default AdminDashboard;
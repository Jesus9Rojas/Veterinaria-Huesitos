import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ChevronUp, CalendarPlus, Heart, CalendarDays } from 'lucide-react';
import logo from '../../../assets/Logo Huesitos.png';
import ModalReservaCliente from '../../../components/ModalReservaCliente';

const ClienteDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
  
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Cliente';
  const usuarioFoto = localStorage.getItem('usuarioFoto') || '/uploads/defecto-usuario.png';
  
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
    { path: '/cliente/mascotas', icon: <Heart size={20} />, label: 'Mis Mascotas' },
    { path: '/cliente/citas', icon: <CalendarDays size={20} />, label: 'Mis Citas e Historial' }
  ];

  // ESTILOS IDÉNTICOS AL ADMINISTRADOR Y VETERINARIO
  const baseBtnClass = "w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-4 text-sm tracking-wide group";
  const activeBtnClass = `${baseBtnClass} bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 translate-x-1`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100`;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans selection:bg-sky-500 selection:text-white">
      
      {/* SIDEBAR CON ESTILO ADMIN Y VET */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col shrink-0 text-slate-300`}>
        
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 p-1">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight leading-tight">Vet.Huesitos</span>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Portal Cliente</span>
            </div>
          </div>
          <button className="ml-auto md:hidden text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Mi Panel</p>
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
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
        </div>

        {/* ÁREA DE PERFIL INFERIOR */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 shrink-0 relative">
          {menuPerfilOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuPerfilOpen(false)}></div>
              <div className="absolute bottom-full mb-2 left-4 right-4 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                <div className="p-2">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2">
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}

          <button 
            onClick={() => setMenuPerfilOpen(!menuPerfilOpen)}
            className="w-full flex items-center justify-between gap-3 hover:bg-slate-800/50 rounded-2xl p-3 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={`http://localhost:8080${usuarioFoto}`} 
                alt="Perfil" 
                className="w-10 h-10 rounded-full border border-slate-700 object-cover bg-slate-900 shrink-0" 
                onError={(e) => { 
                  if (!e.target.dataset.error) {
                    e.target.dataset.error = true;
                    e.target.src = '/uploads/defecto-usuario.png'; 
                  }
                }} 
              />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold text-white truncate group-hover:text-sky-400 transition-colors">{usuarioNombre}</p>
                <p className="text-[10px] font-black uppercase text-sky-500 tracking-widest truncate">Cliente</p>
              </div>
            </div>
            <ChevronUp size={16} className={`text-slate-500 shrink-0 transition-transform ${menuPerfilOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700 bg-white p-2 rounded-lg border border-slate-200 shadow-sm" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-800 hidden sm:block">¡Hola de nuevo, {usuarioNombre}!</h2>
          </div>
          
          <button 
            onClick={() => setModalReservaAbierto(true)}
            className="flex items-center gap-2 bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <CalendarPlus size={18} /> Nueva Cita
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-50">
          <Outlet /> 
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      
      {modalReservaAbierto && <ModalReservaCliente cerrarModal={() => setModalReservaAbierto(false)} />}
    </div>
  );
};

export default ClienteDashboard;
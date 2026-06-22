import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageSearch, Syringe, User, LogOut, ChevronDown, Pill, UserCircle, BarChart3, Bug
} from 'lucide-react';

import InventarioPage from '../Modules/auxiliar/pages/InventarioPage'; 
import VacunasPage from '../Modules/auxiliar/pages/VacunasPage'; 
import AuxiliarPerfilPage from '../Modules/auxiliar/pages/AuxiliarPerfilPage'; 
import MedicinasPage from '../Modules/auxiliar/pages/MedicinasPage';
import InventarioCompletoPage from '../Modules/auxiliar/pages/InventarioCompletoPage';
import AntiparasitariosPage from '../Modules/auxiliar/pages/AntiparasitariosPage';
import logo from '../assets/Logo Huesitos.png';

const AuxiliarDashboard = () => {
  const navigate = useNavigate();
  
  const [vistaActual, setVistaActual] = useState('inventario');
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Auxiliar Clínico';
  const usuarioCorreo = localStorage.getItem('usuarioCorreo') || 'auxiliar@huesitos.com';
  const usuarioRol = localStorage.getItem('usuarioRol') || 'AUXILIAR_VETERINARIO';
  const usuarioFoto = localStorage.getItem('usuarioFoto') || '/uploads/defecto-usuario.png';

  useEffect(() => {
    const rol = localStorage.getItem('usuarioRol');
    if (rol !== 'AUXILIAR_VETERINARIO') navigate('/');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'inventario': return <InventarioPage />;
      case 'vacunas': return <VacunasPage />;
      case 'perfil': return <AuxiliarPerfilPage />; 
      case 'medicinas': return <MedicinasPage />;
      case 'inventariocompleto': return <InventarioCompletoPage />;
      case 'antiparasitarios': return <AntiparasitariosPage />; 
      default: return <InventarioPage />;
    }
  };

  const baseBtnClass = "w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-4 text-sm tracking-wide group";
  const activeBtnClass = `${baseBtnClass} bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 translate-x-1`;
  const inactiveBtnClass = `${baseBtnClass} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* MENÚ LATERAL */}
      <aside className="w-72 bg-slate-950 flex flex-col border-r border-slate-800 relative z-20 shadow-2xl">
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <img src={logo} alt="Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight leading-tight">Vet.Huesitos</span>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Panel Auxiliar</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="pb-2"><p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Reportes y Analíticas</p></div>
          <button onClick={() => setVistaActual('inventariocompleto')} className={vistaActual === 'inventariocompleto' ? activeBtnClass : inactiveBtnClass}>
            <BarChart3 size={20} className={vistaActual === 'inventariocompleto' ? "text-white" : "text-slate-500 group-hover:text-indigo-400 transition-colors"} /> Reporte Maestro
          </button>

          <div className="pt-6 pb-2"><p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Almacén y Tienda</p></div>
          <button onClick={() => setVistaActual('inventario')} className={vistaActual === 'inventario' ? activeBtnClass : inactiveBtnClass}>
            <PackageSearch size={20} className={vistaActual === 'inventario' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> Productos e Inventario
          </button>

          <div className="pt-6 pb-2"><p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Farmacia Clínica</p></div>
          <button onClick={() => setVistaActual('vacunas')} className={vistaActual === 'vacunas' ? activeBtnClass : inactiveBtnClass}>
            <Syringe size={20} className={vistaActual === 'vacunas' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> Catálogo de Vacunas
          </button>
          
          <button onClick={() => setVistaActual('medicinas')} className={vistaActual === 'medicinas' ? activeBtnClass : inactiveBtnClass}>
            <Pill size={20} className={vistaActual === 'medicinas' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> Medicinas y Suplementos
          </button>
          <button onClick={() => setVistaActual('antiparasitarios')} className={vistaActual === 'antiparasitarios' ? activeBtnClass : inactiveBtnClass}>
  <Bug size={20} className={vistaActual === 'antiparasitarios' ? "text-white" : "text-slate-500 group-hover:text-sky-400 transition-colors"} /> Antiparasitarios
</button>
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-950/50">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 border border-red-500/20 hover:shadow-lg hover:shadow-red-500/20">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md h-20 px-8 flex justify-between items-center shadow-sm z-10 border-b border-slate-200/60 sticky top-0">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Centro Operativo Clínico</h1>
          
          <div className="relative">
            <button onClick={() => setMenuPerfilOpen(!menuPerfilOpen)} className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-2xl transition-colors cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{usuarioNombre}</p>
                <p className="text-[10px] font-black uppercase text-sky-600 tracking-widest">{usuarioRol.replace('_', ' ')}</p>
              </div>
              
              {!imgError ? (
                <img 
                  src={`http://localhost:8080${usuarioFoto}`} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover bg-white shadow-sm" 
                  onError={() => setImgError(true)} 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
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
                    {!imgError ? (
                      <img 
                        src={`http://localhost:8080${usuarioFoto}`} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white" 
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                        <UserCircle size={28} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{usuarioNombre}</p>
                      <p className="text-xs text-slate-500 truncate">{usuarioCorreo}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setMenuPerfilOpen(false); setVistaActual('perfil'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-colors flex items-center gap-2">
                      <User size={16} /> Mi Perfil
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderizarVista()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuxiliarDashboard;
import { useDashboard } from "../../../hooks/useDashboard";
import { Activity, Users, Stethoscope, Wallet, RefreshCw, Clock } from 'lucide-react';

const DashboardAnaliticas = () => {
  const { stats, loading, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-sky-600 font-semibold animate-pulse gap-3">
        <RefreshCw className="animate-spin" size={32} />
        <p>Cargando métricas en tiempo real...</p>
      </div>
    );
  }

  const colorPorTipo = (tipo) => {
    switch (tipo) {
      case "SERVICIO": return "bg-sky-100 text-sky-700 border-sky-200";
      case "USUARIO": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "CONFIGURACION": return "bg-slate-800 text-slate-100 border-slate-700";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resumen Estadístico</h2>
          <p className="text-slate-500 text-sm mt-1">Métricas en tiempo real</p>
        </div>
        <button 
          onClick={refetch} 
          className="mt-4 sm:mt-0 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-600 transition-all flex items-center gap-2 hover:text-sky-600"
        >
          <RefreshCw size={16} /> Sincronizar Datos
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:shadow-sky-500/10 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 bg-sky-50 w-24 h-24 rounded-full blur-2xl group-hover:bg-sky-100 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Servicios Totales</h3>
            <div className="bg-sky-100 text-sky-600 p-2.5 rounded-xl"><Stethoscope size={20} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 relative z-10">{stats.totalServicios}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 bg-emerald-50 w-24 h-24 rounded-full blur-2xl group-hover:bg-emerald-100 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Servicios Activos</h3>
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl"><Activity size={20} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 relative z-10">{stats.serviciosActivos}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 bg-indigo-50 w-24 h-24 rounded-full blur-2xl group-hover:bg-indigo-100 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Usuarios Total</h3>
            <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl"><Users size={20} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 relative z-10">{stats.totalUsuarios}</p>
        </div>

        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 bg-white/5 w-24 h-24 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Ingresos Caja</h3>
            <div className="bg-white/10 text-white p-2.5 rounded-xl backdrop-blur-sm border border-white/10"><Wallet size={20} /></div>
          </div>
          <p className="text-4xl font-black text-white relative z-10">
            S/ {stats.ingresosTotales ? stats.ingresosTotales.toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex items-center gap-3">
          <Clock className="text-sky-500" size={20} />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Auditoría del Sistema</h3>
        </div>
        
        <div className="p-6">
          {stats.actividades && stats.actividades.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.actividades.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl transition-colors px-3">
                  <div className={`mt-1 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${colorPorTipo(actividad.tipo)}`}>
                    {actividad.tipo}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium text-sm leading-relaxed">{actividad.mensaje}</p>
                    <p className="text-slate-400 text-xs mt-1.5 font-medium flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(actividad.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm font-medium">
              No hay actividad reciente registrada en la base de datos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnaliticas;
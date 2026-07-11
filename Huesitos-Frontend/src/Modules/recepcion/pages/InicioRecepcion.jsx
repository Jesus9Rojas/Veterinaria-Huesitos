import { useState, useEffect } from 'react';
import { CalendarDays, ShoppingBag, Wallet, Clock, ArrowRight, UserPlus, ClipboardList, Stethoscope, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { obtenerCitasPorDia } from '../../../services/citaService';
import { obtenerTransacciones } from '../../../services/finanzasService';

const InicioRecepcion = () => {
  const [metricas, setMetricas] = useState({ citasHoy: 0, pacientesEspera: 0, ingresosTurno: 0 });
  const [proximasCitas, setProximasCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [triggerRecarga, setTriggerRecarga] = useState(0); 

  useEffect(() => {
    let isMounted = true; 

    const extraerDatosDelBackend = async () => {
      try {
        const hoyStr = new Date().toLocaleDateString('en-CA');
        
        const [citasData, transaccionesData] = await Promise.all([
          obtenerCitasPorDia(hoyStr),
          obtenerTransacciones()
        ]);

        const ingresosHoy = transaccionesData
          .filter(tx => tx.estadoPago === 'APROBADO' && tx.fechaCreacion.startsWith(hoyStr))
          .reduce((acumulado, tx) => acumulado + tx.monto, 0);

        let enEspera = 0;
        const citasFormateadas = citasData
          .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
          .map(c => {
            if (c.estado === 'EN_ESPERA') enEspera++;
            
            const timeString = new Date(c.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
            const nombreDueno = c.mascota.dueno?.nombreCompleto || c.mascota.dueno?.nombreCompleto || "No registrado";

            return {
              id: c.id,
              hora: timeString,
              paciente: `${c.mascota.nombre} (${c.mascota.especie})`,
              dueno: nombreDueno,
              motivo: c.servicio.nombre,
              estado: c.estado
            };
          });

        if (isMounted) {
          setMetricas({
            citasHoy: citasData.length,
            pacientesEspera: enEspera,
            ingresosTurno: ingresosHoy
          });
          setProximasCitas(citasFormateadas);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar los datos del panel:", error);
        if (isMounted) setLoading(false);
      }
    };

    extraerDatosDelBackend();

    return () => {
      isMounted = false; 
    };
  }, [triggerRecarga]); 

  const actualizarTurnoManualmente = () => {
    setLoading(true);
    setTriggerRecarga(prev => prev + 1); 
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "EN_ESPERA": return "bg-amber-50 text-amber-600 border-amber-200";
      case "PENDIENTE": return "bg-slate-50 text-slate-600 border-slate-200";
      case "CONFIRMADA": return "bg-sky-50 text-sky-600 border-sky-200";
      case "COMPLETADA": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "CANCELADA": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-sky-600 font-semibold animate-pulse gap-3">
        <RefreshCw className="animate-spin" size={32} />
        <p>Sincronizando operaciones del turno...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Saludo y Refresco */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Bienvenido al Sistema de Recepcion</h1>
        </div>
        <button 
          onClick={actualizarTurnoManualmente}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-600 transition-all flex items-center gap-2 active:scale-95"
        >
          <RefreshCw size={16} /> Actualizar Turno
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:border-sky-300 transition-colors group">
          <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarDays size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Citas para Hoy</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{metricas.citasHoy}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:border-amber-300 transition-colors group">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Sala de Espera</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{metricas.pacientesEspera}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center gap-5 hover:border-emerald-300 transition-colors group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ingresos del Turno</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">S/ {metricas.ingresosTurno.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-200/60 pb-2">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/recepcion/citas" className="bg-gradient-to-r from-sky-500 to-cyan-400 p-4 rounded-2xl text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-1 transition-all flex flex-col gap-3 group">
            <CalendarDays size={24} className="opacity-80 group-hover:opacity-100" />
            <span className="font-bold">Agendar Nueva Cita</span>
          </Link>
          
          <Link to="/recepcion/clientes" className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-3 group">
            <UserPlus size={24} className="text-blue-500" />
            <span className="font-bold text-slate-800">Registrar Cliente</span>
          </Link>

          <Link to="/recepcion/caja" className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-3 group">
            <ClipboardList size={24} className="text-emerald-500" />
            <span className="font-bold text-slate-800">Cobrar Atención</span>
          </Link>

          <Link to="/recepcion/tienda" className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-purple-300 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-3 group">
            <ShoppingBag size={24} className="text-purple-500" />
            <span className="font-bold text-slate-800">Venta de Mostrador</span>
          </Link>
        </div>
      </div>

      {/* PRÓXIMAS CITAS (Tabla) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-sky-500" size={20} /> Agenda del Día
          </h3>
          <Link to="/recepcion/citas" className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            Gestión completa <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente y Dueño</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {proximasCitas.length > 0 ? (
                proximasCitas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800">{cita.hora}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{cita.paciente}</div>
                      <div className="text-xs text-slate-500 font-medium">{cita.dueno}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{cita.motivo}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${getEstadoBadge(cita.estado)}`}>
                        {cita.estado.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3 text-slate-400">
                      <CalendarDays size={24} />
                    </div>
                    <p className="text-slate-500 font-semibold text-sm">No hay citas programadas para el día de hoy.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default InicioRecepcion;
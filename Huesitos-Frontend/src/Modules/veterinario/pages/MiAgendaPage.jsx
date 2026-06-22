import { useState, useEffect } from 'react';
import { 
  CalendarDays, Clock, Activity, ChevronLeft, ChevronRight, 
  CheckCircle2, User, Stethoscope, BookOpen
} from 'lucide-react';
import { obtenerCitasPorDia } from '../../../services/citaService';
import { useNavigate } from 'react-router-dom';

const MiAgendaPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [correoVeterinario] = useState(localStorage.getItem('usuarioCorreo') || '');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const extraerAgendaMédica = async () => {
      try {
        setLoading(true);
        const fechaStr = fechaSeleccionada.toLocaleDateString('en-CA');
        const data = await obtenerCitasPorDia(fechaStr);
        
        if (isMounted) {
          const misCitas = data.filter(cita => 
            cita.veterinario?.correo?.toLowerCase() === correoVeterinario.toLowerCase()
          );
          misCitas.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
          setCitas(misCitas);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar agenda médica:", error);
        if (isMounted) setLoading(false);
      }
    };
    
    if (correoVeterinario) {
      extraerAgendaMédica();
    }
  }, [fechaSeleccionada, correoVeterinario]);

  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const irAHoy = () => setFechaSeleccionada(new Date());

  const handleCambiarFecha = (e) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-');
      setFechaSeleccionada(new Date(year, month - 1, day));
    }
  };

  // Función segura: Redirige directamente al Expediente vinculando el ID de la cita
  const handleAtender = (cita) => {
    navigate(`/veterinario/pacientes/${cita.mascota.id}/historial?citaId=${cita.id}`);
  };

  // ========================================================
  // CORRECCIÓN: Filtramos para que acepte ambos estados
  // ========================================================
  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
  const citasEnEspera = citas.filter(c => c.estado === 'EN_ESPERA');
  const citasCompletadas = citas.filter(c => c.estado === 'COMPLETADA');

  const TarjetaCita = ({ cita, tipo }) => {
    const hora = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const nombreDueño = cita.mascota?.dueño?.nombreCompleto || cita.mascota?.dueno?.nombreCompleto || 'Desconocido';

    let borderCol = "border-slate-200";
    let bgCol = "bg-white hover:shadow-md";
    let btnAtender = null;

    if (tipo === 'espera') {
      borderCol = "border-amber-300 shadow-sm shadow-amber-500/10 cursor-pointer hover:border-amber-400 group";
      bgCol = "bg-gradient-to-b from-amber-50/50 to-white";
      btnAtender = (
        <div className="mt-3 pt-3 border-t border-amber-100">
          <button 
            onClick={(e) => { e.stopPropagation(); handleAtender(cita); }} 
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen size={16}/> Abrir Ficha Clínica
          </button>
        </div>
      );
    } else if (tipo === 'completada') {
      borderCol = "border-emerald-200";
      bgCol = "bg-emerald-50/30 opacity-70 grayscale-[30%]";
    }

    return (
      <div 
        onClick={() => { if (tipo === 'espera') handleAtender(cita); }}
        className={`p-4 rounded-2xl border transition-all duration-300 ${borderCol} ${bgCol}`}
        title={tipo === 'espera' ? "Clic para ir al Historial Médico" : ""}
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-xl font-black text-slate-800 tracking-tight">{hora}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
            tipo === 'espera' ? 'bg-amber-100 text-amber-700 border-amber-200' :
            tipo === 'completada' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {cita.estado.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className={`text-base font-black text-slate-800 leading-tight transition-colors ${tipo === 'espera' ? 'group-hover:text-indigo-600' : ''}`}>
              {cita.mascota?.nombre} 
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1.5 align-middle">
                {cita.mascota?.especie}
              </span>
            </p>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1 truncate">
              <User size={12}/> {nombreDueño}
            </p>
          </div>
          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100/50">
            <p className="text-xs font-bold text-sky-600 truncate flex items-center gap-1.5">
              <Stethoscope size={12}/> {cita.servicio?.nombre}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium" title={cita.motivo}>{cita.motivo}</p>
          </div>
        </div>
        {btnAtender}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 h-full flex flex-col">
      
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-indigo-500" /> Tablero Clínico
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">
            {fechaSeleccionada.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => cambiarDia(-1)} className="p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"><ChevronLeft size={20} /></button>
          <button onClick={irAHoy} className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors hidden sm:block">Hoy</button>
          <div className="relative">
            <input 
              type="date" 
              value={fechaSeleccionada.toLocaleDateString('en-CA')} 
              onChange={handleCambiarFecha}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer hover:border-indigo-400 transition-all shadow-sm"
            />
          </div>
          <button onClick={() => cambiarDia(1)} className="p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden shadow-inner">
          <div className="p-5 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm flex justify-between items-center shrink-0">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Por Atender
            </h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-lg">{citasPendientes.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10"><Activity className="animate-spin text-slate-400" size={24} /></div>
            ) : citasPendientes.length === 0 ? (
              <p className="text-center text-slate-400 text-sm font-medium py-10">No hay pacientes programados.</p>
            ) : (
              citasPendientes.map(cita => <TarjetaCita key={cita.id} cita={cita} tipo="pendiente" />)
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-amber-50/40 border border-amber-200/60 rounded-3xl overflow-hidden shadow-inner ring-1 ring-amber-100/50">
          <div className="p-5 border-b border-amber-200/60 bg-amber-100/30 backdrop-blur-sm flex justify-between items-center shrink-0">
            <h2 className="text-sm font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-amber-500 animate-pulse" /> En Sala de Espera
            </h2>
            <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-sm shadow-amber-500/20">{citasEnEspera.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10"><Activity className="animate-spin text-amber-400" size={24} /></div>
            ) : citasEnEspera.length === 0 ? (
              <p className="text-center text-amber-600/60 text-sm font-medium py-10">La sala de espera está vacía.</p>
            ) : (
              citasEnEspera.map(cita => <TarjetaCita key={cita.id} cita={cita} tipo="espera" />)
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-emerald-50/40 border border-emerald-200/60 rounded-3xl overflow-hidden shadow-inner">
          <div className="p-5 border-b border-emerald-200/60 bg-emerald-100/30 backdrop-blur-sm flex justify-between items-center shrink-0">
            <h2 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Finalizados
            </h2>
            <span className="bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">{citasCompletadas.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10"><Activity className="animate-spin text-emerald-400" size={24} /></div>
            ) : citasCompletadas.length === 0 ? (
              <p className="text-center text-emerald-600/60 text-sm font-medium py-10">No hay atenciones completadas hoy.</p>
            ) : (
              citasCompletadas.map(cita => <TarjetaCita key={cita.id} cita={cita} tipo="completada" />)
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MiAgendaPage;
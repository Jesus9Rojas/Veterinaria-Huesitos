import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CalendarDays, Clock, Activity, ChevronLeft, ChevronRight, 
  CheckCircle2, X, ClipboardType, Thermometer, Weight, PlayCircle, User, Stethoscope
} from 'lucide-react';
import { obtenerCitasPorDia, cambiarEstadoCita } from '../../../services/citaService';

const MiAgendaPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true); // Ya lo usaremos en las columnas
  const [triggerRecarga, setTriggerRecarga] = useState(0);

  const [correoVeterinario] = useState(localStorage.getItem('usuarioCorreo') || '');

  // Estados del Modal de Finalización
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [citaActiva, setCitaActiva] = useState(null);
  const [notaClinica, setNotaClinica] = useState({ peso: '', temperatura: '', diagnostico: '' });
  const [guardando, setGuardando] = useState(false);

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
  }, [fechaSeleccionada, triggerRecarga, correoVeterinario]);

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

  const handleAtender = (cita) => {
    alert(`Iniciando consulta para ${cita.mascota.nombre}... \n(Próximamente esto abrirá el Historial Clínico completo)`);
  };

  const abrirModalFinalizar = (cita) => {
    setCitaActiva(cita);
    setNotaClinica({ peso: '', temperatura: '', diagnostico: '' });
    setModalFinalizarOpen(true);
  };

  const handleCompletarCita = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await cambiarEstadoCita(citaActiva.id, 'COMPLETADA');
      console.log("Nota guardada localmente:", notaClinica);
      setModalFinalizarOpen(false);
      setCitaActiva(null);
      setTriggerRecarga(prev => prev + 1);
    } catch (error) {
      console.error("Error al finalizar consulta:", error);
      alert("No se pudo completar la consulta.");
    } finally {
      setGuardando(false);
    }
  };

  // DIVISION DE CITAS EN 3 COLUMNAS (KANBAN CLÍNICO)
  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
  const citasEnEspera = citas.filter(c => c.estado === 'EN_ESPERA');
  const citasCompletadas = citas.filter(c => c.estado === 'COMPLETADA');

  // Componente de Tarjeta Compacta para las columnas
  const TarjetaCita = ({ cita, tipo }) => {
    const hora = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const nombreDueño = cita.mascota?.dueño?.nombreCompleto || cita.mascota?.dueno?.nombreCompleto || 'Desconocido';

    let borderCol = "border-slate-200";
    let bgCol = "bg-white hover:shadow-md";
    let btnAtender = null;

    if (tipo === 'espera') {
      borderCol = "border-amber-300 shadow-sm shadow-amber-500/10";
      bgCol = "bg-gradient-to-b from-amber-50/50 to-white";
      btnAtender = (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-100">
          <button onClick={() => handleAtender(cita)} className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors">
            <PlayCircle size={14}/> Atender
          </button>
          <button onClick={() => abrirModalFinalizar(cita)} className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-colors">
            <CheckCircle2 size={14}/> Finalizar
          </button>
        </div>
      );
    } else if (tipo === 'completada') {
      borderCol = "border-emerald-200";
      bgCol = "bg-emerald-50/30 opacity-70 grayscale-[30%]";
    }

    return (
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${borderCol} ${bgCol}`}>
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
            <p className="text-base font-black text-slate-800 leading-tight">
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
      
      {/* CABECERA Y CALENDARIO */}
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

      {/* ÁREA DE KANBAN CLÍNICO (3 COLUMNAS) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* COLUMNA 1: PENDIENTES */}
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

        {/* COLUMNA 2: EN SALA DE ESPERA (URGENTES) */}
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

        {/* COLUMNA 3: COMPLETADAS */}
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

      {/* ================= MODAL: FINALIZAR CONSULTA ================= */}
      {modalFinalizarOpen && citaActiva && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalFinalizarOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50 shrink-0">
              <h3 className="text-xl font-black text-indigo-800 flex items-center gap-2"><ClipboardType className="text-indigo-500" /> Conclusión Médica</h3>
              <button type="button" onClick={() => setModalFinalizarOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleCompletarCita} className="p-6 space-y-6">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente Atendido</p>
                  <p className="text-lg font-black text-slate-800">{citaActiva.mascota?.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Servicio</p>
                  <p className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{citaActiva.servicio?.nombre}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Weight size={14} className="text-indigo-400"/> Peso (Kg)
                  </label>
                  <input type="number" step="0.1" value={notaClinica.peso} onChange={e => setNotaClinica({...notaClinica, peso: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" placeholder="Ej. 12.5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Thermometer size={14} className="text-indigo-400"/> Temp. (°C)
                  </label>
                  <input type="number" step="0.1" value={notaClinica.temperatura} onChange={e => setNotaClinica({...notaClinica, temperatura: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" placeholder="Ej. 38.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Diagnóstico Rápido / Conclusión</label>
                <textarea 
                  required 
                  rows="3" 
                  value={notaClinica.diagnostico} 
                  onChange={e => setNotaClinica({...notaClinica, diagnostico: e.target.value})} 
                  placeholder="Escriba el diagnóstico final o resumen de la atención..." 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalFinalizarOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2">
                  {guardando ? 'Guardando...' : <><CheckCircle2 size={18}/> Marcar como Completada</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default MiAgendaPage;
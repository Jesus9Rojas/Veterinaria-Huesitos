import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CalendarDays, Plus, Clock, ChevronLeft, ChevronRight, 
  Stethoscope, User, PawPrint, CheckCircle2, X
} from 'lucide-react';
import { obtenerCitasPorDia, crearCita, cambiarEstadoCita } from '../../../services/citaService';
import { obtenerListaDuenos } from '../../../services/duenoService';
import { listarServicios } from '../../../services/servicioService';
import { obtenerMascotasPorDueno } from '../../../services/mascotaService';
import { obtenerListaUsuarios } from '../../../services/usuarioService';

const CitasPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [triggerRecarga, setTriggerRecarga] = useState(0); 

  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Catálogos
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]); 
  
  const [formCita, setFormCita] = useState({
    duenoId: "", mascotaId: "", servicioId: "", veterinarioId: "", hora: "", motivo: ""
  });

  // --- 1. CARGA DE CATÁLOGOS ---
  useEffect(() => {
    obtenerListaDuenos().then(res => setDuenos(res)).catch(console.error);
    listarServicios().then(res => setServicios(res.filter(s => s.activo))).catch(console.error);
    obtenerListaUsuarios().then(res => {
      setVeterinarios(res.filter(u => u.rol === 'VETERINARIO'));
    }).catch(console.error);
  }, []);

  // --- 2. CARGA DE AGENDA DEL DÍA ---
  useEffect(() => {
    let isMounted = true;
    const extraerAgenda = async () => {
      try {
        const fechaStr = fechaSeleccionada.toLocaleDateString('en-CA'); 
        const data = await obtenerCitasPorDia(fechaStr);
        if (isMounted) {
          data.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
          setCitas(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar la agenda:", error);
        if (isMounted) setLoading(false);
      }
    };
    extraerAgenda();
    return () => { isMounted = false; };
  }, [fechaSeleccionada, triggerRecarga]);

  // --- NAVEGACIÓN DE FECHAS (Flechas y Calendario) ---
  const cambiarDia = (dias) => {
    setLoading(true); 
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const irAHoy = () => {
    setLoading(true);
    setFechaSeleccionada(new Date());
  };

  const handleCambiarFechaCalendario = (e) => {
    const nuevaFechaStr = e.target.value; // Formato YYYY-MM-DD
    if (nuevaFechaStr) {
      setLoading(true);
      // Evitamos problemas de zona horaria separando los valores
      const [year, month, day] = nuevaFechaStr.split('-');
      setFechaSeleccionada(new Date(year, month - 1, day));
    }
  };

  // --- MANEJO DE FORMULARIO ---
  const handleDuenoChange = async (e) => {
    const duenoId = e.target.value;
    setFormCita({ ...formCita, duenoId, mascotaId: "" });
    if (duenoId) {
      try {
        const mascotasData = await obtenerMascotasPorDueno(duenoId);
        setMascotas(mascotasData);
      } catch (error) {
        console.error("Error cargando mascotas:", error);
      }
    } else {
      setMascotas([]);
    }
  };

  const handleGuardarCita = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const fechaStr = fechaSeleccionada.toLocaleDateString('en-CA');
      const fechaHoraISO = `${fechaStr}T${formCita.hora}:00`;

      const nuevaCitaPayload = {
        mascota: { id: parseInt(formCita.mascotaId) },
        servicio: { id: parseInt(formCita.servicioId) },
        fechaHora: fechaHoraISO,
        motivo: formCita.motivo || "Consulta General", 
        estado: "PENDIENTE" 
      };

      if (formCita.veterinarioId) {
        nuevaCitaPayload.veterinario = { id: parseInt(formCita.veterinarioId) };
      }

      await crearCita(nuevaCitaPayload);
      setModalOpen(false);
      setFormCita({ duenoId: "", mascotaId: "", servicioId: "", veterinarioId: "", hora: "", motivo: "" });
      
      setLoading(true);
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error("Error al guardar:", error);
      const msg = error.response?.data || "Verifica que el backend esté ejecutándose.";
      alert(`Hubo un problema al registrar la cita:\n${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (citaId, nuevoEstado) => {
    try {
      await cambiarEstadoCita(citaId, nuevoEstado);
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado de la cita.");
    }
  };

  // --- COLORES ALINEADOS A TU BASE DE DATOS ---
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "PENDIENTE": return "bg-blue-50 text-blue-600 border-blue-200";
      case "CONFIRMADA": return "bg-sky-50 text-sky-600 border-sky-200";
      case "EN_ESPERA": return "bg-amber-50 text-amber-600 border-amber-200";
      case "COMPLETADA": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "CANCELADA": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA CON NAVEGACIÓN Y CALENDARIO */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-sky-500" /> Agenda de Citas
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">
            {fechaSeleccionada.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* CONTROLES DE FECHA (FLECHAS + HOY + CALENDARIO) */}
        <div className="flex flex-wrap justify-center items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 ml-auto">
          <button 
            onClick={() => cambiarDia(-1)} 
            className="p-2 text-slate-500 hover:bg-white hover:text-sky-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
            title="Día anterior"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={irAHoy} 
            className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors hidden sm:block"
          >
            Hoy
          </button>

          {/* EL NUEVO INPUT DE CALENDARIO NATIVO */}
          <div className="relative">
            <input 
              type="date" 
              // Convertimos a en-CA para que se renderice como YYYY-MM-DD sin importar la zona horaria
              value={fechaSeleccionada.toLocaleDateString('en-CA')} 
              onChange={handleCambiarFechaCalendario}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-white cursor-pointer hover:border-sky-400 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => cambiarDia(1)} 
            className="p-2 text-slate-500 hover:bg-white hover:text-sky-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
            title="Día siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
          <Plus size={20} /> Nueva Cita
        </button>
      </div>

      {/* LISTA DE CITAS */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-sky-500 font-semibold animate-pulse gap-3">
            <Clock className="animate-spin" size={32} />
            <p>Cargando agenda...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/50">
            <CalendarDays size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">Agenda libre</p>
            <p className="text-sm">No hay citas programadas para este día.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {citas.map((cita) => {
              const horaFormat = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={cita.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  
                  {/* HORA */}
                  <div className="w-32 shrink-0 text-center lg:text-left">
                    <p className="text-1xl font-black text-slate-800">{horaFormat}</p>
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border mt-2 ${getEstadoColor(cita.estado)}`}>
                      {cita.estado.replace('_', ' ')}
                    </span>
                  </div>

{/* INFO */}
<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
  <div className="space-y-1">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      <PawPrint size={12}/> Paciente
    </p>
    <p className="text-base font-bold text-slate-800">
      {cita.mascota?.nombre}
      <span className="text-xs font-medium text-slate-500">
        ({cita.mascota?.especie})
      </span>
    </p>
    <p className="text-xs text-slate-600 flex items-center gap-1.5">
      <User size={11}/>
      {cita.mascota?.dueño?.nombreCompleto || cita.mascota?.dueno?.nombreCompleto || "No registrado"}
    </p>
  </div>

  <div className="space-y-1">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      <Stethoscope size={12}/> Servicio / Motivo
    </p>
    <p className="text-base font-bold text-slate-800">
      {cita.servicio?.nombre}
    </p>
    <p className="text-xs text-slate-500 truncate">
      {cita.motivo}
    </p>
  </div>

  <div className="space-y-1">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      <User size={12}/> Veterinario
    </p>
    <p className="text-sm font-bold text-slate-700">
      {cita.veterinario?.correo || cita.veterinario?.nombre || "Por asignar"}
    </p>
  </div>
</div>

                  {/* SELECTOR DE ESTADOS ALINEADO A LA BD */}
                  <div className="shrink-0 w-full lg:w-auto">
                    <select 
                      value={cita.estado}
                      onChange={(e) => handleCambiarEstado(cita.id, e.target.value)}
                      className="w-full lg:w-48 border border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                    >
                      <option value="PENDIENTE">Programada (Pendiente)</option>
                      <option value="CONFIRMADA">Confirmada</option>
                      <option value="EN_ESPERA">En Sala de Espera</option>
                      <option value="COMPLETADA">Completada</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL NUEVA CITA */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><CalendarDays className="text-sky-500" /> Agendar Nueva Cita</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardarCita} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={16}/> 1. Datos del Paciente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Dueño (Cliente)</label>
                    <select required value={formCita.duenoId} onChange={handleDuenoChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                      <option value="">Seleccione un dueño...</option>
                      {duenos.map(d => <option key={d.id} value={d.id}>{d.nombreCompleto} - {d.telefono}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Mascota (Paciente)</label>
                    <select required value={formCita.mascotaId} onChange={(e) => setFormCita({...formCita, mascotaId: e.target.value})} disabled={!formCita.duenoId} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                      <option value="">Seleccione mascota...</option>
                      {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.especie})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Stethoscope size={16}/> 2. Detalles Médicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Servicio Solicitado</label>
                    <select required value={formCita.servicioId} onChange={(e) => setFormCita({...formCita, servicioId: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                      <option value="">Seleccione un servicio...</option>
                      {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} - S/ {s.precio ? s.precio.toFixed(2) : '0.00'}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Veterinario Asignado</label>
                    <select value={formCita.veterinarioId} onChange={(e) => setFormCita({...formCita, veterinarioId: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                      <option value="">Sin asignar (Cualquiera)</option>
                      {veterinarios.map(v => <option key={v.id} value={v.id}>{v.correo} (Vet)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Fecha</label>
                    <input type="text" disabled value={fechaSeleccionada.toLocaleDateString('es-PE')} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-600 bg-slate-100 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Hora de Atención</label>
                    <input type="time" required value={formCita.hora} onChange={(e) => setFormCita({...formCita, hora: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Motivo / Notas adicionales</label>
                  <textarea required rows="2" value={formCita.motivo} onChange={(e) => setFormCita({...formCita, motivo: e.target.value})} placeholder="Ej: Chequeo mensual, presenta vómitos, etc." className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                  {guardando ? 'Programando...' : <><CheckCircle2 size={18}/> Agendar Cita</>}
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

export default CitasPage;
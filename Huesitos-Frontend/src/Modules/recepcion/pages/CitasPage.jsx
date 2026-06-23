import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { sileo } from 'sileo';
import { 
  CalendarDays, Plus, Search, User, Clock, 
  Activity, X, CheckCircle2, ChevronRight, ChevronLeft, Stethoscope, ChevronDown, UserPlus, Loader2, LayoutList
} from 'lucide-react';
import { obtenerCitasPorDia, crearCita, cambiarEstadoCita } from '../../../services/citaService';
import { obtenerListaDuenos } from '../../../services/duenoService';
import { obtenerMascotasPorDueno } from '../../../services/mascotaService';
import { listarServicios } from '../../../services/servicioService';
import { obtenerListaUsuarios } from '../../../services/usuarioService';
import Swal from 'sweetalert2';

// Importaciones para el Calendario
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const mensajesCalendario = {
  next: "Siguiente", previous: "Anterior", today: "Hoy", month: "Mes", week: "Semana", day: "Día", 
  agenda: "Lista", date: "Fecha", time: "Hora", event: "Consulta Médica", noEventsInRange: "No hay citas programadas para esta fecha."
};

const CitasPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState('day'); // 'day' o 'agenda'
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [triggerRecarga, setTriggerRecarga] = useState(0); 

  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [citaActivaId, setCitaActivaId] = useState(null);
  const [vetAsignarId, setVetAsignarId] = useState("");
  const [asignando, setAsignando] = useState(false);

  const [visorCitaAbierto, setVisorCitaAbierto] = useState(false);
  const [citaVisualizada, setCitaVisualizada] = useState(null);

  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]); 

  const [dropdownDuenoAbierto, setDropdownDuenoAbierto] = useState(false);
  const [busquedaDueno, setBusquedaDueno] = useState('');

  const [dropdownVeterinarioAbierto, setDropdownVeterinarioAbierto] = useState(false);
  const [busquedaVeterinario, setBusquedaVeterinario] = useState('');
  
  const [formCita, setFormCita] = useState({
    duenoId: "", mascotaId: "", servicioId: "", veterinarioId: "", hora: "", motivo: ""
  });

  const getConfig = useCallback(() => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }, []);

  useEffect(() => {
    obtenerListaDuenos().then(res => setDuenos(res)).catch(console.error);
    listarServicios().then(res => setServicios(res.filter(s => s.activo))).catch(console.error);
    obtenerListaUsuarios().then(res => setVeterinarios(res.filter(u => u.rol === 'VETERINARIO'))).catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const extraerAgenda = async () => {
      try {
        setLoading(true);
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

  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const irAHoy = () => setFechaSeleccionada(new Date());

  const handleCambiarFechaCalendario = (e) => {
    const nuevaFechaStr = e.target.value; 
    if (nuevaFechaStr) {
      const [year, month, day] = nuevaFechaStr.split('-');
      setFechaSeleccionada(new Date(year, month - 1, day));
    }
  };

  const handleSeleccionarDueno = async (duenoId) => {
    setFormCita({ ...formCita, duenoId, mascotaId: "" });
    setDropdownDuenoAbierto(false);
    setBusquedaDueno('');

    if (duenoId) {
      try {
        const mascotasData = await obtenerMascotasPorDueno(duenoId);
        setMascotas(mascotasData);
      } catch {
        // CORRECCIÓN: Se remueve el parámetro 'error' del catch porque no se utilizaba
        setMascotas([]);
      }
    } else {
      setMascotas([]);
    }
  };

  const handleSeleccionarVeterinario = (veterinarioId) => {
    setFormCita({ ...formCita, veterinarioId });
    setDropdownVeterinarioAbierto(false);
    setBusquedaVeterinario('');
  };

  const handleChange = (e) => setFormCita({ ...formCita, [e.target.name]: e.target.value });

  const getVetName = (v) => {
    if (!v) return "";
    if (v.personal && v.personal.nombreCompleto) return v.personal.nombreCompleto;
    if (v.nombreCompleto) return v.nombreCompleto;
    if (v.nombreVisible) return v.nombreVisible;
    return v.correo;
  };

  const abrirModalAsignacion = (citaId) => {
    setCitaActivaId(citaId);
    setVetAsignarId(""); 
    setModalAsignarOpen(true);
  };

  const handleConfirmarAsignacion = async (e) => {
    e.preventDefault();
    setAsignando(true);
    try {
      const peticion = axios.patch(`http://localhost:8080/api/citas/${citaActivaId}/asignar-veterinario?veterinarioId=${vetAsignarId}`, null, getConfig());
      
      sileo.promise(peticion, {
        loading: { title: 'Asignando médico...' },
        success: { title: '¡Asignado!', description: 'El médico ha sido asignado con éxito.' },
        error: (err) => ({
          title: 'Horario no disponible',
          description: typeof err.response?.data === 'string' ? err.response.data : 'El especialista está ocupado o no labora a esta hora.'
        })
      });

      await peticion;
      setModalAsignarOpen(false);
      setTriggerRecarga(prev => prev + 1);
      
      if (citaVisualizada && citaVisualizada.id === citaActivaId) {
        const vet = veterinarios.find(v => v.id.toString() === vetAsignarId);
        setCitaVisualizada({ ...citaVisualizada, veterinario: vet });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAsignando(false);
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

      const peticion = crearCita(nuevaCitaPayload);
      
      sileo.promise(peticion, {
        loading: { title: 'Registrando cita...' },
        success: { title: '¡Cita Registrada!', description: 'El turno ha sido guardado exitosamente.' },
        error: (err) => ({
          title: 'No se pudo registrar',
          description: err.response?.data || "Verifica las restricciones de horario."
        })
      });

      await peticion;
      
      setModalOpen(false);
      setFormCita({ duenoId: "", mascotaId: "", servicioId: "", veterinarioId: "", hora: "", motivo: "" });
      setMascotas([]); 
      
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (citaId, nuevoEstado) => {
    const result = await Swal.fire({
      title: '¿Modificar estado de cita?',
      text: `La cita cambiará al estado: ${renderEstadoTexto(nuevoEstado)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        container: 'z-[99999]',
        popup: 'rounded-3xl shadow-2xl border border-slate-100',
        title: 'text-xl font-black text-slate-800',
        confirmButton: 'bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl px-5 py-2.5 mx-2',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl px-5 py-2.5 mx-2'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const peticion = cambiarEstadoCita(citaId, nuevoEstado);
      
      sileo.promise(peticion, {
        loading: { title: 'Actualizando estado...' },
        success: { title: 'Actualizado', description: 'El estado de la cita fue modificado.' },
        error: { title: 'Error', description: 'No se pudo actualizar el estado de la cita.' }
      });

      await peticion;
      setTriggerRecarga(prev => prev + 1);
      
      if (citaVisualizada && citaVisualizada.id === citaId) {
        setCitaVisualizada({ ...citaVisualizada, estado: nuevoEstado });
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const duenosFiltrados = duenos.filter(d => 
    d.nombreCompleto?.toLowerCase().includes(busquedaDueno.toLowerCase()) ||
    d.correo?.toLowerCase().includes(busquedaDueno.toLowerCase()) ||
    d.telefono?.includes(busquedaDueno)
  );

  const veterinariosFiltrados = veterinarios.filter(v => {
    const nombreStr = getVetName(v).toLowerCase();
    return nombreStr.includes(busquedaVeterinario.toLowerCase()) || v.correo?.toLowerCase().includes(busquedaVeterinario.toLowerCase());
  });

  const duenoSeleccionadoInfo = duenos.find(d => d.id.toString() === formCita.duenoId.toString());
  const veterinarioSeleccionadoInfo = veterinarios.find(v => v.id.toString() === formCita.veterinarioId.toString());

  const renderEstadoTexto = (estado) => {
    switch (estado) {
      case "PENDIENTE": return "PROGRAMADA";
      case "CONFIRMADA": return "CONFIRMADA";
      case "EN_ESPERA": return "EN ESPERA";
      case "COMPLETADA": return "COMPLETADA";
      case "CANCELADA": return "CANCELADA";
      default: return estado;
    }
  }

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

  // ================= CONFIGURACIÓN DEL CALENDARIO ================= //
  const eventosCalendario = citas.map(cita => {
    const startDate = new Date(cita.fechaHora);
    const endDate = new Date(startDate.getTime() + 45 * 60000); // 45 min duración visual
    return {
      id: cita.id,
      title: `${cita.mascota?.nombre} - ${cita.servicio?.nombre}`,
      start: startDate,
      end: endDate,
      resource: cita
    };
  });

  // ESTILOS PASTEL Y TEXTO OSCURO
  const eventStyleGetter = (event) => {
    const estado = event.resource.estado;
    let bg = '#eff6ff'; // blue-50 (PENDIENTE)
    let color = '#1e3a8a'; // blue-900
    let border = '#bfdbfe'; // blue-200

    if (estado === 'CONFIRMADA') { bg = '#f0f9ff'; color = '#0c4a6e'; border = '#bae6fd'; }
    if (estado === 'EN_ESPERA') { bg = '#fffbeb'; color = '#78350f'; border = '#fde68a'; }
    if (estado === 'COMPLETADA') { bg = '#ecfdf5'; color = '#064e3b'; border = '#a7f3d0'; }
    if (estado === 'CANCELADA') { bg = '#fff1f2'; color = '#881337'; border = '#fecdd3'; }

    return {
      style: {
        backgroundColor: bg,
        color: color,
        border: `2px solid ${border}`,
        borderRadius: '12px',
        display: 'block',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        padding: '4px 8px'
      }
    };
  };

  const EventoPersonalizado = ({ event }) => (
    <div className="flex flex-col h-full overflow-hidden px-1 py-0.5">
      <span className="text-[11px] font-black leading-tight mb-0.5 truncate">{event.title}</span>
      <span className="text-[10px] font-bold opacity-80 truncate">{event.resource.veterinario ? `Dr. ${getVetName(event.resource.veterinario)}` : 'Sin asignar'}</span>
    </div>
  );

  const handleSelectEvent = (event) => {
    setCitaVisualizada(event.resource);
    setVisorCitaAbierto(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-sky-500" /> Calendario de Citas
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">
            {fechaSeleccionada.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2 ml-auto">
          {/* Switcher de Vistas */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mr-2">
            <button onClick={() => setVistaCalendario('day')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${vistaCalendario === 'day' ? 'bg-white text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}><Clock size={16} className="inline mr-1"/> Día</button>
            <button onClick={() => setVistaCalendario('agenda')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${vistaCalendario === 'agenda' ? 'bg-white text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}><LayoutList size={16} className="inline mr-1"/> Lista</button>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => cambiarDia(-1)} className="p-2 text-slate-500 hover:bg-white hover:text-sky-600 rounded-xl transition-all shadow-sm"><ChevronLeft size={20} /></button>
            <button onClick={irAHoy} className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-sky-600 hidden sm:block">Hoy</button>
            <input type="date" value={fechaSeleccionada.toLocaleDateString('en-CA')} onChange={handleCambiarFechaCalendario} className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-white cursor-pointer" />
            <button onClick={() => cambiarDia(1)} className="p-2 text-slate-500 hover:bg-white hover:text-sky-600 rounded-xl transition-all shadow-sm"><ChevronRight size={20} /></button>
          </div>
        </div>

        <button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
          <Plus size={20} /> Nueva Cita
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL: CALENDARIO O LISTA PERSONALIZADA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-[600px] text-sky-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Sincronizando agenda...</p>
          </div>
        ) : vistaCalendario === 'day' ? (
          
          <div className="h-[600px] custom-calendar-wrapper animate-in fade-in duration-300">
            <Calendar
              localizer={localizer}
              events={eventosCalendario}
              date={fechaSeleccionada}
              view="day"
              onNavigate={setFechaSeleccionada}
              toolbar={false} 
              step={15}
              timeslots={2}
              min={new Date(0, 0, 0, 8, 0, 0)} 
              max={new Date(0, 0, 0, 21, 0, 0)} 
              messages={mensajesCalendario}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              components={{ event: EventoPersonalizado }}
              className="font-sans text-sm text-slate-600"
            />
          </div>

        ) : (
          
          /* ========================================================= */
          /* NUEVA VISTA LISTA (AGENDA) 100% PERSONALIZADA Y PERFECTA  */
          /* ========================================================= */
          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-4 animate-in fade-in duration-300">
            {citas.length === 0 ? (
              <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                <LayoutList size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-bold">No hay citas en este día</p>
              </div>
            ) : (
              citas.map(cita => {
                const horaFormat = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                const fechaFormat = new Date(cita.fechaHora).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                return (
                  <div 
                    key={cita.id} 
                    onClick={() => { setCitaVisualizada(cita); setVisorCitaAbierto(true); }}
                    className={`flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${getEstadoColor(cita.estado)}`}
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className="text-center shrink-0 min-w-[100px] border-r border-current/20 pr-4">
                        <p className="text-xl font-black tracking-tight">{horaFormat}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{fechaFormat}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black leading-tight flex items-center gap-2">
                          {cita.mascota?.nombre} <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/30 opacity-80 uppercase">{cita.mascota?.especie}</span>
                        </h4>
                        <p className="text-sm font-semibold opacity-90 mt-1">{cita.servicio?.nombre}</p>
                        <p className="text-xs font-medium opacity-70 mt-1 flex items-center gap-1.5"><Stethoscope size={12}/> Dr/a. {getVetName(cita.veterinario) || 'Por asignar'}</p>
                      </div>
                    </div>
                    <div className="shrink-0 mt-4 sm:mt-0 w-full sm:w-auto text-right">
                      <span className="inline-block px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase bg-white/50 border border-current/20">
                        {renderEstadoTexto(cita.estado)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL VISOR DE CITA (NUEVO DISEÑO ENFOCADO AL PACIENTE) ================= */}
      {visorCitaAbierto && citaVisualizada && createPortal(
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setVisorCitaAbierto(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-full flex flex-col overflow-visible animate-in zoom-in-95 duration-200">
            
            {/* Cabecera con Nombre del Paciente Gigante */}
            <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-start shrink-0 bg-sky-50/50 rounded-t-3xl">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{citaVisualizada.mascota?.nombre}</h2>
                <div className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">{citaVisualizada.mascota?.especie}</span>
                  <span className="flex items-center gap-1"><User size={14}/> {citaVisualizada.mascota?.dueño?.nombreCompleto || citaVisualizada.mascota?.dueno?.nombreCompleto}</span>
                </div>
              </div>
              <button type="button" onClick={() => setVisorCitaAbierto(false)} className="text-slate-400 hover:text-slate-700 transition-colors bg-white p-2 rounded-xl shadow-sm border border-slate-200"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Resumen de Hora y Estado */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div>
                  <span className="text-xl font-black text-slate-800 tracking-tight">{new Date(citaVisualizada.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                  <p className="text-xs font-bold text-slate-400 mt-1">{new Date(citaVisualizada.fechaHora).toLocaleDateString('es-PE', { dateStyle: 'long' })}</p>
                </div>
                <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${getEstadoColor(citaVisualizada.estado)}`}>
                  {renderEstadoTexto(citaVisualizada.estado)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Stethoscope size={14}/> Servicio y Motivo</p>
                  <p className="text-base font-bold text-slate-800 bg-white border border-slate-200 p-3 rounded-xl">{citaVisualizada.servicio?.nombre}</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic" title={citaVisualizada.motivo}>"{citaVisualizada.motivo}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><UserPlus size={12}/> Veterinario a Cargo</p>
                  {citaVisualizada.veterinario ? (
                    <p className="text-base font-black text-slate-700">Dr/a. {getVetName(citaVisualizada.veterinario)}</p>
                  ) : (
                    <p className="text-sm font-bold text-amber-500 flex items-center gap-1"><Activity size={14}/> Pendiente de Asignar</p>
                  )}
                </div>
                <button 
                  onClick={() => abrirModalAsignacion(citaVisualizada.id)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <UserPlus size={14} /> Asignar / Cambiar
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Cambiar Estado Operativo</label>
                <div className="relative">
                  <select value={citaVisualizada.estado} onChange={(e) => handleCambiarEstado(citaVisualizada.id, e.target.value)} className="w-full appearance-none border-2 border-slate-200 hover:border-sky-300 p-3.5 pr-10 rounded-xl text-sm font-black text-slate-700 bg-white focus:ring-4 focus:ring-sky-500/20 outline-none cursor-pointer transition-all shadow-sm">
                    <option value="PENDIENTE">Programada (Pendiente)</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="EN_ESPERA">En Espera (Llegó a clínica)</option>
                    <option value="COMPLETADA">Completada (Finalizada)</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL AGENDAR NUEVA CITA ================= */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); setDropdownDuenoAbierto(false); setDropdownVeterinarioAbierto(false); }}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-full flex flex-col overflow-visible animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50 rounded-t-3xl">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><CalendarDays className="text-sky-500" /> Agendar Nueva Cita</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardarCita} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={16}/> 1. Datos del Paciente</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* BUSCADOR DE DUEÑOS */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Dueño (Cliente)</label>
                    <button
                      type="button"
                      onClick={() => { setDropdownDuenoAbierto(!dropdownDuenoAbierto); setDropdownVeterinarioAbierto(false); }}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none hover:border-sky-300 focus:ring-2 focus:ring-sky-500 bg-white shadow-sm flex justify-between items-center transition-all relative z-10"
                    >
                      <span className="truncate flex items-center gap-2">
                        {duenoSeleccionadoInfo ? (
                          <><User size={16} className="text-sky-500"/> {duenoSeleccionadoInfo.nombreCompleto}</>
                        ) : (
                          <><Search size={16} className="text-slate-400"/> Buscar Cliente...</>
                        )}
                      </span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownDuenoAbierto ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownDuenoAbierto && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-60 animate-in fade-in zoom-in-95 duration-200 z-50">
                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                              type="text" autoFocus placeholder="Buscar por nombre o celular..." value={busquedaDueno}
                              onChange={(e) => setBusquedaDueno(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto p-2 custom-scrollbar space-y-1">
                          {duenosFiltrados.map(d => (
                            <button
                              key={d.id} type="button" onClick={() => handleSeleccionarDueno(d.id.toString())}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex flex-col gap-0.5 ${formCita.duenoId === d.id.toString() ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                            >
                              <span>{d.nombreCompleto}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{d.telefono} | {d.correo}</span>
                            </button>
                          ))}
                          {duenosFiltrados.length === 0 && (
                            <div className="text-center py-6 text-slate-400"><span className="text-xs font-bold">No se encontraron clientes</span></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Mascota (Paciente)</label>
                    <select required name="mascotaId" value={formCita.mascotaId} onChange={handleChange} disabled={!formCita.duenoId || mascotas.length === 0} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 text-sm font-semibold">
                      <option value="">{formCita.duenoId ? (mascotas.length > 0 ? "Seleccione mascota..." : "No tiene mascotas") : "Primero busque al dueño..."}</option>
                      {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.especie})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Stethoscope size={16}/> 2. Detalles Médicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Servicio Solicitado</label>
                    <select required name="servicioId" value={formCita.servicioId} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm font-semibold">
                      <option value="">Seleccione un servicio...</option>
                      {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} - S/ {s.precio ? s.precio.toFixed(2) : '0.00'}</option>)}
                    </select>
                  </div>

                  {/* BUSCADOR DE VETERINARIOS */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Veterinario Asignado</label>
                    <button
                      type="button"
                      onClick={() => { setDropdownVeterinarioAbierto(!dropdownVeterinarioAbierto); setDropdownDuenoAbierto(false); }}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none hover:border-sky-300 focus:ring-2 focus:ring-sky-500 bg-white shadow-sm flex justify-between items-center transition-all relative z-10"
                    >
                      <span className="truncate flex items-center gap-2">
                        {veterinarioSeleccionadoInfo ? (
                          <><Stethoscope size={16} className="text-sky-500"/> Dr/a. {getVetName(veterinarioSeleccionadoInfo)}</>
                        ) : (
                          <><Search size={16} className="text-slate-400"/> Sin asignar (Cualquiera)</>
                        )}
                      </span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownVeterinarioAbierto ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownVeterinarioAbierto && (
                      <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-56 animate-in fade-in zoom-in-95 duration-200 z-50">
                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                              type="text" autoFocus placeholder="Buscar médico por nombre..." value={busquedaVeterinario}
                              onChange={(e) => setBusquedaVeterinario(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto p-2 custom-scrollbar space-y-1">
                          <button
                            type="button" onClick={() => handleSeleccionarVeterinario("")}
                            className={`w-full text-left px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${formCita.veterinarioId === "" ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            Sin asignar (Cualquiera)
                          </button>
                          {veterinariosFiltrados.map(v => (
                            <button
                              key={v.id} type="button" onClick={() => handleSeleccionarVeterinario(v.id.toString())}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex flex-col gap-0.5 ${formCita.veterinarioId === v.id.toString() ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                            >
                              <span>Dr/a. {getVetName(v)}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{v.correo}</span>
                            </button>
                          ))}
                          {veterinariosFiltrados.length === 0 && (
                            <div className="text-center py-6 text-slate-400"><span className="text-xs font-bold">No se encontraron veterinarios</span></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Fecha</label>
                    <input type="text" disabled value={fechaSeleccionada.toLocaleDateString('es-PE')} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-600 bg-slate-100 font-medium text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Hora de Atención</label>
                    <input type="time" required name="hora" value={formCita.hora} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Motivo / Notas adicionales</label>
                  <textarea required name="motivo" rows="2" value={formCita.motivo} onChange={handleChange} placeholder="Ej: Chequeo mensual, presenta vómitos, etc." className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                  {guardando ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle2 size={18}/> Agendar Cita</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL ASIGNAR MÉDICO DESDE EL VISOR ================= */}
      {modalAsignarOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalAsignarOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col overflow-visible animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50 rounded-t-3xl">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><UserPlus className="text-sky-500" /> Asignar Especialista</h3>
              <button type="button" onClick={() => setModalAsignarOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleConfirmarAsignacion} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope size={14}/> Médico Veterinario
                </label>
                <select 
                  required
                  value={vetAsignarId} 
                  onChange={(e) => setVetAsignarId(e.target.value)} 
                  className="w-full border-2 border-slate-200 p-3.5 rounded-xl text-slate-700 font-bold outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all bg-slate-50 hover:bg-white cursor-pointer"
                >
                  <option value="" disabled>Seleccione un médico de la lista...</option>
                  {veterinarios.map(v => (
                    <option key={v.id} value={v.id}>Dr/a. {getVetName(v)}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalAsignarOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={asignando} className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                  {asignando ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle2 size={18}/> Confirmar Asignación</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ESTILOS INYECTADOS PARA ARREGLAR REACT-BIG-CALENDAR (SIN ROMPER LA VISTA LISTA) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-calendar-wrapper .rbc-calendar { font-family: inherit; border: none; }
        .custom-calendar-wrapper .rbc-header { padding: 16px 0; font-weight: 900; color: #334155; border-bottom: 2px solid #f1f5f9; text-transform: capitalize; }
        .custom-calendar-wrapper .rbc-allday-cell { display: none; }
        .custom-calendar-wrapper .rbc-time-view { border: 2px solid #f1f5f9; border-radius: 1.5rem; overflow: hidden; background: white; }
        .custom-calendar-wrapper .rbc-time-header.rbc-overflowing { border-right: none; }
        .custom-calendar-wrapper .rbc-timeslot-group { border-bottom: 1px solid #f1f5f9; min-height: 60px; }
        .custom-calendar-wrapper .rbc-time-content > * + * > * { border-left: 2px solid #f1f5f9; }
        .custom-calendar-wrapper .rbc-day-slot .rbc-time-slot { border-top: 1px dashed #e2e8f0; }
        
        .custom-calendar-wrapper .rbc-event {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 12px !important; 
          padding: 4px 8px !important;
        }
        .custom-calendar-wrapper .rbc-event:hover {
          transform: scale(1.02);
          z-index: 50;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }
        .custom-calendar-wrapper .rbc-current-time-indicator { background-color: #ef4444; height: 2px; }
      `}} />
    </div>
  );
};

export default CitasPage;
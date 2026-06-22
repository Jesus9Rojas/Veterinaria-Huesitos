import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  CalendarDays, Plus, Search, User, Clock, 
  Activity, X, CheckCircle2, ChevronRight, ChevronLeft, Stethoscope, ChevronDown, PawPrint, UserPlus, Loader2
} from 'lucide-react';
import { obtenerCitasPorDia, crearCita, cambiarEstadoCita } from '../../../services/citaService';
import { obtenerListaDuenos } from '../../../services/duenoService';
import { obtenerMascotasPorDueno } from '../../../services/mascotaService';
import { listarServicios } from '../../../services/servicioService';
import { obtenerListaUsuarios } from '../../../services/usuarioService';
import Swal from 'sweetalert2';

const CitasPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [triggerRecarga, setTriggerRecarga] = useState(0); 

  const [modalOpen, setModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // ESTADOS PARA EL NUEVO MODAL DE ASIGNAR MÉDICO
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [citaActivaId, setCitaActivaId] = useState(null);
  const [vetAsignarId, setVetAsignarId] = useState("");
  const [asignando, setAsignando] = useState(false);

  // Catálogos
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]); 

  // --- ESTADOS PARA LOS BUSCADORES INTELIGENTES ---
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
    const nuevaFechaStr = e.target.value; 
    if (nuevaFechaStr) {
      setLoading(true);
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
      } catch (error) {
        console.error("Error cargando mascotas:", error);
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

  const handleChange = (e) => {
    setFormCita({ ...formCita, [e.target.name]: e.target.value });
  };

  const getVetName = (v) => {
    if (!v) return "";
    if (v.personal && v.personal.nombreCompleto) return v.personal.nombreCompleto;
    if (v.nombreCompleto) return v.nombreCompleto;
    if (v.nombreVisible) return v.nombreVisible;
    return v.correo;
  };

  // --- 3. LÓGICA DEL NUEVO MODAL DE ASIGNACIÓN ---
  const abrirModalAsignacion = (citaId) => {
    if (veterinarios.length === 0) {
      return Swal.fire('Sin doctores', 'No hay veterinarios activos registrados en el sistema.', 'info');
    }
    setCitaActivaId(citaId);
    setVetAsignarId(""); 
    setModalAsignarOpen(true);
  };

  const handleConfirmarAsignacion = async (e) => {
    e.preventDefault();
    if (!vetAsignarId) {
      Swal.fire('Atención', 'Debes seleccionar un médico de la lista.', 'warning');
      return;
    }

    setAsignando(true);
    try {
      await axios.patch(`http://localhost:8080/api/citas/${citaActivaId}/asignar-veterinario?veterinarioId=${vetAsignarId}`, null, getConfig());
      Swal.fire({ icon: 'success', title: '¡Asignado!', text: 'El médico ha sido asignado con éxito.', timer: 1500, showConfirmButton: false });
      setModalAsignarOpen(false);
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error(error);
      const mensajeBackend = typeof error.response?.data === 'string' ? error.response.data : 'El especialista está ocupado o no labora a esta hora.';
      Swal.fire('Horario no disponible', mensajeBackend, 'error');
    } finally {
      setAsignando(false);
    }
  };

  // --- 4. LÓGICA DE AGENDAMIENTO NUEVO ---
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
      setMascotas([]); 
      
      setLoading(true);
      setTriggerRecarga(prev => prev + 1); 
      Swal.fire({ icon: 'success', title: 'Cita Registrada', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error("Error al guardar:", error);
      const msg = error.response?.data || "Verifica las restricciones de horario.";
      Swal.fire('No se pudo registrar', msg, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (citaId, nuevoEstado) => {
    if (!window.confirm(`¿Seguro que deseas cambiar el estado a ${renderEstadoTexto(nuevoEstado)}?`)) return;
    try {
      await cambiarEstadoCita(citaId, nuevoEstado);
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire('Error', "No se pudo actualizar el estado de la cita.", 'error');
    }
  };

  // --- FILTROS INTELIGENTES ---
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-sky-500" /> Agenda de Citas
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">
            {fechaSeleccionada.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 ml-auto">
          <button onClick={() => cambiarDia(-1)} className="p-2 text-slate-500 hover:bg-white hover:text-sky-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"><ChevronLeft size={20} /></button>
          <button onClick={irAHoy} className="px-3 py-2 text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors hidden sm:block">Hoy</button>
          <div className="relative">
            <input type="date" value={fechaSeleccionada.toLocaleDateString('en-CA')} onChange={handleCambiarFechaCalendario} className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-white cursor-pointer hover:border-sky-400 transition-all shadow-sm" />
          </div>
          <button onClick={() => cambiarDia(1)} className="p-2 text-slate-500 hover:bg-white hover:text-sky-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"><ChevronRight size={20} /></button>
        </div>

        <button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
          <Plus size={20} /> Nueva Cita
        </button>
      </div>

      {/* TABLA AGENDA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 min-h-[400px]">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Clock className="text-slate-400" /> Atenciones Programadas</h2>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-sky-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Sincronizando agenda...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
            <CalendarDays size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">Agenda libre</p>
            <p className="text-sm">No hay citas programadas para este día.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map((cita) => {
              const horaFormat = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
              const nombreDueño = cita.mascota?.dueño?.nombreCompleto || cita.mascota?.dueno?.nombreCompleto || 'Desconocido';
              
              return (
                <div key={cita.id} className="group relative flex flex-col lg:flex-row gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-md transition-all lg:items-center">
                  <div className="lg:w-40 flex flex-col justify-center shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-4">
                    <span className="text-2xl font-black text-slate-800 tracking-tight">{horaFormat}</span>
                    <span className={`inline-block text-center w-max mt-2 px-3 py-1 rounded-md text-[10px] font-black tracking-widest border ${getEstadoColor(cita.estado)}`}>
                      {renderEstadoTexto(cita.estado)}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full py-2">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><PawPrint size={12}/> Paciente</p>
                      <p className="text-base font-bold text-slate-800">{cita.mascota?.nombre}<span className="text-xs font-medium text-slate-500 ml-1">({cita.mascota?.especie})</span></p>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5"><User size={11}/> {nombreDueño}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Stethoscope size={12}/> Servicio / Motivo</p>
                      <p className="text-base font-bold text-slate-800">{cita.servicio?.nombre}</p>
                      <p className="text-xs text-slate-500 truncate" title={cita.motivo}>{cita.motivo}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Veterinario</p>
                      {cita.veterinario ? (
                        <p className="text-sm font-bold text-slate-700">Dr/a. {getVetName(cita.veterinario)}</p>
                      ) : (
                        <button 
                          onClick={() => abrirModalAsignacion(cita.id)}
                          className="flex items-center gap-1 mt-1 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold text-xs rounded-lg transition-colors shadow-sm w-max"
                        >
                          <UserPlus size={14} /> Por asignar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full lg:w-48 flex items-center justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="relative w-full">
                      <select value={cita.estado} onChange={(e) => handleCambiarEstado(cita.id, e.target.value)} className="w-full appearance-none border-2 border-slate-200 hover:border-sky-300 p-3 pr-10 rounded-xl text-sm font-black text-slate-700 bg-slate-50 hover:bg-white focus:ring-4 focus:ring-sky-500/20 outline-none cursor-pointer transition-all shadow-sm">
                        <option value="PENDIENTE">Programada</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="EN_ESPERA">En Espera</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                  {guardando ? 'Programando...' : <><CheckCircle2 size={18}/> Agendar Cita</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL ASIGNAR MÉDICO ================= */}
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

    </div>
  );
};

export default CitasPage;
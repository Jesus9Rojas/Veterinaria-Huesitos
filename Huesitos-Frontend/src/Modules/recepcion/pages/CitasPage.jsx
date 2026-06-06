import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CalendarDays, Plus, Search, User, Clock, 
  Activity, X, CheckCircle2, ChevronRight, ChevronLeft, Stethoscope, ChevronDown, PawPrint
} from 'lucide-react';
import { obtenerCitasPorDia, crearCita, cambiarEstadoCita } from '../../../services/citaService';
import { obtenerListaDuenos } from '../../../services/duenoService';
import { obtenerMascotasPorDueno } from '../../../services/mascotaService';
import { listarServicios } from '../../../services/servicioService';
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

  // --- ESTADOS PARA EL BUSCADOR DE DUEÑOS ---
  const [dropdownDuenoAbierto, setDropdownDuenoAbierto] = useState(false);
  const [busquedaDueno, setBusquedaDueno] = useState('');
  
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
    const nuevaFechaStr = e.target.value; 
    if (nuevaFechaStr) {
      setLoading(true);
      const [year, month, day] = nuevaFechaStr.split('-');
      setFechaSeleccionada(new Date(year, month - 1, day));
    }
  };

  // --- MANEJO DE FORMULARIO ---
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

  const handleChange = (e) => {
    setFormCita({ ...formCita, [e.target.name]: e.target.value });
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
      setMascotas([]); 
      
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
    if (!window.confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;
    try {
      await cambiarEstadoCita(citaId, nuevoEstado);
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado de la cita.");
    }
  };

  // --- FILTRO INTELIGENTE DE DUEÑOS ---
  const duenosFiltrados = duenos.filter(d => 
    d.nombreCompleto?.toLowerCase().includes(busquedaDueno.toLowerCase()) ||
    d.correo?.toLowerCase().includes(busquedaDueno.toLowerCase()) ||
    d.telefono?.includes(busquedaDueno)
  );

  const duenoSeleccionadoInfo = duenos.find(d => d.id.toString() === formCita.duenoId.toString());

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

      {/* AGENDA DEL DÍA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 min-h-[400px]">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="text-slate-400" /> Atenciones Programadas
        </h2>

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
                // ¡CORRECCIÓN AQUÍ! lg:items-center mantiene todo perfectamente centrado horizontalmente
                <div key={cita.id} className="group relative flex flex-col lg:flex-row gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-md transition-all lg:items-center">
                  
                  {/* HORA Y ESTADO */}
                  <div className="lg:w-40 flex flex-col justify-center shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-4">
                    <span className="text-2xl font-black text-slate-800 tracking-tight">{horaFormat}</span>
                    <span className={`inline-block w-max mt-2 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getEstadoColor(cita.estado)}`}>
                      {cita.estado.replace('_', ' ')}
                    </span>
                  </div>

                  {/* INFO DE LA CITA */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full py-2">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <PawPrint size={12}/> Paciente
                      </p>
                      <p className="text-base font-bold text-slate-800">
                        {cita.mascota?.nombre}
                        <span className="text-xs font-medium text-slate-500 ml-1">
                          ({cita.mascota?.especie})
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <User size={11}/> {nombreDueño}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Stethoscope size={12}/> Servicio / Motivo
                      </p>
                      <p className="text-base font-bold text-slate-800">
                        {cita.servicio?.nombre}
                      </p>
                      <p className="text-xs text-slate-500 truncate" title={cita.motivo}>
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

                  {/* ¡CORRECCIÓN AQUÍ! SELECTOR CON ESTILO DE BOTÓN CENTRADO */}
                  <div className="shrink-0 w-full lg:w-48 flex items-center justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="relative w-full">
                      <select 
                        value={cita.estado}
                        onChange={(e) => handleCambiarEstado(cita.id, e.target.value)}
                        className="w-full appearance-none border-2 border-slate-200 hover:border-sky-300 p-3 pr-10 rounded-xl text-sm font-black text-slate-700 bg-slate-50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-sky-500/20 outline-none cursor-pointer transition-all shadow-sm"
                      >
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

      {/* ================= MODAL AGENDAR CITA ================= */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><CalendarDays className="text-sky-500" /> Agendar Nueva Cita</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardarCita} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={16}/> 1. Datos del Paciente</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BUSCADOR DE DUEÑOS (DROPDOWN) */}
                  <div className="relative z-20">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Dueño (Cliente)</label>
                    <button
                      type="button"
                      onClick={() => setDropdownDuenoAbierto(!dropdownDuenoAbierto)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none hover:border-sky-300 focus:ring-2 focus:ring-sky-500 bg-white shadow-sm flex justify-between items-center transition-all"
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
                      <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-64 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Buscar por nombre o celular..."
                              value={busquedaDueno}
                              onChange={(e) => setBusquedaDueno(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto p-2 custom-scrollbar space-y-1">
                          {duenosFiltrados.map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleSeleccionarDueno(d.id.toString())}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex flex-col gap-0.5 ${formCita.duenoId === d.id.toString() ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                            >
                              <span>{d.nombreCompleto}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{d.telefono} | {d.correo}</span>
                            </button>
                          ))}
                          {duenosFiltrados.length === 0 && (
                            <div className="text-center py-6 text-slate-400">
                              <span className="text-xs font-bold">No se encontraron clientes</span>
                            </div>
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

              {/* CIERRE CONDICIONAL DEL DROPDOWN */}
              {dropdownDuenoAbierto && (
                <div className="fixed inset-0 z-10" onClick={() => setDropdownDuenoAbierto(false)}></div>
              )}

              <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 space-y-4 relative z-0">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Stethoscope size={16}/> 2. Detalles Médicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Servicio Solicitado</label>
                    <select required name="servicioId" value={formCita.servicioId} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm font-semibold">
                      <option value="">Seleccione un servicio...</option>
                      {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} - S/ {s.precio ? s.precio.toFixed(2) : '0.00'}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Veterinario Asignado</label>
                    <select name="veterinarioId" value={formCita.veterinarioId} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm font-semibold">
                      <option value="">Sin asignar (Cualquiera)</option>
                      {veterinarios.map(v => <option key={v.id} value={v.id}>Dr/a. {v.nombreCompleto || v.correo}</option>)}
                    </select>
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

    </div>
  );
};

export default CitasPage;
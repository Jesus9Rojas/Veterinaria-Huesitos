import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, Stethoscope, Search, User, BookOpen, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { obtenerCitasHoy, cambiarEstadoCita } from '../../../services/citaService';
import RecetaCobroAdicionalModal from '../../../components/RecetaCobroAdicionalModal';

const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true
});

const ConsultasVeterinarioPage = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [busqueda, setBusqueda] = useState('');

  const [modalRecetaOpen, setModalRecetaOpen] = useState(false);
  const [citaActiva, setCitaActiva] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCitas = async () => {
      setLoading(true);
      try {
        const data = await obtenerCitasHoy();
        const usuarioId = parseInt(localStorage.getItem('usuarioId'));
        const misCitas = data.filter(c => c.veterinario && c.veterinario.id === usuarioId);
        if (isMounted) setCitas(misCitas);
      } catch (error) {
        console.error("Error cargando citas:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCitas();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  const citasFiltradas = citas.filter(c => 
    (c.mascota?.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.mascota?.dueño?.nombreCompleto || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoCita(id, nuevoEstado);
      Toast.fire({ icon: 'success', title: `Estado actualizado a ${nuevoEstado.replace('_', ' ')}` });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al cambiar el estado' });
    }
  };

  const abrirModalReceta = (cita) => {
    setCitaActiva(cita);
    setModalRecetaOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Stethoscope className="text-sky-500" /> Mi Consultorio (Hoy)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Atiende a tus pacientes, redacta consultas y receta insumos.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-sky-500 font-semibold animate-pulse gap-3"><Activity className="animate-spin" size={32} /><p>Sincronizando agenda...</p></div>
        ) : citasFiltradas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-slate-400 bg-slate-50/50"><Stethoscope size={48} className="mb-4 opacity-20" /><p className="text-lg font-bold">No hay pacientes programados para hoy</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Servicio</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones Médicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {citasFiltradas.map((cita) => {
                  const hora = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={cita.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-700 whitespace-nowrap">{hora}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">{cita.mascota?.nombre} <span className="text-xs text-slate-400">({cita.mascota?.especie})</span></div>
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5"><User size={12}/> {cita.mascota?.dueño?.nombreCompleto}</div>
                      </td>
                      <td className="px-6 py-4"><span className="font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">{cita.servicio?.nombre}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cita.estado === 'EN_PROGRESO' ? 'bg-blue-50 text-blue-600 border-blue-200' : cita.estado === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{cita.estado.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {cita.estado === 'EN_ESPERA' || cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA' ? (
                          <button onClick={() => actualizarEstado(cita.id, 'EN_PROGRESO')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl transition-all"><Clock size={16} /> Iniciar Consulta</button>
                        ) : cita.estado === 'EN_PROGRESO' ? (
                          <div className="flex justify-end gap-2">
                            {/* 1. ATAJO AL HISTORIAL CLÍNICO */}
                            <Link to={`/veterinario/pacientes/${cita.mascota?.id}/historial?citaId=${cita.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold rounded-xl shadow-md transition-all">
                              <BookOpen size={16} /> Historial
                            </Link>

                            {/* 2. ATAJO RÁPIDO PARA RECETAS/INSUMOS (RESTAURADO) */}
                            <button onClick={() => abrirModalReceta(cita)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-bold rounded-xl shadow-md transition-all">
                              <Pill size={16} /> Insumos
                            </button>

                            {/* 3. BOTÓN FINALIZAR */}
                            <button onClick={() => actualizarEstado(cita.id, 'COMPLETADA')} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl transition-all">
                              <CheckCircle2 size={16} /> Finalizar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1"><CheckCircle2 size={14}/> Atendido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL RESTAURADO */}
      {modalRecetaOpen && citaActiva && (
        <RecetaCobroAdicionalModal 
          citaId={citaActiva.id}
          onClose={() => setModalRecetaOpen(false)}
          onGuardadoExitoso={() => {
            setModalRecetaOpen(false);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

    </div>
  );
};
export default ConsultasVeterinarioPage;
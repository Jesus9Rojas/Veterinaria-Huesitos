import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Syringe, Bug, BookOpen, Save, FileDown, CheckCircle2, Pill, Activity, Clock, Plus, Trash2 } from 'lucide-react';
import { sileo } from 'sileo';
import axios from 'axios';
import { 
  guardarConsultaMedica, obtenerConsultasMascota,
  aplicarVacuna, obtenerHistorialVacunas,
  aplicarDesparasitacion, obtenerHistorialAnti,
  recetarMedicinasYCobrar, emitirRecetaPdf, obtenerRecetasMascota
} from '../../../services/historialClinicoService';

const HistorialClinicoPage = () => {
  const { id: mascotaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const citaId = new URLSearchParams(location.search).get('citaId');

  const [activeTab, setActiveTab] = useState('CONSULTA');
  const [procesando, setProcesando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [consultas, setConsultas] = useState([]);
  const [historialVacunas, setHistorialVacunas] = useState([]);
  const [historialAnti, setHistorialAnti] = useState([]);
  const [historialRecetas, setHistorialRecetas] = useState([]);

  const [catalogos, setCatalogos] = useState({ vacunas: [], antiparasitarios: [], medicinas: [] });

  const [formConsulta, setFormConsulta] = useState({ motivoConsulta: '', sintomas: '', diagnostico: '', tratamiento: '', observaciones: '' });
  const [formVacuna, setFormVacuna] = useState({ itemId: '', dosisOTipo: '', fechaAplicacion: new Date().toISOString().slice(0,10), fechaProxima: '', observaciones: '' });
  const [formAnti, setFormAnti] = useState({ itemId: '', fechaAplicacion: new Date().toISOString().slice(0,10), fechaProxima: '', observaciones: '' });
  
  const [recetaConsultaId, setRecetaConsultaId] = useState('');
  const [medicinaSeleccionada, setMedicinaSeleccionada] = useState('');
  const [carritoMedicinas, setCarritoMedicinas] = useState([]); 
  const [formReceta, setFormReceta] = useState({ medicamentos: '', indicaciones: '' }); 

  useEffect(() => {
    let isMounted = true;
    const cargarTodo = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const [vacs, antis, meds, consData, hvData, haData, recData] = await Promise.all([
          axios.get("http://localhost:8080/api/vacunas", { headers }),
          axios.get("http://localhost:8080/api/antiparasitarios", { headers }),
          axios.get("http://localhost:8080/api/medicinas", { headers }),
          obtenerConsultasMascota(mascotaId), 
          obtenerHistorialVacunas(mascotaId),
          obtenerHistorialAnti(mascotaId), 
          obtenerRecetasMascota(mascotaId)
        ]);
        
        if(isMounted) {
          setCatalogos({ 
            vacunas: vacs.data.filter(v => v.stock > 0 && v.activo !== false), 
            antiparasitarios: antis.data.filter(a => a.stock > 0 && a.activo !== false),
            medicinas: meds.data.filter(m => m.stock > 0 && m.activo !== false)
          });
          
          setConsultas(consData || []); 
          setHistorialVacunas(hvData || []); 
          setHistorialAnti(haData || []); 
          setHistorialRecetas(recData || []);
          
          if(consData && consData.length > 0) setRecetaConsultaId(consData[0].id);
        }
      } catch (error) {
        console.error("Error al cargar historial", error);
      } finally {
        if(isMounted) setLoading(false);
      }
    };
    cargarTodo();
    return () => { isMounted = false; };
  }, [mascotaId, refresh]);

  const handleGuardarConsulta = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const payload = {
        ...formConsulta,
        mascota: { id: mascotaId },
        veterinario: { id: localStorage.getItem('usuarioId') }
      };
      if (citaId) payload.cita = { id: citaId };
      
      const peticion = guardarConsultaMedica(payload);
      
      sileo.promise(peticion, {
        loading: { title: 'Guardando expediente...' },
        success: { title: '¡Guardado!', description: 'Consulta registrada en el historial' },
        error: { title: 'Error', description: 'No se pudo guardar la consulta' }
      });

      await peticion;

      setFormConsulta({ motivoConsulta: '', sintomas: '', diagnostico: '', tratamiento: '', observaciones: '' });
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error(error); 
    } finally { setProcesando(false); }
  };

  const handleGuardarVacuna = async (e) => {
    e.preventDefault();
    if (!citaId) return sileo.warning({ title: 'Aviso', description: 'Para descontar stock necesitas abrir desde una Cita activa.' });
    setProcesando(true);
    try {
      const peticion = aplicarVacuna(mascotaId, citaId, formVacuna);
      
      sileo.promise(peticion, {
        loading: { title: 'Aplicando biológico...' },
        success: { title: '¡Vacuna aplicada!', description: 'El cobro fue enviado a Caja.' },
        error: { title: 'Error', description: 'No se pudo aplicar la vacuna' }
      });

      await peticion;

      setFormVacuna({ itemId: '', dosisOTipo: '', fechaAplicacion: new Date().toISOString().slice(0,10), fechaProxima: '', observaciones: '' });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error(error); 
    } finally { setProcesando(false); }
  };

  const handleGuardarAnti = async (e) => {
    e.preventDefault();
    if (!citaId) return sileo.warning({ title: 'Aviso', description: 'Para descontar stock necesitas abrir desde una Cita activa.' });
    setProcesando(true);
    try {
      const peticion = aplicarDesparasitacion(mascotaId, citaId, formAnti);
      
      sileo.promise(peticion, {
        loading: { title: 'Aplicando producto...' },
        success: { title: '¡Éxito!', description: 'Desparasitación guardada y cobro enviado a Caja.' },
        error: { title: 'Error', description: 'No se pudo aplicar el producto' }
      });

      await peticion;

      setFormAnti({ itemId: '', fechaAplicacion: new Date().toISOString().slice(0,10), fechaProxima: '', observaciones: '' });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error(error); 
    } finally { setProcesando(false); }
  };

  const agregarMedicinaACarrito = () => {
    if(!medicinaSeleccionada) return;
    const med = catalogos.medicinas.find(m => m.id.toString() === medicinaSeleccionada);
    if(med) {
      setCarritoMedicinas([...carritoMedicinas, { id: med.id, nombre: med.nombre, cantidad: 1 }]);
      setFormReceta(prev => ({
        ...prev,
        medicamentos: prev.medicamentos 
          ? prev.medicamentos + `\n- 01 ${med.nombre}`
          : `- 01 ${med.nombre}`
      }));
      setMedicinaSeleccionada('');
    }
  };

  const removerDelCarrito = (index) => {
    setCarritoMedicinas(carritoMedicinas.filter((_, idx) => idx !== index));
  };

  const handleEmitirReceta = async (e) => {
    e.preventDefault();
    if (!recetaConsultaId) return sileo.error({ title: 'Error', description: 'Debes tener una consulta registrada primero.' });
    
    if (!formReceta.medicamentos || formReceta.medicamentos.trim() === '') {
      return sileo.warning({ title: 'Atención', description: 'Escribe o selecciona al menos un medicamento.' });
    }

    setProcesando(true);
    try {
      let peticionCobro = null;
      if (carritoMedicinas.length > 0) {
        if (!citaId) throw new Error("Para vender medicinas de clínica debes estar en una cita activa.");
        const payloadCobro = carritoMedicinas.map(c => ({ tipoItem: 'MEDICINA', itemId: c.id, cantidad: c.cantidad }));
        peticionCobro = recetarMedicinasYCobrar(citaId, payloadCobro);
      }

      const peticionReceta = emitirRecetaPdf(recetaConsultaId, { 
        medicamentos: formReceta.medicamentos, 
        indicaciones: formReceta.indicaciones 
      });

      sileo.promise(Promise.all([peticionCobro, peticionReceta]), {
        loading: { title: 'Generando documentos...' },
        success: { title: '¡Receta Emitida!', description: 'Se generó el PDF y los cobros en caja.' },
        error: (err) => ({ title: 'Error', description: err.message || 'No se pudo emitir la receta' })
      });

      await Promise.all([peticionCobro, peticionReceta]);
      
      setCarritoMedicinas([]); 
      setFormReceta({ medicamentos: '', indicaciones: '' });
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error(error); 
    } finally { setProcesando(false); }
  };

  if(loading) return <div className="flex flex-col items-center justify-center h-64 text-sky-500 animate-pulse"><Activity size={48} className="animate-spin mb-4" /><p className="font-bold">Cargando expediente...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><BookOpen className="text-sky-500" /> Expediente Clínico</h1>
          <p className="text-slate-500 text-sm mt-1">Registra la atención médica. El sistema descontará stock y cobrará automáticamente.</p>
        </div>
        <button onClick={() => navigate(-1)} className="bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">Volver</button>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto">
        <button onClick={() => setActiveTab('CONSULTA')} className={`flex-1 min-w-max flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'CONSULTA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><FileText size={18} /> Consultas</button>
        <button onClick={() => setActiveTab('PREVENCION')} className={`flex-1 min-w-max flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'PREVENCION' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}><Syringe size={18} /> Vacunas y Prevención</button>
        <button onClick={() => setActiveTab('RECETAS')} className={`flex-1 min-w-max flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'RECETAS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}><Pill size={18} /> Recetas</button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60">
        
        {/* ==================================================== */}
        {/* TABS 1: CONSULTAS */}
        {/* ==================================================== */}
        {activeTab === 'CONSULTA' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleGuardarConsulta} className="space-y-4 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 h-max">
              <h3 className="font-black text-indigo-800 flex items-center gap-2 border-b border-indigo-200 pb-2"><FileText size={18}/> Redactar Nueva Consulta</h3>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Motivo de Consulta</label><input required value={formConsulta.motivoConsulta} onChange={e => setFormConsulta({...formConsulta, motivoConsulta: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Síntomas / Anamnesis</label><textarea required value={formConsulta.sintomas} onChange={e => setFormConsulta({...formConsulta, sintomas: e.target.value})} rows="3" className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Diagnóstico Presuntivo</label><textarea required value={formConsulta.diagnostico} onChange={e => setFormConsulta({...formConsulta, diagnostico: e.target.value})} rows="3" className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Plan de Tratamiento</label><textarea required value={formConsulta.tratamiento} onChange={e => setFormConsulta({...formConsulta, tratamiento: e.target.value})} rows="2" className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Observaciones</label><textarea value={formConsulta.observaciones} onChange={e => setFormConsulta({...formConsulta, observaciones: e.target.value})} rows="2" className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea></div>
              <button type="submit" disabled={procesando} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"><Save size={18}/> Guardar Consulta en Historial</button>
            </form>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 h-[750px] flex flex-col">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-indigo-500"/> Histórico de Consultas</h3>
              <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {consultas.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-xl">
                    <p className="text-slate-400 font-bold text-sm">No hay consultas médicas previas registradas.</p>
                  </div>
                ) : (
                  consultas.map(c => (
                    <div key={c.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3 border-b pb-2">
                        <div>
                          <p className="font-black text-slate-800 text-base">{c.motivoConsulta}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">{new Date(c.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                          Dr. {c.veterinario?.correo?.split('@')[0] || 'Desconocido'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600"><strong className="text-slate-700">Síntomas:</strong> {c.sintomas}</p>
                        <p className="text-sm text-slate-600"><strong className="text-slate-700">Diagnóstico:</strong> {c.diagnostico}</p>
                        <p className="text-sm text-slate-600"><strong className="text-slate-700">Tratamiento:</strong> {c.tratamiento}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TABS 2: PREVENCIÓN Y CARNET */}
        {/* ==================================================== */}
        {activeTab === 'PREVENCION' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <form onSubmit={handleGuardarVacuna} className="space-y-4 bg-sky-50/50 p-6 rounded-2xl border border-sky-100">
                <h3 className="font-black text-sky-800 flex items-center gap-2 border-b border-sky-200 pb-2"><Syringe size={18}/> Aplicar Vacuna Clínica</h3>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Biológico a usar (Cobra en Caja)</label>
                <select required value={formVacuna.itemId} onChange={e => setFormVacuna({...formVacuna, itemId: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl bg-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"><option value="">-- Selecciona Vacuna --</option>{catalogos.vacunas.map(v => <option key={v.id} value={v.id}>{v.nombre} (Stock: {v.stock})</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Dosis / Etiqueta</label>
                  <input required type="text" value={formVacuna.dosisOTipo} onChange={e => setFormVacuna({...formVacuna, dosisOTipo: e.target.value})} placeholder="Ej: 1ra Dosis" className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Fecha Aplicación</label>
                  <input required type="date" value={formVacuna.fechaAplicacion} onChange={e => setFormVacuna({...formVacuna, fechaAplicacion: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" /></div>
                </div>
                <div><label className="block text-xs font-bold text-emerald-600 mb-1">Carnet: Próxima Dosis</label>
                <input required type="date" value={formVacuna.fechaProxima} onChange={e => setFormVacuna({...formVacuna, fechaProxima: e.target.value})} className="w-full border-2 border-emerald-300 p-2.5 rounded-xl bg-emerald-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Observaciones de la Vacuna</label>
                <textarea value={formVacuna.observaciones} onChange={e => setFormVacuna({...formVacuna, observaciones: e.target.value})} rows="2" className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Temperatura normal, reaccionó bien..."></textarea></div>
                <button type="submit" disabled={procesando} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl transition-colors"><CheckCircle2 className="inline mr-2" size={18}/> Aplicar y Cobrar</button>
              </form>
              
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 h-[350px] flex flex-col">
                <h4 className="font-black text-slate-800 mb-3 text-sm flex items-center gap-2"><Clock size={16} className="text-sky-500"/> Historial de Vacunación</h4>
                <div className="overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar">
                  {historialVacunas.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 font-bold p-4 bg-white rounded-lg border border-dashed">Sin vacunas previas.</p>
                  ) : (
                    historialVacunas.map(h => (
                      <div key={h.id} className="text-xs p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex justify-between font-black mb-1"><span className="text-sky-700 text-sm">{h.vacuna?.nombre || 'Vacuna eliminada'} ({h.dosis})</span><span className="text-slate-400 font-bold">{h.fechaAplicacion}</span></div>
                        <p className="text-slate-500 mb-2">{h.observaciones || 'Sin observaciones.'}</p>
                        <div className="text-emerald-700 font-black bg-emerald-100 border border-emerald-200 inline-block px-2.5 py-1 rounded-md">Próxima Dosis: {h.fechaProximaDosis}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleGuardarAnti} className="space-y-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                <h3 className="font-black text-orange-800 flex items-center gap-2 border-b border-orange-200 pb-2"><Bug size={18}/> Aplicar Antiparasitario</h3>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Producto a usar (Cobra en Caja)</label>
                <select required value={formAnti.itemId} onChange={e => setFormAnti({...formAnti, itemId: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"><option value="">-- Selecciona Producto --</option>{catalogos.antiparasitarios.map(a => <option key={a.id} value={a.id}>[{a.tipo}] {a.nombre} (Stock: {a.stock})</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Fecha Aplicación</label>
                  <input required type="date" value={formAnti.fechaAplicacion} onChange={e => setFormAnti({...formAnti, fechaAplicacion: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-emerald-600 mb-1">Carnet: Próxima Dosis</label>
                  <input required type="date" value={formAnti.fechaProxima} onChange={e => setFormAnti({...formAnti, fechaProxima: e.target.value})} className="w-full border-2 border-emerald-300 p-2.5 rounded-xl bg-emerald-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Observaciones</label>
                <textarea value={formAnti.observaciones} onChange={e => setFormAnti({...formAnti, observaciones: e.target.value})} rows="2" className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Aplicado en lomo, peso del paciente..."></textarea></div>
                <button type="submit" disabled={procesando} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-colors"><CheckCircle2 className="inline mr-2" size={18}/> Aplicar y Cobrar</button>
              </form>
              
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 h-[350px] flex flex-col">
                <h4 className="font-black text-slate-800 mb-3 text-sm flex items-center gap-2"><Clock size={16} className="text-orange-500"/> Historial de Desparasitación</h4>
                <div className="overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar">
                  {historialAnti.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 font-bold p-4 bg-white rounded-lg border border-dashed">Sin desparasitaciones previas.</p>
                  ) : (
                    historialAnti.map(h => (
                      <div key={h.id} className="text-xs p-3 bg-white border border-slate-200 mb-2 rounded-lg shadow-sm">
                        <div className="flex justify-between font-black mb-1"><span className="text-orange-700 text-sm">{h.producto} ({h.tipo})</span><span className="text-slate-400 font-bold">{h.fechaAplicacion}</span></div>
                        <p className="text-slate-500 mb-2">{h.observaciones || 'Sin observaciones.'}</p>
                        <div className="text-emerald-700 font-black bg-emerald-100 border border-emerald-200 inline-block px-2.5 py-1 rounded-md">Próxima Aplicación: {h.fechaProximaAplicacion}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TABS 3: RECETAS */}
        {/* ==================================================== */}
        {activeTab === 'RECETAS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleEmitirReceta} className="space-y-5 bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100 h-max">
              <h3 className="font-black text-emerald-800 flex items-center gap-2"><Pill size={18}/> Emisión de Receta y Venta</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Vincular a la Consulta</label>
                <select required value={recetaConsultaId} onChange={e => setRecetaConsultaId(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-xl bg-white font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">-- Seleccione Consulta Previa --</option>
                  {consultas.map(c => <option key={c.id} value={c.id}>{new Date(c.fecha).toLocaleDateString()} - {c.motivoConsulta}</option>)}
                </select>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <label className="block text-xs font-bold text-emerald-700 mb-2">Paso 1: Agregar Medicamentos de Clínica (Cobro Automático en Caja)</label>
                
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <select 
                    value={medicinaSeleccionada} 
                    onChange={e => setMedicinaSeleccionada(e.target.value)} 
                    className="w-full sm:flex-1 border border-slate-300 p-2.5 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                  >
                    <option value="">-- Catálogo de Medicinas --</option>
                    {catalogos.medicinas.map(m => <option key={m.id} value={m.id}>{m.nombre} (Stock: {m.stock}) - S/{m.precio.toFixed(2)}</option>)}
                  </select>
                  
                  <button 
                    type="button" 
                    onClick={agregarMedicinaACarrito} 
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-1 font-bold shadow-sm shrink-0"
                  >
                    <Plus size={18}/> Añadir
                  </button>
                </div>
                
                {carritoMedicinas.length > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 border-b border-emerald-200 pb-1">Enviados a cuenta de Caja:</p>
                    <ul className="space-y-2">
                      {carritoMedicinas.map((c, i) => (
                        <li key={i} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{c.nombre}</span>
                          <button type="button" onClick={() => removerDelCarrito(i)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"><Trash2 size={14}/></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Paso 2: Texto final de Medicamentos para la Receta PDF</label>
                <textarea required value={formReceta.medicamentos} onChange={e => setFormReceta({...formReceta, medicamentos: e.target.value})} rows="3" className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Aquí aparecerán las medicinas que selecciones arriba. También puedes escribir libremente recetas humanas..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Paso 3: Indicaciones y Dosis</label>
                <textarea required value={formReceta.indicaciones} onChange={e => setFormReceta({...formReceta, indicaciones: e.target.value})} rows="3" className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: Dar 1/2 tableta cada 24 horas por 3 días después de comer..."></textarea>
              </div>

              <button type="submit" disabled={procesando} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg transition-all text-base"><Save className="inline mr-2" size={20}/> Guardar y Generar PDF</button>
            </form>

            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 h-[750px] flex flex-col">
              <h4 className="font-black text-slate-800 mb-4 text-base flex items-center gap-2"><FileDown size={20} className="text-emerald-500"/> Historial de Recetas Emitidas</h4>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {historialRecetas.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-xl">
                    <p className="text-slate-400 font-bold text-sm">El paciente no tiene recetas registradas.</p>
                  </div>
                ) : (
                  historialRecetas.map(r => (
                    <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors">
                      <div>
                        <p className="font-black text-base text-slate-800">Receta #{r.id}</p>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">{r.fechaEmision}</p>
                      </div>
                      <a href={`http://localhost:8080/api/recetas/${r.id}/pdf`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"><FileDown size={14}/> Imprimir PDF</a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistorialClinicoPage;
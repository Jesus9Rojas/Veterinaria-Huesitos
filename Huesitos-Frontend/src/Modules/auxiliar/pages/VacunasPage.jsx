import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Syringe, Plus, Activity, X, Info, Edit, Trash2, ArchiveRestore, Search, Eye, EyeOff, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { obtenerCatalogoVacunas, registrarVacunaCatalogo, actualizarVacunaCatalogo, desactivarVacuna, reactivarVacuna } from "../../../services/vacunaService";

const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true,
  didOpen: (toast) => { toast.onmouseenter = Swal.stopTimer; toast.onmouseleave = Swal.resumeTimer; }
});

const VacunasPage = () => {
  const [vacunas, setVacunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  
  const [form, setForm] = useState({ id: null, nombre: "", proveedor: "", descripcion: "", especieDestino: "TODOS", precio: "", stock: "" });

  useEffect(() => {
    let isMounted = true;
    const fetchVacunas = async () => {
      setLoading(true);
      try {
        const data = await obtenerCatalogoVacunas();
        if (isMounted) setVacunas(data);
      } catch (error) {
        console.error("Error al cargar el catálogo de vacunas:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchVacunas();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  // SOLUCIÓN APLICADA: Filtro estricto (O solo activos, O solo suspendidos)
  const vacunasFiltradas = vacunas.filter(v => {
    const matchBusqueda = (v.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                          (v.proveedor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (v.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
                          
    const esActiva = v.activo !== false; 
    const matchEstado = mostrarInactivos ? !esActiva : esActiva;
    
    return matchBusqueda && matchEstado;
  });

  const abrirModalNuevo = () => {
    setForm({ id: null, nombre: "", proveedor: "", descripcion: "", especieDestino: "TODOS", precio: "", stock: "" });
    setModalOpen(true);
  };

  const abrirModalEditar = (vacuna) => {
    setForm({
      id: vacuna.id,
      nombre: vacuna.nombre || "",
      proveedor: vacuna.proveedor || "",
      descripcion: vacuna.descripcion || "",
      especieDestino: vacuna.especieDestino || "TODOS",
      precio: vacuna.precio !== null && vacuna.precio !== undefined ? vacuna.precio : "",
      stock: vacuna.stock !== null && vacuna.stock !== undefined ? vacuna.stock : ""
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardarVacuna = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const payload = {
        nombre: form.nombre,
        proveedor: form.proveedor,
        descripcion: form.descripcion,
        especieDestino: form.especieDestino,
        precio: parseFloat(form.precio) || 0.0,
        stock: parseInt(form.stock) || 0,
        activo: form.id ? (vacunas.find(v => v.id === form.id)?.activo !== false) : true
      };

      if (form.id) {
        await actualizarVacunaCatalogo(form.id, payload);
        Toast.fire({ icon: 'success', title: 'Vacuna actualizada con éxito' });
      } else {
        await registrarVacunaCatalogo(payload);
        Toast.fire({ icon: 'success', title: 'Nueva vacuna registrada' });
      }
      setModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Ocurrió un error al guardar la información' });
    } finally {
      setProcesando(false);
    }
  };

  const handleDesactivar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Suspender biológico?', text: `"${nombre}" ya no aparecerá en las consultas.`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, suspender', cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await desactivarVacuna(id);
      setRefreshTrigger(prev => prev + 1);
      Toast.fire({ icon: 'info', title: 'Biológico suspendido' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al suspender' });
      setLoading(false);
    }
  };

  const handleReactivar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Habilitar biológico?', text: `"${nombre}" volverá a estar disponible.`,
      icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, habilitar', cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await reactivarVacuna(id);
      setRefreshTrigger(prev => prev + 1);
      Toast.fire({ icon: 'success', title: 'Biológico habilitado' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al habilitar' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Syringe className="text-sky-500" /> Catálogo de Vacunas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Administra costos, preventistas y el estado de los biológicos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <button 
            onClick={() => setMostrarInactivos(!mostrarInactivos)}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${mostrarInactivos ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
          >
            {mostrarInactivos ? <Eye size={18}/> : <EyeOff size={18}/>}
            <span className="text-sm hidden sm:inline">{mostrarInactivos ? 'Ver Activas' : 'Ver Suspendidas'}</span>
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar vacuna o laboratorio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          <button onClick={abrirModalNuevo} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
            <Plus size={20} /> <span className="hidden sm:inline">Nueva Vacuna</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-sky-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Sincronizando registros...</p>
          </div>
        ) : vacunasFiltradas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-slate-400 bg-slate-50/50">
            <Syringe size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">{mostrarInactivos ? 'Sin Suspendidas' : 'Catálogo Vacío'}</p>
            <p className="text-sm">{mostrarInactivos ? 'No hay vacunas suspendidas actualmente.' : 'No se encontraron vacunas registradas en esta vista.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-[25%]">Biológico</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Preventista</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Precio Venta</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Stock Clínico</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {vacunasFiltradas.map((vacuna) => {
                  const inactivo = vacuna.activo === false;
                  return (
                    <tr key={vacuna.id} className={`transition-colors ${inactivo ? 'bg-slate-50/80 opacity-60 grayscale' : 'hover:bg-sky-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="line-clamp-2">{vacuna.nombre}</span>
                          {inactivo && <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded-full shrink-0 font-black">SUSPENDIDO</span>}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border 
                          ${vacuna.especieDestino === 'PERRO' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                            vacuna.especieDestino === 'GATO' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 
                            'bg-emerald-50 text-emerald-600 border-emerald-200'}`}
                        >
                          {vacuna.especieDestino}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Truck size={14} className="text-slate-400"/>
                          {vacuna.proveedor || <span className="text-amber-500 font-semibold text-xs">Falta completar</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 whitespace-nowrap">
                        S/ {vacuna.precio ? vacuna.precio.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-black border ${(!vacuna.stock || vacuna.stock <= 5) && !inactivo ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {vacuna.stock || 0} Unid.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {inactivo ? (
                          <button 
                            onClick={() => handleReactivar(vacuna.id, vacuna.nombre)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl transition-all"
                          >
                            <ArchiveRestore size={16} /> Habilitar
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => abrirModalEditar(vacuna)} className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all" title="Completar / Editar datos"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDesactivar(vacuna.id, vacuna.nombre)} className="inline-flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all" title="Suspender acceso"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      {modalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Syringe className="text-sky-500" size={20} /> {form.id ? 'Completar / Editar Ficha' : 'Registrar Nueva Vacuna'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleGuardarVacuna} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <p className="text-xs text-slate-500 flex items-start gap-2 bg-sky-50 p-3 rounded-xl border border-sky-100 font-medium">
                <Info className="text-sky-500 shrink-0" size={16} />
                Completa las casillas de precio de venta y existencias disponibles para que el software actualice los cobros en caja de forma automática.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre comercial de la vacuna</label>
                  <input required type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Quíntuple Canina" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Laboratorio o Preventista de contacto</label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input required type="text" name="proveedor" value={form.proveedor} onChange={handleChange} placeholder="Ej: Zoetis, MSD Animal Health" className="w-full pl-9 pr-3 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Especie destino</label>
                  <select required name="especieDestino" value={form.especieDestino} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white cursor-pointer transition-all">
                    <option value="TODOS">TODOS (Perros y Gatos)</option>
                    <option value="PERRO">Solo PERROS</option>
                    <option value="GATO">Solo GATOS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stock en almacén</label>
                  <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange} placeholder="0" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Precio al público (S/)</label>
                  <input required type="number" step="0.10" min="0" name="precio" value={form.precio} onChange={handleChange} placeholder="0.00" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-600 bg-emerald-50 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Descripción clínica (Opcional)</label>
                <textarea rows="2" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Notas clínicas adicionales..." className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={procesando} className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                  {procesando ? 'Guardando...' : 'Guardar Información'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

    </div>
  );
};

export default VacunasPage;
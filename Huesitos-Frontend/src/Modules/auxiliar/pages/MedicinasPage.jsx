import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pill, Plus, Activity, X,  Edit, Trash2, ArchiveRestore, Search, Eye, EyeOff, FlaskConical, PackagePlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';
import { obtenerCatalogoMedicinas, registrarMedicina, actualizarMedicina, desactivarMedicina, reactivarMedicina } from "../../../services/medicinaService";

const MedicinasPage = () => {
  const [medicinas, setMedicinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [itemParaStock, setItemParaStock] = useState(null);
  const [cantidadAdd, setCantidadAdd] = useState('');
  const [procesandoStock, setProcesandoStock] = useState(false);

  const [form, setForm] = useState({ id: null, nombre: "", proveedor: "", descripcion: "", precio: "", stock: "" });

  useEffect(() => {
    let isMounted = true;
    const fetchMedicinas = async () => {
      setLoading(true);
      try {
        const data = await obtenerCatalogoMedicinas();
        if (isMounted) setMedicinas(data);
      } catch (error) {
        console.error("Error al cargar medicinas:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMedicinas();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  const medicinasFiltradas = medicinas.filter(m => {
    const matchBusqueda = (m.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                          (m.proveedor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (m.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
                          
    const esActiva = m.activo !== false; 
    const matchEstado = mostrarInactivos ? !esActiva : esActiva;
    
    return matchBusqueda && matchEstado;
  });

  const abrirModalNuevo = () => {
    setForm({ id: null, nombre: "", proveedor: "", descripcion: "", precio: "", stock: "" });
    setModalOpen(true);
  };

  const abrirModalEditar = (medicina) => {
    setForm({
      id: medicina.id,
      nombre: medicina.nombre || "",
      proveedor: medicina.proveedor || "",
      descripcion: medicina.descripcion || "",
      precio: medicina.precio !== null ? medicina.precio : "",
      stock: medicina.stock !== null ? medicina.stock : ""
    });
    setModalOpen(true);
  };

  const abrirModalStock = (medicina) => {
    setItemParaStock(medicina);
    setCantidadAdd('');
    setModalStockOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardarMedicina = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const payload = {
        nombre: form.nombre,
        proveedor: form.proveedor,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio) || 0.0,
        stock: parseInt(form.stock) || 0,
        activo: form.id ? (medicinas.find(m => m.id === form.id)?.activo !== false) : true
      };

      const peticion = form.id ? actualizarMedicina(form.id, payload) : registrarMedicina(payload);

      sileo.promise(peticion, {
        loading: { title: 'Guardando fármaco...' },
        success: { title: '¡Éxito!', description: form.id ? 'Fármaco actualizado' : 'Nuevo fármaco registrado' },
        error: { title: 'Error', description: 'Error al guardar la información' }
      });

      await peticion;
      setModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  const handleSumarStockSubmit = async (e) => {
    e.preventDefault();
    setProcesandoStock(true);
    try {
      const nuevoStock = (itemParaStock.stock || 0) + parseInt(cantidadAdd);
      const payload = {
        nombre: itemParaStock.nombre,
        proveedor: itemParaStock.proveedor,
        descripcion: itemParaStock.descripcion,
        precio: itemParaStock.precio,
        stock: nuevoStock,
        activo: itemParaStock.activo
      };

      const peticion = actualizarMedicina(itemParaStock.id, payload);

      sileo.promise(peticion, {
        loading: { title: 'Sumando stock...' },
        success: { title: '¡Stock Actualizado!', description: `Nuevo stock: ${nuevoStock} unidades` },
        error: { title: 'Error', description: 'No se pudo actualizar el stock.' }
      });

      await peticion;
      setModalStockOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setProcesandoStock(false);
    }
  };

  const handleDesactivar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Suspender fármaco?', text: `"${nombre}" ya no estará disponible para recetas.`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, suspender', cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        container: 'z-[99999]', popup: 'rounded-3xl shadow-2xl border border-slate-100',
        title: 'text-xl font-black text-slate-800',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-5 py-2.5 mx-2',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl px-5 py-2.5 mx-2'
      }
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const peticion = desactivarMedicina(id);

      sileo.promise(peticion, {
        loading: { title: 'Suspendiendo...' },
        success: { title: 'Suspendido', description: 'El medicamento fue ocultado' },
        error: { title: 'Error', description: 'No se pudo suspender' }
      });

      await peticion;
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleReactivar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Habilitar fármaco?', text: `"${nombre}" volverá a estar disponible.`,
      icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, habilitar', cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        container: 'z-[99999]', popup: 'rounded-3xl shadow-2xl border border-slate-100',
        title: 'text-xl font-black text-slate-800',
        confirmButton: 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl px-5 py-2.5 mx-2',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl px-5 py-2.5 mx-2'
      }
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const peticion = reactivarMedicina(id);

      sileo.promise(peticion, {
        loading: { title: 'Habilitando...' },
        success: { title: '¡Listo!', description: 'Fármaco reactivado' },
        error: { title: 'Error', description: 'No se pudo habilitar' }
      });

      await peticion;
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Pill className="text-sky-500" /> Farmacia Clínica
          </h1>
          <p className="text-slate-500 text-sm mt-1">Control de medicamentos, laboratorios y stock.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <button onClick={() => setMostrarInactivos(!mostrarInactivos)} className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${mostrarInactivos ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}>
            {mostrarInactivos ? <Eye size={18}/> : <EyeOff size={18}/>} 
            <span className="text-sm hidden sm:inline">{mostrarInactivos ? 'Ver Activos' : 'Ver Suspendidos'}</span>
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar medicina..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
          </div>

          <button onClick={abrirModalNuevo} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
            <Plus size={20} /> <span className="hidden sm:inline">Nuevo Fármaco</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-sky-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Cargando farmacia...</p>
          </div>
        ) : medicinasFiltradas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-slate-400 bg-slate-50/50">
            <Pill size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">{mostrarInactivos ? 'Sin Suspendidos' : 'Sin registros'}</p>
            <p className="text-sm">{mostrarInactivos ? 'No hay medicamentos suspendidos actualmente.' : 'No se encontraron medicamentos en esta vista.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-[30%]">Medicamento</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Laboratorio</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Precio Venta</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Stock Clínico</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {medicinasFiltradas.map((medicina) => {
                  const inactivo = medicina.activo === false;
                  return (
                    <tr key={medicina.id} className={`transition-colors ${inactivo ? 'bg-slate-50/80 opacity-60 grayscale' : 'hover:bg-sky-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="line-clamp-2">{medicina.nombre}</span>
                          {inactivo && <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded-full shrink-0 font-black">SUSPENDIDO</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]" title={medicina.descripcion}>{medicina.descripcion || 'Sin descripción'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <FlaskConical size={14} className="text-slate-400"/>
                          {medicina.proveedor || 'Sin registrar'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 whitespace-nowrap">
                        S/ {medicina.precio ? medicina.precio.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-black border ${(!medicina.stock || medicina.stock <= 5) && !inactivo ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {medicina.stock || 0} Unid.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {inactivo ? (
                          <button onClick={() => handleReactivar(medicina.id, medicina.nombre)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl transition-all">
                            <ArchiveRestore size={16} /> Habilitar
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {/* BOTÓN SUMAR STOCK */}
                            <button onClick={() => abrirModalStock(medicina)} className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl transition-all" title="Sumar Stock">
                              <PackagePlus size={16} />
                            </button>
                            <button onClick={() => abrirModalEditar(medicina)} className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all" title="Editar datos">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDesactivar(medicina.id, medicina.nombre)} className="inline-flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all" title="Suspender acceso">
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
                <Pill className="text-sky-500" size={20} /> {form.id ? 'Editar Fármaco' : 'Registrar Nuevo Fármaco'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleGuardarMedicina} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre del Medicamento</label>
                  <input required type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Meloxicam, Tramadol..." className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Laboratorio o Proveedor</label>
                  <div className="relative">
                    <FlaskConical className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="text" name="proveedor" value={form.proveedor} onChange={handleChange} placeholder="Ej: Bayer, Zoetis..." className="w-full pl-9 pr-3 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stock en almacén</label>
                  <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange} placeholder="0" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Precio de Venta (S/)</label>
                  <input required type="number" step="0.10" min="0" name="precio" value={form.precio} onChange={handleChange} placeholder="0.00" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-600 bg-emerald-50 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Descripción / Concentración</label>
                <textarea rows="2" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Ej: 5mg/ml - Analgésico y Antiinflamatorio" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm"></textarea>
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

      {/* MODAL PARA SUMAR STOCK */}
      {modalStockOpen && itemParaStock && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalStockOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PackagePlus className="text-emerald-500" size={20} /> Sumar Stock
              </h3>
              <button onClick={() => setModalStockOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSumarStockSubmit} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Producto Destino</p>
                <p className="text-base font-black text-slate-800 line-clamp-2">{itemParaStock.nombre}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1">Stock actual: {itemParaStock.stock || 0}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Cantidad a ingresar</label>
                <input required type="number" min="1" value={cantidadAdd} onChange={e => setCantidadAdd(e.target.value)} className="w-full border border-slate-300 p-3 rounded-xl text-center text-xl font-black text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-all" placeholder="+ 0" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalStockOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={procesandoStock} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2">
                  {procesandoStock ? 'Sumando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

    </div>
  );
};

export default MedicinasPage;
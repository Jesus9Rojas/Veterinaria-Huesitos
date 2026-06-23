import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bug, Plus, Activity, X, Edit, Trash2, ArchiveRestore, Search, Eye, EyeOff, Shield, PackagePlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';
import { 
  obtenerCatalogoAntiparasitarios, registrarAntiparasitario, 
  actualizarAntiparasitario, desactivarAntiparasitario, reactivarAntiparasitario 
} from "../../../services/antiparasitarioService";

const AntiparasitariosPage = () => {
  const [antiparasitarios, setAntiparasitarios] = useState([]);
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
  
  const [form, setForm] = useState({
    id: null, nombre: "", proveedor: "", descripcion: "", tipo: "INTERNO", especieDestino: "TODOS", precio: "", stock: ""
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAntiparasitarios = async () => {
      setLoading(true);
      try {
        const data = await obtenerCatalogoAntiparasitarios();
        if (isMounted) setAntiparasitarios(data);
      } catch (error) {
        console.error("Error al cargar antiparasitarios:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAntiparasitarios();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  const antiparasitariosFiltrados = antiparasitarios.filter(a => {
    const matchBusqueda = (a.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                          (a.proveedor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (a.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
                          
    const esActiva = a.activo !== false; 
    const matchEstado = mostrarInactivos ? !esActiva : esActiva;
    
    return matchBusqueda && matchEstado;
  });

  const abrirModalNuevo = () => {
    setForm({ id: null, nombre: "", proveedor: "", descripcion: "", tipo: "INTERNO", especieDestino: "TODOS", precio: "", stock: "" });
    setModalOpen(true);
  };

  const abrirModalEditar = (anti) => {
    setForm({
      id: anti.id, nombre: anti.nombre || "", proveedor: anti.proveedor || "",
      descripcion: anti.descripcion || "", tipo: anti.tipo || "INTERNO", especieDestino: anti.especieDestino || "TODOS",
      precio: anti.precio !== null && anti.precio !== undefined ? anti.precio : "",
      stock: anti.stock !== null && anti.stock !== undefined ? anti.stock : ""
    });
    setModalOpen(true);
  };

  const abrirModalStock = (anti) => {
    setItemParaStock(anti);
    setCantidadAdd('');
    setModalStockOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio) || 0.0,
        stock: parseInt(form.stock) || 0,
        activo: form.id ? (antiparasitarios.find(a => a.id === form.id)?.activo !== false) : true
      };

      const peticion = form.id ? actualizarAntiparasitario(form.id, payload) : registrarAntiparasitario(payload);

      sileo.promise(peticion, {
        loading: { title: 'Guardando registro...' },
        success: { title: '¡Éxito!', description: form.id ? 'Registro actualizado con éxito' : 'Nuevo antiparasitario registrado' },
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
        tipo: itemParaStock.tipo,
        especieDestino: itemParaStock.especieDestino,
        precio: itemParaStock.precio,
        stock: nuevoStock,
        activo: itemParaStock.activo
      };

      const peticion = actualizarAntiparasitario(itemParaStock.id, payload);

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
      title: '¿Suspender producto?', text: `"${nombre}" ya no aparecerá en las ventas.`,
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
      const peticion = desactivarAntiparasitario(id);
      
      sileo.promise(peticion, {
        loading: { title: 'Suspendiendo...' },
        success: { title: 'Suspendido', description: 'El producto ha sido ocultado' },
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
      title: '¿Habilitar producto?', text: `"${nombre}" volverá a estar disponible.`,
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
      const peticion = reactivarAntiparasitario(id);

      sileo.promise(peticion, {
        loading: { title: 'Habilitando...' },
        success: { title: '¡Listo!', description: 'El producto está activo nuevamente' },
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
            <Bug className="text-orange-500" /> Control Antiparasitario
          </h1>
          <p className="text-slate-500 text-sm mt-1">Administra pastillas, pipetas y collares para control de parásitos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <button 
            onClick={() => setMostrarInactivos(!mostrarInactivos)}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${mostrarInactivos ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
          >
            {mostrarInactivos ? <Eye size={18}/> : <EyeOff size={18}/>}
            <span className="text-sm hidden sm:inline">{mostrarInactivos ? 'Ver Activos' : 'Ver Suspendidos'}</span>
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar por marca o detalle..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <button onClick={abrirModalNuevo} className="bg-gradient-to-r from-orange-500 to-amber-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
            <Plus size={20} /> <span className="hidden sm:inline">Nuevo Registro</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-orange-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Sincronizando registros...</p>
          </div>
        ) : antiparasitariosFiltrados.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-slate-400 bg-slate-50/50">
            <Bug size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">{mostrarInactivos ? 'Sin Suspendidos' : 'Catálogo Vacío'}</p>
            <p className="text-sm">{mostrarInactivos ? 'No hay productos suspendidos actualmente.' : 'No se encontraron registros en esta vista.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-[25%]">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Laboratorio</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Precio Venta</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Stock Clínico</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {antiparasitariosFiltrados.map((item) => {
                  const inactivo = item.activo === false;
                  return (
                    <tr key={item.id} className={`transition-colors ${inactivo ? 'bg-slate-50/80 opacity-60 grayscale' : 'hover:bg-orange-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="line-clamp-2">{item.nombre}</span>
                          {inactivo && <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded-full shrink-0 font-black">SUSPENDIDO</span>}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border 
                            ${item.especieDestino === 'PERRO' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                              item.especieDestino === 'GATO' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 
                              'bg-emerald-50 text-emerald-600 border-emerald-200'}`}
                          >
                            {item.especieDestino}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border 
                            ${item.tipo === 'INTERNO' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}
                          >
                            {item.tipo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Shield size={14} className="text-slate-400"/>
                          {item.proveedor || <span className="text-amber-500 font-semibold text-xs">Falta completar</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 whitespace-nowrap">
                        S/ {item.precio ? item.precio.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-black border ${(!item.stock || item.stock <= 5) && !inactivo ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {item.stock || 0} Unid.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {inactivo ? (
                          <button 
                            onClick={() => handleReactivar(item.id, item.nombre)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl transition-all"
                          >
                            <ArchiveRestore size={16} /> Habilitar
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {/* BOTON SUMAR STOCK */}
                            <button 
                              onClick={() => abrirModalStock(item)} 
                              className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl transition-all" title="Sumar Stock"
                            >
                              <PackagePlus size={16} />
                            </button>
                            <button 
                              onClick={() => abrirModalEditar(item)} className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all" title="Completar / Editar datos"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDesactivar(item.id, item.nombre)} className="inline-flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all" title="Suspender acceso"
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
                <Bug className="text-orange-500" size={20} /> {form.id ? 'Completar / Editar Ficha' : 'Registrar Nuevo'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre comercial</label>
                  <input required type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Laboratorio</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input required type="text" name="proveedor" value={form.proveedor} onChange={handleChange} placeholder="Ej: Zoetis, Elanco" className="w-full pl-9 pr-3 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Especie destino</label>
                  <select required name="especieDestino" value={form.especieDestino} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none font-bold bg-slate-50 focus:bg-white cursor-pointer transition-all">
                    <option value="TODOS">TODOS (Perros y Gatos)</option>
                    <option value="PERRO">Solo PERROS</option>
                    <option value="GATO">Solo GATOS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tipo de Protección</label>
                  <select required name="tipo" value={form.tipo} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none font-bold bg-slate-50 focus:bg-white cursor-pointer transition-all">
                    <option value="INTERNO">Interno (Gusanos)</option>
                    <option value="EXTERNO">Externo (Pulgas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stock en almacén</label>
                  <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange} placeholder="0" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none font-bold bg-slate-50 focus:bg-white transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Precio (S/)</label>
                  <input required type="number" step="0.10" min="0" name="precio" value={form.precio} onChange={handleChange} placeholder="0.00" className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-600 bg-emerald-50 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Descripción / Detalle</label>
                <textarea rows="2" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Ej: Para perros de 10 a 20 kg." className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition-all text-sm"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={procesando} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
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

export default AntiparasitariosPage;
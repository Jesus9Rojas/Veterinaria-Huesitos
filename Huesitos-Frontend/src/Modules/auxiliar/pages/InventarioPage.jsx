import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  PackageSearch, Plus, Search, Edit, PackagePlus, 
  Layers, Tag, Activity, CheckCircle2, X, Image as ImageIcon, Eye, Trash2, ArchiveRestore, EyeOff
} from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  listarProductos, listarTodosProductos, listarCategorias, guardarProducto, 
  ingresarLoteInventario, crearCategoria, desactivarProducto, activarProducto 
} from '../../../services/inventarioService';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

const InventarioPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [triggerRecarga, setTriggerRecarga] = useState(0);

  const [modalProductoOpen, setModalProductoOpen] = useState(false);
  const [guardandoProd, setGuardandoProd] = useState(false);
  const [formProducto, setFormProducto] = useState({
    id: null, nombre: '', descripcion: '', precio: '', categoriaId: '', stockMinimo: 5, fotoUrl: ''
  });

  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formStock, setFormStock] = useState({ stock: '', codigoLote: '', fechaVencimiento: '' });

  const [modalCatOpen, setModalCatOpen] = useState(false);
  const [guardandoCat, setGuardandoCat] = useState(false);
  const [formCat, setFormCat] = useState({ nombre: '', descripcion: '' });

  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [productoViendo, setProductoViendo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodData, catData] = await Promise.all([
          mostrarInactivos ? listarTodosProductos() : listarProductos(),
          listarCategorias()
        ]);
        if (isMounted) {
          setProductos(prodData);
          setCategorias(catData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar inventario:", error);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [triggerRecarga, mostrarInactivos]);

  // SOLUCIÓN APLICADA: Filtro estricto (O solo activos, O solo suspendidos)
  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (p.categoria?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());
    const esActivo = p.activo !== false;
    const matchEstado = mostrarInactivos ? !esActivo : esActivo;
    return matchBusqueda && matchEstado;
  });

  const productosVisualizados = [...productosFiltrados].sort((a, b) => b.id - a.id).slice(0, 12);

  const abrirModalNuevoProd = () => {
    setFormProducto({ id: null, nombre: '', descripcion: '', precio: '', categoriaId: categorias[0]?.id || '', stockMinimo: 5, fotoUrl: '' });
    setModalProductoOpen(true);
  };

  const abrirModalEditarProd = (prod) => {
    setFormProducto({
      id: prod.id, nombre: prod.nombre, descripcion: prod.descripcion || '',
      precio: prod.precio, categoriaId: prod.categoria?.id || '', stockMinimo: prod.stockMinimo || 5,
      fotoUrl: prod.fotoUrl && prod.fotoUrl !== "/uploads/defecto-producto.png" ? prod.fotoUrl : ''
    });
    setModalProductoOpen(true);
  };

  const abrirModalVer = (prod) => {
    setProductoViendo(prod);
    setModalVerOpen(true);
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    setGuardandoProd(true);
    try {
      const payload = {
        id: formProducto.id, nombre: formProducto.nombre, descripcion: formProducto.descripcion,
        precio: parseFloat(formProducto.precio), stockMinimo: parseInt(formProducto.stockMinimo),
        categoria: { id: parseInt(formProducto.categoriaId) },
        fotoUrl: formProducto.fotoUrl || "/uploads/defecto-producto.png", activo: true
      };
      await guardarProducto(payload);
      setModalProductoOpen(false);
      setTriggerRecarga(prev => prev + 1);
      Toast.fire({ icon: 'success', title: formProducto.id ? 'Producto actualizado' : 'Producto registrado' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al guardar producto' });
    } finally {
      setGuardandoProd(false);
    }
  };

  const handleDesactivarProducto = async () => {
    const result = await Swal.fire({
      title: '¿Suspender producto?', text: `"${formProducto.nombre}" dejará de estar disponible.`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, suspender', cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    setGuardandoProd(true);
    try {
      await desactivarProducto(formProducto.id);
      setModalProductoOpen(false);
      setTriggerRecarga(prev => prev + 1);
      Toast.fire({ icon: 'info', title: 'Producto suspendido' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al suspender' });
    } finally {
      setGuardandoProd(false);
    }
  };

  const handleReactivarProducto = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Habilitar producto?', text: `"${nombre}" volverá a aparecer en el Punto de Venta.`,
      icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, habilitar', cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await activarProducto(id);
      setTriggerRecarga(prev => prev + 1);
      Toast.fire({ icon: 'success', title: 'Producto reactivado' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al reactivar' });
      setLoading(false);
    }
  };

  const abrirModalStock = (prod) => {
    setProductoSeleccionado(prod);
    setFormStock({ stock: '', codigoLote: '', fechaVencimiento: '' });
    setModalStockOpen(true);
  };

  const handleIngresarStock = async (e) => {
    e.preventDefault();
    setGuardandoStock(true);
    try {
      const payload = {
        producto: { id: productoSeleccionado.id }, stock: parseInt(formStock.stock),
        codigoLote: formStock.codigoLote || "", fechaVencimiento: formStock.fechaVencimiento || null, activo: true
      };
      await ingresarLoteInventario(payload);
      setModalStockOpen(false);
      setTriggerRecarga(prev => prev + 1);
      Toast.fire({ icon: 'success', title: 'Stock ingresado correctamente' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al registrar el stock' });
    } finally {
      setGuardandoStock(false);
    }
  };

  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    setGuardandoCat(true);
    try {
      const nuevaCat = await crearCategoria(formCat);
      setCategorias([...categorias, nuevaCat]);
      setFormProducto({ ...formProducto, categoriaId: nuevaCat.id });
      setModalCatOpen(false);
      setFormCat({ nombre: '', descripcion: '' });
      Toast.fire({ icon: 'success', title: 'Categoría creada' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al crear la categoría' });
    } finally {
      setGuardandoCat(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><PackageSearch className="text-indigo-500" /> Gestión de Inventario</h1>
          <p className="text-slate-500 text-sm mt-1">Crea productos y gestiona el stock de la tienda.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <button onClick={() => setMostrarInactivos(!mostrarInactivos)} className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${mostrarInactivos ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}>
            {mostrarInactivos ? <Eye size={18}/> : <EyeOff size={18}/>} 
            <span className="text-sm">{mostrarInactivos ? 'Ver Activos' : 'Ver Suspendidos'}</span>
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <button onClick={abrirModalNuevoProd} className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
            <Plus size={20} /> <span className="hidden sm:inline">Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[400px]">
        {!loading && productosFiltrados.length > 0 && (
          <div className="bg-slate-50 border-b border-slate-100 p-3 px-6 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 tracking-wide">Mostrando los {productosVisualizados.length} últimos agregados de {productosFiltrados.length} resultados</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-indigo-500 font-semibold animate-pulse gap-3"><Activity className="animate-spin" size={32} /><p>Cargando catálogo...</p></div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/50">
            <Layers size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">{mostrarInactivos ? 'Sin Suspendidos' : 'Catálogo vacío'}</p>
            <p className="text-sm">{mostrarInactivos ? 'No hay productos suspendidos actualmente.' : 'No se encontraron productos en la búsqueda.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 table-auto">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-[40%]">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Precio Unit.</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Stock Restante</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {productosVisualizados.map((prod) => {
                  const stockActual = prod.stock || prod.stockDisponible || 0; 
                  const stockBajo = stockActual <= (prod.stockMinimo || 5);
                  const inactivo = prod.activo === false;

                  return (
                    <tr key={prod.id} className={`transition-colors ${inactivo ? 'bg-slate-50/80 opacity-60 grayscale' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                          {prod.fotoUrl && prod.fotoUrl !== "/uploads/defecto-producto.png" ? <img src={prod.fotoUrl} alt={prod.nombre} className="w-full h-full object-cover mix-blend-multiply" /> : <ImageIcon size={20} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-[300px] md:max-w-md">
                          <div className="font-black text-slate-800 text-base leading-tight flex items-center gap-2"><span className="line-clamp-2" title={prod.nombre}>{prod.nombre}</span>{inactivo && <span className="bg-slate-300 text-slate-700 text-[9px] px-2 py-0.5 rounded-full shrink-0">INACTIVO</span>}</div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate"><Tag size={12}/> {prod.categoria?.nombre || 'Sin Categoría'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-lg font-black text-emerald-600">S/ {prod.precio?.toFixed(2)}</div></td>
                      <td className="px-6 py-4 text-center whitespace-nowrap"><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-black border ${stockBajo && !inactivo ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>{stockActual} Unid.</span></td>
                      <td className="px-6 py-4 text-right whitespace-nowrap w-1 space-x-2">
                        {inactivo ? (
                          <button onClick={() => handleReactivarProducto(prod.id, prod.nombre)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl transition-all"><ArchiveRestore size={16} /> Reactivar</button>
                        ) : (
                          <>
                            <button onClick={() => abrirModalVer(prod)} className="inline-flex items-center justify-center w-10 h-10 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold rounded-xl transition-all"><Eye size={16} /></button>
                            <button onClick={() => abrirModalStock(prod)} className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-all"><PackagePlus size={16} /> Sumar</button>
                            <button onClick={() => abrirModalEditarProd(prod)} className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"><Edit size={16} /></button>
                          </>
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

      {modalVerOpen && productoViendo && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalVerOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><h3 className="text-xl font-black text-slate-800 flex items-center gap-2">Detalles del Producto</h3><button onClick={() => setModalVerOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24}/></button></div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="w-full h-48 bg-slate-100 rounded-2xl mb-5 overflow-hidden flex items-center justify-center border border-slate-200">{productoViendo.fotoUrl && productoViendo.fotoUrl !== "/uploads/defecto-producto.png" ? <img src={productoViendo.fotoUrl} alt={productoViendo.nombre} className="w-full h-full object-contain mix-blend-multiply p-2" /> : <ImageIcon size={48} className="text-slate-300" />}</div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">{productoViendo.nombre}</h2>
              <p className="text-emerald-600 font-black text-2xl mb-4">S/ {productoViendo.precio?.toFixed(2)}</p>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Categoría</p><p className="text-sm font-bold text-slate-700">{productoViendo.categoria?.nombre || 'General'}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Stock Actual</p><p className="text-sm font-bold text-slate-700">{productoViendo.stock || productoViendo.stockDisponible || 0} unid.</p></div>
                <div className="col-span-2"><p className="text-[10px] font-bold text-slate-400 uppercase">Stock Mínimo (Alerta)</p><p className="text-sm font-bold text-slate-700">{productoViendo.stockMinimo || 5} unid.</p></div>
              </div>
              <div className="mt-4"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Descripción</p><p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[60px]">{productoViendo.descripcion || 'Sin descripción disponible.'}</p></div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 shrink-0"><button onClick={() => setModalVerOpen(false)} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg w-full">Cerrar Detalles</button></div>
          </div>
        </div>, document.body
      )}

      {modalProductoOpen && createPortal(
        <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalProductoOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><h3 className="text-xl font-black text-slate-800">{formProducto.id ? 'Editar Producto' : 'Crear Producto'}</h3><button onClick={() => setModalProductoOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24}/></button></div>
            <form onSubmit={handleGuardarProducto} className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Producto</label><input required type="text" value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">URL de la Foto (Opcional)</label><div className="flex gap-2"><div className="relative flex-1"><ImageIcon className="absolute left-3 top-3.5 text-slate-400" size={18} /><input type="text" value={formProducto.fotoUrl} onChange={e => setFormProducto({...formProducto, fotoUrl: e.target.value})} className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Categoría</label>
                  <div className="flex gap-2">
                    <select required value={formProducto.categoriaId} onChange={e => setFormProducto({...formProducto, categoriaId: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"><option value="">Seleccione...</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                    <button type="button" onClick={() => setModalCatOpen(true)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-600 px-3 rounded-xl font-bold transition-colors shrink-0"><Plus size={20} /></button>
                  </div>
                </div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Precio (S/)</label><input required type="number" step="0.10" min="0" value={formProducto.precio} onChange={e => setFormProducto({...formProducto, precio: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Stock Mínimo (Alerta)</label><input required type="number" min="0" value={formProducto.stockMinimo} onChange={e => setFormProducto({...formProducto, stockMinimo: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Descripción Breve</label><textarea rows="2" value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea></div>
              <div className="flex justify-between items-center pt-4 pb-2 border-t border-slate-100 mt-4">
                {formProducto.id ? <button type="button" onClick={handleDesactivarProducto} disabled={guardandoProd} className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center gap-2"><Trash2 size={18}/> Desactivar</button> : <div></div>}
                <button type="submit" disabled={guardandoProd} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-6 py-2.5 font-bold rounded-xl flex items-center gap-2"><CheckCircle2 size={18}/> Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {modalCatOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalCatOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50 shrink-0"><h3 className="text-lg font-black text-emerald-800 flex items-center gap-2"><Tag size={18}/> Nueva Categoría</h3><button onClick={() => setModalCatOpen(false)} className="text-emerald-400 hover:text-emerald-700"><X size={20}/></button></div>
            <form onSubmit={handleGuardarCategoria} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label><input required autoFocus type="text" value={formCat.nombre} onChange={e => setFormCat({...formCat, nombre: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Descripción</label><textarea rows="2" value={formCat.descripcion} onChange={e => setFormCat({...formCat, descripcion: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"></textarea></div>
              <div className="flex justify-end pt-2"><button type="submit" disabled={guardandoCat} className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"><Plus size={18}/> Crear Categoría</button></div>
            </form>
          </div>
        </div>, document.body
      )}

      {modalStockOpen && createPortal(
        <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalStockOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50 shrink-0"><h3 className="text-xl font-black text-indigo-800 flex items-center gap-2"><PackagePlus size={20}/> Sumar Inventario</h3><button onClick={() => setModalStockOpen(false)} className="text-indigo-400 hover:text-indigo-700"><X size={24}/></button></div>
            <form onSubmit={handleIngresarStock} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl mb-2 text-center shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Producto Destino</p><p className="text-lg font-black text-slate-800 leading-tight line-clamp-2">{productoSeleccionado?.nombre}</p></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Cantidad a Ingresar</label><input required type="number" min="1" value={formStock.stock} onChange={e => setFormStock({...formStock, stock: e.target.value})} className="w-full border border-indigo-200 focus:border-indigo-500 p-3 rounded-xl text-lg font-black text-center outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Código de Lote</label><input type="text" value={formStock.codigoLote} onChange={e => setFormStock({...formStock, codigoLote: e.target.value})} className="w-full border p-3 rounded-xl uppercase outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Autogenerado" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Vencimiento</label><input type="date" value={formStock.fechaVencimiento} onChange={e => setFormStock({...formStock, fechaVencimiento: e.target.value})} className="w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div className="flex justify-end pt-4 pb-2"><button type="submit" disabled={guardandoStock} className="w-full px-6 py-4 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-black rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg"><CheckCircle2 size={22}/> Confirmar Ingreso</button></div>
            </form>
          </div>
        </div>, document.body
      )}

    </div>
  );
};

export default InventarioPage;
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Store, ShoppingCart, Search, PackageOpen, Plus, Minus, 
  Trash2, Banknote, CreditCard, Smartphone, CheckCircle2, X, Activity, ShoppingBag, QrCode, ChevronDown, User
} from 'lucide-react';
import { listarProductosPOS, listarPedidos, actualizarEstadoPedido, procesarVentaPOS } from '../../../services/posService';
// ¡CORRECCIÓN! Importamos los Dueños (que tienen Nombre y Teléfono) en lugar de Usuarios
import { obtenerListaDuenos } from '../../../services/duenoService'; 

const PuntoVentaPage = () => {
  const [tabActual, setTabActual] = useState('POS');
  
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]); // Aquí guardaremos los dueños
  const [loading, setLoading] = useState(true);
  const [triggerRecarga, setTriggerRecarga] = useState(0);

  // Estados del POS
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [procesando, setProcesando] = useState(false);

  // --- ESTADOS PARA EL CLIENTE Y EL NUEVO BUSCADOR ---
  const [clienteSeleccionado, setClienteSeleccionado] = useState(''); 
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [dropdownClienteAbierto, setDropdownClienteAbierto] = useState(false);

  // Estados para Pasarelas de Pago
  const [montoRecibido, setMontoRecibido] = useState('');
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', fecha: '', cvv: '' });
  const [referenciaYape, setReferenciaYape] = useState('');

  useEffect(() => {
    let isMounted = true;
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [prodData, pedData, clientesData] = await Promise.all([
          listarProductosPOS(),
          listarPedidos(),
          obtenerListaDuenos() // Traemos los dueños con nombres y celulares
        ]);
        if (isMounted) {
          setProductos(prodData.filter(p => p.activo !== false)); 
          setPedidos(pedData);
          // Guardamos solo los dueños que tienen una cuenta de usuario vinculada
          setClientes(clientesData.filter(c => c.usuarioId != null));
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar la tienda:", error);
        if (isMounted) setLoading(false);
      }
    };
    cargarDatos();
    return () => { isMounted = false; };
  }, [triggerRecarga]);

  // --- LÓGICA DEL CARRITO ---
  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.categoria?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    const stockReal = producto.stockDisponible !== undefined ? producto.stockDisponible : (producto.stock || 0);
    if (stockReal <= 0) return; 

    const existe = carrito.find(item => item.productoId === producto.id);
    if (existe) {
      if (existe.cantidad >= stockReal) return alert(`Solo hay ${stockReal} unidades en stock.`);
      setCarrito(carrito.map(item => 
        item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { 
        productoId: producto.id, 
        nombre: producto.nombre, 
        precio: producto.precio, 
        stock: stockReal, 
        cantidad: 1 
      }]);
    }
  };

  const modificarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.productoId === id) {
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant > 0 && nuevaCant <= item.stock) return { ...item, cantidad: nuevaCant };
      }
      return item;
    }));
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.productoId !== id));
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const handleCambioMedioPago = (e) => {
    setMedioPago(e.target.value);
    setMontoRecibido('');
    setDatosTarjeta({ numero: '', fecha: '', cvv: '' });
    setReferenciaYape('');
  };

  const handleProcesarVenta = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      let referenciaFinal = "";
      if (medioPago === 'TARJETA_CREDITO' || medioPago === 'TARJETA_DEBITO') {
        referenciaFinal = `Tarjeta Terminada en ${datosTarjeta.numero.slice(-4) || '****'}`;
      } else if (medioPago === 'YAPE' || medioPago === 'PLIN') {
        referenciaFinal = `Operación: ${referenciaYape}`;
      }

      // Enviamos el usuarioId que seleccionamos en el dropdown
      const payload = {
        medioPago,
        referencia: referenciaFinal,
        usuarioId: clienteSeleccionado ? parseInt(clienteSeleccionado) : null,
        items: carrito.map(c => ({ productoId: c.productoId, cantidad: c.cantidad }))
      };
      
      const respuesta = await procesarVentaPOS(payload);
      
      setCarrito([]);
      setClienteSeleccionado('');
      setBusquedaCliente('');
      setModalPagoOpen(false);
      setTriggerRecarga(prev => prev + 1); 

      alert(`¡Venta completada con éxito! Pedido #${respuesta.id} registrado.`);
      
    } catch (error) {
      console.error("Error en venta:", error);
      alert(error.response?.data || "No se pudo procesar la venta.");
    } finally {
      setProcesando(false);
    }
  };

  const handleCambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(id, nuevoEstado);
      setTriggerRecarga(prev => prev + 1);
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "PENDIENTE": return "bg-amber-50 text-amber-600 border-amber-200";
      case "PROCESANDO": return "bg-blue-50 text-blue-600 border-blue-200";
      case "ENVIADO": return "bg-purple-50 text-purple-600 border-purple-200";
      case "ENTREGADO": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "CANCELADO": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  // --- FILTRO DEL BUSCADOR DE CLIENTES ---
  const clientesFiltrados = clientes.filter(c => 
    c.nombreCompleto?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.correo?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.telefono?.includes(busquedaCliente)
  );

  // Buscamos la info del cliente seleccionado para mostrar su nombre en el botón
  const clienteActualInfo = clientes.find(c => c.usuarioId?.toString() === clienteSeleccionado.toString());

  // Cálculo del Vuelto
  const vuelto = parseFloat(montoRecibido || 0) - totalCarrito;
  const vueltoValido = vuelto >= 0;

  const botonHabilitado = !procesando && (
    (medioPago === 'EFECTIVO' && vueltoValido && montoRecibido !== '') ||
    (medioPago === 'TARJETA_CREDITO' && datosTarjeta.numero.length >= 15) ||
    (medioPago === 'TARJETA_DEBITO' && datosTarjeta.numero.length >= 15) ||
    ((medioPago === 'YAPE' || medioPago === 'PLIN') && referenciaYape.length >= 4)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 h-full flex flex-col">
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden shrink-0">
        <div className="p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100">
          <div className="pb-4">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Store className="text-emerald-500" /> Tienda y Pedidos
            </h1>
            <p className="text-slate-500 text-sm mt-1">Punto de venta físico y gestión de entregas.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setTabActual('POS')} className={`flex items-center gap-2 pb-4 font-bold transition-all border-b-4 ${tabActual === 'POS' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <ShoppingCart size={18}/> Punto de Venta (POS)
            </button>
            <button onClick={() => setTabActual('PEDIDOS')} className={`flex items-center gap-2 pb-4 font-bold transition-all border-b-4 ${tabActual === 'PEDIDOS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <PackageOpen size={18}/> Historial de Ventas 
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center h-64 text-emerald-500 font-semibold animate-pulse gap-3 bg-white rounded-3xl border border-slate-200/60">
          <Activity className="animate-spin" size={32} />
          <p>Sincronizando inventario...</p>
        </div>
      ) : tabActual === 'POS' ? (
        
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
          {/* PRODUCTOS */}
          <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col">
            <div className="relative w-full mb-6">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar producto por nombre o categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"/>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
              {productosFiltrados.map(p => {
                const stockReal = p.stockDisponible !== undefined ? p.stockDisponible : (p.stock || 0);
                
                return (
                  <button 
                    key={p.id} 
                    onClick={() => agregarAlCarrito(p)}
                    disabled={stockReal <= 0}
                    className={`text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${stockReal > 0 ? 'border-slate-100 hover:border-emerald-400 bg-white shadow-sm hover:shadow-md' : 'border-red-100 bg-red-50/40 opacity-60 cursor-not-allowed grayscale'}`}
                  >
                    <div className="w-full h-24 bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {p.fotoUrl && p.fotoUrl !== "/uploads/defecto-producto.png" ? <img src={p.fotoUrl} alt={p.nombre} className="h-full object-contain mix-blend-multiply" /> : <ShoppingBag className="text-slate-300" size={32}/>}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{p.nombre}</h3>
                    <p className="text-xs text-slate-400 mt-1">{p.categoria?.nombre || 'General'}</p>
                    
                    <div className="mt-3 flex justify-between items-end">
                      <span className="font-black text-emerald-600">S/ {p.precio?.toFixed(2)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stockReal > 0 ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}`}>
                        {stockReal} un.
                      </span>
                    </div>

                    {stockReal > 0 && (
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-emerald-500 text-white rounded-full p-2 shadow-lg"><Plus size={20}/></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARRITO Y PANEL DERECHO */}
          <div className="w-full lg:w-96 bg-white rounded-3xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden shrink-0 relative">
            <div className="p-5 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-black flex items-center gap-2"><ShoppingCart size={18}/> Venta Actual</h3>
              <span className="bg-white/20 text-xs font-bold px-2.5 py-1 rounded-full">{carrito.length} Items</span>
            </div>

            {/* SELECCIÓN DE CLIENTE (Dropdown Inteligente con Buscador) */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col gap-1.5 relative z-20">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                Cliente (Opcional)
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setDropdownClienteAbierto(!dropdownClienteAbierto)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm flex justify-between items-center transition-all"
                >
                  <span className="truncate flex items-center gap-2">
                    {/* AHORA SÍ MOSTRARÁ EL NOMBRE PORQUE BUSCAMOS EN DUEÑOS */}
                    {clienteActualInfo ? (
                      <><User size={16} className="text-slate-400"/> {clienteActualInfo.nombreCompleto}</>
                    ) : (
                      <><User size={16} className="text-emerald-500"/> Anónimo (Venta Rápida)</>
                    )}
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownClienteAbierto ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú Flotante del Buscador */}
                {dropdownClienteAbierto && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar por nombre, correo o celular..."
                          value={busquedaCliente}
                          onChange={(e) => setBusquedaCliente(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    {/* Resultados */}
                    <div className="overflow-y-auto p-2 custom-scrollbar space-y-1">
                      <button
                        onClick={() => { setClienteSeleccionado(''); setDropdownClienteAbierto(false); setBusquedaCliente(''); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${clienteSeleccionado === '' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                      >
                        <User size={16} className={clienteSeleccionado === '' ? 'text-emerald-500' : 'text-slate-400'}/>
                        Anónimo (Venta Rápida)
                      </button>

                      {clientesFiltrados.map(c => (
                        <button
                          key={c.id} // Aquí la 'id' pertenece al Dueño
                          // Guardamos el usuarioId porque el Backend (Pedido) está ligado a Usuario, no al Dueño directamente.
                          onClick={() => { setClienteSeleccionado(c.usuarioId.toString()); setDropdownClienteAbierto(false); setBusquedaCliente(''); }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex flex-col gap-0.5 ${clienteSeleccionado === c.usuarioId.toString() ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                        >
                          <span>{c.nombreCompleto}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{c.telefono} | {c.correo}</span>
                        </button>
                      ))}

                      {clientesFiltrados.length === 0 && (
                        <div className="text-center py-6 text-slate-400">
                          <Search size={24} className="mx-auto mb-2 opacity-50"/>
                          <span className="text-xs font-bold">No se encontraron clientes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cierre condicional del dropdown si se hace clic afuera del ticket */}
            {dropdownClienteAbierto && (
              <div className="fixed inset-0 z-10" onClick={() => setDropdownClienteAbierto(false)}></div>
            )}

            {/* LISTA DEL CARRITO */}
            <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 min-h-[250px] relative z-0">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart size={40} className="mb-2 opacity-50"/>
                  <p className="text-sm font-medium">El ticket está vacío</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {carrito.map(item => (
                    <div key={item.productoId} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-700 leading-tight pr-4">{item.nombre}</p>
                        <button onClick={() => quitarDelCarrito(item.productoId)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200">
                          <button onClick={() => modificarCantidad(item.productoId, -1)} className="p-1.5 text-slate-500 hover:text-sky-600"><Minus size={14}/></button>
                          <span className="text-sm font-black w-4 text-center">{item.cantidad}</span>
                          <button onClick={() => modificarCantidad(item.productoId, 1)} className="p-1.5 text-slate-500 hover:text-sky-600"><Plus size={14}/></button>
                        </div>
                        <p className="font-black text-slate-800">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                <p className="text-3xl font-black text-emerald-600">S/ {totalCarrito.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setModalPagoOpen(true)}
                disabled={carrito.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Banknote size={22}/> Cobrar
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA PEDIDOS WEB */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          {pedidos.length === 0 ? (
             <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/50">
             <PackageOpen size={48} className="mb-4 text-slate-300" />
             <p className="text-lg font-bold text-slate-500">No hay pedidos registrados</p>
           </div>
          ) : (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-100">
                 <thead className="bg-slate-50/50">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">N° Pedido</th>
                     <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Cliente / Fecha</th>
                     <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                     <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Actualizar Estado</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm">
                   {pedidos.map((ped) => {
                     const fechaFormat = ped.fechaPedido ? new Date(ped.fechaPedido).toLocaleDateString('es-PE') : '-';
                     
                     // CRUZAMOS LOS DATOS PARA MOSTRAR EL NOMBRE REAL INCLUSO EN LA TABLA
                     const duenoDelPedido = clientes.find(c => c.usuarioId === ped.cliente?.id);
                     const nombreMostrar = duenoDelPedido ? duenoDelPedido.nombreCompleto : (ped.cliente?.correo || 'Venta Mostrador POS');

                     return (
                       <tr key={ped.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="font-black text-slate-800 text-base">#PED-{ped.id.toString().padStart(4, '0')}</div>
                           <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black mt-1 uppercase border ${getEstadoColor(ped.estadoPedido)}`}>{ped.estadoPedido}</span>
                         </td>
                         <td className="px-6 py-4">
                           {/* AHORA MUESTRA EL NOMBRE REAL DEL DUEÑO EN LA TABLA */}
                           <div className="font-bold text-slate-700">{nombreMostrar}</div>
                           <div className="text-xs text-slate-500 mt-0.5">{fechaFormat}</div>
                         </td>
                         <td className="px-6 py-4 font-black text-slate-800">S/ {ped.total?.toFixed(2) || '0.00'}</td>
                         <td className="px-6 py-4">
                           <select value={ped.estadoPedido} onChange={(e) => handleCambiarEstadoPedido(ped.id, e.target.value)} className="border border-slate-300 p-2 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none cursor-pointer focus:ring-2 focus:ring-blue-500">
                             <option value="PENDIENTE">Pendiente</option>
                             <option value="PROCESANDO">Procesando</option>
                             <option value="ENVIADO">Enviado (Delivery)</option>
                             <option value="ENTREGADO">Entregado / Retirado</option>
                             <option value="CANCELADO">Cancelado</option>
                           </select>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          )}
        </div>
      )}

      {/* ================= MODAL DE PAGO CON PASARELAS ================= */}
      {modalPagoOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalPagoOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Store className="text-emerald-500" /> Pasarela de Pago
              </h3>
              <button type="button" onClick={() => setModalPagoOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24}/></button>
            </div>

            <form onSubmit={handleProcesarVenta} className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <div className="bg-emerald-50 p-5 rounded-2xl text-center border border-emerald-100 flex justify-between items-center">
                <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Total a Cobrar</p>
                <p className="text-3xl font-black text-emerald-700">S/ {totalCarrito.toFixed(2)}</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600">Seleccionar Método</label>
                <div className="grid grid-cols-4 gap-2">
                  <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'EFECTIVO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                    <input type="radio" value="EFECTIVO" className="hidden" checked={medioPago === 'EFECTIVO'} onChange={handleCambioMedioPago} />
                    <Banknote size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Efectivo</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${(medioPago === 'TARJETA_CREDITO' || medioPago === 'TARJETA_DEBITO') ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                    <input type="radio" value="TARJETA_DEBITO" className="hidden" checked={medioPago === 'TARJETA_DEBITO' || medioPago === 'TARJETA_CREDITO'} onChange={handleCambioMedioPago} />
                    <CreditCard size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Tarjeta</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'YAPE' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                    <input type="radio" value="YAPE" className="hidden" checked={medioPago === 'YAPE'} onChange={handleCambioMedioPago} />
                    <Smartphone size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Yape</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'PLIN' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                    <input type="radio" value="PLIN" className="hidden" checked={medioPago === 'PLIN'} onChange={handleCambioMedioPago} />
                    <Smartphone size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Plin</span>
                  </label>
                </div>
              </div>

              {/* === PASARELA: EFECTIVO === */}
              {medioPago === 'EFECTIVO' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">¿Con cuánto paga el cliente?</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 font-black text-slate-400">S/</span>
                      <input 
                        type="number" 
                        step="0.10"
                        min={totalCarrito}
                        value={montoRecibido} 
                        onChange={e => setMontoRecibido(e.target.value)} 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-sm font-bold text-slate-500">Vuelto a entregar:</span>
                    <span className={`text-2xl font-black ${vueltoValido ? 'text-emerald-600' : 'text-red-500'}`}>
                      S/ {montoRecibido ? vuelto.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              )}

              {/* === PASARELA: TARJETA === */}
              {(medioPago === 'TARJETA_CREDITO' || medioPago === 'TARJETA_DEBITO') && (
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-blue-800 uppercase">Datos de la Tarjeta</span>
                    <CreditCard size={20} className="text-blue-500"/>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      maxLength="16"
                      value={datosTarjeta.numero} 
                      onChange={e => setDatosTarjeta({...datosTarjeta, numero: e.target.value.replace(/\D/g, '')})} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold tracking-widest text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      maxLength="5"
                      value={datosTarjeta.fecha} 
                      onChange={e => setDatosTarjeta({...datosTarjeta, fecha: e.target.value})} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-center text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                    />
                    <input 
                      type="password" 
                      maxLength="4"
                      value={datosTarjeta.cvv} 
                      onChange={e => setDatosTarjeta({...datosTarjeta, cvv: e.target.value.replace(/\D/g, '')})} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-center text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CVV"
                    />
                  </div>
                </div>
              )}

              {/* === PASARELA: YAPE / PLIN === */}
              {(medioPago === 'YAPE' || medioPago === 'PLIN') && (
                <div className={`p-5 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-right-4 duration-300 ${medioPago === 'YAPE' ? 'bg-purple-50 border-purple-100' : 'bg-sky-50 border-sky-100'}`}>
                  <div className={`p-3 rounded-xl text-white ${medioPago === 'YAPE' ? 'bg-purple-500' : 'bg-sky-500'}`}>
                    <QrCode size={32}/>
                  </div>
                  <div className="flex-1">
                    <label className={`block text-xs font-black uppercase mb-1 ${medioPago === 'YAPE' ? 'text-purple-800' : 'text-sky-800'}`}>N° Operación / Celular</label>
                    <input 
                      type="text" 
                      value={referenciaYape} 
                      onChange={e => setReferenciaYape(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="Ej. 1829301 ó 999..."
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setModalPagoOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!botonHabilitado} 
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all"
                >
                  {procesando ? 'Procesando...' : <><CheckCircle2 size={18}/> Completar Venta</>}
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

export default PuntoVentaPage;
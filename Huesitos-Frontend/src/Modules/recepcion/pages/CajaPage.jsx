import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wallet, Search, CheckCircle2, Clock, Receipt, Eye,
  CreditCard, Banknote, Smartphone, X, Activity, Download, Users, FileText,
  AlertCircle, QrCode, ToggleLeft, ToggleRight, ShoppingCart
} from 'lucide-react';
import { sileo } from 'sileo';
import { listarTransacciones, procesarPagoTransaccion, descargarComprobanteSeguro } from '../../../services/transaccionService';
import { obtenerDetallesPedido } from '../../../services/posService';

const CajaPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE'); 
  const [triggerRecarga, setTriggerRecarga] = useState(0);

  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [procesando, setProcesando] = useState(false);
  
  const [cuentaConPOS, setCuentaConPOS] = useState(true); 
  const [montoRecibido, setMontoRecibido] = useState('');

  // ESTADOS ESPECÍFICOS DE REFERENCIA
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', fecha: '', cvv: '' });
  const [referenciaYape, setReferenciaYape] = useState('');

  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [transaccionDetalle, setTransaccionDetalle] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTransacciones = async () => {
      try {
        setLoading(true);
        const data = await listarTransacciones();
        if (isMounted) {
          const validas = data.filter(t => !(t.cita && t.cita.estado === 'CANCELADA'));
          validas.sort((a, b) => b.id - a.id);
          setTransacciones(validas);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error cargando caja:", error);
        if (isMounted) setLoading(false);
      }
    };
    fetchTransacciones();
    return () => { isMounted = false; };
  }, [triggerRecarga]);

  const extraerInfoVisible = (t) => {
    const esCita = !!t.cita;
    const esPedido = !!t.pedido;

    let concepto = "Servicio General";
    if (esCita) concepto = `Cita: ${t.cita.servicio?.nombre}`;
    if (esPedido) concepto = `Tienda: Venta de Productos`;
    if (!esCita && !esPedido) concepto = t.motivo || t.descripcion || t.referenciaPago || 'Servicio General';

    let nombreCliente = "Cliente Anónimo";
    if (esCita) nombreCliente = t.cita.mascota?.dueno?.nombreCompleto || t.cita.mascota?.dueno?.nombreCompleto || "Cliente no asignado";
    if (esPedido && t.pedido.cliente) nombreCliente = t.pedido.cliente.nombreCompleto || t.pedido.cliente.correo;

    return { concepto, nombreCliente, esCita, esPedido };
  };

  const transaccionesFiltradas = transacciones.filter(t => {
    const { concepto, nombreCliente } = extraerInfoVisible(t);
    const coincideBusqueda = `${nombreCliente} ${concepto}`.toLowerCase().includes(busqueda.toLowerCase());
    const estado = t.estadoPago || 'PENDIENTE';
    const coincideEstado = filtroEstado === 'PENDIENTE' 
       ? estado === 'PENDIENTE' 
       : (estado === 'APROBADO' || estado === 'COMPLETADO' || estado === 'PAGADO');
    return coincideBusqueda && coincideEstado;
  });

  const abrirModalCobro = (transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setMedioPago('EFECTIVO');
    setMontoRecibido('');
    setDatosTarjeta({ numero: '', fecha: '', cvv: '' });
    setReferenciaYape('');
    setCuentaConPOS(true);
    setModalPagoOpen(true);
  };

  const handleCambioMedioPago = (e) => {
    setMedioPago(e.target.value);
    setMontoRecibido('');
    setDatosTarjeta({ numero: '', fecha: '', cvv: '' });
    setReferenciaYape('');
  };

  const handleProcesarPago = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      const peticion = procesarPagoTransaccion(transaccionSeleccionada.id, medioPago);

      sileo.promise(peticion, {
        loading: { title: 'Procesando cobro...' },
        success: { title: '¡Pago aprobado!', description: 'El recibo ha sido cerrado correctamente' },
        error: { title: 'Error', description: 'No se pudo procesar el pago' }
      });

      await peticion;

      setModalPagoOpen(false);
      setTriggerRecarga(prev => prev + 1);
    } catch (error) {
      console.error("Error al cobrar:", error);
    } finally {
      setProcesando(false);
    }
  };

  const abrirDetalles = async (tx) => {
    setTransaccionDetalle(tx);
    setModalDetallesOpen(true);
    if (tx.pedido) {
      setCargandoDetalles(true);
      try {
        const detalles = await obtenerDetallesPedido(tx.pedido.id);
        setDetallesPedido(detalles);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
        setDetallesPedido([]);
      } finally {
        setCargandoDetalles(false);
      }
    } else {
      setDetallesPedido([]);
    }
  };

  const handleDescargarComprobante = async (id, tipo) => {
    setDescargando(true);
    try {
      sileo.show({ title: 'Generando PDF...', description: 'Espera un momento', icon: <Activity className="animate-spin text-sky-500"/> });
      
      const blob = await descargarComprobanteSeguro(id, tipo);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const nombreFile = tipo === 'FACTURA' ? 'Factura' : 'Boleta';
      link.setAttribute('download', `${nombreFile}_Huesitos_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      sileo.success({ title: '¡Listo!', description: 'Comprobante descargado' });
    } catch (error) {
      console.error("Error al descargar:", error);
      sileo.error({ title: 'Error', description: 'No se pudo generar el documento. Verifica los permisos del servidor.' });
    } finally {
      setDescargando(false);
    }
  };

  const vuelto = parseFloat(montoRecibido || 0) - (transaccionSeleccionada?.monto || 0);
  const vueltoValido = vuelto >= 0;

  const botonHabilitado = !procesando && (
    (medioPago === 'EFECTIVO' && vueltoValido && montoRecibido !== '') ||
    (medioPago === 'TARJETA_CREDITO' && datosTarjeta.numero.length >= 15) ||
    (medioPago === 'TARJETA_DEBITO' && datosTarjeta.numero.length >= 15) ||
    ((medioPago === 'YAPE' || medioPago === 'PLIN') && referenciaYape.length >= 4) ||
    ((medioPago !== 'EFECTIVO') && cuentaConPOS)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-emerald-500" /> Caja y Facturación
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los cobros de atenciones y servicios.</p>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por paciente, cliente o motivo..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 px-2">
        <button onClick={() => setFiltroEstado('PENDIENTE')} className={`flex items-center gap-2 pb-4 font-bold transition-all border-b-2 px-2 ${filtroEstado === 'PENDIENTE' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Clock size={18}/> Cuentas por Cobrar
        </button>
        <button onClick={() => setFiltroEstado('APROBADO')} className={`flex items-center gap-2 pb-4 font-bold transition-all border-b-2 px-2 ${filtroEstado === 'APROBADO' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <CheckCircle2 size={18}/> Pagos Realizados
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-emerald-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Calculando cuadre de caja...</p>
          </div>
        ) : transaccionesFiltradas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/50">
            <Receipt size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">{filtroEstado === 'PENDIENTE' ? 'No hay cuentas pendientes por cobrar.' : 'No hay historial de pagos recientes.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Recibo / Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Estado Clínico</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transaccionesFiltradas.map((t) => {
                  const fechaFormat = t.fechaHora || t.fechaCreacion ? new Date(t.fechaHora || t.fechaCreacion).toLocaleDateString('es-PE') : 'Fecha no registrada';
                  const { concepto, nombreCliente, esCita } = extraerInfoVisible(t);
                  
                  const esCitaMedicaTerminada = esCita ? t.cita.estado === 'COMPLETADA' : true; 

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-800 text-base">#TRX-{t.id.toString().padStart(4, '0')}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1">{fechaFormat}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{concepto}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <Users size={12}/> {nombreCliente}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-black text-slate-800">S/ {t.monto ? t.monto.toFixed(2) : '0.00'}</div>
                        {t.medioPago && (
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {t.medioPago.replace('_', ' ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {esCita ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${esCitaMedicaTerminada ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {t.cita.estado.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200">
                            Tienda POS
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {filtroEstado === 'PENDIENTE' ? (
                          esCitaMedicaTerminada ? (
                            <button onClick={() => abrirModalCobro(t)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all">
                              <Wallet size={16} /> Cobrar
                            </button>
                          ) : (
                            <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-xl border border-slate-200 cursor-not-allowed" title="El médico aún no termina la atención">
                              <AlertCircle size={16} /> En Atención
                            </button>
                          )
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => abrirDetalles(t)} className="bg-sky-50 hover:bg-sky-100 text-sky-600 p-2 rounded-xl transition-all" title="Ver Detalles">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleDescargarComprobante(t.id, 'BOLETA')} disabled={descargando} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5" title="Boleta">
                              <Download size={14} /> Boleta
                            </button>
                            <button onClick={() => handleDescargarComprobante(t.id, 'FACTURA')} disabled={descargando} className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5" title="Factura">
                              <FileText size={14} /> Factura
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

      {/* ================= MODAL DE DETALLES CON DESGLOSE ================= */}
      {modalDetallesOpen && transaccionDetalle && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalDetallesOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Receipt className="text-sky-500" /> Detalle de Transacción
              </h3>
              <button type="button" onClick={() => setModalDetallesOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              <div className="flex justify-between items-center bg-sky-50 p-4 rounded-xl border border-sky-100">
                <span className="text-sm font-bold text-sky-800">Total Cobrado</span>
                <span className="text-2xl font-black text-sky-700">S/ {transaccionDetalle.monto?.toFixed(2)}</span>
              </div>

              {transaccionDetalle.cita && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">Datos de Cita Médica</h4>
                  <div className="text-sm font-medium text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl">
                    <p><span className="font-bold">Mascota:</span> {transaccionDetalle.cita.mascota?.nombre} ({transaccionDetalle.cita.mascota?.especie})</p>
                    <p><span className="font-bold">Dueño:</span> {transaccionDetalle.cita.mascota?.dueno?.nombreCompleto || transaccionDetalle.cita.mascota?.dueno?.nombreCompleto}</p>
                    <p><span className="font-bold">Servicio:</span> {transaccionDetalle.cita.servicio?.nombre}</p>
                    <p><span className="font-bold">Motivo:</span> {transaccionDetalle.cita.motivo}</p>
                  </div>

                  {/* EL DESGLOSE DE COBROS */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 mt-4">
                    <h4 className="font-black text-slate-700 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <ShoppingCart size={16} className="text-slate-500"/> Desglose de Cuenta
                    </h4>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black tracking-widest">SERVICIO</span>
                          <span className="font-bold text-slate-700">{transaccionDetalle.cita.servicio?.nombre}</span>
                        </div>
                        <span className="font-semibold text-slate-600">S/ {transaccionDetalle.cita.servicio?.precio?.toFixed(2) || '0.00'}</span>
                      </li>
                      
                      {transaccionDetalle.cita.itemsCobro && transaccionDetalle.cita.itemsCobro.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 border-dashed space-y-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Insumos Adicionales (Consultorio):</p>
                          {transaccionDetalle.cita.itemsCobro.map((item, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest 
                                  ${item.tipoItem === 'VACUNA' ? 'bg-sky-100 text-sky-700' : 
                                    item.tipoItem === 'MEDICINA' ? 'bg-emerald-100 text-emerald-700' : 
                                    'bg-orange-100 text-orange-700'}`}>
                                  {item.tipoItem}
                                </span>
                                <span className="font-medium text-slate-600">{item.cantidad}x {item.nombreItem}</span>
                              </div>
                              <span className="font-semibold text-slate-600">S/ {item.subtotal?.toFixed(2) || '0.00'}</span>
                            </li>
                          ))}
                        </div>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {transaccionDetalle.pedido && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">Productos Comprados en Tienda</h4>
                  {cargandoDetalles ? (
                    <p className="text-xs text-sky-500 animate-pulse">Cargando ticket de productos...</p>
                  ) : (
                    <div className="space-y-2">
                      {detallesPedido.map(d => (
                        <div key={d.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl text-sm font-medium text-slate-700">
                          <span className="flex-1 truncate pr-4"><span className="font-black text-slate-800">{d.cantidad}x</span> {d.producto?.nombre}</span>
                          <span className="font-black">S/ {(d.precioUnitario * d.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">Información de Pago</h4>
                <div className="text-sm font-medium text-slate-700 space-y-1">
                  <p><span className="font-bold">Método Usado:</span> {transaccionDetalle.medioPago?.replace('_', ' ')}</p>
                  <p><span className="font-bold">ID Referencia:</span> {transaccionDetalle.idTransaccionPasarela || transaccionDetalle.referenciaPago || 'Pago Físico'}</p>
                  <p><span className="font-bold">Fecha Pago:</span> {new Date(transaccionDetalle.fechaPago || transaccionDetalle.fechaHora || transaccionDetalle.fechaCreacion).toLocaleString('es-PE')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50">
              <button type="button" onClick={() => setModalDetallesOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all">
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL DE PROCESAMIENTO DE PAGO CON PASARELA DINÁMICA INTELIGENTE ================= */}
      {modalPagoOpen && transaccionSeleccionada && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalPagoOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Wallet className="text-emerald-500" /> Pasarela de Pago
              </h3>
              <button type="button" onClick={() => setModalPagoOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleProcesarPago} className="p-6">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center mb-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                <p className="text-3xl font-black text-slate-800">S/ {transaccionSeleccionada.monto?.toFixed(2) || '0.00'}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1 truncate">{transaccionSeleccionada.motivo || 'Atención Veterinaria'}</p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Seleccionar Método</label>
                <div className="grid grid-cols-4 gap-2">
                  
                  <label className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'EFECTIVO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    <input type="radio" name="medioPago" value="EFECTIVO" className="hidden" checked={medioPago === 'EFECTIVO'} onChange={handleCambioMedioPago} />
                    <Banknote size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Efectivo</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'TARJETA_CREDITO' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    <input type="radio" name="medioPago" value="TARJETA_CREDITO" className="hidden" checked={medioPago === 'TARJETA_CREDITO'} onChange={handleCambioMedioPago} />
                    <CreditCard size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Tarjeta</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'YAPE' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    <input type="radio" name="medioPago" value="YAPE" className="hidden" checked={medioPago === 'YAPE'} onChange={handleCambioMedioPago} />
                    <Smartphone size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Yape</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 cursor-pointer transition-all ${medioPago === 'PLIN' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    <input type="radio" name="medioPago" value="PLIN" className="hidden" checked={medioPago === 'PLIN'} onChange={handleCambioMedioPago} />
                    <Smartphone size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase">Plin</span>
                  </label>

                </div>

                {medioPago !== 'EFECTIVO' && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700">¿Utilizar Dispositivo POS físico?</span>
                      <span className="text-[10px] text-slate-400 font-medium">Desactiva si el pago es directo por celular</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setCuentaConPOS(!cuentaConPOS); setDatosTarjeta({ numero: '', fecha: '', cvv: '' }); setReferenciaYape(''); }}
                      className={`transition-colors ${cuentaConPOS ? 'text-emerald-500' : 'text-slate-300'}`}
                    >
                      {cuentaConPOS ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  {medioPago === 'EFECTIVO' && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div>
                        <label className="block text-xs font-bold text-emerald-700 mb-1">Monto Recibido del Cliente</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 font-bold text-emerald-600">S/</span>
                          <input 
                            type="number" step="0.10" min={transaccionSeleccionada.monto} required
                            value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} 
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      {montoRecibido && Number(montoRecibido) >= transaccionSeleccionada.monto && (
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-200">
                          <span className="text-xs font-bold text-slate-500 uppercase">Vuelto a entregar:</span>
                          <span className="text-base font-black text-rose-500">S/ {(Number(montoRecibido) - transaccionSeleccionada.monto).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {medioPago !== 'EFECTIVO' && cuentaConPOS && (
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in fade-in duration-200">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 leading-tight">
                        Dispositivo POS detectado. El pago se procesará y validará externamente en el terminal físico de la veterinaria.
                      </p>
                    </div>
                  )}

                  {medioPago === 'TARJETA_CREDITO' && !cuentaConPOS && (
                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="w-11 h-11 bg-white rounded-xl border border-sky-200 flex items-center justify-center shrink-0">
                        <CreditCard size={22} className="text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-sky-700 mb-1">N° de Tarjeta (Falsa para demo)</label>
                        <input 
                          type="text" required maxLength="16" value={datosTarjeta.numero} onChange={(e) => setDatosTarjeta({...datosTarjeta, numero: e.target.value.replace(/\D/g, '')})} 
                          className="w-full px-3 py-2.5 bg-white border border-sky-200 rounded-xl text-sm font-bold tracking-widest text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                    </div>
                  )}

                  {(medioPago === 'YAPE' || medioPago === 'PLIN') && !cuentaConPOS && (
                    <div className={`p-4 rounded-xl border flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200 ${medioPago === 'YAPE' ? 'bg-purple-50 border-purple-100' : 'bg-sky-50 border-sky-100'}`}>
                      <div className={`w-14 h-14 bg-white rounded-xl border-2 border-dashed flex flex-col items-center justify-center shrink-0 ${medioPago === 'YAPE' ? 'border-purple-300 text-purple-500' : 'border-sky-300 text-sky-500'}`}>
                        <QrCode size={24} />
                      </div>
                      <div className="flex-1">
                        <label className={`block text-xs font-bold mb-1 ${medioPago === 'YAPE' ? 'text-purple-700' : 'text-sky-700'}`}>Número de Operación Celular</label>
                        <input 
                          type="text" required value={referenciaYape} onChange={(e) => setReferenciaYape(e.target.value)} 
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 ${medioPago === 'YAPE' ? 'border-purple-200 focus:ring-purple-500' : 'border-sky-200 focus:ring-sky-500'}`}
                          placeholder="Código de 6 dígitos"
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setModalPagoOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!botonHabilitado} 
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all"
                >
                  {procesando ? <Activity size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>}
                  {procesando ? 'Verificando...' : 'Confirmar e Imprimir'}
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

export default CajaPage;
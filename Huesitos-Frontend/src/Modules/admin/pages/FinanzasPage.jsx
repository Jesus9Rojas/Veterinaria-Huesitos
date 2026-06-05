import { useState, useEffect } from 'react';
import { 
  Wallet, DollarSign, CreditCard, Smartphone, 
  Activity, Search, CalendarDays, FileSpreadsheet, Banknote, Users
} from 'lucide-react';
import { listarTransacciones } from '../../../services/transaccionService';

const FinanzasPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tabActual, setTabActual] = useState('DIARIO'); // DIARIO o HISTORIAL

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await listarTransacciones();
        if (isMounted) {
          data.sort((a, b) => b.id - a.id);
          setTransacciones(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar finanzas:", error);
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Lógica inteligente para definir el Concepto y Nombre del Cliente
  const extraerInfoVisible = (t) => {
    const esCita = !!t.cita;
    const esPedido = !!t.pedido;

    let concepto = "Servicio General";
    if (esCita) concepto = `Cita Médica: ${t.cita.servicio?.nombre}`;
    if (esPedido) concepto = `Tienda: Venta de Productos`;
    if (!esCita && !esPedido) concepto = t.motivo || t.referenciaPago || 'Servicio General';

    let nombreCliente = "Cliente Anónimo";
    if (esCita) nombreCliente = t.cita.mascota?.dueño?.nombreCompleto || t.cita.mascota?.dueno?.nombreCompleto || "No asignado";
    if (esPedido && t.pedido.cliente) nombreCliente = t.pedido.cliente.nombreCompleto || t.pedido.cliente.correo;
    if (esPedido && !t.pedido.cliente) nombreCliente = "Venta Mostrador POS";

    return { concepto, nombreCliente };
  };

  // Filtrado general de la tabla
  const transaccionesFiltradas = transacciones.filter(t => {
    const { concepto, nombreCliente } = extraerInfoVisible(t);
    const coincideBusqueda = `${concepto} ${nombreCliente}`.toLowerCase().includes(busqueda.toLowerCase());
    
    // Filtro por Pestaña (Reporte Diario vs Historial)
    const fechaBase = t.fechaPago || t.fechaCreacion;
    const fechaTx = fechaBase ? new Date(fechaBase) : new Date();
    const hoy = new Date();
    const esHoy = fechaTx.getDate() === hoy.getDate() && 
                  fechaTx.getMonth() === hoy.getMonth() && 
                  fechaTx.getFullYear() === hoy.getFullYear();
    
    const coincideTiempo = tabActual === 'DIARIO' ? esHoy : true;

    return coincideBusqueda && coincideTiempo;
  });

  // ¡LA CORRECCIÓN ESTÁ AQUÍ! Ahora suma reconociendo "APROBADO" y "COMPLETADO"
  const calcularTotales = () => {
    let totalIngresos = 0;
    let totalEfectivo = 0;
    let totalTarjetas = 0;
    let totalDigital = 0;

    transaccionesFiltradas.forEach(t => {
      const estado = t.estadoPago ? t.estadoPago.toUpperCase() : '';
      
      // Verificamos si es un pago exitoso (ahora incluye la venta de tienda)
      if (estado === 'APROBADO' || estado === 'COMPLETADO' || estado === 'PAGADO') {
        const monto = parseFloat(t.monto) || 0;
        totalIngresos += monto;

        const medio = t.medioPago ? t.medioPago.toUpperCase() : '';
        if (medio === 'EFECTIVO') totalEfectivo += monto;
        else if (medio === 'TARJETA_CREDITO' || medio === 'TARJETA_DEBITO') totalTarjetas += monto;
        else if (medio === 'YAPE' || medio === 'PLIN') totalDigital += monto;
      }
    });

    return { totalIngresos, totalEfectivo, totalTarjetas, totalDigital };
  };

  const totales = calcularTotales();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-500" /> Caja y Finanzas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitorea los ingresos, caja y métricas financieras.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all">
          <FileSpreadsheet size={18} /> Exportar Excel
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS ACTUALIZADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Ingresos Totales</p>
            <p className="text-2xl font-black text-slate-800">S/ {totales.totalIngresos.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Banknote size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Efectivo</p>
            <p className="text-2xl font-black text-slate-800">S/ {totales.totalEfectivo.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Tarjetas</p>
            <p className="text-2xl font-black text-slate-800">S/ {totales.totalTarjetas.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Smartphone size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Yape / Plin</p>
            <p className="text-2xl font-black text-slate-800">S/ {totales.totalDigital.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* PESTAÑAS Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 border-b border-slate-200 px-2 w-full md:w-auto">
          <button onClick={() => setTabActual('DIARIO')} className={`flex items-center gap-2 pb-4 font-bold transition-all border-b-2 px-2 ${tabActual === 'DIARIO' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <CalendarDays size={18}/> Reporte Diario
          </button>
          <button onClick={() => setTabActual('HISTORIAL')} className={`flex items-center gap-2 pb-4 font-bold transition-all border-b-2 px-2 ${tabActual === 'HISTORIAL' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <Wallet size={18}/> Historial Completo
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transacción..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* TABLA DE HISTORIAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-blue-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Cargando registros financieros...</p>
          </div>
        ) : transaccionesFiltradas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/50">
            <Wallet size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">No hay transacciones registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Recibo / Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Medio Pago</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transaccionesFiltradas.map((t) => {
                  const fechaBase = t.fechaPago || t.fechaCreacion;
                  const fechaFormat = fechaBase ? new Date(fechaBase).toLocaleDateString('es-PE') : 'Fecha no registrada';
                  const { concepto, nombreCliente } = extraerInfoVisible(t);
                  
                  // Verificación visual de estado
                  const estado = t.estadoPago ? t.estadoPago.toUpperCase() : '';
                  const esPagado = estado === 'APROBADO' || estado === 'COMPLETADO' || estado === 'PAGADO';
                  
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
                        {t.medioPago ? (
                          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            {t.medioPago.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No definido</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-black text-emerald-600">S/ {t.monto ? parseFloat(t.monto).toFixed(2) : '0.00'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {esPagado ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">Aprobado</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-amber-50 text-amber-600 border border-amber-200">{t.estadoPago || 'Pendiente'}</span>
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
    </div>
  );
};

export default FinanzasPage;
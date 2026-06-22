import { useState, useEffect } from "react";
import { Download, Search, Filter, DollarSign, Activity, FileText, CalendarDays, Archive } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true
});

const FinanzasPage = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('diario');
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMedio, setFiltroMedio] = useState("");
  const [filtroConcepto, setFiltroConcepto] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchTransacciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/transacciones", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isMounted) {
          const dataProcesada = res.data.map(t => {
            const fechaReal = t.fechaCreacion || t.fechaActualizacion;
            let conceptoReal = "Transacción General";
            let tipoConcepto = "";
            
            if (t.cita) {
              const nombreDueno = t.cita.mascota?.dueño?.nombreCompleto || "Desconocido";
              const nombreServicio = t.cita.servicio?.nombre || "Consulta Médica";
              conceptoReal = `Cita: ${nombreServicio} - Cliente: ${nombreDueno}`;
              tipoConcepto = "CITA";
            } else if (t.pedido) {
              const nombreDueno = t.pedido.dueño?.nombreCompleto || "Público General";
              conceptoReal = `Tienda: Pedido #${t.pedido.id} - Cliente: ${nombreDueno}`;
              tipoConcepto = "TIENDA";
            } else if (t.referencia) {
              conceptoReal = t.referencia;
            }

            let estadoReal = t.estadoPago;
            if (t.cita && t.cita.estado === 'CANCELADA') estadoReal = 'RECHAZADO';
            else if (t.pedido && t.pedido.estadoPedido === 'CANCELADO') estadoReal = 'RECHAZADO';

            return { ...t, fechaReal, conceptoReal, tipoConcepto, estadoReal };
          });
          const dataOrdenada = dataProcesada.sort((a, b) => new Date(b.fechaReal) - new Date(a.fechaReal));
          setTransacciones(dataOrdenada);
        }
      } catch (error) {
        console.error("Error al cargar finanzas:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTransacciones();
    return () => { isMounted = false; };
  }, []);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const transaccionesFiltradas = transacciones.filter(t => {
    if (activeTab === 'diario' && !isToday(t.fechaReal)) return false;
    const matchEstado = filtroEstado ? t.estadoReal === filtroEstado : true;
    const matchMedio = filtroMedio ? t.medioPago === filtroMedio : true;
    const matchConcepto = filtroConcepto ? t.tipoConcepto === filtroConcepto : true;
    const matchBusqueda = busqueda ? t.conceptoReal?.toLowerCase().includes(busqueda.toLowerCase()) || t.estadoReal?.toLowerCase().includes(busqueda.toLowerCase()) || t.medioPago?.toLowerCase().includes(busqueda.toLowerCase()) : true;
    return matchEstado && matchMedio && matchConcepto && matchBusqueda;
  });

  const totalIngresos = transaccionesFiltradas.filter(t => t.estadoReal === 'APROBADO').reduce((sum, t) => sum + (t.monto || 0), 0);
  const totalPendientes = transaccionesFiltradas.filter(t => t.estadoReal === 'PENDIENTE').length;

  const exportarExcel = () => {
    if (transaccionesFiltradas.length === 0) {
      return Toast.fire({ icon: 'warning', title: 'No hay transacciones para exportar' });
    }

    const headers = ["ID Transaccion", "Fecha", "Concepto", "Medio de Pago", "Estado", "Monto (S/.)"];
    const rows = transaccionesFiltradas.map(t => [
      t.id, t.fechaReal ? new Date(t.fechaReal).toLocaleString('es-PE') : 'Sin Fecha',
      `"${t.conceptoReal || ''}"`, t.medioPago || 'N/A', t.estadoReal, t.monto.toFixed(2)
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const prefijo = activeTab === 'diario' ? 'Caja_Diaria' : 'Historial_Completo';
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_${prefijo}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Toast.fire({ icon: 'success', title: 'Archivo descargado' });
  };

  if (loading) return <div className="flex flex-col justify-center items-center h-64 text-emerald-500 font-semibold animate-pulse gap-3"><Activity className="animate-spin" size={36} /><p>Cargando registros financieros...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Caja y Finanzas</h1>
          <p className="text-slate-500 text-sm mt-1">Supervisa los ingresos, cuadre de caja y estados de pago.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shrink-0 w-full sm:w-auto">
          <button onClick={() => setActiveTab('diario')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'diario' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-slate-200/50'}`}><CalendarDays size={18} /> Reporte Diario</button>
          <button onClick={() => setActiveTab('completo')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'completo' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:bg-slate-200/50'}`}><Archive size={18} /> Historial Completo</button>
        </div>
        <button onClick={exportarExcel} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"><Download size={18} /> Excel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl shadow-sm text-white relative overflow-hidden transition-colors duration-300 ${activeTab === 'diario' ? 'bg-gradient-to-br from-emerald-500 to-teal-400' : 'bg-gradient-to-br from-indigo-500 to-sky-400'}`}>
          <div className="relative z-10"><p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Ingresos {activeTab === 'diario' ? 'de Hoy' : 'Totales'}</p><h3 className="text-3xl font-black flex items-center gap-2"><DollarSign size={28} /> {totalIngresos.toFixed(2)}</h3></div>
          <Activity className="absolute -right-4 -bottom-4 text-white/20" size={120} />
        </div>
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="relative z-10"><p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Pendientes de Cobro {activeTab === 'diario' ? '(Hoy)' : '(Histórico)'}</p><h3 className="text-3xl font-black text-amber-500 flex items-center gap-2"><FileText size={28} /> {totalPendientes}</h3></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b border-slate-100 pb-3"><Filter size={18} className={activeTab === 'diario' ? 'text-emerald-500' : 'text-indigo-500'} /> Filtros de Búsqueda</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input type="text" placeholder="Buscar concepto o estado..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={`w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 outline-none ${activeTab === 'diario' ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`} /></div>
          <select value={filtroConcepto} onChange={(e) => setFiltroConcepto(e.target.value)} className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 outline-none ${activeTab === 'diario' ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`}><option value="">Todos los Conceptos</option><option value="CITA">Citas Médicas</option><option value="TIENDA">Tienda (Productos)</option></select>
          <select value={filtroMedio} onChange={(e) => setFiltroMedio(e.target.value)} className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 outline-none ${activeTab === 'diario' ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`}><option value="">Todos los Pagos</option><option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="PLIN">Plin</option><option value="TRANSFERENCIA">Transferencia</option><option value="TARJETA_DEBITO">Tarjeta Débito</option><option value="TARJETA_CREDITO">Tarjeta Crédito</option></select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 outline-none ${activeTab === 'diario' ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`}><option value="">Todos los Estados</option><option value="APROBADO">Aprobados</option><option value="PENDIENTE">Pendientes</option><option value="RECHAZADO">Rechazados / Cancelados</option><option value="REEMBOLSADO">Reembolsados</option></select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Fecha</th><th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Concepto</th><th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Medio Pago</th><th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Estado</th><th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Monto</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transaccionesFiltradas.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium">No hay transacciones registradas {activeTab === 'diario' ? 'para el día de hoy' : ''} con los filtros aplicados.</td></tr>
              ) : (
                transaccionesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{t.fechaReal ? new Date(t.fechaReal).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Sin Fecha'}</td>
                    <td className="px-6 py-4 text-slate-800 font-semibold max-w-sm truncate" title={t.conceptoReal}>{t.conceptoReal}</td>
                    <td className="px-6 py-4 text-center"><span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg border border-slate-200">{t.medioPago || 'N/A'}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${t.estadoReal === 'APROBADO' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : t.estadoReal === 'PENDIENTE' ? 'bg-amber-100 text-amber-700 border border-amber-200' : t.estadoReal === 'RECHAZADO' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>{t.estadoReal}</span></td>
                    <td className="px-6 py-4 text-right font-black text-slate-800 whitespace-nowrap">S/. {t.monto?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanzasPage;
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart3, Filter, Package, Syringe, Pill, Bug,
  AlertTriangle, CheckCircle2, XCircle, Search, FileText, Activity,
  FileSpreadsheet
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true,
  didOpen: (toast) => { toast.onmouseenter = Swal.stopTimer; toast.onmouseleave = Swal.resumeTimer; }
});

const InventarioCompletoPage = () => {
  const [inventarioGlobal, setInventarioGlobal] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroStock, setFiltroStock] = useState('TODOS');

  const [vista, setVista] = useState('TABLA');

  useEffect(() => {
    let isMounted = true;
    const fetchTodo = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [resProductos, resVacunas, resMedicinas, resAntiparasitarios] = await Promise.all([
          axios.get('http://localhost:8080/api/productos/todos', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/vacunas', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/medicinas', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/antiparasitarios', { headers }).catch(() => ({ data: [] }))
        ]);

        if (isMounted) {
          const prods = resProductos.data.map(p => ({ ...p, tipo_item: 'PRODUCTO' }));
          const vacs = resVacunas.data.map(v => ({ ...v, tipo_item: 'VACUNA' }));
          const meds = resMedicinas.data.map(m => ({ ...m, tipo_item: 'MEDICINA' }));
          const antis = resAntiparasitarios.data.map(a => ({ ...a, tipo_item: 'ANTIPARASITARIO' }));

          setInventarioGlobal([...prods, ...vacs, ...meds, ...antis]);
        }
      } catch (error) {
        console.error("Error al unificar inventario:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTodo();
    return () => { isMounted = false; };
  }, []);

  const getStockReal = (item) => {
    if (item.stock !== undefined && item.stock !== null) return item.stock;
    if (item.stockDisponible !== undefined && item.stockDisponible !== null) return item.stockDisponible;
    return 0; 
  };

  const inventarioFiltrado = inventarioGlobal.filter(item => {
    const coincideTexto = (item.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                          (item.proveedor || item.marca || '').toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideTexto) return false;
    if (filtroTipo !== 'TODOS' && item.tipo_item !== filtroTipo) return false;

    const esActivo = item.activo !== false; 
    if (filtroEstado === 'ACTIVOS' && !esActivo) return false;
    if (filtroEstado === 'INACTIVOS' && esActivo) return false;

    const stockActual = getStockReal(item);
    if (filtroStock === 'BAJO' && (stockActual === 0 || stockActual > 5)) return false;
    if (filtroStock === 'CERO' && stockActual > 0) return false;
    if (filtroStock === 'NORMAL' && stockActual <= 5) return false;

    return true;
  });

  // Límite visual en pantalla
  const inventarioVisualizado = [...inventarioFiltrado]
    .sort((a, b) => b.id - a.id) 
    .slice(0, 12); 

  const exportarExcelProfesional = async () => {
    if (inventarioFiltrado.length === 0) return Toast.fire({ icon: 'warning', title: 'No hay datos para exportar' });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Maestro', { views: [{ showGridLines: false }] });

    worksheet.mergeCells('A1:F2');
    const titulo = worksheet.getCell('A1');
    titulo.value = 'REPORTE MAESTRO DE INVENTARIO CLÍNICO - VET. HUESITOS';
    titulo.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; 
    titulo.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A3:F3');
    const fechaEmision = worksheet.getCell('A3');
    fechaEmision.value = `Fecha de emisión del reporte: ${new Date().toLocaleString('es-PE')}`;
    fechaEmision.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
    fechaEmision.alignment = { vertical: 'middle', horizontal: 'right' };

    const encabezados = ['TIPO', 'ESTADO', 'NOMBRE DEL ÍTEM', 'PROVEEDOR / MARCA', 'PRECIO (S/)', 'STOCK ACTUAL'];
    const rowEncabezado = worksheet.getRow(5);
    rowEncabezado.values = encabezados;
    rowEncabezado.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    rowEncabezado.height = 25;
    rowEncabezado.alignment = { vertical: 'middle', horizontal: 'center' };
    
    rowEncabezado.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }; 
      cell.border = { top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
    });

    inventarioFiltrado.forEach(item => {
      const tipo = item.tipo_item;
      const estado = item.activo !== false ? 'ACTIVO' : 'SUSPENDIDO';
      const nombre = item.nombre || '';
      const proveedor = item.proveedor || item.marca || 'Sin registro';
      const precio = parseFloat(item.precio || item.precioVenta || 0);
      const stock = getStockReal(item);

      const filaDatos = worksheet.addRow([tipo, estado, nombre, proveedor, precio, stock]);

      filaDatos.getCell(5).numFmt = '"S/" #,##0.00';
      filaDatos.getCell(5).font = { bold: true, color: { argb: 'FF059669' } }; 

      const celdaStock = filaDatos.getCell(6);
      celdaStock.alignment = { horizontal: 'center' };
      if (stock === 0) celdaStock.font = { bold: true, color: { argb: 'FFDC2626' } }; 
      else if (stock <= 5) celdaStock.font = { bold: true, color: { argb: 'FFD97706' } }; 
      else celdaStock.font = { bold: true, color: { argb: 'FF475569' } }; 

      if (estado === 'SUSPENDIDO') filaDatos.getCell(2).font = { bold: true, color: { argb: 'FFEF4444' } }; 
      else filaDatos.getCell(2).font = { bold: true, color: { argb: 'FF10B981' } }; 

      filaDatos.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } }; 
        cell.alignment = { vertical: 'middle' };
      });
    });

    worksheet.columns = [{ width: 18 }, { width: 15 }, { width: 45 }, { width: 30 }, { width: 15 }, { width: 15 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Huesitos_Reporte_Inventario_${new Date().getTime()}.xlsx`);
    Toast.fire({ icon: 'success', title: 'Excel descargado exitosamente' });
  };

  const exportarCSVSimple = () => {
    if (inventarioFiltrado.length === 0) return Toast.fire({ icon: 'warning', title: 'No hay datos para exportar' });
    let csvContent = "TIPO,ESTADO,NOMBRE,PROVEEDOR_MARCA,PRECIO_S/,STOCK\n";
    inventarioFiltrado.forEach(item => {
      const tipo = item.tipo_item;
      const estado = item.activo !== false ? 'ACTIVO' : 'SUSPENDIDO';
      const nombre = `"${(item.nombre || '').replace(/"/g, '""')}"`;
      const proveedor = `"${(item.proveedor || item.marca || 'N/A').replace(/"/g, '""')}"`;
      const precio = item.precio || item.precioVenta || 0;
      const stock = getStockReal(item);
      csvContent += `${tipo},${estado},${nombre},${proveedor},${precio},${stock}\n`;
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `DataCruda_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.fire({ icon: 'success', title: 'Archivo CSV descargado' });
  };

  const totalItems = inventarioGlobal.length;
  const totalProductos = inventarioGlobal.filter(i => i.tipo_item === 'PRODUCTO').length;
  const totalVacunas = inventarioGlobal.filter(i => i.tipo_item === 'VACUNA').length;
  const totalMedicinas = inventarioGlobal.filter(i => i.tipo_item === 'MEDICINA').length;
  const totalAntiparasitarios = inventarioGlobal.filter(i => i.tipo_item === 'ANTIPARASITARIO').length;

  const itemsAgotados = inventarioGlobal.filter(i => getStockReal(i) === 0).length;
  const itemsBajoStock = inventarioGlobal.filter(i => getStockReal(i) > 0 && getStockReal(i) <= 5).length;
  const itemsSuspendidos = inventarioGlobal.filter(i => i.activo === false).length;

  const topAgotados = inventarioGlobal.filter(i => getStockReal(i) === 0 && i.activo !== false).slice(0, 8);

  const getIcon = (tipo) => {
    if (tipo === 'PRODUCTO') return <Package size={16} className="text-amber-500" />;
    if (tipo === 'VACUNA') return <Syringe size={16} className="text-sky-500" />;
    if (tipo === 'ANTIPARASITARIO') return <Bug size={16} className="text-orange-500" />; 
    return <Pill size={16} className="text-emerald-500" />;
  };

  const getBadgeColor = (tipo) => {
    if (tipo === 'PRODUCTO') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tipo === 'VACUNA') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (tipo === 'ANTIPARASITARIO') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><BarChart3 className="text-indigo-500" /> Reportes e Inventario Maestro</h1>
          <p className="text-slate-500 text-sm mt-1">Visualiza, filtra y exporta el estado global de todos los almacenes.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto shrink-0">
          <button onClick={() => setVista('TABLA')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${vista === 'TABLA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Base de Datos</button>
          <button onClick={() => setVista('GRAFICOS')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${vista === 'GRAFICOS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard Gráfico</button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 text-indigo-500 font-semibold animate-pulse gap-3"><Activity className="animate-spin" size={36} /><p>Consolidando bases de datos de almacén...</p></div>
      ) : vista === 'TABLA' ? (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar producto, vacuna, medicina o antiparasitario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="TODOS">Todos los Tipos</option>
                <option value="PRODUCTO">Solo Productos</option>
                <option value="VACUNA">Solo Vacunas</option>
                <option value="MEDICINA">Solo Medicinas</option>
                <option value="ANTIPARASITARIO">Solo Antiparasitarios</option> {/* NUEVO */}
              </select>
              <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="TODOS">Cualquier Stock</option><option value="NORMAL">Stock Normal (&gt; 5)</option><option value="BAJO">Stock Bajo (1 a 5)</option><option value="CERO">Agotados (0)</option>
              </select>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="TODOS">Activos e Inactivos</option><option value="ACTIVOS">Solo Activos</option><option value="INACTIVOS">Solo Suspendidos</option>
              </select>
              <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner border border-slate-200">
                <button onClick={exportarExcelProfesional} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"><FileSpreadsheet size={18} /> Excel Moderno</button>
                <button onClick={exportarCSVSimple} className="text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2">CSV</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            {inventarioFiltrado.length > 0 && (
              <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><Filter size={16}/> Mostrando {inventarioVisualizado.length} registros en pantalla de {inventarioFiltrado.length} disponibles.</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">El Excel descargará todos los {inventarioFiltrado.length}</span>
              </div>
            )}
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="min-w-full divide-y divide-slate-100 relative">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Tipo</th><th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Ítem</th><th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Proveedor/Marca</th><th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Precio Venta</th><th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Stock Actual</th><th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inventarioVisualizado.map((item, idx) => {
                    const stock = getStockReal(item);
                    const inactivo = item.activo === false;
                    return (
                      <tr key={`${item.tipo_item}-${item.id}-${idx}`} className={`hover:bg-indigo-50/30 transition-colors ${inactivo ? 'opacity-60 bg-slate-50/50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${getBadgeColor(item.tipo_item)}`}>{getIcon(item.tipo_item)} {item.tipo_item}</span></td>
                        <td className="px-6 py-4 font-bold text-slate-800 truncate max-w-[200px]" title={item.nombre}>{item.nombre}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[150px]">{item.proveedor || item.marca || item.categoria?.nombre || 'N/A'}</td>
                        <td className="px-6 py-4 font-black text-emerald-600">S/ {(item.precio || item.precioVenta || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center"><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-black border ${stock === 0 ? 'bg-red-50 text-red-600 border-red-200' : stock <= 5 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{stock} Unid.</span></td>
                        <td className="px-6 py-4 text-center">{inactivo ? <span className="text-red-500 font-bold flex items-center justify-center gap-1"><XCircle size={16}/> Suspendido</span> : <span className="text-emerald-500 font-bold flex items-center justify-center gap-1"><CheckCircle2 size={16}/> Activo</span>}</td>
                      </tr>
                    );
                  })}
                  {inventarioFiltrado.length === 0 && (<tr><td colSpan="6" className="py-12 text-center text-slate-400 font-bold">No se encontraron resultados con los filtros actuales.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center"><p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FileText size={16}/> Total Registros</p><h3 className="text-4xl font-black text-slate-800">{totalItems}</h3></div>
            <div className="bg-red-50 p-6 rounded-3xl shadow-sm border border-red-100 flex flex-col justify-center"><p className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Agotados (Stock 0)</p><h3 className="text-4xl font-black text-red-600">{itemsAgotados}</h3></div>
            <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-100 flex flex-col justify-center"><p className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Stock Bajo (1-5)</p><h3 className="text-4xl font-black text-amber-600">{itemsBajoStock}</h3></div>
            <div className="bg-slate-100 p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center"><p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><XCircle size={16}/> Ítems Suspendidos</p><h3 className="text-4xl font-black text-slate-700">{itemsSuspendidos}</h3></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-500"/> Distribución del Almacén Maestro</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2"><span className="text-amber-600 flex items-center gap-2"><Package size={16}/> Productos (Retail)</span><span className="text-slate-600">{totalProductos} ítems ({((totalProductos/totalItems)*100 || 0).toFixed(1)}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden"><div className="bg-amber-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${(totalProductos/totalItems)*100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2"><span className="text-sky-600 flex items-center gap-2"><Syringe size={16}/> Vacunas (Biológicos)</span><span className="text-slate-600">{totalVacunas} ítems ({((totalVacunas/totalItems)*100 || 0).toFixed(1)}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden"><div className="bg-sky-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${(totalVacunas/totalItems)*100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2"><span className="text-emerald-600 flex items-center gap-2"><Pill size={16}/> Medicamentos Clínicos</span><span className="text-slate-600">{totalMedicinas} ítems ({((totalMedicinas/totalItems)*100 || 0).toFixed(1)}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden"><div className="bg-emerald-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${(totalMedicinas/totalItems)*100}%` }}></div></div>
                </div>
                {/* NUEVA BARRA DE ANTIPARASITARIOS */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2"><span className="text-orange-600 flex items-center gap-2"><Bug size={16}/> Antiparasitarios</span><span className="text-slate-600">{totalAntiparasitarios} ítems ({((totalAntiparasitarios/totalItems)*100 || 0).toFixed(1)}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden"><div className="bg-orange-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${(totalAntiparasitarios/totalItems)*100}%` }}></div></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500"/> Urgencia de Reposición</h3>
              <p className="text-xs text-slate-500 mb-4">Ítems activos con stock CERO que requieren compra inmediata a proveedores.</p>
              <div className="space-y-3">
                {topAgotados.length === 0 ? (
                  <div className="text-center py-8 bg-emerald-50 rounded-xl text-emerald-600 font-bold border border-emerald-100"><CheckCircle2 className="mx-auto mb-2" size={24}/> Todo en orden. No hay agotados.</div>
                ) : (
                  topAgotados.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                      <div className="overflow-hidden pr-3"><p className="text-sm font-bold text-slate-800 truncate">{item.nombre}</p><p className="text-[10px] font-black uppercase text-red-500 tracking-widest">{item.tipo_item}</p></div>
                      <span className="shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Stock 0</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioCompletoPage;
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Pill, Syringe, Bug, Plus, Trash2, ShoppingCart, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { sileo } from "sileo";

const RecetaCobroAdicionalModal = ({ citaId, onClose, onGuardadoExitoso }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoActivo, setTipoActivo] = useState("MEDICINA");
  const [carrito, setCarrito] = useState([]);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const fetchCatalogos = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [resMed, resVac, resAnti] = await Promise.all([
        axios.get("http://localhost:8080/api/medicinas", { headers }),
        axios.get("http://localhost:8080/api/vacunas", { headers }),
        axios.get("http://localhost:8080/api/antiparasitarios", { headers })
      ]);

      const meds = resMed.data.map(i => ({ ...i, tipoItem: "MEDICINA" }));
      const vacs = resVac.data.map(i => ({ ...i, tipoItem: "VACUNA" }));
      const antis = resAnti.data.map(i => ({ ...i, tipoItem: "ANTIPARASITARIO" }));
      
      setCatalogo([...meds, ...vacs, ...antis]);
    };
    fetchCatalogos();
  }, []);

  const itemsVisibles = catalogo.filter(i => 
    i.tipoItem === tipoActivo && 
    (i.nombre.toLowerCase().includes(busqueda.toLowerCase())) &&
    i.stock > 0 && i.activo !== false
  );

  const agregarAlCarrito = (item) => {
    const existe = carrito.find(c => c.itemId === item.id && c.tipoItem === item.tipoItem);
    if (existe) {
      if (existe.cantidad >= item.stock) return sileo.warning({ title: 'Aviso', description: 'Stock máximo alcanzado' });
      setCarrito(carrito.map(c => c.itemId === item.id && c.tipoItem === item.tipoItem ? { ...c, cantidad: c.cantidad + 1, subtotal: (c.cantidad + 1) * c.precioUnitario } : c));
    } else {
      setCarrito([...carrito, { tipoItem: item.tipoItem, itemId: item.id, nombre: item.nombre, precioUnitario: item.precio, cantidad: 1, subtotal: item.precio, stockMax: item.stock }]);
    }
  };

  const removerDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const confirmarRecetaYCobro = async () => {
    if (carrito.length === 0) return sileo.warning({ title: 'Aviso', description: 'Agrega al menos un ítem' });
    setProcesando(true);
    try {
      const payload = carrito.map(c => ({ tipoItem: c.tipoItem, itemId: c.itemId, cantidad: c.cantidad }));
      
      const peticion = axios.post(`http://localhost:8080/api/citas/${citaId}/recetar-items`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      sileo.promise(peticion, {
        loading: { title: 'Registrando...' },
        success: { title: '¡Éxito!', description: 'Receta registrada y enviada a Caja' },
        error: (err) => ({ title: 'Error', description: err.response?.data || 'Error al procesar la receta' })
      });

      await peticion;
      onGuardadoExitoso();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  const totalCalculado = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden shadow-2xl">
        
        {/* LADO IZQUIERDO: CATÁLOGO */}
        <div className="w-2/3 flex flex-col bg-slate-50 border-r border-slate-200">
          <div className="p-5 border-b border-slate-200 bg-white">
            <h3 className="text-lg font-black text-slate-800 mb-4">Recetar y Aplicar Insumos</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button onClick={() => setTipoActivo("MEDICINA")} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${tipoActivo === 'MEDICINA' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}><Pill size={16}/> Medicinas</button>
              <button onClick={() => setTipoActivo("VACUNA")} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${tipoActivo === 'VACUNA' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}><Syringe size={16}/> Vacunas</button>
              <button onClick={() => setTipoActivo("ANTIPARASITARIO")} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${tipoActivo === 'ANTIPARASITARIO' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}><Bug size={16}/> Antiparasitarios</button>
            </div>
            <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={16}/><input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-500" /></div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-3 custom-scrollbar">
            {itemsVisibles.map(item => (
              <div key={item.id} onClick={() => agregarAlCarrito(item)} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm line-clamp-2">{item.nombre}</p>
                  <p className="text-xs text-slate-400 mt-1">Stock: {item.stock}</p>
                </div>
                <div className="flex justify-between items-end mt-3">
                  <span className="font-black text-emerald-600">S/ {item.precio.toFixed(2)}</span>
                  <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600"><Plus size={16}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: CARRITO / RECETA */}
        <div className="w-1/3 flex flex-col bg-white">
          <div className="p-5 border-b border-slate-100 bg-slate-800 text-white flex justify-between items-center">
            <h3 className="font-black flex items-center gap-2"><ShoppingCart size={18}/> A cobrar en Caja</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
            {carrito.length === 0 ? (
              <div className="text-center text-slate-400 mt-10 text-sm font-medium">Aún no has recetado nada para esta cita.</div>
            ) : (
              carrito.map((c, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                  <button onClick={() => removerDelCarrito(i)} className="absolute top-2 right-2 text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                  <p className="font-bold text-slate-800 text-xs pr-6 line-clamp-2">{c.nombre}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-black text-slate-500 px-2 py-1 bg-white rounded-md border">{c.cantidad} unid.</span>
                    <span className="font-black text-emerald-600 text-sm">S/ {c.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-slate-500">Costo a sumar:</span>
              <span className="text-2xl font-black text-emerald-600">S/ {totalCalculado.toFixed(2)}</span>
            </div>
            <button onClick={confirmarRecetaYCobro} disabled={procesando} className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 flex justify-center items-center gap-2 disabled:opacity-50">
              <CheckCircle2 size={20}/> Confirmar y Enviar a Caja
            </button>
          </div>
        </div>
      </div>
    </div>, document.body
  );
};

export default RecetaCobroAdicionalModal;
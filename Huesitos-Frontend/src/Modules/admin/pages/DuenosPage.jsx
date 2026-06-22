import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { obtenerListaDuenos, crearNuevoDueno, actualizarDuenoExistente } from "../../../services/duenoService";
import { UserPlus, Search, MapPin, Phone, Mail, User, X, Edit2, Lock } from 'lucide-react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true
});

const DuenosPage = () => {
  const [duenos, setDuenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ correo: "", contrasena: "", nombreCompleto: "", telefono: "", direccion: "" });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const fetchDuenos = async () => {
      setLoading(true);
      try {
        const data = await obtenerListaDuenos();
        setDuenos(data);
      } catch (error) {
        console.error("Error al recuperar los clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDuenos();
  }, [refreshTrigger]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const abrirCrearModal = () => {
    setEditandoId(null);
    setForm({ correo: "", contrasena: "", nombreCompleto: "", telefono: "", direccion: "" });
    setModalOpen(true);
  };

  const abrirEditarModal = (dueno) => {
    setEditandoId(dueno.id);
    setForm({
      correo: dueno.correo || "", contrasena: "", nombreCompleto: dueno.nombreCompleto,
      telefono: dueno.telefono, direccion: dueno.direccion
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      if (editandoId) {
        await actualizarDuenoExistente(editandoId, { nombreCompleto: form.nombreCompleto, telefono: form.telefono, direccion: form.direccion });
        Toast.fire({ icon: 'success', title: 'Ficha actualizada' });
      } else {
        await crearNuevoDueno(form);
        Toast.fire({ icon: 'success', title: 'Cliente registrado' });
      }
      setModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
      const msg = typeof error.response?.data === 'string' ? error.response.data : "Hubo un problema en el servidor";
      Toast.fire({ icon: 'error', title: msg });
    } finally {
      setProcesando(false);
    }
  };

  const duenosFiltrados = duenos.filter(d => d.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) || d.correo?.toLowerCase().includes(busqueda.toLowerCase()) || d.telefono?.includes(busqueda));

  if (loading && duenos.length === 0) return <div className="text-center p-8 font-semibold text-sky-600 animate-pulse">Sincronizando clientes...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Directorio de Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">Administración de fichas y cuentas de acceso de la clientela.</p>
        </div>
        <button onClick={abrirCrearModal} className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
          <UserPlus size={18} /> Registrar Cliente
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input type="text" placeholder="Buscar por nombre, correo o teléfono..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Cliente y Correo</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto</th><th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Dirección Física</th><th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {duenosFiltrados.map((dueno) => (
                <tr key={dueno.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4"><div className="font-bold text-slate-800 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={16}/></div>{dueno.nombreCompleto}</div><div className="text-xs text-sky-600 font-semibold mt-1 flex items-center gap-1"><Mail size={12}/> {dueno.correo || "Sin correo"}</div></td>
                  <td className="px-6 py-4 font-medium text-slate-600 flex items-center gap-1.5"><Phone size={14}/> {dueno.telefono}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate"><div className="flex items-center gap-1.5"><MapPin size={14}/> {dueno.direccion}</div></td>
                  <td className="px-6 py-4 text-center"><button onClick={() => abrirEditarModal(dueno)} className="bg-white hover:bg-sky-50 text-sky-600 p-2 rounded-lg transition-all border border-slate-200 hover:border-sky-200 shadow-sm" title="Editar Perfil"><Edit2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0"><h3 className="text-lg font-black text-slate-800">{editandoId ? "Actualizar Expediente" : "Registro de Cliente Nuevo"}</h3><button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b pb-1">Datos Personales y de Contacto</h4>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre Completo</label><input type="text" name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Teléfono / Celular</label><input type="text" name="telefono" value={form.telefono} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Dirección Física</label><input type="text" name="direccion" value={form.direccion} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none" /></div>
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b pb-1 pt-3">Cuenta de Acceso</h4>
              {editandoId ? (
                <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2"><Lock size={16} className="text-slate-400" /><p className="text-xs font-medium text-slate-500">Las credenciales del cliente no pueden ser modificadas aquí.</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Correo</label><input type="email" name="correo" value={form.correo} onChange={handleChange} required className="w-full border border-slate-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Contraseña</label><input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required minLength="6" className="w-full border border-slate-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none" /></div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0"><button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancelar</button><button type="submit" disabled={procesando} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold rounded-xl shadow-lg">{procesando ? "Guardando..." : "Guardar Ficha"}</button></div>
            </form>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default DuenosPage;
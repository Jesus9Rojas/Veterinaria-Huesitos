import { useState } from "react";
import { createPortal } from "react-dom"; 
import ServicioForm from "../../../components/ServicioForm";
import ServicioTable from "../../../components/ServicioTable";
import { crearServicio, cambiarEstadoServicio, actualizarServicio } from "../../../services/servicioService";
import { useServicios } from "../../../hooks/useServicios";
import { X, Stethoscope, Tag, Clock, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true
});

const ServiciosPage = () => {
  const { servicios, loading, obtenerServicios } = useServicios();
  const [modalOpen, setModalOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombre: "", precio: "", descripcion: "", duracionMinutos: "" });

  const guardar = async (data) => {
    try {
      await crearServicio(data);
      obtenerServicios();
      Toast.fire({ icon: 'success', title: 'Servicio creado con éxito' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al crear el servicio' });
    }
  };

  const cambiarEstado = async (id, activo) => {
    const estadoTxt = activo ? "habilitar" : "suspender";
    const result = await Swal.fire({
      title: `¿Deseas ${estadoTxt} este servicio?`,
      icon: activo ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: activo ? '#10b981' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Sí, ${estadoTxt}`
    });

    if (!result.isConfirmed) return;

    try {
      await cambiarEstadoServicio(id, activo);
      obtenerServicios();
      Toast.fire({ icon: 'success', title: `Servicio ${activo ? 'habilitado' : 'suspendido'}` });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al cambiar el estado' });
    }
  };

  const abrirEditarModal = (servicio) => {
    setServicioAEditar(servicio);
    setFormEdit({
      nombre: servicio.nombre,
      precio: servicio.precio,
      descripcion: servicio.descripcion,
      duracionMinutos: servicio.duracionMinutos
    });
    setModalOpen(true);
  };

  const handleEditChange = (e) => setFormEdit({ ...formEdit, [e.target.name]: e.target.value });

  const ejecutarEdicion = async (e) => {
    e.preventDefault();
    try {
      const datosFormateados = {
        ...formEdit,
        precio: parseFloat(formEdit.precio),
        duracionMinutos: parseInt(formEdit.duracionMinutos)
      };
      await actualizarServicio(servicioAEditar.id, datosFormateados);
      setModalOpen(false);
      obtenerServicios();
      Toast.fire({ icon: 'success', title: 'Servicio actualizado con éxito' });
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al actualizar el servicio' });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-sky-600 font-bold animate-pulse">Cargando catálogo de servicios...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Catálogo</h1>
        <p className="text-slate-500 text-sm mt-1">Administra la oferta médica y los servicios disponibles en la clínica.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ServicioForm onGuardar={guardar} />
        <ServicioTable servicios={servicios} onEstado={cambiarEstado} onEditar={abrirEditarModal} />
      </div>

      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Stethoscope className="text-sky-500" size={20} /> Editar Servicio</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-xl"><X size={20}/></button>
            </div>
            
            <form onSubmit={ejecutarEdicion} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre del Servicio</label>
                <input type="text" name="nombre" value={formEdit.nombre} onChange={handleEditChange} required className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Precio (S/.)</label>
                  <div className="relative"><Tag className="absolute left-3 top-3 text-slate-400" size={18} /><input type="number" step="0.01" name="precio" value={formEdit.precio} onChange={handleEditChange} required className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Duración (Min)</label>
                  <div className="relative"><Clock className="absolute left-3 top-3 text-slate-400" size={18} /><input type="number" name="duracionMinutos" value={formEdit.duracionMinutos} onChange={handleEditChange} required className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Descripción</label>
                <div className="relative"><FileText className="absolute left-3 top-3 text-slate-400" size={18} /><textarea name="descripcion" value={formEdit.descripcion} onChange={handleEditChange} required rows="3" className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white resize-none" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default ServiciosPage;
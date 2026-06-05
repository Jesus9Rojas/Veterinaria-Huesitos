import { useState } from "react";
import ServicioForm from "../components/ServicioForm";
import ServicioTable from "../components/ServicioTable";
import { crearServicio, cambiarEstadoServicio, actualizarServicio } from "../services/servicioService";
import { useServicios } from "../hooks/useServicios";
import { X, Stethoscope, Tag, Clock, FileText } from 'lucide-react';

const ServiciosPage = () => {
  const { servicios, loading, obtenerServicios } = useServicios();
  const [modalOpen, setModalOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombre: "", precio: "", descripcion: "", duracionMinutos: "" });

  const guardar = async (data) => {
    try {
      await crearServicio(data);
      obtenerServicios();
      alert("Servicio creado con éxito");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear el servicio");
    }
  };

  const cambiarEstado = async (id, activo) => {
    try {
      await cambiarEstadoServicio(id, activo);
      obtenerServicios();
    } catch (error) {
      console.error(error);
      alert("Error al cambiar el estado");
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

  const handleEditChange = (e) => {
    setFormEdit({
      ...formEdit,
      [e.target.name]: e.target.value
    });
  };

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
      alert("Servicio actualizado con éxito");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el servicio");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-sky-600 font-bold animate-pulse">Cargando catálogo de servicios...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Catálogo</h1>
        <p className="text-slate-500 text-sm mt-1">Administra la oferta médica y los servicios disponibles en la clínica.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ServicioForm onGuardar={guardar} />
        <ServicioTable 
          servicios={servicios} 
          onEstado={cambiarEstado} 
          onEditar={abrirEditarModal} 
        />
      </div>

      {/* MODAL DE EDICIÓN PREMIUM */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Stethoscope className="text-sky-500" size={20} /> Editar Servicio
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={ejecutarEdicion} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre del Servicio</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={formEdit.nombre} 
                  onChange={handleEditChange} 
                  required 
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Precio (S/.)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="number" step="0.01" name="precio" value={formEdit.precio} onChange={handleEditChange} required 
                      className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Duración (Min)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="number" name="duracionMinutos" value={formEdit.duracionMinutos} onChange={handleEditChange} required 
                      className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Descripción</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    name="descripcion" value={formEdit.descripcion} onChange={handleEditChange} required rows="3"
                    className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosPage;
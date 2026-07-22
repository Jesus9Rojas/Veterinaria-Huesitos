import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { obtenerListaUsuarios, modificarRolUsuario, modificarEstadoUsuario, obtenerDetallesDueno, obtenerDetallesPersonal, actualizarPersonal, registrarNuevoPersonal } from "../../../services/usuarioService";
import { UserPlus, ShieldAlert, ShieldCheck, Edit, Mail, Lock, UserCircle, X, Info, Phone, CreditCard, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [datosDueno, setDatosDueno] = useState(null);
  const [loadingDueno, setLoadingDueno] = useState(false);
  const [editForm, setEditForm] = useState({ correo: "", contrasena: "", nombreCompleto: "", dni: "", telefono: "" });
  const [procesandoForm, setProcesandoForm] = useState(false);

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [crearForm, setCrearForm] = useState({ nombreCompleto: "", dni: "", telefono: "", correo: "", contrasena: "", rol: "RECEPCIONISTA" });
  const [procesandoCreacion, setProcesandoCreacion] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        const data = await obtenerListaUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al recuperar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [refreshTrigger]);

  const handleRolChange = async (id, nuevoRol) => {
    try {
      const peticion = modificarRolUsuario(id, nuevoRol);
      sileo.promise(peticion, {
        loading: { title: 'Actualizando rol...' },
        success: { title: '¡Listo!', description: 'Rol de usuario actualizado' },
        error: { title: 'Error', description: 'No se pudo cambiar el rol' }
      });

      await peticion;
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEstadoToggle = async (id, estadoActual) => {
    const estadoTxt = estadoActual ? "Suspender" : "Habilitar";
    const result = await Swal.fire({
      title: `¿${estadoTxt} usuario?`, icon: estadoActual ? 'warning' : 'question', showCancelButton: true,
      confirmButtonColor: estadoActual ? '#ef4444' : '#10b981', cancelButtonColor: '#94a3b8',
      confirmButtonText: `Sí, ${estadoTxt}`
    });

    if (!result.isConfirmed) return;

    try {
      const peticion = modificarEstadoUsuario(id, !estadoActual);
      sileo.promise(peticion, {
        loading: { title: 'Procesando solicitud...' },
        success: { title: 'Completado', description: `Acceso ${estadoActual ? 'suspendido' : 'habilitado'}` },
        error: { title: 'Error', description: 'No se pudo procesar el cambio de estado' }
      });

      await peticion;
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const abrirDetallesModal = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setEditForm({ correo: usuario.correo, contrasena: "", nombreCompleto: "", dni: "", telefono: "" });
    setDatosDueno(null);
    setModalOpen(true);
    setLoadingDueno(true);

    try {
      if (usuario.rol === "CLIENTE") {
        const data = await obtenerDetallesDueno(usuario.id);
        setDatosDueno(data);
      } else {
        const data = await obtenerDetallesPersonal(usuario.id);
        setEditForm(prev => ({ ...prev, nombreCompleto: data.nombreCompleto || "", dni: data.dni || "", telefono: data.telefono || "" }));
      }
    } catch (error) {
      console.error("Ficha no encontrada:", error);
    } finally {
      setLoadingDueno(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") setEditForm({ ...editForm, [name]: value.replace(/\D/g, '').slice(0, 9) });
    else if (name === "dni") setEditForm({ ...editForm, [name]: value.replace(/\D/g, '').slice(0, 8) });
    else setEditForm({ ...editForm, [name]: value });
  };

  const handleCrearFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") setCrearForm({ ...crearForm, [name]: value.replace(/\D/g, '').slice(0, 9) });
    else if (name === "dni") setCrearForm({ ...crearForm, [name]: value.replace(/\D/g, '').slice(0, 8) });
    else setCrearForm({ ...crearForm, [name]: value });
  };

  const ejecutarGuardadoCredenciales = async (e) => {
    e.preventDefault();
    if (editForm.dni && editForm.dni.length > 0 && editForm.dni.length < 8) {
      return sileo.warning({ title: 'Atención', description: 'El DNI debe tener 8 dígitos' });
    }
    setProcesandoForm(true);
    try {
      const peticion = actualizarPersonal(usuarioSeleccionado.id, editForm);
      sileo.promise(peticion, {
        loading: { title: 'Actualizando ficha...' },
        success: { title: '¡Éxito!', description: 'Ficha actualizada correctamente' },
        error: (err) => ({ 
          title: 'Error', 
          description: typeof err.response?.data === 'string' ? err.response.data : "Ocurrió un error al actualizar" 
        })
      });

      await peticion;
      setModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setProcesandoForm(false);
    }
  };

  const ejecutarCreacionPersonal = async (e) => {
    e.preventDefault();
    if (crearForm.dni && crearForm.dni.length > 0 && crearForm.dni.length < 8) {
      return sileo.warning({ title: 'Atención', description: 'El DNI debe tener 8 dígitos' });
    }
    setProcesandoCreacion(true);
    try {
      const peticion = registrarNuevoPersonal(crearForm);
      sileo.promise(peticion, {
        loading: { title: 'Registrando personal...' },
        success: { title: '¡Personal registrado!', description: 'El colaborador ahora tiene acceso al sistema' },
        error: (err) => ({ 
          title: 'Error', 
          description: typeof err.response?.data === 'string' ? err.response.data : "Ocurrió un error. Verifica el correo." 
        })
      });

      await peticion;
      setModalCrearOpen(false);
      setCrearForm({ nombreCompleto: "", dni: "", telefono: "", correo: "", contrasena: "", rol: "RECEPCIONISTA" });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setProcesandoCreacion(false);
    }
  };

  if (loading && usuarios.length === 0) return <div className="text-center p-8 font-semibold text-sky-600 animate-pulse">Sincronizando cuentas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Usuarios y Permisos</h1>
          <p className="text-slate-500 text-sm mt-1">Control centralizado de accesos de colaboradores y clientes de la clínica.</p>
        </div>
        <button onClick={() => setModalCrearOpen(true)} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 flex items-center gap-2">
          <UserPlus size={18} /> Nuevo Personal
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Colaborador / Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Rol Asignado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Estado Cuenta</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
                        {usuario.fotoPerfilUrl && usuario.fotoPerfilUrl !== "/uploads/defecto-usuario.png" ? <img src={`${import.meta.env.VITE_BACKEND_URL}${usuario.fotoPerfilUrl}`} alt="Perfil" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src='/uploads/defecto-usuario.png'; }} /> : <UserCircle size={24} strokeWidth={1.5} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{usuario.nombreVisible || "Usuario del Sistema"}</div>
                        <div className="text-xs text-sky-600 font-semibold flex items-center gap-1 mt-0.5"><Mail size={12}/> {usuario.correo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select value={usuario.rol} onChange={(e) => handleRolChange(usuario.id, e.target.value)} className="border border-slate-200 rounded-lg p-2 bg-slate-50 hover:bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-xs tracking-wide cursor-pointer transition-all">
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option><option value="VETERINARIO">VETERINARIO</option><option value="RECEPCIONISTA">RECEPCIONISTA</option><option value="AUXILIAR_VETERINARIO">AUXILIAR VETERINARIO</option><option value="CLIENTE">CLIENTE</option>
                    </select>
                  </td>
                  <td className="px-6 py-4"><span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${usuario.activo ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>{usuario.activo ? "Permitido" : "Suspendido"}</span></td>
                  <td className="px-6 py-4 flex gap-2 justify-center mt-2">
                    <button onClick={() => abrirDetallesModal(usuario)} className="bg-white hover:bg-sky-50 text-sky-600 p-2 rounded-lg border border-slate-200 hover:border-sky-200 shadow-sm" title="Ver / Editar Perfil"><Edit size={16} /></button>
                    <button onClick={() => handleEstadoToggle(usuario.id, usuario.activo)} className={`p-2 rounded-lg border shadow-sm ${usuario.activo ? "bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border-slate-200 hover:border-red-200" : "bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 border-slate-200 hover:border-emerald-200"}`} title={usuario.activo ? "Suspender Acceso" : "Habilitar Acceso"}>
                      {usuario.activo ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalCrearOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><UserPlus className="text-sky-500" size={20} /> Alta de Nuevo Personal</h3><button onClick={() => setModalCrearOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg"><X size={20}/></button></div>
            <form onSubmit={ejecutarCreacionPersonal} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-slate-500 flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100"><Info className="text-sky-500 shrink-0 mt-0.5" size={16} /> Registra los datos personales del empleado y asígnale una cuenta.</p>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b pb-1 pt-2">Datos del Empleado</h4>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre Completo</label><div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" name="nombreCompleto" value={crearForm.nombreCompleto} onChange={handleCrearFormChange} required placeholder="Ej: Dr. Mario Rossi" className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Teléfono</label><div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" name="telefono" value={crearForm.telefono} onChange={handleCrearFormChange} placeholder="Opcional" maxLength={9} className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">DNI</label><div className="relative"><CreditCard className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" name="dni" value={crearForm.dni} onChange={handleCrearFormChange} placeholder="Opcional" maxLength={8} minLength={8} className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div></div>
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b pb-1 pt-3">Cuenta de Acceso</h4>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Correo (Login)</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={18} /><input type="email" name="correo" value={crearForm.correo} onChange={handleCrearFormChange} required placeholder="ejemplo@huesitos.com" className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Contraseña Inicial</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400" size={18} /><input type="password" name="contrasena" value={crearForm.contrasena} onChange={handleCrearFormChange} required placeholder="Mínimo 6 chars" minLength="6" className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 focus:bg-white" /></div></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Asignar Rol</label><select name="rol" value={crearForm.rol} onChange={handleCrearFormChange} className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 font-bold bg-slate-50 cursor-pointer"><option value="RECEPCIONISTA">RECEPCIONISTA</option><option value="VETERINARIO">VETERINARIO</option><option value="ADMINISTRADOR">ADMINISTRADOR</option><option value="AUXILIAR_VETERINARIO">AUXILIAR VETERINARIO</option></select></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setModalCrearOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                <button type="submit" disabled={procesandoCreacion} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold rounded-xl shadow-lg">{procesandoCreacion ? "Guardando..." : "Guardar Personal"}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {modalOpen && usuarioSeleccionado && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black text-slate-800">Ficha Técnica del Usuario</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg"><X size={20}/></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden text-slate-400">
                  {usuarioSeleccionado.fotoPerfilUrl && usuarioSeleccionado.fotoPerfilUrl !== "/uploads/defecto-usuario.png" ? <img src={`${import.meta.env.VITE_BACKEND_URL}${usuarioSeleccionado.fotoPerfilUrl}`} alt="Perfil" className="w-full h-full object-cover" /> : <UserCircle size={40} strokeWidth={1.5} />}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-bold text-slate-800 text-lg tracking-tight">{usuarioSeleccionado.nombreVisible || "Usuario del Sistema"}</p>
                  <p className="text-sm font-bold text-slate-500">Rol: <span className="text-sky-600 font-black tracking-wide">{usuarioSeleccionado.rol}</span></p>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Mail size={12} /> {usuarioSeleccionado.correo}</p>
                </div>
              </div>

              {usuarioSeleccionado.rol === "CLIENTE" && (
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="font-black text-slate-800 text-sm tracking-widest uppercase">Información de Dueño Asociada</h4>
                  {loadingDueno ? <p className="text-xs text-sky-600 animate-pulse font-medium">Cargando datos...</p> : datosDueno ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50 text-sm">
                      <div><span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre</span><p className="font-bold text-slate-800">{datosDueno.nombreCompleto}</p></div>
                      <div><span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono</span><p className="font-bold text-slate-800">{datosDueno.telefono}</p></div>
                      <div className="sm:col-span-2"><span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección</span><p className="font-bold text-slate-800">{datosDueno.direccion}</p></div>
                    </div>
                  ) : <div className="text-xs text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">Este cliente no ha completado el registro de contacto físico.</div>}
                </div>
              )}

              {usuarioSeleccionado.rol !== "CLIENTE" && (
                <form onSubmit={ejecutarGuardadoCredenciales} className="border-t border-slate-100 pt-5 space-y-5">
                  <div><h4 className="font-black text-slate-800 text-sm tracking-widest uppercase">Modificación de Ficha y Accesos</h4><p className="text-xs text-slate-400 mt-1">Actualiza la ficha del colaborador y sus credenciales de ingreso.</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre Completo</label><div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" name="nombreCompleto" value={editForm.nombreCompleto} onChange={handleFormChange} required className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl bg-slate-50" /></div></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Teléfono (Máx 9)</label><div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" name="telefono" value={editForm.telefono} onChange={handleFormChange} maxLength={9} className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl bg-slate-50" /></div></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">DNI (8 Dígitos)</label><div className="relative"><CreditCard className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" name="dni" value={editForm.dni} onChange={handleFormChange} maxLength={8} minLength={8} className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl bg-slate-50" /></div></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Correo</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={18} /><input type="email" name="correo" value={editForm.correo} onChange={handleFormChange} required className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl bg-slate-50" /></div></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cambiar Contraseña</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400" size={18} /><input type="password" name="contrasena" value={editForm.contrasena} onChange={handleFormChange} placeholder="Dejar en blanco para conservar" className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl bg-slate-50" /></div></div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0"><button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancelar</button><button type="submit" disabled={procesandoForm} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white text-sm font-bold rounded-xl">{procesandoForm ? "Guardando..." : "Guardar Cambios"}</button></div>
                </form>
              )}
            </div>
            {usuarioSeleccionado.rol === "CLIENTE" && <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0"><button onClick={() => setModalOpen(false)} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md">Cerrar Vista</button></div>}
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default UsuariosPage;
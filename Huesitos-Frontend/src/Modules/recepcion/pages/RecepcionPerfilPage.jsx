import { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Phone, CreditCard, Camera, Save, Activity } from 'lucide-react';
import axios from 'axios';
import { obtenerDetallesPersonal, actualizarPersonal } from "../../../services/usuarioService";

const RecepcionPerfilPage = () => {
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileInputRef = useRef(null);

  const usuarioId = localStorage.getItem("usuarioId");
  const usuarioRol = localStorage.getItem("usuarioRol");
  const correoActual = localStorage.getItem("usuarioCorreo");
  
  const [fotoUrl, setFotoUrl] = useState(localStorage.getItem("usuarioFoto") || "/uploads/defecto-usuario.png");

  const [form, setForm] = useState({
    nombreCompleto: "",
    dni: "",
    telefono: "",
    correo: correoActual,
    contrasena: ""
  });

  useEffect(() => {
    const fetchDatosPerfil = async () => {
      try {
        const data = await obtenerDetallesPersonal(usuarioId);
        setForm({
          ...form,
          nombreCompleto: data.nombreCompleto || "",
          dni: data.dni || "",
          telefono: data.telefono || ""
        });
      } catch (error) {
        console.error("Error al cargar los datos del perfil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatosPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") {
      setForm({ ...form, [name]: value.replace(/\D/g, '').slice(0, 9) });
    } else if (name === "dni") {
      setForm({ ...form, [name]: value.replace(/\D/g, '').slice(0, 8) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    setSubiendoFoto(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`http://localhost:8080/api/perfiles/usuario/${usuarioId}/foto`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const nuevaFotoUrl = response.data.fotoPerfilUrl;
      setFotoUrl(nuevaFotoUrl);
      localStorage.setItem("usuarioFoto", nuevaFotoUrl);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Error al subir la imagen. Verifica que sea un formato válido (JPG, PNG).");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      await actualizarPersonal(usuarioId, form);
      localStorage.setItem("usuarioNombre", form.nombreCompleto);
      localStorage.setItem("usuarioCorreo", form.correo);
      alert("Tu perfil ha sido actualizado exitosamente.");
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Ocurrió un error al intentar actualizar el perfil.");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-sky-500 font-semibold animate-pulse gap-3">
        <Activity className="animate-spin" size={36} />
        <p>Cargando información de tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 relative">
            <img 
              src={`http://localhost:8080${fotoUrl}`} 
              alt="Mi Perfil" 
              className={`w-full h-full object-cover transition-opacity duration-300 ${subiendoFoto ? 'opacity-50' : 'group-hover:opacity-70'}`}
              onError={(e) => { e.target.onerror = null; e.target.src='/uploads/defecto-usuario.png'; }}
            />
            {subiendoFoto && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="text-sky-600 animate-spin" size={28} />
              </div>
            )}
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={subiendoFoto}
            className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-tr from-sky-500 to-cyan-400 text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform disabled:opacity-50"
            title="Cambiar foto de perfil"
          >
            <Camera size={16} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{form.nombreCompleto || "Tu Nombre"}</h1>
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mt-1">{usuarioRol}</p>
          <p className="text-slate-500 text-sm mt-1">Gestiona tu información personal y credenciales de acceso al área de Recepción.</p>
        </div>
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 space-y-6">
        
        <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase border-b border-slate-100 pb-2">Datos Personales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text" name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required
                className="w-full pl-10 border border-slate-300 p-3 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Teléfono / Celular</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text" name="telefono" value={form.telefono} onChange={handleChange}
                className="w-full pl-10 border border-slate-300 p-3 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">DNI / Documento</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text" name="dni" value={form.dni} onChange={handleChange}
                className="w-full pl-10 border border-slate-300 p-3 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase border-b border-slate-100 pb-2 pt-4">Credenciales de Acceso</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Correo Electrónico (Login)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email" name="correo" value={form.correo} onChange={handleChange} required
                className="w-full pl-10 border border-slate-300 p-3 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password" name="contrasena" value={form.contrasena} onChange={handleChange} placeholder="Dejar en blanco para conservar actual"
                className="w-full pl-10 border border-slate-300 p-3 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={procesando} 
            className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {procesando ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
            {procesando ? "Guardando Cambios..." : "Guardar Perfil"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecepcionPerfilPage;
import { useState, useEffect, useRef } from 'react';
import { User, Lock, Camera, Save, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { obtenerPerfilUsuario, cambiarContrasena, subirFotoPerfil } from '../../../services/perfilService';

const MiPerfilPage = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado del formulario de contraseñas
  const [formPass, setFormPass] = useState({ nueva: '', confirmar: '' });
  const [loadingPass, setLoadingPass] = useState(false);
  const [msgPass, setMsgPass] = useState({ tipo: '', texto: '' }); // tipo: 'exito' | 'error'
  
  // Estado para la foto
  const fileInputRef = useRef(null);
  const [loadingFoto, setLoadingFoto] = useState(false);

  const usuarioId = localStorage.getItem('usuarioId') || localStorage.getItem('id');
  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Doctor(a)';

  useEffect(() => {
    let isMounted = true;
    const fetchPerfil = async () => {
      try {
        if (usuarioId) {
          const data = await obtenerPerfilUsuario(usuarioId);
          if (isMounted) {
            setPerfil(data);
            // Actualizamos la foto en localStorage por si la usas en la barra de navegación lateral
            localStorage.setItem('usuarioFoto', data.fotoPerfilUrl);
          }
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPerfil();
    return () => { isMounted = false; };
  }, [usuarioId]);

  // --- MANEJADOR DE CAMBIO DE FOTO ---
  const handleCambiarFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingFoto(true);
      const res = await subirFotoPerfil(usuarioId, file);

      const nuevaUrlConTimestamp = `${res.fotoPerfilUrl}?t=${new Date().getTime()}`;

      setPerfil(prev => ({ ...prev, fotoPerfilUrl: nuevaUrlConTimestamp }));
      
      localStorage.setItem('usuarioFoto', nuevaUrlConTimestamp);
      
      // Pequeño feedback visual
      alert("¡Foto de perfil actualizada con éxito!");
      
    } catch (error) {
      console.error("Error al subir foto:", error);
      alert("No se pudo actualizar la foto de perfil. Verifique el servidor.");
    } finally {
      setLoadingFoto(false);
    }
  };

  // --- MANEJADOR DE CAMBIO DE CONTRASEÑA ---
  const handleActualizarContrasena = async (e) => {
    e.preventDefault();
    setMsgPass({ tipo: '', texto: '' });

    if (formPass.nueva.length < 6) {
      setMsgPass({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (formPass.nueva !== formPass.confirmar) {
      setMsgPass({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
      setLoadingPass(true);
      await cambiarContrasena(usuarioId, formPass.nueva);
      setMsgPass({ tipo: 'exito', texto: '¡Su contraseña ha sido actualizada con éxito!' });
      setFormPass({ nueva: '', confirmar: '' }); // Limpiar campos
    } catch (error) {
      console.error("Error de seguridad:", error);
      setMsgPass({ tipo: 'error', texto: error.response?.data || 'Hubo un problema al actualizar la contraseña.' });
    } finally {
      setLoadingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-indigo-500 font-semibold animate-pulse gap-3">
        <Activity className="animate-spin" size={36} />
        <p>Cargando información del perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <User className="text-indigo-500" size={32} /> Mi Perfil
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-lg">
            Gestione su identidad visual dentro del sistema y mantenga actualizadas sus credenciales de seguridad.
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: 2 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: TARJETA DE IDENTIDAD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Decoración de fondo de la tarjeta */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-sky-400"></div>

            {/* FOTO DE PERFIL */}
            <div className="relative z-10 mt-10 mb-5 group">
              <div className="w-36 h-36 rounded-full bg-white p-1.5 shadow-xl mx-auto relative">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {perfil?.fotoPerfilUrl ? (
                    <img 
                      src={`http://localhost:8080${perfil.fotoPerfilUrl}`} 
                      alt="" 
                      className={`w-full h-full object-cover ${loadingFoto ? 'opacity-50 blur-sm' : ''}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = "/uploads/defecto-usuario.png"; }}
                    />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                </div>
                
                {/* Botón flotante para subir foto */}
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={loadingFoto}
                  className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                  title="Cambiar Foto"
                >
                  {loadingFoto ? <Activity size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleCambiarFoto} 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* DATOS DEL USUARIO */}
            <div className="space-y-1 relative z-10 w-full">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{usuarioNombre}</h2>
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{perfil?.rol}</p>
              
              <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico Registrado</p>
                <p className="text-sm font-semibold text-slate-700">{perfil?.correo || 'No disponible'}</p>
              </div>
            </div>

          </div>
        </div>

        {/* COLUMNA DERECHA: TARJETA DE SEGURIDAD */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 h-full">
            
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Seguridad de la Cuenta</h2>
                <p className="text-sm font-medium text-slate-500">Actualice su contraseña de acceso al sistema.</p>
              </div>
            </div>

            {/* ALERTAS DE ESTADO */}
            {msgPass.texto && (
              <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${msgPass.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                {msgPass.tipo === 'exito' ? <CheckCircle2 className="shrink-0 mt-0.5" size={20}/> : <AlertCircle className="shrink-0 mt-0.5" size={20}/>}
                <p className="text-sm font-bold">{msgPass.texto}</p>
              </div>
            )}

            <form onSubmit={handleActualizarContrasena} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  required
                  placeholder="Escriba su nueva contraseña"
                  value={formPass.nueva}
                  onChange={(e) => setFormPass({...formPass, nueva: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  required
                  placeholder="Repita la nueva contraseña"
                  value={formPass.confirmar}
                  onChange={(e) => setFormPass({...formPass, confirmar: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={loadingPass}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {loadingPass ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                  {loadingPass ? 'ACTUALIZANDO...' : 'GUARDAR NUEVA CONTRASEÑA'}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MiPerfilPage;
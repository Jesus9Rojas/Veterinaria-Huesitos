import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { sileo } from 'sileo';
import logo from '../assets/Logo Huesitos.png';

const BG_IMAGE_URL = null; 

const RegistroClientePage = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    direccion: '', 
    telefono: '',
    correo: '',
    password: ''
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'telefono') {
      value = value.replace(/\D/g, ''); 
    }

    setForm({ ...form, [name]: value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (form.telefono.length !== 9) {
      return sileo.warning({ title: 'Atención', description: 'El teléfono celular debe tener exactamente 9 dígitos.' });
    }

    setCargando(true);

    try {
      const payload = {
        nombreCompleto: `${form.nombre} ${form.apellidos}`,
        telefono: form.telefono,
        direccion: form.direccion, 
        usuario: {
          correo: form.correo,
          contrasena: form.password,
          rol: 'CLIENTE',
          activo: true,
          fotoPerfilUrl: '/uploads/defecto-usuario.png'
        }
      };

      const peticion = axios.post('http://localhost:8080/api/autenticacion/registro', payload);

      sileo.promise(peticion, {
        loading: { title: 'Creando cuenta...' },
        success: { title: '¡Perfecto!' },
        error: (err) => ({
          title: 'Error de Registro',
          description: err.response?.data?.message || 'El correo o teléfono ya están registrados.'
        })
      });

      await peticion;
      
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        text: 'Bienvenido a Vet.Huesitos. Ya puedes iniciar sesión para agendar tu primera cita.',
        confirmButtonText: 'Ir a Iniciar Sesión',
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-slate-100',
          title: 'text-2xl font-black text-slate-800',
          htmlContainer: 'text-slate-600 font-medium',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 mt-4 w-full transition-colors shadow-md'
        }
      }).then(() => navigate('/login'));

    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const colors = {
    blue900: '#042C53', blue800: '#0C447C', blue600: '#185FA5', blue400: '#378ADD',
    blue200: '#85B7EB', blue100: '#B5D4F4', blue50:  '#E6F1FB'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '840px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 32px rgba(0,0,0,0.10)', position: 'relative' }}>

        {/* PANEL IZQUIERDO */}
        <div style={{
          width: '52%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: "space-between", overflow: 'hidden', minHeight: '580px',
          ...(BG_IMAGE_URL ? { backgroundImage: `url(${BG_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(135deg, ${colors.blue600} 0%, ${colors.blue900} 100%)` }),
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, rgba(4,44,83,0.55) 0%, rgba(4,44,83,0.82) 50%, rgba(4,44,83,0.97) 100%)`, zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 2rem 0' }}>
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-400/30">
             <img src={logo} alt="Logo de la clínica" />
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, padding: '0 2rem 2.5rem', marginBottom: '8rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(55,138,221,0.18)', border: '1px solid rgba(133,183,235,0.3)', borderRadius: '999px', padding: '5px 14px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '14px' }}>🛡️</span>
              <span style={{ fontSize: '11px', color: colors.blue200, fontWeight: 500, letterSpacing: '0.04em' }}>Tu familia es nuestra prioridad</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '10px' }}>
              Únete a la <span style={{ color: colors.blue200 }}>Familia Huesitos</span>
            </h2>
            <p style={{ fontSize: '13px', color: colors.blue100, lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '280px' }}>
              Crea tu cuenta gratuita para agendar citas en línea y llevar un control perfecto de la salud de tus engreídos.
            </p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{ width: '48%', background: '#fff', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          
          <button onClick={() => navigate('/login')} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ← Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-400/30">
             <img src={logo} alt="Logo de la clínica" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Huesitos</div>
              <div style={{ fontSize: '11px', color: colors.blue600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clínica Veterinaria</div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Crear mi cuenta</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Por favor, completa tus datos personales</p>
          </div>

          <form onSubmit={handleRegistro}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Nombres</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
                  style={{ width: '100%', padding: '0 10px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Apellidos</label>
                <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required
                  style={{ width: '100%', padding: '0 10px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Teléfono</label>
                <input type="text" name="telefono" maxLength="9" value={form.telefono} onChange={handleChange} required placeholder="987654321"
                  style={{ width: '100%', padding: '0 10px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Dirección</label>
                <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Calle Ej. 123"
                  style={{ width: '100%', padding: '0 10px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Correo electrónico</label>
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="ejemplo@correo.com"
                style={{ width: '100%', padding: '0 10px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••"
                style={{ width: '100%', padding: '0 10px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={cargando} style={{ width: '100%', height: '44px', background: colors.blue600, color: colors.blue50, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
               {cargando ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1rem 0' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            ¿Ya tienes una cuenta? <Link to="/login" style={{ color: colors.blue600, textDecoration: 'none', fontWeight: 600 }}>Inicia sesión</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegistroClientePage;
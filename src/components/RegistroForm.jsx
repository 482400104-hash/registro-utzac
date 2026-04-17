import { useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  User,
  Mail,
  Phone,
  BookOpen,
  School,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'

// ─── constants ──────────────────────────────────────────────────────────────

const CARRERAS = {
  Ingenierías: [
    'TIC - Tecnologías de la Información',
    'Ingeniería en Mecatrónica',
    'Ingeniería en Mantenimiento Industrial',
    'Ingeniería en Procesos Industriales',
    'Ingeniería en Minería',
    'Gestión del Capital Humano',
  ],
  TSU: [
    'TSU Terapia Física',
    'TSU Agricultura Sustentable',
    'TSU Energías Renovables',
    'TSU Desarrollo de Negocios',
  ],
}

const BACHILLERATOS = [
  'COBAEZ (Colegio de Bachilleres del Estado de Zacatecas)',
  'Preparatorias de la UAZ (Universidad Autónoma de Zacatecas)',
  'CECyTEZ (Colegio de Estudios Científicos y Tecnológicos)',
  'Bachillerato General Militarizado',
  'CECyT 18 (Zacatecas) del IPN',
  'Otra',
]

const INITIAL_FORM = {
  nombre: '',
  correo: '',
  telefono: '',
  carrera: '',
  bachillerato: '',
}

// ─── reusable field wrapper ──────────────────────────────────────────────────

function FieldWrapper({ icon: Icon, label, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        <Icon size={14} className="text-green-600" />
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-pulse">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export default function RegistroForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  // ── validation ────────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido.'
    if (!form.correo.trim()) {
      e.correo = 'El correo es requerido.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = 'Ingresa un correo válido.'
    }
    if (!form.telefono.trim()) {
      e.telefono = 'El teléfono es requerido.'
    } else if (!/^\d{10}$/.test(form.telefono.trim())) {
      e.telefono = 'Debe contener exactamente 10 dígitos.'
    }
    if (!form.carrera) e.carrera = 'Selecciona una carrera.'
    if (!form.bachillerato) e.bachillerato = 'Selecciona tu bachillerato.'
    return e
  }

  // ── handlers ──────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('registros_alumnos').insert([
        {
          nombre_completo: form.nombre.trim(),
          correo_electronico: form.correo.trim().toLowerCase(),
          telefono: form.telefono.trim(),
          carrera_interes: form.carrera,
          escuela_procedencia: form.bachillerato,
          fecha_registro: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setSuccess(true)
      setForm(INITIAL_FORM)
    } catch (err) {
      console.error(err)
      setServerError(
        err?.message?.includes('duplicate')
          ? 'Este correo ya fue registrado anteriormente.'
          : 'Ocurrió un error al enviar tu solicitud. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5 animate-[fadeIn_0.5s_ease]">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">¡Registro Exitoso!</h2>
          <p className="text-gray-500 leading-relaxed">
            Tu solicitud ha sido enviada. Un asesor de la <strong className="text-green-700">UTZAC</strong> se
            pondrá en contacto contigo en <strong>menos de 24 horas</strong>.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-2 w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold transition-all duration-200 cursor-pointer"
          >
            Nuevo Registro
          </button>
        </div>
      </div>
    )
  }

  // ── main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex flex-col">

      {/* ── Header ── */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo badge */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-md flex-shrink-0">
            <span className="text-white font-extrabold text-xs leading-tight text-center select-none">
              UTZ<br />AC
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-widest leading-none">
              Universidad Tecnológica
            </p>
            <h1 className="text-base md:text-lg font-bold text-gray-800 leading-tight">
              del Estado de Zacatecas
            </h1>
          </div>
          <div className="ml-auto hidden sm:block">
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
              Admisiones 2025
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero text ── */}
      <div className="max-w-xl mx-auto w-full px-4 pt-10 pb-2 text-center">
        <span className="inline-block mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Proceso de Admisión
        </span>
        <p className="text-gray-500 text-sm md:text-base font-medium">
          Completa el formulario y un asesor te guiará en cada paso.
        </p>
      </div>

      {/* ── Card ── */}
      <main className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">

          {/* Card header stripe */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Registro
            </h2>
            <p className="text-green-100 text-sm mt-1 leading-relaxed">
              Un asesor te contactará en menos de 24 horas para guiarte en el proceso.
            </p>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8 flex flex-col gap-5">

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-[fadeIn_0.3s_ease]">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Nombre */}
            <FieldWrapper icon={User} label="Nombre Completo" error={errors.nombre}>
              <div className="relative">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Ana García López"
                  required
                  autoComplete="name"
                  className={`w-full pl-4 pr-4 py-3 rounded-xl border text-gray-800 placeholder-gray-400 text-sm font-medium outline-none transition-all duration-200
                    focus:ring-2 focus:ring-green-400 focus:border-green-400
                    ${errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-green-300'}`}
                />
              </div>
            </FieldWrapper>

            {/* Correo */}
            <FieldWrapper icon={Mail} label="Correo Electrónico" error={errors.correo}>
              <input
                id="correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                className={`w-full pl-4 pr-4 py-3 rounded-xl border text-gray-800 placeholder-gray-400 text-sm font-medium outline-none transition-all duration-200
                  focus:ring-2 focus:ring-green-400 focus:border-green-400
                  ${errors.correo ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-green-300'}`}
              />
            </FieldWrapper>

            {/* Teléfono */}
            <FieldWrapper icon={Phone} label="Teléfono / WhatsApp" error={errors.telefono}>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={handleChange}
                placeholder="10 dígitos"
                maxLength={10}
                required
                autoComplete="tel"
                className={`w-full pl-4 pr-4 py-3 rounded-xl border text-gray-800 placeholder-gray-400 text-sm font-medium outline-none transition-all duration-200
                  focus:ring-2 focus:ring-green-400 focus:border-green-400
                  ${errors.telefono ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-green-300'}`}
              />
            </FieldWrapper>

            {/* Carrera */}
            <FieldWrapper icon={BookOpen} label="Carrera de Interés" error={errors.carrera}>
              <div className="relative">
                <select
                  id="carrera"
                  name="carrera"
                  value={form.carrera}
                  onChange={handleChange}
                  required
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-medium outline-none appearance-none transition-all duration-200 cursor-pointer
                    focus:ring-2 focus:ring-green-400 focus:border-green-400
                    ${form.carrera ? 'text-gray-800' : 'text-gray-400'}
                    ${errors.carrera ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-green-300'}`}
                >
                  <option value="" disabled>Selecciona una carrera...</option>
                  {Object.entries(CARRERAS).map(([grupo, carreras]) => (
                    <optgroup key={grupo} label={`── ${grupo} ──`}>
                      {carreras.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </FieldWrapper>

            {/* Bachillerato */}
            <FieldWrapper icon={School} label="Escuela de Procedencia (Bachillerato)" error={errors.bachillerato}>
              <div className="relative">
                <select
                  id="bachillerato"
                  name="bachillerato"
                  value={form.bachillerato}
                  onChange={handleChange}
                  required
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-medium outline-none appearance-none transition-all duration-200 cursor-pointer
                    focus:ring-2 focus:ring-green-400 focus:border-green-400
                    ${form.bachillerato ? 'text-gray-800' : 'text-gray-400'}
                    ${errors.bachillerato ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-green-300'}`}
                >
                  <option value="" disabled>Selecciona tu bachillerato...</option>
                  {BACHILLERATOS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </FieldWrapper>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Submit */}
            <button
              id="btn-enviar"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base tracking-wide
                bg-gradient-to-r from-green-600 to-emerald-600
                hover:from-green-700 hover:to-emerald-700
                active:scale-[0.98]
                disabled:opacity-70 disabled:cursor-not-allowed
                shadow-lg shadow-green-200
                transition-all duration-200 cursor-pointer
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Solicitud de Registro'
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Al enviar, aceptas que la UTZAC te contacte por los medios proporcionados.
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} UTZAC · Universidad Tecnológica del Estado de Zacatecas
      </footer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
  LogOut,
  Radio,
  Settings2,
  CalendarDays,
  Images,
  Type,
  Palette,
  LayoutGrid,
  MessageSquare,
  Link,
  Clapperboard,
  Sparkles,
  Move,
  RotateCcw,
  Signal,
  Check,
  Edit3,
  Search,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Station, Show, Slide } from '@/lib/station'
import { dayNames, availableFonts, resolveFontFamily } from '@/lib/station'
import { effectList } from '@/lib/effects'


const tabs = [
  ['Identidad', Radio],
  ['Portada & Logo', Move],
  ['Cabecera & Estado', Signal],
  ['Secciones', LayoutGrid],
  ['Colores', Palette],
  ['Programación', CalendarDays],
  ['Carruseles', Images],
  ['Redes y contacto', Link],
  ['Efectos y funciones', Sparkles],
  ['Modo cine', Clapperboard],
  ['Tipografía', Type],
  ['Textos', MessageSquare],
] as const

const labels: Record<string, string> = {
  offlineBanner: 'Banner sin señal',
  nextShowBanner: 'Siguiente programa',
  welcomeToast: 'Bienvenida',
  offlineAlert: 'Aviso sin conexión',
  reconnectToast: 'Aviso de reconexión',
  showAlert: 'Aviso de nuevo programa',
  liveBadge: 'Insignia en vivo',
  promoBanner: 'Banner promocional',
  dailyGreeting: 'Saludo del día',
  scheduleRemind: 'Recordar favoritos',
  nowPlayingBanner: 'Programa actual',
  playerVolumeFade: 'Volumen progresivo',
  fullscreenPlayer: 'Pantalla completa',
  energyMode: 'Ahorrar energía',
  radioStatusDot: 'Indicador de señal',
  autoHideInstalled: 'Ocultar botón instalar si ya está instalada',
  autoScrollSchedule: 'Desplazar al programa actual',
  scheduleCountdown: 'Cuenta regresiva',
  favoriteShow: 'Favoritos',
  compactMode: 'Modo compacto',
  shareButton: 'Botón compartir',
  copyLinkToast: 'Aviso de enlace copiado',
  logoTapEasterEgg: 'Efecto al tocar el logo',
  socialPreview: 'Mostrar enlace de redes',
  requestBadge: 'Etiqueta de pedidos',
  infoExpandable: 'Información desplegable',
  tickerPause: 'Pausar ticker al tocar',
  nightMode: 'Modo nocturno',
  bannerAutoHide: 'Ocultar avisos automáticamente',
  toastPosition: 'Avisos en la parte inferior',
  broadcastAlert: 'Aviso de transmisión especial',
  waves: 'Ondas de audio',
  logoPulse: 'Pulso del logo',
  floatingNotes: 'Notas flotantes',
  scanlines: 'Líneas de transmisión',
  rotatingLogo: 'Logo en rotación',
  particles: 'Partículas',
  confetti: 'Confeti al reproducir',
  hoverLift: 'Elevación al pasar el cursor',
}

const sectionDisplayNames: Record<string, string> = {
  ticker: 'Cintillo superior (Ticker)',
  header: 'Barra de navegación (Header)',
  player: 'Portada y Reproductor principal (Hero)',
  carousel: 'Carrusel de fotos y novedades',
  schedule: 'Programación semanal',
  requests: 'Pedidos y saludos (WhatsApp)',
  info: 'La emisora / Sobre nosotros',
  socials: 'Redes sociales',
  install: 'Banner de descarga e instalación PWA',
  stickyPlayer: 'Reproductor flotante inferior',
  footer: 'Pie de página (Footer)',
}

const typoTargets = [
  { id: 'heroTitle', label: 'Portada — Título Principal', sample: 'Tu radio.\nTu música.\nTu gente.', defaultSize: 72, isDark: true, minSize: 24, maxSize: 110 },
  { id: 'heroText', label: 'Portada — Párrafo / Descripción', sample: 'La señal que conecta a Ciudad Bolívar con lo que te mueve. Música, entretenimiento y buena compañía, donde estés.', defaultSize: 15, isDark: true, minSize: 11, maxSize: 32 },
  { id: 'ticker', label: 'Cintillo Superior (Ticker)', sample: 'MÁS NETWORK 92.1 FM • LA RADIO DEL MEDIO PALO • DESDE CIUDAD BOLÍVAR PARA EL MUNDO', defaultSize: 12, isDark: false, minSize: 9, maxSize: 26 },
  { id: 'header', label: 'Barra Superior (Cabecera / Menú)', sample: 'Inicio · Programación · La emisora · Contacto', defaultSize: 14, isDark: false, minSize: 10, maxSize: 24 },
  { id: 'carousel', label: 'Carrusel de Novedades (Títulos)', sample: 'Más que una radio. • CONECTADOS CONTIGO', defaultSize: 28, isDark: false, minSize: 16, maxSize: 50 },
  { id: 'schedule', label: 'Programación Semanal', sample: 'Tu cita con Más. • La Pachanga Navideña • Richard Medina y Jonas Garcia', defaultSize: 26, isDark: false, minSize: 16, maxSize: 50 },
  { id: 'requests', label: 'Pedidos y Saludos (WhatsApp)', sample: '¿Qué quieres escuchar hoy? • Pide tu canción, manda un saludo', defaultSize: 28, isDark: true, minSize: 16, maxSize: 50 },
  { id: 'info', label: 'La Emisora (Sobre Nosotros)', sample: 'El sonido de Ciudad Bolívar. • De aquí. Contigo.', defaultSize: 28, isDark: false, minSize: 16, maxSize: 50 },
  { id: 'socials', label: 'Redes Sociales', sample: 'Somos Más. Síguenos. • @masnetwork921', defaultSize: 28, isDark: true, minSize: 16, maxSize: 50 },
  { id: 'stickyPlayer', label: 'Reproductor Flotante Inferior', sample: 'Más Network 92.1 FM • Transmisión en vivo', defaultSize: 15, isDark: false, minSize: 11, maxSize: 26 },
  { id: 'global', label: 'Fuente Principal de Toda la App', sample: 'Texto general de la aplicación Más Network 92.1 FM', defaultSize: 16, isDark: false, minSize: 12, maxSize: 28 },
]

export function AdminPanel({
  open,
  onClose,
  station,
  onSaved,
  onLiveChange,
}: {
  open: boolean
  onClose: () => void
  station: Station
  onSaved: (s: Station) => void
  onLiveChange?: (s: Station) => void
}) {
  const [tab, setTab] = useState('Identidad'),
    [draft, setDraft] = useState<Station>(structuredClone(station)),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState('')

  useEffect(() => {
    onLiveChange?.(draft)
  }, [draft, onLiveChange])

  // State for adding/editing shows
  const [editingShowId, setEditingShowId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<Omit<Show, 'id'>>({
    name: '',
    host: '',
    start: '08:00',
    end: '10:00',
    day: 'lv',
  })
  const [isAddingShow, setIsAddingShow] = useState(false)

  // State for adding/editing slides
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [slideForm, setSlideForm] = useState<Omit<Slide, 'id'>>({
    title: '',
    subtitle: '',
    url: '',
    type: 'image',
    link: '',
    fit: 'cover',
    position: 'center',
    zoom: 1,
  })
  const [isAddingSlide, setIsAddingSlide] = useState(false)

  // State for expanded section color customizer
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [effectFilter, setEffectFilter] = useState('')
  const [effectCategory, setEffectCategory] = useState<'Todas' | 'Visuales' | 'Interacción' | 'Notificaciones' | 'Distribución'>('Todas')
  const [fontFilter, setFontFilter] = useState('')
  const [fontCategory, setFontCategory] = useState<string>('Todas')
  const [fontPreviewText, setFontPreviewText] = useState('Más Network 92.1 FM • ¡El auténtico Medio Palo!')
  const [typoTarget, setTypoTarget] = useState<string>('heroTitle')
  const [typoBgDark, setTypoBgDark] = useState<boolean>(true)
  const [previewSlideId, setPreviewSlideId] = useState<string | null>(null)


  function set<K extends keyof Station>(key: K, value: Station[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setDirty(true)
  }

  function setSectionStyle(sectionKey: string, styleKey: string, value: string | number | boolean | undefined) {
    setDraft((d) => {
      const current = d.sectionStyles?.[sectionKey] || {}
      return {
        ...d,
        sectionStyles: {
          ...d.sectionStyles,
          [sectionKey]: {
            ...current,
            [styleKey]: value,
          },
        },
      }
    })
    setDirty(true)
  }

  function input(key: keyof Station, label: string, type = 'text') {
    return (
      <label className="field" key={key}>
        {label}
        <input
          type={type}
          value={String(draft[key] ?? '')}
          onChange={(e) =>
            set(
              key,
              (type === 'number'
                ? Number(e.target.value)
                : e.target.value) as never,
            )
          }
        />
      </label>
    )
  }

  async function upload(file: File | undefined, cb: (url: string) => void) {
    if (!file) return
    setBusy(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const r = await fetch('/api/media', { method: 'POST', body: data })
      const result = await r.json()
      if (!r.ok) throw Error(result.error)
      cb(result.url)
      toast.success('Archivo cargado correctamente.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function media(key: 'logo' | 'background', label: string) {
    return (
      <div className="asset-field">
        {input(key, label, 'url')}
        <label className="button secondary small">
          <Upload size={15} /> Subir archivo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) =>
              upload(e.target.files?.[0], (url) => set(key, url))
            }
          />
        </label>
        <img src={draft[key]} alt={label} />
      </div>
    )
  }

  function move<T>(items: T[], i: number, offset: number) {
    const copy = [...items],
      j = i + offset
    if (j < 0 || j >= items.length) return copy
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    return copy
  }

  async function save() {
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/station', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const result = await r.json().catch(() => ({
        error: 'Sesión expirada. Cierra el panel e ingresa de nuevo.',
      }))
      if (!r.ok) throw Error(result.error)
      onSaved(draft)
      setDirty(false)
      toast.success('Cambios publicados para todos los oyentes con éxito.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Program / Shows CRUD
  function handleAddShow() {
    if (!showForm.name.trim()) {
      toast.error('El nombre del programa es obligatorio')
      return
    }
    const newShowItem: Show = {
      id: String(Date.now()),
      ...showForm,
    }
    set('shows', [...draft.shows, newShowItem])
    setShowForm({ name: '', host: '', start: '08:00', end: '10:00', day: 'lv' })
    setIsAddingShow(false)
    toast.success('Programa agregado a la programación.')
  }

  function handleSaveEditShow() {
    if (!editingShowId || !showForm.name.trim()) return
    set(
      'shows',
      draft.shows.map((s) => (s.id === editingShowId ? { ...s, ...showForm } : s)),
    )
    setEditingShowId(null)
    toast.success('Programa actualizado con éxito.')
  }

  function handleDeleteShow(id: string) {
    if (confirm('¿Estás seguro de eliminar este programa?')) {
      set('shows', draft.shows.filter((s) => s.id !== id))
      toast.success('Programa eliminado.')
    }
  }

  // Slide CRUD
  function handleAddSlide() {
    if (!slideForm.title.trim() && !slideForm.url.trim()) {
      toast.error('Indica al menos el título o la URL de la imagen/video')
      return
    }
    const newSlideItem: Slide = {
      id: String(Date.now()),
      ...slideForm,
    }
    set('slides', [...draft.slides, newSlideItem])
    setSlideForm({ title: '', subtitle: '', url: '', type: 'image', link: '', fit: 'cover', position: 'center', zoom: 1 })
    setIsAddingSlide(false)
    toast.success('Diapositiva añadida al carrusel.')
  }

  function handleSaveEditSlide() {
    if (!editingSlideId) return
    set(
      'slides',
      draft.slides.map((s) => (s.id === editingSlideId ? { ...s, ...slideForm } : s)),
    )
    setEditingSlideId(null)
    toast.success('Diapositiva actualizada con éxito.')
  }

  function handleDeleteSlide(id: string) {
    if (confirm('¿Estás seguro de eliminar esta diapositiva?')) {
      set('slides', draft.slides.filter((s) => s.id !== id))
      toast.success('Diapositiva eliminada.')
    }
  }

  // Preset for logo position
  function applyLogoPreset(x: number, y: number, scale = 1, rotate = -9) {
    setDraft((d) => ({
      ...d,
      heroLogoX: x,
      heroLogoY: y,
      heroLogoScale: scale,
      heroLogoRotate: rotate,
    }))
    setDirty(true)
    toast.info(`Logo colocado en X:${x}px, Y:${y}px`)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!dirty) onClose()
        else if (!v)
          setError(
            'Tienes cambios pendientes. Guarda o descarta antes de salir.',
          )
      }}
    >
      <DialogContent className="admin-dialog">
        <div className="admin-heading">
          <div className="eyebrow">
            <Settings2 size={15} /> CENTRO DE CONTROL PROFESIONAL
          </div>
          <DialogTitle>Panel de Administración • Más Network 92.1 FM</DialogTitle>
          <DialogDescription>
            Controla, edita, agrega, elimina y personaliza cada sección, función, color y detalle de tu emisora.
          </DialogDescription>
        </div>
        <div className="admin-layout">
          <aside className="admin-tabs">
            {tabs.map(([name, Icon]) => (
              <button
                className={tab === name ? 'selected' : ''}
                key={name}
                onClick={() => setTab(name)}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </aside>
          <div className="admin-fields">
            <h3>{tab}</h3>

            {/* TAB: IDENTIDAD */}
            {tab === 'Identidad' && (
              <>
                <p className="hint">
                  Datos principales y enlaces de emisión de Más Network.
                </p>
                <div className="form-grid">
                  {input('name', 'Nombre de la emisora')}
                  {input('frequency', 'Frecuencia')}
                  {input('slogan', 'Eslogan')}
                </div>
                {input('director', 'Director de la emisora')}
                {input('city', 'Ciudad y País')}
                {input('email', 'Correo electrónico', 'email')}
                {input('whatsapp', 'Número de WhatsApp oficial (sin signos)')}
                {input('stream', 'URL de transmisión de audio (HTTPS)', 'url')}
                <p className="hint">
                  Enlace directo a la señal de audio Icecast/Shoutcast (.mp3, /stream).
                </p>
                {media('logo', 'Logo oficial de la emisora')}
                {media('background', 'Fondo principal de portada')}

                {/* Vista previa en vivo de Identidad */}
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: `linear-gradient(135deg, ${draft.blue || '#072a69'}, #031433)`, color: '#ffffff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: draft.yellow || '#ffdc18', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      VISTA PREVIA EN VIVO DE IDENTIDAD
                    </span>
                    <span style={{ fontSize: '12px', background: draft.yellow || '#ffdc18', color: '#072a69', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      {draft.frequency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={draft.logo || '/img/logo.png'}
                      alt="Logo preview"
                      style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                    />
                    <div>
                      <h4 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 800 }}>
                        {draft.name}
                      </h4>
                      <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500 }}>
                        {draft.slogan}
                      </p>
                      <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                        {draft.city} • Director: {draft.director}
                      </small>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB: PORTADA & LOGO (REQUERIMIENTO: MOVER EL LOGO) */}
            {tab === 'Portada & Logo' && (
              <>
                <p className="hint">
                  Ajusta la posición exacta, inclinación y tamaño del logo en la portada. También puedes <strong>arrastrarlo directamente con el cursor o el dedo</strong> en la página principal.
                </p>

                <div className="edit-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <b style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#072a69' }}>
                      <Move size={16} /> Posición y Transformación del Logo en Portada
                    </b>
                    <button
                      className="admin-pill-btn"
                      onClick={() => applyLogoPreset(0, 0, 1, -9)}
                      title="Restablecer a posición original"
                    >
                      <RotateCcw size={13} /> Original
                    </button>
                  </div>

                  {/* Previsualización en vivo */}
                  <div className="logo-pos-preview-box" style={{ backgroundImage: `linear-gradient(90deg, ${draft.blue || '#072a69'}, transparent), url("${draft.background || '/img/banner.webp'}")`, backgroundSize: 'cover' }}>
                    <img
                      src={draft.logo || '/img/logo.png'}
                      alt="Logo preview"
                      style={{
                        transform: `translate(${draft.heroLogoX ?? 0}px, ${draft.heroLogoY ?? 0}px) rotate(${draft.heroLogoRotate ?? -9}deg) scale(${draft.heroLogoScale ?? 1})`,
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                    <label className="field">
                      Desplazamiento Horizontal (X: {draft.heroLogoX ?? 0}px)
                      <input
                        type="range"
                        min="-280"
                        max="280"
                        value={draft.heroLogoX ?? 0}
                        onChange={(e) => set('heroLogoX', Number(e.target.value))}
                      />
                    </label>
                    <label className="field">
                      Desplazamiento Vertical (Y: {draft.heroLogoY ?? 0}px)
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={draft.heroLogoY ?? 0}
                        onChange={(e) => set('heroLogoY', Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                    <label className="field">
                      Tamaño / Escala ({((draft.heroLogoScale ?? 1) * 100).toFixed(0)}%)
                      <input
                        type="range"
                        min="0.5"
                        max="2.2"
                        step="0.05"
                        value={draft.heroLogoScale ?? 1}
                        onChange={(e) => set('heroLogoScale', Number(e.target.value))}
                      />
                    </label>
                    <label className="field">
                      Inclinación / Rotación ({draft.heroLogoRotate ?? -9}°)
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={draft.heroLogoRotate ?? -9}
                        onChange={(e) => set('heroLogoRotate', Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      Posiciones rápidas:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="admin-pill-btn" onClick={() => applyLogoPreset(-100, 0, draft.heroLogoScale ?? 1, draft.heroLogoRotate ?? -9)}>
                        ⬅ Izquierda
                      </button>
                      <button className="admin-pill-btn" onClick={() => applyLogoPreset(0, 0, draft.heroLogoScale ?? 1, draft.heroLogoRotate ?? -9)}>
                        ⏺ Centro
                      </button>
                      <button className="admin-pill-btn" onClick={() => applyLogoPreset(100, 0, draft.heroLogoScale ?? 1, draft.heroLogoRotate ?? -9)}>
                        ➡ Derecha
                      </button>
                      <button className="admin-pill-btn" onClick={() => applyLogoPreset(0, -60, draft.heroLogoScale ?? 1, draft.heroLogoRotate ?? -9)}>
                        ⬆ Arriba
                      </button>
                      <button className="admin-pill-btn" onClick={() => applyLogoPreset(0, 60, draft.heroLogoScale ?? 1, draft.heroLogoRotate ?? -9)}>
                        ⬇ Abajo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="edit-card" style={{ marginTop: '16px' }}>
                  <b style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#072a69' }}>
                    Textos de la Portada
                  </b>
                  <label className="field">
                    Título de portada (Líneas separadas)
                    <textarea
                      value={draft.heroTitle}
                      onChange={(e) => set('heroTitle', e.target.value)}
                      rows={3}
                    />
                  </label>
                  <label className="field">
                    Texto descriptivo
                    <textarea
                      value={draft.heroText}
                      onChange={(e) => set('heroText', e.target.value)}
                      rows={2}
                    />
                  </label>
                </div>
              </>
            )}

            {/* TAB: CABECERA & ESTADO (REQUERIMIENTO: RADIO ONLINE Y BOTÓN INSTALAR APP) */}
            {tab === 'Cabecera & Estado' && (
              <>
                <p className="hint">
                  Controla la barra superior, el acceso de administrador en «Radio Online» y el comportamiento del botón «Instalar app».
                </p>

                <div className="edit-card">
                  <div className="section-item-header">
                    <div>
                      <b style={{ fontSize: '13px', color: '#072a69' }}>Indicador de Señal y Acceso Administrador (Radio Online)</b>
                      <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Muestra el estado en vivo y permite ingresar al panel de administración directamente desde la cabecera.
                      </p>
                    </div>
                    <label className="modern-switch">
                      <input
                        type="checkbox"
                        checked={draft.flags.radioStatusDot && draft.visible.headerLive !== false}
                        onChange={(e) => {
                          set('flags', { ...draft.flags, radioStatusDot: e.target.checked })
                          set('visible', { ...draft.visible, headerLive: e.target.checked })
                        }}
                      />
                      <span className="modern-switch-slider" />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                    <label className="field">
                      Texto en vivo (cuando hay señal)
                      <input
                        type="text"
                        value={draft.copy.radioStatusText || 'RADIO ONLINE'}
                        onChange={(e) =>
                          set('copy', { ...draft.copy, radioStatusText: e.target.value })
                        }
                      />
                    </label>
                    <label className="field">
                      Texto sin señal
                      <input
                        type="text"
                        value={draft.copy.radioStatusOfflineText || 'SIN SEÑAL'}
                        onChange={(e) =>
                          set('copy', { ...draft.copy, radioStatusOfflineText: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="field" style={{ marginTop: '8px' }}>
                    Etiqueta de la placa de administración
                    <input
                      type="text"
                      value={draft.copy.radioStatusAdminBadge || 'ADMIN'}
                      onChange={(e) =>
                        set('copy', { ...draft.copy, radioStatusAdminBadge: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="edit-card" style={{ marginTop: '16px' }}>
                  <div className="section-item-header">
                    <div>
                      <b style={{ fontSize: '13px', color: '#072a69' }}>Botón «Instalar App» en Cabecera</b>
                      <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Permite a los oyentes instalar la aplicación web en su pantalla de inicio.
                      </p>
                    </div>
                    <label className="modern-switch">
                      <input
                        type="checkbox"
                        checked={draft.visible.headerInstall !== false}
                        onChange={(e) =>
                          set('visible', { ...draft.visible, headerInstall: e.target.checked })
                        }
                      />
                      <span className="modern-switch-slider" />
                    </label>
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label className="modern-switch" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                          Ocultar automáticamente cuando la app ya esté instalada
                        </span>
                        <small style={{ color: '#64748b', fontSize: '11px' }}>
                          Si el oyente ya tiene instalada la PWA, el botón desaparecerá automáticamente de la cabecera.
                        </small>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.flags.autoHideInstalled !== false}
                        onChange={(e) =>
                          set('flags', { ...draft.flags, autoHideInstalled: e.target.checked })
                        }
                      />
                      <span className="modern-switch-slider" />
                    </label>
                  </div>
                </div>

                {/* Vista previa en vivo de la Cabecera */}
                <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, display: 'block', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    VISTA PREVIA EN VIVO DE LA CABECERA:
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: draft.sectionStyles?.header?.background || '#ffffff',
                    color: draft.sectionStyles?.header?.textColor || '#072a69',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={draft.logo || '/img/logo.png'} alt="" style={{ height: '24px', width: 'auto' }} />
                      <strong style={{ fontSize: '13px' }}>{draft.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {draft.visible.headerLive !== false && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: 'rgba(7,42,105,0.08)',
                          fontSize: '10px',
                          fontWeight: 700,
                          border: '1px solid rgba(7,42,105,0.2)'
                        }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                          {draft.copy.radioStatusText || 'RADIO ONLINE'}
                          <span style={{ background: draft.yellow || '#ffdc18', color: '#072a69', padding: '1px 5px', borderRadius: '4px', fontSize: '8px', fontWeight: 800 }}>
                            {draft.copy.radioStatusAdminBadge || 'ADMIN'}
                          </span>
                        </span>
                      )}
                      {draft.visible.headerInstall !== false && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: draft.yellow || '#ffdc18',
                          color: '#072a69',
                          fontSize: '10px',
                          fontWeight: 800
                        }}>
                          Instalar app
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB: SECCIONES (CONTROL TOTAL: ACTIVAR, DESACTIVAR CON BOTON, EDITAR COLORES) */}
            {tab === 'Secciones' && (
              <>
                <p className="hint">
                  Activa o desactiva con un botón cada bloque de la página, cambia su orden y personaliza sus colores exclusivos.
                </p>

                {/* Ticker switch */}
                <div className="section-item-card">
                  <div className="section-item-header">
                    <div>
                      <strong style={{ fontSize: '13px', color: '#072a69' }}>{sectionDisplayNames.ticker}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Cintillo deslizante de titulares y mensajes destacados.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className="admin-pill-btn"
                        onClick={() => setExpandedSection(expandedSection === 'ticker' ? null : 'ticker')}
                      >
                        <Palette size={13} /> Colores
                      </button>
                      <label className="modern-switch">
                        <input
                          type="checkbox"
                          checked={draft.visible.ticker !== false}
                          onChange={(e) =>
                            set('visible', { ...draft.visible, ticker: e.target.checked })
                          }
                        />
                        <span className="modern-switch-slider" />
                      </label>
                    </div>
                  </div>
                  {expandedSection === 'ticker' && (
                    <div className="color-picker-group">
                      <div className="color-picker-box">
                        <label>Fondo</label>
                        <div className="color-picker-input-wrap">
                          <input
                            type="color"
                            value={draft.sectionStyles?.ticker?.background || '#ffdc18'}
                            onChange={(e) => setSectionStyle('ticker', 'background', e.target.value)}
                          />
                          <input
                            type="text"
                            value={draft.sectionStyles?.ticker?.background || '#ffdc18'}
                            onChange={(e) => setSectionStyle('ticker', 'background', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="color-picker-box">
                        <label>Texto</label>
                        <div className="color-picker-input-wrap">
                          <input
                            type="color"
                            value={draft.sectionStyles?.ticker?.textColor || '#1b3060'}
                            onChange={(e) => setSectionStyle('ticker', 'textColor', e.target.value)}
                          />
                          <input
                            type="text"
                            value={draft.sectionStyles?.ticker?.textColor || '#1b3060'}
                            onChange={(e) => setSectionStyle('ticker', 'textColor', e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        className="admin-pill-btn"
                        style={{ alignSelf: 'flex-end' }}
                        onClick={() => {
                          setSectionStyle('ticker', 'background', undefined)
                          setSectionStyle('ticker', 'textColor', undefined)
                        }}
                      >
                        <RotateCcw size={12} /> Restablecer
                      </button>
                    </div>
                  )}
                </div>

                {/* Header switch */}
                <div className="section-item-card">
                  <div className="section-item-header">
                    <div>
                      <strong style={{ fontSize: '13px', color: '#072a69' }}>{sectionDisplayNames.header}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Barra superior fija con logo, menú y botones de acción.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className="admin-pill-btn"
                        onClick={() => setExpandedSection(expandedSection === 'header' ? null : 'header')}
                      >
                        <Palette size={13} /> Colores
                      </button>
                      <label className="modern-switch">
                        <input
                          type="checkbox"
                          checked={draft.visible.header !== false}
                          onChange={(e) =>
                            set('visible', { ...draft.visible, header: e.target.checked })
                          }
                        />
                        <span className="modern-switch-slider" />
                      </label>
                    </div>
                  </div>
                  {expandedSection === 'header' && (
                    <div className="color-picker-group">
                      <div className="color-picker-box">
                        <label>Fondo</label>
                        <div className="color-picker-input-wrap">
                          <input
                            type="color"
                            value={draft.sectionStyles?.header?.background || '#ffffff'}
                            onChange={(e) => setSectionStyle('header', 'background', e.target.value)}
                          />
                          <input
                            type="text"
                            value={draft.sectionStyles?.header?.background || '#ffffff'}
                            onChange={(e) => setSectionStyle('header', 'background', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="color-picker-box">
                        <label>Texto</label>
                        <div className="color-picker-input-wrap">
                          <input
                            type="color"
                            value={draft.sectionStyles?.header?.textColor || '#072a69'}
                            onChange={(e) => setSectionStyle('header', 'textColor', e.target.value)}
                          />
                          <input
                            type="text"
                            value={draft.sectionStyles?.header?.textColor || '#072a69'}
                            onChange={(e) => setSectionStyle('header', 'textColor', e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        className="admin-pill-btn"
                        style={{ alignSelf: 'flex-end' }}
                        onClick={() => {
                          setSectionStyle('header', 'background', undefined)
                          setSectionStyle('header', 'textColor', undefined)
                        }}
                      >
                        <RotateCcw size={12} /> Restablecer
                      </button>
                    </div>
                  )}
                </div>

                {/* Sticky player switch */}
                <div className="section-item-card">
                  <div className="section-item-header">
                    <div>
                      <strong style={{ fontSize: '13px', color: '#072a69' }}>{sectionDisplayNames.stickyPlayer}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Reproductor flotante inferior continuo.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className="admin-pill-btn"
                        onClick={() => setExpandedSection(expandedSection === 'stickyPlayer' ? null : 'stickyPlayer')}
                      >
                        <Palette size={13} /> Colores
                      </button>
                      <label className="modern-switch">
                        <input
                          type="checkbox"
                          checked={draft.visible.stickyPlayer !== false}
                          onChange={(e) =>
                            set('visible', { ...draft.visible, stickyPlayer: e.target.checked })
                          }
                        />
                        <span className="modern-switch-slider" />
                      </label>
                    </div>
                  </div>
                  {expandedSection === 'stickyPlayer' && (
                    <div className="color-picker-group">
                      <div className="color-picker-box">
                        <label>Fondo</label>
                        <div className="color-picker-input-wrap">
                          <input
                            type="color"
                            value={draft.sectionStyles?.stickyPlayer?.background || '#072a69'}
                            onChange={(e) => setSectionStyle('stickyPlayer', 'background', e.target.value)}
                          />
                          <input
                            type="text"
                            value={draft.sectionStyles?.stickyPlayer?.background || '#072a69'}
                            onChange={(e) => setSectionStyle('stickyPlayer', 'background', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="color-picker-box">
                        <label>Texto</label>
                        <div className="color-picker-input-wrap">
                          <input
                            type="color"
                            value={draft.sectionStyles?.stickyPlayer?.textColor || '#ffffff'}
                            onChange={(e) => setSectionStyle('stickyPlayer', 'textColor', e.target.value)}
                          />
                          <input
                            type="text"
                            value={draft.sectionStyles?.stickyPlayer?.textColor || '#ffffff'}
                            onChange={(e) => setSectionStyle('stickyPlayer', 'textColor', e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        className="admin-pill-btn"
                        style={{ alignSelf: 'flex-end' }}
                        onClick={() => {
                          setSectionStyle('stickyPlayer', 'background', undefined)
                          setSectionStyle('stickyPlayer', 'textColor', undefined)
                        }}
                      >
                        <RotateCcw size={12} /> Restablecer
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ margin: '18px 0 10px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Bloques del cuerpo principal (puedes cambiar su orden):
                </div>

                {draft.sections.map((key, i) => (
                  <div className="section-item-card" key={key}>
                    <div className="section-item-header">
                      <div>
                        <strong style={{ fontSize: '13px', color: '#072a69' }}>
                          {sectionDisplayNames[key] || key}
                        </strong>
                        <div style={{ fontSize: '11px', color: draft.visible[key as keyof typeof draft.visible] ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                          {draft.visible[key as keyof typeof draft.visible] ? '● Activa' : '○ Desactivada'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="admin-pill-btn"
                          onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                        >
                          <Palette size={13} /> Colores
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Subir sección"
                          title="Subir posición"
                          onClick={() => set('sections', move(draft.sections, i, -1))}
                          disabled={i === 0}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Bajar sección"
                          title="Bajar posición"
                          onClick={() => set('sections', move(draft.sections, i, 1))}
                          disabled={i === draft.sections.length - 1}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <label className="modern-switch">
                          <input
                            type="checkbox"
                            checked={draft.visible[key as keyof typeof draft.visible] !== false}
                            onChange={(e) =>
                              set('visible', {
                                ...draft.visible,
                                [key]: e.target.checked,
                              })
                            }
                          />
                          <span className="modern-switch-slider" />
                        </label>
                      </div>
                    </div>

                    {/* Color customizer for this specific section */}
                    {expandedSection === key && (
                      <div className="color-picker-group">
                        <div className="color-picker-box">
                          <label>Fondo de sección</label>
                          <div className="color-picker-input-wrap">
                            <input
                              type="color"
                              value={draft.sectionStyles?.[key]?.background || '#ffffff'}
                              onChange={(e) => setSectionStyle(key, 'background', e.target.value)}
                            />
                            <input
                              type="text"
                              value={draft.sectionStyles?.[key]?.background || ''}
                              placeholder="Ej. #f5f7fb"
                              onChange={(e) => setSectionStyle(key, 'background', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="color-picker-box">
                          <label>Color de texto</label>
                          <div className="color-picker-input-wrap">
                            <input
                              type="color"
                              value={draft.sectionStyles?.[key]?.textColor || '#10244b'}
                              onChange={(e) => setSectionStyle(key, 'textColor', e.target.value)}
                            />
                            <input
                              type="text"
                              value={draft.sectionStyles?.[key]?.textColor || ''}
                              placeholder="Ej. #10244b"
                              onChange={(e) => setSectionStyle(key, 'textColor', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="color-picker-box">
                          <label>Color de borde</label>
                          <div className="color-picker-input-wrap">
                            <input
                              type="color"
                              value={draft.sectionStyles?.[key]?.borderColor || '#dfe6ef'}
                              onChange={(e) => setSectionStyle(key, 'borderColor', e.target.value)}
                            />
                            <input
                              type="text"
                              value={draft.sectionStyles?.[key]?.borderColor || ''}
                              placeholder="Ej. #dfe6ef"
                              onChange={(e) => setSectionStyle(key, 'borderColor', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="color-picker-box">
                          <label>Color de recuadros / tarjetas</label>
                          <div className="color-picker-input-wrap">
                            <input
                              type="color"
                              value={draft.sectionStyles?.[key]?.cardBackground || '#ffffff'}
                              onChange={(e) => setSectionStyle(key, 'cardBackground', e.target.value)}
                            />
                            <input
                              type="text"
                              value={draft.sectionStyles?.[key]?.cardBackground || ''}
                              placeholder="Ej. #ffffff"
                              onChange={(e) => setSectionStyle(key, 'cardBackground', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="color-picker-box">
                          <label>Borde de recuadros / tarjetas</label>
                          <div className="color-picker-input-wrap">
                            <input
                              type="color"
                              value={draft.sectionStyles?.[key]?.cardBorderColor || '#dfe6ef'}
                              onChange={(e) => setSectionStyle(key, 'cardBorderColor', e.target.value)}
                            />
                            <input
                              type="text"
                              value={draft.sectionStyles?.[key]?.cardBorderColor || ''}
                              placeholder="Ej. #dfe6ef"
                              onChange={(e) => setSectionStyle(key, 'cardBorderColor', e.target.value)}
                            />
                          </div>
                        </div>

                        <button
                          className="admin-pill-btn"
                          style={{ alignSelf: 'flex-end' }}
                          onClick={() => {
                            setSectionStyle(key, 'background', undefined)
                            setSectionStyle(key, 'textColor', undefined)
                            setSectionStyle(key, 'borderColor', undefined)
                            setSectionStyle(key, 'cardBackground', undefined)
                            setSectionStyle(key, 'cardBorderColor', undefined)
                          }}
                        >
                          <RotateCcw size={12} /> Restablecer
                        </button>

                        {/* Vista previa en vivo del recuadro / tarjeta de esta sección */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '12px', padding: '14px', borderRadius: '10px', background: draft.sectionStyles?.[key]?.background || '#f1f5f9', border: `1px solid ${draft.sectionStyles?.[key]?.borderColor || '#cbd5e1'}` }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                            VISTA PREVIA EN VIVO DEL RECUADRO ({sectionDisplayNames[key] || key}):
                          </span>
                          <div style={{
                            backgroundColor: draft.sectionStyles?.[key]?.cardBackground || '#ffffff',
                            borderColor: draft.sectionStyles?.[key]?.cardBorderColor || '#e2e8f0',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderRadius: '12px',
                            padding: '14px 18px',
                            color: draft.sectionStyles?.[key]?.textColor || '#072a69',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '14px' }}>Tarjeta / Recuadro de ejemplo</strong>
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: draft.yellow || '#ffdc18', color: '#072a69', fontWeight: 800 }}>
                                {draft.frequency}
                              </span>
                            </div>
                            <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.85, lineHeight: 1.4 }}>
                              Visualiza en tiempo real los colores asignados al fondo, texto y bordes de los recuadros de {sectionDisplayNames[key] || key}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* TAB: COLORES & APARIENCIA */}
            {tab === 'Colores' && (
              <>
                <p className="hint">
                  Personaliza los colores oficiales de Más Network, el color de fondo general de toda la página y la apariencia de los componentes.
                </p>

                <div className="edit-card">
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Paleta Principal y Fondo de Toda la Página
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div className="color-picker-box">
                      <label>Azul Profundo (Color Primario)</label>
                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={draft.blue}
                          onChange={(e) => set('blue', e.target.value)}
                        />
                        <input
                          type="text"
                          value={draft.blue}
                          onChange={(e) => set('blue', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="color-picker-box">
                      <label>Amarillo Eléctrico (Color Acento)</label>
                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={draft.yellow}
                          onChange={(e) => set('yellow', e.target.value)}
                        />
                        <input
                          type="text"
                          value={draft.yellow}
                          onChange={(e) => set('yellow', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="color-picker-box">
                      <label>Fondo de Toda la Página (Inicio / Global)</label>
                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={draft.pageBackground || '#f5f7fb'}
                          onChange={(e) => set('pageBackground', e.target.value)}
                        />
                        <input
                          type="text"
                          value={draft.pageBackground || '#f5f7fb'}
                          onChange={(e) => set('pageBackground', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick background presets */}
                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Temas y fondos rápidos para toda la página:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { name: 'Predeterminado (#f5f7fb)', bg: '#f5f7fb' },
                        { name: 'Blanco Puro (#ffffff)', bg: '#ffffff' },
                        { name: 'Gris Perla (#eceff4)', bg: '#eceff4' },
                        { name: 'Azul Noche (#051329)', bg: '#051329' },
                        { name: 'Grafito Dark (#0f172a)', bg: '#0f172a' },
                      ].map((preset) => (
                        <button
                          key={preset.bg}
                          type="button"
                          className="admin-pill-btn"
                          style={{
                            background: preset.bg,
                            color: preset.bg === '#ffffff' || preset.bg === '#f5f7fb' || preset.bg === '#eceff4' ? '#0f172a' : '#ffffff',
                            border: draft.pageBackground === preset.bg ? '2px solid #ffdc18' : '1px solid #cbd5e1',
                          }}
                          onClick={() => set('pageBackground', preset.bg)}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
                    <label className="field">
                      Curvatura de bordes ({draft.radius}px)
                      <input
                        type="range"
                        min="0"
                        max="35"
                        value={draft.radius}
                        onChange={(e) => set('radius', Number(e.target.value))}
                      />
                    </label>
                    <label className="field">
                      Espaciado entre bloques ({draft.spacing}x)
                      <input
                        type="range"
                        min="0.6"
                        max="1.5"
                        step="0.05"
                        value={draft.spacing}
                        onChange={(e) => set('spacing', Number(e.target.value))}
                      />
                    </label>
                  </div>
                </div>

                {/* Live Color Preview */}
                <div
                  className="appearance-preview"
                  style={{
                    background: draft.pageBackground || '#f5f7fb',
                    border: '1px solid #cbd5e1',
                    borderRadius: `${draft.radius}px`,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    VISTA PREVIA DEL FONDO GLOBAL ({draft.pageBackground || '#f5f7fb'}):
                  </div>
                  <div
                    style={{
                      background: draft.blue,
                      color: '#fff',
                      borderRadius: `${draft.radius}px`,
                      padding: '20px',
                      boxShadow: '0 8px 24px rgba(7, 42, 105, 0.2)',
                    }}
                  >
                    <span style={{ color: draft.yellow, letterSpacing: '2px', fontWeight: 700, fontSize: '12px' }}>
                      MÁS NETWORK 92.1 FM
                    </span>
                    <strong style={{ fontSize: '24px', color: '#fff', display: 'block', margin: '6px 0 12px' }}>
                      ¡El auténtico Medio Palo!
                    </strong>
                    <button
                      className="button"
                      style={{
                        background: draft.yellow,
                        color: '#072a69',
                        fontWeight: 800,
                        borderRadius: `${draft.radius}px`,
                        padding: '8px 20px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Escuchar en vivo
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB: PROGRAMACIÓN (AGREGAR, EDITAR, ELIMINAR, ORDENAR) */}
            {tab === 'Programación' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p className="hint" style={{ margin: 0 }}>
                    Gestiona la grilla de programas, horarios y locutores.
                  </p>
                  <button
                    className="admin-pill-btn primary"
                    onClick={() => {
                      setShowForm({ name: '', host: '', start: '08:00', end: '10:00', day: 'lv' })
                      setIsAddingShow(true)
                      setEditingShowId(null)
                    }}
                  >
                    <Plus size={15} /> Agregar Programa
                  </button>
                </div>

                {/* Form to add or edit show */}
                {(isAddingShow || editingShowId) && (
                  <div className="edit-card" style={{ border: '2px solid #072a69', background: '#f0f5ff' }}>
                    <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                      {editingShowId ? 'Editar Programa' : 'Nuevo Programa'}
                    </b>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label className="field">
                        Nombre del programa
                        <input
                          type="text"
                          placeholder="Ej. Conexión 0285"
                          value={showForm.name}
                          onChange={(e) => setShowForm({ ...showForm, name: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        Locutor(es) / Conductor
                        <input
                          type="text"
                          placeholder="Ej. Klainer Guerrero"
                          value={showForm.host}
                          onChange={(e) => setShowForm({ ...showForm, host: e.target.value })}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <label className="field">
                        Hora inicio (24h)
                        <input
                          type="text"
                          placeholder="09:00"
                          value={showForm.start}
                          onChange={(e) => setShowForm({ ...showForm, start: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        Hora fin (24h)
                        <input
                          type="text"
                          placeholder="11:00"
                          value={showForm.end}
                          onChange={(e) => setShowForm({ ...showForm, end: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        Días de emisión
                        <select
                          value={showForm.day}
                          onChange={(e) => setShowForm({ ...showForm, day: e.target.value })}
                        >
                          <option value="lv">Lunes a Viernes</option>
                          <option value="sab">Sábados</option>
                          <option value="dom">Domingos</option>
                        </select>
                      </label>
                    </div>

                    {/* Live Preview of Show Row */}
                    <div style={{ marginTop: '12px', padding: '12px', background: draft.sectionStyles?.schedule?.cardBackground || '#ffffff', borderRadius: '10px', border: `1px solid ${draft.sectionStyles?.schedule?.cardBorderColor || '#cbd5e1'}` }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        VISTA PREVIA EN VIVO DE ESTE PROGRAMA:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>01</span>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: draft.yellow || '#ffdc18', background: '#072a69', padding: '2px 6px', borderRadius: '4px' }}>
                              {showForm.start || '08:00'} - {showForm.end || '10:00'}
                            </span>
                            <h4 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 700, color: draft.sectionStyles?.schedule?.textColor || '#072a69' }}>
                              {showForm.name || 'Nombre del programa'}
                            </h4>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              Conducción: {showForm.host || 'Locutor asignado'} • {showForm.day === 'lv' ? 'Lunes a Viernes' : showForm.day === 'sab' ? 'Sábados' : 'Domingos'}
                            </small>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                          ● EN VIVO
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        className="admin-pill-btn"
                        onClick={() => {
                          setIsAddingShow(false)
                          setEditingShowId(null)
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        className="admin-pill-btn primary"
                        onClick={editingShowId ? handleSaveEditShow : handleAddShow}
                      >
                        <Check size={14} /> {editingShowId ? 'Guardar Cambios' : 'Añadir Programa'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Shows list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {draft.shows.map((s, idx) => (
                    <div className="section-item-card" key={s.id} style={{ padding: '12px 14px', margin: 0 }}>
                      <div className="section-item-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              background: s.day === 'lv' ? '#072a69' : s.day === 'sab' ? '#16a34a' : '#9333ea',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '3px 7px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {dayNames[s.day as keyof typeof dayNames] || s.day}
                          </span>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#17345e', display: 'block' }}>
                              {s.name}
                            </strong>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              {s.start} - {s.end} • {s.host || 'Locutor no especificado'}
                            </small>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="icon-button"
                            title="Subir"
                            disabled={idx === 0}
                            onClick={() => set('shows', move(draft.shows, idx, -1))}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Bajar"
                            disabled={idx === draft.shows.length - 1}
                            onClick={() => set('shows', move(draft.shows, idx, 1))}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Editar programa"
                            onClick={() => {
                              setShowForm({
                                name: s.name,
                                host: s.host,
                                start: s.start,
                                end: s.end,
                                day: s.day,
                              })
                              setEditingShowId(s.id)
                              setIsAddingShow(false)
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Eliminar programa"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteShow(s.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="edit-card" style={{ marginTop: '16px' }}>
                  <b style={{ fontSize: '12px', color: '#072a69', display: 'block', marginBottom: '10px' }}>
                    Opciones de Visualización de Horarios
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label className="field">
                      Diseño de la grilla
                      <select
                        value={draft.scheduleView}
                        onChange={(e) => set('scheduleView', e.target.value as never)}
                      >
                        <option value="classic">Clásica</option>
                        <option value="timeline">Línea de tiempo</option>
                        <option value="compact">Compacta</option>
                        <option value="grid">Cuadrícula</option>
                        <option value="broadcast">Emisión radial</option>
                        <option value="magazine">Revista</option>
                        <option value="neon">Neón</option>
                        <option value="minimal">Minimalista</option>
                      </select>
                    </label>
                    <label className="field">
                      Formato de hora
                      <select
                        value={draft.timeFormat}
                        onChange={(e) => set('timeFormat', e.target.value as never)}
                      >
                        <option value="12h">12 Horas (AM/PM)</option>
                        <option value="24h">24 Horas Militar</option>
                        <option value="short">Corta</option>
                        <option value="dot">Punto</option>
                        <option value="formal">Formal</option>
                      </select>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* TAB: CARRUSELES (DIMENSIONAR, RECORTAR, AGREGAR, EDITAR, ELIMINAR, ORDENAR) */}
            {tab === 'Carruseles' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p className="hint" style={{ margin: 0 }}>
                    Dimensiona, recorta y ajusta el cuadro del carrusel, y administra las fotos y videos promocionales.
                  </p>
                  <button
                    className="admin-pill-btn primary"
                    onClick={() => {
                      setSlideForm({ title: '', subtitle: '', url: '', type: 'image', link: '', fit: 'cover', position: 'center', zoom: 1 })
                      setIsAddingSlide(true)
                      setEditingSlideId(null)
                    }}
                  >
                    <Plus size={15} /> Agregar Diapositiva
                  </button>
                </div>

                {/* Global Carousel Dimensions & Crop settings */}
                <div className="edit-card" style={{ marginBottom: '16px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Ajuste, Dimensiones y Recorte del Cuadro del Carrusel
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <label className="field">
                      Altura del cuadro ({draft.carouselHeight || 340}px)
                      <input
                        type="range"
                        min="240"
                        max="580"
                        step="10"
                        value={draft.carouselHeight || 340}
                        onChange={(e) => set('carouselHeight', Number(e.target.value))}
                      />
                    </label>
                    <label className="field">
                      Ajuste / Recorte de foto o video
                      <select
                        value={draft.carouselFit || 'cover'}
                        onChange={(e) => set('carouselFit', e.target.value as 'cover' | 'contain' | 'fill')}
                      >
                        <option value="cover">Recortar y llenar cuadro (Cover)</option>
                        <option value="contain">Ajustar completo sin recortar (Contain)</option>
                        <option value="fill">Llenar y estirar al 100% (Fill)</option>
                      </select>
                    </label>
                    <label className="field">
                      Enfoque / Posición de recorte
                      <select
                        value={draft.carouselPosition || 'center'}
                        onChange={(e) => set('carouselPosition', e.target.value as 'center' | 'top' | 'bottom' | 'left' | 'right')}
                      >
                        <option value="center">Centro (Equilibrado)</option>
                        <option value="top">Arriba (Enfocar cabezas/títulos)</option>
                        <option value="bottom">Abajo (Enfocar base)</option>
                        <option value="left">Izquierda</option>
                        <option value="right">Derecha</option>
                      </select>
                    </label>
                    <label className="field">
                      Zoom del contenido ({(draft.carouselZoom ?? 1).toFixed(1)}x)
                      <input
                        type="range"
                        min="0.8"
                        max="2.0"
                        step="0.05"
                        value={draft.carouselZoom ?? 1}
                        onChange={(e) => set('carouselZoom', Number(e.target.value))}
                      />
                    </label>
                  </div>

                  {/* Live Mini Preview of the Carousel Box */}
                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      VISTA PREVIA DEL CUADRO DEL CARRUSEL:
                    </span>
                    <div
                      style={{
                        height: `${Math.min(260, draft.carouselHeight || 340)}px`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#072a69',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }}
                    >
                      <img
                        src={draft.slides[0]?.url || '/img/banner.webp'}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: draft.carouselFit || 'cover',
                          objectPosition: draft.carouselPosition || 'center',
                          transform: `scale(${draft.carouselZoom ?? 1})`,
                          opacity: draft.carouselOpacity ?? 0.85,
                          transition: 'all 0.2s ease',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '14px',
                          background: 'linear-gradient(transparent, rgba(7,42,105,0.9))',
                          color: '#fff',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#ffdc18', fontWeight: 700, letterSpacing: '1px' }}>
                          MÁS NETWORK 92.1 FM
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>
                          {draft.slides[0]?.title || 'Título de ejemplo'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form to add or edit slide */}
                {(isAddingSlide || editingSlideId) && (
                  <div className="edit-card" style={{ border: '2px solid #072a69', background: '#f0f5ff', marginBottom: '16px' }}>
                    <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                      {editingSlideId ? 'Editar Diapositiva' : 'Nueva Diapositiva'}
                    </b>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label className="field">
                        Título
                        <input
                          type="text"
                          placeholder="Ej. La radio del Medio Palo"
                          value={slideForm.title}
                          onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        Subtítulo
                        <input
                          type="text"
                          placeholder="Ej. De Ciudad Bolívar para el mundo"
                          value={slideForm.subtitle}
                          onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <label className="field">
                        URL de Imagen o Video
                        <input
                          type="url"
                          placeholder="/img/banner.webp o URL https"
                          value={slideForm.url}
                          onChange={(e) => setSlideForm({ ...slideForm, url: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        Tipo de medio
                        <select
                          value={slideForm.type}
                          onChange={(e) => setSlideForm({ ...slideForm, type: e.target.value })}
                        >
                          <option value="image">Imagen</option>
                          <option value="video">Video (MP4)</option>
                        </select>
                      </label>
                    </div>

                    {/* Per-slide dimension and crop overrides */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <label className="field">
                        Ajuste específico
                        <select
                          value={slideForm.fit || 'cover'}
                          onChange={(e) => setSlideForm({ ...slideForm, fit: e.target.value as 'cover' | 'contain' | 'fill' })}
                        >
                          <option value="cover">Recortar y llenar</option>
                          <option value="contain">Ajustar completo</option>
                          <option value="fill">Llenar / Estirar</option>
                        </select>
                      </label>
                      <label className="field">
                        Posición / Enfoque
                        <select
                          value={slideForm.position || 'center'}
                          onChange={(e) => setSlideForm({ ...slideForm, position: e.target.value as 'center' | 'top' | 'bottom' | 'left' | 'right' })}
                        >
                          <option value="center">Centro</option>
                          <option value="top">Arriba</option>
                          <option value="bottom">Abajo</option>
                          <option value="left">Izquierda</option>
                          <option value="right">Derecha</option>
                        </select>
                      </label>
                      <label className="field">
                        Zoom ({(slideForm.zoom ?? 1).toFixed(1)}x)
                        <input
                          type="range"
                          min="0.8"
                          max="2.0"
                          step="0.05"
                          value={slideForm.zoom ?? 1}
                          onChange={(e) => setSlideForm({ ...slideForm, zoom: Number(e.target.value) })}
                        />
                      </label>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <label className="button secondary small" style={{ display: 'inline-flex' }}>
                        <Upload size={14} /> Subir archivo multimedia
                        <input
                          type="file"
                          accept="image/*,video/mp4"
                          hidden
                          onChange={(e) => upload(e.target.files?.[0], (url) => setSlideForm({ ...slideForm, url }))}
                        />
                      </label>
                    </div>

                    {/* VISTA PREVIA EN VIVO DE LA FOTO O VIDEO */}
                    <div style={{ marginTop: '14px', background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#072a69', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                          VISTA PREVIA EN VIVO ({slideForm.type === 'video' ? 'VIDEO MP4' : 'IMAGEN'}):
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>
                          Ajuste: {slideForm.fit || draft.carouselFit || 'cover'} • Enfoque: {slideForm.position || draft.carouselPosition || 'center'} • Zoom: {(slideForm.zoom ?? 1).toFixed(1)}x
                        </span>
                      </div>

                      <div
                        style={{
                          height: '220px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          background: '#072a69',
                          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                        }}
                      >
                        {slideForm.type === 'video' ? (
                          <video
                            src={slideForm.url}
                            controls
                            playsInline
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: slideForm.fit || draft.carouselFit || 'cover',
                              objectPosition: slideForm.position || draft.carouselPosition || 'center',
                              transform: `scale(${slideForm.zoom ?? 1})`,
                              opacity: draft.carouselOpacity ?? 0.85,
                              transition: 'all 0.2s ease',
                            }}
                          />
                        ) : (
                          <img
                            src={slideForm.url || '/img/banner.webp'}
                            alt="Vista previa"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/img/banner.webp'
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: slideForm.fit || draft.carouselFit || 'cover',
                              objectPosition: slideForm.position || draft.carouselPosition || 'center',
                              transform: `scale(${slideForm.zoom ?? 1})`,
                              opacity: draft.carouselOpacity ?? 0.85,
                              transition: 'all 0.2s ease',
                            }}
                          />
                        )}

                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '12px',
                            background: 'linear-gradient(transparent, rgba(7,42,105,0.92))',
                            color: '#fff',
                            pointerEvents: 'none',
                          }}
                        >
                          <span style={{ fontSize: '9px', color: '#ffdc18', fontWeight: 800, letterSpacing: '1px' }}>
                            SOMOS MÁS NETWORK
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                            {slideForm.title || 'Título de la Diapositiva'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                            {slideForm.subtitle || 'Subtítulo o descripción de la imagen'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600 }}>Ajuste:</span>
                        {(['cover', 'contain', 'fill'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            className={`admin-pill-btn ${(slideForm.fit || 'cover') === mode ? 'primary' : ''}`}
                            style={{ fontSize: '10px', padding: '3px 8px' }}
                            onClick={() => setSlideForm({ ...slideForm, fit: mode })}
                          >
                            {mode === 'cover' ? 'Recortar (Cover)' : mode === 'contain' ? 'Completo (Contain)' : 'Estirar (Fill)'}
                          </button>
                        ))}

                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600, marginLeft: '6px' }}>Enfoque:</span>
                        {(['center', 'top', 'bottom', 'left', 'right'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            className={`admin-pill-btn ${(slideForm.position || 'center') === pos ? 'primary' : ''}`}
                            style={{ fontSize: '10px', padding: '3px 8px' }}
                            onClick={() => setSlideForm({ ...slideForm, position: pos })}
                          >
                            {pos === 'center' ? 'Centro' : pos === 'top' ? 'Arriba' : pos === 'bottom' ? 'Abajo' : pos === 'left' ? 'Izq' : 'Der'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        className="admin-pill-btn"
                        onClick={() => {
                          setIsAddingSlide(false)
                          setEditingSlideId(null)
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        className="admin-pill-btn primary"
                        onClick={editingSlideId ? handleSaveEditSlide : handleAddSlide}
                      >
                        <Check size={14} /> {editingSlideId ? 'Guardar Diapositiva' : 'Añadir al Carrusel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Slides list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {draft.slides.map((s, idx) => (
                    <div className="section-item-card" key={s.id} style={{ padding: '12px 14px', margin: 0 }}>
                      <div className="section-item-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={s.url || '/img/poster.png'}
                            alt=""
                            style={{
                              width: '65px',
                              height: '45px',
                              objectFit: s.fit || draft.carouselFit || 'cover',
                              objectPosition: s.position || draft.carouselPosition || 'center',
                              borderRadius: '6px',
                              background: '#e2e8f0',
                            }}
                          />
                          <div>
                            <strong style={{ fontSize: '13px', color: '#17345e', display: 'block' }}>
                              {s.title || 'Sin título'}
                            </strong>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              {s.subtitle || s.url} • <span style={{ textTransform: 'uppercase' }}>{s.type}</span>
                              {s.fit ? ` • ${s.fit}` : ''}
                            </small>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className={`icon-button ${previewSlideId === s.id ? 'active' : ''}`}
                            title="Vista previa en vivo"
                            onClick={() => setPreviewSlideId(previewSlideId === s.id ? null : s.id)}
                            style={{ color: previewSlideId === s.id ? '#072a69' : '#64748b' }}
                          >
                            <Sparkles size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Subir"
                            disabled={idx === 0}
                            onClick={() => set('slides', move(draft.slides, idx, -1))}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Bajar"
                            disabled={idx === draft.slides.length - 1}
                            onClick={() => set('slides', move(draft.slides, idx, 1))}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Editar diapositiva"
                            onClick={() => {
                              setSlideForm({
                                title: s.title,
                                subtitle: s.subtitle,
                                url: s.url,
                                type: s.type,
                                link: s.link,
                                fit: s.fit || 'cover',
                                position: s.position || 'center',
                                zoom: s.zoom || 1,
                              })
                              setEditingSlideId(s.id)
                              setIsAddingSlide(false)
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="icon-button"
                            title="Eliminar"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteSlide(s.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Live Preview for this slide */}
                      {previewSlideId === s.id && (
                        <div
                          style={{
                            marginTop: '10px',
                            height: '180px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#072a69',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}
                        >
                          {s.type === 'video' ? (
                            <video
                              src={s.url}
                              controls
                              playsInline
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: s.fit || draft.carouselFit || 'cover',
                                objectPosition: s.position || draft.carouselPosition || 'center',
                                transform: `scale(${s.zoom || draft.carouselZoom || 1})`,
                              }}
                            />
                          ) : (
                            <img
                              src={s.url || '/img/banner.webp'}
                              alt={s.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: s.fit || draft.carouselFit || 'cover',
                                objectPosition: s.position || draft.carouselPosition || 'center',
                                transform: `scale(${s.zoom || draft.carouselZoom || 1})`,
                              }}
                            />
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: '10px 14px',
                              background: 'linear-gradient(transparent, rgba(7,42,105,0.92))',
                              color: '#fff',
                              pointerEvents: 'none',
                            }}
                          >
                            <span style={{ fontSize: '9px', color: '#ffdc18', fontWeight: 800 }}>SOMOS MÁS NETWORK</span>
                            <div style={{ fontSize: '13px', fontWeight: 700 }}>{s.title}</div>
                            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{s.subtitle}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB: REDES Y CONTACTO (BOTONES PARA ACTIVAR Y DESACTIVAR CADA UNA) */}
            {tab === 'Redes y contacto' && (
              <>
                <p className="hint">
                  Activa o desactiva con un botón cada red social y define sus enlaces oficiales.
                </p>

                <div className="edit-card">
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Canales de Redes Sociales
                  </b>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {draft.socials.map((soc, i) => (
                      <div
                        key={soc.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          background: soc.enabled ? '#ffffff' : '#f8fafc',
                          border: `1px solid ${soc.enabled ? '#cbd5e1' : '#e2e8f0'}`,
                          borderRadius: '8px',
                        }}
                      >
                        <label className="modern-switch">
                          <input
                            type="checkbox"
                            checked={soc.enabled}
                            onChange={(e) => {
                              const updated = [...draft.socials]
                              updated[i] = { ...soc, enabled: e.target.checked }
                              set('socials', updated)
                            }}
                          />
                          <span className="modern-switch-slider" />
                        </label>
                        <span style={{ width: '90px', fontSize: '12px', fontWeight: 700, color: soc.enabled ? '#072a69' : '#94a3b8' }}>
                          {soc.name}
                        </span>
                        <input
                          type="url"
                          placeholder={`Enlace de ${soc.name}`}
                          value={soc.url}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const updated = [...draft.socials]
                            updated[i] = { ...soc, url: e.target.value }
                            set('socials', updated)
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label className="field">
                      Tamaño de iconos de redes ({draft.socialSize}px)
                      <input
                        type="range"
                        min="16"
                        max="32"
                        value={draft.socialSize}
                        onChange={(e) => set('socialSize', Number(e.target.value))}
                      />
                    </label>
                    <label className="field">
                      Nombre de usuario público
                      <input
                        type="text"
                        value={draft.copy.socialHandle || '@masnetwork921'}
                        onChange={(e) => set('copy', { ...draft.copy, socialHandle: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                {/* Live Preview Box for Redes & Contacto */}
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: draft.sectionStyles?.socials?.background || `linear-gradient(135deg, ${draft.blue || '#072a69'}, #031433)`, color: draft.sectionStyles?.socials?.textColor || '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: draft.yellow || '#ffdc18', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      VISTA PREVIA EN VIVO DE REDES Y CONTACTO
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                      {draft.socials.filter((s) => s.enabled).length} canales activos
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {draft.socials.filter((s) => s.enabled).map((s) => (
                      <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: draft.yellow || '#ffdc18' }}>
                      {draft.copy.socialHandle || '@masnetwork921'}
                    </span>
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>
                      WhatsApp: +{draft.whatsapp}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* TAB: EFECTOS Y FUNCIONES (TODOS CON INTERRUPTORES Y VISTA PREVIA) */}
            {tab === 'Efectos y funciones' && (
              <>
                <p className="hint">
                  Activa o desactiva con un botón cualquiera de las funciones y efectos en español, con vista previa y categorías especializadas.
                </p>

                {/* Categories & Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <input
                      type="text"
                      placeholder="Buscar función o efecto..."
                      value={effectFilter}
                      onChange={(e) => setEffectFilter(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(['Todas', 'Visuales', 'Interacción', 'Notificaciones', 'Distribución'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`admin-pill-btn ${effectCategory === cat ? 'primary' : ''}`}
                        onClick={() => setEffectCategory(cat)}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    className="admin-pill-btn"
                    onClick={() => {
                      const allOn = Object.keys(draft.effects).reduce((acc, k) => ({ ...acc, [k]: true }), {})
                      set('effects', allOn as never)
                    }}
                  >
                    Activar todos
                  </button>
                  <button
                    className="admin-pill-btn"
                    onClick={() => {
                      const allOff = Object.keys(draft.effects).reduce((acc, k) => ({ ...acc, [k]: false }), {})
                      set('effects', allOff as never)
                    }}
                  >
                    Desactivar todos
                  </button>
                </div>

                {/* Live Effects Sandbox Preview */}
                <div style={{ marginBottom: '14px', padding: '14px', borderRadius: '12px', background: `linear-gradient(135deg, ${draft.blue || '#072a69'}, #02122d)`, color: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: draft.yellow || '#ffdc18', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      DEMOSTRACIÓN EN VIVO DE EFECTOS VISUALES
                    </span>
                    <span style={{ fontSize: '10px', background: draft.yellow || '#ffdc18', color: '#072a69', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      ACTIVO
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="hero-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={draft.logo || '/img/logo.png'}
                        alt=""
                        className={`${draft.effects.logoPulse ? 'logo-pulse' : ''} ${draft.effects.rotatingLogo ? 'rotating-logo' : ''}`}
                        style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>
                        {draft.name} {draft.frequency}
                      </span>
                    </div>
                    <div className="waveform is-playing" style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <i
                          key={i}
                          style={{
                            height: `${8 + (i % 4) * 8}px`,
                            animationDelay: `${i * 0.1}s`,
                            background: draft.yellow || '#ffdc18',
                            display: 'inline-block',
                            width: '3px',
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 59+ Spanish Effects List */}
                <div className="edit-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <b style={{ fontSize: '13px', color: '#072a69' }}>
                      Catálogo de Efectos de Emisora ({effectList.filter((e) => (draft.effects as any)[e.key]).length} de {effectList.length} activos)
                    </b>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                    {effectList
                      .filter((item) => effectCategory === 'Todas' || item.category === effectCategory)
                      .filter((item) => !effectFilter || item.name.toLowerCase().includes(effectFilter.toLowerCase()) || item.desc.toLowerCase().includes(effectFilter.toLowerCase()))
                      .map((item) => {
                        const isEnabled = Boolean((draft.effects as any)[item.key])
                        return (
                          <div
                            key={item.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              background: isEnabled ? '#f8faff' : '#f8fafc',
                              border: `1px solid ${isEnabled ? '#93c5fd' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              gap: '10px',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: isEnabled ? '#22c55e' : '#cbd5e1',
                                    boxShadow: isEnabled ? '0 0 6px #22c55e' : 'none',
                                    flexShrink: 0,
                                  }}
                                />
                                <strong style={{ fontSize: '12px', color: isEnabled ? '#072a69' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.name}
                                </strong>
                              </div>
                              <p style={{ margin: '2px 0 0 13px', fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
                                {item.desc}
                              </p>
                              {item.guide && (
                                <div style={{ margin: '4px 0 0 13px', padding: '4px 8px', background: '#eff6ff', borderRadius: '6px', fontSize: '10px', color: '#1e40af', lineHeight: 1.35, borderLeft: '2px solid #3b82f6' }}>
                                  <strong style={{ color: '#1d4ed8' }}>💡 Guía: </strong>{item.guide}
                                </div>
                              )}
                            </div>
                            <label className="modern-switch" style={{ flexShrink: 0 }}>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) =>
                                  set('effects', { ...draft.effects, [item.key]: e.target.checked })
                                }
                              />
                              <span className="modern-switch-slider" />
                            </label>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Flags / General features */}
                <div className="edit-card" style={{ marginTop: '16px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '10px' }}>
                    Opciones de Sistema y Avisos en Pantalla
                  </b>
                  <div className="switch-grid">
                    {Object.entries(draft.flags)
                      .filter(([key]) => !effectFilter || (labels[key] || key).toLowerCase().includes(effectFilter.toLowerCase()))
                      .map(([key, value]) => (
                        <label className="toggle" key={key}>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              set('flags', { ...draft.flags, [key]: e.target.checked })
                            }
                          />
                          {labels[key] || key}
                        </label>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: MODO CINE (PANTALLA COMPLETA TOTALMENTE EDITABLE) */}
            {tab === 'Modo cine' && (
              <>
                <p className="hint">
                  Personaliza todos los textos, logotipo, efectos y controles que se muestran en el modo pantalla completa (Modo Cine).
                </p>

                {/* Text customization for cinema mode */}
                <div className="edit-card" style={{ marginBottom: '16px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Textos del Modo Pantalla Completa
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label className="field">
                      Título en pantalla completa
                      <input
                        type="text"
                        value={draft.cinema.title || ''}
                        placeholder={draft.name + ' ' + draft.frequency}
                        onChange={(e) =>
                          set('cinema', { ...draft.cinema, title: e.target.value })
                        }
                      />
                    </label>
                    <label className="field">
                      Subtítulo / Eslogan en pantalla completa
                      <input
                        type="text"
                        value={draft.cinema.subtitle || ''}
                        placeholder="¡Medio Palo! • La radio que te acompaña"
                        onChange={(e) =>
                          set('cinema', { ...draft.cinema, subtitle: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="field" style={{ marginTop: '10px' }}>
                    Texto del cintillo de noticias en modo cine
                    <input
                      type="text"
                      value={draft.cinema.tickerText || ''}
                      placeholder={draft.ticker}
                      onChange={(e) =>
                        set('cinema', { ...draft.cinema, tickerText: e.target.value })
                      }
                    />
                  </label>
                </div>

                {/* Logo and visual styling for cinema */}
                <div className="edit-card" style={{ marginBottom: '16px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Logotipo y Apariencia del Modo Pantalla Completa
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <label className="field">
                      URL del Logo para pantalla completa
                      <input
                        type="text"
                        value={draft.cinema.logoUrl || ''}
                        placeholder={draft.logo}
                        onChange={(e) =>
                          set('cinema', { ...draft.cinema, logoUrl: e.target.value })
                        }
                      />
                    </label>
                    <label className="field">
                      Tipografía del Modo Cine
                      <select
                        value={draft.cinema.font || 'Neuropol X'}
                        onChange={(e) =>
                          set('cinema', { ...draft.cinema, font: e.target.value })
                        }
                      >
                        {availableFonts.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.name} ({f.category})
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="color-picker-box">
                      <label>Color de texto en cine</label>
                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={draft.cinema.textColor || '#ffffff'}
                          onChange={(e) =>
                            set('cinema', { ...draft.cinema, textColor: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          value={draft.cinema.textColor || '#ffffff'}
                          onChange={(e) =>
                            set('cinema', { ...draft.cinema, textColor: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="color-picker-box">
                      <label>Color de acento en cine</label>
                      <div className="color-picker-input-wrap">
                        <input
                          type="color"
                          value={draft.cinema.accentColor || draft.yellow}
                          onChange={(e) =>
                            set('cinema', { ...draft.cinema, accentColor: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          value={draft.cinema.accentColor || draft.yellow}
                          onChange={(e) =>
                            set('cinema', { ...draft.cinema, accentColor: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elements and effects switches */}
                <div className="edit-card" style={{ marginBottom: '16px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Elementos y Efectos a Mostrar en Pantalla Completa
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {[
                      { key: 'logo', label: 'Logotipo de la emisora' },
                      { key: 'player', label: 'Controles y botón de reproducción' },
                      { key: 'ticker', label: 'Cintillo de noticias inferior' },
                      { key: 'socials', label: 'Barra de redes sociales' },
                      { key: 'equalizer', label: 'Ecualizador de audio dinámico' },
                      { key: 'glow', label: 'Resplandor y halo luminoso' },
                      { key: 'particles', label: 'Partículas de audio flotantes' },
                      { key: 'notes', label: 'Notas musicales flotantes' },
                    ].map(({ key, label }) => {
                      const checked = (draft.cinema as any)[key] !== false
                      return (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: checked ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${checked ? '#bbf7d0' : '#e2e8f0'}`,
                            borderRadius: '8px',
                          }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 600, color: checked ? '#166534' : '#475569' }}>
                            {label}
                          </span>
                          <label className="modern-switch">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                set('cinema', { ...draft.cinema, [key]: e.target.checked })
                              }
                            />
                            <span className="modern-switch-slider" />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Live Cinema Preview */}
                <div
                  className="edit-card"
                  style={{
                    background: '#072a69',
                    color: draft.cinema.textColor || '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    fontFamily: draft.cinema.font ? `'${draft.cinema.font}', sans-serif` : undefined,
                    boxShadow: draft.cinema.glow ? '0 0 30px rgba(255, 220, 24, 0.3)' : '0 10px 30px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ position: 'absolute', top: '10px', left: '14px', fontSize: '10px', color: '#93c5fd', letterSpacing: '1px' }}>
                    VISTA PREVIA MODO PANTALLA COMPLETA
                  </span>
                  {draft.cinema.logo !== false && (
                    <img
                      src={draft.cinema.logoUrl || draft.logo}
                      alt=""
                      style={{ maxHeight: '75px', margin: '14px auto 10px', objectFit: 'contain' }}
                    />
                  )}
                  <h2 style={{ fontSize: '20px', margin: '4px 0', color: draft.cinema.textColor || '#fff' }}>
                    {draft.cinema.title || `${draft.name} ${draft.frequency}`}
                  </h2>
                  {draft.cinema.subtitle && (
                    <p style={{ color: draft.cinema.accentColor || draft.yellow, fontSize: '13px', margin: '0 0 10px 0', fontWeight: 600 }}>
                      {draft.cinema.subtitle}
                    </p>
                  )}
                  {draft.cinema.equalizer !== false && (
                    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', margin: '10px 0' }}>
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span
                          key={i}
                          style={{
                            width: '3px',
                            height: `${8 + (i % 5) * 6}px`,
                            background: draft.cinema.accentColor || draft.yellow,
                            borderRadius: '2px',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {draft.cinema.ticker !== false && (
                    <div style={{ fontSize: '10px', color: '#cbd5e1', letterSpacing: '1px', marginTop: '8px' }}>
                      {draft.cinema.tickerText || draft.ticker}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB: TIPOGRAFÍA (30+ FUENTES, NEUROPOL X, VISTA PREVIA EN VIVO) */}
            {tab === 'Tipografía' && (
              <>
                <p className="hint">
                  Explora más de 30 familias tipográficas modernas y futuristas (incluyendo Neuropol X) con vista previa en vivo y asignación por sección.
                </p>

                {/* 1. SECTION/TEXT TARGET SELECTOR */}
                <div className="edit-card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <b style={{ fontSize: '13px', color: '#072a69' }}>
                      1. Selecciona la Sección o Texto a Personalizar:
                    </b>
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                      ⚡ Todos los cambios se aplican en tiempo real
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {typoTargets.map((t) => {
                      const isTargetActive = typoTarget === t.id
                      const hasCustomFont = t.id === 'global' ? false : !!draft.sectionStyles?.[t.id]?.font
                      const hasCustomColor = t.id === 'global' ? false : !!draft.sectionStyles?.[t.id]?.textColor
                      const hasCustomSize = t.id === 'global' ? false : !!draft.sectionStyles?.[t.id]?.size
                      const hasOverrides = hasCustomFont || hasCustomColor || hasCustomSize
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`admin-pill-btn ${isTargetActive ? 'primary' : ''}`}
                          style={{
                            fontSize: '11px',
                            padding: '6px 12px',
                            position: 'relative',
                            border: isTargetActive ? '2px solid #072a69' : '1px solid #cbd5e1',
                          }}
                          onClick={() => {
                            setTypoTarget(t.id)
                            setTypoBgDark(t.isDark)
                          }}
                        >
                          {t.label}
                          {hasOverrides && (
                            <span
                              style={{
                                display: 'inline-block',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#f59e0b',
                                marginLeft: '5px',
                              }}
                              title="Tiene personalizaciones activas"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. REAL-TIME CONTROLS FOR SELECTED TARGET */}
                {(() => {
                  const currentTarget = typoTargets.find((t) => t.id === typoTarget) || typoTargets[0]
                  const isGlobal = typoTarget === 'global'
                  const activeFont = isGlobal ? draft.font : (draft.sectionStyles?.[typoTarget]?.font || draft.font)
                  const activeSize = isGlobal ? draft.fontSize : (draft.sectionStyles?.[typoTarget]?.size || currentTarget.defaultSize)
                  const activeColor = draft.sectionStyles?.[typoTarget]?.textColor || (currentTarget.isDark ? '#ffffff' : '#072a69')
                  const activeWeight = draft.sectionStyles?.[typoTarget]?.weight || (typoTarget === 'heroTitle' ? '800' : '600')
                  const activeTransform = draft.sectionStyles?.[typoTarget]?.transform || (typoTarget === 'heroTitle' ? 'uppercase' : 'none')

                  const handleSizeChange = (newSize: number) => {
                    const clamped = Math.max(currentTarget.minSize, Math.min(currentTarget.maxSize, newSize))
                    if (isGlobal) {
                      set('fontSize', clamped)
                    } else {
                      setSectionStyle(typoTarget, 'size', clamped)
                    }
                  }

                  const handleColorChange = (newColor: string) => {
                    if (isGlobal) {
                      set('pageBackground', newColor)
                    } else {
                      setSectionStyle(typoTarget, 'textColor', newColor)
                    }
                  }

                  const handleResetSection = () => {
                    if (isGlobal) {
                      set('font', 'Outfit' as never)
                      set('fontSize', 16)
                    } else {
                      setSectionStyle(typoTarget, 'font', undefined)
                      setSectionStyle(typoTarget, 'size', undefined)
                      setSectionStyle(typoTarget, 'textColor', undefined)
                      setSectionStyle(typoTarget, 'weight', undefined)
                      setSectionStyle(typoTarget, 'transform', undefined)
                    }
                    toast.success(`Valores restablecidos para ${currentTarget.label}`)
                  }

                  return (
                    <div className="edit-card" style={{ marginBottom: '16px', border: '2px solid #072a69', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#072a69' }}>
                            Editando: {currentTarget.label}
                          </strong>
                          <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>
                            Fuente actual: {activeFont} • Tamaño: {activeSize}px • Color: {activeColor}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="admin-pill-btn"
                          onClick={handleResetSection}
                          style={{ fontSize: '11px', color: '#ef4444', borderColor: '#fca5a5' }}
                        >
                          <RotateCcw size={12} /> Restablecer a original
                        </button>
                      </div>

                      {/* Main Adjusters Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* Font Selector */}
                        <label className="field">
                          Tipografía asignada (32 disponibles)
                          <select
                            value={activeFont}
                            onChange={(e) => {
                              const fName = e.target.value
                              if (isGlobal) {
                                set('font', fName as never)
                              } else {
                                setSectionStyle(typoTarget, 'font', fName)
                              }
                              toast.success(`Fuente cambiada a ${fName}`)
                            }}
                          >
                            {availableFonts.map((f) => (
                              <option key={f.name} value={f.name}>
                                {f.name} ({f.category}){f.name.includes('Neuropol') ? ' ★' : ''}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* Font Size Slider and +/- Stepper */}
                        <div className="field">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                              Tamaño de letra: <strong>{activeSize}px</strong>
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="admin-pill-btn"
                                style={{ padding: '2px 8px', fontSize: '12px', minWidth: '24px' }}
                                onClick={() => handleSizeChange(activeSize - 1)}
                                title="Reducir 1px"
                              >
                                −
                              </button>
                              <button
                                type="button"
                                className="admin-pill-btn"
                                style={{ padding: '2px 8px', fontSize: '12px', minWidth: '24px' }}
                                onClick={() => handleSizeChange(activeSize + 1)}
                                title="Aumentar 1px"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={currentTarget.minSize}
                            max={currentTarget.maxSize}
                            value={activeSize}
                            onChange={(e) => handleSizeChange(Number(e.target.value))}
                          />
                          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                            {[
                              { label: 'Pequeño', val: Math.round(currentTarget.defaultSize * 0.75) },
                              { label: 'Normal', val: currentTarget.defaultSize },
                              { label: 'Grande', val: Math.round(currentTarget.defaultSize * 1.25) },
                              { label: 'Gigante', val: Math.round(currentTarget.defaultSize * 1.6) },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                className={`admin-pill-btn ${activeSize === preset.val ? 'primary' : ''}`}
                                style={{ fontSize: '10px', padding: '2px 6px', flex: 1 }}
                                onClick={() => handleSizeChange(preset.val)}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Controls */}
                        <div className="field">
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>
                            Color del texto
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={activeColor.startsWith('#') ? activeColor : '#ffffff'}
                              onChange={(e) => handleColorChange(e.target.value)}
                              style={{ width: '40px', height: '32px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              value={activeColor}
                              onChange={(e) => handleColorChange(e.target.value)}
                              placeholder="#ffffff"
                              style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}
                            />
                          </div>
                          {/* Color Palette Presets */}
                          <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {[
                              { hex: '#ffffff', title: 'Blanco' },
                              { hex: '#ffdc18', title: 'Amarillo' },
                              { hex: '#072a69', title: 'Azul' },
                              { hex: '#1595e5', title: 'Celeste' },
                              { hex: '#0f172a', title: 'Negro' },
                              { hex: '#94a3b8', title: 'Gris' },
                              { hex: '#f59e0b', title: 'Dorado' },
                              { hex: '#22c55e', title: 'Verde' },
                            ].map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                title={c.title}
                                onClick={() => handleColorChange(c.hex)}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: c.hex,
                                  border: activeColor.toLowerCase() === c.hex.toLowerCase() ? '2px solid #000' : '1px solid #cbd5e1',
                                  boxShadow: activeColor.toLowerCase() === c.hex.toLowerCase() ? '0 0 0 2px #fff' : 'none',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Weight and Transform */}
                        <div className="field">
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>
                            Grosor y Mayúsculas
                          </span>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                            {[
                              { label: 'Normal', val: '400' },
                              { label: 'Semi', val: '600' },
                              { label: 'Bold', val: '700' },
                              { label: 'Ultra', val: '800' },
                            ].map((w) => (
                              <button
                                key={w.label}
                                type="button"
                                className={`admin-pill-btn ${activeWeight === w.val ? 'primary' : ''}`}
                                style={{ fontSize: '10px', padding: '4px 6px', flex: 1 }}
                                onClick={() => setSectionStyle(typoTarget, 'weight', w.val)}
                              >
                                {w.label}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className={`admin-pill-btn ${activeTransform === 'uppercase' ? 'primary' : ''}`}
                            style={{ fontSize: '11px', width: '100%', padding: '5px' }}
                            onClick={() => setSectionStyle(typoTarget, 'transform', activeTransform === 'uppercase' ? 'none' : 'uppercase')}
                          >
                            {activeTransform === 'uppercase' ? '✓ EN MAYÚSCULAS' : 'En formato normal'}
                          </button>
                        </div>
                      </div>

                      {/* 3. DEDICATED LIVE PREVIEW BOX FOR THIS TARGET */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#072a69', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                            VISTA PREVIA EN VIVO DE ESTA SECCIÓN / TEXTO:
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>Superficie:</span>
                            <button
                              type="button"
                              className={`admin-pill-btn ${typoBgDark ? 'primary' : ''}`}
                              style={{ fontSize: '10px', padding: '3px 8px' }}
                              onClick={() => setTypoBgDark(true)}
                            >
                              🌙 Fondo Azul Oscuro
                            </button>
                            <button
                              type="button"
                              className={`admin-pill-btn ${!typoBgDark ? 'primary' : ''}`}
                              style={{ fontSize: '10px', padding: '3px 8px' }}
                              onClick={() => setTypoBgDark(false)}
                            >
                              ☀️ Fondo Claro
                            </button>
                          </div>
                        </div>

                        {/* Rendered Live Preview Card */}
                        <div
                          style={{
                            background: typoBgDark ? '#072a69' : '#ffffff',
                            color: activeColor,
                            fontFamily: resolveFontFamily(activeFont),
                            fontSize: `${activeSize}px`,
                            fontWeight: activeWeight,
                            textTransform: activeTransform as any,
                            padding: '24px 20px',
                            borderRadius: '12px',
                            minHeight: '110px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            lineHeight: 1.15,
                            border: typoBgDark ? '1px solid #1e40af' : '1px solid #cbd5e1',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'pre-line',
                            wordBreak: 'break-word',
                          }}
                        >
                          {fontPreviewText || currentTarget.sample}
                        </div>

                        <div style={{ marginTop: '10px' }}>
                          <label className="field">
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Escribe un texto personalizado para probar esta tipografía y tamaño:
                            </span>
                            <input
                              type="text"
                              value={fontPreviewText}
                              onChange={(e) => setFontPreviewText(e.target.value)}
                              placeholder={currentTarget.sample.replace(/\n/g, ' ')}
                              style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '8px' }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. 30+ FONTS GALLERY WITH SEARCH & CATEGORIES */}
                <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '8px' }}>
                    2. Catálogo de más de 30 Familias Tipográficas (haz clic para probar o asignar):
                  </b>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                      <input
                        type="text"
                        placeholder="Buscar fuente por nombre..."
                        value={fontFilter}
                        onChange={(e) => setFontFilter(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Todas', 'Futuristas', 'Modernas', 'Display', 'Urbanas', 'Clásicas'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`admin-pill-btn ${fontCategory === cat ? 'primary' : ''}`}
                          onClick={() => setFontCategory(cat)}
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {availableFonts
                      .filter((f) => fontCategory === 'Todas' || f.category === fontCategory)
                      .filter((f) => !fontFilter || f.name.toLowerCase().includes(fontFilter.toLowerCase()))
                      .map((font) => {
                        const isGlobalSelected = draft.font === font.name
                        const currentTarget = typoTargets.find((t) => t.id === typoTarget) || typoTargets[0]
                        const isSectionSelected = typoTarget === 'global' ? isGlobalSelected : draft.sectionStyles?.[typoTarget]?.font === font.name
                        const isNeuropol = font.name.includes('Neuropol')
                        return (
                          <div
                            key={font.name}
                            style={{
                              padding: '14px',
                              background: isNeuropol ? '#fffbeb' : isSectionSelected ? '#eff6ff' : '#ffffff',
                              border: `2px solid ${isNeuropol ? '#f59e0b' : isSectionSelected ? '#072a69' : '#e2e8f0'}`,
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              boxShadow: isNeuropol ? '0 4px 14px rgba(245, 158, 11, 0.2)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '13px', color: '#072a69' }}>
                                  {font.name}
                                </strong>
                                {isNeuropol && (
                                  <span style={{ marginLeft: '6px', background: '#f59e0b', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    ★ RECOMENDADA
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {font.category}
                              </span>
                            </div>

                            {/* Live preview in font's exact family */}
                            <div
                              style={{
                                fontFamily: font.family,
                                fontSize: isNeuropol ? '17px' : '16px',
                                lineHeight: 1.3,
                                color: '#072a69',
                                padding: '10px',
                                background: isNeuropol ? '#fef3c7' : '#f8fafc',
                                borderRadius: '8px',
                                minHeight: '52px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {fontPreviewText || 'Más Network 92.1 FM • ¡Medio Palo!'}
                            </div>

                            <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                              {typoTarget !== 'global' && (
                                <button
                                  type="button"
                                  className={`admin-pill-btn ${isSectionSelected ? 'primary' : ''}`}
                                  style={{ flex: 1, minWidth: '120px', fontSize: '11px', padding: '6px' }}
                                  onClick={() => {
                                    setSectionStyle(typoTarget, 'font', font.name)
                                    toast.success(`Fuente ${font.name} asignada a ${currentTarget.label}`)
                                  }}
                                >
                                  {isSectionSelected ? '✓ Asignada a sección activa' : `Asignar a ${currentTarget.label.split('—')[0]}`}
                                </button>
                              )}
                              <button
                                type="button"
                                className={`admin-pill-btn ${isGlobalSelected ? 'primary' : ''}`}
                                style={{ fontSize: '10px', padding: '6px 8px' }}
                                onClick={() => {
                                  set('font', font.name as never)
                                  toast.success(`Fuente principal general cambiada a ${font.name}`)
                                }}
                                title="Aplicar como fuente base en toda la app"
                              >
                                {isGlobalSelected ? '✓ Global' : 'Usar en toda la app'}
                              </button>
                              <select
                                style={{ fontSize: '10px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                onChange={(e) => {
                                  const sec = e.target.value
                                  if (sec) {
                                    setSectionStyle(sec, 'font', font.name)
                                    toast.success(`Fuente ${font.name} asignada a ${sec}`)
                                    e.target.value = ''
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>Aplicar a otra sección...</option>
                                <option value="heroTitle">Portada Título</option>
                                <option value="heroText">Portada Texto</option>
                                <option value="ticker">Cintillo Ticker</option>
                                <option value="header">Cabecera</option>
                                <option value="carousel">Carrusel</option>
                                <option value="schedule">Programación</option>
                                <option value="requests">Pedidos</option>
                                <option value="info">Información</option>
                                <option value="socials">Redes</option>
                                <option value="stickyPlayer">Reproductor Flotante</option>
                              </select>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </>
            )}

            {/* TAB: TEXTOS */}
            {tab === 'Textos' && (
              <>
                <p className="hint">
                  Edita todos los títulos, botones y mensajes textuales de la aplicación.
                </p>

                {/* Vista previa en vivo de Textos */}
                <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', background: `linear-gradient(135deg, ${draft.blue || '#072a69'}, #031433)`, color: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                  <span style={{ fontSize: '11px', color: draft.yellow || '#ffdc18', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    VISTA PREVIA EN VIVO DE TEXTOS Y BOTONES:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <small style={{ color: draft.yellow || '#ffdc18', fontSize: '10px', fontWeight: 700 }}>{draft.copy.highlightsEyebrow || 'DESTACADOS'}</small>
                      <h4 style={{ margin: '2px 0 0', fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>{draft.copy.highlightsHeading || 'Novedades'}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: draft.yellow || '#ffdc18', color: '#072a69', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '11px' }}>
                        {draft.copy.liveButton || 'Escuchar'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '11px', border: '1px solid rgba(255,255,255,0.25)' }}>
                        {draft.copy.scheduleButton || 'Programación'}
                      </span>
                    </div>
                  </div>
                </div>

                {Object.entries(draft.copy).map(([key, value]) => (
                  <label className="field" key={key}>
                    {(
                      {
                        liveButton: 'Botón de escuchar',
                        scheduleButton: 'Botón de programación',
                        highlightsHeading: 'Título de novedades',
                        highlightsEyebrow: 'Etiqueta de novedades',
                        requestHeading: 'Título de pedidos',
                        requestText: 'Descripción de pedidos',
                        requestButton: 'Botón de pedidos',
                        scheduleHeading: 'Título de programación',
                        scheduleText: 'Descripción de programación',
                        installHeading: 'Título de instalación',
                        installText: 'Descripción de instalación',
                        installButton: 'Botón de instalación',
                        infoHeading: 'Título de la emisora',
                        infoText: 'Descripción de la emisora',
                        socialsHeading: 'Título de redes',
                        socialHandle: 'Nombre en redes',
                        footerText: 'Pie de página',
                        radioStatusText: 'Texto Radio Online',
                        radioStatusOfflineText: 'Texto Sin Señal',
                        radioStatusAdminBadge: 'Placa Admin',
                      } as Record<string, string>
                    )[key] || key}
                    <textarea
                      value={value}
                      rows={2}
                      onChange={(e) =>
                        set('copy', { ...draft.copy, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="admin-bottom">
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <span>
            {dirty ? '● Cambios sin publicar' : '✓ Todos los cambios guardados'}
          </span>
          <div>
            <button
              className="button secondary small"
              disabled={busy}
              onClick={() => {
                onLiveChange?.(station)
                setDraft(structuredClone(station))
                setDirty(false)
                setError('')
                onClose()
              }}
            >
              Descartar / Cerrar
            </button>
            <button
              className="button primary small"
              disabled={busy || !dirty}
              onClick={save}
            >
              <Save size={16} />
              {busy ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              className="icon-button"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              onClick={async () => {
                await fetch('/api/auth', { method: 'DELETE' })
                onClose()
                toast.info('Sesión cerrada')
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

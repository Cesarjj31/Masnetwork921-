import { useState } from 'react'
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
import { dayNames } from '@/lib/station'


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

export function AdminPanel({
  open,
  onClose,
  station,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  station: Station
  onSaved: (s: Station) => void
}) {
  const [tab, setTab] = useState('Identidad'),
    [draft, setDraft] = useState<Station>(structuredClone(station)),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState('')

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
  })
  const [isAddingSlide, setIsAddingSlide] = useState(false)

  // State for expanded section color customizer
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [effectFilter, setEffectFilter] = useState('')


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
    setSlideForm({ title: '', subtitle: '', url: '', type: 'image', link: '' })
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

                        <button
                          className="admin-pill-btn"
                          style={{ alignSelf: 'flex-end' }}
                          onClick={() => {
                            setSectionStyle(key, 'background', undefined)
                            setSectionStyle(key, 'textColor', undefined)
                            setSectionStyle(key, 'borderColor', undefined)
                          }}
                        >
                          <RotateCcw size={12} /> Restablecer
                        </button>
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
                  Define la identidad cromática global y personaliza los colores de cada sección individual.
                </p>

                <div className="edit-card">
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '12px' }}>
                    Paleta Principal de Más Network
                  </b>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
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

                <div className="appearance-preview" style={{ background: draft.blue, color: '#fff', borderRadius: `${draft.radius}px`, padding: '24px' }}>
                  <span style={{ color: draft.yellow, letterSpacing: '2px', fontWeight: 700, fontSize: '12px' }}>
                    MÁS NETWORK 92.1 FM
                  </span>
                  <strong style={{ fontSize: '28px', color: '#fff' }}>¡El auténtico Medio Palo!</strong>
                  <button
                    className="button"
                    style={{ background: draft.yellow, color: '#072a69', fontWeight: 800, borderRadius: `${draft.radius}px`, padding: '8px 20px', border: 'none' }}
                  >
                    Escuchar en vivo
                  </button>
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

            {/* TAB: CARRUSELES (AGREGAR, EDITAR, ELIMINAR, ORDENAR) */}
            {tab === 'Carruseles' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p className="hint" style={{ margin: 0 }}>
                    Fotografías, promociones y videos en el carrusel interactivo.
                  </p>
                  <button
                    className="admin-pill-btn primary"
                    onClick={() => {
                      setSlideForm({ title: '', subtitle: '', url: '', type: 'image', link: '' })
                      setIsAddingSlide(true)
                      setEditingSlideId(null)
                    }}
                  >
                    <Plus size={15} /> Agregar Diapositiva
                  </button>
                </div>

                {/* Form to add or edit slide */}
                {(isAddingSlide || editingSlideId) && (
                  <div className="edit-card" style={{ border: '2px solid #072a69', background: '#f0f5ff' }}>
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
                            style={{ width: '65px', height: '45px', objectFit: 'cover', borderRadius: '6px', background: '#e2e8f0' }}
                          />
                          <div>
                            <strong style={{ fontSize: '13px', color: '#17345e', display: 'block' }}>
                              {s.title || 'Sin título'}
                            </strong>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              {s.subtitle || s.url} • <span style={{ textTransform: 'uppercase' }}>{s.type}</span>
                            </small>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              </>
            )}

            {/* TAB: EFECTOS Y FUNCIONES (TODOS CON INTERRUPTORES) */}
            {tab === 'Efectos y funciones' && (
              <>
                <p className="hint">
                  Activa o desactiva con un botón cualquiera de las 59 funciones y efectos visuales, interactivos y sonoros.
                </p>

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

                {/* Flags / General features */}
                <div className="edit-card">
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '10px' }}>
                    Opciones de Sistema y Avisos
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

                {/* 59 Effects from effectGroups */}
                <div className="edit-card" style={{ marginTop: '14px' }}>
                  <b style={{ fontSize: '13px', color: '#072a69', display: 'block', marginBottom: '10px' }}>
                    Efectos Visuales e Interactivos
                  </b>
                  <div className="switch-grid">
                    {Object.entries(draft.effects)
                      .filter(([key]) => !effectFilter || (labels[key] || key).toLowerCase().includes(effectFilter.toLowerCase()))
                      .map(([key, value]) => (
                        <label className="toggle" key={key}>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              set('effects', { ...draft.effects, [key]: e.target.checked })
                            }
                          />
                          {labels[key] || key}
                        </label>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: MODO CINE */}
            {tab === 'Modo cine' && (
              <>
                <p className="hint">
                  El botón de pantalla completa abre el modo cine. Activa o desactiva con un botón los elementos que aparecen en él.
                </p>
                <div className="edit-card">
                  {Object.entries(draft.cinema).map(([key, v]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                        {
                          (
                            {
                              logo: 'Logo de la emisora en pantalla completa',
                              ticker: 'Cintillo de noticias en modo cine',
                              player: 'Controles de reproducción',
                              socials: 'Enlaces de redes sociales',
                              notes: 'Animación de notas musicales flotantes',
                            } as Record<string, string>
                          )[key] || key
                        }
                      </span>
                      <label className="modern-switch">
                        <input
                          type="checkbox"
                          checked={v}
                          onChange={(e) =>
                            set('cinema', { ...draft.cinema, [key]: e.target.checked })
                          }
                        />
                        <span className="modern-switch-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB: TIPOGRAFIA */}
            {tab === 'Tipografía' && (
              <>
                <p className="hint">
                  Familias tipográficas y proporciones para lectura y títulos.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="field">
                    Fuente de lectura
                    <select
                      value={draft.font}
                      onChange={(e) => set('font', e.target.value as never)}
                    >
                      <option value="Outfit">Outfit (Oficial Más Network)</option>
                      <option value="Barlow Condensed">Barlow Condensed</option>
                      <option value="Georgia">Georgia (Serif)</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </label>
                  <label className="field">
                    Tamaño base ({draft.fontSize}px)
                    <input
                      type="range"
                      min="13"
                      max="22"
                      value={draft.fontSize}
                      onChange={(e) => set('fontSize', Number(e.target.value))}
                    />
                  </label>
                </div>
              </>
            )}

            {/* TAB: TEXTOS */}
            {tab === 'Textos' && (
              <>
                <p className="hint">
                  Edita todos los títulos, botones y mensajes textuales de la aplicación.
                </p>
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

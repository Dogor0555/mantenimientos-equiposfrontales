'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { OPERADORES, EQUIPOS, TURNOS } from '@/lib/constants'
import clsx from 'clsx'
import { 
  FaTractor, FaCalendarAlt, FaUser, FaClock, FaTachometerAlt,
  FaOilCan, FaWind, FaCamera, FaCheckCircle, FaTimesCircle,
  FaTrash, FaPlus, FaChartLine, FaTools, FaClipboardList,
  FaTint, FaSnowflake, FaPlug, FaHardHat, FaCar,
  FaLightbulb, FaBell, FaVolumeUp, FaBroom, FaLock, FaEye,
  FaFireExtinguisher, FaShieldAlt, FaCircle, FaCog,
  FaClipboardCheck, FaWrench, FaWater, FaGripLines, FaArrowUp, FaArrowDown,
  FaBalanceScale, FaOilCan as FaOilDrop, FaRoad, FaHands,
  FaDesktop, FaEye as FaEyeIcon, FaCogs
} from 'react-icons/fa'
import { MdOutlineStickyNote2 } from 'react-icons/md'
import { IoIosWarning } from 'react-icons/io'

type Props = { equipoPreseleccionado: string | null }
type TipoRegistro = 'checklist' | 'mantenimiento' | null

// Items de checklist GENERAL (para equipos que NO son montacargas)
const ITEMS_CHECKLIST_GENERAL = [
  { id: 'estado_llantas', label: 'Estado general de llantas', icon: FaCircle },
  { id: 'presion_llantas', label: 'Presión adecuada de llantas', icon: FaTachometerAlt },
  { id: 'nivel_aceite_motor', label: 'Nivel de aceite del motor', icon: FaOilCan },
  { id: 'nivel_aceite_hidraulico', label: 'Nivel de aceite hidráulico', icon: FaTint },
  { id: 'nivel_refrigerante', label: 'Nivel de refrigerante', icon: FaSnowflake },
  { id: 'fugas_visibles', label: 'Fugas visibles (motor / hidráulico / combustible)', icon: FaTint },
  { id: 'mangueras_sin_fuga', label: 'Mangueras sin fuga', icon: FaPlug },
  { id: 'cilindros_hidraulicos', label: 'Cilindros hidráulicos sin fugas', icon: FaHardHat },
  { id: 'cucharon_buen_estado', label: 'Cucharón en buen estado', icon: FaShieldAlt },
  { id: 'frenos_operativos', label: 'Sistema de frenos operativo', icon: FaCar },
  { id: 'direccion_sin_juego', label: 'Dirección sin juego excesivo', icon: FaCircle },
  { id: 'luces_delanteras_traseras', label: 'Luces delanteras y traseras', icon: FaLightbulb },
  { id: 'alarma_retroceso', label: 'Alarma de retroceso', icon: FaBell },
  { id: 'bocina_funcional', label: 'Bocina funcional', icon: FaVolumeUp },
  { id: 'cabina_limpia', label: 'Cabina limpia y ordenada', icon: FaBroom },
  { id: 'cinturon_seguridad', label: 'Cinturón de seguridad funcional', icon: FaLock },
  { id: 'espejos_retrovisores', label: 'Espejos retrovisores completos', icon: FaEye },
  { id: 'extintor_presente', label: 'Extintor presente y con carga', icon: FaFireExtinguisher },
  { id: 'chasis_sin_daños', label: 'Chasis y estructura sin daños', icon: FaShieldAlt },
  { id: 'guardas_protecciones', label: 'Guardas y protecciones instaladas', icon: FaTools },
]

// Items de checklist específicos para MONTACARGAS (Toyota / Caterpillar)
const ITEMS_CHECKLIST_MONTACARGA = [
  { id: 'estado_llantas', label: 'Llantas sin cortes, grietas o desgaste excesivo', icon: FaCircle },
  { id: 'horquillas_rectas', label: 'Horquillas rectas', icon: FaGripLines },
  { id: 'seguro_horquillas_instalado', label: 'Seguro de horquillas instalado', icon: FaLock },
  { id: 'mastil_sin_daños', label: 'Mástil sin daños', icon: FaArrowUp },
  { id: 'cadenas_lubricadas', label: 'Cadenas lubricadas', icon: FaOilDrop },
  { id: 'aceite_hidraulico_correcto', label: 'Nivel de aceite hidráulico correcto', icon: FaOilDrop },
  { id: 'mangueras_conexiones_sin_fugas', label: 'Mangueras y conexiones sin fugas', icon: FaPlug },
  { id: 'elevacion_descenso_suave', label: 'Elevación y descenso suave', icon: FaArrowUp },
  { id: 'inclinacion_funciona', label: 'Inclinación funciona correctamente', icon: FaBalanceScale },
  { id: 'freno_responde', label: 'Freno responde correctamente', icon: FaCar },
  { id: 'freno_estacionamiento_funciona', label: 'Freno de estacionamiento funciona', icon: FaHands },
  { id: 'cinturon_seguridad', label: 'Cinturón de seguridad funcional', icon: FaLock },
  { id: 'bocina_audible', label: 'Bocina audible', icon: FaVolumeUp },
  { id: 'luces_operativas', label: 'Luces delanteras y traseras operativas', icon: FaLightbulb },
  { id: 'espejos_buen_estado', label: 'Espejos en buen estado', icon: FaEyeIcon },
  { id: 'palancas_operan_correctamente', label: 'Palancas operan correctamente', icon: FaCogs },
]

// Equipos que usan checklist de montacarga
const EQUIPOS_MONTACARGA = ['MONTACARGA_TOYOTA', 'MONTACARGA_CATERPILLAR']

export default function FormRegistroPublico({ equipoPreseleccionado }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const hoy = new Date().toISOString().split('T')[0]

  const [tipo, setTipo] = useState<TipoRegistro>(null)
  const [fecha, setFecha] = useState(hoy)
  const [turno, setTurno] = useState('')
  const [operador, setOperador] = useState('')
  const [equipo, setEquipo] = useState(equipoPreseleccionado ?? '')
  const [odometro, setOdometro] = useState<string>('')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [fotosFiles, setFotosFiles] = useState<File[]>([])
  const [fotosPreviews, setFotosPreviews] = useState<string[]>([])
  
  // Determinar si el equipo actual es montacarga
  const esMontacarga = EQUIPOS_MONTACARGA.includes(equipo)
  
  // Seleccionar los items según el equipo
  const itemsChecklistActual = esMontacarga ? ITEMS_CHECKLIST_MONTACARGA : ITEMS_CHECKLIST_GENERAL
  
  // Inicializar checklist según el tipo de equipo
  const [checklist, setChecklist] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    itemsChecklistActual.forEach(item => { initial[item.id] = 'pendiente' })
    return initial
  })
  
  const [obsChecklist, setObsChecklist] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    itemsChecklistActual.forEach(item => { initial[item.id] = '' })
    return initial
  })

  // Actualizar checklist cuando cambia el equipo (montacarga vs general)
  useEffect(() => {
    const nuevosItems = esMontacarga ? ITEMS_CHECKLIST_MONTACARGA : ITEMS_CHECKLIST_GENERAL
    const newChecklist: Record<string, string> = {}
    const newObs: Record<string, string> = {}
    nuevosItems.forEach(item => {
      // Mantener el valor anterior si el item existe en ambos checklists
      if (checklist[item.id] !== undefined) {
        newChecklist[item.id] = checklist[item.id]
      } else {
        newChecklist[item.id] = 'pendiente'
      }
      if (obsChecklist[item.id] !== undefined) {
        newObs[item.id] = obsChecklist[item.id]
      } else {
        newObs[item.id] = ''
      }
    })
    setChecklist(newChecklist)
    setObsChecklist(newObs)
  }, [equipo, esMontacarga])

  // Estados para mantenimiento - 4 opciones
  const [engrase, setEngrase] = useState(false)
  const [sopleteoEquipo, setSopleteoEquipo] = useState(false)
  const [lavadoEquipo, setLavadoEquipo] = useState(false)
  const [sopleteoFiltros, setSopleteoFiltros] = useState(false)

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (fotosFiles.length + files.length > 7) {
      setError('Máximo 7 fotos permitidas')
      return
    }
    
    const newFiles = [...fotosFiles, ...files]
    setFotosFiles(newFiles)
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setFotosPreviews(prev => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    
    if (fileRef.current) fileRef.current.value = ''
  }
  
  function removeFoto(index: number) {
    const newFiles = fotosFiles.filter((_, i) => i !== index)
    const newPreviews = fotosPreviews.filter((_, i) => i !== index)
    setFotosFiles(newFiles)
    setFotosPreviews(newPreviews)
  }

  async function uploadMultiplesFotos(files: File[], folder: string): Promise<string[]> {
    const supabase = createClient()
    const urls: string[] = []
    
    for (const file of files) {
      try {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        
        const { error: uploadError } = await supabase.storage
          .from(folder)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) {
          console.error('Error de subida:', uploadError)
          setError(`Error al subir foto: ${uploadError.message}`)
          continue
        }
        
        const { data } = supabase.storage.from(folder).getPublicUrl(fileName)
        urls.push(data.publicUrl)
      } catch (err) {
        console.error('Error:', err)
      }
    }
    
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!fecha || !turno || !operador || !equipo) {
      setError('Completa todos los campos requeridos')
      return
    }

    // Validación para mantenimiento - al menos una tarea seleccionada
    if (tipo === 'mantenimiento' && !engrase && !sopleteoEquipo && !lavadoEquipo && !sopleteoFiltros) {
      setError('Selecciona al menos una tarea de mantenimiento')
      return
    }

    let odometroNum: number | null = null
    if (tipo === 'checklist' && odometro.trim()) {
      odometroNum = parseInt(odometro)
      if (isNaN(odometroNum) || odometroNum < 0) {
        setError('El odómetro debe ser un número válido')
        return
      }
    }

    setLoading(true)
    
    try {
      const supabase = createClient()
      let fotos_urls: string[] = []

      if (tipo === 'checklist') {
        if (fotosFiles.length > 0) {
          fotos_urls = await uploadMultiplesFotos(fotosFiles, 'fotos-checklist')
        }
        
        const checklistData: any = {
          fecha, 
          turno, 
          operador, 
          equipo,
          odometro_inicial: odometroNum,
          foto_url: fotos_urls[0] || null,
          fotos_urls: fotos_urls.length > 0 ? fotos_urls : null,
          observaciones: observaciones || null,  // OPCIONAL
          observaciones_inspeccion: obsChecklist,  // Las observaciones de cada ítem
        }
        
        // Agregar todos los items del checklist actual
        itemsChecklistActual.forEach(item => {
          checklistData[item.id] = checklist[item.id]
        })
        
        // Para campos que no están en el checklist actual, poner null o valor por defecto
        if (!esMontacarga) {
          checklistData.horquillas_rectas = null
          checklistData.seguro_horquillas_instalado = null
          checklistData.mastil_sin_daños = null
          checklistData.cadenas_lubricadas = null
          checklistData.aceite_hidraulico_correcto = null
          checklistData.mangueras_conexiones_sin_fugas = null
          checklistData.elevacion_descenso_suave = null
          checklistData.inclinacion_funciona = null
          checklistData.freno_responde = null
          checklistData.freno_estacionamiento_funciona = null
          checklistData.bocina_audible = null
          checklistData.luces_operativas = null
          checklistData.espejos_buen_estado = null
          checklistData.palancas_operan_correctamente = null
        } else {
          checklistData.presion_llantas = null
          checklistData.nivel_aceite_motor = null
          checklistData.nivel_aceite_hidraulico = null
          checklistData.nivel_refrigerante = null
          checklistData.fugas_visibles = null
          checklistData.mangueras_sin_fuga = null
          checklistData.cilindros_hidraulicos = null
          checklistData.cucharon_buen_estado = null
          checklistData.direccion_sin_juego = null
          checklistData.alarma_retroceso = null
          checklistData.cabina_limpia = null
          checklistData.extintor_presente = null
          checklistData.chasis_sin_daños = null
          checklistData.guardas_protecciones = null
        }
        
        const { error: dbError, data } = await supabase
          .from('checklist_operacional')
          .insert(checklistData)
          .select()
        
        if (dbError) {
          console.error('Error DB:', dbError)
          throw new Error(`Error al guardar: ${dbError.message}`)
        }
        
      } else if (tipo === 'mantenimiento') {
        if (fotosFiles.length > 0) {
          fotos_urls = await uploadMultiplesFotos(fotosFiles, 'fotos-mantenimiento')
        }
        
        const tareasSeleccionadas = []
        if (engrase) tareasSeleccionadas.push('engrase')
        if (sopleteoEquipo) tareasSeleccionadas.push('sopleteo_equipo')
        if (lavadoEquipo) tareasSeleccionadas.push('lavado_equipo')
        if (sopleteoFiltros) tareasSeleccionadas.push('sopleteo_filtros')
        
        const tipoMantenimiento = tareasSeleccionadas.join('_')
        
        const registroData = {
          fecha,
          turno,
          operador,
          equipo,
          engrase,
          sopleteo_equipo: sopleteoEquipo,
          lavado_equipo: lavadoEquipo,
          sopleteo_filtros: sopleteoFiltros,
          tipo_mantenimiento: tipoMantenimiento,
          observaciones: observaciones || null,  // OPCIONAL
          foto_url: fotos_urls[0] || null,
          fotos_urls: fotos_urls.length > 0 ? fotos_urls : null,
          odometro: null,
        }
        
        const { error: dbError, data } = await supabase
          .from('registros_mantenimiento')
          .insert(registroData)
          .select()
        
        if (dbError) {
          console.error('Error DB:', dbError)
          throw new Error(`Error al guardar: ${dbError.message}`)
        }
      }
      
      setSuccess(true)
      
    } catch (err: unknown) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTipo(null)
    setFecha(hoy)
    setTurno('')
    setOperador('')
    setEquipo(equipoPreseleccionado ?? '')
    setOdometro('')
    setObservaciones('')
    setFotosFiles([])
    setFotosPreviews([])
    setError('')
    setSuccess(false)
    setEngrase(false)
    setSopleteoEquipo(false)
    setLavadoEquipo(false)
    setSopleteoFiltros(false)
    if (fileRef.current) fileRef.current.value = ''
    
    const nuevoChecklist: Record<string, string> = {}
    const nuevoObs: Record<string, string> = {}
    itemsChecklistActual.forEach(item => {
      nuevoChecklist[item.id] = 'pendiente'
      nuevoObs[item.id] = ''
    })
    setChecklist(nuevoChecklist)
    setObsChecklist(nuevoObs)
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="text-7xl animate-bounce text-green-500 flex justify-center">
            <FaCheckCircle />
          </div>
          <div>
            <h2 className="font-display text-4xl tracking-widest text-green-400">¡REGISTRADO!</h2>
            <p className="font-mono text-sm text-gray-400 mt-2">
              {tipo === 'checklist' ? 'Checklist guardado correctamente' : 'Mantenimiento registrado correctamente'}
            </p>
          </div>
          <div className="card p-4 text-left space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-gray-500">EQUIPO</span>
              <span className="font-display text-lg tracking-widest text-amarillo">{equipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs text-gray-500">OPERADOR</span>
              <span className="text-sm text-gray-200">{operador}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs text-gray-500">TURNO</span>
              <span className="font-mono text-sm text-gray-200">{turno}</span>
            </div>
            {fotosFiles.length > 0 && (
              <div className="flex justify-between">
                <span className="font-mono text-xs text-gray-500">FOTOS</span>
                <span className="text-sm text-blue-400">{fotosFiles.length} foto(s)</span>
              </div>
            )}
          </div>
          <button onClick={resetForm} className="btn-primary w-full flex items-center justify-center gap-2">
            <FaPlus /> Nuevo Registro
          </button>
        </div>
      </div>
    )
  }

  // Pantalla de selección de tipo
  if (tipo === null) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <FaTractor className="text-6xl text-amarillo mx-auto mb-4" />
            <h1 className="font-display text-2xl tracking-widest text-white">
              {equipoPreseleccionado ? `Equipo ${equipoPreseleccionado}` : 'Registro de Equipo'}
            </h1>
            <p className="font-mono text-xs text-gray-400 mt-2">Selecciona el tipo de registro</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setTipo('checklist')}
              className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <FaClipboardCheck className="text-3xl text-white" />
                <div className="text-left">
                  <div className="font-display text-xl text-white">CHECKLIST</div>
                  <div className="font-mono text-xs text-blue-200">Pre-operacional</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setTipo('mantenimiento')}
              className="w-full p-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <FaWrench className="text-3xl text-white" />
                <div className="text-left">
                  <div className="font-display text-xl text-white">MANTENIMIENTO</div>
                  <div className="font-mono text-xs text-green-200">Engrase / Sopleteo / Lavado</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Formulario completo
  return (
    <div className="min-h-screen bg-dark-base">
      <header className="bg-amarillo px-4 py-4 flex items-center gap-3 sticky top-0 z-40">
        <FaTractor className="text-3xl text-black" />
        <div>
          <h1 className="font-display text-xl tracking-widest text-black leading-none">
            {tipo === 'checklist' ? 
              (esMontacarga ? 'Checklist - Montacarga' : 'Checklist Pre-operacional') : 
              'Mantenimiento'}
          </h1>
          <p className="font-mono text-[10px] text-black/50 tracking-widest uppercase">
            {equipoPreseleccionado ? `Equipo ${equipoPreseleccionado}` : 'Registro de Equipo'}
          </p>
        </div>
        <button 
          onClick={() => setTipo(null)} 
          className="ml-auto bg-black/20 hover:bg-black/30 text-black rounded-lg px-3 py-1 text-sm"
        >
          Cambiar
        </button>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Datos comunes */}
        <div className="card">
          <div className="section-header flex items-center gap-2">
            <FaClipboardList /> Datos Generales
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1"><FaCalendarAlt /> Fecha</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-base" required />
              </div>
              <div>
                <label className="label flex items-center gap-1"><FaTractor /> Equipo</label>
                {equipoPreseleccionado ? (
                  <div className="input-base bg-dark-base border-amarillo/40 text-amarillo">{equipoPreseleccionado}</div>
                ) : (
                  <select value={equipo} onChange={e => setEquipo(e.target.value)} className="input-base" required>
                    <option value="">— Seleccionar —</option>
                    {EQUIPOS.map(eq => <option key={eq}>{eq}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1"><FaUser /> Operador</label>
              <select value={operador} onChange={e => setOperador(e.target.value)} className="input-base" required>
                <option value="">— Seleccionar —</option>
                {OPERADORES.map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1"><FaClock /> Turno</label>
              <div className="flex flex-wrap gap-2">
                {TURNOS.map(t => (
                  <button key={t} type="button" onClick={() => setTurno(t)} className={clsx(
                    'flex-1 py-2.5 rounded border-2 font-mono text-xs font-semibold',
                    turno === t ? 'bg-amarillo border-amarillo text-black' : 'bg-dark-mid border-dark-border text-gray-400 hover:border-amarillo'
                  )}>{t}</button>
                ))}
              </div>
            </div>
            
            {tipo === 'checklist' && (
              <div>
                <label className="label flex items-center gap-1">
                  <FaTachometerAlt /> Odómetro (km) <span className="text-gray-500 text-xs">(opcional)</span>
                </label>
                <input type="number" value={odometro} onChange={e => setOdometro(e.target.value)} className="input-base" placeholder="Ej: 15250" />
              </div>
            )}
          </div>
        </div>

        {/* Checklist items - OBSERVACIONES OPCIONALES */}
        {tipo === 'checklist' && (
          <div className="card">
            <div className="section-header flex items-center gap-2">
              <FaChartLine /> 
              {esMontacarga ? 'Checklist de Inspección - Montacarga' : 'Checklist de Inspección'}
            </div>
            <div className="divide-y divide-dark-border">
              {itemsChecklistActual.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon className="text-xl text-gray-400" />
                      <span className="text-sm text-gray-200 flex-1">{item.label}</span>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setChecklist({ ...checklist, [item.id]: 'cumple' })} className={clsx(
                        'flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2',
                        checklist[item.id] === 'cumple' ? 'bg-green-500 border-green-500 text-white' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      )}><FaCheckCircle /> CUMPLE</button>
                      <button type="button" onClick={() => setChecklist({ ...checklist, [item.id]: 'no_cumple' })} className={clsx(
                        'flex-1 py-2 rounded-lg border-2 flex items-center justify-center gap-2',
                        checklist[item.id] === 'no_cumple' ? 'bg-red-500 border-red-500 text-white' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      )}><FaTimesCircle /> NO CUMPLE</button>
                    </div>
                    {/* Observación OPCIONAL - siempre visible pero no obligatoria */}
                    <input 
                      type="text" 
                      placeholder="Observación (opcional)..." 
                      value={obsChecklist[item.id]} 
                      onChange={(e) => setObsChecklist({ ...obsChecklist, [item.id]: e.target.value })} 
                      className="input-base text-sm" 
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mantenimiento tasks - 4 opciones */}
        {tipo === 'mantenimiento' && (
          <div className="card">
            <div className="section-header flex items-center gap-2">
              <FaTools /> Tareas de Mantenimiento
            </div>
            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={() => setEngrase(!engrase)}
                className={clsx(
                  'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                  engrase ? 'border-green-500 bg-green-500/10' : 'border-dark-border bg-dark-mid hover:border-amarillo'
                )}
              >
                <div className={clsx(
                  'w-6 h-6 rounded flex items-center justify-center text-sm border-2 flex-shrink-0',
                  engrase ? 'bg-green-500 border-green-500 text-white' : 'bg-dark-base border-dark-border'
                )}>
                  {engrase && <FaCheckCircle className="text-xs" />}
                </div>
                <div className="flex items-center gap-2">
                  <FaOilCan className={clsx('text-sm', engrase ? 'text-green-400' : 'text-gray-300')} />
                  <span className={clsx('font-sans font-medium text-sm', engrase ? 'text-green-400' : 'text-gray-300')}>
                    Engrase General
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSopleteoEquipo(!sopleteoEquipo)}
                className={clsx(
                  'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                  sopleteoEquipo ? 'border-green-500 bg-green-500/10' : 'border-dark-border bg-dark-mid hover:border-amarillo'
                )}
              >
                <div className={clsx(
                  'w-6 h-6 rounded flex items-center justify-center text-sm border-2 flex-shrink-0',
                  sopleteoEquipo ? 'bg-green-500 border-green-500 text-white' : 'bg-dark-base border-dark-border'
                )}>
                  {sopleteoEquipo && <FaCheckCircle className="text-xs" />}
                </div>
                <div className="flex items-center gap-2">
                  <FaWind className={clsx('text-sm', sopleteoEquipo ? 'text-blue-400' : 'text-gray-300')} />
                  <span className={clsx('font-sans font-medium text-sm', sopleteoEquipo ? 'text-blue-400' : 'text-gray-300')}>
                    Sopleteo de Equipo
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLavadoEquipo(!lavadoEquipo)}
                className={clsx(
                  'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                  lavadoEquipo ? 'border-green-500 bg-green-500/10' : 'border-dark-border bg-dark-mid hover:border-amarillo'
                )}
              >
                <div className={clsx(
                  'w-6 h-6 rounded flex items-center justify-center text-sm border-2 flex-shrink-0',
                  lavadoEquipo ? 'bg-green-500 border-green-500 text-white' : 'bg-dark-base border-dark-border'
                )}>
                  {lavadoEquipo && <FaCheckCircle className="text-xs" />}
                </div>
                <div className="flex items-center gap-2">
                  <FaWater className={clsx('text-sm', lavadoEquipo ? 'text-cyan-400' : 'text-gray-300')} />
                  <span className={clsx('font-sans font-medium text-sm', lavadoEquipo ? 'text-cyan-400' : 'text-gray-300')}>
                    Lavado de Equipo
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSopleteoFiltros(!sopleteoFiltros)}
                className={clsx(
                  'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
                  sopleteoFiltros ? 'border-green-500 bg-green-500/10' : 'border-dark-border bg-dark-mid hover:border-amarillo'
                )}
              >
                <div className={clsx(
                  'w-6 h-6 rounded flex items-center justify-center text-sm border-2 flex-shrink-0',
                  sopleteoFiltros ? 'bg-green-500 border-green-500 text-white' : 'bg-dark-base border-dark-border'
                )}>
                  {sopleteoFiltros && <FaCheckCircle className="text-xs" />}
                </div>
                <div className="flex items-center gap-2">
                  <FaWind className={clsx('text-sm', sopleteoFiltros ? 'text-purple-400' : 'text-gray-300')} />
                  <span className={clsx('font-sans font-medium text-sm', sopleteoFiltros ? 'text-purple-400' : 'text-gray-300')}>
                    Sopleteo de Filtros
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Observaciones generales - OPCIONAL */}
        <div className="card">
          <div className="section-header flex items-center gap-2">
            <MdOutlineStickyNote2 /> Observaciones Generales <span className="text-gray-500 text-xs">(opcional)</span>
          </div>
          <div className="p-4">
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Notas adicionales (opcional)..."
              rows={3}
              className="input-base resize-none"
            />
          </div>
        </div>

        {/* Fotos */}
        <div className="card">
          <div className="section-header flex items-center gap-2">
            <FaCamera /> Fotografías 
            <span className="text-xs text-gray-500 ml-auto">Máx. 7 fotos ({fotosFiles.length}/7)</span>
          </div>
          <div className="p-4">
            {fotosPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {fotosPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Foto ${idx + 1}`} 
                      className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 text-xs hover:bg-red-500 transition"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {fotosFiles.length < 7 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-amarillo group transition"
              >
                <FaCamera className="text-3xl mb-2 mx-auto text-gray-500 group-hover:text-amarillo" />
                <p className="font-mono text-xs text-gray-500 group-hover:text-amarillo">
                  {fotosFiles.length === 0 ? 'Tomar o subir fotos' : 'Agregar otra foto'}
                </p>
                <p className="font-mono text-[10px] text-gray-600 mt-1">
                  {fotosFiles.length === 0 ? 'Máximo 7 fotos' : `${7 - fotosFiles.length} restantes`}
                </p>
              </button>
            )}
            
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotos}
              multiple
              className="hidden"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-2">
            <IoIosWarning className="text-xl" /> 
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </div>
          ) : (
            <><FaCheckCircle /> {tipo === 'checklist' ? 'Guardar Checklist' : 'Registrar Mantenimiento'}</>
          )}
        </button>
      </form>
    </div>
  )
}
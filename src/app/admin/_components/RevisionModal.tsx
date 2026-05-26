// app/admin/_components/RevisionModal.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  FaCheckCircle, FaTimes, FaUserCheck, FaClock, 
  FaTractor, FaUser, FaCalendarAlt, FaTachometerAlt,
  FaOilCan, FaWind, FaWater, FaEye, FaCheck, FaExclamationTriangle,
  FaTools, FaClipboardList, FaFileSignature, FaComment,
  FaChevronLeft, FaChevronRight, FaExpand, FaCompress, FaCamera,
  FaCircle, FaTint, FaSnowflake, FaPlug, FaHardHat, FaShieldAlt,
  FaCar, FaLightbulb, FaBell, FaVolumeUp, FaBroom, FaLock,
  FaFireExtinguisher, FaCog, FaGripLines, FaArrowUp, FaBalanceScale,
  FaHands, FaDesktop, FaCogs
} from 'react-icons/fa'

interface RevisionRegistro {
  revisado_por: string
  revisado_en: string
  comentarios?: string | null
}

interface ModalRevisionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comentarios: string) => Promise<void>
  revisiones?: RevisionRegistro[] | null
  tipo: 'checklist' | 'mantenimiento'
  registro: any
}

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

// Items de checklist específicos para MONTACARGAS
const ITEMS_CHECKLIST_MONTACARGA = [
  { id: 'estado_llantas', label: 'Llantas sin cortes, grietas o desgaste excesivo', icon: FaCircle },
  { id: 'horquillas_rectas', label: 'Horquillas rectas', icon: FaGripLines },
  { id: 'seguro_horquillas_instalado', label: 'Seguro de horquillas instalado', icon: FaLock },
  { id: 'mastil_sin_daños', label: 'Mástil sin daños', icon: FaArrowUp },
  { id: 'cadenas_lubricadas', label: 'Cadenas lubricadas', icon: FaOilCan },
  { id: 'aceite_hidraulico_correcto', label: 'Nivel de aceite hidráulico correcto', icon: FaTint },
  { id: 'mangueras_conexiones_sin_fugas', label: 'Mangueras y conexiones sin fugas', icon: FaPlug },
  { id: 'elevacion_descenso_suave', label: 'Elevación y descenso suave', icon: FaArrowUp },
  { id: 'inclinacion_funciona', label: 'Inclinación funciona correctamente', icon: FaBalanceScale },
  { id: 'freno_responde', label: 'Freno responde correctamente', icon: FaCar },
  { id: 'freno_estacionamiento_funciona', label: 'Freno de estacionamiento funciona', icon: FaHands },
  { id: 'cinturon_seguridad', label: 'Cinturón de seguridad funcional', icon: FaLock },
  { id: 'bocina_audible', label: 'Bocina audible', icon: FaVolumeUp },
  { id: 'luces_operativas', label: 'Luces delanteras y traseras operativas', icon: FaLightbulb },
  { id: 'espejos_buen_estado', label: 'Espejos en buen estado', icon: FaEye },
  { id: 'palancas_operan_correctamente', label: 'Palancas operan correctamente', icon: FaCogs },
]

export default function ModalRevision({ 
  isOpen, 
  onClose, 
  onConfirm, 
  revisiones = [],
  tipo,
  registro 
}: ModalRevisionProps) {
  const [comentarios, setComentarios] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (!isOpen || !registro) return null

  // Determinar si es montacarga basado en el equipo del registro
  const esMontacarga = registro.equipo === 'MONTACARGA_TOYOTA' || registro.equipo === 'MONTACARGA_CATERPILLAR'
  
  // Seleccionar los items según el equipo
  const itemsChecklistActual = esMontacarga ? ITEMS_CHECKLIST_MONTACARGA : ITEMS_CHECKLIST_GENERAL

  // Obtener todas las fotos del registro
  const getAllPhotos = () => {
    const fotos = [...(registro.fotos_urls || [])]
    if (registro.foto_url) fotos.push(registro.foto_url)
    return fotos.filter(Boolean)
  }

  const allPhotos = getAllPhotos()
  const totalPhotos = allPhotos.length

  const handleOpenPhotoModal = (index: number) => {
    setCurrentPhotoIndex(index)
    setShowPhotoModal(true)
    setIsZoomed(false)
  }

  const handleNextPhoto = () => {
    if (currentPhotoIndex < totalPhotos - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
      setIsZoomed(false)
    }
  }

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
      setIsZoomed(false)
    }
  }

  const handleToggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevPhoto()
    if (e.key === 'ArrowRight') handleNextPhoto()
    if (e.key === 'Escape') setShowPhotoModal(false)
    if (e.key === 'z' || e.key === 'Z') handleToggleZoom()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRevisando(true)
    try {
      await onConfirm(comentarios)
      setComentarios('')
      onClose()
    } catch (error) {
      console.error('Error al revisar:', error)
      alert('Error al guardar la revisión')
    } finally {
      setRevisando(false)
    }
  }

  const totalRevisiones = revisiones?.length || 0
  const fechaRegistro = registro.fecha ? format(new Date(registro.fecha + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha no disponible'
  const fechaCompleta = registro.created_at ? format(new Date(registro.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: es }) : 'Fecha no disponible'

  const getStatusIcon = (value: string | null) => {
    if (value === 'cumple') return <FaCheck className="text-green-500 text-xs sm:text-sm" />
    if (value === 'no_cumple') return <FaExclamationTriangle className="text-red-500 text-xs sm:text-sm" />
    return <FaClock className="text-yellow-500 text-xs sm:text-sm" />
  }

  const getStatusText = (value: string | null) => {
    if (value === 'cumple') return 'Cumple'
    if (value === 'no_cumple') return 'No Cumple'
    return 'Pendiente'
  }

  const getStatusColor = (value: string | null) => {
    if (value === 'cumple') return 'text-green-400'
    if (value === 'no_cumple') return 'text-red-400'
    return 'text-yellow-400'
  }

  // Contar items que cumplen y no cumplen
  const itemsQueCumplen = itemsChecklistActual.filter(item => registro[item.id] === 'cumple').length
  const itemsQueNoCumplen = itemsChecklistActual.filter(item => registro[item.id] === 'no_cumple').length
  const itemsPendientes = itemsChecklistActual.filter(item => !registro[item.id] || registro[item.id] === '' || registro[item.id] === null || registro[item.id] === 'pendiente').length

  // Tareas de mantenimiento
  const tareasRealizadas = [
    registro.engrase, 
    registro.sopleteo_equipo, 
    registro.lavado_equipo, 
    registro.sopleteo_filtros
  ].filter(Boolean).length
  const totalTareas = 4
  const tareasPendientes = totalTareas - tareasRealizadas

  // Obtener observaciones de inspección (si existen)
  const observacionesInspeccion = registro.observaciones_inspeccion || {}

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-dark-card rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-dark-card border-b border-dark-border p-3 sm:p-4 flex justify-between items-center z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {tipo === 'checklist' ? (
                  <FaClipboardList className="text-blue-400 text-lg sm:text-xl flex-shrink-0" />
                ) : (
                  <FaTools className="text-green-400 text-lg sm:text-xl flex-shrink-0" />
                )}
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                  Revisar {tipo === 'checklist' ? 'Checklist Pre-operacional' : 'Reporte de Mantenimiento'}
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                {registro.equipo} - {registro.operador} - {fechaRegistro}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 sm:p-2 hover:bg-dark-mid rounded-lg flex-shrink-0">
              <FaTimes size={18} className="sm:text-xl" />
            </button>
          </div>

          {/* INFORMACIÓN DEL REGISTRO */}
          <div className="p-4 sm:p-6 border-b border-dark-border">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
              <FaEye className="text-amarillo" />
              Información del Registro a Revisar
            </h4>

            {/* Datos Generales */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-dark-mid rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-xs mb-1">
                  <FaCalendarAlt size={10} className="sm:text-xs" />
                  <span>Fecha</span>
                </div>
                <p className="text-white font-medium text-xs sm:text-sm">{fechaRegistro}</p>
              </div>
              <div className="bg-dark-mid rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-xs mb-1">
                  <FaClock size={10} className="sm:text-xs" />
                  <span>Turno</span>
                </div>
                <p className="text-white font-medium text-xs sm:text-sm">{registro.turno}</p>
              </div>
              <div className="bg-dark-mid rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-xs mb-1">
                  <FaUser size={10} className="sm:text-xs" />
                  <span>Operador</span>
                </div>
                <p className="text-white font-medium text-xs sm:text-sm">{registro.operador}</p>
              </div>
              <div className="bg-dark-mid rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-xs mb-1">
                  <FaTractor size={10} className="sm:text-xs" />
                  <span>Equipo</span>
                </div>
                <p className="text-amarillo font-medium text-xs sm:text-sm break-words">{registro.equipo?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {/* Odómetro para checklist */}
            {tipo === 'checklist' && (
              <div className="bg-dark-mid rounded-lg p-2 sm:p-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-xs mb-1">
                  <FaTachometerAlt size={10} className="sm:text-xs" />
                  <span>Odómetro</span>
                </div>
                <p className="text-blue-400 font-mono text-base sm:text-lg font-bold">
                  {registro.odometro_inicial ? `${registro.odometro_inicial.toLocaleString()} km` : 'No registrado'}
                </p>
              </div>
            )}

            {/* Estado de seguimiento actual */}
            {registro.seguimiento && (
              <div className="bg-dark-mid rounded-lg p-2 sm:p-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-xs mb-1">
                  <span>📋 Estado del seguimiento</span>
                </div>
                <p className={`font-semibold text-xs sm:text-sm ${
                  registro.seguimiento?.estado === 'pendiente' ? 'text-yellow-400' :
                  registro.seguimiento?.estado === 'en_proceso' ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {registro.seguimiento?.estado === 'pendiente' ? '🟡 PENDIENTE' :
                   registro.seguimiento?.estado === 'en_proceso' ? '🔵 EN PROCESO' : '🟢 FINALIZADO'}
                </p>
                {registro.seguimiento?.actualizado_por && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Última actualización: {registro.seguimiento.actualizado_por.split('@')[0]} - {format(new Date(registro.seguimiento.actualizado_en), 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
            )}

            {/* CHECKLIST - TODOS LOS ITEMS */}
            {tipo === 'checklist' && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h5 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FaClipboardList size={12} className="sm:text-xs" />
                    Inspección de Seguridad ({esMontacarga ? 'Montacarga' : 'General'} - {itemsChecklistActual.length} items)
                  </h5>
                </div>
                
                {/* Resumen de items - Tarjetas de colores */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-lg sm:text-xl font-bold">{itemsQueCumplen}</div>
                    <div className="text-green-400 text-[8px] sm:text-xs uppercase tracking-wider">CUMPLEN</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-lg sm:text-xl font-bold">{itemsQueNoCumplen}</div>
                    <div className="text-red-400 text-[8px] sm:text-xs uppercase tracking-wider">NO CUMPLEN</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                    <div className="text-yellow-400 text-lg sm:text-xl font-bold">{itemsPendientes}</div>
                    <div className="text-yellow-400 text-[8px] sm:text-xs uppercase tracking-wider">PENDIENTES</div>
                  </div>
                </div>

                {/* LISTA COMPLETA DE TODOS LOS ITEMS */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {itemsChecklistActual.map((item) => {
                    const value = registro[item.id]
                    const Icon = item.icon
                    const observacion = observacionesInspeccion[item.id]
                    
                    return (
                      <div key={item.id} className={`flex flex-col p-2 sm:p-3 rounded-lg border ${
                        value === 'cumple' ? 'bg-green-500/10 border-green-500/30' :
                        value === 'no_cumple' ? 'bg-red-500/10 border-red-500/30' :
                        'bg-dark-mid border-dark-border'
                      }`}>
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon className={`text-xs sm:text-sm flex-shrink-0 ${
                              value === 'cumple' ? 'text-green-400' :
                              value === 'no_cumple' ? 'text-red-400' :
                              'text-gray-500'
                            }`} />
                            <span className="text-[11px] sm:text-sm text-gray-300 flex-1">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {getStatusIcon(value)}
                            <span className={`text-[10px] sm:text-sm font-medium ${getStatusColor(value)} whitespace-nowrap`}>
                              {getStatusText(value)}
                            </span>
                          </div>
                        </div>
                        {/* Mostrar observación si existe y es "no_cumple" */}
                        {value === 'no_cumple' && observacion && (
                          <div className="mt-2 ml-6 sm:ml-7 text-[10px] sm:text-xs text-yellow-400 bg-yellow-500/10 p-1 sm:p-2 rounded">
                            <span className="font-semibold">Observación:</span> {observacion}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Alerta si hay items que no cumplen */}
                {itemsQueNoCumplen > 0 && (
                  <div className="mt-4 p-2 sm:p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-400 text-sm sm:text-base flex-shrink-0" />
                    <span className="text-red-400 text-[10px] sm:text-sm font-medium">
                      ⚠️ {itemsQueNoCumplen} item(s) que NO CUMPLEN - Requiere atención inmediata
                    </span>
                  </div>
                )}

                {/* Mensaje si todo cumple */}
                {itemsQueCumplen === itemsChecklistActual.length && itemsChecklistActual.length > 0 && (
                  <div className="mt-4 p-2 sm:p-3 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center gap-2">
                    <FaCheckCircle className="text-green-400 text-sm sm:text-base flex-shrink-0" />
                    <span className="text-green-400 text-[10px] sm:text-sm font-medium">
                      ✅ Todos los items CUMPLEN con los estándares de seguridad
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* MANTENIMIENTO */}
            {tipo === 'mantenimiento' && (
              <div className="mb-4 sm:mb-6">
                <h5 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaTools size={12} className="sm:text-xs" />
                  Tareas de Mantenimiento Realizadas
                </h5>
                
                {/* Lista de tareas de mantenimiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-3 rounded-lg flex items-center justify-between ${registro.engrase ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      <FaOilCan className={registro.engrase ? 'text-green-400 text-xs sm:text-sm' : 'text-red-400 text-xs sm:text-sm'} />
                      <span className={`text-[11px] sm:text-sm ${registro.engrase ? 'text-green-400' : 'text-red-400'}`}>Engrase General</span>
                    </div>
                    <span className={`text-[10px] sm:text-sm font-bold ${registro.engrase ? 'text-green-400' : 'text-red-400'}`}>
                      {registro.engrase ? '✓ REALIZADO' : '✗ NO REALIZADO'}
                    </span>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg flex items-center justify-between ${registro.sopleteo_equipo ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      <FaWind className={registro.sopleteo_equipo ? 'text-blue-400 text-xs sm:text-sm' : 'text-red-400 text-xs sm:text-sm'} />
                      <span className={`text-[11px] sm:text-sm ${registro.sopleteo_equipo ? 'text-blue-400' : 'text-red-400'}`}>Sopleteo Equipo</span>
                    </div>
                    <span className={`text-[10px] sm:text-sm font-bold ${registro.sopleteo_equipo ? 'text-green-400' : 'text-red-400'}`}>
                      {registro.sopleteo_equipo ? '✓ REALIZADO' : '✗ NO REALIZADO'}
                    </span>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg flex items-center justify-between ${registro.lavado_equipo ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      <FaWater className={registro.lavado_equipo ? 'text-cyan-400 text-xs sm:text-sm' : 'text-red-400 text-xs sm:text-sm'} />
                      <span className={`text-[11px] sm:text-sm ${registro.lavado_equipo ? 'text-cyan-400' : 'text-red-400'}`}>Lavado Equipo</span>
                    </div>
                    <span className={`text-[10px] sm:text-sm font-bold ${registro.lavado_equipo ? 'text-green-400' : 'text-red-400'}`}>
                      {registro.lavado_equipo ? '✓ REALIZADO' : '✗ NO REALIZADO'}
                    </span>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg flex items-center justify-between ${registro.sopleteo_filtros ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      <FaWind className={registro.sopleteo_filtros ? 'text-purple-400 text-xs sm:text-sm' : 'text-red-400 text-xs sm:text-sm'} />
                      <span className={`text-[11px] sm:text-sm ${registro.sopleteo_filtros ? 'text-purple-400' : 'text-red-400'}`}>Sopleteo Filtros</span>
                    </div>
                    <span className={`text-[10px] sm:text-sm font-bold ${registro.sopleteo_filtros ? 'text-green-400' : 'text-red-400'}`}>
                      {registro.sopleteo_filtros ? '✓ REALIZADO' : '✗ NO REALIZADO'}
                    </span>
                  </div>
                </div>

                {/* Resumen de mantenimiento */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-lg sm:text-xl font-bold">{tareasRealizadas}</div>
                    <div className="text-green-400 text-[8px] sm:text-xs uppercase tracking-wider">TAREAS REALIZADAS</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-lg sm:text-xl font-bold">{tareasPendientes}</div>
                    <div className="text-red-400 text-[8px] sm:text-xs uppercase tracking-wider">TAREAS PENDIENTES</div>
                  </div>
                </div>

                {/* Descripción de mantenimiento */}
                {registro.descripcion && (
                  <div className="mt-4 p-2 sm:p-3 bg-dark-mid rounded-lg">
                    <span className="text-gray-400 text-[10px] sm:text-xs block mb-1">Descripción del mantenimiento:</span>
                    <p className="text-gray-300 text-[11px] sm:text-sm">{registro.descripcion}</p>
                  </div>
                )}
              </div>
            )}

            {/* Observaciones Generales */}
            {registro.observaciones && (
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-2 text-yellow-400 text-[10px] sm:text-xs mb-1 sm:mb-2">
                  <FaComment size={10} className="sm:text-xs" />
                  <span className="font-semibold">Observaciones del Operador</span>
                </div>
                <p className="text-gray-300 text-[11px] sm:text-sm">{registro.observaciones}</p>
              </div>
            )}

            {/* Fotos */}
            {totalPhotos > 0 && (
              <div className="mb-4 sm:mb-6">
                <h5 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                  <FaCamera size={10} className="sm:text-xs" />
                  Fotos Adjuntas ({totalPhotos})
                </h5>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                  {allPhotos.map((url: string, idx: number) => (
                    <div key={idx} onClick={() => handleOpenPhotoModal(idx)} className="relative group cursor-pointer">
                      <div className="aspect-square rounded-lg overflow-hidden bg-dark-mid border-2 border-dark-border hover:border-amarillo transition-all">
                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <FaExpand className="text-white text-base sm:text-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historial de revisiones */}
          {totalRevisiones > 0 && (
            <div className="p-4 sm:p-6 border-b border-dark-border">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
                <FaUserCheck className="text-green-400 text-sm sm:text-base" />
                Historial de Revisiones Anteriores ({totalRevisiones})
              </h4>
              <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto pr-1 sm:pr-2">
                {revisiones?.map((rev, idx) => (
                  <div key={idx} className="bg-dark-mid rounded-lg p-2 sm:p-3">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <FaUserCheck size={8} className="sm:text-[10px] text-blue-400" />
                        </div>
                        <span className="font-medium text-blue-400 text-[11px] sm:text-sm">{rev.revisado_por?.split('@')[0] || rev.revisado_por}</span>
                      </div>
                      <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-1">
                        <FaClock size={8} className="sm:text-[10px]" />
                        {format(new Date(rev.revisado_en), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                      </span>
                    </div>
                    {rev.comentarios && (
                      <div className="mt-1 sm:mt-2 pl-5 sm:pl-8">
                        <p className="text-[10px] sm:text-xs text-gray-400 italic">"{rev.comentarios}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de revisión */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
              <FaFileSignature className="text-amarillo text-sm sm:text-base" />
              {totalRevisiones > 0 ? 'Nueva Revisión' : 'Confirmar Revisión'}
            </h4>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Comentarios de la revisión <span className="text-gray-500 text-[10px] sm:text-xs">(opcional)</span>
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Ej: Revisión aprobada, todo en orden / Se requiere atención en..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-mid border border-dark-border rounded-lg text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-amarillo transition resize-none"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 sm:p-3 mb-4">
              <p className="text-[10px] sm:text-xs text-blue-400 flex items-center gap-1 sm:gap-2">
                <FaCheckCircle size={10} className="sm:text-xs" />
                Al confirmar esta revisión, quedará constancia permanente de que has revisado este registro, 
                incluyendo tu nombre, fecha, hora y comentarios.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-3 sm:px-4 py-2 bg-dark-mid hover:bg-dark-border text-gray-300 rounded-lg transition font-medium text-xs sm:text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={revisando} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 sm:px-4 py-2 flex items-center justify-center gap-1 sm:gap-2 transition disabled:opacity-50 font-medium text-xs sm:text-sm">
                {revisando ? (
                  <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                ) : (
                  <><FaCheckCircle size={12} className="sm:text-sm" /> Confirmar Revisión</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de fotos con zoom */}
      {showPhotoModal && totalPhotos > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center" onKeyDown={handleKeyDown} tabIndex={0}>
          <button onClick={() => setShowPhotoModal(false)} className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white/70 hover:text-white z-20 p-1 sm:p-2 hover:bg-white/10 rounded-full transition">
            <FaTimes size={20} className="sm:text-2xl" />
          </button>

          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex items-center gap-1 sm:gap-2 bg-black/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
            <button onClick={handleToggleZoom} className="text-white/70 hover:text-white p-1 transition" title={isZoomed ? "Alejar (Z)" : "Acercar (Z)"}>
              {isZoomed ? <FaCompress size={14} className="sm:text-lg" /> : <FaExpand size={14} className="sm:text-lg" />}
            </button>
            <span className="text-white text-xs sm:text-sm">{currentPhotoIndex + 1} / {totalPhotos}</span>
          </div>

          {totalPhotos > 1 && (
            <>
              <button onClick={handlePrevPhoto} disabled={currentPhotoIndex === 0} className={`absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full transition ${currentPhotoIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <FaChevronLeft size={24} className="sm:text-3xl" />
              </button>
              <button onClick={handleNextPhoto} disabled={currentPhotoIndex === totalPhotos - 1} className={`absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full transition ${currentPhotoIndex === totalPhotos - 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <FaChevronRight size={24} className="sm:text-3xl" />
              </button>
            </>
          )}

          <div className={`w-full h-full flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
            <img src={allPhotos[currentPhotoIndex]} alt={`Foto ${currentPhotoIndex + 1}`} onClick={handleToggleZoom} className={`transition-all duration-300 object-contain ${isZoomed ? 'w-auto h-auto max-w-[95%] max-h-[95%]' : 'max-w-[90%] max-h-[90%]'}`} style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }} />
          </div>

          {totalPhotos > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-1 sm:gap-2 overflow-x-auto px-2 sm:px-4 py-1 sm:py-2">
              {allPhotos.map((url: string, idx: number) => (
                <button key={idx} onClick={() => { setCurrentPhotoIndex(idx); setIsZoomed(false); }} className={`flex-shrink-0 transition-all ${currentPhotoIndex === idx ? 'ring-1 sm:ring-2 ring-amarillo scale-110' : 'opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt={`Miniatura ${idx + 1}`} className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="absolute bottom-1 sm:bottom-4 right-1 sm:right-4 text-white/30 text-[8px] sm:text-xs hidden sm:block">
            ← → Navegar | Z Zoom | ESC Cerrar
          </div>
        </div>
      )}
    </>
  )
}
// app/admin/_components/SeguimientoStatus.tsx
'use client'

import { useState } from 'react'
import { 
  FaClock, FaSpinner, FaCheckCircle, 
  FaHistory, FaPlay, FaCheck, FaTimes 
} from 'react-icons/fa'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SeguimientoRegistro {
  estado: 'pendiente' | 'en_proceso' | 'finalizado'
  actualizado_por?: string
  actualizado_en?: string
  comentarios?: string | null
  historial?: {
    estado: string
    actualizado_por: string
    actualizado_en: string
    comentarios?: string | null
  }[]
}

interface SeguimientoStatusProps {
  seguimiento?: SeguimientoRegistro | null
  onCambiarEstado: (estado: 'pendiente' | 'en_proceso' | 'finalizado', comentarios: string) => Promise<void>
}

export default function SeguimientoStatus({ seguimiento, onCambiarEstado }: SeguimientoStatusProps) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [cambiando, setCambiando] = useState(false)
  const [comentarios, setComentarios] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState<'pendiente' | 'en_proceso' | 'finalizado'>('pendiente')

  const estadoActual = seguimiento?.estado || 'pendiente'

  const getEstadoConfig = () => {
    switch (estadoActual) {
      case 'pendiente':
        return { icon: FaClock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pendiente', border: 'border-yellow-500/30' }
      case 'en_proceso':
        return { icon: FaSpinner, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'En Proceso', border: 'border-blue-500/30' }
      case 'finalizado':
        return { icon: FaCheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Finalizado', border: 'border-green-500/30' }
      default:
        return { icon: FaClock, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Desconocido', border: 'border-gray-500/30' }
    }
  }

  const config = getEstadoConfig()
  const Icon = config.icon

  const handleCambiarEstado = (estado: 'pendiente' | 'en_proceso' | 'finalizado') => {
    setNuevoEstado(estado)
    setComentarios('')
    setMostrarModal(true)
  }

  const confirmarCambio = async () => {
    setCambiando(true)
    try {
      await onCambiarEstado(nuevoEstado, comentarios)
      setMostrarModal(false)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar el estado')
    } finally {
      setCambiando(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} border ${config.border}`}>
          <Icon className={`${config.color} text-sm`} />
          <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
        </div>

        {seguimiento?.actualizado_por && (
          <div className="text-[10px] text-gray-500 px-1">
            <span className="text-gray-600">Por:</span> {seguimiento.actualizado_por.split('@')[0]}<br />
            <span className="text-gray-600">El:</span> {seguimiento.actualizado_en ? format(new Date(seguimiento.actualizado_en), 'dd/MM HH:mm') : '-'}
          </div>
        )}

        <div className="flex gap-1 mt-1">
          {estadoActual === 'pendiente' && (
            <button onClick={() => handleCambiarEstado('en_proceso')} className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded flex items-center justify-center gap-1 transition font-medium">
              <FaPlay size={10} /> Iniciar
            </button>
          )}
          {estadoActual === 'en_proceso' && (
            <button onClick={() => handleCambiarEstado('finalizado')} className="flex-1 text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1.5 rounded flex items-center justify-center gap-1 transition font-medium">
              <FaCheck size={10} /> Finalizar
            </button>
          )}
          {estadoActual === 'finalizado' && (
            <button onClick={() => handleCambiarEstado('pendiente')} className="flex-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1.5 rounded flex items-center justify-center gap-1 transition font-medium">
              <FaClock size={10} /> Reabrir
            </button>
          )}
          <button onClick={() => setMostrarHistorial(!mostrarHistorial)} className="text-xs bg-gray-600/30 hover:bg-gray-600/50 text-gray-400 px-2 py-1.5 rounded flex items-center justify-center gap-1 transition">
            <FaHistory size={10} />
          </button>
        </div>

        {mostrarHistorial && seguimiento?.historial && seguimiento.historial.length > 0 && (
          <div className="mt-2 p-2 bg-dark-mid rounded-lg">
            <p className="text-[10px] font-semibold text-gray-400 mb-2">📋 Historial:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {seguimiento.historial.map((item, idx) => {
                let EstadoIcon = FaClock
                let estadoColor = 'text-yellow-400'
                if (item.estado === 'en_proceso') { EstadoIcon = FaSpinner; estadoColor = 'text-blue-400' }
                if (item.estado === 'finalizado') { EstadoIcon = FaCheckCircle; estadoColor = 'text-green-400' }
                
                return (
                  <div key={idx} className="text-[9px] border-l-2 border-gray-700 pl-2 py-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <EstadoIcon className={estadoColor} size={8} />
                      <span className="font-medium">
                        {item.estado === 'pendiente' ? '📌 Pendiente' :
                         item.estado === 'en_proceso' ? '⚙️ En Proceso' : '✅ Finalizado'}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span>{format(new Date(item.actualizado_en), 'dd/MM HH:mm')}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-blue-400">{item.actualizado_por.split('@')[0]}</span>
                    </div>
                    {item.comentarios && (
                      <div className="text-gray-500 italic mt-1 text-[8px]">"{item.comentarios}"</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-dark-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {nuevoEstado === 'en_proceso' && '▶️ Iniciar seguimiento'}
                {nuevoEstado === 'finalizado' && '✅ Finalizar seguimiento'}
                {nuevoEstado === 'pendiente' && '🔄 Reabrir registro'}
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-300 mb-3">
                {nuevoEstado === 'en_proceso' && 'El registro pasará a estado "EN PROCESO"'}
                {nuevoEstado === 'finalizado' && 'El registro se marcará como "FINALIZADO"'}
                {nuevoEstado === 'pendiente' && 'El registro volverá a estado "PENDIENTE"'}
              </p>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Comentarios sobre este cambio (opcional)"
                rows={3}
                className="w-full px-3 py-2 bg-dark-mid border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amarillo transition"
              />
            </div>
            <div className="p-4 border-t border-dark-border flex gap-3">
              <button onClick={() => setMostrarModal(false)} className="flex-1 px-4 py-2 bg-dark-mid hover:bg-dark-border text-gray-300 rounded-lg transition">
                Cancelar
              </button>
              <button onClick={confirmarCambio} disabled={cambiando} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition disabled:opacity-50">
                {cambiando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
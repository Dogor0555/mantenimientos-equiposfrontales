// app/admin/_components/RevisionStatusBadge.tsx
'use client'

import { FaCheckCircle, FaClock, FaUserCheck } from 'react-icons/fa'

interface RevisionRegistro {
  revisado_por: string
  revisado_en: string
  comentarios?: string | null
}

interface RevisionStatusBadgeProps {
  revisiones?: RevisionRegistro[] | null
}

export default function RevisionStatusBadge({ revisiones }: RevisionStatusBadgeProps) {
  const totalRevisiones = revisiones?.length || 0
  
  if (totalRevisiones === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
        <FaClock size={10} />
        Pendiente revisión
      </span>
    )
  }

  const ultimaRevision = revisiones?.[totalRevisiones - 1]
  
  return (
    <div className="group relative">
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 cursor-help">
        <FaCheckCircle size={10} />
        Revisado ({totalRevisiones})
      </span>
      
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
        <div className="bg-dark-card border border-dark-border rounded-lg p-2 min-w-[220px] shadow-xl">
          <p className="text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
            <FaUserCheck size={10} className="text-green-400" />
            Última revisión:
          </p>
          <p className="text-xs text-gray-400">
            <span className="font-medium">Por:</span> {ultimaRevision?.revisado_por?.split('@')[0] || ultimaRevision?.revisado_por}
          </p>
          <p className="text-xs text-gray-400">
            <span className="font-medium">Fecha:</span> {new Date(ultimaRevision?.revisado_en || '').toLocaleString()}
          </p>
          {ultimaRevision?.comentarios && (
            <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-dark-border">
              {ultimaRevision.comentarios}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
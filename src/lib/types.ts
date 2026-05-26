// lib/types.ts

export interface RevisionRegistro {
  revisado_por: string
  revisado_en: string
  comentarios?: string | null
}

// NUEVO: Tipo para el seguimiento de estados
export interface SeguimientoRegistro {
  estado: 'pendiente' | 'en_proceso' | 'finalizado'
  actualizado_por: string
  actualizado_en: string
  comentarios?: string | null
  historial: {
    estado: string
    actualizado_por: string
    actualizado_en: string
    comentarios?: string | null
  }[]
}

export interface Checklist {
  id: string
  fecha: string
  turno: string
  operador: string
  equipo: string
  odometro_inicial: number | null
  // Items generales
  estado_llantas: string | null
  presion_llantas: string | null
  nivel_aceite_motor: string | null
  nivel_aceite_hidraulico: string | null
  nivel_refrigerante: string | null
  fugas_visibles: string | null
  mangueras_sin_fuga: string | null
  cilindros_hidraulicos: string | null
  cucharon_buen_estado: string | null
  frenos_operativos: string | null
  direccion_sin_juego: string | null
  luces_delanteras_traseras: string | null
  alarma_retroceso: string | null
  bocina_funcional: string | null
  cabina_limpia: string | null
  cinturon_seguridad: string | null
  espejos_retrovisores: string | null
  extintor_presente: string | null
  chasis_sin_daños: string | null
  guardas_protecciones: string | null
  // Items específicos para montacargas (Forklift)
  horquillas_rectas: string | null
  seguro_horquillas_instalado: string | null
  mastil_sin_daños: string | null
  cadenas_lubricadas: string | null
  aceite_hidraulico_correcto: string | null
  mangueras_conexiones_sin_fugas: string | null
  elevacion_descenso_suave: string | null
  inclinacion_funciona: string | null
  freno_responde: string | null
  freno_estacionamiento_funciona: string | null
  bocina_audible: string | null
  luces_operativas: string | null
  espejos_buen_estado: string | null
  palancas_operan_correctamente: string | null
  // Observaciones y metadata
  observaciones_inspeccion: Record<string, string> | null
  observaciones: string | null
  foto_url: string | null
  fotos_urls: string[] | null
  created_at: string
  revisiones: RevisionRegistro[] | null
  seguimiento: SeguimientoRegistro | null
}

export interface Mantenimiento {
  id: string
  fecha: string
  turno: string
  operador: string
  equipo: string
  odometro: number | null
  tipo_mantenimiento: string
  engrase: boolean
  sopleteo_equipo: boolean
  lavado_equipo: boolean
  sopleteo_filtros: boolean
  descripcion: string | null
  observaciones: string | null
  foto_url: string | null
  fotos_urls: string[] | null
  created_at: string
  revisiones: RevisionRegistro[] | null
  seguimiento: SeguimientoRegistro | null
}

export interface Registro {
  id: string
  fecha: string
  turno: string
  operador: string
  equipo: string
  engrase: boolean
  sopleteo_equipo: boolean
  lavado_equipo: boolean
  sopleteo_filtros: boolean
  observaciones: string | null
  foto_url: string | null
  fotos_urls: string[] | null
  odometro: number | null
  created_at: string
}

export interface NuevoChecklist {
  fecha: string
  turno: string
  operador: string
  equipo: string
  odometro_inicial?: number | null
  // Items generales
  estado_llantas?: string
  presion_llantas?: string
  nivel_aceite_motor?: string
  nivel_aceite_hidraulico?: string
  nivel_refrigerante?: string
  fugas_visibles?: string
  mangueras_sin_fuga?: string
  cilindros_hidraulicos?: string
  cucharon_buen_estado?: string
  frenos_operativos?: string
  direccion_sin_juego?: string
  luces_delanteras_traseras?: string
  alarma_retroceso?: string
  bocina_funcional?: string
  cabina_limpia?: string
  cinturon_seguridad?: string
  espejos_retrovisores?: string
  extintor_presente?: string
  chasis_sin_daños?: string
  guardas_protecciones?: string
  // Items específicos para montacargas (Forklift)
  horquillas_rectas?: string
  seguro_horquillas_instalado?: string
  mastil_sin_daños?: string
  cadenas_lubricadas?: string
  aceite_hidraulico_correcto?: string
  mangueras_conexiones_sin_fugas?: string
  elevacion_descenso_suave?: string
  inclinacion_funciona?: string
  freno_responde?: string
  freno_estacionamiento_funciona?: string
  bocina_audible?: string
  luces_operativas?: string
  espejos_buen_estado?: string
  palancas_operan_correctamente?: string
  observaciones_inspeccion?: Record<string, string>
  observaciones?: string | null
  foto_url?: string | null
  fotos_urls?: string[] | null
}

export interface NuevoMantenimiento {
  fecha: string
  turno: string
  operador: string
  equipo: string
  odometro?: number | null
  tipo_mantenimiento: string
  engrase: boolean
  sopleteo_equipo: boolean
  lavado_equipo: boolean
  sopleteo_filtros: boolean
  descripcion?: string | null
  observaciones?: string | null
  foto_url?: string | null
  fotos_urls?: string[] | null
}

export interface NuevoRegistro {
  fecha: string
  turno: string
  operador: string
  equipo: string
  engrase: boolean
  sopleteo_equipo: boolean
  lavado_equipo: boolean
  sopleteo_filtros: boolean
  observaciones: string | null
  foto_url: string | null
  fotos_urls?: string[] | null
  odometro: number | null
}
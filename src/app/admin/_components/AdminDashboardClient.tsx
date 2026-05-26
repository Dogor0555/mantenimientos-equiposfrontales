// app/admin/_components/AdminDashboardClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { Checklist, Mantenimiento } from '@/lib/types'
import { EQUIPOS, OPERADORES, TURNOS } from '@/lib/constants'
import clsx from 'clsx'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  FaClipboardList, FaOilCan, FaWind, FaTractor, FaUser, 
  FaCamera, FaExclamationTriangle, FaSearch, FaTimes,
  FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaQuestionCircle,
  FaChartLine, FaTools, FaQrcode, FaExternalLinkAlt,
  FaCalendarAlt, FaTachometerAlt, FaClock, FaEye, FaPlus,
  FaClipboardCheck, FaWrench, FaImages, FaChevronLeft, FaChevronRight,
  FaTint, FaWater, FaFileExcel, FaFilePdf, FaUserCheck,
  FaGripLines, FaLock, FaArrowUp, FaBalanceScale,
  FaHands, FaVolumeUp, FaLightbulb, FaEye as FaEyeIcon, FaCogs,
  FaCircle, FaCar,  FaFireExtinguisher
} from 'react-icons/fa'
import { MdOutlineDelete, MdOutlineEdit, MdOutlineStickyNote2 } from 'react-icons/md'
import ModalRevision from './RevisionModal'
import RevisionStatusBadge from './RevisionStatusBadge'
import SeguimientoStatus from './SeguimientoStatus'

type Props = {
  checklist: Checklist[]
  mantenimientos: Mantenimiento[]
}

type TabType = 'checklist' | 'mantenimiento'

// Equipos que usan checklist de montacarga
const EQUIPOS_MONTACARGA = ['MONTACARGA_TOYOTA', 'MONTACARGA_CATERPILLAR']

const esMontacarga = (equipo: string) => EQUIPOS_MONTACARGA.includes(equipo)

export default function AdminDashboardClient({ checklist, mantenimientos }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('checklist')
  
  // Filtros Checklist
  const [searchChecklist, setSearchChecklist] = useState('')
  const [filterEquipoChecklist, setFilterEquipoChecklist] = useState('')
  const [filterOperadorChecklist, setFilterOperadorChecklist] = useState('')
  const [filterTurnoChecklist, setFilterTurnoChecklist] = useState('')
  const [filterFechaDesdeChecklist, setFilterFechaDesdeChecklist] = useState('')
  const [filterFechaHastaChecklist, setFilterFechaHastaChecklist] = useState('')
  
  // Filtros Mantenimiento
  const [searchMantenimiento, setSearchMantenimiento] = useState('')
  const [filterEquipoMantenimiento, setFilterEquipoMantenimiento] = useState('')
  const [filterOperadorMantenimiento, setFilterOperadorMantenimiento] = useState('')
  const [filterTurnoMantenimiento, setFilterTurnoMantenimiento] = useState('')
  const [filterFechaDesdeMantenimiento, setFilterFechaDesdeMantenimiento] = useState('')
  const [filterFechaHastaMantenimiento, setFilterFechaHastaMantenimiento] = useState('')
  
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)
  
  const [galeriaAbierta, setGaleriaAbierta] = useState(false)
  const [fotosGaleria, setFotosGaleria] = useState<string[]>([])
  const [fotoActualIndex, setFotoActualIndex] = useState(0)

  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [progresoReporte, setProgresoReporte] = useState(0)
  const [errorReporte, setErrorReporte] = useState<string | null>(null)

  const [modalRevisionAbierto, setModalRevisionAbierto] = useState(false)
  const [registroSeleccionado, setRegistroSeleccionado] = useState<{ 
    id: string
    tipo: 'checklist' | 'mantenimiento'
    revisiones: any[] | null
    registro: Checklist | Mantenimiento | null
  } | null>(null)

  const getFotosChecklist = (r: Checklist): string[] => {
    if (r.fotos_urls && r.fotos_urls.length > 0) return r.fotos_urls
    if (r.foto_url) return [r.foto_url]
    return []
  }

  const getFotosMantenimiento = (r: Mantenimiento): string[] => {
    if (r.fotos_urls && r.fotos_urls.length > 0) return r.fotos_urls
    if (r.foto_url) return [r.foto_url]
    return []
  }

  const imageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!url) { reject(new Error('URL vacía')); return }

      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
      const timeoutId = setTimeout(() => reject(new Error('Timeout cargando imagen')), 20000)

      fetch(proxyUrl)
        .then(res => {
          clearTimeout(timeoutId)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.blob()
        })
        .then(blob => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Error leyendo blob'))
          reader.readAsDataURL(blob)
        })
        .catch(err => { clearTimeout(timeoutId); reject(err) })
    })
  }

  const abrirGaleria = (fotos: string[]) => {
    if (!fotos || fotos.length === 0) return
    setFotosGaleria(fotos)
    setFotoActualIndex(0)
    setGaleriaAbierta(true)
  }

  const siguienteFoto = () => {
    if (fotoActualIndex < fotosGaleria.length - 1) setFotoActualIndex(fotoActualIndex + 1)
  }

  const anteriorFoto = () => {
    if (fotoActualIndex > 0) setFotoActualIndex(fotoActualIndex - 1)
  }

  const agregarRevision = async (comentarios: string) => {
    if (!registroSeleccionado) return

    const endpoint = registroSeleccionado.tipo === 'checklist'
      ? `/api/checklist/${registroSeleccionado.id}/revisar`
      : `/api/mantenimientos/${registroSeleccionado.id}/revisar`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentarios })
    })

    if (!response.ok) {
      throw new Error('Error al agregar revisión')
    }

    window.location.reload()
  }

  const actualizarEstado = async (
    id: string,
    tipo: 'checklist' | 'mantenimiento',
    estado: 'pendiente' | 'en_proceso' | 'finalizado',
    comentarios: string
  ) => {
    const endpoint = tipo === 'checklist'
      ? `/api/checklist/${id}/estado`
      : `/api/mantenimientos/${id}/estado`

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, comentarios })
    })

    if (!response.ok) {
      throw new Error('Error al actualizar estado')
    }

    window.location.reload()
  }

  const filteredChecklist = useMemo(() => {
    return checklist.filter(r => {
      const s = searchChecklist.toLowerCase()
      const matchSearch = !searchChecklist || r.operador.toLowerCase().includes(s) || r.equipo.toLowerCase().includes(s)
      const matchEquipo = !filterEquipoChecklist || r.equipo === filterEquipoChecklist
      const matchOp = !filterOperadorChecklist || r.operador === filterOperadorChecklist
      const matchTurno = !filterTurnoChecklist || r.turno === filterTurnoChecklist
      const matchDesde = !filterFechaDesdeChecklist || r.fecha >= filterFechaDesdeChecklist
      const matchHasta = !filterFechaHastaChecklist || r.fecha <= filterFechaHastaChecklist
      return matchSearch && matchEquipo && matchOp && matchTurno && matchDesde && matchHasta
    })
  }, [checklist, searchChecklist, filterEquipoChecklist, filterOperadorChecklist, filterTurnoChecklist, filterFechaDesdeChecklist, filterFechaHastaChecklist])

  const filteredMantenimiento = useMemo(() => {
    return mantenimientos.filter(r => {
      const s = searchMantenimiento.toLowerCase()
      const matchSearch = !searchMantenimiento || r.operador.toLowerCase().includes(s) || r.equipo.toLowerCase().includes(s)
      const matchEquipo = !filterEquipoMantenimiento || r.equipo === filterEquipoMantenimiento
      const matchOp = !filterOperadorMantenimiento || r.operador === filterOperadorMantenimiento
      const matchTurno = !filterTurnoMantenimiento || r.turno === filterTurnoMantenimiento
      const matchDesde = !filterFechaDesdeMantenimiento || r.fecha >= filterFechaDesdeMantenimiento
      const matchHasta = !filterFechaHastaMantenimiento || r.fecha <= filterFechaHastaMantenimiento
      return matchSearch && matchEquipo && matchOp && matchTurno && matchDesde && matchHasta
    })
  }, [mantenimientos, searchMantenimiento, filterEquipoMantenimiento, filterOperadorMantenimiento, filterTurnoMantenimiento, filterFechaDesdeMantenimiento, filterFechaHastaMantenimiento])

  const exportToExcel = () => {
    try {
      const data = activeTab === 'checklist' 
        ? filteredChecklist.map(r => ({
            'Fecha': format(new Date(r.fecha + 'T12:00:00'), 'dd/MM/yyyy', { locale: es }),
            'Turno': r.turno,
            'Operador': r.operador,
            'Equipo': r.equipo,
            'Odómetro Inicial': r.odometro_inicial ? `${r.odometro_inicial} km` : '—',
            ...(esMontacarga(r.equipo) ? {
              'Llantas': r.estado_llantas === 'cumple' ? 'Cumple' : r.estado_llantas === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Horquillas rectas': r.horquillas_rectas === 'cumple' ? 'Cumple' : r.horquillas_rectas === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Seguro horquillas': r.seguro_horquillas_instalado === 'cumple' ? 'Cumple' : r.seguro_horquillas_instalado === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Mástil sin daños': r.mastil_sin_daños === 'cumple' ? 'Cumple' : r.mastil_sin_daños === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Freno responde': r.freno_responde === 'cumple' ? 'Cumple' : r.freno_responde === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Cinturón': r.cinturon_seguridad === 'cumple' ? 'Cumple' : r.cinturon_seguridad === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Luces': r.luces_operativas === 'cumple' ? 'Cumple' : r.luces_operativas === 'no_cumple' ? 'No Cumple' : 'Pendiente',
            } : {
              'Llantas': r.estado_llantas === 'cumple' ? 'Cumple' : r.estado_llantas === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Frenos': r.frenos_operativos === 'cumple' ? 'Cumple' : r.frenos_operativos === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Luces': r.luces_delanteras_traseras === 'cumple' ? 'Cumple' : r.luces_delanteras_traseras === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Cinturón': r.cinturon_seguridad === 'cumple' ? 'Cumple' : r.cinturon_seguridad === 'no_cumple' ? 'No Cumple' : 'Pendiente',
              'Extintor': r.extintor_presente === 'cumple' ? 'Cumple' : r.extintor_presente === 'no_cumple' ? 'No Cumple' : 'Pendiente',
            }),
            'Observaciones': r.observaciones || '—',
            'Estado': r.seguimiento?.estado === 'pendiente' ? 'Pendiente' : r.seguimiento?.estado === 'en_proceso' ? 'En Proceso' : r.seguimiento?.estado === 'finalizado' ? 'Finalizado' : 'Pendiente',
            'Revisado por': r.revisiones?.[r.revisiones.length - 1]?.revisado_por || 'Pendiente',
            'Fecha Revisión': r.revisiones?.[r.revisiones.length - 1]?.revisado_en ? format(new Date(r.revisiones[r.revisiones.length - 1].revisado_en), 'dd/MM/yyyy HH:mm') : '—',
            'Registrado': format(new Date(r.created_at), 'dd/MM/yyyy HH:mm'),
          }))
        : filteredMantenimiento.map(r => ({
            'Fecha': format(new Date(r.fecha + 'T12:00:00'), 'dd/MM/yyyy', { locale: es }),
            'Turno': r.turno,
            'Operador': r.operador,
            'Equipo': r.equipo,
            'Odómetro': r.odometro ? `${r.odometro} km` : '—',
            'Engrase': r.engrase ? 'Sí' : 'No',
            'Sopleteo Equipo': r.sopleteo_equipo ? 'Sí' : 'No',
            'Lavado Equipo': r.lavado_equipo ? 'Sí' : 'No',
            'Sopleteo Filtros': r.sopleteo_filtros ? 'Sí' : 'No',
            'Descripción': r.descripcion || '—',
            'Observaciones': r.observaciones || '—',
            'Estado': r.seguimiento?.estado === 'pendiente' ? 'Pendiente' : r.seguimiento?.estado === 'en_proceso' ? 'En Proceso' : r.seguimiento?.estado === 'finalizado' ? 'Finalizado' : 'Pendiente',
            'Revisado por': r.revisiones?.[r.revisiones.length - 1]?.revisado_por || 'Pendiente',
            'Fecha Revisión': r.revisiones?.[r.revisiones.length - 1]?.revisado_en ? format(new Date(r.revisiones[r.revisiones.length - 1].revisado_en), 'dd/MM/yyyy HH:mm') : '—',
            'Registrado': format(new Date(r.created_at), 'dd/MM/yyyy HH:mm'),
          }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, activeTab === 'checklist' ? 'Checklists' : 'Mantenimientos')
      XLSX.writeFile(wb, `${activeTab === 'checklist' ? 'checklists' : 'mantenimientos'}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`)
    } catch (error) {
      console.error('Error exportando a Excel:', error)
      alert('Error al exportar a Excel')
    }
  }

  const generarReporteGeneral = async () => {
    setGenerandoReporte(true)
    setErrorReporte(null)
    setProgresoReporte(0)

    try {
      const data = activeTab === 'checklist' ? filteredChecklist : filteredMantenimiento

      if (data.length === 0) {
        alert('No hay datos para generar el reporte')
        return
      }

      const titulo = activeTab === 'checklist'
        ? 'REPORTE GENERAL DE CHECKLISTS PRE-OPERACIONALES'
        : 'REPORTE GENERAL DE MANTENIMIENTOS'

      const doc = new jsPDF('portrait')
      const PAGE_W = doc.internal.pageSize.width
      const PAGE_H = doc.internal.pageSize.height
      const MARGIN = 14
      const FOOTER_Y = PAGE_H - 8

      const addFooter = (pageNum: number, totalPages?: number) => {
        doc.setFontSize(7)
        doc.setTextColor(160, 160, 160)
        doc.text(`Sistema de Gestión de Equipos  ·  ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, MARGIN, FOOTER_Y)
        if (totalPages) {
          doc.text(`Página ${pageNum} de ${totalPages}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' })
        }
      }

      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, PAGE_W, 50, 'F')

      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      const tituloLines = doc.splitTextToSize(titulo, PAGE_W - 28)
      doc.text(tituloLines, MARGIN, 22)

      doc.setFontSize(9)
      doc.setTextColor(147, 197, 253)
      doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: es })}`, MARGIN, 42)

      doc.setFontSize(11)
      doc.setTextColor(50, 50, 50)
      doc.text(`Total de registros: ${data.length}`, MARGIN, 65)
      doc.text(`Tipo: ${activeTab === 'checklist' ? 'Checklists Pre-operacionales' : 'Mantenimientos'}`, MARGIN, 75)

      for (let idx = 0; idx < data.length; idx++) {
        const registro = data[idx]

        setProgresoReporte(Math.floor(((idx + 1) / data.length) * 90))

        doc.addPage()

        const fechaRegistro = format(new Date(registro.fecha + 'T12:00:00'), 'dd/MM/yyyy', { locale: es })

        doc.setFillColor(30, 64, 175)
        doc.rect(0, 0, PAGE_W, 14, 'F')
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text(`REGISTRO #${idx + 1}  ·  ${fechaRegistro}`, MARGIN, 9)
        doc.text(`${registro.equipo}  ·  ${registro.operador}`, PAGE_W - MARGIN, 9, { align: 'right' })

        let yPos = 22

        doc.setFontSize(9)
        doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'bold')
        doc.text('DATOS GENERALES', MARGIN, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 3

        const datosGenerales: string[][] = [
          ['Turno:', registro.turno],
          ['Operador:', registro.operador],
          ['Equipo:', registro.equipo],
          ['Estado:', registro.seguimiento?.estado === 'pendiente' ? 'PENDIENTE' : registro.seguimiento?.estado === 'en_proceso' ? 'EN PROCESO' : 'FINALIZADO'],
        ]
        if (activeTab === 'checklist') {
          const c = registro as Checklist
          datosGenerales.push(['Odómetro Inicial:', c.odometro_inicial ? `${c.odometro_inicial} km` : '—'])
        } else {
          const m = registro as Mantenimiento
          datosGenerales.push(['Odómetro:', m.odometro ? `${m.odometro} km` : '—'])
        }

        const ultimaRevision = registro.revisiones?.[registro.revisiones.length - 1]
        if (ultimaRevision) {
          datosGenerales.push(['Revisado por:', ultimaRevision.revisado_por])
          datosGenerales.push(['Fecha revisión:', format(new Date(ultimaRevision.revisado_en), 'dd/MM/yyyy HH:mm', { locale: es })])
          if (ultimaRevision.comentarios) {
            datosGenerales.push(['Comentarios revisión:', ultimaRevision.comentarios])
          }
        } else {
          datosGenerales.push(['Estado revisión:', 'PENDIENTE'])
        }

        autoTable(doc, {
          body: datosGenerales,
          startY: yPos,
          styles: { fontSize: 8.5, cellPadding: 2.5 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 1: { cellWidth: 110 } },
          theme: 'plain',
          margin: { left: MARGIN },
        })
        yPos = (doc as any).lastAutoTable.finalY + 6

        doc.setFontSize(9)
        doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'bold')
        doc.text(activeTab === 'checklist' ? 'INSPECCIÓN DE SEGURIDAD' : 'TAREAS REALIZADAS', MARGIN, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 3

        if (activeTab === 'checklist') {
          const c = registro as Checklist
          const esMonta = esMontacarga(c.equipo)
          const statusLabel = (v: string | null | undefined) =>
            v === 'cumple' ? '✓ CUMPLE' : v === 'no_cumple' ? '✗ NO CUMPLE' : '? PENDIENTE'
          
          if (esMonta) {
            autoTable(doc, {
              body: [
                ['Llantas sin cortes/grietas', statusLabel(c.estado_llantas)],
                ['Horquillas rectas', statusLabel(c.horquillas_rectas)],
                ['Seguro de horquillas instalado', statusLabel(c.seguro_horquillas_instalado)],
                ['Mástil sin daños', statusLabel(c.mastil_sin_daños)],
                ['Cadenas lubricadas', statusLabel(c.cadenas_lubricadas)],
                ['Nivel aceite hidráulico correcto', statusLabel(c.aceite_hidraulico_correcto)],
                ['Mangueras y conexiones sin fugas', statusLabel(c.mangueras_conexiones_sin_fugas)],
                ['Elevación y descenso suave', statusLabel(c.elevacion_descenso_suave)],
                ['Inclinación funciona correctamente', statusLabel(c.inclinacion_funciona)],
                ['Freno responde correctamente', statusLabel(c.freno_responde)],
                ['Freno de estacionamiento funciona', statusLabel(c.freno_estacionamiento_funciona)],
                ['Cinturón de seguridad funcional', statusLabel(c.cinturon_seguridad)],
                ['Bocina audible', statusLabel(c.bocina_audible)],
                ['Luces delanteras y traseras operativas', statusLabel(c.luces_operativas)],
                ['Espejos en buen estado', statusLabel(c.espejos_buen_estado)],
                ['Palancas operan correctamente', statusLabel(c.palancas_operan_correctamente)],
              ],
              startY: yPos,
              styles: { fontSize: 8.5, cellPadding: 3 },
              columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 }, 1: { cellWidth: 45 } },
              theme: 'striped',
              margin: { left: MARGIN },
            })
          } else {
            autoTable(doc, {
              body: [
                ['Llantas', statusLabel(c.estado_llantas)],
                ['Frenos', statusLabel(c.frenos_operativos)],
                ['Luces', statusLabel(c.luces_delanteras_traseras)],
                ['Cinturón de Seguridad', statusLabel(c.cinturon_seguridad)],
                ['Extintor', statusLabel(c.extintor_presente)],
              ],
              startY: yPos,
              styles: { fontSize: 8.5, cellPadding: 3 },
              columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { cellWidth: 45 } },
              theme: 'striped',
              margin: { left: MARGIN },
            })
          }
        } else {
          const m = registro as Mantenimiento
          const doneLabel = (v: boolean) => v ? '✓ REALIZADO' : '✗ NO REALIZADO'
          autoTable(doc, {
            body: [
              ['Engrase General', doneLabel(m.engrase)],
              ['Sopleteo de Equipo', doneLabel(m.sopleteo_equipo)],
              ['Lavado de Equipo', doneLabel(m.lavado_equipo)],
              ['Sopleteo de Filtros', doneLabel(m.sopleteo_filtros)],
            ],
            startY: yPos,
            styles: { fontSize: 8.5, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { cellWidth: 45 } },
            theme: 'striped',
            margin: { left: MARGIN },
          })
        }
        yPos = (doc as any).lastAutoTable.finalY + 6

        if (activeTab !== 'checklist') {
          const m = registro as Mantenimiento
          if (m.descripcion?.trim()) {
            doc.setFontSize(9); doc.setTextColor(30, 64, 175)
            doc.setFont('helvetica', 'bold')
            doc.text('DESCRIPCIÓN:', MARGIN, yPos)
            doc.setFont('helvetica', 'normal')
            yPos += 4
            doc.setFontSize(8.5); doc.setTextColor(60, 60, 60)
            const lines = doc.splitTextToSize(m.descripcion, PAGE_W - MARGIN * 2)
            doc.text(lines, MARGIN, yPos)
            yPos += lines.length * 4.5 + 4
          }
        }

        const obs = activeTab === 'checklist'
          ? (registro as Checklist).observaciones
          : (registro as Mantenimiento).observaciones
        if (obs?.trim()) {
          doc.setFontSize(9); doc.setTextColor(30, 64, 175)
          doc.setFont('helvetica', 'bold')
          doc.text('OBSERVACIONES:', MARGIN, yPos)
          doc.setFont('helvetica', 'normal')
          yPos += 4
          doc.setFontSize(8.5); doc.setTextColor(60, 60, 60)
          const lines = doc.splitTextToSize(obs, PAGE_W - MARGIN * 2)
          doc.text(lines, MARGIN, yPos)
          yPos += lines.length * 4.5 + 6
        }

        const fotos = activeTab === 'checklist'
          ? getFotosChecklist(registro as Checklist)
          : getFotosMantenimiento(registro as Mantenimiento)

        if (fotos.length > 0) {
          doc.setDrawColor(200, 210, 240)
          doc.line(MARGIN, yPos, PAGE_W - MARGIN, yPos)
          yPos += 5

          doc.setFontSize(9); doc.setTextColor(30, 64, 175)
          doc.setFont('helvetica', 'bold')
          doc.text(`FOTOS REGISTRADAS (${fotos.length})`, MARGIN, yPos)
          doc.setFont('helvetica', 'normal')
          yPos += 6

          const IMG_W = 85
          const IMG_H = 64
          const GAP_X = 5
          const GAP_Y = 8
          const LABEL_H = 5

          for (let fi = 0; fi < fotos.length; fi++) {
            const col = fi % 2
            const x = MARGIN + col * (IMG_W + GAP_X)

            if (col === 0 && fi > 0) yPos += IMG_H + LABEL_H + GAP_Y
            if (yPos + IMG_H + LABEL_H > FOOTER_Y - 5) {
              doc.addPage()
              doc.setFillColor(30, 64, 175)
              doc.rect(0, 0, PAGE_W, 10, 'F')
              doc.setFontSize(8); doc.setTextColor(255, 255, 255)
              doc.text(`Registro #${idx + 1}  ·  Fotos (cont.)`, MARGIN, 7)
              yPos = 18
            }

            try {
              const b64 = await imageToBase64(fotos[fi])
              const fmt = b64.startsWith('data:image/png') ? 'PNG'
                : b64.startsWith('data:image/webp') ? 'WEBP'
                : 'JPEG'
              doc.addImage(b64, fmt, x, yPos, IMG_W, IMG_H)
              doc.setDrawColor(200, 210, 240)
              doc.setLineWidth(0.3)
              doc.rect(x, yPos, IMG_W, IMG_H)
            } catch (_e) {
              doc.setFillColor(230, 235, 245)
              doc.rect(x, yPos, IMG_W, IMG_H, 'F')
              doc.setDrawColor(190, 200, 220)
              doc.rect(x, yPos, IMG_W, IMG_H)
              doc.setFontSize(8); doc.setTextColor(140, 150, 170)
              doc.text('Imagen no disponible', x + IMG_W / 2, yPos + IMG_H / 2, { align: 'center' })
            }

            doc.setFontSize(7); doc.setTextColor(120, 130, 150)
            doc.text(`Foto ${fi + 1} de ${fotos.length}`, x, yPos + IMG_H + 4)
          }
        }
      }

      setProgresoReporte(95)
      const totalPages = doc.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        addFooter(p, totalPages)
      }

      setProgresoReporte(100)
      doc.save(
        `${activeTab === 'checklist' ? 'reporte_general_checklists' : 'reporte_general_mantenimientos'}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`
      )

    } catch (error) {
      console.error('Error generando reporte:', error)
      const msg = error instanceof Error ? error.message : 'Error desconocido'
      setErrorReporte(msg)
      alert(`Error al generar el reporte: ${msg}`)
    } finally {
      setGenerandoReporte(false)
      setProgresoReporte(0)
    }
  }

  const generarReporteIndividual = async (registro: Checklist | Mantenimiento, tipo: 'checklist' | 'mantenimiento') => {
    setGenerandoReporte(true)
    setErrorReporte(null)

    try {
      const doc = new jsPDF()
      const PAGE_W = doc.internal.pageSize.width
      const PAGE_H = doc.internal.pageSize.height
      const MARGIN = 14
      const FOOTER_Y = PAGE_H - 8

      const fechaRegistro = format(new Date(registro.fecha + 'T12:00:00'), 'dd/MM/yyyy', { locale: es })

      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, PAGE_W, 16, 'F')
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text(tipo === 'checklist' ? 'CHECKLIST PRE-OPERACIONAL' : 'REPORTE DE MANTENIMIENTO', MARGIN, 10)
      doc.setFontSize(8); doc.setTextColor(147, 197, 253)
      doc.text(`Fecha: ${fechaRegistro}`, PAGE_W - MARGIN, 10, { align: 'right' })

      doc.setDrawColor(200, 210, 240)
      doc.line(MARGIN, 20, PAGE_W - MARGIN, 20)

      let yPos = 28

      doc.setFontSize(9); doc.setTextColor(30, 64, 175)
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS GENERALES', MARGIN, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 3

      const datosGenerales: string[][] = [
        ['Turno:', registro.turno],
        ['Operador:', registro.operador],
        ['Equipo:', registro.equipo],
        ['Estado:', registro.seguimiento?.estado === 'pendiente' ? 'PENDIENTE' : registro.seguimiento?.estado === 'en_proceso' ? 'EN PROCESO' : 'FINALIZADO'],
      ]
      if (tipo === 'checklist') {
        const c = registro as Checklist
        datosGenerales.push(['Odómetro Inicial:', c.odometro_inicial ? `${c.odometro_inicial} km` : '—'])
      } else {
        const m = registro as Mantenimiento
        datosGenerales.push(['Odómetro:', m.odometro ? `${m.odometro} km` : '—'])
      }

      const ultimaRevision = registro.revisiones?.[registro.revisiones.length - 1]
      if (ultimaRevision) {
        datosGenerales.push(['Revisado por:', ultimaRevision.revisado_por])
        datosGenerales.push(['Fecha revisión:', format(new Date(ultimaRevision.revisado_en), 'dd/MM/yyyy HH:mm', { locale: es })])
        if (ultimaRevision.comentarios) {
          datosGenerales.push(['Comentarios revisión:', ultimaRevision.comentarios])
        }
      } else {
        datosGenerales.push(['Estado revisión:', 'PENDIENTE'])
      }

      autoTable(doc, {
        body: datosGenerales,
        startY: yPos,
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42 }, 1: { cellWidth: 110 } },
        theme: 'plain',
        margin: { left: MARGIN },
      })
      yPos = (doc as any).lastAutoTable.finalY + 8

      doc.setFontSize(9); doc.setTextColor(30, 64, 175)
      doc.setFont('helvetica', 'bold')
      doc.text(tipo === 'checklist' ? 'INSPECCIÓN DE SEGURIDAD' : 'TAREAS REALIZADAS', MARGIN, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 3

      if (tipo === 'checklist') {
        const c = registro as Checklist
        const esMonta = esMontacarga(c.equipo)
        const s = (v: string | null | undefined) => 
          v === 'cumple' ? '✓ CUMPLE' : v === 'no_cumple' ? '✗ NO CUMPLE' : '? PENDIENTE'
        
        if (esMonta) {
          autoTable(doc, {
            body: [
              ['Llantas sin cortes/grietas', s(c.estado_llantas)],
              ['Horquillas rectas', s(c.horquillas_rectas)],
              ['Seguro de horquillas instalado', s(c.seguro_horquillas_instalado)],
              ['Mástil sin daños', s(c.mastil_sin_daños)],
              ['Cadenas lubricadas', s(c.cadenas_lubricadas)],
              ['Nivel aceite hidráulico correcto', s(c.aceite_hidraulico_correcto)],
              ['Mangueras y conexiones sin fugas', s(c.mangueras_conexiones_sin_fugas)],
              ['Elevación y descenso suave', s(c.elevacion_descenso_suave)],
              ['Inclinación funciona correctamente', s(c.inclinacion_funciona)],
              ['Freno responde correctamente', s(c.freno_responde)],
              ['Freno de estacionamiento funciona', s(c.freno_estacionamiento_funciona)],
              ['Cinturón de seguridad funcional', s(c.cinturon_seguridad)],
              ['Bocina audible', s(c.bocina_audible)],
              ['Luces delanteras y traseras operativas', s(c.luces_operativas)],
              ['Espejos en buen estado', s(c.espejos_buen_estado)],
              ['Palancas operan correctamente', s(c.palancas_operan_correctamente)],
            ],
            startY: yPos,
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 }, 1: { cellWidth: 55 } },
            theme: 'striped',
            margin: { left: MARGIN },
          })
        } else {
          autoTable(doc, {
            body: [
              ['Llantas', s(c.estado_llantas)],
              ['Frenos', s(c.frenos_operativos)],
              ['Luces', s(c.luces_delanteras_traseras)],
              ['Cinturón de Seguridad', s(c.cinturon_seguridad)],
              ['Extintor', s(c.extintor_presente)],
            ],
            startY: yPos,
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { cellWidth: 55 } },
            theme: 'striped',
            margin: { left: MARGIN },
          })
        }
      } else {
        const m = registro as Mantenimiento
        const d = (v: boolean) => v ? '✓ REALIZADO' : '✗ NO REALIZADO'
        autoTable(doc, {
          body: [
            ['Engrase General', d(m.engrase)],
            ['Sopleteo de Equipo', d(m.sopleteo_equipo)],
            ['Lavado de Equipo', d(m.lavado_equipo)],
            ['Sopleteo de Filtros', d(m.sopleteo_filtros)],
          ],
          startY: yPos,
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { cellWidth: 55 } },
          theme: 'striped',
          margin: { left: MARGIN },
        })
      }
      yPos = (doc as any).lastAutoTable.finalY + 8

      if (tipo !== 'checklist') {
        const m = registro as Mantenimiento
        if (m.descripcion?.trim()) {
          doc.setFontSize(9); doc.setTextColor(30, 64, 175)
          doc.setFont('helvetica', 'bold')
          doc.text('DESCRIPCIÓN:', MARGIN, yPos)
          doc.setFont('helvetica', 'normal')
          yPos += 4
          doc.setFontSize(8.5); doc.setTextColor(60, 60, 60)
          const lines = doc.splitTextToSize(m.descripcion, PAGE_W - MARGIN * 2)
          doc.text(lines, MARGIN, yPos)
          yPos += lines.length * 4.5 + 6
        }
      }

      const obs = tipo === 'checklist'
        ? (registro as Checklist).observaciones
        : (registro as Mantenimiento).observaciones
      if (obs?.trim()) {
        doc.setFontSize(9); doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'bold')
        doc.text('OBSERVACIONES:', MARGIN, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 4
        doc.setFontSize(8.5); doc.setTextColor(60, 60, 60)
        const lines = doc.splitTextToSize(obs, PAGE_W - MARGIN * 2)
        doc.text(lines, MARGIN, yPos)
        yPos += lines.length * 4.5 + 6
      }

      const fotos = tipo === 'checklist'
        ? getFotosChecklist(registro as Checklist)
        : getFotosMantenimiento(registro as Mantenimiento)

      if (fotos.length > 0) {
        doc.setDrawColor(200, 210, 240)
        doc.line(MARGIN, yPos, PAGE_W - MARGIN, yPos)
        yPos += 5

        doc.setFontSize(9); doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'bold')
        doc.text(`FOTOS REGISTRADAS (${fotos.length})`, MARGIN, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 6

        const IMG_W = 85
        const IMG_H = 64
        const GAP_X = 5
        const GAP_Y = 8
        const LABEL_H = 5

        for (let fi = 0; fi < fotos.length; fi++) {
          const col = fi % 2
          const x = MARGIN + col * (IMG_W + GAP_X)

          if (col === 0 && fi > 0) yPos += IMG_H + LABEL_H + GAP_Y
          if (yPos + IMG_H + LABEL_H > FOOTER_Y - 5) {
            doc.addPage()
            doc.setFillColor(30, 64, 175)
            doc.rect(0, 0, PAGE_W, 10, 'F')
            doc.setFontSize(8); doc.setTextColor(255, 255, 255)
            doc.text('Fotos (continuación)', MARGIN, 7)
            yPos = 18
          }

          try {
            const b64 = await imageToBase64(fotos[fi])
            const fmt = b64.startsWith('data:image/png') ? 'PNG'
              : b64.startsWith('data:image/webp') ? 'WEBP'
              : 'JPEG'
            doc.addImage(b64, fmt, x, yPos, IMG_W, IMG_H)
            doc.setDrawColor(200, 210, 240)
            doc.setLineWidth(0.3)
            doc.rect(x, yPos, IMG_W, IMG_H)
          } catch (_e) {
            doc.setFillColor(230, 235, 245)
            doc.rect(x, yPos, IMG_W, IMG_H, 'F')
            doc.setDrawColor(190, 200, 220)
            doc.rect(x, yPos, IMG_W, IMG_H)
            doc.setFontSize(8); doc.setTextColor(140, 150, 170)
            doc.text('Imagen no disponible', x + IMG_W / 2, yPos + IMG_H / 2, { align: 'center' })
          }

          doc.setFontSize(7); doc.setTextColor(120, 130, 150)
          doc.text(`Foto ${fi + 1} de ${fotos.length}`, x, yPos + IMG_H + 4)
        }
      }

      const totalPages = doc.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.setFontSize(7); doc.setTextColor(160, 160, 160)
        doc.text(`Sistema de Gestión de Equipos  ·  ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, MARGIN, FOOTER_Y)
        doc.text(`Página ${p} de ${totalPages}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' })
      }

      doc.save(`${tipo}_${registro.id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)

    } catch (error) {
      console.error('Error generando reporte individual:', error)
      alert(`Error al generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setGenerandoReporte(false)
    }
  }

  const stats = [
    { label: 'Total Checklists', value: checklist.length, icon: FaClipboardCheck, color: 'text-blue-400' },
    { label: 'Total Mantenimientos', value: mantenimientos.length, icon: FaWrench, color: 'text-green-400' },
    { label: 'Pendientes', value: checklist.filter(c => c.seguimiento?.estado === 'pendiente').length + mantenimientos.filter(m => m.seguimiento?.estado === 'pendiente').length, icon: FaClock, color: 'text-yellow-400' },
    { label: 'En Proceso', value: checklist.filter(c => c.seguimiento?.estado === 'en_proceso').length + mantenimientos.filter(m => m.seguimiento?.estado === 'en_proceso').length, icon: FaClock, color: 'text-blue-400' },
    { label: 'Finalizados', value: checklist.filter(c => c.seguimiento?.estado === 'finalizado').length + mantenimientos.filter(m => m.seguimiento?.estado === 'finalizado').length, icon: FaCheckCircle, color: 'text-green-400' },
    { label: 'Engrases', value: mantenimientos.filter(m => m.engrase).length, icon: FaOilCan, color: 'text-green-400' },
    { label: 'Equipos activos', value: new Set([...checklist.map(c => c.equipo), ...mantenimientos.map(m => m.equipo)]).size, icon: FaTractor, color: 'text-orange-400' },
    { label: 'Operadores', value: new Set([...checklist.map(c => c.operador), ...mantenimientos.map(m => m.operador)]).size, icon: FaUser, color: 'text-purple-400' },
  ]

  function clearFiltersChecklist() {
    setSearchChecklist(''); setFilterEquipoChecklist(''); setFilterOperadorChecklist('')
    setFilterTurnoChecklist(''); setFilterFechaDesdeChecklist(''); setFilterFechaHastaChecklist('')
  }

  function clearFiltersMantenimiento() {
    setSearchMantenimiento(''); setFilterEquipoMantenimiento(''); setFilterOperadorMantenimiento('')
    setFilterTurnoMantenimiento(''); setFilterFechaDesdeMantenimiento(''); setFilterFechaHastaMantenimiento('')
  }

  async function eliminarChecklist(id: string) {
    if (!confirm('¿Eliminar este checklist?')) return
    setEliminando(true)
    try {
      const response = await fetch(`/api/checklist/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      window.location.reload()
    } catch (error) {
      alert('Error al eliminar')
    } finally {
      setEliminando(false)
    }
  }

  async function eliminarMantenimiento(id: string) {
    if (!confirm('¿Eliminar este mantenimiento?')) return
    setEliminando(true)
    try {
      const response = await fetch(`/api/mantenimientos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      window.location.reload()
    } catch (error) {
      alert('Error al eliminar')
    } finally {
      setEliminando(false)
    }
  }

  const hasFiltersChecklist = searchChecklist || filterEquipoChecklist || filterOperadorChecklist || filterTurnoChecklist || filterFechaDesdeChecklist || filterFechaHastaChecklist
  const hasFiltersMantenimiento = searchMantenimiento || filterEquipoMantenimiento || filterOperadorMantenimiento || filterTurnoMantenimiento || filterFechaDesdeMantenimiento || filterFechaHastaMantenimiento

  // Función para obtener los items de inspección según el equipo
  const getItemsInspeccion = (r: Checklist) => {
    if (esMontacarga(r.equipo)) {
      return [
        { value: r.estado_llantas, label: 'Llantas', icon: FaCircle },
        { value: r.horquillas_rectas, label: 'Horquillas', icon: FaGripLines },
        { value: r.seguro_horquillas_instalado, label: 'Seguro', icon: FaLock },
        { value: r.mastil_sin_daños, label: 'Mástil', icon: FaArrowUp },
        { value: r.freno_responde, label: 'Freno', icon: FaCar },
        { value: r.cinturon_seguridad, label: 'Cinturón', icon: FaLock },
        { value: r.luces_operativas, label: 'Luces', icon: FaLightbulb },
        { value: r.bocina_audible, label: 'Bocina', icon: FaVolumeUp },
      ]
    } else {
      return [
        { value: r.estado_llantas, label: 'Llantas', icon: FaCircle },
        { value: r.frenos_operativos, label: 'Frenos', icon: FaCar },
        { value: r.luces_delanteras_traseras, label: 'Luces', icon: FaLightbulb },
        { value: r.cinturon_seguridad, label: 'Cinturón', icon: FaLock },
        { value: r.extintor_presente, label: 'Extintor', icon: FaFireExtinguisher },
      ]
    }
  }

  const getNoCumpleCount = (r: Checklist) => {
    if (esMontacarga(r.equipo)) {
      const items = [
        r.estado_llantas, r.horquillas_rectas, r.seguro_horquillas_instalado,
        r.mastil_sin_daños, r.cadenas_lubricadas, r.aceite_hidraulico_correcto,
        r.mangueras_conexiones_sin_fugas, r.elevacion_descenso_suave, r.inclinacion_funciona,
        r.freno_responde, r.freno_estacionamiento_funciona, r.cinturon_seguridad,
        r.bocina_audible, r.luces_operativas, r.espejos_buen_estado, r.palancas_operan_correctamente
      ]
      return items.filter(v => v === 'no_cumple').length
    } else {
      const items = [
        r.estado_llantas, r.presion_llantas, r.nivel_aceite_motor,
        r.nivel_aceite_hidraulico, r.nivel_refrigerante, r.fugas_visibles,
        r.mangueras_sin_fuga, r.cilindros_hidraulicos, r.cucharon_buen_estado,
        r.frenos_operativos, r.direccion_sin_juego, r.luces_delanteras_traseras,
        r.alarma_retroceso, r.bocina_funcional, r.cabina_limpia, r.cinturon_seguridad,
        r.espejos_retrovisores, r.extintor_presente, r.chasis_sin_daños, r.guardas_protecciones
      ]
      return items.filter(v => v === 'no_cumple').length
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4">
              <Icon className="text-2xl mb-2 text-gray-400" />
              <div className={clsx('font-display text-3xl', s.color)}>{s.value}</div>
              <div className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mt-1 leading-tight">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/equipos" className="btn-primary text-base px-6 py-2.5 flex items-center gap-2">
          <FaQrcode /> Gestionar Equipos & QR
        </Link>
        <a href="/registro" target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-6 py-2.5 flex items-center gap-2">
          <FaExternalLinkAlt /> Ver Formulario Público ↗
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('checklist')}
          className={clsx(
            'px-6 py-3 font-semibold transition-all flex items-center gap-2',
            activeTab === 'checklist'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <FaClipboardCheck /> Checklist Pre-operacional
          <span className="text-xs bg-dark-mid px-2 py-0.5 rounded-full">{checklist.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('mantenimiento')}
          className={clsx(
            'px-6 py-3 font-semibold transition-all flex items-center gap-2',
            activeTab === 'mantenimiento'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <FaWrench /> Mantenimientos
          <span className="text-xs bg-dark-mid px-2 py-0.5 rounded-full">{mantenimientos.length}</span>
        </button>
      </div>

      {/* Botones de exportación */}
      <div className="flex gap-3 justify-end">
        <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm">
          <FaFileExcel /> Exportar a Excel
        </button>
        <button onClick={generarReporteGeneral} disabled={generandoReporte} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm disabled:opacity-50">
          <FaFilePdf />
          {generandoReporte && progresoReporte > 0 ? `Generando... ${progresoReporte}%` : 'Reporte General PDF'}
        </button>
      </div>

      {generandoReporte && progresoReporte > 0 && (
        <div className="w-full bg-dark-mid rounded-full h-2 overflow-hidden">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progresoReporte}%` }} />
        </div>
      )}

      {errorReporte && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
          <span>Error: {errorReporte}</span>
          <button onClick={() => setErrorReporte(null)} className="ml-4 hover:text-red-300"><FaTimes /></button>
        </div>
      )}

      {/* TABLA CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="card">
          <div className="section-header justify-between">
            <span className="flex items-center gap-2"><FaSearch /> Filtros - Checklist</span>
            {hasFiltersChecklist && (
              <button onClick={clearFiltersChecklist} className="font-mono text-xs text-gray-400 hover:text-amarillo flex items-center gap-1">
                <FaTimes /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <input type="text" placeholder="Buscar..." value={searchChecklist} onChange={(e) => setSearchChecklist(e.target.value)} className="input-base" />
            <select value={filterEquipoChecklist} onChange={(e) => setFilterEquipoChecklist(e.target.value)} className="input-base">
              <option value="">Todos los equipos</option>
              {EQUIPOS.map((eq) => <option key={eq}>{eq}</option>)}
            </select>
            <select value={filterOperadorChecklist} onChange={(e) => setFilterOperadorChecklist(e.target.value)} className="input-base">
              <option value="">Todos los operadores</option>
              {OPERADORES.map((op) => <option key={op}>{op}</option>)}
            </select>
            <select value={filterTurnoChecklist} onChange={(e) => setFilterTurnoChecklist(e.target.value)} className="input-base">
              <option value="">Todos los turnos</option>
              {TURNOS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input type="date" value={filterFechaDesdeChecklist} onChange={(e) => setFilterFechaDesdeChecklist(e.target.value)} className="input-base" placeholder="Desde" />
            <input type="date" value={filterFechaHastaChecklist} onChange={(e) => setFilterFechaHastaChecklist(e.target.value)} className="input-base" placeholder="Hasta" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Fecha', 'Turno', 'Operador', 'Equipo', 'Odómetro', 'Inspección', 'Observaciones', 'Fotos', 'Estado', 'Registrado', 'Acciones', 'Reporte', 'Revisión'].map((h) => (
                    <th key={h} className="text-left font-mono text-xs text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredChecklist.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-16 text-gray-500">Sin registros encontrados</td></tr>
                ) : (
                  filteredChecklist.map((r, i) => {
                    const noCumpleCount = getNoCumpleCount(r)
                    const fotos = getFotosChecklist(r)
                    const tieneFotos = fotos.length > 0
                    const itemsInspeccion = getItemsInspeccion(r)

                    return (
                      <tr key={r.id} className={clsx('border-b border-dark-border/40 hover:bg-dark-mid/50', i % 2 === 0 ? '' : 'bg-dark-card/20')}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                          {format(new Date(r.fecha + 'T12:00:00'), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3"><span className="tag bg-dark-mid text-gray-300">{r.turno}</span></td>
                        <td className="px-4 py-3 text-gray-200">{r.operador}</td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            'tag',
                            esMontacarga(r.equipo) ? 'bg-purple-500/20 text-purple-400' : 'bg-amarillo/10 text-amarillo'
                          )}>
                            {r.equipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {r.odometro_inicial ? <span className="text-blue-400">{r.odometro_inicial.toLocaleString()} km</span> : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 min-w-[160px]">
                            {itemsInspeccion.map((item) => {
                              const Icon = item.icon
                              return (
                                <div key={item.label} className="flex items-center gap-2">
                                  {item.value === 'cumple' && <FaCheckCircle className="text-green-500 text-xs" />}
                                  {item.value === 'no_cumple' && <FaTimesCircle className="text-red-500 text-xs" />}
                                  {(!item.value || item.value === 'pendiente') && <FaQuestionCircle className="text-gray-500 text-xs" />}
                                  <Icon className="text-gray-500 text-[10px]" />
                                  <span className="font-mono text-[10px] text-gray-400">{item.label}</span>
                                </div>
                              )
                            })}
                            {noCumpleCount > 0 && (
                              <span className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                                <FaExclamationTriangle /> {noCumpleCount} no cumplen
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {r.observaciones ? (
                            <div className="max-w-[200px]"><p className="text-xs text-gray-400 break-words whitespace-pre-wrap">{r.observaciones}</p></div>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {tieneFotos ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => abrirGaleria(fotos)} className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded text-xs transition">
                                <FaImages /> {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
                              </button>
                              <div className="flex -space-x-2">
                                {fotos.slice(0, 3).map((foto, idx) => (
                                  <div key={idx} onClick={() => abrirGaleria(fotos)} className="w-6 h-6 rounded-full overflow-hidden border border-dark-border bg-dark-mid cursor-pointer hover:border-amarillo transition">
                                    <img src={foto} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {fotos.length > 3 && (
                                  <div onClick={() => abrirGaleria(fotos)} className="w-6 h-6 rounded-full bg-dark-mid border border-dark-border flex items-center justify-center text-[10px] text-gray-400 cursor-pointer hover:border-amarillo hover:text-amarillo transition">
                                    +{fotos.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SeguimientoStatus 
                            seguimiento={r.seguimiento}
                            onCambiarEstado={(estado, comentarios) => 
                              actualizarEstado(r.id, 'checklist', estado, comentarios)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                          {format(new Date(r.created_at), 'dd/MM HH:mm')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => eliminarChecklist(r.id)} disabled={eliminando} className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-red-500/30 flex items-center gap-1 transition">
                            <FaTrash /> Eliminar
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => generarReporteIndividual(r, 'checklist')} disabled={generandoReporte} className="text-blue-500 hover:text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30 flex items-center gap-1 transition disabled:opacity-50">
                            <FaFilePdf /> Reporte
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <RevisionStatusBadge revisiones={r.revisiones} />
                            <button onClick={() => { setRegistroSeleccionado({ id: r.id, tipo: 'checklist', revisiones: r.revisiones, registro: r }); setModalRevisionAbierto(true); }} className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded flex items-center gap-1 transition">
                              <FaUserCheck size={10} /> Revisar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLA MANTENIMIENTO */}
      {activeTab === 'mantenimiento' && (
        <div className="card">
          <div className="section-header justify-between">
            <span className="flex items-center gap-2"><FaSearch /> Filtros - Mantenimientos</span>
            {hasFiltersMantenimiento && (
              <button onClick={clearFiltersMantenimiento} className="font-mono text-xs text-gray-400 hover:text-amarillo flex items-center gap-1">
                <FaTimes /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <input type="text" placeholder="Buscar..." value={searchMantenimiento} onChange={(e) => setSearchMantenimiento(e.target.value)} className="input-base" />
            <select value={filterEquipoMantenimiento} onChange={(e) => setFilterEquipoMantenimiento(e.target.value)} className="input-base">
              <option value="">Todos los equipos</option>
              {EQUIPOS.map((eq) => <option key={eq}>{eq}</option>)}
            </select>
            <select value={filterOperadorMantenimiento} onChange={(e) => setFilterOperadorMantenimiento(e.target.value)} className="input-base">
              <option value="">Todos los operadores</option>
              {OPERADORES.map((op) => <option key={op}>{op}</option>)}
            </select>
            <select value={filterTurnoMantenimiento} onChange={(e) => setFilterTurnoMantenimiento(e.target.value)} className="input-base">
              <option value="">Todos los turnos</option>
              {TURNOS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input type="date" value={filterFechaDesdeMantenimiento} onChange={(e) => setFilterFechaDesdeMantenimiento(e.target.value)} className="input-base" placeholder="Desde" />
            <input type="date" value={filterFechaHastaMantenimiento} onChange={(e) => setFilterFechaHastaMantenimiento(e.target.value)} className="input-base" placeholder="Hasta" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Fecha', 'Turno', 'Operador', 'Equipo', 'Odómetro', 'Tareas Realizadas', 'Observaciones', 'Fotos', 'Estado', 'Registrado', 'Acciones', 'Reporte', 'Revisión'].map((h) => (
                    <th key={h} className="text-left font-mono text-xs text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMantenimiento.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-16 text-gray-500">Sin registros encontrados</td></tr>
                ) : (
                  filteredMantenimiento.map((r, i) => {
                    const fotos = getFotosMantenimiento(r)
                    const tieneFotos = fotos.length > 0

                    return (
                      <tr key={r.id} className={clsx('border-b border-dark-border/40 hover:bg-dark-mid/50', i % 2 === 0 ? '' : 'bg-dark-card/20')}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                          {format(new Date(r.fecha + 'T12:00:00'), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3"><span className="tag bg-dark-mid text-gray-300">{r.turno}</span></td>
                        <td className="px-4 py-3 text-gray-200">{r.operador}</td>
                        <td className="px-4 py-3"><span className="tag bg-amarillo/10 text-amarillo">{r.equipo}</span></td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {r.odometro ? <span className="text-blue-400">{r.odometro.toLocaleString()} km</span> : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {r.engrase && <div className="flex items-center gap-2"><FaOilCan className="text-green-400 text-xs" /><span className="text-xs text-gray-300">Engrase General</span></div>}
                            {r.sopleteo_equipo && <div className="flex items-center gap-2"><FaWind className="text-blue-400 text-xs" /><span className="text-xs text-gray-300">Sopleteo de Equipo</span></div>}
                            {r.lavado_equipo && <div className="flex items-center gap-2"><FaWater className="text-cyan-400 text-xs" /><span className="text-xs text-gray-300">Lavado de Equipo</span></div>}
                            {r.sopleteo_filtros && <div className="flex items-center gap-2"><FaWind className="text-purple-400 text-xs" /><span className="text-xs text-gray-300">Sopleteo de Filtros</span></div>}
                            {!r.engrase && !r.sopleteo_equipo && !r.lavado_equipo && !r.sopleteo_filtros && <span className="text-gray-600 text-xs">—</span>}
                          </div>
                          {r.descripcion && <p className="text-xs text-gray-500 mt-1">{r.descripcion}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{r.observaciones || '—'}</td>
                        <td className="px-4 py-3">
                          {tieneFotos ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => abrirGaleria(fotos)} className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded text-xs transition">
                                <FaImages /> {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
                              </button>
                              <div className="flex -space-x-2">
                                {fotos.slice(0, 3).map((foto, idx) => (
                                  <div key={idx} onClick={() => abrirGaleria(fotos)} className="w-6 h-6 rounded-full overflow-hidden border border-dark-border bg-dark-mid cursor-pointer hover:border-amarillo transition">
                                    <img src={foto} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {fotos.length > 3 && (
                                  <div onClick={() => abrirGaleria(fotos)} className="w-6 h-6 rounded-full bg-dark-mid border border-dark-border flex items-center justify-center text-[10px] text-gray-400 cursor-pointer hover:border-amarillo hover:text-amarillo transition">
                                    +{fotos.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SeguimientoStatus 
                            seguimiento={r.seguimiento}
                            onCambiarEstado={(estado, comentarios) => 
                              actualizarEstado(r.id, 'mantenimiento', estado, comentarios)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                          {format(new Date(r.created_at), 'dd/MM HH:mm')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => eliminarMantenimiento(r.id)} disabled={eliminando} className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-red-500/30 flex items-center gap-1 transition">
                            <FaTrash /> Eliminar
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => generarReporteIndividual(r, 'mantenimiento')} disabled={generandoReporte} className="text-blue-500 hover:text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30 flex items-center gap-1 transition disabled:opacity-50">
                            <FaFilePdf /> Reporte
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <RevisionStatusBadge revisiones={r.revisiones} />
                            <button onClick={() => { setRegistroSeleccionado({ id: r.id, tipo: 'mantenimiento', revisiones: r.revisiones, registro: r }); setModalRevisionAbierto(true); }} className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded flex items-center gap-1 transition">
                              <FaUserCheck size={10} /> Revisar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox foto individual */}
      {selectedFoto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFoto(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedFoto(null)} className="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm flex items-center gap-1">
              <FaTimes /> Cerrar
            </button>
            <Image src={selectedFoto} alt="Foto" width={800} height={600} className="rounded-lg object-contain w-full" />
          </div>
        </div>
      )}

      {/* Galería de múltiples fotos */}
      {galeriaAbierta && fotosGaleria.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4" onClick={() => setGaleriaAbierta(false)}>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm font-mono">{fotoActualIndex + 1} / {fotosGaleria.length}</span>
            <button onClick={() => setGaleriaAbierta(false)} className="text-white bg-black/50 hover:bg-red-500 rounded-full p-2 transition"><FaTimes size={20} /></button>
          </div>
          {fotosGaleria.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); anteriorFoto() }} disabled={fotoActualIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white disabled:opacity-30 disabled:cursor-not-allowed transition z-10"><FaChevronLeft size={28} /></button>
              <button onClick={(e) => { e.stopPropagation(); siguienteFoto() }} disabled={fotoActualIndex === fotosGaleria.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white disabled:opacity-30 disabled:cursor-not-allowed transition z-10"><FaChevronRight size={28} /></button>
            </>
          )}
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={fotosGaleria[fotoActualIndex]} alt={`Foto ${fotoActualIndex + 1}`} className="rounded-lg w-full h-auto max-h-[85vh] object-contain" />
          </div>
          {fotosGaleria.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4 py-2">
              {fotosGaleria.map((foto, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setFotoActualIndex(idx) }} className={clsx('w-12 h-12 rounded overflow-hidden border-2 transition flex-shrink-0', idx === fotoActualIndex ? 'border-amarillo' : 'border-transparent opacity-60 hover:opacity-100')}>
                  <img src={foto} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Revisión */}
      {registroSeleccionado && registroSeleccionado.registro && (
        <ModalRevision
          isOpen={modalRevisionAbierto}
          onClose={() => { setModalRevisionAbierto(false); setRegistroSeleccionado(null); }}
          onConfirm={agregarRevision}
          revisiones={registroSeleccionado.revisiones}
          tipo={registroSeleccionado.tipo}
          registro={registroSeleccionado.registro}
        />
      )}
    </main>
  )
}
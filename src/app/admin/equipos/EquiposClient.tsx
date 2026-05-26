'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { EQUIPOS } from '@/lib/constants'
import jsPDF from 'jspdf'
import clsx from 'clsx'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

export default function EquiposClient({ countByEquipo }: { countByEquipo: Record<string, number> }) {
  const [selectedEquipo, setSelectedEquipo] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedEquipo) return
    const url = `${APP_URL}/registro/${encodeURIComponent(selectedEquipo)}`
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }).then(dataUrl => {
      setQrDataUrl(dataUrl)
      setShowModal(true)
    })
  }, [selectedEquipo])

  function handleGenerateQR(equipo: string) {
    setSelectedEquipo(equipo)
  }

  function closeModal() {
    setShowModal(false)
    setSelectedEquipo(null)
    setQrDataUrl(null)
  }

  function downloadQR() {
    if (!qrDataUrl || !selectedEquipo) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `QR-${selectedEquipo}.png`
    a.click()
  }

  function printQR() {
    if (!printRef.current) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR - ${selectedEquipo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: sans-serif; }
          .print-card { text-align: center; border: 3px solid #000; border-radius: 12px; padding: 32px; max-width: 320px; }
          .icon { font-size: 48px; margin-bottom: 12px; }
          .equipo { font-size: 36px; font-weight: 900; letter-spacing: 4px; margin-bottom: 8px; color: #000; }
          .label { font-size: 12px; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
          img { width: 240px; height: 240px; border: 2px solid #eee; border-radius: 8px; }
          .url { font-size: 10px; color: #888; margin-top: 16px; word-break: break-all; }
          .instruction { font-size: 13px; color: #333; margin-top: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="print-card">
          <div class="icon">🚜</div>
          <div class="equipo">${selectedEquipo}</div>
          <div class="label">Escanea para registrar mantenimiento</div>
          <img src="${qrDataUrl}" alt="QR">
          <div class="instruction">📱 Apunta tu cámara al código QR</div>
          <div class="url">${APP_URL}/registro/${selectedEquipo}</div>
        </div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  async function generateAllQRsPDF() {
    setIsGeneratingPDF(true)
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    
    // 2x2 grid (4 QR per page)
    const cols = 2
    const rows = 2
    const qrSize = 70 // mm
    const startX = (pageWidth - (cols * qrSize)) / 2
    const startY = 20 // mm from top
    
    let currentPage = 0
    let currentIndex = 0
    
    // Add title page
    pdf.setFontSize(24)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Códigos QR - Equipos', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' })
    pdf.setFontSize(14)
    pdf.text(`Total de equipos: ${EQUIPOS.length}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' })
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' })
    
    // Process all equipos
    for (let i = 0; i < EQUIPOS.length; i++) {
      const equipo = EQUIPOS[i]
      const url = `${APP_URL}/registro/${encodeURIComponent(equipo)}`
      
      // Generate QR as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      })
      
      // Convert data URL to image for PDF
      const imgData = qrDataUrl
      
      // Calculate position on page
      const col = currentIndex % cols
      const row = Math.floor(currentIndex / cols) % rows
      const x = startX + (col * qrSize)
      const y = startY + (row * (qrSize + 20)) // +20 for spacing and text
      
      // Add QR code to PDF
      pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize)
      
      // Add unit name below QR
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text(equipo, x + (qrSize / 2), y + qrSize + 8, { align: 'center' })
      
      // Add small URL text
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      const shortUrl = url.replace('https://', '').replace('http://', '')
      pdf.text(shortUrl, x + (qrSize / 2), y + qrSize + 14, { align: 'center' })
      
      currentIndex++
      
      // Add new page if we've filled the current page or if it's the last item
      if ((currentIndex % (cols * rows) === 0 && currentIndex < EQUIPOS.length) || 
          (i === EQUIPOS.length - 1 && currentIndex % (cols * rows) !== 0)) {
        if (i < EQUIPOS.length - 1) {
          pdf.addPage()
        }
      }
    }
    
    // Save the PDF
    pdf.save('todos-los-qr-equipos.pdf')
    setIsGeneratingPDF(false)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl tracking-widest text-amarillo">Equipos & QR</h2>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mt-1">
            Genera códigos QR para registrar mantenimiento por equipo
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateAllQRsPDF} 
            disabled={isGeneratingPDF}
            className="btn-secondary text-base px-6 py-2.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? '⏳ Generando PDF...' : '📄 Descargar todos los QR en PDF'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amarillo/10 border border-amarillo/30 rounded-lg p-4 flex gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div className="font-mono text-xs text-amarillo/80 leading-relaxed">
          Cada equipo tiene su propio QR único. Al escanearlo, el operador accede directamente al formulario
          de registro con el equipo pre-seleccionado. Imprime el QR y pégalo en el tractor correspondiente.
          <br />
          <strong className="text-amarillo">✨ Nuevo:</strong> Descarga todos los QR en un solo PDF con 4 QR por página.
        </div>
      </div>

      {/* Equipos grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EQUIPOS.map(equipo => {
          const count = countByEquipo[equipo] ?? 0
          const url = `${APP_URL}/registro/${encodeURIComponent(equipo)}`

          return (
            <div key={equipo} className="card group hover:border-amarillo transition-colors">
              {/* Top bar */}
              <div className="bg-dark-mid px-4 py-3 border-b border-dark-border flex items-center justify-between">
                <span className="font-display text-2xl tracking-widest text-amarillo">{equipo}</span>
                <span className="text-2xl">🚜</span>
              </div>

              <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-dark-mid rounded p-2 text-center">
                    <div className="font-display text-2xl text-amarillo">{count}</div>
                    <div className="font-mono text-[10px] text-gray-500 uppercase">registros</div>
                  </div>
                  <div className="flex-1 bg-dark-mid rounded p-2 text-center">
                    <div className="font-display text-2xl text-green-400">✔</div>
                    <div className="font-mono text-[10px] text-gray-500 uppercase">activo</div>
                  </div>
                </div>

                {/* URL preview */}
                <div className="bg-dark-base rounded p-2">
                  <p className="font-mono text-[9px] text-gray-600 break-all leading-relaxed">{url}</p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleGenerateQR(equipo)}
                    className="bg-amarillo text-black font-display tracking-widest text-sm py-2.5 rounded hover:bg-yellow-300 transition-colors"
                  >
                    📱 Ver QR
                  </button>
                  <a
                    href={`/registro/${encodeURIComponent(equipo)}`}
                    target="_blank"
                    className="bg-dark-mid border border-dark-border text-gray-300 font-display tracking-widest text-sm py-2.5 rounded hover:border-amarillo hover:text-amarillo transition-colors text-center"
                  >
                    🔗 Abrir ↗
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* QR General */}
      <div className="card border-amarillo/40">
        <div className="section-header">🌐 QR General — Cualquier Equipo</div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-gray-300 text-sm mb-2">
              Este QR lleva al formulario general donde el operador puede <strong className="text-amarillo">seleccionar el equipo</strong> manualmente.
            </p>
            <p className="font-mono text-xs text-gray-500">{APP_URL}/registro</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={() => handleGenerateQR('__general__')} className="btn-primary text-base px-6 py-2.5">
              📱 Generar QR General
            </button>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showModal && selectedEquipo && qrDataUrl && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-dark-card border border-dark-border rounded-xl max-w-sm w-full overflow-hidden shadow-2xl shadow-amarillo/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-amarillo px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl tracking-widest text-black">
                  {selectedEquipo === '__general__' ? 'QR GENERAL' : selectedEquipo}
                </h3>
                <p className="font-mono text-xs text-black/50">
                  {selectedEquipo === '__general__' ? 'Formulario general' : 'Registro directo de equipo'}
                </p>
              </div>
              <span className="text-3xl">📱</span>
            </div>

            {/* QR image */}
            <div ref={printRef} className="p-6 flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
              </div>

              <div className="text-center">
                <p className="font-display text-lg tracking-widest text-amarillo mb-1">
                  {selectedEquipo === '__general__' ? 'FORMULARIO GENERAL' : `EQUIPO ${selectedEquipo}`}
                </p>
                <p className="font-mono text-xs text-gray-500 break-all">
                  {APP_URL}/{selectedEquipo === '__general__' ? 'registro' : `registro/${selectedEquipo}`}
                </p>
              </div>

              <div className="bg-dark-mid rounded-lg p-3 w-full text-center">
                <p className="font-mono text-xs text-gray-400">
                  📱 Imprime este QR y pégalo en el equipo.<br />
                  El operador lo escanea y registra directamente.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 grid grid-cols-3 gap-2">
              <button onClick={downloadQR} className="bg-dark-mid border border-dark-border text-gray-300 font-display tracking-wider text-sm py-2.5 rounded hover:border-amarillo hover:text-amarillo transition-colors text-center">
                ⬇ PNG
              </button>
              <button onClick={printQR} className="bg-dark-mid border border-dark-border text-gray-300 font-display tracking-wider text-sm py-2.5 rounded hover:border-amarillo hover:text-amarillo transition-colors text-center">
                🖨 Imprimir
              </button>
              <button onClick={closeModal} className="bg-amarillo text-black font-display tracking-wider text-sm py-2.5 rounded hover:bg-yellow-300 transition-colors text-center">
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
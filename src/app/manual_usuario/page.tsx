'use client'

import { useState, useEffect } from 'react'

const slides = [
  {
    title: "Introducción",
    content: `El sistema de mantenimiento permite registrar actividades de equipos de forma digital.

Su objetivo es mejorar el control, evitar pérdida de información y facilitar el seguimiento de las operaciones.`,
    tip: "Este sistema reemplaza registros en papel."
  },
  {
    title: " Funcionalidades",
    content: `El sistema permite registrar:

• Fecha
• Equipo
• Operador
• Turno
• Tareas realizadas
• Fotografías
• Observaciones

Toda la información queda almacenada automáticamente.`,
    tip: " Cada registro queda guardado en la base de datos."
  },
  {
    title: " Acceso",
    content: `El acceso puede realizarse de dos formas:

1. Desde la plataforma
2. Escaneando código QR

Cuando se usa QR, el equipo se selecciona automáticamente.`,
    tip: " El QR agiliza el proceso y evita errores."
  },
  {
    title: " Formulario",
    content: `Campos obligatorios:

• Fecha
• Equipo
• Operador
• Turno

Si falta alguno, el sistema no permitirá guardar.`,
    tip: " Siempre verificar los campos antes de guardar."
  },
  {
    title: " Tareas",
    content: `El usuario puede seleccionar:

• Engrase
• Sopleteo

Se pueden marcar múltiples opciones según el mantenimiento realizado.`,
    tip: " Registrar correctamente las tareas mejora el control."
  },
  {
    title: " Fotografía",
    content: `Se puede tomar o subir una foto del equipo.

Esto permite documentar visualmente el estado del equipo.`,
    tip: " Siempre tomar foto clara y visible."
  },
  {
    title: " Observaciones",
    content: `Campo opcional para agregar detalles adicionales.

Ejemplo:
• Daños visibles
• Ruido extraño
• Problemas detectados`,
    tip: " Este campo ayuda a mantenimiento preventivo."
  },
  {
    title: " Guardado",
    content: `Al presionar “Guardar Registro”:

• El sistema valida datos
• Guarda información
• Muestra confirmación`,
    tip: " Si aparece confirmación, el registro fue exitoso."
  },
  {
    title: " Errores",
    content: `Errores comunes:

• Campos incompletos
• Mala conexión
• Datos incorrectos`,
    tip: " Revisar antes de enviar evita repetir registros."
  },
  {
    title: " Flujo completo",
    content: `Flujo correcto:

1. Ingresar
2. Completar datos
3. Seleccionar tareas
4. Tomar foto
5. Guardar

Repetir proceso para cada mantenimiento.`,
    tip: " Este proceso debe volverse rutina diaria."
  }
]

export default function CapacitacionPage() {
  const [index, setIndex] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const progress = ((index + 1) / slides.length) * 100

  // 🔊 FUNCIÓN DE VOZ
  function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 1
    utterance.pitch = 1

    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }

  // 🔊 VOZ AUTOMÁTICA
  useEffect(() => {
    if (!voiceEnabled) return

    const text = slides[index].title + ". " + slides[index].content
    speak(text)
  }, [index, voiceEnabled])

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 flex flex-col">

      {/* HEADER */}
      <div className="bg-yellow-400 text-black text-center py-4 font-bold tracking-widest shadow-lg flex justify-between items-center px-4">

        <span>🚜 CAPACITACIÓN DEL SISTEMA</span>

        {/* BOTÓN VOZ */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="text-xs bg-black/20 px-3 py-1 rounded"
        >
          {voiceEnabled ? "🔊 ON" : "🔇 OFF"}
        </button>

      </div>

      {/* PROGRESS */}
      <div className="w-full h-1 bg-gray-800">
        <div
          className="h-1 bg-yellow-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* SLIDE */}
      <div className="flex-1 flex items-center justify-center p-6">

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 max-w-xl w-full space-y-6 shadow-xl">

          <h2 className="text-yellow-400 text-xl font-bold text-center">
            {slides[index].title}
          </h2>

          <p className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
            {slides[index].content}
          </p>

          {/* TIP */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 p-3 rounded text-xs text-yellow-300">
            {slides[index].tip}
          </div>

          {/* CONTADOR */}
          <div className="text-center text-xs text-gray-500">
            {index + 1} / {slides.length}
          </div>

          {/* BOTÓN REPETIR */}
          <div className="flex justify-center">
            <button
              onClick={() =>
                speak(slides[index].title + ". " + slides[index].content)
              }
              className="text-xs bg-yellow-400 text-black px-3 py-1 rounded font-bold"
            >
              Repetir audio
            </button>
          </div>

        </div>

      </div>

      {/* CONTROLES */}
      <div className="flex justify-between items-center p-4">

        <button
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition disabled:opacity-30"
        >
          ⬅ Anterior
        </button>

        <button
          onClick={() => setIndex(0)}
          className="text-xs text-gray-400 hover:text-yellow-400"
        >
          Reiniciar
        </button>

        <button
          onClick={() => setIndex(index + 1)}
          disabled={index === slides.length - 1}
          className="px-4 py-2 bg-yellow-400 text-black rounded font-bold hover:scale-105 transition disabled:opacity-30"
        >
          Siguiente ➡
        </button>

      </div>

    </div>
  )
}
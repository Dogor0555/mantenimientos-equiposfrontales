import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4 text-center">
      <div>
        <div className="text-6xl mb-4">🚜</div>
        <h2 className="font-display text-4xl tracking-widest text-amarillo mb-2">Equipo no encontrado</h2>
        <p className="font-mono text-sm text-gray-500 mb-6">El QR escaneado no corresponde a ningún equipo registrado.</p>
        <Link href="/registro" className="btn-primary inline-block">
          Ir al formulario general
        </Link>
      </div>
    </div>
  )
}

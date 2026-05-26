import type { Metadata } from 'next'
import { Bebas_Neue, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' })
const ibmMono = IBM_Plex_Mono({ weight: ['400', '600'], subsets: ['latin'], variable: '--font-mono' })
const ibmSans = IBM_Plex_Sans({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Control de Mantenimiento - Equipos Frontales',
  description: 'Sistema de control de mantenimiento para equipos frontales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bebas.variable} ${ibmMono.variable} ${ibmSans.variable}`}>
      <body className="bg-dark-base text-gray-100 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}

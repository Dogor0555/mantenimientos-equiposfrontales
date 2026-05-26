import { EQUIPOS } from '@/lib/constants'
import FormRegistroPublico from '@/components/FormRegistroPublico'
import { notFound } from 'next/navigation'

type Props = { params: { equipo: string } }

export async function generateStaticParams() {
  return EQUIPOS.map(eq => ({ equipo: encodeURIComponent(eq) }))
}

export default function RegistroEquipoPage({ params }: Props) {
  const equipoDecoded = decodeURIComponent(params.equipo)
  if (!EQUIPOS.includes(equipoDecoded)) notFound()
  return <FormRegistroPublico equipoPreseleccionado={equipoDecoded} />
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfirmarPagamentoButton() {
  const [consultando, setConsultando] = useState(false)

  const consultarPagamento = () => {
    setConsultando(true)
    setTimeout(() => {
      setConsultando(false)
      toast('O Pagamento ainda não foi confirmado', {
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: 'white',
          border: '1px solid #b91c1c'
        }
      })
    }, 3000)
  }

  return (
    <Button onClick={consultarPagamento} className="bg-green-600 mb-20">
      {consultando ? <Loader className="animate-spin" /> : 'Confirmar Pagamento'}
    </Button>
  )
}

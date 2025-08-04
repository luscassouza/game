'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function CopyPixCodeButton({ pixCode }: { pixCode: string }) {
  const copiarPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      toast.success('Código PIX copiado com sucesso!', {
        position: 'top-center',
        style: {
          background: '#16a34a',
          color: 'white',
          border: '1px solid #15803d'
        }
      })
    } catch (err) {
      toast.error('Erro ao copiar código PIX', {
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: 'white',
          border: '1px solid #b91c1c'
        }
      })
    }
  }

  return (
    <Button
      onClick={copiarPixCode}
      className="bg-green-600 hover:bg-green-600 text-white px-3 py-1 text-sm flex items-center gap-2"
    >
      <Copy className="h-4 w-4" />
      Copiar
    </Button>
  )
}

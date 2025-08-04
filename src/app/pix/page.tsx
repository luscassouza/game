import ConfirmarPagamentoButton from "./_components/ConfirmarPagamentoButton"
import CopyPixCodeButton from "./_components/CopiarPix"

type PixPageProps = {
  searchParams: Promise<{
    pixCode?: string
    pixQrCode?: string
  }>
}

export  default async function PixPage({
  searchParams
}: PixPageProps) {
    const params = await searchParams;
  const pixCode = params.pixCode;
  const pixQrCode = await params.pixQrCode;

  return (
    <main className="p-4 bg-black flex flex-col items-center w-screen min-h-screen h-auto">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-green-600">Pagamento via Pix</h1>
      <p className='text-white text-center md:text-xl mb-4'>
        Após o pagamento ser confirmado o saldo será acrescentado à conta imediatamente
      </p>

      {pixQrCode && (
        <div className="mb-6 rounded-md">
          <img src={pixQrCode} alt="QR Code Pix" className="w-64 h-64 rounded-md" />
        </div>
      )}

      {pixCode && (
        <div className='w-[95%] flex flex-col min-h-[250px] md:w-1/2'>
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-white">Código Pix:</p>
            <CopyPixCodeButton pixCode={pixCode} />
          </div>
          <textarea
            value={pixCode}
            readOnly
            rows={4}
            className="w-full flex-1 mb-2 p-2 border rounded text-white"
          />
        </div>
      )}

      <ConfirmarPagamentoButton />
    </main>
  )
}
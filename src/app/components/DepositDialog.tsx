import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import axios from "axios"
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export interface DepositDialogProps {
    isDepositOpen: boolean,
    setIsDepositOpen: Dispatch<SetStateAction<boolean>>

}

export default function DepositDialog({ isDepositOpen, setIsDepositOpen }: DepositDialogProps) {
    const [valorSelecionado, setValorSelecionado] = useState<number>(30);
    const [gerandoPix, setGerandoPix] = useState(false)    // Dados de depósito
    const valoresDeposito = [
        { valor: 15, label: "R$ 15,00", tag: "", url: "" },
        { valor: 20, label: "R$ 20,00", tag: "🔥 +Querido", url: "" },
        { valor: 30, label: "R$ 30,00", tag: "🔥 Recomendado", url: "" },
        { valor: 50, label: "R$ 50,00", tag: "🔥 +Chances", url: "" },
        { valor: 80, label: "R$ 80,00", tag: "🔥 +Chances", url: "" },
        { valor: 200, label: "R$ 200,00", tag: "🔥 +Chances", url: "" },
        { valor: 300, label: "R$ 300,00", tag: "🔥 +Chances", url: "" },
        { valor: 500, label: "R$ 500,00", tag: "🔥 +Chances", url: "" },
        { valor: 1000, label: "R$ 1.000,00", tag: "🔥 Super Chances", url: "" }
    ];

    const router = useRouter()

    const handleGerarPix = async () => {
        setGerandoPix(true)
        try {
            const response = await axios.post(
                'https://pay.zeroonepay.com.br/api/v1/transaction.purchase',
                {
                    name: 'Raspadinha da Sorte',
                    email: 'raspadinha@gmail.com',
                    cpf: '12345678901',
                    phone: '16977777777',
                    paymentMethod: 'PIX',
                    amount: valorSelecionado * 100,
                    traceable: true,
                    items: [
                        {
                            unitPrice: valorSelecionado * 100,
                            title: 'Acesso a Curso Online',
                            quantity: 1,
                            tangible: false
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: process.env.NEXT_PUBLIC_API_SECRET_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            )

            const { pixCode, pixQrCode } = response.data
            setGerandoPix(false)
            setIsDepositOpen(false)

            // Redireciona para /pix com os dados via URL (query string)
            router.push(
                `/pix?pixCode=${encodeURIComponent(pixCode)}&pixQrCode=${encodeURIComponent(pixQrCode)}`
            )

        } catch (error) {
            console.error('Erro ao gerar Pix:', error)
        }
    }

    return <>
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogContent className="p-0  w-screen md:min-w-[620px] overflow-y-scroll h-screen bg-black border-gray-700">
                {/* Header com Imagem */}
                <div className="w-full h-[127px] relative md:h-[250px]">
                    <Image fill alt="promotion" src="https://megaraspadinha.site/storage/uploads/scKEZLpDND4PDs1YLvVEK8hrKyApOmOix56uYCdo.png" />
                </div>

                {/* Conteúdo - Seleção de Valores */}
                <div className="flex-1 p-6 bg-zinc-900">
                    <div className="text-center mb-6">
                        <h3 className="text-white text-lg mb-2">Digite ou selecione o valor</h3>
                        <div className="bg-[#064e3b33] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
                            <span className="text-white">✓</span>
                            <span>Método de pagamento seguro</span>
                        </div>
                    </div>

                    {/* Grid de Valores */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {valoresDeposito.map((item) => (
                            <div
                                key={item.valor}
                                className={`relative cursor-pointer rounded-lg p-3 transition-all ${valorSelecionado === item.valor
                                    ? 'bg-green-500 border-2 border-yellow-400'
                                    : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                                onClick={() => setValorSelecionado(item.valor)}
                            >
                                {item.tag && (
                                    <div className="absolute -top-2 -right-6 md:-right-12 transform -translate-x-1/2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                                        <span className="md:hidden">🔥</span>
                                        <span className="hidden md:inline">{item.tag}</span>
                                    </div>
                                )}
                                <div className={`text-center ${valorSelecionado === item.valor ? 'text-white' : 'text-gray-300'}`}>
                                    <div className="text-lg font-bold">{item.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legenda sobre foguinho */}
                    <div className="text-center mb-4">
                        <p className="text-gray-400 text-xs">
                            💡 <span className="text-yellow-400">Opções com foguinho</span> têm mais chances de ganhar!
                        </p>
                    </div>

                    {/* Valor Selecionado */}
                    <div className="text-center mb-4">
                        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                            {valorSelecionado ? `R$ ${valorSelecionado}` : 'Selecione um valor'}
                        </div>
                    </div>

                    {/* Limites */}
                    <div className="flex justify-between text-gray-400 text-sm mb-6">
                        <span>Mínimo R$ 20,00</span>
                        <span>Máximo R$ 50.000,00</span>
                    </div>

                    {/* Botão Gerar PIX */}
                    <Button
                        onClick={handleGerarPix}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-bold flex items-center justify-center gap-2"
                        disabled={!valorSelecionado}
                    >
                        {gerandoPix ? (<Loader className="animation-spin" />)
                            :
                            (
                                <>
                                    <span className="text-white">✓</span>
                                    Gerar PIX
                                </>

                            )}

                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>

}
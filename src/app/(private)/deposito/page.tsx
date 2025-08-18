"use client"
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BanknoteArrowUp, Copy, Loader, ScanQrCode } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import axios from "axios";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";


export default function Deposito() {
    const [valorSelecionado, setValorSelecionado] = useState<number>(30);
    const [gerandoPix, setGerandoPix] = useState(false);
    const [pixGerado, setPixGerado] = useState(false);
    const [pixCode, setPixCode] = useState("");
    const [pixQrCode, setPixQrCode] = useState("");    // Dados de depósito
    const valoresDeposito = [
        { valor: 15, label: "R$ 15,00", tag: "" },
        { valor: 20, label: "R$ 20,00", tag: "🔥" },
        { valor: 30, label: "R$ 30,00", tag: "🔥" },
        { valor: 50, label: "R$ 50,00", tag: "🔥" },
        { valor: 80, label: "R$ 80,00", tag: "🔥" },
        { valor: 200, label: "R$ 200,00", tag: "🔥" },
        { valor: 300, label: "R$ 300,00", tag: "🔥" },
        { valor: 500, label: "R$ 500,00", tag: "🔥" },
        { valor: 1000, label: "R$ 1.000,00", tag: "🔥" }
    ];
    const [userId, setUserId] = useState("");
    const supabase = supabaseBrowser();

    const fetchUser = async () => {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error("Usuário não autenticado:", userError);
            return;
        }
        setUserId(user.id);
    }
    useEffect(() => {
        fetchUser();
    }, []);




    const handleGerarPix = async () => {
        setGerandoPix(true)
        try {
            const secretKey = process.env.NEXT_PUBLIC_API_SECRET_KEY; // sua variável de ambiente
            const amount = valorSelecionado * 100;

            if (!secretKey) {
                return
            }

            const basicAuth = Buffer.from(`${secretKey}:x`).toString('base64');
            const options = {
                method: 'POST',
                url: 'https://api.masterpagamentosbr.com/v1/transactions',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: 'Basic ' + basicAuth

                },
                data: {
                    customer: {
                        document: { type: 'cpf', number: '20489574041' },
                        name: 'raspadinha',
                        email: 'raspadinha@email.com',
                        phone: '1199999999'
                    },
                    shipping: { fee: 0 },
                    paymentMethod: 'pix',
                    amount: amount,
                    postbackUrl: "https://www.megaraspadinha.store/api/webhook",
                    items: [{ tangible: false, title: 'deposito', unitPrice: amount, quantity: 1 }],
                    metadata: userId
                }
            };

            axios
                .request(options)
                .then(res => {
                    setPixCode(res.data.pix.qrcode);
                    setPixQrCode(res.data.pix.qrCode);
                    setPixGerado(true);
                    toast.success('PIX gerado com sucesso!');
                    setGerandoPix(false);
                })
                .catch(err => console.error(err));

        } catch (error) {
            console.error('Erro ao gerar Pix:', error);
            toast.error('Erro ao gerar o PIX. Tente novamente.');
            setGerandoPix(false);
        }
    }

    const copiarPixCode = () => {
        navigator.clipboard.writeText(pixCode);
        toast.success('Código PIX copiado!');
    }

    return <>
        {/* Header com Imagem */}
        <div className="w-full flex flex-col items-center min-h-screen  bg-black">
            <div className="w-full bg-black h-[127px]  relative md:h-[250px]">
                <Image fill alt="promotion" className="object-cover rounded-b-3xl" src="/banner-2.png" />

            </div>
            {/* Conteúdo - Seleção de Valores */}
            <div className="w-full max-w-[600px]">
                <div className="flex-1 p-6 bg-black">
                    <div className="flex text-white items-center gap-2 mb-12">
                        <BanknoteArrowUp className="h-6 w-6 md:h-12 md:w-12" />

                        <span className=" text-lg font-bold md:text-3xl">Depositar</span>
                    </div>
                    <div className="w-full mb-12">
                        <span className="text-white">Valor: </span>
                        <div className="bg-zinc-800 flex  items-center gap-1 rounded-md p-2 border-1 text-white border-zinc-700">
                            <span>R$</span>
                            <span>{valorSelecionado}</span>
                        </div>
                        <Carousel opts={{ align: "start" }} className="w-full items-center">
                            <CarouselContent className="-ml-2 items-center h-[80px] flex gap-2">
                                {valoresDeposito.map((option) => (
                                    <CarouselItem
                                        key={option.valor}
                                        className="basis-auto pl-2"
                                    >
                                        <ToggleGroup
                                            type="single"
                                            value={valorSelecionado.toString()}
                                            onValueChange={(value) => setValorSelecionado(Number(value))}
                                        >
                                            <ToggleGroupItem
                                                value={option.valor.toString()}
                                                aria-label={option.label}
                                                className="whitespace-nowrap data-[state=on]:border-2 data-[state=on]:border-yellow-600 data-[state=on]:bg-[#0a780a6e] bg-[#0a780a6e]  data-[state=on]:text-[#00ff00] text-[#00ff00] relative">
                                                {option.tag && (
                                                    <span className="absolute -top-2 right-0 text-xs rounded-full px-1 font-medium bg-yellow-400 text-black">

                                                        {option.tag}
                                                    </span>
                                                )}
                                                {option.label}
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>


                    </div>
                    {!pixGerado ? (
                        <Button
                            onClick={handleGerarPix}
                            className="w-full bg-green-500 hover:bg-green-600 text-black mb-6 py-4 text-lg font-bold flex items-center justify-center gap-2"
                            disabled={!valorSelecionado}
                        >
                            {gerandoPix ? (<Loader className="animate-spin" />)
                                :
                                (
                                    <>
                                        <ScanQrCode className="text-black w-8 h-8" />
                                        Gerar PIX
                                    </>
                                )}
                        </Button>
                    ) : (
                        <div className="mb-20">
                            <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                                <h3 className="text-white text-lg font-bold mb-4 text-center">PIX Gerado</h3>
                                <p className="text-white mb-2 text-center">Vá na área pix do seu banco, procure por "Pix copia e cola" e cole o código abaixo</p>
                                {/* QR Code
                                <div className="flex justify-center mb-4">
                                    <div className="bg-white p-2 rounded-lg">
                                        <Image
                                            src={pixQrCode}
                                            alt="QR Code PIX"
                                            width={200}
                                            height={200}
                                        />
                                    </div>
                                </div> */}

                                {/* Código PIX */}
                                <div className="bg-zinc-700 p-3 rounded-md flex items-center justify-between mb-4">
                                    <div className="text-white text-sm overflow-hidden overflow-ellipsis">
                                        {pixCode}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={copiarPixCode}
                                        className="text-white hover:text-green-500"
                                    >
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                </div>

                                <p className="text-yellow-400 text-sm text-center mb-4">
                                    Escaneie o QR Code ou copie o código PIX para realizar o pagamento
                                </p>

                                <Button
                                    onClick={() => setPixGerado(false)}
                                    className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2"
                                >
                                    Gerar novo PIX
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

        </div>

    </>
}
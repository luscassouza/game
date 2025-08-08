"use client"

import { useState } from "react";
import { Play, Clock } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Deposito from "../deposito/page";
import Link from "next/link";

export default function Raspadinha() {
    const saldo = 0;
    const iniciarJogo  = () => {
        toast.error("Saldo Insuficiente, Faça um Deposito para Poder Jogar", {
            position: "top-center",
            style: {
                background: "#dc2626",
                color: "white",
                border: "1px solid #b91c1c"
            }
        })
    }
    return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col md:flex-row">
            {/* Área Principal do Jogo */}
            <div className="flex-1  relative order-1 md:order-1">
                {/* Padrão de fundo sutil */}
                {/* Conteúdo Principal */}
                <div className="relative z-10 h-full w-full items-center flex flex-col">
                    {/* Header Central */}
                    <div className="text-center py-4 md:py-8">
                        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2">
                            <span className="text-green-400">RASPOU</span>{" "}
                            <span className="text-yellow-400">ACHOU</span>{" "}
                            <span className="text-green-400">GANHOU</span>
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-orange-400 text-sm md:text-lg">
                            <span>ACHE 3 IGUAIS | GANHE NA HORA!</span>
                            <Clock className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                    </div>

                    {/* Área de Raspar */}
                    <div className="flex-1 rounded-md min-w-[300px] min-h-[300px] md:w-[580px] bg-gray-500 md:h-[530px] flex flex-col items-center justify-center px-4 md:px-8">
                        <div  className="text-center mb-4 md:mb-8">
                            <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-600 mb-2 md:mb-4">
                                RASPE AQUI
                            </h2>

                            {/* Ícone de mão */}
                            <div className="animation-bounce text-6xl md:text-8xl mb-4 md:mb-8">👆</div>


                            {/* Botão Comprar e Raspar */}
                            <Link href="/deposito" className="animation-bounce rounded-md hover:bg-green-700 md:text-2xl p-2 bg-green-600 z-[10000000]">
                                Comprar e Raspar (R$ 1,00)
                            </Link>
                        </div>
                    </div>

                    {/* Rodapé */}
                    <div className="p-4 md:p-6 md:px-48 flex items-center w-full justify-between">
                        <Button onClick={()=>iniciarJogo()} className="bg-green-500 z-[1000000] cursor-pointer hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center gap-2 text-sm md:text-base">
                            <Play className="h-4 w-4 md:h-5 md:w-5" />
                            JOGAR
                        </Button>

                        <div className="text-center">
                            <div className="text-orange-400 text-xs md:text-sm">SEU SALDO</div>
                            <div className="text-white text-lg md:text-xl font-bold">R$ {saldo.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Direita - Responsivo */}
            <div className="w-full md:w-80 bg-black p-4 md:p-6 space-y-4 md:space-y-6 order-2 md:order-2 flex flex-col md:block">
                {/* Painel Superior - Publicidade */}
                <div className="bg-purple-600 rounded-lg w-full w-[290px] h-[450px] relative mx-auto md:mx-0">

                    <Image className="rounded-lg" src="https://worldgamesbr.com.br/wp-content/uploads/2025/07/banner-game.png" alt="promotion" fill />

                </div>

                {/* Painel Inferior - Atalhos */}
                <div className="bg-gray-900 rounded-lg p-4 md:p-6 w-full md:w-auto">
                    <h3 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4">ATALHOS DO TECLADO</h3>

                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-gray-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm font-mono">R</div>
                            <span className="text-white text-xs md:text-sm">Revelar tudo</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-gray-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm font-mono">Espaço</div>
                            <span className="text-white text-xs md:text-sm">Jogar/Comprar</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-gray-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm font-mono">Enter</div>
                            <span className="text-white text-xs md:text-sm">Confirmar</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-gray-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm font-mono">Esc</div>
                            <span className="text-white text-xs md:text-sm">Cancelar</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
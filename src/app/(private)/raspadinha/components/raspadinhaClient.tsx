import { useState, useRef, useEffect, Suspense } from "react";
import { Play, Clock } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

// Símbolos e valores para a raspadinha
const SYMBOLS = [
    { symbol: '🍒', value: 5, name: 'Cereja' },
    { symbol: '🍋', value: 3, name: 'Limão' },
    { symbol: '🍊', value: 4, name: 'Laranja' },
    { symbol: '🍇', value: 6, name: 'Uva' },
    { symbol: '🔔', value: 10, name: 'Sino' },
    { symbol: '💎', value: 20, name: 'Diamante' },
    { symbol: '⭐', value: 15, name: 'Estrela' },
    { symbol: '💰', value: 25, name: 'Dinheiro' },
    { symbol: '🎰', value: 50, name: 'Jackpot' }
];

interface ScratchItem {
    symbol: string;
    value: number;
    name: string;
    revealed: boolean;
    x: number;
    y: number;
}

// Funções de descriptografia
const decryptPrice = (encryptedPrice: string): string => {
    try {
        const key = "raspadinha2025";
        const decoded = atob(encryptedPrice); // Base64 decode
        let decrypted = "";

        for (let i = 0; i < decoded.length; i += 2) {
            const hexChar = decoded.substr(i, 2);
            const charCode = parseInt(hexChar, 16) ^ key.charCodeAt((i / 2) % key.length);
            decrypted += String.fromCharCode(charCode);
        }

        return decrypted;
    } catch (error) {
        console.error("Erro ao descriptografar preço:", error);
        return "R$1,00"; // Valor padrão
    }
};

const parsePrice = (priceString: string): number => {
    // Remove "R$" e vírgulas, converte para número
    return parseFloat(priceString.replace(/R\$|,/g, '').replace(',', '.')) || 1;
};
export default function RaspadinhaContent() {
    const [saldo, setSaldo] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [gamePrice, setGamePrice] = useState(1);
    const [gamePriceString, setGamePriceString] = useState("R$1,00");
    const [gameActive, setGameActive] = useState(false);
    const [gameItems, setGameItems] = useState<ScratchItem[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);
    const [gameResult, setGameResult] = useState<{ won: boolean; amount: number; winningSymbol?: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const searchParams = useSearchParams();
    const supabase = supabaseBrowser();

    // Buscar dados do usuário e descriptografar preço
    useEffect(() => {
        // Descriptografar preço da URL
        const encryptedPrice = searchParams.get('p');
        if (encryptedPrice) {
            const decryptedPriceString = decryptPrice(decodeURIComponent(encryptedPrice));
            const priceValue = parsePrice(decryptedPriceString);
            setGamePrice(priceValue);
            setGamePriceString(decryptedPriceString);
        }

        const fetchUserData = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error("Usuário não autenticado:", userError);
                return;
            }
            setUserId(user.id);

            // Buscar saldo do usuário
            const { data: userConfig, error: userConfigError } = await supabase
                .from("user_configs")
                .select("balance")
                .eq("supabaseuserid", user.id)
                .single();

            if (!userConfigError && userConfig) {
                setSaldo(userConfig.balance || 0);
            }
        };

        fetchUserData();
    }, [supabase, searchParams]);

    // Gerar itens aleatórios para o jogo com probabilidades baseadas no valor
    const generateGameItems = (): ScratchItem[] => {
        const items: ScratchItem[] = [];
        const positions = [
            { x: 80, y: 80 }, { x: 200, y: 80 }, { x: 320, y: 80 },
            { x: 80, y: 160 }, { x: 200, y: 160 }, { x: 320, y: 160 },
            { x: 80, y: 240 }, { x: 200, y: 240 }, { x: 320, y: 240 }
        ];

        // Criar array de símbolos com pesos baseados no valor inverso
        // Quanto maior o valor, menor o peso (menor probabilidade)
        const weightedSymbols: { symbol: any; weight: number }[] = SYMBOLS.map(symbol => {
            // Fórmula ajustada: símbolos de alto valor têm peso muito menor
            let weight;
            if (symbol.value <= 5) {
                weight = 100; // Símbolos de baixo valor: peso alto
            } else if (symbol.value <= 10) {
                weight = 60;  // Símbolos médios: peso médio
            } else if (symbol.value <= 20) {
                weight = 25;  // Símbolos altos: peso baixo
            } else {
                weight = 5;   // Símbolos premium: peso muito baixo
            }

            return { symbol, weight };
        });

        // Função para selecionar símbolo baseado no peso
        const selectWeightedSymbol = () => {
            const totalWeight = weightedSymbols.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;

            for (const item of weightedSymbols) {
                random -= item.weight;
                if (random <= 0) {
                    return item.symbol;
                }
            }

            // Fallback para o primeiro símbolo
            return weightedSymbols[0].symbol;
        };

        // Determinar se este jogo será vencedor (10% de chance)
        const isWinningGame = Math.random() < 0.1;

        if (isWinningGame) {
            // Gerar um jogo vencedor
            // Escolher um símbolo para ser o vencedor (favorecendo símbolos de menor valor)
            const winningSymbol = selectWeightedSymbol();

            // Colocar 3 símbolos vencedores em posições aleatórias
            const winningPositions: number[] = [];

            while (winningPositions.length < 3) {
                const randomPos = Math.floor(Math.random() * 9);
                if (!winningPositions.includes(randomPos)) {
                    winningPositions.push(randomPos);
                }
            }

            // Preencher todas as posições
            for (let i = 0; i < 9; i++) {
                let selectedSymbol;

                if (winningPositions.includes(i)) {
                    // Posição vencedora
                    selectedSymbol = winningSymbol;
                } else {
                    // Posição não vencedora - escolher símbolo diferente do vencedor
                    do {
                        selectedSymbol = selectWeightedSymbol();
                    } while (selectedSymbol.symbol === winningSymbol.symbol);
                }

                items.push({
                    ...selectedSymbol,
                    revealed: false,
                    x: positions[i].x,
                    y: positions[i].y
                });
            }
        } else {
            // Gerar um jogo perdedor (sem 3 símbolos iguais)
            const symbolCounts: { [key: string]: number } = {};
            const maxRepeats = 2; // Máximo de 2 repetições para jogos perdedores

            for (let i = 0; i < 9; i++) {
                let selectedSymbol;
                let attempts = 0;
                const maxAttempts = 50;

                do {
                    selectedSymbol = selectWeightedSymbol();
                    attempts++;
                } while (
                    attempts < maxAttempts &&
                    symbolCounts[selectedSymbol.symbol] >= maxRepeats
                );

                // Se não conseguiu encontrar um símbolo válido, usar um símbolo disponível
                if (symbolCounts[selectedSymbol.symbol] >= maxRepeats) {
                    const availableSymbols = SYMBOLS.filter(s =>
                        (symbolCounts[s.symbol] || 0) < maxRepeats
                    );

                    if (availableSymbols.length > 0) {
                        selectedSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
                    } else {
                        // Se todos estão no limite, usar o de menor valor
                        selectedSymbol = SYMBOLS.reduce((min, current) =>
                            current.value < min.value ? current : min
                        );
                    }
                }

                // Atualizar contador
                symbolCounts[selectedSymbol.symbol] = (symbolCounts[selectedSymbol.symbol] || 0) + 1;

                items.push({
                    ...selectedSymbol,
                    revealed: false,
                    x: positions[i].x,
                    y: positions[i].y
                });
            }
        }

        return items;
    };

    // Verificar se há 3 símbolos iguais
    const checkWinCondition = (items: ScratchItem[]): { won: boolean; amount: number; winningSymbol?: string } => {
        const revealedItems = items.filter(item => item.revealed);

        if (revealedItems.length < 3) {
            return { won: false, amount: 0 };
        }

        // Contar ocorrências de cada símbolo
        const symbolCounts: { [key: string]: { count: number; value: number; name: string } } = {};

        revealedItems.forEach(item => {
            if (!symbolCounts[item.symbol]) {
                symbolCounts[item.symbol] = { count: 0, value: item.value, name: item.name };
            }
            symbolCounts[item.symbol].count++;
        });

        // Verificar se algum símbolo aparece 3 ou mais vezes
        for (const [symbol, data] of Object.entries(symbolCounts)) {
            if (data.count >= 3) {
                return { won: true, amount: data.value, winningSymbol: `${symbol} ${data.name}` };
            }
        }

        return { won: false, amount: 0 };
    };

    // Chamar API para adicionar saldo
    const addWinnings = async (amount: number) => {
        if (!userId) return;

        try {
            setIsProcessing(true);
            const response = await fetch('/api/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        metadata: userId,
                        amount: amount // Converter para centavos
                    }
                })
            });

            if (response.ok) {
                setSaldo(prev => prev + amount);
                toast.success(`Parabéns! Você ganhou R$ ${amount.toFixed(2)}!`, {
                    position: "top-center",
                    style: {
                        background: "#059004",
                        color: "white",
                        border: "1px solid #059004"
                    }
                });
            } else {
                throw new Error('Erro ao processar ganhos');
            }
        } catch (error) {
            console.error('Erro ao adicionar ganhos:', error);
            toast.error("Erro ao processar seus ganhos. Tente novamente.", {
                position: "top-center",
                style: {
                    background: "#dc2626",
                    color: "white",
                    border: "1px solid #b91c1c"
                }
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Deduzir saldo quando perder
    const deductBalance = async () => {
        if (!userId) return;

        try {
            const response = await fetch('/api/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        metadata: userId,
                        amount: -(gamePrice) // Deduzir o preço do jogo (em centavos)
                    }
                })
            });

            if (!response.ok) {
                console.error('Erro ao deduzir saldo');
            }
        } catch (error) {
            console.error('Erro ao deduzir saldo:', error);
        }
    };

    // Manipular hover do mouse
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!gameActive || !overlayCanvasRef.current || gameResult) return;

        const canvas = overlayCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Encontrar item sob o cursor
        const itemIndex = gameItems.findIndex((item, index) =>
            Math.abs(x - item.x) < 40 && Math.abs(y - item.y) < 40 && !item.revealed
        );

        setHoveredItem(itemIndex >= 0 ? itemIndex : null);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    // Inicializar canvas
    useEffect(() => {
        if (!gameActive || !canvasRef.current || !overlayCanvasRef.current) return;

        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const overlayCtx = overlayCanvas.getContext('2d');

        if (!ctx || !overlayCtx) return;

        // Configurar canvas com tamanho fixo
        const canvasWidth = 400;
        const canvasHeight = 320;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        overlayCanvas.width = canvasWidth;
        overlayCanvas.height = canvasHeight;

        // Desenhar fundo dos itens
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar itens do jogo
        gameItems.forEach(item => {
            if (item.revealed) {
                // Desenhar símbolo revelado
                ctx.fillStyle = '#1f2937';
                ctx.fillRect(item.x - 35, item.y - 35, 70, 70);
                ctx.fillStyle = '#ffffff';
                ctx.font = '28px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.symbol, item.x, item.y + 8);
                ctx.font = '10px Arial';
                ctx.fillText(`R$ ${item.value}`, item.x, item.y + 25);
            }
        });

        // Desenhar camada de raspagem com áreas clicáveis mais visíveis
        overlayCtx.fillStyle = '#9ca3af';
        overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        // Desenhar áreas clicáveis individuais para cada item não revelado
        gameItems.forEach((item, index) => {
            if (!item.revealed) {
                // Verificar se está em hover
                const isHovered = hoveredItem === index;

                // Desenhar borda da área clicável
                overlayCtx.strokeStyle = isHovered ? '#fbbf24' : '#6b7280';
                overlayCtx.lineWidth = isHovered ? 3 : 2;
                overlayCtx.setLineDash([5, 5]);
                overlayCtx.strokeRect(item.x - 40, item.y - 40, 80, 80);
                overlayCtx.setLineDash([]);

                // Desenhar área clicável com gradiente
                const gradient = overlayCtx.createRadialGradient(item.x, item.y, 0, item.x, item.y, 40);
                if (isHovered) {
                    gradient.addColorStop(0, '#fef3c7');
                    gradient.addColorStop(1, '#d1d5db');
                } else {
                    gradient.addColorStop(0, '#d1d5db');
                    gradient.addColorStop(1, '#9ca3af');
                }
                overlayCtx.fillStyle = gradient;
                overlayCtx.fillRect(item.x - 35, item.y - 35, 70, 70);

                // Adicionar texto "CLIQUE" em cada área
                overlayCtx.fillStyle = isHovered ? '#92400e' : '#4b5563';
                overlayCtx.font = `bold ${isHovered ? '14px' : '12px'} Arial`;
                overlayCtx.textAlign = 'center';
                overlayCtx.fillText('CLIQUE', item.x, item.y - 5);
                overlayCtx.fillText('AQUI', item.x, item.y + 10);

                // Adicionar ícone de cursor
                overlayCtx.font = `${isHovered ? '18px' : '16px'} Arial`;
                overlayCtx.fillText('👆', item.x, item.y + 25);
            }
        });

        // Desenhar título principal
        overlayCtx.fillStyle = '#374151';
        overlayCtx.font = 'bold 24px Arial';
        overlayCtx.textAlign = 'center';
        overlayCtx.fillText('RASPE AS ÁREAS ABAIXO', overlayCanvas.width / 2, 30);

        // Remover áreas já raspadas
        gameItems.forEach(item => {
            if (item.revealed) {
                overlayCtx.globalCompositeOperation = 'destination-out';
                overlayCtx.beginPath();
                overlayCtx.arc(item.x, item.y, 40, 0, Math.PI * 2);
                overlayCtx.fill();
                overlayCtx.globalCompositeOperation = 'source-over';
            }
        });

    }, [gameActive, gameItems, hoveredItem]);

    // Manipular clique/toque para raspar
    const handleScratch = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        // Bloquear interação se o jogo não estiver ativo, se estiver processando, ou se já há um resultado
        if (!gameActive || !overlayCanvasRef.current || isProcessing || gameResult) return;

        const canvas = overlayCanvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        // Verificar se clicou em algum item
        const clickedItem = gameItems.find(item =>
            Math.abs(x - item.x) < 40 && Math.abs(y - item.y) < 40 && !item.revealed
        );

        if (clickedItem) {
            const newItems = gameItems.map(item =>
                item === clickedItem ? { ...item, revealed: true } : item
            );

            setGameItems(newItems);
            setRevealedCount(prev => prev + 1);

            // Verificar condição de vitória
            const result = checkWinCondition(newItems);
            if (result.won) {
                setGameResult(result);
                addWinnings(result.amount);
            } else if (newItems.filter(item => item.revealed).length === 9) {
                // Todos os itens foram revelados sem vitória - DEDUZIR SALDO
                setGameResult({ won: false, amount: 0 });
                deductBalance(); // Deduzir R$ 1,00 do saldo
                toast.info("Que pena! Tente novamente.", {
                    position: "top-center",
                    style: {
                        background: "#3b82f6",
                        color: "white",
                        border: "1px solid #2563eb"
                    }
                });
            }
        }
    };

    // Iniciar novo jogo
    const iniciarJogo = () => {
        if ((saldo * 100) < gamePrice) {
            console.log(saldo, gamePrice)

            toast.error(`Saldo Insuficiente. Você precisa de ${gamePriceString} para jogar`, {
                position: "top-center",
                style: {
                    background: "#dc2626",
                    color: "white",
                    border: "1px solid #b91c1c"
                }
            });
            return;
        }

        // Deduzir o preço do jogo do saldo localmente
        setSaldo(prev => prev - gamePrice);

        // Configurar novo jogo
        const newItems = generateGameItems();
        setGameItems(newItems);
        setGameActive(true);
        setRevealedCount(0);
        setGameResult(null);
        setHoveredItem(null);
    };

    // Resetar jogo
    const resetGame = () => {
        setGameActive(false);
        setGameItems([]);
        setRevealedCount(0);
        setGameResult(null);
        setIsProcessing(false);
        setHoveredItem(null);

        // Limpar canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
        if (overlayCanvasRef.current) {
            const overlayCtx = overlayCanvasRef.current.getContext('2d');
            if (overlayCtx) {
                overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col md:flex-row">
            {/* Área Principal do Jogo */}
            <div className="flex-1 relative order-1 md:order-1">
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
                    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
                        {!gameActive ? (
                            <div className="text-center mb-4 md:mb-8">
                                <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-600 mb-2 md:mb-4">
                                    RASPE AQUI
                                </h2>
                                <div className="animation-bounce text-6xl md:text-8xl mb-4 md:mb-8">👆</div>
                                {saldo < 0 ? (<Link href="/deposito" className="animation-bounce rounded-md hover:bg-green-700 md:text-2xl p-2 bg-green-600 z-[10000000]">
                                    Comprar e Raspar (R$ 1,00)
                                </Link>) :
                                    (<Button
                                        onClick={iniciarJogo}
                                        className="bg-green-500 z-[1000000] cursor-pointer hover:bg-green-600 text-white px-4 md:px-12 py-4 md:py-12  mx-auto rounded-lg flex items-center gap-2 text-sm md:text-2xl"

                                        disabled={gameActive || isProcessing}
                                    >
                                        <Play className="h-4 w-4 md:h-6 md:mr-2 md:w-6" />
                                        {gameActive ? "JOGANDO..." : "JOGAR"}
                                    </Button>)
                                }

                            </div>
                        ) : (
                            <div className="relative bg-gray-500 rounded-lg p-4 mx-auto w-[300px] md:w-[400px]">
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-4 left-4 rounded-lg w-[268px] h-[214px] md:w-[400px] md:h-[320px]"
                                />
                                <canvas
                                    ref={overlayCanvasRef}
                                    className={`absolute top-4 left-4 rounded-lg ${gameResult
                                            ? "cursor-not-allowed opacity-75"
                                            : "cursor-pointer hover:brightness-110"
                                        } w-[268px] h-[214px] md:w-[400px] md:h-[320px]`}
                                    onClick={handleScratch}
                                    onTouchStart={handleScratch}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                />

                                {/* Container para manter o espaço */}
                                <div className="w-[268px] h-[214px] md:w-[400px] md:h-[320px]"></div>

                                {gameResult && (
                                    <div className="absolute top-8 left-8 right-8 bg-black bg-opacity-90 text-white p-4 rounded-lg text-center z-10">
                                        {gameResult.won ? (
                                            <div>
                                                <h3 className="text-xl font-bold text-green-400 mb-2">🎉 PARABÉNS! 🎉</h3>
                                                <p className="text-lg">
                                                    Você ganhou{" "}
                                                    <span className="font-bold text-yellow-400">
                                                        R$ {gameResult.amount.toFixed(2)}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-300">
                                                    Com 3x {gameResult.winningSymbol}
                                                </p>
                                            </div>
                                        ) : revealedCount === 9 ? (
                                            <div>
                                                <h3 className="text-lg font-bold text-red-400 mb-2">Que pena!</h3>
                                                <p className="text-sm text-gray-300">Tente novamente</p>
                                            </div>
                                        ) : null}
                                        {(gameResult.won || revealedCount === 9) && (
                                            <Button
                                                onClick={resetGame}
                                                className="mt-3 bg-blue-600 hover:bg-blue-700"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? "Processando..." : "Novo Jogo"}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {gameActive && !gameResult && (
                                    <div className="absolute bottom-2 left-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded text-center text-sm">
                                        Itens revelados: {revealedCount}/9 | Encontre 3 símbolos iguais!
                                    </div>
                                )}
                            </div>

                        )}
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
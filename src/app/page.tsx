"use client"

import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import Link from "next/link";
import { Clover } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);


  const router = useRouter();

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-play carousel
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);





  const games = [
    {
      id: 1,
      title: "Prêmios até R$1.000,00 NO PIX",
      description: "Raspe e receba prêmios em DINHEIRO $$$ até R$1.000 diretamente no seu PIX",
      price: "R$1,00",
      prize: "R$ 1.000,00",
      image: "https://worldgamesbr.com.br/wp-content/uploads/2025/07/08b9baf3-53fa-4914-aab9-922b8d8b5908.png",
      category: "pix"
    },
    {
      id: 2,
      title: "Sonho Eletrônico",
      description: "Eletro, eletrônicos e componentes... aqui é possível, com prêmios de até R$5.000",
      price: "R$2,00",
      prize: "R$ 5.000,00",
      image: "https://worldgamesbr.com.br/wp-content/uploads/2025/07/c88bec4b-3022-4577-8aa2-60fd5892f195.png",
      category: "eletronico"
    },
    {
      id: 3,
      title: "Super Prêmios",
      description: "Cansado de ficar a pé? Essa sua chance de sair motorizado, prêmios de até R$10.000",
      price: "R$5,00",
      prize: "R$ 10.000,00",
      image: "https://worldgamesbr.com.br/wp-content/uploads/2025/07/c555c70d-d2a3-48b6-b6bc-449290879acb.png",
      category: "veiculo"
    },
    {
      id: 4,
      title: "Me mimei",
      description: "Quer se mimar mas tá muito preocupado? Não se preocupe, é só dar uma raspa",
      price: "R$5,00",
      prize: "R$ 25.000,00",
      image: "https://worldgamesbr.com.br/wp-content/uploads/2025/07/7e6fc89f-1df3-429f-9f03-75eb33abb54f.png",
      category: "cosmeticos"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState("destaque");

  const filteredGames = selectedCategory === "destaque"
    ? games
    : games.filter(game => game.category === selectedCategory);

  const startGame = () => {
    const logado = localStorage.getItem("logado");
    if (logado == "true") {
      router.push("/raspadinha"); 
    } else {
      toast.error("Faça login para jogar", {
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "white",
          border: "1px solid #b91c1c"
        }
      })
    }
  }

  return (
    <div className="h-auto w-screen bg-black text-white">
      {/* Header */}


      {/* Dialog de Depósito */}


      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <div className="relative  h-[80px] md:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-green-600 to-green-400">
                  <Link href={"/raspadinha"}>
                    <Image className="object-contain" src="https://megaraspadinha.site/storage/01K11Y0D93QQKSNSBTKPGSZS8B.webp" alt="Money Stack" fill />
                  </Link>

                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative h-[80px] md:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-green-600 to-green-800">
                  <Link href={"raspadinha"}>
                    <Image className="object-contain" src="https://megaraspadinha.site/storage/01K11Y0SWT72REQG19V9CRQ8ZJ.webp" alt="premios" fill /></Link>

                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === current - 1 ? "bg-white" : "bg-white/30"
                  }`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </div>

        {/* Toggle Group */}
        <div className="flex justify-center">
          {/* Desktop Toggle Group */}
          <div className="hidden md:block">
            <ToggleGroup
              type="single"
              value={selectedCategory}
              onValueChange={(value) => value && setSelectedCategory(value)}
              className="bg-gray-900 p-1 gap-2 rounded-lg"
            >
              <ToggleGroupItem
                value="destaque"
                className="data-[state=on]:bg-green-500 text-xs md:text-lg rounded-md data-[state=on]:text-white text-white border-white/20"
              >
                Destaque
              </ToggleGroupItem>
              <ToggleGroupItem
                value="pix"
                className="data-[state=on]:bg-green-500 text-xs md:text-lg  rounded-md md:px-2 data-[state=on]:text-white text-white border-white/20"
              >
                PIX
              </ToggleGroupItem>
              <ToggleGroupItem
                value="eletronico"
                className="data-[state=on]:bg-green-500 text-xs md:text-lg  rounded-md md:px-2 data-[state=on]:text-white text-white border-white/20"
              >
                Eletrônico
              </ToggleGroupItem>
              <ToggleGroupItem
                value="veiculo"
                className="data-[state=on]:bg-green-500 text-xs md:text-lg  rounded-md md:px-2 data-[state=on]:text-white text-white border-white/20"
              >
                Veículo
              </ToggleGroupItem>
              <ToggleGroupItem
                value="cosmeticos"
                className="data-[state=on]:bg-green-500 text-xs md:text-lg  rounded-md md:px-2 data-[state=on]:text-white text-white border-white/20"
              >
                Cosméticos
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Mobile Toggle Group with Carousel */}
          <div className="md:hidden w-full max-w-[320px]">
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                <CarouselItem className="pl-2 basis-auto">
                  <ToggleGroup
                    type="single"
                    value={selectedCategory}
                    onValueChange={(value) => value && setSelectedCategory(value)}
                    className="bg-gray-900 p-1 gap-2 rounded-lg flex"
                  >
                    <ToggleGroupItem
                      value="destaque"
                      className="data-[state=on]:bg-green-500 text-xs rounded-md data-[state=on]:text-white text-white border-white/20 whitespace-nowrap"
                    >
                      Destaque
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="pix"
                      className="data-[state=on]:bg-green-500 text-xs rounded-md data-[state=on]:text-white text-white border-white/20 whitespace-nowrap"
                    >
                      PIX
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="eletronico"
                      className="data-[state=on]:bg-green-500 text-xs rounded-md data-[state=on]:text-white text-white border-white/20 whitespace-nowrap"
                    >
                      Eletrônico
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="veiculo"
                      className="data-[state=on]:bg-green-500 text-xs rounded-md data-[state=on]:text-white text-white border-white/20 whitespace-nowrap"
                    >
                      Veículo
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="cosmeticos"
                      className="data-[state=on]:bg-green-500 text-xs rounded-md data-[state=on]:text-white text-white border-white/20 whitespace-nowrap"
                    >
                      Cosméticos
                    </ToggleGroupItem>
                  </ToggleGroup>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="border-1 border-gray-400 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform">
              <div className="relative h-32 bg-black">
                <Image className="object-cover" src={game.image} alt="imagem do jogo" fill />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                  {game.price}
                </div>
              </div>
              <div className="p-4 flex-1 -mt-4">
                <h3 className="font-bold text-lg mb-2">{game.title}</h3>
                <p className="text-gray-400 text-sm mt-auto mb-auto">{game.description}</p>
                <div className="flex items-end h-auto justify-between">
                  <div>
                    <span className="text-gray-400 text-sm">Prêmio até:</span>
                    <div className="text-orange-400 font-bold">{game.prize}</div>
                  </div>
                  <Button onClick={() => startGame()} className="bg-green-500 p-2 rounded-md hover:bg-green-600 text-white">
                    Jogar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* First Column - Branding and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clover className="h-6 w-6 text-green-400" />
                <div>
                  <span className="text-xl font-bold text-white">MEGA</span>
                  <br />
                  <span className="text-xl font-bold text-green-400">RASPADINHA</span>
                </div>
              </div>
              <p className="text-white text-sm leading-relaxed">
                MEGARASPADINHA é a maior e melhor plataforma de raspadinhas do Brasil
              </p>
            </div>

            {/* Second Column - Quick Links */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Links Rápidos</h3>
              <div className="space-y-2">
                <a href="#" className="block text-white hover:text-green-400 transition-colors">
                  Início
                </a>
                <a href="#" className="block text-white hover:text-green-400 transition-colors">
                  Raspadinhas
                </a>
                <a href="#" className="block text-white hover:text-green-400 transition-colors">
                  Números da Sorte
                </a>
              </div>
            </div>

            {/* Third Column - Contact */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Contato</h3>
              <div className="space-y-2">
                <a href="mailto:contato@megaraspadinha.site" className="block text-white hover:text-green-400 transition-colors">
                  contato@megaraspadinha.site
                </a>
              </div>
            </div>

            {/* Fourth Column - Support */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Suporte</h3>
              <div className="space-y-2">
                <p className="text-white">Horário de atendimento:</p>
                <p className="text-white">Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-white text-sm">
              © 2025 Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

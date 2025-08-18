"use client"

import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import Link from "next/link";
import { Clover, Coins, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

// Funções de criptografia simples
const encryptPrice = (price: string): string => {
  const key = "raspadinha2025";
  let encrypted = "";
  for (let i = 0; i < price.length; i++) {
    const charCode = price.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += charCode.toString(16).padStart(2, '0');
  }
  return btoa(encrypted); // Base64 encode
};

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
  const supabase = supabaseBrowser();
  const startGame = async (gamePrice: string) => {
    const {data: userData, error: error} = await supabase.auth.getUser();
    if (userData.user) {
      const encryptedPrice = encryptPrice(gamePrice);
      router.push(`/raspadinha?p=${encodeURIComponent(encryptedPrice)}`);
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
                <div className="relative  h-[150px] md:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-green-600 to-green-400">
                  <Link href={"/raspadinha"}>
                    <Image className="object-cover" src="/banner-1.png" alt="Money Stack" fill />
                  </Link>

                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative h-[150px] md:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-green-600 to-green-800">
                  <Link href={"raspadinha"}>
                    <Image className="object-cover position-right" src="/banner-2.png" alt="premios" fill /></Link>

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
        <div className="w-10 relative h-10">
          <svg viewBox="0 0 59 60" fill="none" xmlns="http://www.w3.org/2000/svg" className=" aspect-square"><path d="M2.381 31.8854L0.250732 32.1093L5.76436 16.3468L8.04082 16.1075L13.5753 30.7088L11.4242 30.9349L10.0667 27.2976L3.71764 27.9649L2.381 31.8854ZM6.64153 19.5306L4.34418 26.114L9.461 25.5762L7.14277 19.4779C7.101 19.3283 7.05227 19.1794 6.99657 19.0313C6.94088 18.8691 6.90607 18.7328 6.89215 18.6222C6.8643 18.7372 6.82949 18.8808 6.78772 19.0532C6.74595 19.2116 6.69722 19.3707 6.64153 19.5306Z" fill="#7B869D"></path><path d="M28.5469 21.5332C28.5469 23.0732 28.2336 24.4711 27.6071 25.727C26.9945 26.9674 26.1382 27.9814 25.0382 28.769C23.9522 29.5411 22.6922 30.0026 21.2581 30.1533C19.8518 30.3011 18.5987 30.1038 17.4988 29.5614C16.4128 29.0036 15.5634 28.1688 14.9508 27.0572C14.3382 25.9456 14.0319 24.6128 14.0319 23.0588C14.0319 21.5188 14.3382 20.1286 14.9508 18.8882C15.5774 17.6464 16.4336 16.6324 17.5197 15.8462C18.6057 15.0601 19.8588 14.5924 21.2789 14.4431C22.7131 14.2924 23.9731 14.4959 25.0591 15.0538C26.1451 15.6117 26.9945 16.4464 27.6071 17.558C28.2336 18.6681 28.5469 19.9932 28.5469 21.5332ZM26.3958 21.7593C26.3958 20.5833 26.18 19.577 25.7483 18.7404C25.3306 17.9023 24.7389 17.2855 23.9731 16.8899C23.2073 16.4804 22.3093 16.3298 21.2789 16.4381C20.2625 16.5449 19.3715 16.8836 18.6057 17.4541C17.8399 18.0106 17.2412 18.7525 16.8096 19.6799C16.3919 20.6058 16.183 21.6567 16.183 22.8327C16.183 24.0087 16.3919 25.0158 16.8096 25.8539C17.2412 26.6905 17.8399 27.3136 18.6057 27.7231C19.3715 28.1326 20.2625 28.2839 21.2789 28.1771C22.3093 28.0688 23.2073 27.7294 23.9731 27.1589C24.7389 26.5745 25.3306 25.8193 25.7483 24.8934C26.18 23.966 26.3958 22.9213 26.3958 21.7593Z" fill="#7B869D"></path><path d="M5.74539 52.1851L0.200195 37.8724L3.66344 37.5084L6.46607 44.7421C6.63956 45.1801 6.79971 45.6397 6.94652 46.1208C7.09332 46.6018 7.2468 47.156 7.40695 47.7833C7.59379 47.0525 7.76061 46.4445 7.90742 45.9594C8.06757 45.4729 8.22772 44.9998 8.38787 44.5401L11.1505 36.7215L14.5336 36.3659L9.08853 51.8337L5.74539 52.1851Z" fill="#00E880"></path><path d="M19.3247 35.8623V50.7578L16.0816 51.0987V36.2032L19.3247 35.8623Z" fill="#00E880"></path><path d="M26.4195 50.0121L20.8743 35.6995L24.3375 35.3355L27.1401 42.5692C27.3136 43.0072 27.4738 43.4667 27.6206 43.9478C27.7674 44.4289 27.9209 44.9831 28.081 45.6104C28.2679 44.8795 28.4347 44.2716 28.5815 43.7864C28.7416 43.2999 28.9018 42.8268 29.0619 42.3672L31.8245 34.5486L35.2077 34.193L29.7626 49.6608L26.4195 50.0121Z" fill="#00E880"></path><path d="M49.647 40.1029C49.647 41.6193 49.3401 42.9935 48.7261 44.2255C48.1122 45.4441 47.2581 46.4397 46.1637 47.2123C45.0694 47.9714 43.8015 48.4268 42.3602 48.5782C40.9322 48.7283 39.671 48.5388 38.5766 48.0097C37.4956 47.4658 36.6482 46.6491 36.0343 45.5595C35.4337 44.4686 35.1334 43.1649 35.1334 41.6485C35.1334 40.1321 35.4404 38.7646 36.0543 37.5461C36.6682 36.314 37.5156 35.3192 38.5967 34.5614C39.691 33.7889 40.9522 33.3275 42.3802 33.1774C43.8216 33.0259 45.0827 33.2222 46.1637 33.7661C47.2581 34.2952 48.1122 35.1045 48.7261 36.1941C49.3401 37.2836 49.647 38.5866 49.647 40.1029ZM46.2238 40.4627C46.2238 39.51 46.0703 38.7142 45.7634 38.0755C45.4564 37.4234 45.016 36.9463 44.4421 36.6443C43.8816 36.3409 43.201 36.2313 42.4002 36.3155C41.5995 36.3996 40.9122 36.653 40.3383 37.0757C39.7644 37.4983 39.324 38.0679 39.017 38.7846C38.7101 39.4878 38.5566 40.3158 38.5566 41.2686C38.5566 42.2214 38.7101 43.0238 39.017 43.6759C39.324 44.3281 39.7644 44.8051 40.3383 45.1071C40.9122 45.4091 41.5995 45.5181 42.4002 45.4339C43.201 45.3497 43.8816 45.097 44.4421 44.6758C45.016 44.2398 45.4564 43.6634 45.7634 42.9467C46.0703 42.2301 46.2238 41.4021 46.2238 40.4627Z" fill="#00E880"></path><circle cx="39" cy="20" r="6" fill="#222733"></circle><g filter="url(#filter0_d_726_17235)"><circle cx="39" cy="20" r="3.75" fill="#00E880"></circle></g></svg>
        </div>

        {/* Toggle Group */}
        <div className="flex justify-center">
          {/* Desktop Toggle Group */}
          <div className="hidden md:block">
            <ToggleGroup
              type="single"
              value={selectedCategory}
              onValueChange={(value) => value && setSelectedCategory(value)}
              className="bg-zinc-800 p-1 gap-2 rounded-lg"
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
              opts={{ align: "start" }} className="w-full items-center"
            >
              <CarouselContent className="-ml-2 items-center h-[80px] flex gap-2">
                <CarouselItem  className="basis-auto pl-2">
                  <ToggleGroup
                    type="single"
                    value={selectedCategory}
                    onValueChange={(value) => value && setSelectedCategory(value)}
                    className="bg-zinc-900 p-2"
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
                    <div className="text-orange-400 flex items-center gap-1 font-bold">
                      <Gift className="h-4 w-4 inline-block" />
                      {game.prize}</div>
                  </div>
                  <Button onClick={() => startGame(game.price)} className="bg-green-500 p-2 rounded-md hover:bg-green-600 text-white">
                    <Coins className="h-4 w-4" />
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

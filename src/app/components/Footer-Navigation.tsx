"use client"
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Home, ReceiptText, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FooterNavigation() {
    const supabase = supabaseBrowser();
    const router = useRouter();
    const handleClick = () => {
        const logado = localStorage.getItem('logado');
        if (logado == "false") {
            toast.error("Faça login para jogar", {
                position: "top-center",
                style: {
                    background: "#dc2626",
                    color: "white",
                    border: "1px solid #b91c1c"
                }
            })
            return;
        }
        router.push("/deposito");
    }

    const handleClickRaspadinha = async () => {
        const {data, error} = await supabase.auth.getUser();  
        if (!data.user || error) {
            toast.error("Faça login para jogar", {
                position: "top-center",
                style: {
                    background: "#dc2626",
                    color: "white",
                    border: "1px solid #b91c1c"
                }
            })
            return;
        }
        router.push("/raspadinha?p=MjA0NTQyNWM1MTU0");
    }


    return <>
        <div className="md:hidden flex w-screen h-[60px] bg-black fixed bottom-0">
            <ToggleGroup type="single" className="w-full">
                <ToggleGroupItem className="bg-black text-white hover:bg-black data-[state=on]:bg-transparent data-[state=on]:text-green-600" value="home">
                        <Link  href={"/"}>
                            <Home  />
                        </Link>
                </ToggleGroupItem>

                <ToggleGroupItem className="bg-green-600 h-[40px] w-[40px] data-[state=on]:border-green-600 data-[state=on]:border-1 p-0 -mt-[20px] rounded-full text-white data-[state=on]:bg-transparent data-[state=on]:text-green-600" value="carteira" >

                    <Button onClick={() => handleClick()} className="h-[40px] hover:bg-green-600 w-[40px] bg-transparent" >
                        <Wallet />
                    </Button>
                </ToggleGroupItem>
                <ToggleGroupItem className="bg-black text-white hover:bg-black data-[state=on]:bg-transparent  data-[state=on]:text-green-600" value="raspadinha">
                    <Button variant="ghost" onClick={() => handleClickRaspadinha()} className="h-[40px] hover:bg-black data-[state=on]:bg-transparent  data-[state=on]:text-green-600" >
                        <ReceiptText />
                    </Button>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    </>
}
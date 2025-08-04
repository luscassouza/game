import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Home, LogOut, ReceiptText, User, Wallet } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mega raspadinha",
  description: "Raspe e Ganhe na hora!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <Header />
        <Toaster/>
        {children}
        <div className="md:hidden flex w-screen h-[60px] bg-black fixed bottom-0">
          <ToggleGroup type="single" className="w-full">
            <ToggleGroupItem className="bg-black text-white hover:bg-black data-[state=on]:bg-transparent data-[state=on]:text-green-600" value="home">
              <Link href={"/"}>
                <Home />
              </Link>

            </ToggleGroupItem>
            <ToggleGroupItem className="bg-black text-white hover:bg-black data-[state=on]:bg-transparent  data-[state=on]:text-green-600" value="raspadinha">
              <Link href={"/raspadinha"}>
                <ReceiptText />
              </Link>
            </ToggleGroupItem>
            <ToggleGroupItem className="bg-green-600 h-[40px] w-[40px] data-[state=on]:border-green-600 data-[state=on]:border-1 p-0 -mt-[20px] rounded-full text-white hover:bg-black data-[state=on]:bg-transparent data-[state=on]:text-green-600" value="carteira" >
              <Wallet />
            </ToggleGroupItem>
            <ToggleGroupItem className="bg-black text-white hover:bg-black data-[state=on]:bg-transparent data-[state=on]:text-green-600" value="logout">
              <LogOut />
            </ToggleGroupItem>
            <ToggleGroupItem className="bg-black text-white hover:bg-black data-[state=on]:bg-transparent data-[state=on]:text-green-600" value="perfil">
              <User />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </body>
    </html>
  );
}

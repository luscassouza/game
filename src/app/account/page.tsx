"use client"

import { useEffect, useState } from "react";
import { BanknoteArrowUp, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AccountData {
  nome?: string;
  email?: string;
  saldo?: number;
  telefone?: string;
  // Adicione outros campos conforme necessário
}

export default function AccountPage() {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  useEffect(() => {
    // Buscar dados da conta do localStorage
    try {
      const logado = localStorage.getItem('logado');
      if(logado == "false"){
        router.push("/");
      }
      const storedAccount = localStorage.getItem('conta');
      if (storedAccount) {
        const parsedData = JSON.parse(storedAccount);
        setAccountData(parsedData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados da conta:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex-1 p-6 bg-black min-h-screen">
      <div className="flex text-white items-center gap-2 mb-8">
        <User className="h-6 w-6" />
        <span className="text-lg font-bold">Minha Conta</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : accountData ? (
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4">Informações Pessoais</h3>
            <div className="space-y-3">
              <div>
                <p className="text-zinc-400 text-sm">Nome</p>
                <p className="text-white">{accountData.nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Email</p>
                <p className="text-white">{accountData.email || 'Não informado'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4">Saldo</h3>
            <div className="bg-zinc-700 p-4 rounded-md flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Saldo Disponível</p>
                <p className="text-green-500 text-xl font-bold">
                  R$ {accountData.saldo?.toFixed(2) || '0.00'}
                </p>
              </div>
              <BanknoteArrowUp className="h-8 w-8 text-green-500" />
              
            </div>
            <Link href="/deposito" className="mt-2 bg-green-600">
              Depositar
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-white mb-4">Nenhuma informação de conta encontrada</p>
          <p className="text-zinc-400 text-sm">
            Faça login para visualizar os dados da sua conta
          </p>
        </div>
      )}
    </div>
  );
}
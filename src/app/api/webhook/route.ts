import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Transaction } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Receber o corpo do webhook via FormData
    const formData = await req.formData();
    const transaction_id = formData.get('transaction_id') as string;

    if (!transaction_id) {
      return NextResponse.json({ error: "transaction_id é obrigatório" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Buscar a transação pelo transaction_id
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("external_id", transaction_id)
      .single() as { data: Transaction | null, error: any };

    if (transactionError || !transaction) {
      console.error("Erro ao buscar transação:", transactionError);
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    // Atualizar o status da transação para 'paid'
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: 'paid' })
      .eq("external_id", transaction_id);

    if (updateError) {
      console.error("Erro ao atualizar status da transação:", updateError);
      return NextResponse.json({ error: "Erro ao atualizar status da transação" }, { status: 500 });
    }

    // 3. Chamar sua função para adicionar saldo
    const { error } = await supabase.rpc("add_balance", {
      p_user_id: transaction.user_id,
      p_amount: transaction.amount/100,
    });

    if (error) {
      console.error("Erro ao atualizar saldo:", error);
      return NextResponse.json({ error: "Erro ao atualizar saldo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

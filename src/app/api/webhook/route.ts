import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Transaction } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Receber o corpo do webhook
    const body = await req.json();

    // 🔑 Normalmente o gateway envia algo como userId e amount
    const { data } = body;

    if (data.status !== "paid") {

      return 
    }

    const supabase = supabaseAdmin();

    // Agora a transaction está tipada corretamente
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("external_id", data.id)
      .single() as { data: Transaction | null, error: any };

    if (transactionError || !transaction) {
      console.error("Erro ao buscar transação:", transactionError);
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    // 3. Chamar sua função
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

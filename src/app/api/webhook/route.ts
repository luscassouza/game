import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Receber o corpo do webhook
    const body = await req.json();

    // 🔑 Normalmente o gateway envia algo como userId e amount
    const { metadata, amount } = body;

    if (!metadata || !amount) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = supabaseAdmin();


    // 3. Chamar sua função
    const { error } = await supabase.rpc("add_balance", {
      p_user_id: metadata,
      p_amount: amount/100,
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

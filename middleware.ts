import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  // cria supabase client no middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // tenta recuperar o token salvo nos cookies do supabase
  const token = req.cookies.get("sb-access-token")?.value;

  if (!token) {
    // se não tem sessão, redireciona pro login
    if (req.nextUrl.pathname.startsWith("/deposito") || req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/raspadinha")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // valida sessão
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    // sessão inválida
    if (req.nextUrl.pathname.startsWith("/deposito") || req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/raspadinha")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

// aplica só em rotas dentro de /deposito, /account e /raspadinha (que vêm de (private))
export const config = {
  matcher: ["/deposito/:path*", "/account/:path*", "/raspadinha/:path*"],
};

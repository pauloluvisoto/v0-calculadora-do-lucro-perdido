import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = (body?.nome ?? "").toString().trim();
    const whatsapp = (body?.whatsapp ?? "").toString().trim();

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Variáveis do Supabase não configuradas no servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from("leads_calculadora").insert([
      {
        nome,
        whatsapp,
        produto_nome: body?.produto_nome ?? null,
        produto_tipo: body?.produto_tipo ?? null,
        nicho: body?.nicho ?? null,
        faturamento_mensal: body?.faturamento_mensal ?? null,
        ticket_medio: body?.ticket_medio ?? null,
        vendas_realizadas: body?.vendas_realizadas ?? null,
        taxa_conversao_declarada: body?.taxa_conversao_declarada ?? null,
        investimento_trafego: body?.investimento_trafego ?? null,
        tem_upsell: body?.tem_upsell ?? null,
        valor_upsell: body?.valor_upsell ?? null,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar o request." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const nome = (body?.nome ?? "").toString().trim()
    const whatsapp = (body?.whatsapp ?? "").toString().trim()

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios." },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Variáveis do Supabase não configuradas no servidor." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const payload = {
      // básicos
      nome,
      whatsapp,

      // dados do produto / nicho
      produto_nome: body?.produto_nome ?? null,
      produto_tipo: body?.produto_tipo ?? null,
      nicho: body?.nicho ?? null,

      // inputs numéricos
      faturamento_mensal: body?.faturamento_mensal ?? null,
      ticket_medio: body?.ticket_medio ?? null,
      vendas_realizadas: body?.vendas_realizadas ?? null,
      taxa_conversao_declarada: body?.taxa_conversao_declarada ?? null,
      investimento_trafego: body?.investimento_trafego ?? null,

      // upsell/downsell
      tem_upsell: body?.tem_upsell ?? null,
      valor_upsell: body?.valor_upsell ?? null,
      tem_downsell: body?.tem_downsell ?? null,
      valor_downsell: body?.valor_downsell ?? null,

      // perdas / diagnóstico
      oportunidade_perdida_total: body?.oportunidade_perdida_total ?? null,
      perda_principal: body?.perda_principal ?? null,
      perda_upsell_potencial: body?.perda_upsell_potencial ?? null,
      perda_downsell_potencial: body?.perda_downsell_potencial ?? null,
      status_saude: body?.status_saude ?? null,
      ineficiencia_tecnica: body?.ineficiencia_tecnica ?? null,
      desperdicio_trafego: body?.desperdicio_trafego ?? null,
      projecao_anual_ltv: body?.projecao_anual_ltv ?? null,

      // ✅ NOVOS CAMPOS (projeções e ganhos)
      aumento_percentual: body?.aumento_percentual ?? null,

      projecao_3m: body?.projecao_3m ?? null,
      projecao_6m: body?.projecao_6m ?? null,

      ganho_mensal_10: body?.ganho_mensal_10 ?? null,
      ganho_mensal_20: body?.ganho_mensal_20 ?? null,
      ganho_mensal_34: body?.ganho_mensal_34 ?? null,

      ganho_anual_10: body?.ganho_anual_10 ?? null,
      ganho_anual_20: body?.ganho_anual_20 ?? null,
      ganho_anual_34: body?.ganho_anual_34 ?? null,
    }

    const { error } = await supabase.from("leads_calculadora").insert([payload])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar o request." },
      { status: 500 }
    )
  }
}

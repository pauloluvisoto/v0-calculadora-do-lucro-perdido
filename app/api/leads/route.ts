import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1. Validação Básica
    const nome = (body?.nome ?? "").toString().trim()
    const whatsapp = (body?.whatsapp ?? "").toString().trim()

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios." },
        { status: 400 }
      )
    }

    // 2. Salvar no Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Variáveis do Supabase ausentes.")
      return NextResponse.json({ error: "Configuração de servidor inválida." }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Prepara o payload para o Supabase
    // DICA: Certifique-se que o banco aguenta números grandes ou converta para string se necessário,
    // mas o ideal é ajustar a coluna no banco (veja passo 2 da solução).
    const payload = {
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
      abandonos_checkout_declarado: body?.abandonos_checkout_declarado ?? null,
      carrinhos_abandonados_calculado: body?.carrinhos_abandonados_calculado ?? null,
      tem_upsell: body?.tem_upsell ?? null,
      valor_upsell: body?.valor_upsell ?? null,
      tem_downsell: body?.tem_downsell ?? null,
      valor_downsell: body?.valor_downsell ?? null,
      oportunidade_perdida_total: body?.oportunidade_perdida_total ?? null,
      perda_principal: body?.perda_principal ?? null,
      perda_upsell_potencial: body?.perda_upsell_potencial ?? null,
      perda_downsell_potencial: body?.perda_downsell_potencial ?? null,
      status_saude: body?.status_saude ?? null,
      ineficiencia_tecnica: body?.ineficiencia_tecnica ?? null,
      desperdicio_trafego: body?.desperdicio_trafego ?? null,
      projecao_anual_ltv: body?.projecao_anual_ltv ?? null,
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

    const { error: supabaseError } = await supabase.from("leads_calculadora").insert([payload])

    if (supabaseError) {
      console.error("Erro Supabase:", supabaseError)
      // Retornamos 500, mas vamos incluir a mensagem para facilitar o debug
      return NextResponse.json(
        { error: "Erro ao salvar no banco", details: supabaseError.message, code: supabaseError.code },
        { status: 500 }
      )
    }

    // 3. Enviar para o Webhook (n8n)
    // Agora estamos no server-side, então process.env.ROUTE_RECUPERA funciona!
    const webhookUrl = process.env.ROUTE_RECUPERA

    if (webhookUrl) {
      try {
        // Prepara os dados para o n8n (usamos nomes mais amigáveis se quiser, ou o mesmo payload)
        const n8nPayload = {
            nomeLead: nome,
            whatsapp,
            nomeProduto: body?.produto_nome,
            tipoProduto: body?.produto_tipo,
            nicho: body?.nicho,
            faturamento: body?.faturamento_mensal, // Enviando o valor numérico
            ticketMedio: body?.ticket_medio,
            vendasRealizadas: body?.vendas_realizadas,
            // Adicione outros campos se seu n8n precisar
            oportunidade_perdida: body?.oportunidade_perdida_total
        }

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n8nPayload),
        })
      } catch (webhookError) {
        // Não vamos travar a resposta se o webhook falhar, apenas logar
        console.error("Erro ao enviar webhook:", webhookError)
      }
    } else {
        console.warn("Variável ROUTE_RECUPERA não definida.")
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Erro Geral API:", err)
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    )
  }
}

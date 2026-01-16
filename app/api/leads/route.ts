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

    // ✅ faltantes do schema
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
  },
])

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  User,
  Smartphone,
  Package,
  Tag,
  Briefcase,
  Percent,
  Clock,
  Activity,
  Target,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  Wallet
} from "lucide-react"

export default function Page() {
  // --- ESTADOS DO FORMULÁRIO ---
  const [nomeLead, setNomeLead] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [nomeProduto, setNomeProduto] = useState("")
  const [tipoProduto, setTipoProduto] = useState("")
  const [nicho, setNicho] = useState("")

  const [faturamento, setFaturamento] = useState("")
  const [ticketMedio, setTicketMedio] = useState("")
  const [modoDetalhado, setModoDetalhado] = useState(false)
  const [vendasRealizadas, setVendasRealizadas] = useState("")
  const [abandonosCheckout, setAbandonosCheckout] = useState("")
  
  // Estados para Features Avançadas
  const [taxaConversao, setTaxaConversao] = useState("")
  const [investimentoTrafego, setInvestimentoTrafego] = useState("")
  
  // Novos Estados para Upsell/Downsell
  const [temUpsell, setTemUpsell] = useState<boolean | null>(null)
  const [valorUpsell, setValorUpsell] = useState("") 
  
  const [temDownsell, setTemDownsell] = useState<boolean | null>(null)
  const [valorDownsell, setValorDownsell] = useState("")
  
  const [campoAutoCalculado, setCampoAutoCalculado] = useState<"faturamento" | "ticket" | "vendas" | null>(null)

  // --- ESTADO DE RESULTADOS ---
  const [resultados, setResultados] = useState<{
    faturamento: number
    ticketMedio: number
    vendas: number
    investimentoTrafego: number
    benchmarkIdeal: number
    limiteCritico: number
    limiteExcelente: number
    faturamentoInformado: number
    faturamentoCalculado: number
    diffFaturamentoPct: number
    
    // Breakdown das perdas
    perdaPrincipal: number
    perdaUpsellPotencial: number
    perdaDownsellPotencial: number
    
    oportunidadePerdidaTotal: number // Soma APENAS do que está ativo
    
    taxaConversaoAtual: number
    statusSaude: "Critico" | "Padrao" | "Excelente"
    desperdicioTrafego: number
    ineficienciaTrafego: number
    totalVisitasEstimadas: number
    perdaLTV: number 
    projecao: {
      mes3: number
      mes6: number
      ano1: number
    }
    recuperacao10: { mensal: number; anual: number }
    recuperacao20: { mensal: number; anual: number }
    recuperacao34: { mensal: number; anual: number }
    carrinhosAbandonados: number
    
    // Dados para os cards
    cenarioUpsell: "sim" | "nao"
    cenarioDownsell: "sim" | "nao"
  } | null>(null)

  const resultadosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResultados(null)
  }, [modoDetalhado])

  // --- FUNÇÕES AUXILIARES ---

  const badWords = ["teste", "test", "admin", "merda", "bosta", "caralho", "puta", "viado", "cu", "buceta", "pinto", "burro", "idiota", "desgraça", "foda", "corno", "pau", "chupa"]

  const containsProfanity = (text: string) => {
    if (!text) return false
    return badWords.some((word) => new RegExp(`\\b${word}\\b`, "i").test(text))
  }

  const formatText = (text: string) => {
    if (!text) return ""
    return text.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  }

  const renderDynamicHeadline = (name: string, sentence: string) => {
    if (!name || !name.trim() || containsProfanity(name)) {
      return sentence.charAt(0).toUpperCase() + sentence.slice(1)
    }
    return `${formatText(name)}, ${sentence}`
  }

  const handleWhatsappBlur = () => {
    let numbers = whatsapp.replace(/\D/g, "")
    if (numbers.length === 10 || numbers.length === 11) {
      numbers = "55" + numbers
    }
    if (numbers.length >= 12) {
      if (numbers.startsWith("55") && numbers.length === 13) {
        const ddi = numbers.substring(0, 2)
        const ddd = numbers.substring(2, 4)
        const part1 = numbers.substring(4, 9)
        const part2 = numbers.substring(9, 13)
        setWhatsapp(`+${ddi} ${ddd} ${part1}-${part2}`)
      } else {
        setWhatsapp(`+${numbers}`)
      }
    } else if (numbers.length > 0) {
      setWhatsapp(`+${numbers}`)
    }
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setWhatsapp(value)
  }

  // --- HANDLERS DE INPUT ---

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (!numbers) return ""
    const amount = Number(numbers) / 100
    const formatted = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    return formatted
  }

  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, "")
    return Number(numbers) / 100
  }

  const handleMonetaryChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(formatCurrency(e.target.value))
  }

  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    setter(val)
  }

  const handleTaxaConversaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, "")
    const floatVal = Number.parseFloat(value.replace(",", "."))
    if (floatVal > 100) return
    setTaxaConversao(value)
  }
  
const getVendasBase = () => {
  const v = Number(vendasRealizadas) || 0
  if (v > 0) return v

  const fat = parseCurrency(faturamento)
  const ticket = parseCurrency(ticketMedio)
  if (fat > 0 && ticket > 0) return Math.round(fat / ticket)

  return 0
}

const handleTaxaBlur = () => {
  const v = getVendasBase()
  const taxa = Number.parseFloat(taxaConversao.replace(",", "."))

  if (v <= 0 || !taxa || taxa <= 0) return

  const totalCheckout = v / (taxa / 100)
  const aband = Math.max(Math.round(totalCheckout - v), 0)

  setAbandonosCheckout(String(aband))
}

const handleAbandonosBlur = () => {
  const v = getVendasBase()
  const a = Number(abandonosCheckout) || 0

  if (v <= 0) return

  const total = v + a
  if (total <= 0) return

  const taxa = (v / total) * 100
  setTaxaConversao(taxa.toFixed(2).replace(".", ","))
}

  const calcularCampoAutomatico = () => {
    const fat = parseCurrency(faturamento)
    const ticket = parseCurrency(ticketMedio)
    const vendas = Number(vendasRealizadas) || 0

    if (fat > 0 && ticket > 0 && !vendasRealizadas) {
  const calculatedVendas = Math.round(fat / ticket)
  setVendasRealizadas(String(calculatedVendas))
  setCampoAutoCalculado("vendas")
  return
}

    if (vendas > 0 && ticket > 0 && fat === 0) {
      const calculatedFat = vendas * ticket
      const formatted = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(calculatedFat)
      setFaturamento(formatted)
      setCampoAutoCalculado("faturamento")
    }
  }

  // --- LÓGICA PRINCIPAL DE CÁLCULO ---
const salvarLead = async (payload: any) => {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    console.error("Erro ao salvar lead:", data)
  }
}

  const calcular = async () => {
  if (!nomeLead.trim() || !whatsapp.trim()) {
    alert("Por favor, preencha os campos obrigatórios: Nome e WhatsApp.")
    return
  }

  const fat = parseCurrency(faturamento)
  const ticket = parseCurrency(ticketMedio)

  if (fat <= 0 || ticket <= 0) {
    alert("Preencha faturamento e ticket corretamente.")
    return
  }

  let vendas: number
  let carrinhosAband: number
  let taxaAtual = 0
  const investimentoAd = parseCurrency(investimentoTrafego) || 0

  // 1. Definição de Cenário e Dados Base
  let visitasEstimadas = 0
let vendasInput = 0
let taxaInput = 0
let abandonosInput = 0

  if (modoDetalhado) {
  vendasInput = Number(vendasRealizadas) || 0
  abandonosInput = Number(abandonosCheckout) || 0

  const taxaParsed = Number.parseFloat(taxaConversao.replace(",", "."))
  taxaInput = Number.isFinite(taxaParsed) ? taxaParsed : 0

  // vendas: se não informou, estima por faturamento/ticket
  const vendasEstimadas = Math.round(fat / ticket)
  vendas = vendasInput > 0 ? vendasInput : vendasEstimadas

  // 1) Se informou abandonos: taxa é calculada
  if (abandonosInput > 0) {
    carrinhosAband = abandonosInput
    const totalCheckout = vendas + carrinhosAband
    taxaAtual = totalCheckout > 0 ? (vendas / totalCheckout) * 100 : 0
    visitasEstimadas = totalCheckout
  }
  // 2) Se informou taxa: abandonos são calculados
  else if (taxaInput > 0) {
    taxaAtual = taxaInput
    const totalVisitasCheckout = vendas / (taxaAtual / 100)
    const abandonosCalculados = totalVisitasCheckout - vendas

    carrinhosAband = Math.round(abandonosCalculados)
    visitasEstimadas = Math.round(totalVisitasCheckout)
  }
  // 3) Se não informou nem taxa nem abandonos: fallback benchmark (base da calculadora)
  else {
    taxaAtual = 25
    carrinhosAband = vendas * 3
    visitasEstimadas = vendas * 4
  }
} else {
  // Modo Simplificado: Estimativas de Mercado (mantém sua concepção base)
  vendas = Math.round(fat / ticket)
  carrinhosAband = vendas * 3
  taxaAtual = 25
  visitasEstimadas = vendas * 4
}


  // ✅ Benchmark por ticket (usado em Pedágio e Saúde)
  const benchmarkIdeal = getBenchmarkIdeal(ticket)
  const limiteCritico = Math.max(benchmarkIdeal - 10, 25)
  const limiteExcelente = benchmarkIdeal + 15

// ✅ Coerência de faturamento no modo detalhado
const faturamentoInformado = fat
const faturamentoCalculado = modoDetalhado ? vendas * ticket : fat
const diffFaturamentoPct =
  modoDetalhado && faturamentoCalculado > 0
    ? (Math.abs(faturamentoInformado - faturamentoCalculado) / faturamentoCalculado) * 100
    : 0

const fatBase = modoDetalhado ? faturamentoCalculado : fat


  // 2. Cálculo de Perda Principal (Sempre existe)
  const perdaPrincipal = carrinhosAband * ticket

  // 3. Cálculo de Perda de Ecossistema (Upsell/Downsell)
  let valUpsell = 0
  let valDownsell = 0

  if (valorUpsell) valUpsell = parseCurrency(valorUpsell)
  if (valorDownsell) valDownsell = parseCurrency(valorDownsell)
// Regras obrigatórias: se marcou SIM, precisa informar o valor
if (modoDetalhado) {
  if (temUpsell === true && valUpsell <= 0) {
    alert("Você marcou que TEM Upsell. Por favor, informe o valor do Upsell.")
    return
  }

  if (temDownsell === true && valDownsell <= 0) {
    alert("Você marcou que TEM Downsell. Por favor, informe o valor do Downsell.")
    return
  }
}

  // Base de cálculo para Potencial (Se não tiver valor, estima)
  // Upsell = 1.5x do ticket (Mais caro)
  // Downsell = 0.3x do ticket (Mais barato)
  const upsellBase = valUpsell > 0 ? valUpsell : ticket * 1.5
  const downsellBase = valDownsell > 0 ? valDownsell : ticket * 0.3

  // ✅ ALTERAÇÃO #1: Upsell em cima das vendas (vendas efetuadas)
  const perdaUpsellPotencial = vendas * 0.20 * upsellBase

  // Downsell: 10% de conversão sobre as vendas não concluídas (carrinhos abandonados)
  const perdaDownsellPotencial = carrinhosAband * 0.10 * downsellBase

  // SOMA REAL (Só soma no total grande se tiver marcado SIM)
  let oportunidadePerdidaTotal = perdaPrincipal
  if (temUpsell) oportunidadePerdidaTotal += perdaUpsellPotencial
  if (temDownsell) oportunidadePerdidaTotal += perdaDownsellPotencial

  // 4. Métricas de Eficiência
  let desperdicio = 0
  let ineficiencia = 0

  if (investimentoAd > 0) {
if (taxaAtual < benchmarkIdeal) {
  ineficiencia = ((benchmarkIdeal - taxaAtual) / benchmarkIdeal) * 100
  desperdicio = investimentoAd * (ineficiencia / 100)
    }
  }

  const perdaLTV = oportunidadePerdidaTotal * 12

  let status: "Critico" | "Padrao" | "Excelente" = "Padrao"
if (taxaAtual < limiteCritico) status = "Critico"
else if (taxaAtual >= limiteExcelente) status = "Excelente"

  // ✅ ALTERAÇÃO #2: Recuperações agora consideram taxa de recuperação (10/20/34)
  // - Produto principal + Upsell em cima das VENDAS RECUPERADAS
  // - Downsell em cima das NÃO RECUPERADAS
  const calcularGanhoRecuperacao = (taxaRecuperacao: number) => {
    const vendasRecuperadas = Math.round(carrinhosAband * taxaRecuperacao)
    const vendasNaoRecuperadas = Math.max(carrinhosAband - vendasRecuperadas, 0)

    const ganhoPrincipal = vendasRecuperadas * ticket
    const ganhoUpsell = temUpsell === true ? vendasRecuperadas * 0.20 * upsellBase : 0
    const ganhoDownsell = temDownsell === true ? vendasNaoRecuperadas * 0.10 * downsellBase : 0

    return ganhoPrincipal + ganhoUpsell + ganhoDownsell
  }

  const recuperacao10 = calcularGanhoRecuperacao(0.1)
  const recuperacao20 = calcularGanhoRecuperacao(0.2)
  const recuperacao34 = calcularGanhoRecuperacao(0.34)

  const aumentoPercentual = fatBase > 0 ? (oportunidadePerdidaTotal / fatBase) * 100 : null


  await salvarLead({
    nome: nomeLead,
    whatsapp,
    produto_nome: nomeProduto || null,
    produto_tipo: tipoProduto || null,
    nicho: nicho || null,
    faturamento_mensal: fat,
    ticket_medio: ticket,
    vendas_realizadas: modoDetalhado && vendasInput > 0 ? vendasInput : null,
    abandonos_checkout_declarado: modoDetalhado && abandonosInput > 0 ? abandonosInput : null,
    carrinhos_abandonados_calculado: carrinhosAband,
    taxa_conversao_declarada: modoDetalhado && taxaInput > 0 ? taxaInput : null,
    investimento_trafego: modoDetalhado ? investimentoAd : null,
    tem_upsell: temUpsell,
    valor_upsell: temUpsell ? (valorUpsell ? parseCurrency(valorUpsell) : null) : null,
    tem_downsell: temDownsell,
    valor_downsell: temDownsell ? (valorDownsell ? parseCurrency(valorDownsell) : null) : null,
    oportunidade_perdida_total: oportunidadePerdidaTotal,
    perda_principal: perdaPrincipal,
    perda_upsell_potencial: perdaUpsellPotencial,
    perda_downsell_potencial: perdaDownsellPotencial,
    status_saude: status,
    ineficiencia_tecnica: ineficiencia,
    desperdicio_trafego: desperdicio,
    projecao_anual_ltv: perdaLTV,
    aumento_percentual: aumentoPercentual,
    projecao_3m: oportunidadePerdidaTotal * 3,
    projecao_6m: oportunidadePerdidaTotal * 6,
    ganho_mensal_10: recuperacao10,
    ganho_mensal_20: recuperacao20,
    ganho_mensal_34: recuperacao34,
    ganho_anual_10: recuperacao10 * 12,
    ganho_anual_20: recuperacao20 * 12,
    ganho_anual_34: recuperacao34 * 12,
  })

  setResultados({
    faturamento: fatBase,
    faturamentoInformado,
    faturamentoCalculado,
    diffFaturamentoPct,
    ticketMedio: ticket,
    investimentoTrafego: investimentoAd,
    vendas: vendas,
    benchmarkIdeal,
    limiteCritico,
    limiteExcelente,
    perdaPrincipal: perdaPrincipal,
    perdaUpsellPotencial: perdaUpsellPotencial,
    perdaDownsellPotencial: perdaDownsellPotencial,
    oportunidadePerdidaTotal: oportunidadePerdidaTotal,
    taxaConversaoAtual: taxaAtual,
    statusSaude: status,
    desperdicioTrafego: desperdicio,
    ineficienciaTrafego: ineficiencia,
    totalVisitasEstimadas: visitasEstimadas,
    perdaLTV: perdaLTV,
    projecao: {
      mes3: oportunidadePerdidaTotal * 3,
      mes6: oportunidadePerdidaTotal * 6,
      ano1: perdaLTV,
    },
    recuperacao10: { mensal: recuperacao10, anual: recuperacao10 * 12 },
    recuperacao20: { mensal: recuperacao20, anual: recuperacao20 * 12 },
    recuperacao34: { mensal: recuperacao34, anual: recuperacao34 * 12 },
    carrinhosAbandonados: carrinhosAband,
    cenarioUpsell: temUpsell ? "sim" : "nao",
    cenarioDownsell: temDownsell ? "sim" : "nao",
  })

  // Dados que você quer enviar
const dados = {
  nomeLead,
  whatsapp,
  nomeProduto,
  tipoProduto,
  nicho,
  faturamento,
  ticketMedio,
  modoDetalhado,
  vendasRealizadas,
  abandonosCheckout
};

fetch('https://backend-recuperaia-n.snpserv.online/webhook/calculadora', {
  method: 'POST', // Método HTTP
  headers: {
    'Content-Type': 'application/json', // Informa ao servidor que o corpo é JSON
    'Accept': 'application/json' // O que esperamos receber de volta
  },
  body: JSON.stringify(dados) // Converte o objeto JavaScript para string JSON
})
.then(response => {
  if (!response.ok) {
    throw new Error(`Erro HTTP! Status: ${response.status}`);
  }
  return response.json(); 
})
.then(data => {
  console.log('Sucesso:');
})
.catch(error => {
  console.error('Erro ao fazer a requisição:');
});


  setTimeout(() => {
    resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, 100)
}


  // --- HELPERS DE EXIBIÇÃO ---

  const getStatusColor = (status: string) => {
    if (status === "Critico") return "text-red-500"
    if (status === "Padrao") return "text-yellow-500"
    return "text-[#7ef542]"
  }

  const getStatusBg = (status: string) => {
    if (status === "Critico") return "bg-red-500"
    if (status === "Padrao") return "bg-yellow-500"
    return "bg-[#7ef542]"
  }

  const formatResultCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      calcular()
    }
  }
  const getBenchmarkIdeal = (ticket: number) => {
  // tickets em R$
  if (ticket <= 297) return 45
  if (ticket <= 497) return 42
  if (ticket <= 1000) return 38
  return 35 // fallback caso alguém use acima de 1000
}

  const calLink = "https://app.cal.com/recupera.ia/30min?user=recupera.ia&overlayCalendar=true"

  const scrollToId = (id: string) => {
    if (typeof window === "undefined") return
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const StickyCTA = () => {
    if (!resultados) return null

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a2520] bg-[#0a0f0d]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <p className="text-[11px] text-gray-400">Dinheiro recuperável por mês (cenário 10%)</p>
            <p className="text-lg md:text-xl font-extrabold text-[#7ef542] leading-none">
              +{formatResultCurrency(resultados.recuperacao10.mensal)}
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => scrollToId("recuperacao")}
              className="flex-1 md:flex-none px-4 py-3 rounded-lg border border-[#1a2520] text-sm text-gray-200 hover:text-white hover:border-[#2a3530] transition"
            >
              Ver cenários
            </button>

            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-5 py-3 rounded-lg bg-[#7ef542] text-[#0a0f0d] font-extrabold text-sm text-center hover:bg-[#6ee032] transition"
            >
              Agendar com risco zero
            </a>
          </div>
        </div>               
      </div>
    )
  }

  const PedagioCard = () => {
    if (!resultados || resultados.desperdicioTrafego <= 0) return null

    const investimento = resultados.investimentoTrafego
    const vendasCount = resultados.vendas > 0 ? resultados.vendas : 1

    const cpaAtual = investimento > 0 ? investimento / vendasCount : 0
    const desperdicioPorVenda = resultados.desperdicioTrafego / vendasCount
    const cpaEficienteEst = investimento > 0 ? (investimento - resultados.desperdicioTrafego) / vendasCount : 0

    const pctPedagio = Math.min(Math.max(resultados.ineficienciaTrafego, 0), 100)
    const pctEficiente = Math.max(100 - pctPedagio, 0)

    const benchmarkIdeal = getBenchmarkIdeal(resultados.ticketMedio)
const vezesMais = resultados.taxaConversaoAtual > 0 ? benchmarkIdeal / resultados.taxaConversaoAtual : 0



    const rEficiente = Math.round(pctEficiente)
    const rPedagio = Math.round(pctPedagio)

    return (
      <div
        id="pedagio"
        className="mt-6 bg-gradient-to-br from-red-900/25 to-black/30 border border-red-500/30 p-6 md:p-8 rounded-2xl w-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-red-200 font-extrabold">
              <Target className="w-5 h-5" />
              <span className="uppercase tracking-wide text-sm">
  Pedágio do Checkout (benchmark {benchmarkIdeal}%)
</span>

            </div>
            <p className="text-xs text-gray-300 mt-1">
              Você paga tráfego para levar gente até a porta… mas a porta está pesada.
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-gray-400">pedágio pago este mês</p>
            <p className="text-3xl md:text-4xl font-extrabold text-red-200 leading-none">
              {formatResultCurrency(resultados.desperdicioTrafego)}
            </p>
          </div>
        </div>

        {/* Barra R$ 100 */}
        <div className="bg-black/30 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white font-semibold">De cada R$ 100 em mídia:</p>
            <span className="text-xs text-gray-400">
              Ineficiência: <span className="text-red-200 font-bold">{pctPedagio.toFixed(1).replace(".", ",")}%</span>
            </span>
          </div>

          <div className="w-full h-3 rounded-full overflow-hidden bg-gray-800 flex">
            <div className="h-full bg-[#7ef542]" style={{ width: `${pctEficiente}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${pctPedagio}%` }} />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#7ef542]" />
              <span className="text-gray-200">
                <strong className="text-white">R$ {rEficiente}</strong> geram venda
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-200">
                <strong className="text-red-200">R$ {rPedagio}</strong> viram pedágio
              </span>
            </div>
          </div>
        </div>

        {/* 3 Mini-cards */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">CPA médio atual</p>
            <p className="text-xl font-extrabold text-white">{formatResultCurrency(cpaAtual)}</p>
            <p className="text-[11px] text-gray-500 mt-1">quanto custa, em média, cada venda hoje</p>
          </div>

          <div className="bg-black/30 border border-red-500/30 rounded-xl p-4">
            <p className="text-[11px] text-red-200 uppercase tracking-wide">Pedágio por venda</p>
            <p className="text-xl font-extrabold text-red-200">{formatResultCurrency(desperdicioPorVenda)}</p>
            <p className="text-[11px] text-gray-500 mt-1">parte do CPA que some na fricção do checkout</p>
          </div>

          <div className="bg-black/30 border border-[#7ef542]/25 rounded-xl p-4">
            <p className="text-[11px] text-[#b6ff8f] uppercase tracking-wide">Custo eficiente estimado</p>
            <p className="text-xl font-extrabold text-[#7ef542]">{formatResultCurrency(cpaEficienteEst)}</p>
            <p className="text-[11px] text-gray-500 mt-1">se o checkout estivesse no patamar ideal</p>
          </div>
        </div>

        {/* Texto impactante */}
        <div className="bg-black/40 p-5 rounded-xl border-l-4 border-red-500">
          <p className="text-sm text-gray-200 leading-relaxed">
            <span className="text-white font-bold">{nomeLead}</span>, sua ineficiência técnica de{" "}
            <span className="text-red-200 font-extrabold">{pctPedagio.toFixed(1).replace(".", ",")}%</span> é um{" "}
            <span className="text-red-200 font-bold">imposto invisível</span> sobre a mídia.
            <br />
            Na prática, você precisa de{" "}
            <span className="text-white font-bold">{vezesMais.toFixed(1).replace(".", ",")}x</span> mais tráfego para
            fazer a mesma venda que um checkout saudável faria com 1x.
            <br />
            <br />
            <span className="text-red-100 font-extrabold">Veredito:</span> dos{" "}
            <span className="text-white font-bold">{formatResultCurrency(investimento)}</span> investidos este mês,{" "}
            <span className="text-red-200 font-extrabold">{formatResultCurrency(resultados.desperdicioTrafego)}</span>{" "}
            foram pagos como “pedágio”.
          </p>

          <div className="mt-4 flex flex-col md:flex-row gap-2">
            <button
              onClick={() => scrollToId("cta-final")}
              className="px-4 py-3 rounded-lg border border-red-500/30 text-red-100 font-bold hover:bg-red-500/10 transition"
            >
              Quero estancar esse pedágio
            </button>
            <button
              onClick={() => scrollToId("recuperacao")}
              className="px-4 py-3 rounded-lg border border-[#1a2520] text-gray-200 font-bold hover:border-[#2a3530] transition"
            >
              Ver quanto dá pra recuperar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      <div className={`max-w-6xl mx-auto px-6 py-12 ${resultados ? "pb-32" : ""}`}>
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-16 md:h-24 flex items-center">
              <img src="/logo-recupera-transparent.png" alt="Recupera.ia Logo" className="h-full w-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 uppercase">Calculadora do Lucro Perdido</h1>
          <p className="text-[#7ef542] text-lg text-[16px]">
            Descubra a fortuna exata que está escapando pelo seu checkout agora mesmo
          </p>
        </header>

        {/* --- INPUTS --- */}
        <div className="bg-[#111816] rounded-2xl p-8 mb-8 border border-[#1a2520]">
          <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between mb-6 gap-6 md:gap-0">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2">Diagnóstico do Negócio</h2>
              <p className="text-gray-400 text-sm">Preencha as informações abaixo para calcular</p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-center gap-2 bg-[#0a0f0d] rounded-lg p-1 border border-[#1a2520]">
                <button
                  onClick={() => setModoDetalhado(false)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${!modoDetalhado ? "bg-[#7ef542] text-[#0a0f0d]" : "text-gray-400 hover:text-white"}`}
                >
                  Simplificado
                </button>
                <button
                  onClick={() => setModoDetalhado(true)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${modoDetalhado ? "bg-[#7ef542] text-[#0a0f0d]" : "text-gray-400 hover:text-white"}`}
                >
                  Detalhado
                </button>
              </div>
              <p className="text-gray-500 mt-2 text-center md:text-right max-w-[220px] md:max-w-none text-sm">
                {!modoDetalhado
                  ? "Ideal para projeções rápidas baseadas no mercado"
                  : "Ideal para um diagnóstico de precisão cirúrgica da sua operação"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Linha 1: Nome e WhatsApp */}
            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <User className="w-4 h-4" /> Nome <span className="text-red-500">*</span>
              </label>
              <input type="text" value={nomeLead} onChange={(e) => setNomeLead(e.target.value)} placeholder="Seu nome completo" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Smartphone className="w-4 h-4" /> Nº Whatsapp <span className="text-red-500">*</span>
              </label>
              <input type="text" value={whatsapp} onChange={handleWhatsappChange} onBlur={handleWhatsappBlur} placeholder="(00) 00000-0000" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
              <p className="text-[10px] text-gray-500 mt-1 text-center md:text-left">
                Se o número não for do Brasil (+55), insira o código do país.
              </p>
            </div>

            {/* Linha 2: Produto e Tipo */}
            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Package className="w-4 h-4" /> Nome do Produto
              </label>
              <input type="text" value={nomeProduto} onChange={(e) => setNomeProduto(e.target.value)} placeholder="Ex: Método X (Opcional)" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Tag className="w-4 h-4" /> Tipo de Produto
              </label>
              <input type="text" value={tipoProduto} onChange={(e) => setTipoProduto(e.target.value)} placeholder="Ex: Curso, Mentoria (Opcional)" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
            </div>

            {/* Linha 3: Faturamento e Ticket */}
            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <DollarSign className="w-4 h-4" /> Faturamento mensal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input type="text" value={faturamento} onChange={handleMonetaryChange(setFaturamento)} onKeyPress={handleKeyPress} onBlur={calcularCampoAutomatico} placeholder="50.000,00" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <TrendingUp className="w-4 h-4" /> Ticket médio do produto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input type="text" value={ticketMedio} onChange={handleMonetaryChange(setTicketMedio)} onKeyPress={handleKeyPress} onBlur={calcularCampoAutomatico} placeholder="297,00" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
              </div>
            </div>

            <div className="md:col-span-2">
               <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Briefcase className="w-4 h-4" /> Nicho de Atuação
              </label>
              <input type="text" value={nicho} onChange={(e) => setNicho(e.target.value)} placeholder="Ex: Saúde, Finanças (Opcional)" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
            </div>

            {modoDetalhado && (
              <>
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Percent className="w-4 h-4" /> Taxa de Conversão Checkout (%)
                  </label>
                  <div className="relative">
                    <input
  type="text"
  value={taxaConversao}
  onChange={handleTaxaConversaoChange}
  onBlur={handleTaxaBlur}
  onKeyPress={handleKeyPress} placeholder="Ex: 15,00%" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center md:text-left">
  Opcional. Se você não souber a taxa, preencha o campo de <strong>Abandonos no checkout</strong> logo abaixo.
</p>
                </div>
<div>
  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
    <AlertTriangle className="w-4 h-4" /> Abandonos no checkout (tentativas sem compra)
  </label>

  <input
  type="text"
  value={abandonosCheckout}
  onChange={handleNumericChange(setAbandonosCheckout)}
  onBlur={handleAbandonosBlur}
  onKeyPress={handleKeyPress}
    placeholder="Ex: 420"
    className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
  />

  <p className="text-[10px] text-gray-500 mt-1 text-center md:text-left">
    Se você não souber a taxa %, informe quantas tentativas <strong>não</strong> viraram compra aprovada (Pix/Boleto não pago, cartão recusado e abandono).
  </p>
</div>

                {/* Linha 5: Vendas e Upsell */}
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <TrendingUp className="w-4 h-4" /> Número de vendas realizadas no mês <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={vendasRealizadas} onChange={handleNumericChange(setVendasRealizadas)} onKeyPress={handleKeyPress} onBlur={calcularCampoAutomatico} placeholder="168" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-1">
                      <ArrowUpRight className="w-4 h-4" /> Tem Upsell?
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTemUpsell(true)}
                        className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${temUpsell === true ? "bg-[#7ef542] text-[#0a0f0d] border-[#7ef542]" : "bg-[#0a0f0d] text-gray-400 border-[#1a2520] hover:text-white"}`}
                      >
                        SIM
                      </button>
                      <button
                        onClick={() => { setTemUpsell(false); setValorUpsell(""); }}
                        className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${temUpsell === false ? "bg-red-500/20 text-red-500 border-red-500" : "bg-[#0a0f0d] text-gray-400 border-[#1a2520] hover:text-white"}`}
                      >
                        NÃO
                      </button>
                    </div>
                    
                    {temUpsell && (
                      <div className="relative mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                         <input 
                            type="text" 
                            value={valorUpsell} 
                            onChange={handleMonetaryChange(setValorUpsell)} 
                            placeholder="Valor do Upsell" 
                            className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-10 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors" 
                         />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold">*</span>
                      </div>
                    )}
                </div>

                {/* Linha 6: Tráfego e Downsell */}
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Target className="w-4 h-4" /> Investimento em Tráfego (Mensal)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input type="text" value={investimentoTrafego} onChange={handleMonetaryChange(setInvestimentoTrafego)} placeholder="10.000,00" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-1">
                      <ArrowDownRight className="w-4 h-4" /> Tem Downsell?
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTemDownsell(true)}
                        className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${temDownsell === true ? "bg-[#7ef542] text-[#0a0f0d] border-[#7ef542]" : "bg-[#0a0f0d] text-gray-400 border-[#1a2520] hover:text-white"}`}
                      >
                        SIM
                      </button>
                      <button
                        onClick={() => { setTemDownsell(false); setValorDownsell(""); }}
                        className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${temDownsell === false ? "bg-red-500/20 text-red-500 border-red-500" : "bg-[#0a0f0d] text-gray-400 border-[#1a2520] hover:text-white"}`}
                      >
                        NÃO
                      </button>
                    </div>

                    {temDownsell && (
                      <div className="relative mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                         <input 
                            type="text" 
                            value={valorDownsell} 
                            onChange={handleMonetaryChange(setValorDownsell)} 
                            placeholder="Valor do Downsell" 
                            className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-10 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors" 
                         />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold">*</span>
                      </div>
                    )}
                </div>
              </>
            )}
          </div>

          <button onClick={calcular} className="w-full bg-[#7ef542] hover:bg-[#6ee032] text-[#0a0f0d] font-bold py-4 rounded-lg transition-colors uppercase">
            Gerar Diagnóstico Financeiro
          </button>

          {!modoDetalhado && (
            <div className="mt-6 bg-[#111816] rounded-2xl p-8 border border-yellow-600/30 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <h4 className="text-lg font-bold text-yellow-500">
                  Atenção: Diagnóstico Baseado em Números do Mercado
                </h4>
              </div>

              <div className="space-y-6 text-sm text-gray-300">
                <p className="text-gray-400 text-xs">
                  Os cálculos no modo simplificado utilizam benchmarks técnicos do mercado brasileiro de infoprodutos
                  (Ano base 2024/2025) para tickets de até R$ 1.000,00.
                </p>

                <ul className="space-y-2 list-disc list-inside text-gray-400 text-xs">
                  <li>
                    Em operações de boa performance, a média estatística registrada é de{" "}
                    <span className="text-white font-semibold">6 abandonos de checkout</span> para cada 1 venda concluída.
                  </li>
                  <li>
                    Em operações consideradas eficientes, o sistema processa entre{" "}
                    <span className="text-white font-semibold">5 a 7 tentativas falhas</span> para cada transação aprovada.
                  </li>
                  <li>
                    Para esta calculadora, adotamos uma margem de segurança: Aplicamos uma métrica real de{" "}
                    <span className="text-[#7ef542] font-semibold">3 abandonos para cada 1 venda</span>, garantindo um diagnóstico pé no chão.
                  </li>
                </ul>

                <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 mt-4">
                   <p className="text-xs text-yellow-400 font-semibold mb-2">Sobre o Ecossistema (Upsell/Downsell):</p>
                   <p className="text-xs text-gray-400">
                      Adicionalmente, o cálculo projeta um cenário onde 20% das vendas recuperadas aceitariam um Upsell e 10% dos leads perdidos seriam convertidos em um Downsell. Se você não tem essas ofertas ativas, este valor representa a receita que você está escolhendo não gerar.
                   </p>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20 mt-6">
                <p className="text-xs font-bold text-white mb-2">Parâmetros de Saúde do Checkout (Benchmark 2025):</p>
                <ul className="space-y-1 text-[11px] text-gray-400 list-none">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                    <span className="text-red-400 font-bold">Crítico (&lt; 30%):</span> Vazamento grave. Seu tráfego
                    está sendo incinerado na etapa final.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>{" "}
                    <span className="text-yellow-400 font-bold">Padrão (30% - 60%):</span> Zona de estagnação. Você
                    paga pelo lead, mas deixa metade do faturamento para trás.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7ef542]"></span>{" "}
                    <span className="text-[#7ef542] font-bold">Eficiente (&gt; 60%):</span> Alta performance, mas
                    atenção: na escala, os 40% que não compram representam sua maior fatia de lucro líquido perdido.
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h5 className="text-white font-semibold mb-2">3. Observação Estratégica</h5>
                <p className="text-gray-400 text-xs">
                  Caso os números apresentados sejam superiores aos da sua operação atual, isso é um{" "}
                  <span className="text-yellow-500 font-semibold">indicativo de gargalos críticos</span>.
                </p>
              </div>
            </div>
          )}

          {modoDetalhado && (
            <div className="mt-6 bg-[#111816] rounded-2xl p-8 border border-yellow-600/30 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <h4 className="text-lg font-bold text-yellow-500">
                  Atenção: Diagnóstico de Precisão Baseado em Dados Reais do Seu Negócio.   
                </h4>
              </div>
              <div className="space-y-6 text-sm text-gray-300">
                <p className="text-gray-400 text-xs">
  No modo detalhado, quanto mais dados você informar, mais preciso fica o diagnóstico.
  Você pode informar <strong>a taxa do checkout</strong> ou, se preferir, <strong>a quantidade de abandonos no checkout</strong>.
  Se nenhum dos dois for preenchido, usamos benchmarks (estimativa).
</p>


                <div className="bg-[#7ef542]/5 p-4 rounded-lg border border-[#7ef542]/20 mt-4">
                   <p className="text-xs text-[#7ef542] font-semibold mb-2">Análise de Ecossistema:</p>
                   <p className="text-xs text-gray-300">
                      Cruzamos os dados de checkout com os valores de Upsell e Downsell que você informou (ou estimativas de mercado caso ausentes) para calcular não apenas a venda perdida, mas o LTV (Lifetime Value) desperdiçado por cliente não recuperado.
                   </p>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20 mt-6">
                  <p className="text-xs font-bold text-white mb-2">Parâmetros de Saúde do Checkout (Benchmark 2025):</p>
                  <ul className="space-y-1 text-[11px] text-gray-400 list-none">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                      <span className="text-red-400 font-bold">Crítico (&lt; 30%):</span> Vazamento grave. Seu lucro está sendo incinerado na etapa final.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>{" "}
                      <span className="text-yellow-400 font-bold">Padrão (30% - 60%):</span> Zona de estagnação. Você paga pelo lead, mas ele desiste na boca do gol.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7ef542]"></span>{" "}
                      <span className="text-[#7ef542] font-bold">Eficiente (&gt; 60%):</span> Alta performance, mas ainda há muito lucro oculto a ser extraído.
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h5 className="text-white font-semibold mb-2">2. Identificação de Gargalos</h5>
                  <p className="text-gray-400 text-xs">
                    Se sua taxa está abaixo de 60%, você está pagando caro para atrair leads apenas para vê-los ir embora sem comprar no último segundo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- RESULTADOS --- */}
        {resultados && (
          <div ref={resultadosRef} className="space-y-8">
          
            {/* RESUMO EXECUTIVO + NAVEGAÇÃO RÁPIDA */}
    <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Resumo do mês</p>
          <h3 className="text-xl font-extrabold text-white">
            Você está deixando <span className="text-[#7ef542]">{formatResultCurrency(resultados.oportunidadePerdidaTotal)}</span> no caixa
          </h3>
          <p className="text-xs text-gray-400 mt-1">(produto principal + ecossistema conforme marcado)</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => scrollToId("pedagio")}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-red-500/30 text-red-100 text-sm font-bold hover:bg-red-500/10 transition"
          >
            Ver Pedágio
          </button>
          <button
            onClick={() => scrollToId("recuperacao")}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-[#1a2520] text-gray-200 text-sm font-bold hover:border-[#2a3530] transition"
          >
            Ver Recuperação
          </button>
          <a
            href={calLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-[#7ef542] text-[#0a0f0d] text-sm font-extrabold text-center hover:bg-[#6ee032] transition"
          >
            Agendar
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mt-5">
        <div className="bg-[#0a0f0d] border border-[#1a2520] rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">Conversão</p>
          <p className="text-lg font-extrabold text-white">{resultados.taxaConversaoAtual.toFixed(2).replace(".", ",")}%</p>
        </div>
        <div className="bg-[#0a0f0d] border border-[#1a2520] rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">Vendas</p>
          <p className="text-lg font-extrabold text-white">{formatNumber(resultados.vendas)}</p>
        </div>
        <div className="bg-[#0a0f0d] border border-[#1a2520] rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">Abandonos</p>
          <p className="text-lg font-extrabold text-red-200">{formatNumber(resultados.carrinhosAbandonados)}</p>
        </div>
        <div className="bg-[#0a0f0d] border border-[#1a2520] rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">Recuperável (10%)</p>
          <p className="text-lg font-extrabold text-[#7ef542]">+{formatResultCurrency(resultados.recuperacao10.mensal)}</p>
        </div>
      </div>
      {resultados.diffFaturamentoPct > 15 && (
  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-xs text-yellow-200">
    Atenção: o faturamento informado ({formatResultCurrency(resultados.faturamentoInformado)}) difere de
    Vendas × Ticket ({formatResultCurrency(resultados.faturamentoCalculado)}).  
    Para manter coerência, usamos Vendas × Ticket nos cálculos.
  </div>
)}
{resultados && <StickyCTA />}
    </div>
            {/* 1. Diagnóstico de Saúde (CARD 1 - Com a Explicação de Tráfego) */}
            <div className="bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                <Activity className={`w-6 h-6 ${getStatusColor(resultados.statusSaude)}`} />
                <h3 className="text-xl font-bold">Saúde do Checkout</h3>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span
                      className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getStatusBg(resultados.statusSaude)} text-[#0a0f0d]`}
                    >
                      {resultados.statusSaude === "Critico"
                        ? "Crítico"
                        : resultados.statusSaude === "Padrao"
                          ? "Padrão"
                          : "Eficiente"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-5xl font-bold block ${getStatusColor(resultados.statusSaude)}`}>
                      {resultados.taxaConversaoAtual.toFixed(2).replace(".", ",")}%
                    </span>
                    <span className="text-xs text-gray-400">Conversão</span>
                    <p className="text-[11px] text-gray-500 mt-1">
  Benchmark do seu ticket: <span className="text-white font-bold">{resultados.benchmarkIdeal}%</span> •
  Crítico &lt; <span className="text-red-300 font-bold">{resultados.limiteCritico}%</span> •
  Excelente ≥ <span className="text-[#7ef542] font-bold">{resultados.limiteExcelente}%</span>
</p>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${Math.min(resultados.taxaConversaoAtual, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusBg(resultados.statusSaude)}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-center md:text-left mb-6">
                  {resultados.statusSaude === "Critico"
                    ? "ATENÇÃO: Vazamento grave identificado. Seu tráfego está sendo incinerado na etapa final (<30%). A prioridade máxima é estancar essa perda técnica."
                    : resultados.statusSaude === "Padrao"
                      ? "CUIDADO: Zona de estagnação (30-60%). Você paga caro pelo lead, mas deixa metade do faturamento para trás. É funcional, mas financeiramente ineficiente."
                      : "Sua conversão é eficiente (>60%), mas cuidado: na escala, os clientes que não compram (40%) representam a maior fatia de lucro líquido desperdiçado."}
                </p>

                {/* BLOCO EXPLICATIVO DE TRÁFEGO (MOVIDO PARA CÁ) */}
                <div className="bg-[#0a0f0d] p-4 rounded-lg border border-gray-800 text-xs text-gray-400">
                    <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                      <HelpCircle className="w-4 h-4 text-[#7ef542]" />
                      Entenda o vazamento de tráfego:
                    </div>
                    {modoDetalhado ? (
                      <p>
                        Com a taxa considerada de {resultados.taxaConversaoAtual.toFixed(2).replace(".", ",")}%,você precisou de aprox.{" "}
                        <span className="text-white font-bold">{formatNumber(resultados.totalVisitasEstimadas)} visitas</span> para gerar <span className="text-[#7ef542] font-bold">{resultados.vendas} vendas.
                        </span>
                        
                         Isso significa que <span className="text-red-400 font-bold">{formatNumber(resultados.carrinhosAbandonados)} pessoas</span> chegaram ao pagamento e desistiram.
                      </p>
                    ) : (
                      <p>
                        Baseado em benchmarks de mercado, estimamos que para cada venda realizada, cerca de 
                        <span className="text-red-400 font-bold"> 3 pessoas</span> iniciam o checkout e desistem. Isso gera um volume invisível de leads perdidos.
                      </p>
                    )}
                </div>

              </div>
            </div>

            {/* 2. Oportunidade Perdida (Card Financeiro com Grid) */}
<div className="bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
  <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
    <div className="text-center md:text-left w-full">
      <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
  Lucro perdido no checkout (dinheiro que não entrou no seu caixa)
</p>

      <h2 className="text-4xl md:text-5xl font-bold text-[#7ef542] mb-2">
        {formatResultCurrency(resultados.oportunidadePerdidaTotal)}
      </h2>

      <p className="text-sm text-white max-w-lg mb-4">
        Considerando sua taxa atual, este é o valor que sua operação deixou de colocar no caixa este mês por fricção no checkout e no funil.

      </p>

      <div className="bg-[#0a0f0d] p-4 rounded-lg border border-gray-800 text-xs text-gray-400 mt-4 mb-4">
        <p className="font-semibold text-white mb-3">Composição do Valor Perdido:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="bg-[#111816] p-3 rounded border border-green-500/30 shadow-sm">
            <p className="text-[10px] text-green-500 uppercase font-bold mb-1">Produto Principal</p>
            <p className="text-sm text-white font-mono font-bold">
              {formatResultCurrency(resultados.perdaPrincipal)}
            </p>
          </div>

          <div
            className={`p-3 rounded border ${
              resultados.cenarioUpsell === "sim"
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-900/10"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <p
                className={`text-[10px] uppercase font-bold ${
                  resultados.cenarioUpsell === "sim" ? "text-green-500" : "text-red-500"
                }`}
              >
                Upsell
              </p>
            </div>
            <p
              className={`text-sm font-mono font-bold ${
                resultados.cenarioUpsell === "sim" ? "text-white" : "text-gray-400"
              }`}
            >
              {formatResultCurrency(resultados.perdaUpsellPotencial)}
            </p>
            {resultados.cenarioUpsell === "nao" && (
              <p className="text-[9px] text-red-400 mt-1 font-semibold">Oportunidade Perdida</p>
            )}
          </div>

          <div
            className={`p-3 rounded border ${
              resultados.cenarioDownsell === "sim"
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-900/10"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <p
                className={`text-[10px] uppercase font-bold ${
                  resultados.cenarioDownsell === "sim" ? "text-green-500" : "text-red-500"
                }`}
              >
                Downsell
              </p>
            </div>
            <p
              className={`text-sm font-mono font-bold ${
                resultados.cenarioDownsell === "sim" ? "text-white" : "text-gray-400"
              }`}
            >
              {formatResultCurrency(resultados.perdaDownsellPotencial)}
            </p>
            {resultados.cenarioDownsell === "nao" && (
              <p className="text-[9px] text-red-400 mt-1 font-semibold">Oportunidade Perdida</p>
            )}
          </div>
        </div>

        {(resultados.cenarioUpsell === "nao" || resultados.cenarioDownsell === "nao") && (
          <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500 italic space-y-3 text-left">
            {resultados.cenarioUpsell === "nao" && (
              <p>
                <span className="text-red-400 font-bold">* Upsell:</span> Se você tivesse essa oferta ativa, teria convertida mais
                20% das vendas realizadas (ofertando um produto de maior valor para quem já comprou o principal). O valor em vermelho é o dinheiro deixado na mesa.
              </p>
            )}

            {resultados.cenarioDownsell === "nao" && (
              <p>
                <span className="text-red-400 font-bold">* Downsell:</span> Se você tivesse essa oferta ativa, teria recuperado mais
                10% de conversão vendendo um produto de menor valor para quem não conseguiu comprar o produto principal (mais caro).
              </p>
            )}
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-800/50 text-[9px] text-gray-600 italic text-left">
          <p>* Taxas de conversão consideradas para cálculo: 20% para Upsell (em cima das vendas efetuadas) e 10% para Downsell (em cima das vendas não concluidas).</p>
        </div>
      </div>

      <PedagioCard />

    </div>

    <div className="text-6xl">💸</div>
  </div>
</div>

            {/* TIMELINE (CUSTO DA INAÇÃO) */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <span className="text-2xl">⏳</span>
                <h3 className="text-xl font-semibold">O Custo da Inação</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#0a0f0d] p-4 rounded-xl border border-[#1a2520] text-center">
                  <div className="flex justify-center items-center gap-1 mb-2 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" /> Em 3 Meses: O valor de um novo projeto desperdiçado.
                  </div>
                  <p className="text-3xl font-bold text-white">{formatResultCurrency(resultados.projecao.mes3)}</p>
                </div>
                <div className="bg-[#0a0f0d] p-4 rounded-xl border border-[#1a2520] text-center">
                  <div className="flex justify-center items-center gap-1 mb-2 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" /> Em 6 Meses: O lucro que já deveria estar investido no seu crescimento.
                  </div>
                  <p className="text-3xl font-bold text-white">{formatResultCurrency(resultados.projecao.mes6)}</p>
                </div>
                <div className="bg-[#0a0f0d] p-4 rounded-xl border border-[#7ef542]/50 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#7ef542] w-8 h-8 blur-xl opacity-20"></div>
                  <div className="flex justify-center items-center gap-1 mb-2 text-[#7ef542] text-xs font-bold">
                    <Clock className="w-3 h-3" /> Em 1 Ano: A fortuna acumulada que você escolheu não receber.
                  </div>
                  <p className="text-3xl font-bold text-[#7ef542]">{formatResultCurrency(resultados.projecao.ano1)}</p>
                </div>
              </div>
            </div>

            {/* Cards de Cenários */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-xl font-semibold">O quanto desse dinheiro você quer recuperar hoje?</h3>
              </div>
            </div>

            <div id="recuperacao" className="grid md:grid-cols-3 gap-6">
              {/* Card 10% */}
              <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#2a3530] transition-colors">
                <div className="mb-4">
                  <p className="text-xs text-white uppercase tracking-wide mb-1 text-[20px] font-bold">
                    COM 10%* DE CONVERSÃO
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ganho Mensal</p>
                    <p className="text-2xl font-bold text-white">
                      +{formatResultCurrency(resultados.recuperacao10.mensal)}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#1a2520]">
                    <p className="text-xs text-gray-500 mb-1">Ganho Anual</p>
                    <p className="text-xl font-semibold text-white">
                      +{formatResultCurrency(resultados.recuperacao10.anual)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 20% */}
              <div className="bg-[#111816] rounded-2xl p-6 border-2 border-[#7ef542]/30 hover:border-[#7ef542]/50 transition-colors relative">
                <div className="mb-4">
                  <p className="text-xs text-white uppercase tracking-wide mb-1 text-[20px] font-bold">
                    COM 20%* DE CONVERSÃO
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ganho Mensal</p>
                    <p className="text-2xl font-bold text-white">
                      +{formatResultCurrency(resultados.recuperacao20.mensal)}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#1a2520]">
                    <p className="text-xs text-gray-500 mb-1">Ganho Anual</p>
                    <p className="text-xl font-semibold text-white">
                      +{formatResultCurrency(resultados.recuperacao20.anual)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 34% */}
              <div className="bg-gradient-to-br from-[#111816] to-[#0f1814] rounded-2xl p-6 border-2 border-[#7ef542] hover:border-[#7ef542] transition-colors">
                <div className="mb-4">
                  <p className="text-xs text-[#7ef542] uppercase tracking-wide mb-1 text-[20px] font-bold">
                    COM 34%* DE CONVERSÃO
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ganho Mensal</p>
                    <p className="text-2xl font-bold text-[#7ef542]">
                      +{formatResultCurrency(resultados.recuperacao34.mensal)}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#2a3530]">
                    <p className="text-xs text-gray-500 mb-1">Ganho Anual</p>
                    <p className="text-xl font-semibold text-[#7ef542]">
                      +{formatResultCurrency(resultados.recuperacao34.anual)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-8">
              * Taxas de Conversão Atingidas no decorrer dos Testes de Validação da Recupera.ia
            </p>

            {/* Seção Unificada: Frases de Impacto */}
            <div className="mt-16 bg-[#111816] rounded-2xl p-8 md:p-10 border border-[#1a2520]">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="text-center">
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                    {renderDynamicHeadline(nomeLead, "faria diferença pra você hoje ter mais ")}
                    <span className="text-[#7ef542]">{formatResultCurrency(resultados.recuperacao10.mensal)}</span> no
                    seu bolso todo mês?
                  </h3>
                </div>
                <div className="md:border-l md:border-[#1a2520] md:pl-10 text-center">
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                    E acumular{" "}
                    <span className="text-[#7ef542]">{formatResultCurrency(resultados.recuperacao10.anual)}</span> para
                    a realização daquele sonho adiado tantas vezes seria espetacular, não seria?
                  </h3>
                </div>
              </div>
            </div>

            {/* NOVA SEÇÃO: CABEÇALHO DA LÓGICA DA EFICIÊNCIA */}
            <div className="text-center mb-12 max-w-4xl mx-auto mt-24">
              <div className="inline-block bg-[#7ef542] text-[#0a0f0d] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wide mb-6">
                💡 A VERDADE QUE NINGUÉM TE CONTA
              </div>
              
              <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                A Lógica da Eficiência
                <br />
                <span className="block mt-2">Por que você ignora o lucro que já está "em casa"?</span>
              </h3>
              
              <p className="text-lg text-gray-400 leading-relaxed">
                No mercado de infoprodutos atual, o lucro real não está em quem você ainda vai atrair, mas em parar de negligenciar quem já está com o cartão na mão. O custo de aquisição está cada vez mais alto, e focar apenas na "batalha externa" por novos leads é uma falha de gestão que drena sua margem todos os meses.
              </p>
            </div>

            {/* SEÇÃO EDUCATIVA EXPANDIDA E PERSONALIZADA (OS 4 CARDS COMEÇAM AQUI) */}
            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              
              {/* Bloco 1 — A Ilusão do Tráfego Pago */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#0a0f0d]">
                    1
                  </div>
                  <h4 className="text-xl font-bold text-[#0a0f0d]">A Ilusão do Tráfego Pago</h4>
                </div>
                <div className="space-y-3">
                  {resultados.investimentoTrafego > 0 ? (
  <p className="text-gray-700 text-sm leading-relaxed">
    {nomeLead}, você investe <strong>{formatResultCurrency(resultados.investimentoTrafego)}</strong> por mês. Se sua conversão é de{" "}
    <strong>{resultados.taxaConversaoAtual.toFixed(2)}%</strong>, isso significa que{" "}
    <strong>{resultados.ineficienciaTrafego.toFixed(1)}%</strong> do seu capital é gasto apenas para vencer a barreira técnica do checkout.
  </p>
) : (
  <p className="text-gray-700 text-sm leading-relaxed">
    {nomeLead}, você não informou seu investimento em tráfego. Ainda assim, o diagnóstico mostra o tamanho do vazamento no checkout.
    Se você preencher o investimento, eu consigo calcular também o “pedágio” pago em mídia.
  </p>
)}

                </div>
              </div>

              {/* Bloco 2 — O Ativo de Maior Valor */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#0a0f0d]">
                    2
                  </div>
                  <h4 className="text-xl font-bold text-[#0a0f0d]">Onde o Lucro é Realmente Decidido</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    O lead que chega ao checkout é o seu ativo mais caro. Ele superou o conteúdo e a oferta. Ignorar os <strong>{formatNumber(resultados.carrinhosAbandonados)} leads</strong> que abandonaram o carrinho este mês é o mesmo que atrair clientes para uma loja e manter a porta trancada.
                  </p>
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                    <p className="text-xs text-orange-900 font-semibold leading-relaxed">
                       A falha raramente é do marketing, mas sim da fricção no momento do pagamento (cartão recusado, pix esquecido).
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 3 — Margem Limpa (Zero CAC) */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#0a0f0d]">
                    3
                  </div>
                  <h4 className="text-xl font-bold text-[#0a0f0d]">Margem Limpa (Zero CAC)</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                     A primeira venda paga os custos (Tráfego, Equipe, Ferramentas). O lucro real do seu negócio está na recuperação, pois o Custo de Aquisição (CAC) desse cliente já foi pago lá atrás.
                  </p>
                  <div className="bg-[#7ef542]/10 p-4 rounded-lg border border-[#7ef542]/30">
                    <p className="text-xs font-bold text-[#0a0f0d]">
                      <Wallet className="w-4 h-4 inline mr-1 mb-1"/>
                      Cada real recuperado entra no seu caixa com margem de contribuição quase total. É o dinheiro mais barato que você pode ganhar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 4 — A Intervenção Recupera.ia */}
              <div className="bg-[#111816] rounded-xl p-6 border-2 border-[#7ef542] hover:shadow-[0_0_20px_rgba(126,245,66,0.2)] transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#0a0f0d]">
                    4
                  </div>
                  <img src="/logo-recupera-transparent.png" alt="Recupera.ia" className="h-8 w-auto mt-2" />
                </div>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    As plataformas convencionais falham porque enviam e-mails que caem no spam ou mensagens genéricas que são ignoradas. A <strong>Recupera.ia</strong> utiliza uma camada de Inteligência Conversacional via API Oficial que identifica o motivo real da desistência (saldo, dúvida ou esquecimento).
                  </p>
                  <p className="text-gray-400 text-xs italic border-t border-gray-800 pt-3">
                    Identificamos se o seu cliente parou por saldo, dúvida ou erro técnico e intervimos com uma abordagem humana e cirúrgica para garantir que o dinheiro que já era seu volte para o seu caixa.
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO NOVOS CARDS DINÂMICOS UPSELL E DOWNSELL */}
            {modoDetalhado && (
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Card Upsell */}
                <div className={`rounded-xl p-6 border-2 transition-all ${resultados.cenarioUpsell === "sim" ? 'bg-[#111816] border-yellow-500/50' : 'bg-[#111816] border-red-500/50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                     <ArrowUpRight className={`w-6 h-6 ${resultados.cenarioUpsell === "sim" ? 'text-yellow-500' : 'text-red-500'}`} />
                     <h4 className={`text-lg font-bold ${resultados.cenarioUpsell === "sim" ? 'text-yellow-500' : 'text-red-500'}`}>
                       {resultados.cenarioUpsell === "sim" ? 'Alerta de Oportunidade: Upsell' : 'Risco Crítico: Ausência de Upsell'}
                     </h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {resultados.cenarioUpsell === "sim"
                      ? `Excelente que você já utiliza Upsell, ${nomeLead}. Porém, se sua recuperação de vendas atua apenas no produto principal, você está recuperando apenas "metade" do cliente. A Recupera.ia resgata a jornada completa, garantindo que o Upsell também seja convertido na recuperação.`
                      : "Você está ignorando a zona de lucro máximo. O lead que já disse 'SIM' no checkout é 5x mais propenso a comprar um segundo produto imediatamente (Upsell). Sem isso, seu custo de tráfego recai inteiramente sobre um único produto, reduzindo sua margem drasticamente."
                    }
                  </p>
                </div>

                {/* Card Downsell */}
                <div className={`rounded-xl p-6 border-2 transition-all ${resultados.cenarioDownsell === "sim" ? 'bg-[#111816] border-blue-500/50' : 'bg-[#111816] border-red-500/50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                     {resultados.cenarioDownsell === "sim" ? <AlertOctagon className="w-6 h-6 text-blue-500" /> : <ArrowDownRight className="w-6 h-6 text-red-500" />}
                     <h4 className={`text-lg font-bold ${resultados.cenarioDownsell === "sim" ? 'text-blue-500' : 'text-red-500'}`}>
                       {resultados.cenarioDownsell === "sim" ? 'Atenção Estratégica: Downsell' : 'Vazamento Crítico: Sem Downsell'}
                     </h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {resultados.cenarioDownsell === "sim"
                      ? "Estratégia correta, mas perigosa: O Downsell sem uma inteligência de recuperação humanizada muitas vezes serve apenas para 'baratear' seu produto sem necessidade. Nossa IA intervém para converter o valor cheio antes de permitir a queda para o Downsell."
                      : "Você não oferece uma rota de fuga para o lead que achou o preço alto ou o momento errado. Sem Downsell, o lead sai do seu checkout sem nenhuma alternativa e o seu investimento em tráfego para atraí-lo é 100% perdido."
                    }
                  </p>
                </div>
              </div>
            )}


            {/* SEÇÃO DE PROVA SOCIAL (DEPOIMENTOS) */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Resultados Reais</h3>
                <p className="text-gray-400">O que acontece quando você estanca o vazamento</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1 - Comunidade Online */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all flex flex-col h-full">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">Comunidade Online</h4>
                    <p className="text-sm text-gray-400">(Área de Membros)</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">CENÁRIO:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      R$ 116.955,00 em assinaturas não concluídas. Todos os meses.
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">LUCRO RECUPERADO PELA IA:</p>
                    <p className="text-sm text-gray-300 mb-4">
                      Em apenas um mês, a Recupera.ia colocou <span className="text-[#7ef542] font-bold">R$ 35.866,20</span> de volta no caixa do cliente, recuperando <span className="text-white font-bold">138 leads</span> que já eram considerados perdidos.
                    </p>
                    <div className="border border-[#7ef542]/50 bg-[#7ef542]/5 rounded-lg p-3 mb-4">
                      <p className="text-[#7ef542] font-bold text-center text-sm">Taxa de Conversão de 30,66%</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-500 italic mt-auto">
                    "É um dinheiro que simplesmente não existia para nós. A Recupera.ia não só pagou o investimento no primeiro dia, como criou uma nova fonte de receita que não nos custa nenhum esforço para gerir."
                  </blockquote>
                </div>

                {/* Card 2 - E-commerce */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all flex flex-col h-full">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">E-commerce</h4>
                    <p className="text-sm text-gray-400">Livros Físicos</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">CENÁRIO:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      R$ 32.040,00 em potencial de vendas evaporando a cada 30 dias.
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">LUCRO RECUPERADO PELA IA:</p>
                    <p className="text-sm text-gray-300 mb-4">
                      Nossa IA Conversacional recuperou <span className="text-white font-bold">107 clientes</span>, gerando <span className="text-[#7ef542] font-bold">R$ 19.260,00</span> em faturamento extra e atingindo uma taxa de conversão que nenhuma outra ferramenta chegou perto.
                    </p>
                    <div className="border border-[#7ef542]/50 bg-[#7ef542]/5 rounded-lg p-3 mb-4">
                      <p className="text-[#7ef542] font-bold text-center text-sm">Taxa de Conversão de 60,11%</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-500 italic mt-auto">
                    "Ver 6 em cada 10 pessoas que abandonaram o carrinho voltando para comprar foi inacreditável. A Recupera.ia não é uma ferramenta de recuperação, é uma máquina de conversão."
                  </blockquote>
                </div>

                {/* Card 3 - Plataforma de Alto Volume */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all flex flex-col h-full">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">Plataforma de Alto</h4>
                    <p className="text-sm text-gray-400">Volume (Apostas)</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">CENÁRIO:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      Um vazamento massivo de mais de R$ 715.000,00 por mês em depósitos não realizados.
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">LUCRO RECUPERADO PELA IA:</p>
                    <p className="text-sm text-gray-300 mb-4">
                      Mesmo com um ticket baixo, nosso fluxo recuperou <span className="text-white font-bold">13.745 usuários</span>, injetando <span className="text-[#7ef542] font-bold">R$ 68.725,00</span> de receita adicional que antes era completamente perdida.
                    </p>
                    <div className="border border-[#7ef542]/50 bg-[#7ef542]/5 rounded-lg p-3 mb-4">
                      <p className="text-[#7ef542] font-bold text-center text-sm">+13 mil recuperados em 30 dias</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-500 italic mt-auto">
                    "No nosso volume, cada ponto percentual importa. A Recupera.ia nos entregou quase 10% de conversão sobre um público que já tínhamos desistido. É lucro puro, na escala que precisamos."
                  </blockquote>
                </div>
              </div>
            </div>

            {/* CTA Final */}
            <div id="cta-final" className="mt-12 bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-3xl font-bold leading-tight">
                  {renderDynamicHeadline(nomeLead, "e se eu dissesse que você também pode ter esse resultado?")}
                  
                  <div className="mt-6 space-y-2">
                    <p>
                      E o melhor{nomeLead ? `, ${nomeLead}` : ""}, com <span className="text-[#7ef542]">RISCO ZERO</span> para você.
                    </p>
                    <p>
                      <span className="text-[#7ef542]">GARANTIMOS</span> o seu <span className="text-[#7ef542]">RETORNO EM CONTRATO</span>:
                    </p>
                    <p>
                      Se não recuperarmos o <span className="text-[#7ef542]">DOBRO DO SEU INVESTIMENTO</span>, você não paga nada.
                    </p>
                  </div>
                </h3>
              </div>

              <div className="mt-8">
                <a
                  href="https://app.cal.com/recupera.ia/30min?user=recupera.ia&overlayCalendar=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#7ef542] hover:bg-[#6ee032] text-[#0a0f0d] font-bold py-6 px-8 rounded-lg transition-colors text-center block no-underline"
                >
                  <span className="uppercase md:text-base leading-tight block text-[24px]">
                    QUERO {formatResultCurrency(resultados.recuperacao10.mensal)} A MAIS NO MEU BOLSO TODOS OS MESES COM RISCO ZERO
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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

  // Estados para Features Avançadas (2025)
  const [taxaConversao, setTaxaConversao] = useState("")
  const [investimentoTrafego, setInvestimentoTrafego] = useState("")
  const [frequenciaCompra, setFrequenciaCompra] = useState("")
  
  const [campoAutoCalculado, setCampoAutoCalculado] = useState<"faturamento" | "ticket" | "vendas" | null>(null)

  // --- ESTADO DE RESULTADOS ---
  const [resultados, setResultados] = useState<{
    faturamento: number
    ticketMedio: number
    vendas: number
    oportunidadePerdida: number
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
  } | null>(null)

  const resultadosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResultados(null)
  }, [modoDetalhado])

  // --- FUNÇÕES AUXILIARES E VALIDAÇÃO ---

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

  const calcularCampoAutomatico = () => {
    const fat = parseCurrency(faturamento)
    const ticket = parseCurrency(ticketMedio)
    const vendas = Number(vendasRealizadas) || 0

    if (fat > 0 && ticket > 0) {
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

  const calcular = () => {
    if (!nomeLead.trim() || !whatsapp.trim()) {
      alert("Por favor, preencha os campos obrigatórios: Nome e WhatsApp.")
      return
    }

    if (containsProfanity(nomeLead) || containsProfanity(nomeProduto) || containsProfanity(tipoProduto) || containsProfanity(nicho)) {
      alert("Por favor, utilize termos adequados nos campos de texto.")
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

    let freqLTV = Number(frequenciaCompra)
    if (freqLTV < 1) freqLTV = 1

    let visitasEstimadas = 0

    if (modoDetalhado) {
      const vendasInput = Number(vendasRealizadas)
      const taxaInput = Number.parseFloat(taxaConversao.replace(",", "."))

      if (vendasInput <= 0 || !taxaInput || taxaInput <= 0) {
        alert("Por favor, preencha o número de vendas e a taxa de conversão corretamente.")
        return
      }

      const totalVisitasCheckout = vendasInput / (taxaInput / 100)
      const abandonosCalculados = totalVisitasCheckout - vendasInput

      vendas = vendasInput
      carrinhosAband = Math.round(abandonosCalculados)
      visitasEstimadas = Math.round(totalVisitasCheckout)
      taxaAtual = taxaInput
    } else {
      vendas = Math.round(fat / ticket)
      carrinhosAband = vendas * 3
      taxaAtual = 25
      visitasEstimadas = vendas * 4
    }

    const oportunidadePerdida = carrinhosAband * ticket
    let desperdicio = 0
    let ineficiencia = 0

    if (investimentoAd > 0) {
      const benchmarkIdeal = 50
      if (taxaAtual < benchmarkIdeal) {
        ineficiencia = ((benchmarkIdeal - taxaAtual) / benchmarkIdeal) * 100
        desperdicio = investimentoAd * (ineficiencia / 100)
      }
    }

    const perdaRealLTV = oportunidadePerdida * 12 * freqLTV

    let status: "Critico" | "Padrao" | "Excelente" = "Padrao"
    if (taxaAtual < 30) status = "Critico"
    else if (taxaAtual > 60) status = "Excelente"

    const recuperacao10 = oportunidadePerdida * 0.1
    const recuperacao20 = oportunidadePerdida * 0.2
    const recuperacao34 = oportunidadePerdida * 0.34

    setResultados({
      faturamento: fat,
      ticketMedio: ticket,
      vendas: vendas,
      oportunidadePerdida: oportunidadePerdida,
      taxaConversaoAtual: taxaAtual,
      statusSaude: status,
      desperdicioTrafego: desperdicio,
      ineficienciaTrafego: ineficiencia,
      totalVisitasEstimadas: visitasEstimadas,
      perdaLTV: perdaRealLTV,
      projecao: {
        mes3: oportunidadePerdida * 3,
        mes6: oportunidadePerdida * 6,
        ano1: perdaRealLTV,
      },
      recuperacao10: { mensal: recuperacao10, anual: recuperacao10 * 12 },
      recuperacao20: { mensal: recuperacao20, anual: recuperacao20 * 12 },
      recuperacao34: { mensal: recuperacao34, anual: recuperacao34 * 12 },
      carrinhosAbandonados: carrinhosAband,
    })

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

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-16 md:h-24 flex items-center">
              <img src="/logo-recupera-transparent.png" alt="Recupera.ia Logo" className="h-full w-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 uppercase">Calculadora de Lucro Perdido 2025</h1>
          <p className="text-[#7ef542] text-lg text-[16px]">
            Descubra a fortuna que você está gerando e deixando nas mãos dos seus concorrentes.
          </p>
        </header>

        {/* --- INPUTS --- */}
        <div className="bg-[#111816] rounded-2xl p-8 mb-8 border border-[#1a2520]">
          <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between mb-6 gap-6 md:gap-0">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2">Diagnóstico do Negócio</h2>
              <p className="text-gray-400 text-sm">Preencha as informações abaixo para calcular</p>
            </div>

            <div className="flex items-center gap-2 bg-[#0a0f0d] rounded-lg p-1 border border-[#1a2520]">
              <button onClick={() => setModoDetalhado(false)} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${!modoDetalhado ? "bg-[#7ef542] text-[#0a0f0d]" : "text-gray-400 hover:text-white"}`}>Simplificado</button>
              <button onClick={() => setModoDetalhado(true)} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${modoDetalhado ? "bg-[#7ef542] text-[#0a0f0d]" : "text-gray-400 hover:text-white"}`}>Detalhado</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* === CAMPOS DE IDENTIFICAÇÃO === */}
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

            <div className="md:col-span-2">
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Briefcase className="w-4 h-4" /> Nicho de Atuação
              </label>
              <input type="text" value={nicho} onChange={(e) => setNicho(e.target.value)} placeholder="Ex: Saúde, Finanças (Opcional)" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
            </div>

            {/* === CAMPOS DE CÁLCULO === */}
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

            {modoDetalhado && (
              <>
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <TrendingUp className="w-4 h-4" /> Número de vendas realizadas no mês <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={vendasRealizadas} onChange={handleNumericChange(setVendasRealizadas)} onKeyPress={handleKeyPress} onBlur={calcularCampoAutomatico} placeholder="168" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
                </div>

                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Percent className="w-4 h-4" /> Taxa de Conversão Checkout (%)
                  </label>
                  <input type="text" value={taxaConversao} onChange={handleTaxaConversaoChange} onKeyPress={handleKeyPress} placeholder="Ex: 15,00" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
                  <p className="text-[10px] text-gray-500 mt-1 text-center md:text-left">
                    Consulte o dashboard da sua plataforma (Hotmart/Kiwify).
                  </p>
                </div>

                {/* Novos Campos Estratégicos */}
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Target className="w-4 h-4" /> Investimento em Tráfego (Mensal)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input type="text" value={investimentoTrafego} onChange={handleMonetaryChange(setInvestimentoTrafego)} placeholder="10.000,00 (Opcional)" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Briefcase className="w-4 h-4" /> Compras por cliente/ano (LTV)
                  </label>
                  <input type="text" value={frequenciaCompra} onChange={handleNumericChange(setFrequenciaCompra)} placeholder="Ex: 2 (Se vender mais de 1x)" className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left" />
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
                  Atenção: Cálculos Baseados em Benchmarks de Mercado
                </h4>
              </div>
              <div className="space-y-6 text-sm text-gray-300">
                <p className="text-gray-400 text-xs">
                  Os cálculos no modo simplificado utilizam benchmarks técnicos do mercado brasileiro de infoprodutos
                  (Ano base 2024/2025) para tickets de até R$ 1.000,00.
                </p>
                <div>
                  <h5 className="text-white font-semibold mb-2">1. Contexto de Performance e Eficiência</h5>
                  <ul className="space-y-2 list-disc list-inside text-gray-400 text-xs">
                    <li>
                      Em operações de boa performance, a média estatística registrada é de{" "}
                      <span className="text-white font-semibold">6 abandonos de checkout</span> para cada 1 venda
                      concluída.
                    </li>
                    <li>
                      Em operações consideradas eficientes, o sistema processa entre{" "}
                      <span className="text-white font-semibold">5 a 7 tentativas falhas</span> para cada transação
                      aprovada.
                    </li>
                    <li>
                      Para esta calculadora, adotamos um critério conservador de apenas{" "}
                      <span className="text-[#7ef542] font-semibold">3 abandonos para cada 1 venda</span>, garantindo
                      uma projeção de segurança e credibilidade para o seu negócio.
                    </li>
                  </ul>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20 mt-2">
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

                <div>
                  <h5 className="text-white font-semibold mb-2">3. Observação Estratégica</h5>
                  <p className="text-gray-400 text-xs">
                    Caso os números apresentados sejam superiores aos da sua operação atual, isso é um{" "}
                    <span className="text-yellow-500 font-semibold">indicativo de gargalos críticos</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {modoDetalhado && (
            <div className="mt-6 bg-[#111816] rounded-2xl p-8 border border-yellow-600/30 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <h4 className="text-lg font-bold text-yellow-500">
                  Atenção: Diagnóstico Baseado em Dados Reais da Operação
                </h4>
              </div>
              <div className="space-y-6 text-sm text-gray-300">
                <p className="text-gray-400 text-xs">
                  Ao informar sua <strong>taxa de conversão real</strong>, realizamos uma engenharia reversa do tráfego
                  no seu checkout para determinar exatamente quantas pessoas iniciaram a compra e desistiram.
                </p>

                <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20 mt-2">
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

                <div>
                  <h5 className="text-white font-semibold mb-2">2. Identificação de Gargalos</h5>
                  <p className="text-gray-400 text-xs">
                    Se sua taxa está baixa, você está pagando caro para levar o lead até o checkout apenas para vê-lo
                    sair sem comprar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- RESULTADOS --- */}
        {resultados && (
          <div ref={resultadosRef} className="space-y-8">
            
            {/* 1. Diagnóstico de Saúde */}
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
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${Math.min(resultados.taxaConversaoAtual, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusBg(resultados.statusSaude)}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-center md:text-left mb-4">
                  {resultados.statusSaude === "Critico"
                    ? "ATENÇÃO: Vazamento grave identificado. Seu tráfego está sendo incinerado na etapa final (<30%). A prioridade máxima é estancar essa perda técnica."
                    : resultados.statusSaude === "Padrao"
                      ? "CUIDADO: Zona de estagnação (30-60%). Você paga caro pelo lead, mas deixa metade do faturamento para trás. É funcional, mas financeiramente ineficiente."
                      : "Sua conversão é eficiente (>60%), mas cuidado: na escala, os clientes que não compram (40%) representam a maior fatia de lucro líquido desperdiçado."}
                </p>
              </div>
            </div>

            {/* 2. Oportunidade Perdida */}
            <div className="bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
              <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
                    Possibilidade de Faturamento Perdida Mensalmente
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#7ef542] mb-2">
                    {formatResultCurrency(resultados.oportunidadePerdida)}
                  </h2>
                  <p className="text-sm text-white max-w-lg mb-4">
                    Considerando sua taxa atual, estimamos que{" "}
                    <span className="font-bold text-[#7ef542]">
                      {formatNumber(Math.round(resultados.oportunidadePerdida / resultados.ticketMedio))} leads
                    </span>{" "}
                    chegaram ao pagamento e não concluíram.
                  </p>

                  <div className="bg-[#0a0f0d] p-4 rounded-lg border border-gray-800 text-xs text-gray-400 mt-4 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                      <HelpCircle className="w-4 h-4 text-[#7ef542]" />
                      De onde veio esse número?
                    </div>
                    {modoDetalhado ? (
                      <p>
                        Com {resultados.taxaConversaoAtual}% de conversão, você precisou de aprox.{" "}
                        {formatNumber(resultados.totalVisitasEstimadas)} visitas para gerar {resultados.vendas} vendas.
                        A diferença ({formatNumber(resultados.totalVisitasEstimadas - resultados.vendas)}) são as
                        pessoas que desistiram.
                      </p>
                    ) : (
                      <p>
                        Atenção: Embora operações eficientes registrem entre 5 a 7 tentativas falhas, nós utilizamos um
                        cálculo propositalmente conservador de apenas{" "}
                        <span className="font-bold text-[#7ef542]">
                          3 tentativas de compra sem finalização para cada 1 venda
                        </span>
                        . Isso significa que este número é o cenário "menos pior".
                      </p>
                    )}
                  </div>

                  {resultados.desperdicioTrafego > 0 && (
                    <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded-lg inline-block text-left">
                      <div className="flex items-center gap-2 text-red-400 mb-1 font-bold text-xs">
                        <Target className="w-3 h-3" /> Desperdício de Investimento em Anúncios
                      </div>
                      <p className="text-xs text-gray-300">
                        Se sua conversão fosse a ideal (50%), você precisaria de METADE do tráfego para fazer as mesmas
                        vendas. Como é {resultados.taxaConversaoAtual.toFixed(1)}%, metade do seu dinheiro está sendo
                        gasto para atrair pessoas que o checkout não converte.
                        <br />
                        <strong>
                          Valor estimado jogado fora: {formatResultCurrency(resultados.desperdicioTrafego)}.
                        </strong>
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-6xl">💸</div>
              </div>
            </div>

            {/* Passo 5: Diagnóstico Final */}
            <div className="relative mt-12 mb-12">
              <div className="bg-gradient-to-br from-[#7ef542]/20 to-[#7ef542]/5 rounded-xl p-8 border-2 border-[#7ef542] hover:border-[#7ef542] transition-all">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-xs text-[#7ef542] uppercase tracking-wide mb-1 font-semibold text-center md:text-left">
                      O Diagnóstico Final
                    </p>
                    <p className="text-5xl font-bold text-[#7ef542] mb-2 text-center md:text-left">
                      {resultados.faturamento > 0
                        ? ((resultados.oportunidadePerdida / resultados.faturamento) * 100).toFixed(1).replace(".", ",")
                        : "0,00"}
                      %
                    </p>
                    <p className="text-sm text-white text-center md:text-left">
                      Na prática você está deixando na mesa uma possibilidade de aumento de{" "}
                      <span className="font-semibold text-[#7ef542]">
                        {resultados.faturamento > 0
                          ? ((resultados.oportunidadePerdida / resultados.faturamento) * 100)
                              .toFixed(1)
                              .replace(".", ",")
                          : "0,0"}
                        %
                      </span>{" "}
                      em relação ao seu faturamento atual de{" "}
                      <span className="font-semibold text-[#7ef542]">
                        {formatResultCurrency(resultados.faturamento)}
                      </span>
                      .
                      <br />
                      <br />
                      <span className="text-lg font-bold">É muito dinheiro!!!</span>
                      <br />
                      Olha só os números aqui embaixo.
                    </p>
                  </div>
                  <div className="text-5xl">🚨</div>
                </div>
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
                    <Clock className="w-3 h-3" /> Em 3 Meses
                  </div>
                  <p className="text-3xl font-bold text-white">{formatResultCurrency(resultados.projecao.mes3)}</p>
                </div>
                <div className="bg-[#0a0f0d] p-4 rounded-xl border border-[#1a2520] text-center">
                  <div className="flex justify-center items-center gap-1 mb-2 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" /> Em 6 Meses
                  </div>
                  <p className="text-3xl font-bold text-white">{formatResultCurrency(resultados.projecao.mes6)}</p>
                </div>
                <div className="bg-[#0a0f0d] p-4 rounded-xl border border-[#7ef542]/50 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#7ef542] w-8 h-8 blur-xl opacity-20"></div>
                  <div className="flex justify-center items-center gap-1 mb-2 text-[#7ef542] text-xs font-bold">
                    <Clock className="w-3 h-3" /> Em 1 Ano (LTV)
                  </div>
                  <p className="text-3xl font-bold text-[#7ef542]">{formatResultCurrency(resultados.projecao.ano1)}</p>
                </div>
              </div>
            </div>

            {/* Cards de Cenários */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-xl font-semibold">E se você colocasse no seu bolso parte disso?</h3>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
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

            {/* SEÇÃO EDUCATIVA */}
            <div className="mt-12">
              <div className="bg-white rounded-2xl p-8 md:p-10 mb-12 shadow-2xl border-4 border-[#7ef542]">
                <div className="text-center mb-8">
                  <div className="inline-block bg-[#7ef542] text-[#0a0f0d] px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
                    💡 A Verdade que Ninguém Te Conta
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#0a0f0d] leading-tight mb-3">
                    A Lógica da Eficiência
                    <br />
                    Por que você ignora o lucro que já está "em casa"?
                  </h3>
                  <p className="text-lg text-gray-700 max-w-4xl mx-auto">
                    No mercado de infoprodutos atual, o lucro real não está em quem você ainda vai atrair, mas em parar
                    de negligenciar quem já está com o cartão na mão. O custo de aquisição está cada vez mais alto, e
                    focar apenas na "batalha externa" por novos leads é uma falha de gestão que drena sua margem todos
                    os meses.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Card 1 */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all hover:shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#0a0f0d]">
                        1
                      </div>
                      <h4 className="text-xl font-bold text-[#0a0f0d]">A Dura Realidade dos Números de Conversão</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-[#0a0f0d] mb-1">A. Funis Perpétuos:</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          A taxa média de conversão de leads em vendas no perpétuo gira entre apenas{" "}
                          <span className="font-semibold text-[#0a0f0d]">0,5% e 2%</span>. Isso significa que, de cada
                          100 pessoas que você paga para atrair, até 99 não compram no primeiro contato.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0a0f0d] mb-1">B. Lançamentos Digitais:</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Mesmo em lançamentos bem estruturados (PLF), a conversão média fica entre{" "}
                          <span className="font-semibold text-[#0a0f0d]">1% e 5%</span>. O esforço para convencer um
                          desconhecido é imenso e o desperdício de leads qualificados é a regra, não a exceção.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all hover:shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#0a0f0d]">
                        2
                      </div>
                      <h4 className="text-xl font-bold text-[#0a0f0d]">
                        O Lead mais Quente da Operação
                        <br />é o Mais Negligenciado
                      </h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      O usuário que chega ao checkout é o seu ativo mais valioso. Ele já superou as barreiras de
                      confiança, assistiu ao seu conteúdo, entendeu sua oferta e decidiu que queria comprar.
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      Estatisticamente, em operações de infoprodutos, a conversão final no checkout dificilmente
                      ultrapassa <span className="font-semibold text-[#0a0f0d]">15% a 25%</span>.
                    </p>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                      <p className="text-xs text-orange-800 font-semibold">
                        📊 Isso revela que entre <span className="font-bold">75% e 85%</span> dos seus leads mais
                        quentes simplesmente "vazam" do seu caixa no último segundo por falhas técnicas, distrações ou
                        fricções de pagamento.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all hover:shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#0a0f0d]">
                        3
                      </div>
                      <h4 className="text-xl font-bold text-[#0a0f0d]">
                        O Lucro Invisível:
                        <br />O Resultado está "Dentro de Casa"
                      </h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      Manter um processo de recuperação passivo é aceitar que ocorram de{" "}
                      <span className="font-semibold text-[#0a0f0d]">5 a 7 tentativas falhas</span> para cada venda
                      aprovada.
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      Você já comprou o lead, já pagou pelo tráfego e já fez o marketing. Ignorar o abandono de
                      carrinho, o Pix gerado e não pago ou o cartão recusado é o mesmo que jogar dinheiro no lixo de
                      forma consciente.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-600 p-3 rounded">
                      <p className="text-xs text-yellow-900 font-semibold">
                        💡 Recuperar esse lead é muito mais fácil e barato, pois o nível de consciência dele sobre o seu
                        produto é máximo.
                      </p>
                    </div>
                  </div>

                  {/* Card 4 - A Solução */}
                  <div className="bg-[#111816] rounded-xl p-6 border-2 border-[#7ef542] hover:border-[#6ee032] transition-all hover:shadow-[0_0_20px_rgba(126,245,66,0.2)]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#0a0f0d]">
                        4
                      </div>
                      <div className="flex flex-col">
                        <img
                          src="/logo-recupera-transparent.png"
                          alt="Recupera.ia"
                          className="h-8 w-auto mb-2 self-start"
                        />
                        <h4 className="font-bold text-white">A Tecnologia para Estancar o Vazamento</h4>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      A Recupera.ia surge para garantir que você pare de depender exclusivamente da entrada de novos
                      leads e passe a extrair o lucro máximo da base que já possui.
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      Atuamos diretamente na "camada oculta" de processamento, onde as plataformas convencionais falham
                      em intervir de forma humanizada e rápida.
                    </p>
                    <div className="bg-[#7ef542]/10 border-l-4 border-[#7ef542] p-3 rounded">
                      <p className="text-xs text-white font-semibold">
                        ✅ Através de estratégias ativas via API oficial do WhatsApp, resolvemos as recusas técnicas de
                        cartão e a inércia do Pix/Boleto, elevando o seu faturamento com leads que você já tem.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-6 border-t-2 border-gray-200">
                  <p className="text-xl font-bold text-[#0a0f0d] mb-4">
                    Você está pronto para parar de desperdiçar dinheiro e começar a recuperar o que já é seu?
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO DE PROVA SOCIAL (DEPOIMENTOS) - RESTAURADA EXATAMENTE CONFORME A IMAGEM */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Veja alguns números</h3>
                <p className="text-gray-400">Resultados reais de quem ja confia na Recupera.ia</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1 - Comunidade Online */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all flex flex-col h-full">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">Comunidade Online</h4>
                    <p className="text-sm text-gray-400">(Área de Membros)</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O CENÁRIO:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      R$ 116.955,00 em assinaturas não concluídas. Todos os meses.
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O RESULTADO:</p>
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
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O CENÁRIO:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      R$ 32.040,00 em potencial de vendas evaporando a cada 30 dias.
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O RESULTADO:</p>
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
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O CENÁRIO:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      Um vazamento massivo de mais de R$ 715.000,00 por mês em depósitos não realizados.
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O RESULTADO:</p>
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
            <div className="mt-12 bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-3xl font-bold leading-tight">
                  {renderDynamicHeadline(nomeLead, "e se eu dissesse que você também pode ter esse resultado?")}
                  <br />E o melhor: com <span className="text-[#7ef542]">RISCO ZERO</span>{" "} de investir e não ter retorno <span className="text-[#7ef542]"><br />ASSINADO EM CONTRATO!</span>
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

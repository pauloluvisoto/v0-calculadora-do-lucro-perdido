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
  Download,
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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

    // Novos campos adicionados para PDF
    carrinhosAbandonados: number
    lucroTotalPerdido: number
    cenario1: { percentualRecuperacao: number; faturamentoExtra: number; roi: number }
    cenario2: { percentualRecuperacao: number; faturamentoExtra: number; roi: number }
    cenario3: { percentualRecuperacao: number; faturamentoExtra: number; roi: number }
  } | null>(null)

  const resultadosRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResultados(null)
  }, [modoDetalhado])

  // --- FUNÇÕES AUXILIARES E VALIDAÇÃO ---

  const badWords = [
    "teste",
    "test",
    "admin",
    "merda",
    "bosta",
    "caralho",
    "puta",
    "viado",
    "cu",
    "buceta",
    "pinto",
    "burro",
    "idiota",
    "desgraça",
    "foda",
    "corno",
    "pau",
    "chupa",
  ]

  const containsProfanity = (text: string) => {
    if (!text) return false
    return badWords.some((word) => new RegExp(`\\b${word}\\b`, "i").test(text))
  }

  const formatText = (text: string) => {
    if (!text) return ""
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
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

  const handleMonetaryChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(formatCurrency(e.target.value))
      // Chama o calculo automatico logo apos setar o estado (embora o estado n tenha atualizado ainda no ciclo, passamos o valor novo manualmente se necessario, ou usamos useEffect.
      // Aqui vamos confiar no onBlur paraRecalculo pesado, mas tentar atualizar se possivel)
    }

  const handleNumericChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "")
      setter(val)
    }

  const handleTaxaConversaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, "")
    const floatVal = Number.parseFloat(value.replace(",", "."))
    if (floatVal > 100) return
    setTaxaConversao(value)
  }

  // Lógica corrigida para garantir consistência matemática
  const calcularCampoAutomatico = () => {
    const fat = parseCurrency(faturamento)
    const ticket = parseCurrency(ticketMedio)
    const vendas = Number(vendasRealizadas) || 0

    // Se temos Faturamento e Ticket, Vendas é calculado
    if (fat > 0 && ticket > 0) {
      const calculatedVendas = Math.round(fat / ticket)
      setVendasRealizadas(String(calculatedVendas))
      setCampoAutoCalculado("vendas")
      return
    }

    // Se temos Vendas e Ticket, Faturamento é calculado
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

    if (
      containsProfanity(nomeLead) ||
      containsProfanity(nomeProduto) ||
      containsProfanity(tipoProduto) ||
      containsProfanity(nicho)
    ) {
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

      // Validação de consistência básica
      if (vendasInput <= 0 || !taxaInput || taxaInput <= 0) {
        alert("Por favor, preencha o número de vendas e a taxa de conversão corretamente.")
        return
      }

      // Proteção contra inputs matematicamente impossíveis (ex: mais vendas que faturamento/ticket permitiria com margem de erro)
      // Mas respeitaremos o input do usuário se ele for "possível"

      const totalVisitasCheckout = vendasInput / (taxaInput / 100)
      const abandonosCalculados = totalVisitasCheckout - vendasInput

      vendas = vendasInput
      carrinhosAband = Math.round(abandonosCalculados)
      visitasEstimadas = Math.round(totalVisitasCheckout)
      taxaAtual = taxaInput
    } else {
      // Modo Simplificado (3x)
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

    // Cálculo dos cenários para PDF
    const cenario1 = {
      percentualRecuperacao: 10,
      faturamentoExtra: oportunidadePerdida * 0.1,
      roi: (oportunidadePerdida * 0.1) / (investimentoAd > 0 ? investimentoAd * 0.1 : 1), // Simplificado
    }
    const cenario2 = {
      percentualRecuperacao: 20,
      faturamentoExtra: oportunidadePerdida * 0.2,
      roi: (oportunidadePerdida * 0.2) / (investimentoAd > 0 ? investimentoAd * 0.2 : 1),
    }
    const cenario3 = {
      percentualRecuperacao: 34,
      faturamentoExtra: oportunidadePerdida * 0.34,
      roi: (oportunidadePerdida * 0.34) / (investimentoAd > 0 ? investimentoAd * 0.34 : 1),
    }

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

      // Adicionando novos campos para o PDF
      carrinhosAbandonados: carrinhosAband,
      lucroTotalPerdido: oportunidadePerdida, // Assumindo que oportunidadePerdida é o lucro total perdido mensal
      cenario1: cenario1,
      cenario2: cenario2,
      cenario3: cenario3,
    })

    setTimeout(() => {
      resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  // --- GERADOR DE PDF (AUDITORIA) ---
  const generatePDF = async () => {
    if (!resultados) return
    setIsGeneratingPdf(true)

    try {
      // Create a new window with completely isolated HTML - no CSS inheritance
      const printWindow = window.open("", "_blank", "width=800,height=600")

      if (!printWindow) {
        alert("Por favor, permita popups para gerar o PDF.")
        setIsGeneratingPdf(false)
        return
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Lucro Perdido - ${nomeLead}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              background: #0a0f0d;
              color: #ffffff;
              padding: 40px;
              line-height: 1.6;
            }
            .container { max-width: 700px; margin: 0 auto; }
            h1 {
              color: #7ef542;
              font-size: 28px;
              margin-bottom: 30px;
              text-align: center;
              border-bottom: 2px solid #7ef542;
              padding-bottom: 15px;
            }
            .section {
              background: #141b17;
              border: 1px solid #3a5a40;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .section h2 {
              color: #7ef542;
              font-size: 18px;
              margin-bottom: 15px;
              border-bottom: 1px solid #3a5a40;
              padding-bottom: 8px;
            }
            .section p {
              margin: 8px 0;
              font-size: 14px;
            }
            .section strong { color: #7ef542; }
            .highlight {
              color: #7ef542;
              font-size: 28px;
              font-weight: bold;
              text-align: center;
              padding: 15px 0;
            }
            .highlight-subtitle {
              text-align: center;
              color: #cccccc;
              font-size: 14px;
              margin-top: -10px;
            }
            .scenario {
              background: #1a2520;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 12px;
            }
            .scenario:last-child { margin-bottom: 0; }
            .scenario h3 {
              color: #7ef542;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .scenario p { margin: 5px 0; font-size: 13px; }
            .footer {
              text-align: center;
              padding-top: 20px;
              margin-top: 20px;
              border-top: 1px solid #3a5a40;
            }
            .footer p { font-size: 12px; color: #888888; }
            .footer .brand { color: #7ef542; font-weight: bold; }
            @media print {
              body { background: #0a0f0d !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Relatório de Análise de Lucro Perdido</h1>
            
            <div class="section">
              <h2>Informações do Lead</h2>
              <p><strong>Nome:</strong> ${nomeLead}</p>
              <p><strong>WhatsApp:</strong> ${whatsapp}</p>
              <p><strong>Nicho:</strong> ${nicho || "Não informado"}</p>
              <p><strong>Produto:</strong> ${nomeProduto || "Não informado"}</p>
            </div>

            <div class="section">
              <h2>Dados Atuais</h2>
              <p><strong>Faturamento:</strong> R$ ${faturamento}</p>
              <p><strong>Ticket Médio:</strong> R$ ${ticketMedio}</p>
              <p><strong>Vendas Realizadas:</strong> ${resultados.vendas.toLocaleString("pt-BR")}</p>
              <p><strong>Carrinhos Abandonados:</strong> ${resultados.carrinhosAbandonados.toLocaleString("pt-BR")}</p>
              <p><strong>Taxa de Conversão:</strong> ${resultados.taxaConversaoAtual.toFixed(1)}%</p>
              <p><strong>Status:</strong> ${resultados.statusSaude}</p>
            </div>

            <div class="section">
              <h2>Oportunidade de Recuperação</h2>
              <p class="highlight">
                R$ ${resultados.lucroTotalPerdido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p class="highlight-subtitle">em vendas perdidas por mês</p>
            </div>

            <div class="section">
              <h2>Cenários de Recuperação</h2>
              
              <div class="scenario">
                <h3>Cenário Conservador (10% de recuperação)</h3>
                <p><strong>Recuperação Mensal:</strong> R$ ${resultados.cenario1.faturamentoExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p><strong>Recuperação Anual:</strong> R$ ${(resultados.cenario1.faturamentoExtra * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div class="scenario">
                <h3>Cenário Moderado (20% de recuperação)</h3>
                <p><strong>Recuperação Mensal:</strong> R$ ${resultados.cenario2.faturamentoExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p><strong>Recuperação Anual:</strong> R$ ${(resultados.cenario2.faturamentoExtra * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div class="scenario">
                <h3>Cenário Otimista (34% de recuperação)</h3>
                <p><strong>Recuperação Mensal:</strong> R$ ${resultados.cenario3.faturamentoExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p><strong>Recuperação Anual:</strong> R$ ${(resultados.cenario3.faturamentoExtra * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div class="section">
              <h2>Projeção de Perdas</h2>
              <p><strong>Em 3 meses:</strong> R$ ${resultados.projecao.mes3.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Em 6 meses:</strong> R$ ${resultados.projecao.mes6.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Em 1 ano:</strong> R$ ${resultados.projecao.ano1.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div class="footer">
              <p class="brand">Calculadora de Lucro Perdido - Recupera.ia</p>
              <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          setIsGeneratingPdf(false)
        }, 250)
      }

      // Fallback if onload doesn't fire
      setTimeout(() => {
        setIsGeneratingPdf(false)
      }, 3000)
    } catch (error) {
      console.error("Erro ao gerar PDF", error)
      alert("Ocorreu um erro ao gerar seu PDF. Tente novamente.")
      setIsGeneratingPdf(false)
    }
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

  // --- TEXTOS DO DIAGNÓSTICO (PDF) ---
  const getDiagnosisTexts = (rate: number) => {
    if (rate < 30)
      return {
        title: "Vazamento Crítico Identificado",
        tech: "Seu checkout apresenta um vazamento grave. Nesta faixa, o problema geralmente é técnico ou de extrema fricção.",
        cause: "Possíveis causas: Lentidão no carregamento, excesso de campos ou falta de confiança.",
        verdict:
          "Veredito: Você está pagando caro para atrair visitantes e os 'expulsa' na hora do pagamento. A recuperação ativa é sobrevivência.",
      }
    if (rate <= 60)
      return {
        title: "Zona de Estagnação (Padrão)",
        tech: "Você está na média de mercado. Sua oferta é boa, mas sua operação é passiva.",
        cause:
          "Possíveis causas: Falta de fluxo humanizado para Pix/Boletos e ausência de resgate de cartões recusados.",
        verdict:
          "Veredito: Você está em um platô. Metade do lucro potencial fica na mesa por falta de intervenção imediata.",
      }
    return {
      title: "Alta Performance com Risco de Escala",
      tech: "Sua operação é eficiente, mas você atingiu o teto da conversão passiva.",
      cause: "Mesmo em checkouts excelentes, 40% não compram por motivos externos (limite, esquecimento).",
      verdict:
        "Veredito: Na escala, esses 40% representam seu maior lucro líquido desperdiçado. Recuperar 1/4 disso dobra sua margem.",
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
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* === CAMPOS DE IDENTIFICAÇÃO === */}
            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <User className="w-4 h-4" /> Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nomeLead}
                onChange={(e) => setNomeLead(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Smartphone className="w-4 h-4" /> Nº Whatsapp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={handleWhatsappChange}
                onBlur={handleWhatsappBlur}
                placeholder="(00) 00000-0000"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
              <p className="text-[10px] text-gray-500 mt-1 text-center md:text-left">
                Se o número não for do Brasil (+55), insira o código do país.
              </p>
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Package className="w-4 h-4" /> Nome do Produto
              </label>
              <input
                type="text"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                placeholder="Ex: Método X (Opcional)"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Tag className="w-4 h-4" /> Tipo de Produto
              </label>
              <input
                type="text"
                value={tipoProduto}
                onChange={(e) => setTipoProduto(e.target.value)}
                placeholder="Ex: Curso, Mentoria (Opcional)"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <Briefcase className="w-4 h-4" /> Nicho de Atuação
              </label>
              <input
                type="text"
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="Ex: Saúde, Finanças (Opcional)"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
            </div>

            {/* === CAMPOS DE CÁLCULO === */}
            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <DollarSign className="w-4 h-4" /> Faturamento mensal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={faturamento}
                onChange={handleMonetaryChange(setFaturamento)}
                onKeyPress={handleKeyPress}
                onBlur={calcularCampoAutomatico}
                placeholder="50.000,00"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
            </div>

            <div>
              <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                <TrendingUp className="w-4 h-4" /> Ticket médio do produto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ticketMedio}
                onChange={handleMonetaryChange(setTicketMedio)}
                onKeyPress={handleKeyPress}
                onBlur={calcularCampoAutomatico}
                placeholder="297,00"
                className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
              />
            </div>

            {modoDetalhado && (
              <>
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <TrendingUp className="w-4 h-4" /> Número de vendas realizadas no mês{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vendasRealizadas}
                    onChange={handleNumericChange(setVendasRealizadas)}
                    onKeyPress={handleKeyPress}
                    onBlur={calcularCampoAutomatico}
                    placeholder="168"
                    className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Percent className="w-4 h-4" /> Taxa de Conversão Checkout (%)
                  </label>
                  <input
                    type="text"
                    value={taxaConversao}
                    onChange={handleTaxaConversaoChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ex: 15,00"
                    className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
                  />
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
                    <input
                      type="text"
                      value={investimentoTrafego}
                      onChange={handleMonetaryChange(setInvestimentoTrafego)}
                      placeholder="10.000,00 (Opcional)"
                      className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center justify-center md:justify-start gap-2 text-[#7ef542] text-sm mb-2">
                    <Briefcase className="w-4 h-4" /> Compras por cliente/ano (LTV)
                  </label>
                  <input
                    type="text"
                    value={frequenciaCompra}
                    onChange={handleNumericChange(setFrequenciaCompra)}
                    placeholder="Ex: 2 (Se vender mais de 1x)"
                    className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors text-center md:text-left"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={calcular}
            className="w-full bg-[#7ef542] hover:bg-[#6ee032] text-[#0a0f0d] font-bold py-4 rounded-lg transition-colors uppercase"
          >
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
            {/* BOTÃO DE DOWNLOAD PDF */}
            <div className="flex justify-end mb-4">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-[#1a2520] hover:bg-[#7ef542] hover:text-[#0a0f0d] text-[#7ef542] border border-[#7ef542] px-4 py-2 rounded-lg transition-all font-bold text-sm"
              >
                {isGeneratingPdf ? (
                  <>Gerando Auditoria...</>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Baixar Auditoria PDF Completa
                  </>
                )}
              </button>
            </div>

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
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight text-center md:text-left">
                    {renderDynamicHeadline(nomeLead, "faria diferença pra você hoje ter mais ")}
                    <span className="text-[#7ef542]">{formatResultCurrency(resultados.recuperacao10.mensal)}</span> no
                    seu bolso todo mês?
                  </h3>
                </div>
                <div className="md:border-l md:border-[#1a2520] md:pl-10">
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight text-center md:text-left">
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
                      Em apenas um mês, a Recupera.ia colocou{" "}
                      <span className="text-[#7ef542] font-bold">R$ 35.866,20</span> de volta no caixa do cliente,
                      recuperando <span className="text-white font-bold">138 leads</span> que já eram considerados
                      perdidos.
                    </p>
                    <div className="border border-[#7ef542]/50 bg-[#7ef542]/5 rounded-lg p-3 mb-4">
                      <p className="text-[#7ef542] font-bold text-center text-sm">Taxa de Conversão de 30,66%</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-500 italic mt-auto">
                    "É um dinheiro que simplesmente não existia para nós. A Recupera.ia não só pagou o investimento no
                    primeiro dia, como criou uma nova fonte de receita que não nos custa nenhum esforço para gerir."
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
                      Nossa IA Conversacional recuperou <span className="text-white font-bold">107 clientes</span>,
                      gerando <span className="text-[#7ef542] font-bold">R$ 19.260,00</span> em faturamento extra e
                      atingindo uma taxa de conversão que nenhuma outra ferramenta chegou perto.
                    </p>
                    <div className="border border-[#7ef542]/50 bg-[#7ef542]/5 rounded-lg p-3 mb-4">
                      <p className="text-[#7ef542] font-bold text-center text-sm">Taxa de Conversão de 60,11%</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-500 italic mt-auto">
                    "Ver 6 em cada 10 pessoas que abandonaram o carrinho voltando para comprar foi inacreditável. A
                    Recupera.ia não é uma ferramenta de recuperação, é uma máquina de conversão."
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
                      Mesmo com um ticket baixo, nosso fluxo recuperou{" "}
                      <span className="text-white font-bold">13.745 usuários</span>, injetando{" "}
                      <span className="text-[#7ef542] font-bold">R$ 68.725,00</span> de receita adicional que antes era
                      completamente perdida.
                    </p>
                    <div className="border border-[#7ef542]/50 bg-[#7ef542]/5 rounded-lg p-3 mb-4">
                      <p className="text-[#7ef542] font-bold text-center text-sm">+13 mil recuperados em 30 dias</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-500 italic mt-auto">
                    "No nosso volume, cada ponto percentual importa. A Recupera.ia nos entregou quase 10% de conversão
                    sobre um público que já tínhamos desistido. É lucro puro, na escala que precisamos."
                  </blockquote>
                </div>
              </div>
            </div>

            {/* CTA Final */}
            <div className="mt-12 bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-3xl font-bold leading-tight">
                  {renderDynamicHeadline(nomeLead, "e se eu dissesse que você também pode ter esse resultado?")}
                  <br />E o melhor: com <span className="text-[#7ef542]">RISCO ZERO</span> de investir e não ter retorno{" "}
                  <span className="text-[#7ef542]">
                    <br />
                    ASSINADO EM CONTRATO!
                  </span>
                </h3>
              </div>

              <div className="mt-8">
                <a
                  href="https://wa.me/5519936196347?text=Quero%20recuperar%20meu%20lucro%20perdido"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#7ef542] hover:bg-[#6ee032] text-[#0a0f0d] font-bold py-6 px-8 rounded-lg transition-colors text-center block no-underline"
                >
                  <span className="uppercase md:text-base leading-tight block text-[24px]">
                    QUERO {formatResultCurrency(resultados.recuperacao10.mensal)} A MAIS NO MEU BOLSO TODOS OS MESES COM
                    RISCO ZERO
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- ESTRUTURA OCULTA DO PDF (NÃO VISÍVEL NA TELA) --- */}
      {/* ATENÇÃO: ESTA SEÇÃO USA ESTILOS INLINE PARA GARANTIR COMPATIBILIDADE COM HTML2CANVAS.
          NÃO SUBSTITUA POR CLASSES TAILWIND QUE USEM OKLCH OU VARIÁVEIS MODERNAS.
      */}
      {resultados && (
        <div ref={reportRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          {/* PÁGINA 1: CAPA E DIAGNÓSTICO INICIAL */}
          <div
            style={{
              width: "794px",
              height: "1123px",
              backgroundColor: "#0a0f0d",
              color: "#ffffff",
              padding: "48px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderBottom: "1px solid #1f2937",
            }}
          >
            <div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "64px" }}
              >
                <img src="/logo-recupera-transparent.png" style={{ height: "64px", width: "auto" }} alt="Logo" />
                <span
                  style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}
                >
                  Auditoria Confidencial
                </span>
              </div>

              <div style={{ marginBottom: "48px" }}>
                <h1
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    lineHeight: "1.2",
                  }}
                >
                  Auditoria de Lucro
                  <br />
                  <span style={{ color: "#7ef542" }}>Invisível</span>
                </h1>
                <p style={{ fontSize: "20px", color: "#9ca3af" }}>
                  Relatório técnico de recuperação de ativos financeiros.
                </p>
              </div>

              <div
                style={{
                  border: "1px solid #7ef542",
                  backgroundColor: "rgba(126, 245, 66, 0.05)",
                  padding: "32px",
                  borderRadius: "12px",
                  marginBottom: "48px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    color: "#7ef542",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: "bold",
                    marginBottom: "24px",
                  }}
                >
                  Dados da Operação
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Preparado para:</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold" }}>{nomeLead || "Empresário Digital"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Data da Auditoria:</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold" }}>{new Date().toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Produto/Operação:</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold" }}>{nomeProduto || "Sua Operação Digital"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Nicho de Atuação:</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold" }}>{nicho || "Infoprodutos e Vendas Online"}</p>
                  </div>
                </div>
              </div>

              {/* STATUS DO CHECKOUT NO PDF */}
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                  1. Diagnóstico de Saúde do Checkout
                </h3>
                <div
                  style={{
                    backgroundColor: "#111816",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        textTransform: "uppercase",
                        backgroundColor:
                          resultados.statusSaude === "Critico"
                            ? "#ef4444"
                            : resultados.statusSaude === "Padrao"
                              ? "#eab308"
                              : "#7ef542",
                        color: "#0a0f0d",
                      }}
                    >
                      Status:{" "}
                      {resultados.statusSaude === "Critico"
                        ? "Crítico"
                        : resultados.statusSaude === "Padrao"
                          ? "Padrão"
                          : "Eficiente"}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "36px",
                          fontWeight: "bold",
                          color:
                            resultados.statusSaude === "Critico"
                              ? "#ef4444"
                              : resultados.statusSaude === "Padrao"
                                ? "#eab308"
                                : "#7ef542",
                        }}
                      >
                        {resultados.taxaConversaoAtual.toFixed(2)}%
                      </span>
                      <span style={{ fontSize: "12px", color: "#9ca3af", display: "block" }}>
                        Taxa de Conversão Atual
                      </span>
                    </div>
                  </div>
                  {/* Insight Dinâmico */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderRadius: "8px",
                      border: "1px solid #374151",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        color:
                          resultados.statusSaude === "Critico"
                            ? "#ef4444"
                            : resultados.statusSaude === "Padrao"
                              ? "#eab308"
                              : "#7ef542",
                      }}
                    >
                      {getDiagnosisTexts(resultados.taxaConversaoAtual).title}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#d1d5db", marginBottom: "8px" }}>
                      {getDiagnosisTexts(resultados.taxaConversaoAtual).tech}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                      {getDiagnosisTexts(resultados.taxaConversaoAtual).verdict}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", borderTop: "1px solid #1f2937", paddingTop: "24px" }}>
              <p style={{ fontSize: "10px", color: "#4b5563" }}>Recupera.ia - Tecnologia de Recuperação Ativa © 2025</p>
            </div>
          </div>

          {/* PÁGINA 2: O VILÃO FINANCEIRO */}
          <div
            style={{
              width: "794px",
              height: "1123px",
              backgroundColor: "#0a0f0d",
              color: "#ffffff",
              padding: "48px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderBottom: "1px solid #1f2937",
            }}
          >
            <div>
              <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "32px" }}>
                2. O Impacto Financeiro Real
              </h3>

              {/* BIG NUMBER BOX */}
              <div
                style={{
                  backgroundColor: "#7ef542",
                  color: "#0a0f0d",
                  padding: "40px",
                  borderRadius: "16px",
                  marginBottom: "32px",
                  boxShadow: "0 0 40px rgba(126,245,66,0.2)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                    opacity: 0.8,
                  }}
                >
                  Possibilidade de Faturamento Perdida (Mensal)
                </p>
                <h2 style={{ fontSize: "72px", fontWeight: "bold", letterSpacing: "-0.05em" }}>
                  {formatResultCurrency(resultados.oportunidadePerdida)}
                </h2>
                <p style={{ marginTop: "16px", fontWeight: "500", opacity: 0.9 }}>
                  Este é o valor exato que sua operação gerou de interesse mas falhou em capturar.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <div
                  style={{
                    backgroundColor: "#111816",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                    Volume de Leads Perdidos
                  </p>
                  <p style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff", marginBottom: "8px" }}>
                    {formatNumber(Math.round(resultados.oportunidadePerdida / resultados.ticketMedio))}{" "}
                    <span style={{ fontSize: "14px", color: "#7ef542" }}>Leads</span>
                  </p>
                  <p style={{ fontSize: "10px", color: "#6b7280" }}>
                    Pessoas que chegaram ao checkout e não compraram este mês.
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "#111816",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                    Ticket Médio Analisado
                  </p>
                  <p style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff", marginBottom: "8px" }}>
                    {formatResultCurrency(resultados.ticketMedio)}
                  </p>
                  <p style={{ fontSize: "10px", color: "#6b7280" }}>Base de cálculo para projeção de perdas.</p>
                </div>
              </div>

              {/* Desperdício de Tráfego (Condicional) */}
              {resultados.desperdicioTrafego > 0 && (
                <div
                  style={{
                    backgroundColor: "rgba(127, 29, 29, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    padding: "24px",
                    borderRadius: "12px",
                    marginBottom: "32px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <Target style={{ width: "20px", height: "20px", color: "#ef4444" }} />
                    <h4 style={{ color: "#ef4444", fontWeight: "bold" }}>Alerta de Desperdício de Tráfego</h4>
                  </div>
                  <p style={{ fontSize: "14px", color: "#d1d5db", marginBottom: "8px" }}>
                    Com sua taxa atual, você está pagando para atrair pessoas que seu sistema expulsa.
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>
                    {formatResultCurrency(resultados.desperdicioTrafego)}{" "}
                    <span style={{ fontSize: "14px", fontWeight: "normal", color: "#9ca3af" }}>
                      jogados fora em anúncios/mês
                    </span>
                  </p>
                </div>
              )}

              {/* Projeção Anual (LTV) */}
              <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", marginTop: "32px" }}>
                3. O Custo da Inação (12 Meses)
              </h3>
              <div
                style={{
                  background: "linear-gradient(to right, #111816, #000000)",
                  padding: "32px",
                  borderRadius: "12px",
                  borderLeft: "4px solid #7ef542",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "4px" }}>
                      Se nada for feito hoje, em 1 ano você terá perdido:
                    </p>
                    <h2 style={{ fontSize: "48px", fontWeight: "bold", color: "#ffffff" }}>
                      {formatResultCurrency(resultados.projecao.ano1)}
                    </h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#7ef542", fontWeight: "bold", textTransform: "uppercase" }}>
                      Projeção Acumulada
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", borderTop: "1px solid #1f2937", paddingTop: "24px" }}>
              <p style={{ fontSize: "10px", color: "#4b5563" }}>Página 2 de 3 - Auditoria Financeira</p>
            </div>
          </div>

          {/* PÁGINA 3: SOLUÇÃO E CENÁRIOS */}
          <div
            style={{
              width: "794px",
              height: "1123px",
              backgroundColor: "#0a0f0d",
              color: "#ffffff",
              padding: "48px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "32px" }}>
                4. Potencial de Recuperação Imediata
              </h3>
              <p style={{ color: "#9ca3af", marginBottom: "32px" }}>
                Aplicando a tecnologia Recupera.ia, projetamos os seguintes cenários de injeção de caixa no seu negócio,
                baseados em nossa média histórica de performance.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
                {/* Cenário 10% */}
                <div
                  style={{
                    backgroundColor: "#111816",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", color: "#9ca3af" }}>Cenário Conservador (10% de Recuperação)</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff" }}>
                      +{formatResultCurrency(resultados.recuperacao10.mensal)}{" "}
                      <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mês</span>
                    </p>
                  </div>
                  <div style={{ height: "32px", width: "1px", backgroundColor: "#374151" }}></div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Anual (LTV)</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "#7ef542" }}>
                      {formatResultCurrency(resultados.recuperacao10.anual)}
                    </p>
                  </div>
                </div>

                {/* Cenário 20% */}
                <div
                  style={{
                    backgroundColor: "#111816",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid rgba(126, 245, 66, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "4px",
                      height: "100%",
                      backgroundColor: "#7ef542",
                    }}
                  ></div>
                  <div>
                    <p style={{ fontSize: "14px", color: "#ffffff", fontWeight: "bold" }}>
                      Cenário Meta (20% de Recuperação)
                    </p>
                    <p style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}>
                      +{formatResultCurrency(resultados.recuperacao20.mensal)}{" "}
                      <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mês</span>
                    </p>
                  </div>
                  <div style={{ height: "32px", width: "1px", backgroundColor: "#374151" }}></div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Anual (LTV)</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "#7ef542" }}>
                      {formatResultCurrency(resultados.recuperacao20.anual)}
                    </p>
                  </div>
                </div>

                {/* Cenário 34% */}
                <div
                  style={{
                    background: "linear-gradient(to right, #111816, #0f1814)",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #7ef542",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", color: "#7ef542", fontWeight: "bold" }}>
                      Cenário Alta Performance (34% de Recuperação)
                    </p>
                    <p style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}>
                      +{formatResultCurrency(resultados.recuperacao34.mensal)}{" "}
                      <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mês</span>
                    </p>
                  </div>
                  <div style={{ height: "32px", width: "1px", backgroundColor: "#374151" }}></div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Anual (LTV)</p>
                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "#7ef542" }}>
                      {formatResultCurrency(resultados.recuperacao34.anual)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#7ef542",
                  color: "#0a0f0d",
                  padding: "32px",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "24px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px" }}>
                  Próximo Passo: Implementação
                </h3>
                <p style={{ fontWeight: "500", marginBottom: "24px" }}>
                  Sua operação tem um lucro invisível de {formatResultCurrency(resultados.oportunidadePerdida)}{" "}
                  esperando para ser coletado.
                </p>
                <div
                  style={{
                    backgroundColor: "#0a0f0d",
                    color: "#ffffff",
                    padding: "16px 32px",
                    borderRadius: "8px",
                    display: "inline-block",
                    fontWeight: "bold",
                    fontSize: "18px",
                    border: "1px solid #7ef542",
                  }}
                >
                  GARANTIA DE RISCO ZERO EM CONTRATO
                </div>
                <p style={{ fontSize: "12px", marginTop: "16px", opacity: 0.8 }}>
                  Não cobramos setup inicial. O custo é baseado no sucesso da recuperação.
                </p>
              </div>
            </div>

            <div style={{ textAlign: "center", borderTop: "1px solid #1f2937", paddingTop: "24px" }}>
              <p style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff", marginBottom: "4px" }}>Recupera.ia</p>
              <p style={{ fontSize: "10px", color: "#4b5563" }}>
                Documento gerado automaticamente. Validade da análise: 7 dias.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

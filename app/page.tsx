"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react"

export default function Page() {
  const [faturamento, setFaturamento] = useState("")
  const [ticketMedio, setTicketMedio] = useState("")
  const [modoDetalhado, setModoDetalhado] = useState(false)
  const [vendasRealizadas, setVendasRealizadas] = useState("")
  const [carrinhosAbandonados, setCarrinhosAbandonados] = useState("")
  const [campoAutoCalculado, setCampoAutoCalculado] = useState<"faturamento" | "ticket" | "vendas" | null>(null)
  const [resultados, setResultados] = useState<{
    faturamento: number
    ticketMedio: number
    vendas: number
    oportunidadePerdida: number
    recuperacao10: { mensal: number; anual: number }
    recuperacao20: { mensal: number; anual: number }
    recuperacao34: { mensal: number; anual: number }
  } | null>(null)

  const resultadosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResultados(null)
  }, [modoDetalhado])

  const calcularCampoAutomatico = () => {
    if (!modoDetalhado) return

    const fat = parseCurrency(faturamento)
    const ticket = parseCurrency(ticketMedio)
    const vendas = Number(vendasRealizadas) || 0

    const hasFaturamento = faturamento && faturamento !== "" && fat > 0
    const hasTicket = ticketMedio && ticketMedio !== "" && ticket > 0
    const hasVendas = vendasRealizadas && vendasRealizadas !== "" && vendas > 0

    // Caso 1: Tem Faturamento e Ticket, calcula Vendas
    if (hasFaturamento && hasTicket && !hasVendas) {
      const calculatedVendas = Math.round(fat / ticket)
      setVendasRealizadas(String(calculatedVendas))
      setCampoAutoCalculado("vendas")
      return
    }

    // Caso 2: Tem Faturamento e Vendas, calcula Ticket
    if (hasFaturamento && hasVendas && !hasTicket) {
      const calculatedTicket = fat / vendas
      const formatted = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(calculatedTicket)
      setTicketMedio(formatted)
      setCampoAutoCalculado("ticket")
      return
    }

    // Caso 3: Tem Vendas e Ticket, calcula Faturamento
    if (hasVendas && hasTicket && !hasFaturamento) {
      const calculatedFat = vendas * ticket
      const formatted = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(calculatedFat)
      setFaturamento(formatted)
      setCampoAutoCalculado("faturamento")
      return
    }
  }

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

  const handleFaturamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setFaturamento(formatted)

    if (modoDetalhado) {
      const hasTicket = ticketMedio && ticketMedio !== ""
      const hasVendas = vendasRealizadas && vendasRealizadas !== ""

      if (hasTicket && hasVendas) {
        setTicketMedio("")
        setVendasRealizadas("")
        setCampoAutoCalculado(null)
      }
    }
  }

  const handleTicketMedioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setTicketMedio(formatted)

    if (modoDetalhado) {
      const hasFaturamento = faturamento && faturamento !== ""
      const hasVendas = vendasRealizadas && vendasRealizadas !== ""

      if (hasFaturamento && hasVendas) {
        setFaturamento("")
        setVendasRealizadas("")
        setCampoAutoCalculado(null)
      }
    }
  }

  const handleVendasRealizadasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setVendasRealizadas(value)

    if (modoDetalhado) {
      const hasFaturamento = faturamento && faturamento !== ""
      const hasTicket = ticketMedio && ticketMedio !== ""

      if (hasFaturamento && hasTicket) {
        setFaturamento("")
        setTicketMedio("")
        setCampoAutoCalculado(null)
      }
    }
  }

  const handleCarrinhosAbandonadosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setCarrinhosAbandonados(value)
  }

  const calcular = () => {
    const fat = parseCurrency(faturamento)
    const ticket = parseCurrency(ticketMedio)

    if (fat <= 0 || ticket <= 0) {
      alert("Por favor, preencha os valores corretamente.")
      return
    }

    let vendas: number
    let carrinhosAband: number

    if (modoDetalhado) {
      const vendasInput = Number(vendasRealizadas)
      const carrinhosInput = Number(carrinhosAbandonados)

      if (vendasInput <= 0 || carrinhosInput <= 0) {
        alert("Por favor, preencha todos os campos corretamente.")
        return
      }

      vendas = vendasInput
      carrinhosAband = carrinhosInput
    } else {
      vendas = Math.round(fat / ticket)
      carrinhosAband = vendas * 3
    }

    const oportunidadePerdida = carrinhosAband * ticket

    const recuperacao10Mensal = oportunidadePerdida * 0.1
    const recuperacao20Mensal = oportunidadePerdida * 0.2
    const recuperacao34Mensal = oportunidadePerdida * 0.34

    setResultados({
      faturamento: fat,
      ticketMedio: ticket,
      vendas: vendas,
      oportunidadePerdida,
      recuperacao10: {
        mensal: recuperacao10Mensal,
        anual: recuperacao10Mensal * 12,
      },
      recuperacao20: {
        mensal: recuperacao20Mensal,
        anual: recuperacao20Mensal * 12,
      },
      recuperacao34: {
        mensal: recuperacao34Mensal,
        anual: recuperacao34Mensal * 12,
      },
    })

    setTimeout(() => {
      resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      calcular()
    }
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

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Cabeçalho */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-16 md:h-24 flex items-center">
              <img src="/logo-recupera-transparent.png" alt="Recupera.ia Logo" className="h-full w-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 uppercase">Seja bem Vindo a Calculadora do Lucro Perdido</h1>
          <p className="text-[#7ef542] text-lg text-[16px]">
            Descubra a fortuna que você está gerando e deixando nas mãos dos seus concorrentes.
          </p>
        </header>

        {/* Seção de Entradas */}
        <div className="bg-[#111816] rounded-2xl p-8 mb-8 border border-[#1a2520]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Dados do seu negócio</h2>
              <p className="text-gray-400 text-sm">Preencha as informações abaixo para calcular</p>
            </div>

            <div className="flex items-center gap-2 bg-[#0a0f0d] rounded-lg p-1 border border-[#1a2520]">
              <button
                onClick={() => setModoDetalhado(false)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                  !modoDetalhado ? "bg-[#7ef542] text-[#0a0f0d]" : "text-gray-400 hover:text-white"
                }`}
              >
                Simplificado
              </button>
              <button
                onClick={() => setModoDetalhado(true)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                  modoDetalhado ? "bg-[#7ef542] text-[#0a0f0d]" : "text-gray-400 hover:text-white"
                }`}
              >
                Detalhado
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-[#7ef542] text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                Faturamento mensal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={faturamento}
                  onChange={handleFaturamentoChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      if (modoDetalhado) {
                        calcularCampoAutomatico()
                      } else {
                        calcular()
                      }
                    }
                  }}
                  onBlur={calcularCampoAutomatico}
                  placeholder="50.000,00"
                  className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[#7ef542] text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Ticket médio do produto
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={ticketMedio}
                  onChange={handleTicketMedioChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      if (modoDetalhado) {
                        calcularCampoAutomatico()
                      } else {
                        calcular()
                      }
                    }
                  }}
                  onBlur={calcularCampoAutomatico}
                  placeholder="297,00"
                  className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 pl-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors"
                />
              </div>
            </div>

            {modoDetalhado && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-[#7ef542] text-sm mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Número de vendas realizadas no mês
                  </label>
                  <input
                    type="text"
                    value={vendasRealizadas}
                    onChange={handleVendasRealizadasChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        calcularCampoAutomatico()
                      }
                    }}
                    onBlur={calcularCampoAutomatico}
                    placeholder="168"
                    className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[#7ef542] text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Carrinhos/checkouts abandonados no mês
                  </label>
                  <input
                    type="text"
                    value={carrinhosAbandonados}
                    onChange={handleCarrinhosAbandonadosChange}
                    onKeyPress={handleKeyPress}
                    placeholder="504"
                    className="w-full bg-[#0a0f0d] border border-[#1a2520] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7ef542] transition-colors"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={calcular}
            className="w-full bg-[#7ef542] hover:bg-[#6ee032] text-[#0a0f0d] font-bold py-4 rounded-lg transition-colors uppercase"
          >
            Calcular meu lucro perdido
          </button>

          {!modoDetalhado && (
            <div className="mt-6 bg-[#111816] rounded-2xl p-8 border border-yellow-600/30">
              <div className="flex items-start gap-3 mb-4">
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
                      <span className="text-white font-semibold">5 a 7 tentativas falhas</span> (somando abandonos,
                      boletos e recusas) para cada transação aprovada.
                    </li>
                    <li>
                      Para esta calculadora, adotamos um critério conservador de apenas{" "}
                      <span className="text-[#7ef542] font-semibold">3 abandonos para cada 1 venda</span>, garantindo
                      uma projeção de segurança e credibilidade para o seu negócio.
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-2">2. Detalhamento dos Gargalos Técnicos</h5>
                  <p className="text-gray-400 text-xs mb-2">
                    Mesmo em um cenário conservador, o faturamento é drenado por quatro fatores principais:
                  </p>
                  <ul className="space-y-2 list-none text-gray-400 text-xs">
                    <li>
                      <span className="text-white font-semibold">A. Recusa de Cartão de Crédito:</span> Cerca de 15% das
                      vendas com intenção clara de compra são perdidas por falhas de infraestrutura financeira ou
                      bloqueios de antifraude.
                    </li>
                    <li>
                      <span className="text-white font-semibold">B. Abandono de Checkout:</span> A taxa de abandono de
                      carrinhos no Brasil chega a 82%, o que significa que a grande maioria dos interessados não conclui
                      a jornada de compra.
                    </li>
                    <li>
                      <span className="text-white font-semibold">C. PIX não Convertido:</span> A taxa de abandono
                      pós-geração do código PIX pode atingir 50% em campanhas de tráfego frio.
                    </li>
                    <li>
                      <span className="text-white font-semibold">D. Inércia do Boleto:</span> O índice de desistência
                      após a emissão de boletos varia entre 55% e 70%, com uma taxa de conversão real de apenas 30% a
                      45%.
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-2">3. Observação Estratégica</h5>
                  <p className="text-gray-400 text-xs">
                    Caso os números de oportunidade apresentados neste modo simplificado sejam superiores aos da sua
                    operação atual, isso é um{" "}
                    <span className="text-yellow-500 font-semibold">
                      indicativo de que seu funil possui gargalos críticos de conversão
                    </span>
                    .
                  </p>
                  <p className="text-[#7ef542] text-xs mt-2">
                    A Recupera.ia possui o ecossistema tecnológico e as ferramentas de intervenção ativa necessárias
                    para estancar esse vazamento e elevar sua performance aos patamares de excelência do mercado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {modoDetalhado && (
            <div className="mt-6 bg-[#111816] rounded-2xl p-8 border border-yellow-600/30">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <h4 className="text-lg font-bold text-yellow-500">
                  Atenção: Diagnóstico Baseado em Dados Reais da Operação
                </h4>
              </div>

              <div className="space-y-6 text-sm text-gray-300">
                <p className="text-gray-400 text-xs">
                  Diferente das estimativas de mercado, os cálculos no modo detalhado são processados com base exclusiva
                  nas métricas reais fornecidas por você, eliminando qualquer projeção estatística genérica. Este nível
                  de análise permite identificar com precisão matemática onde o seu faturamento está retido, utilizando
                  seus números de abandono, taxas de conversão de Pix e boletos, além do índice real de recusas de
                  cartão de crédito da sua plataforma atual.
                </p>

                <div>
                  <h5 className="text-white font-semibold mb-2">1. Validação de Performance Real</h5>
                  <p className="text-gray-400 text-xs">
                    Os resultados apresentados refletem o cenário exato da sua operação hoje, permitindo confrontar seus
                    dados com os padrões de "alta performance" do mercado, que registram entre{" "}
                    <span className="text-white font-semibold">5 a 7 tentativas de compra</span> para cada venda
                    concluída.
                  </p>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-2">2. Identificação de Gargalos de Precisão</h5>
                  <p className="text-gray-400 text-xs">
                    Ao inserir suas métricas de recusa de cartão (média de 15% no mercado) e não pagamento de Pix ou
                    boletos (que podem atingir 70% de perda), você obtém o valor real do seu{" "}
                    <span className="text-[#7ef542] font-semibold">"lucro invisível"</span>.
                  </p>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-2">3. Observação Estratégica</h5>
                  <p className="text-gray-400 text-xs">
                    Como os dados inseridos são de sua responsabilidade, o montante de oportunidades perdidas revelado é
                    um{" "}
                    <span className="text-orange-500 font-semibold">
                      diagnóstico fiel da saúde financeira do seu checkout.
                    </span>
                  </p>
                  <p className="text-[#7ef542] text-xs mt-2">
                    Caso sua taxa de perda seja superior aos benchmarks de mercado, a Recupera.ia possui a
                    infraestrutura técnica necessária para intervir nesses dados reais e converter esse vazamento em
                    receita imediata.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Resultados */}
        {resultados && (
          <>
            <div ref={resultadosRef} className="bg-[#111816] rounded-2xl p-8 mb-8 border border-[#1a2520]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-[#7ef542] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm text-gray-400 uppercase tracking-wide">Oportunidade Perdida</h3>
                    <p className="text-xs text-gray-500 mt-1">Dinheiro que você está deixando em cima da mesa</p>
                  </div>
                </div>

                <div className="md:text-right md:max-w-md">
                  <p className="text-base text-white leading-relaxed">
                    Com{" "}
                    <span className="font-semibold text-[#7ef542]">{formatResultCurrency(resultados.faturamento)}</span>{" "}
                    de faturamento mensal e Ticket Médio do produto em{" "}
                    <span className="font-semibold text-[#7ef542]">{formatResultCurrency(resultados.ticketMedio)}</span>{" "}
                    temos o seguinte cenário:
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Passo 1: Vendas */}
                <div className="relative">
                  <div className="bg-[#0a0f0d] rounded-xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vendas Realizadas no Mês</p>
                        <p className="text-3xl font-bold text-[#7ef542]">{formatNumber(resultados.vendas)}</p>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>
                  <div className="flex justify-center my-3">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#7ef542] to-[#7ef542]/50"></div>
                      <div className="text-[#7ef542] text-2xl">↓</div>
                      <p className="text-xs text-gray-400 mt-1">× 3 oportunidades por venda</p>
                    </div>
                  </div>
                </div>

                {/* Passo 2: Oportunidades */}
                <div className="relative">
                  <div className="bg-[#0a0f0d] rounded-xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Oportunidades Perdidas</p>
                        <p className="text-3xl font-bold text-[#7ef542] mb-3">{formatNumber(resultados.vendas * 3)}</p>
                        <p className="text-xs text-gray-400">
                          Operações eficientes registram entre 5 a 7 tentativas falhas para cada transação aprovada,
                          adotamos uma premissa conservadora de apenas 3 oportunidades por venda para garantir a total
                          credibilidade deste diagnóstico.
                        </p>
                      </div>
                      <div className="text-4xl ml-4">⚠️</div>
                    </div>
                  </div>
                  <div className="flex justify-center my-3">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#7ef542] to-[#7ef542]/50"></div>
                      <div className="text-[#7ef542] text-2xl">↓</div>
                      <p className="text-xs text-gray-400 mt-1">
                        × Ticket Médio de {formatResultCurrency(resultados.ticketMedio)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passo 3: Valor Mensal */}
                <div className="relative">
                  <div className="bg-[#0a0f0d] rounded-xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Oportunidade Perdida Mensal
                        </p>
                        <p className="text-3xl font-bold text-[#7ef542] mb-2">
                          {formatResultCurrency(resultados.oportunidadePerdida)}
                        </p>
                        <p className="text-xs text-gray-400">Valor em vendas não aproveitadas todos os meses</p>
                      </div>
                      <div className="text-4xl">📊</div>
                    </div>
                  </div>
                  <div className="flex justify-center my-3">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#7ef542] to-[#7ef542]/50"></div>
                      <div className="text-[#7ef542] text-2xl">↓</div>
                      <p className="text-xs text-gray-400 mt-1">× 12 meses</p>
                    </div>
                  </div>
                </div>

                {/* Passo 4: Valor Anual */}
                <div className="relative">
                  <div className="bg-[#0a0f0d] rounded-xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Oportunidade Perdida Anual</p>
                        <p className="text-3xl font-bold text-[#7ef542] mb-2">
                          {formatResultCurrency(resultados.oportunidadePerdida * 12)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Ecossistema completo de vendas não aproveitadas em 12 meses
                        </p>
                      </div>
                      <div className="text-4xl">📈</div>
                    </div>
                  </div>
                  <div className="flex justify-center my-3">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#7ef542] to-[#7ef542]/50"></div>
                      <div className="text-[#7ef542] text-2xl">↓</div>
                      <p className="text-xs text-gray-400 mt-1">comparado ao faturamento atual</p>
                    </div>
                  </div>
                </div>

                {/* Passo 5: Multiplicador */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#7ef542]/20 to-[#7ef542]/5 rounded-xl p-6 border-2 border-[#7ef542] hover:border-[#7ef542] transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#7ef542] uppercase tracking-wide mb-1 font-semibold">
                          O Diagnóstico Final
                        </p>
                        <p className="text-5xl font-bold text-[#7ef542] mb-2">
                          {(resultados.oportunidadePerdida / resultados.faturamento).toFixed(0)}x
                        </p>
                        <p className="text-sm text-white">
                          Na prática, você está deixando na mesa um valor{" "}
                          <span className="font-semibold text-[#7ef542]">
                            {(resultados.oportunidadePerdida / resultados.faturamento).toFixed(0)}x maior
                          </span>{" "}
                          do que o seu faturamento atual de {formatResultCurrency(resultados.faturamento)}
                        </p>
                      </div>
                      <div className="text-5xl">🚨</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-lg text-[#7ef542] leading-relaxed">
                  Até quando você vai pagar caro na captação de leads apenas para vê-los gerando lucro no bolso dos seus
                  concorrentes?
                </p>
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
                  <p className="text-xs text-[rgb(255,255,255)] uppercase tracking-wide mb-1 text-[20px] font-bold">
                    COM 10% DE CONVERSÃO
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Possibilidade de Ganho Mensal</p>
                    <p className="text-2xl font-bold text-[#7ef542]">
                      +{formatResultCurrency(resultados.recuperacao10.mensal)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1a2520]">
                    <p className="text-xs text-gray-500 mb-1">Possibilidade de Ganho Anual</p>
                    <p className="text-xl font-semibold text-white">
                      +{formatResultCurrency(resultados.recuperacao10.anual)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 20% */}
              <div className="bg-[#111816] rounded-2xl p-6 border-2 border-[#7ef542]/30 hover:border-[#7ef542]/50 transition-colors relative">
                <div className="mb-4">
                  <p className="text-xs text-[rgb(255,255,255)] uppercase tracking-wide mb-1 text-[20px] font-bold">
                    COM 20% DE CONVERSÃO
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Possibilidade de Ganho Mensal</p>
                    <p className="text-2xl font-bold text-[#7ef542]">
                      +{formatResultCurrency(resultados.recuperacao20.mensal)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1a2520]">
                    <p className="text-xs text-gray-500 mb-1">Possibilidade de Ganho Anual</p>
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
                    COM 34% DE CONVERSÃO
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Possibilidade de Ganho Mensal</p>
                    <p className="text-2xl font-bold text-[#7ef542]">
                      +{formatResultCurrency(resultados.recuperacao34.mensal)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2a3530]">
                    <p className="text-xs text-gray-500 mb-1">Possibilidade de Ganho Anual</p>
                    <p className="text-xl font-semibold text-[#7ef542]">
                      +{formatResultCurrency(resultados.recuperacao34.anual)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-8">
              No exemplo acima temos as Taxas de Conversão que atingimos no decorrer dos testes de validação da
              Recupera.ia
            </p>

            {/* Seção Unificada: Frases de Impacto (Mensal e Anual) */}
            <div className="mt-16 bg-[#111816] rounded-2xl p-8 md:p-10 border border-[#1a2520]">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Frase 1: Mensal */}
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight text-center">
                    Faria diferença pra você hoje ter mais{" "}
                    <span className="text-[#7ef542]">{formatResultCurrency(resultados.recuperacao10.mensal)}</span> no
                    seu bolso todo mês?
                  </h3>
                </div>

                {/* Frase 2: Anual */}
                <div className="md:border-l md:border-[#1a2520] md:pl-10">
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight text-center">
                    E acumular{" "}
                    <span className="text-[#7ef542]">{formatResultCurrency(resultados.recuperacao10.anual)}</span> para
                    a realização daquele sonho adiado tantas vezes seria espetacular, não seria?
                  </h3>
                </div>
              </div>
            </div>

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
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all hover:shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
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
                      <div>
                        <p className="text-sm font-semibold text-[#0a0f0d] mb-1">C. O Custo do Desconhecido:</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Batalhar por quem não te conhece exige um convencimento muito maior do que recuperar alguém
                          que já percorreu 90% do seu funil e parou no checkout.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all hover:shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
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

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#7ef542] transition-all hover:shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold">
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

                  {/* Card 4 Alterado: Fundo Escuro e Texto Branco */}
                  <div className="bg-[#111816] rounded-xl p-6 border-2 border-[#7ef542] hover:border-[#6ee032] transition-all hover:shadow-[0_0_20px_rgba(126,245,66,0.2)]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#7ef542] rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#0a0f0d]">
                        4
                      </div>
                      <div className="flex flex-col">
                        {/* Nota: Se a logo "Wordmark Fundo Claro" for escura, considere usar a versão transparente ou branca aqui */}
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
                  {/* ========================================================================= */}
                </div>

                <div className="text-center pt-6 border-t-2 border-gray-200">
                  <p className="text-xl font-bold text-[#0a0f0d] mb-4">
                    Você está pronto para parar de desperdiçar dinheiro e começar a recuperar o que já é seu?
                  </p>
                </div>
              </div>
            </div>

            {/* Seção de Números/Casos de Sucesso */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Veja alguns números</h3>
                <p className="text-gray-400">Resultados reais de quem ja confia na Recupera.ia</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1 - Comunidade Online */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">Comunidade Online</h4>
                    <p className="text-sm text-gray-400">(Área de Membros)</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O Cenário:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      R$ 116.955,00 em assinaturas não concluídas. Todos os meses.
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O Resultado:</p>
                    <p className="text-sm text-gray-300 mb-3">
                      Em apenas um mês, a Recupera.ia colocou{" "}
                      <span className="text-[#7ef542] font-semibold">R$ 35.866,20</span> de volta no caixa do cliente,
                      recuperando <span className="text-white font-semibold">138 leads</span> que já eram considerados
                      perdidos.
                    </p>
                    <div className="bg-[#7ef542]/10 border border-[#7ef542]/30 rounded-lg p-3">
                      <p className="text-[#7ef542] font-bold text-center">Taxa de Conversão de 30,66%</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-400 italic border-l-2 border-[#7ef542]/30 pl-3 mt-4">
                    "É um dinheiro que simplesmente não existia para nós. A Recupera.ia não só pagou o investimento no
                    primeiro dia, como criou uma nova fonte de receita que não nos custa nenhum esforço para gerir."
                  </blockquote>
                </div>

                {/* Card 2 - E-commerce */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">E-commerce</h4>
                    <p className="text-sm text-gray-400">Livros Físicos</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O Cenário:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      R$ 32.040,00 em potencial de vendas evaporando a cada 30 dias.
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O Resultado:</p>
                    <p className="text-sm text-gray-300 mb-3">
                      Nossa IA Conversacional recuperou <span className="text-white font-semibold">107 clientes</span>,
                      gerando <span className="text-[#7ef542] font-semibold">R$ 19.260,00</span> em faturamento extra e
                      atingindo uma taxa de conversão que nenhuma outra ferramenta chegou perto.
                    </p>
                    <div className="bg-[#7ef542]/10 border border-[#7ef542]/30 rounded-lg p-3">
                      <p className="text-[#7ef542] font-bold text-center">Taxa de Conversão de 60,11%</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-400 italic border-l-2 border-[#7ef542]/30 pl-3 mt-4">
                    "Ver 6 em cada 10 pessoas que abandonaram o carrinho voltando para comprar foi inacreditável. A
                    Recupera.ia não é uma ferramenta de recuperação, é uma máquina de conversão."
                  </blockquote>
                </div>

                {/* Card 3 - Plataforma de Apostas */}
                <div className="bg-[#111816] rounded-2xl p-6 border border-[#1a2520] hover:border-[#7ef542]/30 transition-all">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-1">Plataforma de Alto</h4>
                    <p className="text-sm text-gray-400">Volume (Apostas)</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O Cenário:</p>
                    <p className="text-sm text-gray-300 text-[13px]">
                      Um vazamento massivo de mais de R$ 715.000,00 por mês em depósitos não realizados.
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">O Resultado:</p>
                    <p className="text-sm text-gray-300 mb-3">
                      Mesmo com um ticket baixo, nosso fluxo recuperou{" "}
                      <span className="text-white font-semibold">13.745 usuários</span>, injetando{" "}
                      <span className="text-[#7ef542] font-semibold">R$ 68.725,00</span> de receita adicional que antes
                      era completamente perdida.
                    </p>
                    <div className="bg-[#7ef542]/10 border border-[#7ef542]/30 rounded-lg p-3">
                      <p className="text-[#7ef542] font-bold text-center">+13 mil recuperados em 30 dias</p>
                    </div>
                  </div>

                  <blockquote className="text-xs text-gray-400 italic border-l-2 border-[#7ef542]/30 pl-3 mt-4">
                    "No nosso volume, cada ponto percentual importa. A Recupera.ia nos entregou quase 10% de conversão
                    sobre um público que já tínhamos desistido. É lucro puro, na escala que precisamos."
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-[#111816] rounded-2xl p-8 border border-[#1a2520]">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-3xl font-bold leading-tight">
                  E se eu dissesse que você também pode ter esse resultado?
                  <br />E o melhor: <span className="text-[#7ef542]">de graça!</span>
                </h3>
              </div>

              <div className="mt-8">
                <a
                  href="https://wa.me/5519983233544?text=Quero%20recuperar%20meu%20lucro%20perdido"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#7ef542] hover:bg-[#6ee032] text-[#0a0f0d] font-bold py-6 px-8 rounded-lg transition-colors text-center block no-underline"
                >
                  <span className="uppercase md:text-base leading-tight block text-[24px]">
                    Quero {formatResultCurrency(resultados.recuperacao10.mensal)} a mais no meu bolso todos os meses
                  </span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

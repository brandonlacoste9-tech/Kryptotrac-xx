export interface PortfolioMetrics {
  sharpeRatio: number
  volatility: number
  maxDrawdown: number
  diversificationScore: number
  riskScore: number
}

export interface BenchmarkComparison {
  portfolioReturn: number
  btcReturn: number
  ethReturn: number
  outperformanceBtc: number
  outperformanceEth: number
}

export function calculateSharpeRatio(returns: number[], riskFreeRate = 0.02): number {
  if (returns.length < 2) return 0

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 0
  return (avgReturn - riskFreeRate / 365) / stdDev
}

export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const dailyVolatility = Math.sqrt(variance)

  // Annualized volatility
  return dailyVolatility * Math.sqrt(365) * 100
}

export function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0

  let maxDrawdown = 0
  let peak = values[0]

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i]
    }
    const drawdown = ((peak - values[i]) / peak) * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return maxDrawdown
}

export function calculateDiversificationScore(holdings: { current_value: number }[]): number {
  if (holdings.length === 0) return 0
  if (holdings.length === 1) return 20

  const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0)
  const weights = holdings.map((h) => h.current_value / totalValue)

  // Herfindahl-Hirschman Index
  const hhi = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0)

  // Convert to 0-100 score (lower HHI = better diversification)
  const score = (1 - hhi) * 100

  // Bonus for holding more assets
  const assetBonus = Math.min(holdings.length * 5, 30)

  return Math.min(score + assetBonus, 100)
}

export function calculateRiskScore(volatility: number, maxDrawdown: number): number {
  // Combine volatility and drawdown into risk score (0-100, higher = riskier)
  const volScore = Math.min((volatility / 100) * 100, 100)
  const ddScore = Math.min(maxDrawdown, 100)

  return volScore * 0.6 + ddScore * 0.4
}

export function generateDailyReturns(
  holdings: { quantity: number; purchase_price: number; current_price: number }[],
): number[] {
  // Simulate daily returns based on current position
  // In production, this would use historical price data
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.purchase_price, 0)
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.current_price, 0)
  const totalReturn = (totalValue - totalCost) / totalCost

  // Generate 30 days of simulated returns with some randomness
  const returns: number[] = []
  const dailyReturn = totalReturn / 30

  for (let i = 0; i < 30; i++) {
    const randomFactor = (Math.random() - 0.5) * 0.02 // +/- 1% randomness
    returns.push(dailyReturn + randomFactor)
  }

  return returns
}

export async function getHistoricalReturns(userId: string, days = 30) {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: snapshots, error } = await supabase
    .from("portfolio_snapshots")
    .select("total_value, snapshot_date")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: true })
    .limit(days)

  if (error || !snapshots || snapshots.length < 2) {
    return []
  }

  // Calculate daily returns
  const returns: number[] = []
  for (let i = 1; i < snapshots.length; i++) {
    const prevValue = snapshots[i - 1].total_value
    const currentValue = snapshots[i].total_value
    const dailyReturn = (currentValue - prevValue) / prevValue
    returns.push(dailyReturn)
  }

  return returns
}

export async function getHistoricalValues(userId: string, days = 90) {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: snapshots, error } = await supabase
    .from("portfolio_snapshots")
    .select("total_value, snapshot_date")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: true })
    .limit(days)

  if (error || !snapshots) {
    return []
  }

  return snapshots.map((s) => ({
    date: s.snapshot_date,
    value: Number(s.total_value),
  }))
}

export async function calculateRealMetrics(userId: string): Promise<PortfolioMetrics | null> {
  const returns = await getHistoricalReturns(userId, 30)
  const values = (await getHistoricalValues(userId, 90)).map((v) => v.value)

  if (returns.length < 2 || values.length < 2) {
    return null
  }

  const sharpeRatio = calculateSharpeRatio(returns)
  const volatility = calculateVolatility(returns)
  const maxDrawdown = calculateMaxDrawdown(values)

  // Get current holdings for diversification
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: holdings } = await supabase
    .from("user_portfolios")
    .select("*, current_value:quantity")
    .eq("user_id", userId)
    .gt("quantity", 0)

  const diversificationScore = holdings ? calculateDiversificationScore(holdings as any) : 0
  const riskScore = calculateRiskScore(volatility, maxDrawdown)

  return {
    sharpeRatio,
    volatility,
    maxDrawdown,
    diversificationScore,
    riskScore,
  }
}

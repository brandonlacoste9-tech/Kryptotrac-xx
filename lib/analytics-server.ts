import { createClient } from "@/lib/supabase/server"

export async function getHistoricalReturns(userId: string, days = 30) {
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

export async function calculateRealMetrics(userId: string) {
  const { calculateSharpeRatio, calculateVolatility, calculateMaxDrawdown, calculateDiversificationScore, calculateRiskScore } = await import("@/lib/analytics")
  
  const returns = await getHistoricalReturns(userId, 30)
  const values = (await getHistoricalValues(userId, 90)).map((v) => v.value)

  if (returns.length < 2 || values.length < 2) {
    return null
  }

  const sharpeRatio = calculateSharpeRatio(returns)
  const volatility = calculateVolatility(returns)
  const maxDrawdown = calculateMaxDrawdown(values)

  // Get current holdings for diversification
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

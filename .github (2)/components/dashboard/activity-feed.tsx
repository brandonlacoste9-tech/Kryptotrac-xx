import { createServerClient } from "@/lib/supabase/server"
import { Bell, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"

interface ActivityFeedProps {
  userId: string
}

export async function ActivityFeed({ userId }: ActivityFeedProps) {
  const supabase = await createServerClient()

  const { data: alerts } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('triggered', true)
    .order('triggered_at', { ascending: false })
    .limit(5)

  const { data: insights } = await supabase
    .from('insights_history')
    .select('generated_at, summary')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(3)

  const { data: snapshots } = await supabase
    .from('portfolio_snapshots')
    .select('snapshot_date, total_value')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(10)

  const milestones: any[] = []
  if (snapshots && snapshots.length > 1) {
    const thresholds = [1000, 5000, 10000, 25000, 50000, 100000]
    for (let i = 0; i < snapshots.length - 1; i++) {
      const current = snapshots[i].total_value
      const previous = snapshots[i + 1].total_value
      
      for (const threshold of thresholds) {
        if (previous < threshold && current >= threshold) {
          milestones.push({
            type: 'milestone' as const,
            icon: TrendingUp,
            title: `Portfolio Milestone!`,
            description: `Your portfolio crossed $${threshold.toLocaleString()}`,
            time: snapshots[i].snapshot_date,
            color: 'text-green-500'
          })
        }
      }
    }
  }

  const activities = [
    ...(alerts || []).map(alert => ({
      type: 'alert' as const,
      icon: Bell,
      title: `${alert.coin_id.toUpperCase()} Alert Triggered`,
      description: `Price ${alert.condition} $${alert.target_price}`,
      time: alert.triggered_at,
      color: 'text-yellow-500'
    })),
    ...(insights || []).map(insight => ({
      type: 'insight' as const,
      icon: Sparkles,
      title: 'New AI Insight',
      description: insight.summary.substring(0, 60) + '...',
      time: insight.generated_at,
      color: 'text-purple-500'
    })),
    ...milestones
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Alerts, insights, and milestones will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className={`mt-1 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

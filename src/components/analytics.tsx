'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import {
  Eye,
  Heart,
  ThumbsUp,
  Send,
  TrendingUp,
  TrendingDown,
  Download,
  Instagram,
  Facebook,
} from 'lucide-react'
import { useAppStore, type AnalyticsData } from '@/lib/store'
import { DEMO_ANALYTICS } from '@/lib/demo-data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type DateRange = 7 | 14 | 30

const ROSE_GOLD = '#B76E79'
const SILVER = '#A8A9AD'
const CHAMPAGNE = '#D4A574'
const INSTAGRAM_GRADIENT = 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)'
const FACEBOOK_COLOR = '#1877F2'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const formatNumber = (n: number) => n.toLocaleString()

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { analytics, setAnalytics, scheduledPosts } = useAppStore()
  const [dateRange, setDateRange] = useState<DateRange>(14)

  useEffect(() => {
    if (analytics.length === 0) {
      setAnalytics(DEMO_ANALYTICS)
    }
  }, [analytics.length, setAnalytics])

  const filteredData = useMemo(() => {
    const sorted = [...analytics].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    return sorted.slice(-dateRange)
  }, [analytics, dateRange])

  // Key Metrics
  const totalReach = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.reach, 0),
    [filteredData]
  )
  const totalLikes = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.likes, 0),
    [filteredData]
  )
  const totalComments = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.comments, 0),
    [filteredData]
  )
  const totalShares = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.shares, 0),
    [filteredData]
  )
  const engagementRate =
    totalReach > 0
      ? ((totalLikes + totalComments + totalShares) / totalReach) * 100
      : 0

  const publishedPosts = useMemo(
    () =>
      scheduledPosts.filter(
        (p) => p.status === 'published'
      ).length,
    [scheduledPosts]
  )

  // Trend calculation (compare second half vs first half)
  const trendPercent = useMemo(() => {
    if (filteredData.length < 2) return 0
    const mid = Math.floor(filteredData.length / 2)
    const firstHalf = filteredData.slice(0, mid)
    const secondHalf = filteredData.slice(mid)
    const firstReach = firstHalf.reduce((s, d) => s + d.reach, 0)
    const secondReach = secondHalf.reduce((s, d) => s + d.reach, 0)
    if (firstReach === 0) return 0
    return ((secondReach - firstReach) / firstReach) * 100
  }, [filteredData])

  // Chart data - aggregate by date
  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; likes: number; comments: number; shares: number }> = {}
    for (const d of filteredData) {
      const key = d.date
      if (!grouped[key]) {
        grouped[key] = { date: key, likes: 0, comments: 0, shares: 0 }
      }
      grouped[key].likes += d.likes
      grouped[key].comments += d.comments
      grouped[key].shares += d.shares
    }
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [filteredData])

  // Platform breakdown
  const instagramData = useMemo(() => {
    const data = filteredData.filter((d) => d.platform === 'instagram')
    return {
      likes: data.reduce((s, d) => s + d.likes, 0),
      comments: data.reduce((s, d) => s + d.comments, 0),
      shares: data.reduce((s, d) => s + d.shares, 0),
      reach: data.reduce((s, d) => s + d.reach, 0),
    }
  }, [filteredData])

  const facebookData = useMemo(() => {
    const data = filteredData.filter((d) => d.platform === 'facebook')
    return {
      likes: data.reduce((s, d) => s + d.likes, 0),
      comments: data.reduce((s, d) => s + d.comments, 0),
      shares: data.reduce((s, d) => s + d.shares, 0),
      reach: data.reduce((s, d) => s + d.reach, 0),
    }
  }, [filteredData])

  const platformBarData = useMemo(
    () => [
      { metric: 'Likes', Instagram: instagramData.likes, Facebook: facebookData.likes },
      { metric: 'Comments', Instagram: instagramData.comments, Facebook: facebookData.comments },
      { metric: 'Shares', Instagram: instagramData.shares, Facebook: facebookData.shares },
      { metric: 'Reach', Instagram: instagramData.reach, Facebook: facebookData.reach },
    ],
    [instagramData, facebookData]
  )

  // Top performing posts by engagement (from analytics)
  const topPosts = useMemo(() => {
    return [...filteredData]
      .map((d) => ({
        ...d,
        engagement: d.likes + d.comments + d.shares,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5)
      .map((d, i) => ({
        rank: i + 1,
        caption:
          d.platform === 'instagram'
            ? `Publicación de joyería de plata — ${d.date}`
            : `Escaparate de joyería — ${d.date}`,
        platform: d.platform,
        likes: d.likes,
        comments: d.comments,
        reach: d.reach,
        engagement: d.engagement,
      }))
  }, [filteredData])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }

  const metricCards = [
    {
      icon: Eye,
      value: formatNumber(totalReach),
      label: 'Alcance Total',
      trend: trendPercent,
      bgClass: 'bg-rose-100 dark:bg-rose-950/40',
      iconColor: ROSE_GOLD,
    },
    {
      icon: Heart,
      value: `${engagementRate.toFixed(1)}%`,
      label: 'Tasa de Interacción',
      trend: trendPercent * 0.6,
      bgClass: 'bg-pink-100 dark:bg-pink-950/40',
      iconColor: ROSE_GOLD,
    },
    {
      icon: ThumbsUp,
      value: formatNumber(totalLikes),
      label: 'Total de Me Gusta',
      trend: trendPercent * 0.8,
      bgClass: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: CHAMPAGNE,
    },
    {
      icon: Send,
      value: formatNumber(publishedPosts),
      label: 'Publicaciones Realizadas',
      trend: 0,
      bgClass: 'bg-stone-100 dark:bg-stone-900/40',
      iconColor: SILVER,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            <span style={{ color: ROSE_GOLD }}>Analíticas</span>
          </h2>
          <p className="mt-1 text-muted-foreground">
            Monitorea el rendimiento de tus redes sociales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-muted p-1">
            {([7, 14, 30] as DateRange[]).map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  dateRange === days
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Últimos {days} Días
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 pt-0">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full ${card.bgClass}`}
                >
                  <card.icon
                    className="size-5"
                    style={{ color: card.iconColor }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  {card.trend !== 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      {card.trend > 0 ? (
                        <TrendingUp className="size-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="size-3.5 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          card.trend > 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {card.trend > 0 ? '+' : ''}
                        {card.trend.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              {/* Decorative accent */}
              <div
                className="absolute right-0 top-0 h-1 w-12 rounded-bl-full"
                style={{ backgroundColor: card.iconColor, opacity: 0.6 }}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Engagement Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interacción en el Tiempo</CardTitle>
            <CardDescription>
              Me gusta, comentarios y compartidos en todas las plataformas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="gradientLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ROSE_GOLD} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={ROSE_GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SILVER} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={SILVER} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientShares" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHAMPAGNE} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHAMPAGNE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="likes"
                    name="Me gusta"
                    stroke={ROSE_GOLD}
                    strokeWidth={2.5}
                    fill="url(#gradientLikes)"
                    dot={{ r: 3, fill: ROSE_GOLD, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: ROSE_GOLD, strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    name="Comentarios"
                    stroke={SILVER}
                    strokeWidth={2.5}
                    fill="url(#gradientComments)"
                    dot={{ r: 3, fill: SILVER, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: SILVER, strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    name="Compartidos"
                    stroke={CHAMPAGNE}
                    strokeWidth={2.5}
                    fill="url(#gradientShares)"
                    dot={{ r: 3, fill: CHAMPAGNE, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: CHAMPAGNE, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Comparison */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Instagram Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ background: INSTAGRAM_GRADIENT }}
            >
              <Instagram className="size-5 text-white" />
              <span className="text-base font-semibold text-white">Instagram</span>
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Me gusta
                  </p>
                  <p className="text-xl font-bold">{formatNumber(instagramData.likes)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Comentarios
                  </p>
                  <p className="text-xl font-bold">{formatNumber(instagramData.comments)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Compartidos
                  </p>
                  <p className="text-xl font-bold">{formatNumber(instagramData.shares)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Alcance
                  </p>
                  <p className="text-xl font-bold">{formatNumber(instagramData.reach)}</p>
                </div>
              </div>
              <div className="mt-6 h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { metric: 'Me gusta', value: instagramData.likes },
                      { metric: 'Comentarios', value: instagramData.comments },
                      { metric: 'Compartidos', value: instagramData.shares },
                      { metric: 'Alcance', value: instagramData.reach / 10 },
                    ]}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis
                      dataKey="metric"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        fontSize: 12,
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#C13584"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Facebook Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ backgroundColor: FACEBOOK_COLOR }}
            >
              <Facebook className="size-5 text-white" />
              <span className="text-base font-semibold text-white">Facebook</span>
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Me gusta
                  </p>
                  <p className="text-xl font-bold">{formatNumber(facebookData.likes)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Comentarios
                  </p>
                  <p className="text-xl font-bold">{formatNumber(facebookData.comments)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Compartidos
                  </p>
                  <p className="text-xl font-bold">{formatNumber(facebookData.shares)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Alcance
                  </p>
                  <p className="text-xl font-bold">{formatNumber(facebookData.reach)}</p>
                </div>
              </div>
              <div className="mt-6 h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { metric: 'Me gusta', value: facebookData.likes },
                      { metric: 'Comentarios', value: facebookData.comments },
                      { metric: 'Compartidos', value: facebookData.shares },
                      { metric: 'Alcance', value: facebookData.reach / 10 },
                    ]}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis
                      dataKey="metric"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        fontSize: 12,
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={FACEBOOK_COLOR}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performing Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publicaciones con Mejor Rendimiento</CardTitle>
            <CardDescription>
              Tu contenido con mayor interacción en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Publicación</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead className="text-right">Me gusta</TableHead>
                  <TableHead className="text-right">Comentarios</TableHead>
                  <TableHead className="text-right">Alcance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPosts.map((post) => (
                  <TableRow key={post.rank}>
                    <TableCell className="font-medium text-muted-foreground">
                      {post.rank}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium sm:max-w-none">
                      {post.caption}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="gap-1 text-xs"
                        style={
                          post.platform === 'instagram'
                            ? { background: 'rgba(193,53,132,0.1)', color: '#C13584' }
                            : { background: 'rgba(24,119,242,0.1)', color: '#1877F2' }
                        }
                      >
                        {post.platform === 'instagram' ? (
                          <Instagram className="size-3" />
                        ) : (
                          <Facebook className="size-3" />
                        )}
                        {post.platform === 'instagram' ? 'Instagram' : 'Facebook'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(post.likes)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(post.comments)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(post.reach)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

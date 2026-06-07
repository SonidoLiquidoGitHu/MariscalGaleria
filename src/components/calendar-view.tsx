'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  startOfWeek,
  endOfWeek,
  getDay,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Instagram,
  Facebook,
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
  Trash2,
  Pencil,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { useAppStore, type ScheduledPost } from '@/lib/store'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ─── Demo Scheduled Posts ───────────────────────────────────────────────────────
const DEMO_CALENDAR_POSTS: ScheduledPost[] = [
  {
    id: 'cal-1',
    caption: 'Embrace the moonlight with our Celestial Moon Ring. Handcrafted 925 silver that captures the essence of nighttime elegance.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    isRecurring: false,
    hashtags: ['#925Silver', '#SilverJewelry', '#MoonRing'],
    productId: 'demo-1',
  },
  {
    id: 'cal-2',
    caption: 'Layer up this season with our Whisper Chain Necklace. Delicate meets bold in every link.',
    platform: 'both',
    media: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    isRecurring: true,
    recurrence: 'weekly',
    hashtags: ['#LayeredLook', '#SilverNecklace', '#SterlingSilver'],
    productId: 'demo-2',
  },
  {
    id: 'cal-3',
    caption: 'Our Ethereal Cuff Bracelet just dropped. Polished 925 silver with organic flowing design.',
    platform: 'facebook',
    media: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isRecurring: false,
    hashtags: ['#CuffBracelet', '#SilverArt', '#HandcraftedJewelry'],
    productId: 'demo-3',
  },
  {
    id: 'cal-4',
    caption: 'Coming soon: Drop Crystal Earrings that redefine elegance. Stay tuned for the launch.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    isRecurring: false,
    hashtags: ['#CrystalEarrings', '#ComingSoon', '#925Silver'],
  },
  {
    id: 'cal-5',
    caption: 'New collection alert! Infinity Wrap Ring now available. Swipe to see details.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    isRecurring: false,
    hashtags: ['#InfinityRing', '#NewCollection', '#SilverDesign'],
    productId: 'demo-5',
  },
  {
    id: 'cal-6',
    caption: 'Riviera Choker – the statement piece your collection needs. 925 silver, interlocking geometry.',
    platform: 'both',
    media: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    isRecurring: false,
    hashtags: ['#RivieraChoker', '#StatementJewelry', '#925Silver'],
    productId: 'demo-6',
  },
  {
    id: 'cal-7',
    caption: 'Wave Bangle Set – stacking perfection in brushed silver.',
    platform: 'facebook',
    media: ['https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    isRecurring: true,
    recurrence: 'monthly',
    hashtags: ['#WaveBangle', '#StackingBracelets', '#SilverStyle'],
    productId: 'demo-7',
  },
  {
    id: 'cal-8',
    caption: 'Classic Pearl Studs on 925 silver posts – timeless elegance for every day.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    isRecurring: false,
    hashtags: ['#PearlEarrings', '#ClassicStyle', '#925Silver'],
    productId: 'demo-8',
  },
  {
    id: 'cal-9',
    caption: 'Behind the scenes: Handcrafting our signature Celestial Moon Ring.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    isRecurring: false,
    hashtags: ['#BehindTheScenes', '#SilverCraft', '#Handmade'],
    productId: 'demo-1',
  },
  {
    id: 'cal-10',
    caption: 'Weekend sparkle: Our Drop Crystal Earrings are the perfect weekend companion.',
    platform: 'both',
    media: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'],
    scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isRecurring: false,
    hashtags: ['#WeekendSparkle', '#CrystalEarrings', '#925Silver'],
    productId: 'demo-4',
  },
]

// ─── Platform Icon Component ────────────────────────────────────────────────────
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  if (platform === 'instagram') return <Instagram className={cn('size-4', className)} />
  if (platform === 'facebook') return <Facebook className={cn('size-4', className)} />
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <Instagram className="size-3.5" />
      <Facebook className="size-3.5" />
    </div>
  )
}

// ─── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ScheduledPost['status'] }) {
  const config = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100', icon: Timer },
    scheduled: {
      label: 'Scheduled',
      className: 'bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200',
      icon: Clock,
    },
    published: {
      label: 'Published',
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200',
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-50 text-red-600 hover:bg-red-50 border-red-200',
      icon: AlertCircle,
    },
  }[status]

  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs font-medium', config.className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}

// ─── Platform Badge ─────────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: ScheduledPost['platform'] }) {
  const config = {
    instagram: {
      label: 'Instagram',
      className: 'bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border-purple-200',
    },
    facebook: {
      label: 'Facebook',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    both: {
      label: 'Both',
      className: 'bg-gradient-to-r from-blue-50 to-pink-50 text-indigo-700 border-indigo-200',
    },
  }[platform]

  return (
    <Badge variant="outline" className={cn('gap-1 text-xs font-medium', config.className)}>
      <PlatformIcon platform={platform} className="size-3" />
      {config.label}
    </Badge>
  )
}

// ─── Calendar Dot ───────────────────────────────────────────────────────────────
function CalendarDot({ platform }: { platform: ScheduledPost['platform'] }) {
  if (platform === 'instagram') {
    return (
      <span
        className="calendar-dot"
        style={{
          background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
        }}
      />
    )
  }
  if (platform === 'facebook') {
    return <span className="calendar-dot" style={{ background: '#1877F2' }} />
  }
  // Both: dual-colored
  return (
    <span
      className="calendar-dot"
      style={{
        background: 'linear-gradient(135deg, #1877F2 50%, #e6683c 50%)',
      }}
    />
  )
}

// ─── Day Names ──────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Animation Variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

const sidebarItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CalendarView() {
  const { scheduledPosts, setScheduledPosts, deleteScheduledPost, setActiveSection } = useAppStore()

  // Initialize demo data
  useEffect(() => {
    if (scheduledPosts.length === 0) {
      setScheduledPosts(DEMO_CALENDAR_POSTS)
    }
  }, [scheduledPosts.length, setScheduledPosts])

  // Current month state
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Day detail dialog
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Navigation
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  // Calendar days computation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  // Posts grouped by day
  const postsByDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>()
    scheduledPosts.forEach((post) => {
      const dateStr = format(parseISO(post.scheduledAt), 'yyyy-MM-dd')
      const existing = map.get(dateStr) || []
      existing.push(post)
      map.set(dateStr, existing)
    })
    return map
  }, [scheduledPosts])

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return postsByDay.get(dateStr) || []
  }

  // Posts for the selected day (dialog)
  const selectedDayPosts = useMemo(() => {
    if (!selectedDay) return []
    const dateStr = format(selectedDay, 'yyyy-MM-dd')
    return postsByDay.get(dateStr) || []
  }, [selectedDay, postsByDay])

  // Upcoming posts (next 5 scheduled)
  const upcomingPosts = useMemo(() => {
    const now = new Date()
    return scheduledPosts
      .filter((p) => p.status === 'scheduled' && parseISO(p.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5)
  }, [scheduledPosts])

  // Mini stats
  const monthPosts = useMemo(() => {
    return scheduledPosts.filter((p) => isSameMonth(parseISO(p.scheduledAt), currentMonth))
  }, [scheduledPosts, currentMonth])

  const monthStats = useMemo(() => {
    const ig = monthPosts.filter((p) => p.platform === 'instagram' || p.platform === 'both').length
    const fb = monthPosts.filter((p) => p.platform === 'facebook' || p.platform === 'both').length
    const published = monthPosts.filter((p) => p.status === 'published').length
    const scheduled = monthPosts.filter((p) => p.status === 'scheduled').length
    const total = monthPosts.length
    return { ig, fb, published, scheduled, total }
  }, [monthPosts])

  // Day click handler
  const handleDayClick = (day: Date) => {
    const posts = getPostsForDay(day)
    if (posts.length > 0) {
      setSelectedDay(day)
      setDialogOpen(true)
    }
  }

  // Delete handler
  const handleDeletePost = (postId: string) => {
    deleteScheduledPost(postId)
    // Close dialog if no more posts for the day
    if (selectedDay && getPostsForDay(selectedDay).length <= 1) {
      setDialogOpen(false)
    }
  }

  // Edit handler – navigate to schedule section
  const handleEditPost = () => {
    setActiveSection('schedule')
    setDialogOpen(false)
  }

  // Check if day is a weekend
  const isWeekend = (day: Date) => {
    const d = getDay(day)
    return d === 0 || d === 6
  }

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Content <span className="text-rose-gold">Calendar</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual overview of your posting schedule
          </p>
        </div>

        {/* Mini Stats */}
        <div className="flex gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-rose-gold/10">
                <CalendarIcon className="size-4 text-rose-gold" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{monthStats.total}</p>
                <p className="text-[11px] text-muted-foreground">This Month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{monthStats.published}</p>
                <p className="text-[11px] text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{monthStats.scheduled}</p>
                <p className="text-[11px] text-muted-foreground">Scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ═══ MAIN LAYOUT: Calendar + Sidebar ═══ */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ─── Calendar Section ─── */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden shadow-sm">
            {/* Month Navigation */}
            <CardHeader className="border-b bg-gradient-to-r from-rose-gold/5 via-transparent to-champagne/10 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="h-8 px-3 text-xs font-medium"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={format(currentMonth, 'yyyy-MM')}
                className="grid grid-cols-7 gap-px rounded-lg bg-border/50 overflow-hidden"
              >
                {calendarDays.map((day) => {
                  const dayPosts = getPostsForDay(day)
                  const inCurrentMonth = isSameMonth(day, currentMonth)
                  const today = isToday(day)
                  const weekend = isWeekend(day)
                  const hasPosts = dayPosts.length > 0

                  // Get unique platforms for the day
                  const platforms = [...new Set(dayPosts.map((p) => p.platform))]

                  return (
                    <motion.button
                      variants={cellVariants}
                      key={day.toISOString()}
                      onClick={() => hasPosts && handleDayClick(day)}
                      disabled={!hasPosts}
                      className={cn(
                        'relative flex flex-col items-center gap-1 p-1 sm:p-2 min-h-[56px] sm:min-h-[72px] transition-colors',
                        inCurrentMonth ? 'bg-card' : 'bg-muted/30',
                        weekend && inCurrentMonth && 'bg-rose-gold/[0.02]',
                        today && 'bg-rose-gold/5',
                        hasPosts && 'cursor-pointer hover:bg-rose-gold/10',
                        !hasPosts && 'cursor-default'
                      )}
                    >
                      {/* Day Number */}
                      <span
                        className={cn(
                          'flex size-6 sm:size-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors',
                          today && 'bg-rose-gold text-white font-bold',
                          !today && inCurrentMonth && 'text-foreground',
                          !today && !inCurrentMonth && 'text-muted-foreground/40',
                          hasPosts && !today && 'text-foreground font-semibold'
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Post Dots */}
                      {hasPosts && (
                        <div className="flex flex-wrap items-center justify-center gap-0.5 mt-0.5">
                          {dayPosts.length <= 3 ? (
                            platforms.map((platform) => (
                              <CalendarDot key={platform} platform={platform} />
                            ))
                          ) : (
                            <>
                              <CalendarDot platform={platforms[0]} />
                              <span className="text-[9px] font-bold text-rose-gold leading-none">
                                +{dayPosts.length - 1}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>

              {/* Platform Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span
                    className="calendar-dot"
                    style={{
                      background:
                        'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                    }}
                  />
                  <span>Instagram</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="calendar-dot" style={{ background: '#1877F2' }} />
                  <span>Facebook</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="calendar-dot"
                    style={{
                      background: 'linear-gradient(135deg, #1877F2 50%, #e6683c 50%)',
                    }}
                  />
                  <span>Both</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Sidebar: Upcoming + Stats ─── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Upcoming Posts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md rose-gold-gradient">
                  <Clock className="size-4 text-white" />
                </div>
                <CardTitle className="text-base font-semibold">Upcoming</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Next scheduled posts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    No upcoming posts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Schedule a post to see it here
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    {upcomingPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={sidebarItemVariants}
                        className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-all hover:border-rose-gold/40 hover:shadow-sm"
                      >
                        {/* Platform indicator */}
                        <div
                          className={cn(
                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
                            post.platform === 'instagram' && 'bg-gradient-to-br from-pink-50 to-purple-50',
                            post.platform === 'facebook' && 'bg-blue-50',
                            post.platform === 'both' && 'bg-gradient-to-br from-blue-50 to-pink-50'
                          )}
                        >
                          <PlatformIcon
                            platform={post.platform}
                            className={cn(
                              'size-4',
                              post.platform === 'instagram' && 'text-purple-600',
                              post.platform === 'facebook' && 'text-blue-600',
                              post.platform === 'both' && 'text-indigo-600'
                            )}
                          />
                        </div>

                        {/* Post info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {post.caption}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {format(parseISO(post.scheduledAt), 'MMM d · h:mm a')}
                          </p>
                        </div>

                        {/* Status dot */}
                        <div
                          className={cn(
                            'mt-1 size-2 shrink-0 rounded-full',
                            post.status === 'scheduled' && 'bg-amber-400',
                            post.status === 'draft' && 'bg-gray-400',
                            post.status === 'published' && 'bg-emerald-400',
                            post.status === 'failed' && 'bg-red-400'
                          )}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-rose-gold/10">
                  <BarChart3 className="size-4 text-rose-gold" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {format(currentMonth, 'MMM')} Stats
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Instagram count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-pink-50 to-purple-50">
                    <Instagram className="size-3.5 text-purple-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Instagram</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{monthStats.ig}</span>
              </div>

              {/* Facebook count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-blue-50">
                    <Facebook className="size-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Facebook</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{monthStats.fb}</span>
              </div>

              <Separator />

              {/* Published vs Scheduled ratio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Published vs Scheduled
                  </span>
                </div>
                <div className="space-y-1.5">
                  {/* Published bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs text-muted-foreground">Published</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            monthStats.total > 0
                              ? `${(monthStats.published / monthStats.total) * 100}%`
                              : '0%',
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-emerald-400"
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-medium text-foreground">
                      {monthStats.published}
                    </span>
                  </div>

                  {/* Scheduled bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs text-muted-foreground">Scheduled</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            monthStats.total > 0
                              ? `${(monthStats.scheduled / monthStats.total) * 100}%`
                              : '0%',
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full bg-amber-400"
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-medium text-foreground">
                      {monthStats.scheduled}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ DAY DETAIL DIALOG ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-rose-gold" />
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''} scheduled
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            <div className="space-y-3 pr-1">
              <AnimatePresence>
                {selectedDayPosts.map((post, index) => {
                  const linkedProduct = post.productId
                    ? DEMO_PRODUCTS.find((p) => p.id === post.productId)
                    : null

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'rounded-lg border p-3 transition-all',
                        post.status === 'failed' && 'border-red-200 bg-red-50/30',
                        post.status === 'published' && 'border-emerald-200 bg-emerald-50/20'
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Media thumbnail */}
                        {post.media.length > 0 && (
                          <div className="size-14 shrink-0 overflow-hidden rounded-md">
                            <img
                              src={post.media[0]}
                              alt="Post media"
                              className="size-full object-cover"
                            />
                          </div>
                        )}

                        {/* Post details */}
                        <div className="min-w-0 flex-1">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <PlatformBadge platform={post.platform} />
                            <StatusBadge status={post.status} />
                            {post.isRecurring && (
                              <Badge
                                variant="outline"
                                className="gap-1 text-xs font-medium bg-rose-gold/10 text-rose-gold border-rose-gold/30"
                              >
                                <Clock className="size-3" />
                                {post.recurrence}
                              </Badge>
                            )}
                          </div>

                          {/* Caption preview */}
                          <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                            {post.caption}
                          </p>

                          {/* Scheduled time */}
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {format(parseISO(post.scheduledAt), 'h:mm a')}
                            {linkedProduct && (
                              <span className="ml-2 text-rose-gold">
                                · {linkedProduct.name}
                              </span>
                            )}
                          </p>

                          {/* Quick actions */}
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditPost}
                              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-rose-gold"
                            >
                              <Pencil className="size-3" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

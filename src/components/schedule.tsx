'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { format, addDays, addHours, isToday, isTomorrow, parseISO } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Facebook,
  Repeat,
  Plus,
  Hash,
  Trash2,
  Copy,
  Pencil,
  Send,
  Save,
  ImagePlus,
  Sparkles,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Timer,
  Zap,
  MoreHorizontal,
  ImageIcon,
} from 'lucide-react'
import { useAppStore, type ScheduledPost } from '@/lib/store'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ─── Demo Scheduled Posts ───────────────────────────────────────────────────────
const DEMO_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: 'sp-1',
    caption:
      'Embrace the moonlight with our Celestial Moon Ring. Handcrafted 925 silver that captures the essence of nighttime elegance. Which phase speaks to your soul?',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop'],
    scheduledAt: addHours(new Date(), 3).toISOString(),
    status: 'scheduled',
    isRecurring: false,
    hashtags: ['#925Silver', '#SilverJewelry', '#MoonRing', '#CelestialVibes', '#JewelryAddict'],
    productId: 'demo-1',
  },
  {
    id: 'sp-2',
    caption:
      'Layer up this season with our Whisper Chain Necklace. Delicate meets bold in every link. Perfect for your everyday elegance.',
    platform: 'both',
    media: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
    scheduledAt: addDays(new Date(), 1).toISOString(),
    status: 'scheduled',
    isRecurring: true,
    recurrence: 'weekly',
    hashtags: ['#LayeredLook', '#SilverNecklace', '#SterlingSilver', '#MinimalStyle', '#JewelryLovers'],
    productId: 'demo-2',
  },
  {
    id: 'sp-3',
    caption:
      'Our Ethereal Cuff Bracelet just dropped. Polished 925 silver with organic flowing design that wraps your wrist in pure artistry.',
    platform: 'facebook',
    media: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop'],
    scheduledAt: addDays(new Date(), -1).toISOString(),
    publishedAt: addDays(new Date(), -1).toISOString(),
    status: 'published',
    isRecurring: false,
    hashtags: ['#CuffBracelet', '#SilverArt', '#HandcraftedJewelry', '#StatementPiece'],
    productId: 'demo-3',
  },
  {
    id: 'sp-4',
    caption: 'Coming soon: Drop Crystal Earrings that redefine elegance. Stay tuned for the launch.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'],
    scheduledAt: addDays(new Date(), 2).toISOString(),
    status: 'draft',
    isRecurring: false,
    hashtags: ['#CrystalEarrings', '#ComingSoon', '#925Silver'],
  },
  {
    id: 'sp-5',
    caption: 'New collection alert! Infinity Wrap Ring now available. Swipe to see details.',
    platform: 'instagram',
    media: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop'],
    scheduledAt: addDays(new Date(), -2).toISOString(),
    status: 'failed',
    isRecurring: false,
    hashtags: ['#InfinityRing', '#NewCollection', '#SilverDesign'],
    productId: 'demo-5',
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

// ─── Format Scheduled Date ──────────────────────────────────────────────────────
function formatScheduledDate(dateStr: string) {
  const date = parseISO(dateStr)
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`
  if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`
  return format(date, 'MMM d, yyyy · h:mm a')
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Schedule() {
  const { toast } = useToast()
  const {
    scheduledPosts,
    addScheduledPost,
    updateScheduledPost,
    deleteScheduledPost,
    products,
    hashtagSets,
    setScheduledPosts,
  } = useAppStore()

  // ── Initialize demo data ──
  useEffect(() => {
    if (scheduledPosts.length === 0) {
      setScheduledPosts(DEMO_SCHEDULED_POSTS)
    }
  }, [scheduledPosts.length, setScheduledPosts])

  // ── Form state ──
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'both'>('instagram')
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(addHours(new Date(), 2))
  const [scheduledHour, setScheduledHour] = useState('10')
  const [scheduledMinute, setScheduledMinute] = useState('00')
  const [scheduledAmPm, setScheduledAmPm] = useState<'AM' | 'PM'>('AM')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(
    addDays(new Date(), 30)
  )
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [productGalleryOpen, setProductGalleryOpen] = useState(false)

  // ── Stats ──
  const totalScheduled = scheduledPosts.filter((p) => p.status === 'scheduled').length
  const publishedToday = scheduledPosts.filter(
    (p) => p.status === 'published' && p.publishedAt && isToday(parseISO(p.publishedAt))
  ).length
  const failedCount = scheduledPosts.filter((p) => p.status === 'failed').length

  // ── Filtered posts ──
  const filteredPosts =
    activeFilter === 'all'
      ? [...scheduledPosts]
      : scheduledPosts.filter((p) => p.status === activeFilter)

  const sortedPosts = filteredPosts.sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  )

  // ── Hashtag handlers ──
  const addHashtag = useCallback(
    (tag: string) => {
      const cleaned = tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`
      if (cleaned.length > 1 && !hashtags.includes(cleaned)) {
        setHashtags((prev) => [...prev, cleaned])
      }
      setHashtagInput('')
    },
    [hashtags]
  )

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== tag))
  }

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addHashtag(hashtagInput)
    }
  }

  const insertHashtagSet = (setId: string) => {
    const set = hashtagSets.find((s) => s.id === setId)
    if (set) {
      const newTags = set.hashtags.filter((h) => !hashtags.includes(h))
      setHashtags((prev) => [...prev, ...newTags])
      toast({ title: 'Hashtags added', description: `${newTags.length} hashtags from "${set.name}"` })
    }
  }

  // ── Select product media ──
  const selectProductMedia = (productId: string) => {
    const product = DEMO_PRODUCTS.find((p) => p.id === productId)
    if (product && product.media.length > 0) {
      setMedia(product.media)
      setSelectedProductId(productId)
      setProductGalleryOpen(false)
      if (!caption) {
        setCaption(product.description || product.name)
      }
      toast({ title: 'Media attached', description: `From "${product.name}"` })
    }
  }

  // ── Reset form ──
  const resetForm = () => {
    setPlatform('instagram')
    setCaption('')
    setMedia([])
    setHashtags([])
    setHashtagInput('')
    setScheduledDate(addHours(new Date(), 2))
    setScheduledHour('10')
    setScheduledMinute('00')
    setScheduledAmPm('AM')
    setIsRecurring(false)
    setRecurrence('weekly')
    setRecurringEndDate(addDays(new Date(), 30))
    setSelectedProductId('')
    setEditingPostId(null)
  }

  // ── Build scheduled date from form ──
  const buildScheduledDate = (): Date => {
    if (!scheduledDate) return addHours(new Date(), 2)
    const date = new Date(scheduledDate)
    let hours = parseInt(scheduledHour)
    if (scheduledAmPm === 'PM' && hours !== 12) hours += 12
    if (scheduledAmPm === 'AM' && hours === 12) hours = 0
    date.setHours(hours, parseInt(scheduledMinute), 0, 0)
    return date
  }

  // ── Submit handlers ──
  const handleSchedulePost = () => {
    if (!caption.trim()) {
      toast({ title: 'Caption required', description: 'Please add a caption for your post.', variant: 'destructive' })
      return
    }
    if (!scheduledDate) {
      toast({ title: 'Date required', description: 'Please select a date and time.', variant: 'destructive' })
      return
    }

    const scheduledAt = buildScheduledDate().toISOString()

    if (editingPostId) {
      updateScheduledPost(editingPostId, {
        caption,
        platform,
        media,
        scheduledAt,
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
        hashtags,
        productId: selectedProductId || undefined,
        status: 'scheduled',
      })
      toast({ title: 'Post updated', description: 'Your scheduled post has been updated.' })
    } else {
      const newPost: ScheduledPost = {
        id: `sp-${Date.now()}`,
        caption,
        platform,
        media,
        scheduledAt,
        status: 'scheduled',
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
        hashtags,
        productId: selectedProductId || undefined,
      }
      addScheduledPost(newPost)
      toast({ title: 'Post scheduled', description: `Scheduled for ${formatScheduledDate(scheduledAt)}` })
    }
    resetForm()
  }

  const handleSaveDraft = () => {
    if (!caption.trim()) {
      toast({ title: 'Caption required', description: 'Please add a caption to save as draft.', variant: 'destructive' })
      return
    }

    const scheduledAt = scheduledDate ? buildScheduledDate().toISOString() : new Date().toISOString()

    if (editingPostId) {
      updateScheduledPost(editingPostId, {
        caption,
        platform,
        media,
        scheduledAt,
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
        hashtags,
        productId: selectedProductId || undefined,
        status: 'draft',
      })
      toast({ title: 'Draft updated', description: 'Your draft has been saved.' })
    } else {
      const draft: ScheduledPost = {
        id: `sp-${Date.now()}`,
        caption,
        platform,
        media,
        scheduledAt,
        status: 'draft',
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
        hashtags,
        productId: selectedProductId || undefined,
      }
      addScheduledPost(draft)
      toast({ title: 'Draft saved', description: 'Your post has been saved as a draft.' })
    }
    resetForm()
  }

  // ── Post actions ──
  const handleEdit = (post: ScheduledPost) => {
    setEditingPostId(post.id)
    setPlatform(post.platform)
    setCaption(post.caption)
    setMedia(post.media)
    setHashtags(post.hashtags)
    setIsRecurring(post.isRecurring)
    setRecurrence(post.recurrence || 'weekly')
    setSelectedProductId(post.productId || '')
    const date = parseISO(post.scheduledAt)
    setScheduledDate(date)
    const h = date.getHours()
    setScheduledHour(h === 0 ? '12' : h > 12 ? String(h - 12) : String(h))
    setScheduledMinute(String(date.getMinutes()).padStart(2, '0'))
    setScheduledAmPm(h >= 12 ? 'PM' : 'AM')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = (post: ScheduledPost) => {
    const duplicate: ScheduledPost = {
      ...post,
      id: `sp-${Date.now()}`,
      status: 'draft',
      scheduledAt: addDays(new Date(), 1).toISOString(),
    }
    addScheduledPost(duplicate)
    toast({ title: 'Post duplicated', description: 'A copy has been saved as draft.' })
  }

  const handleDelete = () => {
    if (postToDelete) {
      deleteScheduledPost(postToDelete)
      toast({ title: 'Post deleted', description: 'The scheduled post has been removed.' })
      setPostToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setPostToDelete(id)
    setDeleteDialogOpen(true)
  }

  // ── Character limits ──
  const INSTAGRAM_LIMIT = 2200
  const FACEBOOK_LIMIT = 63206
  const charLimit = platform === 'instagram' ? INSTAGRAM_LIMIT : FACEBOOK_LIMIT
  const charCount = caption.length
  const isOverLimit = charCount > charLimit

  // ── Hour/minute options ──
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Auto-Post <span className="text-rose-gold">Scheduler</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule and automate your social media posts
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{totalScheduled}</p>
                <p className="text-[11px] text-muted-foreground">Scheduled</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{publishedToday}</p>
                <p className="text-[11px] text-muted-foreground">Published Today</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle className="size-4 text-red-500" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{failedCount}</p>
                <p className="text-[11px] text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ NEW POST COMPOSER ═══ */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-rose-gold/5 via-transparent to-champagne/10 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="flex size-7 items-center justify-center rounded-md rose-gold-gradient">
              <Plus className="size-4 text-white" />
            </div>
            {editingPostId ? 'Edit Scheduled Post' : 'New Scheduled Post'}
          </CardTitle>
          <CardDescription className="text-xs">
            {editingPostId
              ? 'Update your scheduled post details'
              : 'Compose and schedule a post for Instagram, Facebook, or both'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          {/* ── Platform Selection ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Platform
            </Label>
            <div className="flex gap-2">
              {(['instagram', 'facebook', 'both'] as const).map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    'gap-2 rounded-lg border transition-all duration-200',
                    platform === p
                      ? p === 'instagram'
                        ? 'platform-instagram border-transparent shadow-md'
                        : p === 'facebook'
                          ? 'platform-facebook border-transparent shadow-md'
                          : 'platform-both border-transparent shadow-md'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <PlatformIcon platform={p} />
                  <span className="capitalize">{p === 'both' ? 'Both' : p}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* ── Media Attachment ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Media
            </Label>
            {media.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {media.map((url, idx) => (
                  <div key={idx} className="group relative size-20 overflow-hidden rounded-lg border shadow-sm">
                    <img
                      src={url}
                      alt={`Media ${idx + 1}`}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <button
                      onClick={() => setMedia((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setProductGalleryOpen(true)}
                  className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-rose-gold hover:bg-rose-gold/5"
                >
                  <Plus className="size-5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setProductGalleryOpen(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-rose-gold hover:bg-rose-gold/5"
                >
                  <ImagePlus className="size-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Attach from product gallery</span>
                </button>
              </div>
            )}

            {/* Product Gallery Dialog */}
            <Dialog open={productGalleryOpen} onOpenChange={setProductGalleryOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Select Product Media</DialogTitle>
                  <DialogDescription>
                    Choose a product to attach its media to your post
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-80">
                  <div className="grid grid-cols-2 gap-3 p-1">
                    {DEMO_PRODUCTS.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => selectProductMedia(product.id)}
                        className={cn(
                          'group flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:border-rose-gold hover:shadow-md',
                          selectedProductId === product.id && 'border-rose-gold bg-rose-gold/5'
                        )}
                      >
                        <div className="size-16 overflow-hidden rounded-md">
                          <img
                            src={product.media[0]}
                            alt={product.name}
                            className="size-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        <span className="text-xs font-medium leading-tight">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ${product.price?.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── Caption Editor ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Caption
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-[11px] text-rose-gold hover:text-rose-gold/80"
                onClick={() =>
                  toast({
                    title: 'AI Studio',
                    description: 'AI caption generation will be available in AI Studio section.',
                  })
                }
              >
                <Sparkles className="size-3" />
                Generate with AI
              </Button>
            </div>
            <div className="relative">
              <Textarea
                placeholder="Write your caption here... ✨"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className={cn(
                  'resize-none text-sm transition-colors',
                  isOverLimit && 'border-red-300 focus-visible:ring-red-300'
                )}
              />
              <div
                className={cn(
                  'mt-1 text-right text-[11px]',
                  isOverLimit ? 'text-red-500' : charCount > charLimit * 0.9 ? 'text-amber-600' : 'text-muted-foreground'
                )}
              >
                {charCount} / {charLimit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* ── Hashtags ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hashtags
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Add hashtag (press Enter)"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleHashtagKeyDown}
                  className="pl-8 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addHashtag(hashtagInput)}
                disabled={!hashtagInput.trim()}
                className="shrink-0"
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Hashtag tags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 rounded-full bg-rose-gold/10 text-rose-gold hover:bg-rose-gold/20"
                  >
                    <span className="text-xs">{tag}</span>
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-rose-gold/30"
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick insert from hashtag sets */}
            {hashtagSets.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground">Quick insert:</span>
                <div className="flex flex-wrap gap-1.5">
                  {hashtagSets.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => insertHashtagSet(set.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-rose-gold hover:bg-rose-gold/5 hover:text-rose-gold"
                    >
                      <Zap className="size-2.5" />
                      {set.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Schedule Settings ── */}
          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Schedule
            </Label>
            <div className="flex flex-wrap items-end gap-3">
              {/* Date picker */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Date</span>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start gap-2 text-left text-sm font-normal sm:w-44',
                        !scheduledDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {scheduledDate ? format(scheduledDate, 'MMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => {
                        setScheduledDate(date)
                        setCalendarOpen(false)
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time picker */}
              <div className="flex items-end gap-1.5">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Hour</span>
                  <Select value={scheduledHour} onValueChange={setScheduledHour}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="pb-2 text-lg text-muted-foreground">:</span>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Min</span>
                  <Select value={scheduledMinute} onValueChange={setScheduledMinute}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes
                        .filter((_, i) => i % 5 === 0)
                        .map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">&nbsp;</span>
                  <Select
                    value={scheduledAmPm}
                    onValueChange={(v) => setScheduledAmPm(v as 'AM' | 'PM')}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timezone display */}
              <div className="flex items-end pb-0.5">
                <span className="text-[11px] text-muted-foreground">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
            </div>
          </div>

          {/* ── Recurring Options ── */}
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="size-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Recurring Post</Label>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>
            {isRecurring && (
              <div className="flex flex-wrap items-end gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Repeat</span>
                  <Select
                    value={recurrence}
                    onValueChange={(v) => setRecurrence(v as 'daily' | 'weekly' | 'monthly')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">End Date</span>
                  <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-44 justify-start gap-2 text-left text-sm font-normal',
                          !recurringEndDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="size-4" />
                        {recurringEndDate ? format(recurringEndDate, 'MMM d, yyyy') : 'Pick end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={recurringEndDate}
                        onSelect={(date) => {
                          setRecurringEndDate(date)
                          setEndCalendarOpen(false)
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSchedulePost}
              disabled={!caption.trim() || isOverLimit}
              className="gap-2 rounded-lg rose-gold-gradient text-white shadow-md hover:opacity-90"
            >
              <Send className="size-4" />
              {editingPostId ? 'Update Schedule' : 'Schedule Post'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={!caption.trim()}
              className="gap-2 rounded-lg"
            >
              <Save className="size-4" />
              Save as Draft
            </Button>
            {editingPostId && (
              <Button variant="ghost" onClick={resetForm} className="gap-2">
                <X className="size-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══ POST QUEUE ═══ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Post Queue</h2>
          <span className="text-xs text-muted-foreground">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="h-9 bg-muted/50 p-0.5">
            <TabsTrigger value="all" className="h-8 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-1 text-xs">
              <Clock className="size-3" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-1 text-xs">
              <CheckCircle2 className="size-3" />
              Published
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-1 text-xs">
              <Timer className="size-3" />
              Draft
            </TabsTrigger>
            <TabsTrigger value="failed" className="gap-1 text-xs">
              <AlertCircle className="size-3" />
              Failed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Post List */}
        {sortedPosts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">No posts found</p>
              <p className="text-xs text-muted-foreground">
                {activeFilter === 'all'
                  ? 'Schedule your first post above'
                  : `No ${activeFilter} posts yet`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedPosts.map((post) => {
              const linkedProduct = post.productId
                ? DEMO_PRODUCTS.find((p) => p.id === post.productId)
                : null

              return (
                <Card
                  key={post.id}
                  className={cn(
                    'overflow-hidden transition-all hover:shadow-md',
                    post.status === 'failed' && 'border-red-200 bg-red-50/30',
                    post.status === 'published' && 'border-emerald-200 bg-emerald-50/20'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* Media thumbnail */}
                      {post.media.length > 0 && (
                        <div className="size-16 shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={post.media[0]}
                            alt="Post media"
                            className="size-full object-cover"
                          />
                        </div>
                      )}

                      {/* Post details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Platform badge */}
                            <Badge
                              className={cn(
                                'gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium',
                                post.platform === 'instagram'
                                  ? 'platform-instagram'
                                  : post.platform === 'facebook'
                                    ? 'platform-facebook'
                                    : 'platform-both'
                              )}
                            >
                              <PlatformIcon platform={post.platform} className="size-3" />
                              {post.platform === 'both' ? 'IG+FB' : post.platform === 'instagram' ? 'IG' : 'FB'}
                            </Badge>
                            <StatusBadge status={post.status} />
                            {post.isRecurring && (
                              <Badge variant="outline" className="gap-1 text-[10px]">
                                <Repeat className="size-2.5" />
                                {post.recurrence}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Caption preview */}
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/80">
                          {post.caption}
                        </p>

                        {/* Hashtags preview */}
                        {post.hashtags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 4).map((tag) => (
                              <span key={tag} className="text-[10px] text-rose-gold/70">
                                {tag}
                              </span>
                            ))}
                            {post.hashtags.length > 4 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{post.hashtags.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Meta row */}
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CalendarIcon className="size-3" />
                            {formatScheduledDate(post.scheduledAt)}
                          </span>
                          {linkedProduct && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <ImageIcon className="size-3" />
                              {linkedProduct.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          onClick={() => handleEdit(post)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(post)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Duplicate"
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(post.id)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ DELETE CONFIRMATION DIALOG ═══ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Scheduled Post</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The scheduled post will be permanently removed from your
              queue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1 size-4" />
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

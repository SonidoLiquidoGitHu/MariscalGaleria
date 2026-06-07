'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  MessageSquare,
  Hash,
  Lightbulb,
  Copy,
  Bookmark,
  CalendarPlus,
  ChevronDown,
  Loader2,
  ArrowRight,
  Wand2,
} from 'lucide-react'
import { useAppStore, type HashtagSet } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'

/* ─── Types ─── */

type GenerationType = 'caption' | 'hashtags' | 'ideas'

interface ContentIdea {
  title: string
  description: string
  platform: string
}

interface GenerationRecord {
  id: string
  type: GenerationType
  timestamp: Date
  preview: string
  results: string[] | ContentIdea[]
}

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
}

const sparkleVariants = {
  initial: { scale: 0, opacity: 0, rotate: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 0.8],
    rotate: [0, 180, 360],
    transition: { duration: 2, repeat: Infinity, repeatDelay: 3 },
  },
}

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
}

/* ─── Type Selector Config ─── */

const GENERATION_TYPES: {
  type: GenerationType
  label: string
  description: string
  icon: typeof MessageSquare
}[] = [
  {
    type: 'caption',
    label: 'Captions',
    description: 'Generate social media captions',
    icon: MessageSquare,
  },
  {
    type: 'hashtags',
    label: 'Hashtags',
    description: 'Generate relevant hashtags',
    icon: Hash,
  },
  {
    type: 'ideas',
    label: 'Content Ideas',
    description: 'Get creative post ideas',
    icon: Lightbulb,
  },
]

/* ─── Helpers ─── */

function typeLabel(type: GenerationType) {
  return GENERATION_TYPES.find((t) => t.type === type)?.label ?? type
}

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function platformBadgeClass(platform: string) {
  const lower = platform.toLowerCase()
  if (lower.includes('instagram')) return 'platform-instagram'
  if (lower.includes('facebook')) return 'platform-facebook'
  return 'platform-both'
}

/* ─── Sub-Components ─── */

function TypeSelector({
  selected,
  onSelect,
}: {
  selected: GenerationType | null
  onSelect: (type: GenerationType) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {GENERATION_TYPES.map(({ type, label, description, icon: Icon }) => {
        const isActive = selected === type
        return (
          <motion.button
            key={type}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(type)}
            className={`
              relative group text-left rounded-xl border-2 p-4 sm:p-5 transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? 'border-rose-gold bg-rose-gold/5 shadow-lg shadow-rose-gold/10'
                  : 'border-border/60 bg-card hover:border-rose-gold/30 hover:shadow-md hover:shadow-rose-gold/5'
              }
            `}
          >
            {/* Glow effect for active */}
            {isActive && (
              <motion.div
                layoutId="type-glow"
                className="absolute inset-0 rounded-xl bg-rose-gold/5 pointer-events-none"
                style={{
                  boxShadow:
                    '0 0 20px rgba(183, 110, 121, 0.15), inset 0 0 20px rgba(183, 110, 121, 0.05)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <div className="relative z-10 space-y-2.5">
              <div
                className={`
                  inline-flex items-center justify-center h-10 w-10 rounded-lg transition-colors duration-300
                  ${isActive ? 'bg-rose-gold text-white' : 'bg-secondary text-muted-foreground group-hover:bg-rose-gold/10 group-hover:text-rose-gold'}
                `}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className={`font-semibold text-sm transition-colors duration-300 ${
                    isActive ? 'text-rose-gold' : 'text-foreground'
                  }`}
                >
                  {label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
            </div>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="active-dot"
                className="absolute top-3 right-3 h-2 w-2 rounded-full bg-rose-gold"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-rose-gold" />
        </div>
        {/* Decorative floating sparkles */}
        <motion.div
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="h-4 w-4 text-champagne fill-champagne" />
        </motion.div>
        <motion.div
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1.5 }}
          className="absolute -bottom-1 -left-3"
        >
          <Sparkles className="h-3 w-3 text-rose-gold fill-rose-gold" />
        </motion.div>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Start by selecting a content type above
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Select a product from your gallery for tailored content, or provide custom context to guide
        the AI.
      </p>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <Wand2 className="h-3.5 w-3.5 text-rose-gold" />
        <span>Powered by AI for your 925 Silver Collection</span>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton({ type }: { type: GenerationType }) {
  if (type === 'caption') {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (type === 'hashtags') {
    return (
      <Card className="border-border/40">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CaptionResults({ results }: { results: string[] }) {
  const { toast } = useToast()

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: 'Caption copied to clipboard.' })
  }

  function handleUseInPost(text: string) {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Ready to schedule!',
      description: 'Caption copied. Navigate to Schedule to create your post.',
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
      {results.map((caption, i) => (
        <motion.div key={i} variants={itemVariants}>
          <Card className="card-hover border-border/40 hover:border-rose-gold/30 group">
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                {caption}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(caption)}
                  className="h-8 text-xs gap-1.5 rounded-full border-border/60 hover:border-rose-gold/40 hover:text-rose-gold"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUseInPost(caption)}
                  className="h-8 text-xs gap-1.5 rounded-full bg-rose-gold hover:bg-rose-gold/90 text-white"
                >
                  <CalendarPlus className="h-3 w-3" />
                  Use in Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

function HashtagResults({ results }: { results: string[] }) {
  const { toast } = useToast()
  const { addHashtagSet } = useAppStore()

  function handleCopyTag(tag: string) {
    navigator.clipboard.writeText(tag)
    toast({ title: 'Copied!', description: `${tag} copied to clipboard.` })
  }

  function handleCopyAll() {
    const allTags = results.join(' ')
    navigator.clipboard.writeText(allTags)
    toast({ title: 'All copied!', description: 'All hashtags copied to clipboard.' })
  }

  function handleSaveAsSet() {
    const newSet: HashtagSet = {
      id: crypto.randomUUID(),
      name: `AI Generated - ${new Date().toLocaleDateString()}`,
      hashtags: results,
      category: 'ai-generated',
      usageCount: 0,
    }
    addHashtagSet(newSet)
    toast({
      title: 'Saved!',
      description: 'Hashtag set saved to your collection.',
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="border-border/40">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <motion.div
            variants={containerVariants}
            className="flex flex-wrap gap-2"
          >
            {results.map((tag, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopyTag(tag)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                  bg-rose-gold/10 text-rose-gold border border-rose-gold/20
                  hover:bg-rose-gold/20 hover:border-rose-gold/40 transition-colors duration-200 cursor-pointer"
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyAll}
              className="h-8 text-xs gap-1.5 rounded-full border-border/60 hover:border-rose-gold/40 hover:text-rose-gold"
            >
              <Copy className="h-3 w-3" />
              Copy All
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAsSet}
              className="h-8 text-xs gap-1.5 rounded-full bg-rose-gold hover:bg-rose-gold/90 text-white"
            >
              <Bookmark className="h-3 w-3" />
              Save as Set
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function IdeasResults({ results }: { results: ContentIdea[] }) {
  const { toast } = useToast()

  function handleCreatePost(idea: ContentIdea) {
    const text = `${idea.title}\n\n${idea.description}`
    navigator.clipboard.writeText(text)
    toast({
      title: 'Ready to create!',
      description: `Idea copied. Navigate to Schedule to create your ${idea.platform} post.`,
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
      {results.map((idea, i) => (
        <motion.div key={i} variants={itemVariants}>
          <Card className="card-hover border-border/40 hover:border-rose-gold/30 group">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-rose-gold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {idea.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {idea.description}
                  </p>
                </div>
                <Badge
                  className={`shrink-0 text-[10px] px-2 py-0.5 border-0 ${platformBadgeClass(idea.platform)}`}
                >
                  {idea.platform}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => handleCreatePost(idea)}
                className="h-8 text-xs gap-1.5 rounded-full bg-rose-gold hover:bg-rose-gold/90 text-white"
              >
                <CalendarPlus className="h-3 w-3" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ─── Main Component ─── */

export default function AIStudio() {
  const { products } = useAppStore()
  const { toast } = useToast()

  // Form state
  const [selectedType, setSelectedType] = useState<GenerationType | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [customContext, setCustomContext] = useState('')

  // Loading & results
  const [isGenerating, setIsGenerating] = useState(false)
  const [captionResults, setCaptionResults] = useState<string[] | null>(null)
  const [hashtagResults, setHashtagResults] = useState<string[] | null>(null)
  const [ideasResults, setIdeasResults] = useState<ContentIdea[] | null>(null)

  // Generation history
  const [history, setHistory] = useState<GenerationRecord[]>([])

  // Derived product info
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleGenerate = useCallback(async () => {
    if (!selectedType) return

    setIsGenerating(true)
    // Clear previous results for the selected type
    if (selectedType === 'caption') setCaptionResults(null)
    if (selectedType === 'hashtags') setHashtagResults(null)
    if (selectedType === 'ideas') setIdeasResults(null)

    try {
      const body: Record<string, string> = {
        type: selectedType,
      }
      if (selectedProduct) {
        body.productName = selectedProduct.name
        body.category = selectedProduct.category
      }
      if (customContext.trim()) {
        body.context = customContext.trim()
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.details || errorData?.error || 'Generation failed')
      }

      const data = await response.json()
      const results = data.result

      // Determine results type and store
      if (selectedType === 'caption' && Array.isArray(results)) {
        const captions = results.filter((r: unknown) => typeof r === 'string')
        setCaptionResults(captions)
        addHistory(selectedType, captions)
      } else if (selectedType === 'hashtags' && Array.isArray(results)) {
        const tags = results.filter((r: unknown) => typeof r === 'string')
        setHashtagResults(tags)
        addHistory(selectedType, tags)
      } else if (selectedType === 'ideas' && Array.isArray(results)) {
        const ideas = results.filter(
          (r: unknown): r is ContentIdea =>
            typeof r === 'object' && r !== null && 'title' in r && 'description' in r
        )
        setIdeasResults(ideas)
        addHistory(selectedType, ideas as unknown as string[])
      } else {
        toast({
          title: 'Unexpected format',
          description: 'AI returned an unexpected format. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Generation failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [selectedType, selectedProduct, customContext, toast])

  function addHistory(type: GenerationType, results: string[]) {
    const preview =
      typeof results[0] === 'string'
        ? (results[0] as string).slice(0, 60)
        : 'Content ideas generated'
    setHistory((prev) => [
      {
        id: crypto.randomUUID(),
        type,
        timestamp: new Date(),
        preview: preview + ((results[0] as string)?.length > 60 ? '...' : ''),
        results,
      },
      ...prev,
    ].slice(0, 3))
  }

  // Determine what results to show
  const activeResults = selectedType === 'caption'
    ? captionResults
    : selectedType === 'hashtags'
      ? hashtagResults
      : ideasResults
  const hasResults = activeResults !== null && (Array.isArray(activeResults) ? activeResults.length > 0 : false)
  const hasAnyResults = captionResults !== null || hashtagResults !== null || ideasResults !== null

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div variants={floatVariants} initial="initial" animate="animate">
            <Sparkles className="h-8 w-8 text-rose-gold" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            AI Studio
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-rose-gold/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-rose-gold" />
          <span className="h-px w-12 bg-rose-gold/40" />
        </div>
        <p className="text-sm text-muted-foreground tracking-wide">
          Generate captivating content with AI
        </p>
      </motion.div>

      {/* ── Generation Type Selector ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <TypeSelector selected={selectedType} onSelect={setSelectedType} />
      </motion.div>

      {/* ── Context Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-border/40">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Product Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Link a Product{' '}
                <span className="normal-case tracking-normal">(optional)</span>
              </label>
              {products.length > 0 ? (
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="w-full bg-card border-border/60 focus:border-rose-gold/50 focus:ring-rose-gold/20">
                    <SelectValue placeholder="Select a product from your gallery..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No products in your gallery yet. Upload products for tailored content.
                </p>
              )}
              {selectedProduct && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Badge className="bg-rose-gold/10 text-rose-gold border-rose-gold/20 text-[10px]">
                    {selectedProduct.category}
                  </Badge>
                  {selectedProduct.price != null && (
                    <span className="text-rose-gold font-medium">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Custom Context */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Custom Context
              </label>
              <Textarea
                placeholder="Describe the mood, occasion, or style you want the content to reflect..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                className="min-h-[80px] bg-card border-border/60 focus:border-rose-gold/50 focus:ring-rose-gold/20 resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!selectedType || isGenerating}
              className={`
                w-full rounded-xl h-12 text-sm font-semibold gap-2 transition-all duration-300
                ${
                  selectedType && !isGenerating
                    ? 'rose-gold-gradient text-white shadow-lg shadow-rose-gold/25 hover:shadow-xl hover:shadow-rose-gold/30 hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate {selectedType ? typeLabel(selectedType) : 'Content'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Results Section ── */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-4 w-4 text-rose-gold animate-spin" />
              <h2 className="text-lg font-semibold text-foreground">
                Generating {selectedType ? typeLabel(selectedType) : ''}...
              </h2>
            </div>
            <LoadingSkeleton type={selectedType!} />
          </motion.div>
        ) : hasResults ? (
          <motion.div
            key={`results-${selectedType}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-rose-gold" />
              <h2 className="text-lg font-semibold text-foreground">
                Generated {selectedType ? typeLabel(selectedType) : 'Results'}
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            {selectedType === 'caption' && captionResults && (
              <CaptionResults results={captionResults} />
            )}
            {selectedType === 'hashtags' && hashtagResults && (
              <HashtagResults results={hashtagResults} />
            )}
            {selectedType === 'ideas' && ideasResults && (
              <IdeasResults results={ideasResults} />
            )}
          </motion.div>
        ) : !hasAnyResults ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Generation History ── */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Generations
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-2">
            {history.map((record) => (
              <Collapsible key={record.id}>
                <Card className="border-border/30 overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                        <Badge className="bg-rose-gold/10 text-rose-gold border-rose-gold/20 text-[10px] shrink-0">
                          {typeLabel(record.type)}
                        </Badge>
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {record.preview}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTimestamp(record.timestamp)}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </CardContent>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 border-t border-border/30">
                      <div className="pt-3">
                        {record.type === 'caption' && (
                          <CaptionResults results={record.results as string[]} />
                        )}
                        {record.type === 'hashtags' && (
                          <HashtagResults results={record.results as string[]} />
                        )}
                        {record.type === 'ideas' && (
                          <IdeasResults results={record.results as ContentIdea[]} />
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

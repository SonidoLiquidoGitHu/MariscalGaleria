'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Plus,
  X,
  Copy,
  Trash2,
  Send,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  HashIcon,
  Crown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { useAppStore, type HashtagSet } from '@/lib/store'
import { DEMO_HASHTAGS } from '@/lib/demo-data'
import { useToast } from '@/hooks/use-toast'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'luxury', label: 'Lujo' },
  { value: 'rings', label: 'Anillos' },
  { value: 'necklaces', label: 'Collares' },
  { value: 'bracelets', label: 'Pulseras' },
  { value: 'earrings', label: 'Aretes' },
  { value: 'trending', label: 'Tendencias' },
]

const TRENDING_SUGGESTIONS = [
  '#925Silver',
  '#SilverJewelry2025',
  '#JewelryGram',
  '#MinimalistStyle',
  '#HandcraftedJewelry',
  '#SilverStack',
  '#JewelryOfTheDay',
  '#LuxuryOnABudget',
  '#RingStack',
  '#LayeredNecklace',
  '#StatementEarrings',
  '#TrendAlert',
  '#JewelryDesign',
  '#Silversmith',
  '#EverydayElegance',
  '#GiftIdeas',
]

export default function Hashtags() {
  const { hashtagSets, addHashtagSet, deleteHashtagSet } = useAppStore()
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [newHashtag, setNewHashtag] = useState('')
  const [newHashtags, setNewHashtags] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Initialize with demo data if store is empty
  useEffect(() => {
    if (hashtagSets.length === 0) {
      DEMO_HASHTAGS.forEach((set) => {
        addHashtagSet(set as HashtagSet)
      })
    }
  }, [])

  // Quick stats
  const totalSets = hashtagSets.length
  const totalUniqueHashtags = new Set(hashtagSets.flatMap((s) => s.hashtags)).size
  const mostUsedSet = hashtagSets.reduce(
    (max, s) => (s.usageCount > (max?.usageCount ?? 0) ? s : max),
    null as HashtagSet | null
  )

  // Add hashtag to form
  const handleAddHashtag = () => {
    const tag = newHashtag.trim()
    if (!tag) return
    const formatted = tag.startsWith('#') ? tag : `#${tag}`
    if (newHashtags.includes(formatted)) {
      toast({ title: 'Duplicado', description: 'Este hashtag ya fue agregado.' })
      return
    }
    setNewHashtags((prev) => [...prev, formatted])
    setNewHashtag('')
  }

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddHashtag()
    }
  }

  const removeNewHashtag = (tag: string) => {
    setNewHashtags((prev) => prev.filter((t) => t !== tag))
  }

  // Save new set
  const handleSaveSet = () => {
    if (!newName.trim()) {
      toast({ title: 'Nombre requerido', description: 'Por favor ingresa un nombre para este set.' })
      return
    }
    if (newHashtags.length === 0) {
      toast({ title: 'Hashtags requeridos', description: 'Agrega al menos un hashtag.' })
      return
    }
    addHashtagSet({
      id: Date.now().toString(),
      name: newName.trim(),
      hashtags: newHashtags,
      category: newCategory,
      usageCount: 0,
    })
    toast({ title: '¡Set creado!', description: `"${newName}" ha sido guardado.` })
    setNewName('')
    setNewCategory('general')
    setNewHashtags([])
    setNewHashtag('')
    setShowForm(false)
  }

  // Copy all hashtags
  const handleCopyAll = async (hashtags: string[], name: string) => {
    try {
      await navigator.clipboard.writeText(hashtags.join(' '))
      toast({ title: '¡Copiado!', description: `${hashtags.length} hashtags de "${name}" copiados al portapapeles.` })
    } catch {
      toast({ title: 'Error al copiar', description: 'No se pudo copiar al portapapeles.' })
    }
  }

  // Use in post
  const handleUseInPost = (name: string) => {
    toast({ title: 'Hashtags agregados', description: `Hashtags de "${name}" agregados al compositor de publicaciones.` })
  }

  // Delete set
  const handleConfirmDelete = (id: string) => {
    deleteHashtagSet(id)
    setDeleteTarget(null)
    toast({ title: 'Set eliminado', description: 'El set de hashtags ha sido eliminado.' })
  }

  // Add trending tag to new set form
  const handleAddTrendingTag = (tag: string) => {
    if (!showForm) setShowForm(true)
    if (!newHashtags.includes(tag)) {
      setNewHashtags((prev) => [...prev, tag])
    }
    toast({ title: 'Etiqueta agregada', description: `${tag} agregada a tu nuevo set.` })
  }

  const getCategoryLabel = (value?: string) => {
    return CATEGORIES.find((c) => c.value === value)?.label ?? value ?? 'General'
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <span className="text-rose-gold">Gestor de</span> Hashtags
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Organiza y reutiliza tus mejores hashtags
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rose-gold-gradient text-white shadow-md hover:opacity-90 transition-opacity"
        >
          {showForm ? <ChevronUp className="size-4" /> : <Plus className="size-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Set'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="card-hover border-l-4 border-l-rose-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-rose-gold/10 flex items-center justify-center shrink-0">
                <HashIcon className="size-5 text-rose-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total de Sets de Hashtags</p>
                <p className="text-xl font-bold">{totalSets}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-hover border-l-4 border-l-champagne">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-champagne/20 flex items-center justify-center shrink-0">
                <Sparkles className="size-5 text-rose-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Hashtags Únicos</p>
                <p className="text-xl font-bold">{totalUniqueHashtags}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="card-hover border-l-4 border-l-silver">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-silver/15 flex items-center justify-center shrink-0">
                <Crown className="size-5 text-rose-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Set Más Usado</p>
                <p className="text-xl font-bold truncate max-w-[140px]">
                  {mostUsedSet?.name ?? '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create New Set Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-rose-gold/20 shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="size-5 text-rose-gold" />
                  Crear Nuevo Set
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <Input
                      placeholder="ej. Colección Navideña"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Agregar Hashtags</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe un hashtag y presiona Enter"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyDown={handleHashtagKeyDown}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddHashtag}
                      className="shrink-0 border-rose-gold/30 text-rose-gold hover:bg-rose-gold/10"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {newHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {newHashtags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-gold/15 text-rose-gold px-3 py-1 text-xs font-medium"
                        >
                          {tag}
                          <button
                            onClick={() => removeNewHashtag(tag)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <Button
                  onClick={handleSaveSet}
                  className="rose-gold-gradient text-white shadow-md hover:opacity-90 transition-opacity"
                >
                  <Hash className="size-4" />
                  Guardar Set
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hashtag Sets Grid */}
      {hashtagSets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Hash className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Aún no hay sets de hashtags</p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              Crea tu primer set para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {hashtagSets.map((set, index) => (
              <motion.div
                key={set.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <Card className="card-hover h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-base truncate">{set.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-rose-gold/10 text-rose-gold border-rose-gold/20"
                          >
                            {getCategoryLabel(set.category)}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            <Hash className="size-3" />
                            {set.hashtags.length} etiquetas
                          </Badge>
                          {set.usageCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-champagne/25 text-rose-gold border-champagne/30"
                            >
                              <BarChart3 className="size-3" />
                              {set.usageCount} usos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    {/* Hashtag Grid */}
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {set.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-secondary/70 text-secondary-foreground px-2 py-0.5 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 flex-1 border-rose-gold/20 text-rose-gold hover:bg-rose-gold/10 hover:text-rose-gold"
                        onClick={() => handleCopyAll(set.hashtags, set.name)}
                      >
                        <Copy className="size-3" />
                        Copiar Todo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 flex-1"
                        onClick={() => handleUseInPost(set.name)}
                      >
                        <Send className="size-3" />
                        Usar en Publicación
                      </Button>
                      <Dialog
                        open={deleteTarget === set.id}
                        onOpenChange={(open) => setDeleteTarget(open ? set.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>¿Eliminar &quot;{set.name}&quot;?</DialogTitle>
                            <DialogDescription>
                              Esta acción no se puede deshacer. Este set de hashtags y todas sus{' '}
                              {set.hashtags.length} etiquetas serán eliminados permanentemente.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" size="sm">
                                Cancelar
                              </Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleConfirmDelete(set.id)}
                            >
                              Eliminar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Trending Suggestions */}
      <Card className="border-rose-gold/15 overflow-hidden relative">
        <div className="absolute inset-0 shimmer-border pointer-events-none" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="size-5 text-rose-gold" />
            <span>
              Etiquetas en <span className="text-rose-gold">Tendencia</span>
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Haz clic en cualquier etiqueta para agregarla a un nuevo set
          </p>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-wrap gap-2">
            {TRENDING_SUGGESTIONS.map((tag, i) => (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddTrendingTag(tag)}
                className="inline-flex items-center gap-1 rounded-full border border-rose-gold/20 bg-rose-gold/5 px-3 py-1.5 text-xs font-medium text-rose-gold hover:bg-rose-gold/15 hover:border-rose-gold/40 transition-colors cursor-pointer"
              >
                <TrendingUp className="size-3 opacity-60" />
                {tag}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudUpload,
  X,
  Play,
  Video,
  ImageIcon,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAppStore, type Product } from '@/lib/store'

interface FilePreview {
  id: string
  file: File
  url: string
  type: 'image' | 'video'
  name: string
  size: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const CATEGORIES = [
  'Anillos',
  'Collares',
  'Pulseras',
  'Aretes',
  'Dijes',
  'Sets',
]

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const addProduct = useAppStore((s) => s.addProduct)

  const [files, setFiles] = useState<FilePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    isFeatured: false,
    videoUrl: '',
  })

  // --- File handling ---
  const processFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: FilePreview[] = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video/') ? 'video' : 'image',
        name: f.name,
        size: formatFileSize(f.size),
      }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.url))
    setFiles([])
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      sku: '',
      isFeatured: false,
      videoUrl: '',
    })
    setProgress(0)
  }, [files])

  // --- Drag events ---
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDragging) setIsDragging(true)
    },
    [isDragging]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files)
    },
    [processFiles]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) processFiles(e.target.files)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [processFiles]
  )

  // --- Submit ---
  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      toast({
        title: 'Información faltante',
        description: 'Por favor ingresa el nombre del producto.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.category) {
      toast({
        title: 'Información faltante',
        description: 'Por favor selecciona una categoría.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Simulate variable speed
        const increment = prev < 30 ? 5 : prev < 70 ? 3 : prev < 90 ? 4 : 2
        return Math.min(prev + increment, 100)
      })
    }, 120)

    // Wait for "upload" to finish
    const checkDone = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(checkDone)

          const product: Product = {
            id: Date.now().toString(),
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            price: formData.price ? parseFloat(formData.price) : undefined,
            category: formData.category,
            sku: formData.sku.trim() || undefined,
            isFeatured: formData.isFeatured,
            isActive: true,
            media: files.map((f) => f.url),
            videoUrl: formData.videoUrl.trim() || undefined,
            createdAt: new Date().toISOString(),
          }

          addProduct(product)

          toast({
            title: '✨ Colección actualizada',
            description: `"${formData.name}" ha sido agregada a tu galería de plata.`,
          })

          setIsUploading(false)

          // Clean up object URLs and reset
          files.forEach((f) => URL.revokeObjectURL(f.url))
          setFiles([])
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            sku: '',
            isFeatured: false,
            videoUrl: '',
          })
          setProgress(0)

          return 0
        }
        return current
      })
    }, 150)
  }, [formData, files, addProduct, toast])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Subir Colección
        </h1>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-rose-gold/40" />
          <Sparkles className="size-4 text-rose-gold" />
          <span className="h-px flex-1 max-w-32 bg-gradient-to-r from-rose-gold/40 via-rose-gold to-rose-gold/40" />
          <Sparkles className="size-4 text-rose-gold" />
          <span className="h-px w-12 bg-rose-gold/40" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Agrega nuevas piezas a tu galería de plata
        </p>
      </motion.div>

      {/* ── Upload Zone ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          className={`relative cursor-pointer overflow-hidden border-2 border-dashed transition-colors duration-300 ${
            isDragging
              ? 'dropzone-active border-rose-gold bg-rose-gold/5'
              : 'border-border hover:border-rose-gold/60'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 sm:py-20">
            <motion.div
              animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex size-16 items-center justify-center rounded-full bg-rose-gold/10"
            >
              <CloudUpload className="size-8 text-rose-gold" />
            </motion.div>

            <p className="text-base font-medium text-foreground">
              Arrastra y suelta tus imágenes y videos aquí
            </p>
            <p className="text-sm text-muted-foreground">
              o{' '}
              <span className="cursor-pointer font-medium text-rose-gold underline underline-offset-4 hover:text-rose-gold/80">
                haz clic para explorar
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              JPG, PNG, WebP, MP4, MOV
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </CardContent>

          {/* Decorative corner accents */}
          <span className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-rose-gold/20 rounded-tl-sm" />
          <span className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-rose-gold/20 rounded-tr-sm" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-rose-gold/20 rounded-bl-sm" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-rose-gold/20 rounded-br-sm" />
        </Card>
      </motion.div>

      {/* ── File Previews ── */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Archivos Seleccionados
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({files.length})
                </span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
              >
                Eliminar todo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {files.map((f, idx) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.05,
                      layout: { duration: 0.2 },
                    }}
                  >
                    <Card className="group relative overflow-hidden border border-border/60 transition-shadow hover:shadow-md">
                      {/* Thumbnail */}
                      <div className="relative aspect-square bg-muted">
                        {f.type === 'image' ? (
                          <img
                            src={f.url}
                            alt={f.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-foreground/5 to-foreground/10">
                            <Video className="size-8 text-rose-gold/70" />
                            <Play className="size-5 text-rose-gold" />
                          </div>
                        )}

                        {/* VIDEO badge */}
                        {f.type === 'video' && (
                          <Badge className="absolute left-2 top-2 bg-rose-gold text-white border-none text-[10px] px-1.5 py-0">
                            VIDEO
                          </Badge>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(f.id)
                          }}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive"
                        >
                          <X className="size-3.5" />
                        </button>

                        {/* Play overlay for video */}
                        {f.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex size-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                              <Play className="size-4 text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-foreground">
                          {f.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {f.size}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Details Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/60">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-rose-gold" />
              <h2 className="text-base font-semibold text-foreground">
                Detalles del Producto
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="product-name">
                  Nombre del Producto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-name"
                  placeholder="ej. Anillo Luna Celestial"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="border-border/60 focus-visible:ring-rose-gold/30"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="product-desc">Descripción</Label>
                <Textarea
                  id="product-desc"
                  placeholder="Describe la artesanía, los materiales y la inspiración..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="resize-none border-border/60 focus-visible:ring-rose-gold/30"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Precio ($)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, price: e.target.value }))
                  }
                  className="border-border/60 focus-visible:ring-rose-gold/30"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label>
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, category: v }))
                  }
                >
                  <SelectTrigger className="w-full border-border/60 focus:ring-rose-gold/30">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SKU */}
              <div className="space-y-1.5">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  placeholder="e.g. SR-925-R001"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, sku: e.target.value }))
                  }
                  className="border-border/60 focus-visible:ring-rose-gold/30"
                />
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <Label htmlFor="video-url">URL de Video</Label>
                <Input
                  id="video-url"
                  placeholder="https://..."
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, videoUrl: e.target.value }))
                  }
                  className="border-border/60 focus-visible:ring-rose-gold/30"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, isFeatured: v }))
                  }
                  className="data-[state=checked]:bg-rose-gold"
                />
                <Label className="cursor-pointer">Marcar como Destacada</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Progress ── */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subiendo...</span>
              <span className="font-medium text-rose-gold">
                {progress}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-rose-gold/10 [&>[data-slot=progress-indicator]]:bg-rose-gold"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action Buttons ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
      >
        <Button
          variant="ghost"
          onClick={clearAll}
          disabled={isUploading}
          className="text-muted-foreground hover:text-destructive"
        >
          Limpiar Todo
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isUploading}
          className="rose-gold-gradient text-white border-0 shadow-lg shadow-rose-gold/20 hover:shadow-rose-gold/40 transition-shadow"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Subiendo...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CloudUpload className="size-4" />
              Subir y Guardar
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

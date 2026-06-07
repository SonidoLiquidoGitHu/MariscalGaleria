'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  CloudUpload,
  X,
  Play,
  Video,
  ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Star,
  ToggleLeft,
  Pencil,
  Check,
  Gem,
  Save,
  Images,
  LayoutGrid,
  Share2,
  Facebook,
  Instagram,
  Link2,
  Unlink,
  ExternalLink,
  AlertCircle,
  Key,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAppStore, type Product, type Discipline } from '@/lib/store'
import { CATEGORIES_BY_DISCIPLINE, DISCIPLINES } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────
const TAGLINE_JEWELRY = 'joyería de autor, plata 925, Zacatecas México'
const TAGLINE_GENERAL = 'arte de autor, Zacatecas México'

// ─── File preview interface ──────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen() {
  const { loginAdmin } = useAppStore()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const success = loginAdmin(username, password)
      if (!success) {
        setError('Usuario o contraseña incorrectos')
        toast({ title: 'Acceso denegado', description: 'Credenciales inválidas', variant: 'destructive' })
      } else {
        toast({ title: 'Bienvenido', description: 'Sesión de administrador iniciada' })
      }
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-rose-gold/20 shadow-xl shadow-rose-gold/5 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-gold/10 via-champagne/10 to-rose-gold/5 p-8 text-center border-b border-rose-gold/10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-gold/20"
            >
              <Shield className="h-8 w-8 text-rose-gold" />
            </motion.div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Administración
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Galería Mariscal — Acceso restringido
            </p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="admin-user" className="text-sm font-medium">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-user"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-border/60 focus-visible:ring-rose-gold/30 focus-visible:border-rose-gold/50"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="admin-pass" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-border/60 focus-visible:ring-rose-gold/30 focus-visible:border-rose-gold/50"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full rose-gold-gradient text-white shadow-lg shadow-rose-gold/20 hover:shadow-rose-gold/40 transition-shadow h-11"
              >
                {isLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Iniciar Sesión
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SORTABLE PRODUCT ROW
// ═══════════════════════════════════════════════════════════════════════════════
function SortableProductRow({
  product,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: {
  product: Product
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onToggleActive: () => void
  onToggleFeatured: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const cats = CATEGORIES_BY_DISCIPLINE[product.discipline || 'joyeria']
  const categoryLabel = cats.find((c) => c.value === product.category)?.label ?? product.category
  const discLabel = DISCIPLINES.find((d) => d.value === product.discipline)?.label ?? product.discipline

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all',
        isDragging && 'shadow-lg shadow-rose-gold/10 border-rose-gold/40 z-50',
        !product.isActive && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-rose-gold transition-colors touch-none"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Position number */}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {index + 1}
      </span>

      {/* Thumbnail */}
      {product.media[0] ? (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
          <img src={product.media[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
          <Gem className="h-5 w-5 text-muted-foreground/50" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
          {product.isFeatured && <Star className="h-3.5 w-3.5 text-rose-gold fill-rose-gold shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className="bg-champagne/40 text-rose-gold border-0 text-[10px] px-1.5 py-0">
            {discLabel}
          </Badge>
          <Badge className="bg-rose-gold/10 text-rose-gold border-0 text-[10px] px-1.5 py-0">
            {categoryLabel}
          </Badge>
          {product.price != null && (
            <span className="text-xs text-rose-gold font-medium">
              ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-rose-gold hover:bg-rose-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mover arriba"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-rose-gold hover:bg-rose-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mover abajo"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onToggleFeatured}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            product.isFeatured ? 'text-rose-gold bg-rose-gold/10' : 'text-muted-foreground hover:text-rose-gold hover:bg-rose-gold/10'
          )}
          aria-label={product.isFeatured ? 'Quitar destacado' : 'Marcar destacado'}
        >
          <Star className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onToggleActive}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            product.isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50'
          )}
          aria-label={product.isActive ? 'Ocultar pieza' : 'Mostrar pieza'}
        >
          <ToggleLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Eliminar pieza"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE UPLOAD SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function AdminUpload() {
  const { addProduct, products } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<FilePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [adminDiscipline, setAdminDiscipline] = useState<Discipline>('joyeria')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    isFeatured: false,
    isActive: true,
    videoUrl: '',
  })

  const adminCategories = CATEGORIES_BY_DISCIPLINE[adminDiscipline].filter(c => c.value !== 'all')

  // File handlers
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

  const clearAllFiles = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.url))
    setFiles([])
  }, [files])

  const clearForm = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.url))
    setFiles([])
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      sku: '',
      isFeatured: false,
      isActive: true,
      videoUrl: '',
    })
    setProgress(0)
  }, [files])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }, [isDragging])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [processFiles])

  // Submit
  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      toast({ title: 'Información faltante', description: 'Por favor ingresa el nombre del producto.', variant: 'destructive' })
      return
    }
    if (!formData.category) {
      toast({ title: 'Información faltante', description: 'Por favor selecciona una categoría.', variant: 'destructive' })
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
        const increment = prev < 30 ? 5 : prev < 70 ? 3 : prev < 90 ? 4 : 2
        return Math.min(prev + increment, 100)
      })
    }, 120)

    const checkDone = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(checkDone)

          const tagline = adminDiscipline === 'joyeria' ? TAGLINE_JEWELRY : TAGLINE_GENERAL
          const desc = formData.description.trim()
            ? `${formData.description.trim()} — ${tagline}`
            : tagline

          const product: Product = {
            id: Date.now().toString(),
            name: formData.name.trim(),
            description: desc,
            price: formData.price ? parseFloat(formData.price) : undefined,
            category: formData.category,
            discipline: adminDiscipline,
            sku: formData.sku.trim() || undefined,
            isFeatured: formData.isFeatured,
            isActive: formData.isActive,
            media: files.map((f) => f.url),
            videoUrl: formData.videoUrl.trim() || undefined,
            createdAt: new Date().toISOString(),
            sortOrder: products.length,
          }

          addProduct(product)
          toast({ title: 'Colección actualizada', description: `"${formData.name}" ha sido agregada a la galería.` })
          setIsUploading(false)
          clearForm()
          return 0
        }
        return current
      })
    }, 150)
  }, [formData, files, addProduct, toast, clearForm, products.length])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-gold/10">
          <CloudUpload className="h-5 w-5 text-rose-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Subir Nuevas Obras</h3>
          <p className="text-xs text-muted-foreground">Agrega obras de cualquier disciplina con múltiples archivos, video y detalles completos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload Zone + Previews — 3 columns */}
        <div className="lg:col-span-3 space-y-4">
          {/* Drop zone */}
          <Card
            className={cn(
              'cursor-pointer overflow-hidden border-2 border-dashed transition-colors duration-300',
              isDragging ? 'dropzone-active border-rose-gold bg-rose-gold/5' : 'border-border hover:border-rose-gold/60'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
              <motion.div
                animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex size-14 items-center justify-center rounded-full bg-rose-gold/10"
              >
                <CloudUpload className="size-7 text-rose-gold" />
              </motion.div>
              <p className="text-sm font-medium text-foreground">
                Arrastra y suelta tus imágenes y videos aquí
              </p>
              <p className="text-xs text-muted-foreground">
                o{' '}
                <span className="cursor-pointer font-medium text-rose-gold underline underline-offset-4 hover:text-rose-gold/80">
                  haz clic para explorar
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                JPG, PNG, WebP, MP4, MOV — Múltiples archivos permitidos
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
          </Card>

          {/* File previews */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Images className="h-4 w-4 text-rose-gold" />
                    Archivos Seleccionados
                    <Badge variant="secondary" className="text-[10px]">{files.length}</Badge>
                  </h4>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); clearAllFiles() }}>
                    Eliminar todo
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {files.map((f, idx) => (
                      <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                      >
                        <Card className="group relative overflow-hidden border border-border/60 transition-shadow hover:shadow-md">
                          <div className="relative aspect-square bg-muted">
                            {f.type === 'image' ? (
                              <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-foreground/5 to-foreground/10">
                                <Video className="size-7 text-rose-gold/70" />
                                <Play className="size-4 text-rose-gold" />
                              </div>
                            )}
                            {f.type === 'video' && (
                              <Badge className="absolute left-2 top-2 bg-rose-gold text-white border-none text-[10px] px-1.5 py-0">
                                VIDEO
                              </Badge>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                          <div className="p-2">
                            <p className="truncate text-[11px] font-medium text-foreground">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">{f.size}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress */}
          <AnimatePresence>
            {isUploading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subiendo...</span>
                  <span className="font-medium text-rose-gold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-rose-gold/10 [&>[data-slot=progress-indicator]]:bg-rose-gold" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product form — 2 columns */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="size-4 text-rose-gold" />
                Detalles del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Disciplina <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 flex-wrap">
                  {DISCIPLINES.map((disc) => (
                    <button
                      key={disc.value}
                      type="button"
                      onClick={() => {
                        setAdminDiscipline(disc.value)
                        setFormData((p) => ({ ...p, category: '' }))
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        adminDiscipline === disc.value
                          ? 'bg-rose-gold text-white shadow-md shadow-rose-gold/20'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {disc.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-name">Nombre de la Obra <span className="text-destructive">*</span></Label>
                <Input id="admin-name" placeholder="ej. Anillo Luna Celestial" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="border-border/60 focus-visible:ring-rose-gold/30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-desc">Descripción</Label>
                <Textarea id="admin-desc" placeholder="Describe la artesanía, materiales e inspiración..." rows={3} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="resize-none border-border/60 focus-visible:ring-rose-gold/30" />
                <p className="text-[10px] text-muted-foreground">Se agregará automáticamente: "{adminDiscipline === 'joyeria' ? TAGLINE_JEWELRY : TAGLINE_GENERAL}"</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-price">Precio ($)</Label>
                  <Input id="admin-price" type="number" min="0" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} className="border-border/60 focus-visible:ring-rose-gold/30" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría <span className="text-destructive">*</span></Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="border-border/60 focus:ring-rose-gold/30"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {adminCategories.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-sku">SKU</Label>
                  <Input id="admin-sku" placeholder="ej. SR-925-R001" value={formData.sku} onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))} className="border-border/60 focus-visible:ring-rose-gold/30" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-video">URL de Video</Label>
                  <Input id="admin-video" placeholder="https://..." value={formData.videoUrl} onChange={(e) => setFormData((p) => ({ ...p, videoUrl: e.target.value }))} className="border-border/60 focus-visible:ring-rose-gold/30" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.isFeatured} onCheckedChange={(v) => setFormData((p) => ({ ...p, isFeatured: v }))} className="data-[state=checked]:bg-rose-gold" />
                  <Label className="text-xs cursor-pointer">Destacada</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))} className="data-[state=checked]:bg-emerald-500" />
                  <Label className="text-xs cursor-pointer">Visible</Label>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={clearForm} disabled={isUploading} className="text-muted-foreground hover:text-destructive text-xs">
                  Limpiar Todo
                </Button>
                <Button onClick={handleSubmit} disabled={isUploading || !formData.name.trim() || !formData.category} className="flex-1 rose-gold-gradient text-white border-0 shadow-lg shadow-rose-gold/20 hover:shadow-rose-gold/40 transition-shadow">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white" />
                      Subiendo...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="size-4" />
                      Guardar Pieza
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REORDER GALLERY SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ReorderGallery() {
  const { products, reorderProducts, updateProduct, deleteProduct } = useAppStore()
  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const sortedProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedProducts.findIndex((p) => p.id === active.id)
    const newIndex = sortedProducts.findIndex((p) => p.id === over.id)
    const newOrder = arrayMove(sortedProducts, oldIndex, newIndex)

    // Update sort orders
    const updated = newOrder.map((p, i) => ({ ...p, sortOrder: i }))
    reorderProducts(updated)
    toast({ title: 'Orden actualizado', description: 'El orden de las piezas ha sido guardado.' })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...sortedProducts]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    const updated = newOrder.map((p, i) => ({ ...p, sortOrder: i }))
    reorderProducts(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === sortedProducts.length - 1) return
    const newOrder = [...sortedProducts]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    const updated = newOrder.map((p, i) => ({ ...p, sortOrder: i }))
    reorderProducts(updated)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget)
      toast({ title: 'Pieza eliminada', description: 'La pieza ha sido removida de la colección.' })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-gold/10">
            <LayoutGrid className="h-5 w-5 text-rose-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ordenar Galería</h3>
            <p className="text-xs text-muted-foreground">Arrastra o usa las flechas para cambiar el orden de presentación</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {sortedProducts.length} piezas
        </Badge>
      </div>

      {sortedProducts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gem className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No hay piezas en la galería</p>
            <p className="text-xs text-muted-foreground/70">Sube piezas usando la sección de arriba</p>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedProducts.map((product, index) => (
                <SortableProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  total={sortedProducts.length}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onDelete={() => setDeleteTarget(product.id)}
                  onToggleActive={() => updateProduct(product.id, { isActive: !product.isActive })}
                  onToggleFeatured={() => updateProduct(product.id, { isFeatured: !product.isFeatured })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar Pieza
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta pieza? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-full">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL ACCOUNTS CONNECTION
// ═══════════════════════════════════════════════════════════════════════════════
interface SocialAccount {
  id: string
  platform: string
  accountId: string
  accountName: string
  accountPicture?: string | null
  pageId?: string | null
  igBusinessId?: string | null
  isConnected: boolean
  tokenExpiresAt?: string | null
  lastUsedAt?: string | null
  hasToken: boolean
}

function SocialAccounts() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [metaConfig, setMetaConfig] = useState<{ configured: boolean; appId?: string; appSecretSet?: boolean }>({ configured: false })
  const [appId, setAppId] = useState('')
  const [appSecret, setAppSecret] = useState('')
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts()
    fetchConfig()
    // Check for success/error params from OAuth callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('social_success')) {
      toast({ title: 'Cuentas conectadas', description: 'Tus cuentas de redes sociales han sido vinculadas correctamente.' })
      window.history.replaceState({}, '', '/admin')
    }
    if (params.get('social_error')) {
      toast({ title: 'Error de conexión', description: params.get('social_error') || 'No se pudieron vincular las cuentas.', variant: 'destructive' })
      window.history.replaceState({}, '', '/admin')
    }
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/social/accounts')
      const data = await res.json()
      setAccounts(data.accounts || [])
    } catch {
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/social/config')
      const data = await res.json()
      setMetaConfig(data)
      if (data.appId) setAppId(data.appId)
    } catch {
      // ignore
    }
  }

  const handleSaveConfig = async () => {
    if (!appId.trim() || !appSecret.trim()) {
      toast({ title: 'Campos requeridos', description: 'Ingresa el App ID y App Secret de Meta.', variant: 'destructive' })
      return
    }
    setIsSavingConfig(true)
    try {
      const res = await fetch('/api/social/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: appId.trim(), appSecret: appSecret.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Configuración guardada', description: 'Las credenciales de Meta han sido guardadas.' })
        fetchConfig()
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo guardar la configuración.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de conexión', description: 'No se pudo conectar con el servidor.', variant: 'destructive' })
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleConnect = (platform: string) => {
    // Redirect to Meta OAuth login
    window.location.href = `/api/social/meta/login?platform=${platform}`
  }

  const handleDisconnect = async (accountId: string) => {
    setDisconnectingId(accountId)
    try {
      const res = await fetch(`/api/social/meta/disconnect?accountId=${accountId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Cuenta desconectada', description: 'La cuenta ha sido desvinculada.' })
        fetchAccounts()
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo desconectar.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de conexión', variant: 'destructive' })
    } finally {
      setDisconnectingId(null)
    }
  }

  const fbAccounts = accounts.filter((a) => a.platform === 'facebook' && a.pageId)
  const igAccounts = accounts.filter((a) => a.platform === 'instagram')
  const personalFb = accounts.find((a) => a.platform === 'facebook' && !a.pageId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-gold/10">
          <Share2 className="h-5 w-5 text-rose-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Redes Sociales</h3>
          <p className="text-xs text-muted-foreground">Conecta tus cuentas de Facebook e Instagram para publicar automáticamente</p>
        </div>
      </div>

      {/* Step 1: Meta App Configuration */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="size-4 text-rose-gold" />
            Paso 1: Configurar App de Meta
          </CardTitle>
          <CardDescription className="text-xs">
            Necesitas crear una App en Meta for Developers para conectar tus cuentas.
            <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="ml-1 text-rose-gold underline underline-offset-2 inline-flex items-center gap-0.5">
              Crear App <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-champagne/20 border border-champagne/40 p-3">
            <p className="text-xs text-foreground/80 leading-relaxed">
              <strong>Instrucciones:</strong> Ve a Meta for Developers, crea una app de tipo "Business", agrega los productos
              "Facebook Login" y "Instagram Basic Display", configura la URL de redirección como:{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/social/meta/callback` : 'https://tudominio.com/api/social/meta/callback'}
              </code>
              , y copia el App ID y App Secret aquí.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="meta-app-id">App ID</Label>
              <Input
                id="meta-app-id"
                placeholder="123456789012345"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="border-border/60 focus-visible:ring-rose-gold/30 font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta-app-secret">App Secret</Label>
              <Input
                id="meta-app-secret"
                type="password"
                placeholder="abcdef123456..."
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="border-border/60 focus-visible:ring-rose-gold/30 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveConfig}
              disabled={isSavingConfig || !appId.trim() || !appSecret.trim()}
              className="rose-gold-gradient text-white border-0 shadow-md shadow-rose-gold/20"
            >
              {isSavingConfig ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <span className="flex items-center gap-2"><Save className="size-4" /> Guardar Configuración</span>
              )}
            </Button>
            {metaConfig.configured && (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                Configurado
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Connect Accounts */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="size-4 text-rose-gold" />
            Paso 2: Conectar Cuentas
          </CardTitle>
          <CardDescription className="text-xs">
            Inicia sesión con Facebook para vincular tus páginas e Instagram Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleConnect('both')}
            disabled={!metaConfig.configured}
            className="w-full sm:w-auto bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-0 shadow-md gap-2"
          >
            <Facebook className="h-4 w-4" />
            Conectar con Facebook
          </Button>

          {!metaConfig.configured && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Configura tu App de Meta primero para habilitar la conexión
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Connected Accounts */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Conectadas
            {accounts.length > 0 && (
              <Badge className="bg-rose-gold/10 text-rose-gold border-0 text-xs">{accounts.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-6 w-6 rounded-full border-2 border-rose-gold/30 border-t-rose-gold" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Share2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay cuentas conectadas</p>
              <p className="text-xs text-muted-foreground/70">Conecta tu Facebook para vincular tus páginas e Instagram</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Facebook Pages */}
              {fbAccounts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Facebook className="h-3.5 w-3.5" /> Páginas de Facebook
                  </h4>
                  {fbAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onDisconnect={handleDisconnect} isDisconnecting={disconnectingId === account.id} />
                  ))}
                </div>
              )}

              {/* Instagram Accounts */}
              {igAccounts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Instagram className="h-3.5 w-3.5" /> Instagram Business
                  </h4>
                  {igAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onDisconnect={handleDisconnect} isDisconnecting={disconnectingId === account.id} />
                  ))}
                </div>
              )}

              {/* Personal Facebook */}
              {personalFb && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Facebook className="h-3.5 w-3.5" /> Cuenta Personal
                  </h4>
                  <AccountCard account={personalFb} onDisconnect={handleDisconnect} isDisconnecting={disconnectingId === personalFb.id} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Requisitos para Instagram
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Tu cuenta de Instagram debe ser una <strong>cuenta Business o Creator</strong></li>
          <li>La cuenta de Instagram debe estar vinculada a una Página de Facebook</li>
          <li>La Meta App debe tener el producto "Instagram Graph API" agregado</li>
          <li>Para producción, la App debe pasar la revisión de Meta (App Review)</li>
          <li>En modo desarrollo, solo los testers de la App pueden usar las funciones de publicación</li>
        </ul>
      </div>
    </div>
  )
}

function AccountCard({ account, onDisconnect, isDisconnecting }: { account: SocialAccount; onDisconnect: (id: string) => void; isDisconnecting: boolean }) {
  const PlatformIcon = account.platform === 'instagram' ? Instagram : Facebook

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-all">
      {/* Avatar */}
      {account.accountPicture ? (
        <img src={account.accountPicture} alt={account.accountName} className="h-10 w-10 rounded-full object-cover border-2 border-border" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <PlatformIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{account.accountName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className={cn(
            'border-0 text-[10px] px-1.5 py-0',
            account.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-[#1877F2] text-white'
          )}>
            {account.platform === 'instagram' ? 'Instagram' : 'Facebook'}
          </Badge>
          {account.hasToken && (
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Conectada
            </span>
          )}
        </div>
      </div>

      {/* Disconnect button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDisconnect(account.id)}
        disabled={isDisconnecting}
        className="text-muted-foreground hover:text-destructive shrink-0 gap-1 text-xs"
      >
        {isDisconnecting ? (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        ) : (
          <><Unlink className="h-3.5 w-3.5" /> Desconectar</>
        )}
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const { isAdminAuthenticated, logoutAdmin } = useAppStore()
  const { toast } = useToast()

  const handleLogout = () => {
    logoutAdmin()
    toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión de administrador.' })
  }

  // Show login if not authenticated
  if (!isAdminAuthenticated) {
    return <LoginScreen />
  }

  // Authenticated admin panel
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl rose-gold-gradient shadow-md shadow-rose-gold/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="text-rose-gold">Administración</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Panel de control de Galería Mariscal
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 border-rose-gold/20 text-rose-gold hover:bg-rose-gold/10 hover:text-rose-gold"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="upload" className="gap-2 text-sm px-4 py-2">
            <CloudUpload className="h-4 w-4" />
            Subir Piezas
          </TabsTrigger>
          <TabsTrigger value="reorder" className="gap-2 text-sm px-4 py-2">
            <LayoutGrid className="h-4 w-4" />
            Ordenar Galería
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2 text-sm px-4 py-2">
            <Share2 className="h-4 w-4" />
            Redes Sociales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <AdminUpload />
        </TabsContent>

        <TabsContent value="reorder">
          <ReorderGallery />
        </TabsContent>

        <TabsContent value="social">
          <SocialAccounts />
        </TabsContent>
      </Tabs>
    </div>
  )
}

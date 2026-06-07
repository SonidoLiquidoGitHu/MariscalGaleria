'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Eye,
  Pencil,
  Share2,
  Star,
  Video,
  Gem,
  Trash2,
  X,
  Box,
  PenTool,
  Palette,
} from 'lucide-react'
import { useAppStore, type Product, type Discipline } from '@/lib/store'
import { DEMO_PRODUCTS, DISCIPLINES, CATEGORIES_BY_DISCIPLINE } from '@/lib/demo-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ─── Discipline icons ─── */
const DISCIPLINE_ICONS: Record<Discipline, React.ElementType> = {
  joyeria: Gem,
  escultura: Box,
  grabado: PenTool,
  pintura: Palette,
}

/* ─── Animation variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
}

const featuredVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
}

/* ─── Helpers ─── */

function categoryLabel(discipline: Discipline, value: string) {
  const cats = CATEGORIES_BY_DISCIPLINE[discipline]
  return cats.find((c) => c.value === value)?.label ?? value
}

function disciplineLabel(value: Discipline) {
  return DISCIPLINES.find((d) => d.value === value)?.label ?? value
}

function formatPrice(price?: number) {
  if (price == null) return ''
  return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

/* ─── Sub-components ─── */

function EmptyState({ discipline }: { discipline: Discipline }) {
  const Icon = DISCIPLINE_ICONS[discipline]
  const disciplineInfo = DISCIPLINES.find((d) => d.value === discipline)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-6">
        <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-12 w-12 text-rose-gold" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-champagne flex items-center justify-center">
          <Star className="h-3 w-3 text-rose-gold" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron obras</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        No encontramos {disciplineInfo?.label.toLowerCase() ?? 'piezas'} que coincida con tu búsqueda. Intenta ajustar los filtros o explora
        la colección completa.
      </p>
    </motion.div>
  )
}

/* ─── Product Card ─── */

function ProductCard({
  product,
  onDelete,
}: {
  product: Product
  onDelete: (p: Product) => void
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageUrl = product.media[0] || ''

  return (
    <motion.div variants={cardVariants} layout>
      <Card className="card-hover group relative overflow-hidden border border-transparent hover:border-rose-gold/40 transition-colors duration-400 bg-card">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Gem className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg bg-white/90 hover:bg-white text-foreground"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg bg-white/90 hover:bg-white text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg bg-white/90 hover:bg-white text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Category badge – top left */}
          <Badge className="absolute top-3 left-3 bg-rose-gold text-white hover:bg-rose-gold/90 border-0 text-[10px] font-medium px-2 py-0.5 shadow-sm">
            {categoryLabel(product.discipline, product.category)}
          </Badge>

          {/* Featured star – top right */}
          {product.isFeatured && (
            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-champagne flex items-center justify-center shadow-sm">
              <Star className="h-3.5 w-3.5 text-rose-gold fill-rose-gold" />
            </div>
          )}

          {/* Video indicator – bottom right */}
          {product.videoUrl && (
            <div className="absolute bottom-3 right-3 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Video className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-1">
              {product.name}
            </h3>
            <button
              onClick={() => onDelete(product)}
              className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              aria-label="Eliminar producto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {product.price != null && (
            <p className="text-sm font-semibold text-rose-gold">
              {formatPrice(product.price)}
            </p>
          )}
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── Featured Carousel Card ─── */

function FeaturedCard({ product }: { product: Product }) {
  const imageUrl = product.media[0] || ''

  return (
    <motion.div variants={featuredVariants} className="shrink-0 w-[260px] sm:w-[280px]">
      <Card className="card-hover group relative overflow-hidden border border-transparent hover:border-rose-gold/40 transition-colors duration-400 bg-card">
        {/* Shimmer border on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-lg shimmer-border opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Gem className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <Badge className="absolute top-3 left-3 bg-rose-gold text-white hover:bg-rose-gold/90 border-0 text-[10px] font-medium px-2 py-0.5 shadow-sm">
            {categoryLabel(product.discipline, product.category)}
          </Badge>
          {product.isFeatured && (
            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-champagne flex items-center justify-center shadow-sm">
              <Star className="h-3.5 w-3.5 text-rose-gold fill-rose-gold" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-medium text-sm drop-shadow-md line-clamp-1">
              {product.name}
            </h3>
            {product.price != null && (
              <p className="text-champagne font-semibold text-sm mt-0.5">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
        </div>

        <CardContent className="p-3">
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── Main Gallery ─── */

export default function Gallery() {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    selectedDiscipline,
    setSelectedDiscipline,
    searchQuery,
    setSearchQuery,
    setProducts,
    deleteProduct,
  } = useAppStore()

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Initialize with demo data if store is empty
  useEffect(() => {
    if (products.length === 0) {
      setProducts(DEMO_PRODUCTS)
    }
  }, [])

  // Current categories based on discipline
  const currentCategories = CATEGORIES_BY_DISCIPLINE[selectedDiscipline]

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesDiscipline = p.discipline === selectedDiscipline
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesDiscipline && matchesCategory && matchesSearch && p.isActive
      })
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  }, [products, selectedDiscipline, selectedCategory, searchQuery])

  const featuredProducts = useMemo(() => {
    return filteredProducts.filter((p) => p.isFeatured)
  }, [filteredProducts])

  function handleDeleteRequest(product: Product) {
    setDeleteTarget(product)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id)
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const activeDisciplineInfo = DISCIPLINES.find((d) => d.value === selectedDiscipline)

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-5"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Galería
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-rose-gold/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-rose-gold" />
            <span className="h-px w-12 bg-rose-gold/40" />
          </div>
          <p className="text-sm text-muted-foreground tracking-wide">
            Arte de Autor — Zacatecas México
          </p>
        </div>

        {/* ── Discipline Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar justify-center">
          {DISCIPLINES.map((disc) => {
            const Icon = DISCIPLINE_ICONS[disc.value]
            const isActive = selectedDiscipline === disc.value
            return (
              <button
                key={disc.value}
                onClick={() => setSelectedDiscipline(disc.value)}
                className={`
                  shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  ${
                    isActive
                      ? 'bg-rose-gold text-white shadow-lg shadow-rose-gold/25'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {disc.label}
              </button>
            )
          })}
        </div>

        {/* Discipline description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedDiscipline}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="text-center text-xs text-muted-foreground tracking-widest uppercase"
          >
            {activeDisciplineInfo?.description}
          </motion.p>
        </AnimatePresence>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Buscar en ${activeDisciplineInfo?.label.toLowerCase() ?? 'colección'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-card border-border/60 focus:border-rose-gold/50 focus:ring-rose-gold/20 rounded-full h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-start px-1">
          {currentCategories.map((cat) => {
            const isActive = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`
                  shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                  ${
                    isActive
                      ? 'bg-rose-gold text-white shadow-md shadow-rose-gold/20'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Featured Section ── */}
      <AnimatePresence>
        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-rose-gold fill-rose-gold" />
              <h2 className="text-lg font-semibold text-foreground">
                Obras Destacadas
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex gap-4"
              >
                {featuredProducts.map((product) => (
                  <FeaturedCard key={product.id} product={product} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Grid ── */}
      {filteredProducts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`${selectedDiscipline}-${selectedCategory}-${searchQuery}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteRequest}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState discipline={selectedDiscipline} />
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar Obra
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar{' '}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{' '}
              de tu colección? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="rounded-full"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

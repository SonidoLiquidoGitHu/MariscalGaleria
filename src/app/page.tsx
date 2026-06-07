'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAppStore, type Section, type Product } from '@/lib/store'
import { DEMO_PRODUCTS, DEMO_HASHTAGS, DEMO_ANALYTICS } from '@/lib/demo-data'
import Sidebar from '@/components/sidebar'
import Gallery from '@/components/gallery'
import Upload from '@/components/upload'
import Schedule from '@/components/schedule'
import CalendarView from '@/components/calendar-view'
import Analytics from '@/components/analytics'
import Hashtags from '@/components/hashtags'
import AIStudio from '@/components/ai-studio'
import Admin from '@/components/admin'

const sectionComponents: Record<Section, React.ComponentType> = {
  gallery: Gallery,
  upload: Upload,
  schedule: Schedule,
  calendar: CalendarView,
  analytics: Analytics,
  hashtags: Hashtags,
  'ai-studio': AIStudio,
  admin: Admin,
}

function AppContent() {
  const { activeSection, products, setProducts, hashtagSets, setHashtagSets, analytics, setAnalytics } = useAppStore()
  const [loaded, setLoaded] = useState(false)

  // Load products from database on mount, merge with demo data
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch saved products from database
        const res = await fetch('/api/products')
        const data = await res.json()
        const dbProducts: Product[] = (data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || undefined,
          price: p.price || undefined,
          category: p.category || 'anillos',
          discipline: p.discipline || 'joyeria',
          sku: p.sku || undefined,
          isFeatured: p.isFeatured || false,
          isActive: p.isActive !== false,
          media: Array.isArray(p.media) ? p.media : [],
          videoUrl: p.videoUrl || undefined,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          sortOrder: 0,
        }))

        if (dbProducts.length > 0) {
          // Merge: database products take priority, fill gaps with demo data
          const dbIds = new Set(dbProducts.map((p: Product) => p.id))
          const demoExtras = DEMO_PRODUCTS.filter((p) => !dbIds.has(p.id))
          setProducts([...dbProducts, ...demoExtras])
        } else {
          // No DB products yet — use demo data
          setProducts(DEMO_PRODUCTS)
        }
      } catch (err) {
        console.error('Failed to load products from DB, using demo data:', err)
        if (products.length === 0) setProducts(DEMO_PRODUCTS)
      }

      // Load hashtags and analytics (demo for now)
      if (hashtagSets.length === 0) setHashtagSets(DEMO_HASHTAGS)
      if (analytics.length === 0) setAnalytics(DEMO_ANALYTICS)

      setLoaded(true)
    }

    if (!loaded) loadData()
  }, [loaded])

  const ActiveSection = sectionComponents[activeSection]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ActiveSection />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <TooltipProvider delayDuration={200}>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  )
}

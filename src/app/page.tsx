'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAppStore, type Section } from '@/lib/store'
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
  const { activeSection, products, setProducts, hashtagSets, setHashtagSets, analytics, setAnalytics, scheduledPosts, setScheduledPosts } = useAppStore()

  // Initialize demo data
  useEffect(() => {
    if (products.length === 0) setProducts(DEMO_PRODUCTS)
    if (hashtagSets.length === 0) setHashtagSets(DEMO_HASHTAGS)
    if (analytics.length === 0) setAnalytics(DEMO_ANALYTICS)
  }, [])

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

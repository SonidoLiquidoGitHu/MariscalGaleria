'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gem,
  Upload,
  Clock,
  CalendarDays,
  BarChart3,
  Hash,
  Sparkles,
  Shield,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react'
import { useAppStore, type Section } from '@/lib/store'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

// ─── Navigation items config ─────────────────────────────────────────────────
const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'gallery', label: 'Galería', icon: Gem },
  { id: 'upload', label: 'Subir', icon: Upload },
  { id: 'schedule', label: 'Programar', icon: Clock },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'ai-studio', label: 'Estudio IA', icon: Sparkles },
  { id: 'admin', label: 'Admin', icon: Shield },
]

// ─── Sidebar widths ──────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 72

// ─── NavItem (shared between desktop & mobile) ───────────────────────────────
function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[number]
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  const button = (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar',
        isActive
          ? 'bg-rose-gold/15 text-white'
          : 'text-silver-dark hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Left accent bar for active state */}
      <motion.div
        layoutId="sidebar-active-indicator"
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-colors duration-200',
          isActive ? 'h-5 bg-rose-gold' : 'h-0 bg-transparent'
        )}
      />

      {/* Icon */}
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-200',
          isActive ? 'text-rose-gold' : 'text-silver-dark group-hover:text-sidebar-foreground'
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
      </span>

      {/* Label (hidden when collapsed) */}
      <AnimatePresence mode="wait" initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )

  // Wrap with tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

// ─── Main SidebarContent (shared logic) ──────────────────────────────────────
function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean
  onClose?: () => void
}) {
  const { activeSection, setActiveSection } = useAppStore()
  const { theme, setTheme } = useTheme()

  const handleNavClick = (section: Section) => {
    setActiveSection(section)
    onClose?.()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* ── Brand section ──────────────────────────────────────────────── */}
      <div className={cn('flex shrink-0 flex-col border-b border-sidebar-border px-4 py-5', collapsed ? 'items-center' : '')}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-gold/20">
            <Gem className="h-4 w-4 text-rose-gold" strokeWidth={2} />
          </span>
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <h1 className="whitespace-nowrap text-lg font-semibold tracking-[0.15em] text-sidebar-foreground">
                  MARISCAL
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="mt-1 whitespace-nowrap text-[11px] font-medium tracking-widest text-silver-dark/70 uppercase"
            >
              Joyería de Autor · Plata 925
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4" aria-label="Main navigation">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavItem
                item={item}
                isActive={activeSection === item.id}
                collapsed={collapsed}
                onClick={() => handleNavClick(item.id)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom actions ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-3">
        {/* Dark mode toggle */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className={cn(
                  'flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                  'text-silver-dark hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold'
                )}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-5 w-5 items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    ) : (
                      <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={toggleTheme}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'text-silver-dark hover:bg-sidebar-accent hover:text-sidebar-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold'
            )}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  ) : (
                    <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Collapse toggle (desktop only) */}
        <CollapseButton collapsed={collapsed} />
      </div>
    </div>
  )
}

// ─── Collapse toggle button ──────────────────────────────────────────────────
function CollapseButton({ collapsed }: { collapsed: boolean }) {
  const { toggleSidebar } = useAppStore()

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleSidebar}
            className={cn(
              'mt-1 flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
              'text-silver-dark hover:bg-sidebar-accent hover:text-sidebar-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold'
            )}
            aria-label="Expandir menú lateral"
          >
            <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          Expandir
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        'mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'text-silver-dark hover:bg-sidebar-accent hover:text-sidebar-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold'
      )}
      aria-label="Colapsar menú lateral"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>
      <motion.span
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="overflow-hidden whitespace-nowrap"
      >
        Colapsar
      </motion.span>
    </button>
  )
}

// ─── Main Sidebar Component ──────────────────────────────────────────────────
export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Mobile: Sheet / Drawer ────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Hamburger trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className={cn(
            'fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg',
            'bg-sidebar text-sidebar-foreground shadow-lg transition-colors hover:bg-sidebar-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold'
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-[280px] border-none p-0 [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navegación</SheetTitle>
              <SheetDescription>Explora las secciones de la aplicación</SheetDescription>
            </SheetHeader>
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // ── Desktop: Animated sidebar ─────────────────────────────────────────
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative z-30 flex h-screen shrink-0 flex-col overflow-hidden',
        'border-r border-sidebar-border shadow-[2px_0_16px_rgba(0,0,0,0.08)]',
        'dark:shadow-[2px_0_16px_rgba(0,0,0,0.3)]'
      )}
      aria-label="Sidebar navigation"
    >
      <SidebarContent collapsed={sidebarCollapsed} />
    </motion.aside>
  )
}

import { create } from 'zustand'

export type Section = 'gallery' | 'upload' | 'schedule' | 'calendar' | 'analytics' | 'hashtags' | 'ai-studio' | 'admin'

export interface Product {
  id: string
  name: string
  description?: string
  price?: number
  category: string
  sku?: string
  isFeatured: boolean
  isActive: boolean
  media: string[]
  videoUrl?: string
  createdAt: string
  sortOrder: number
}

export interface ScheduledPost {
  id: string
  caption: string
  platform: 'instagram' | 'facebook' | 'both'
  media: string[]
  scheduledAt: string
  publishedAt?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  isRecurring: boolean
  recurrence?: 'daily' | 'weekly' | 'monthly'
  hashtags: string[]
  productId?: string
}

export interface HashtagSet {
  id: string
  name: string
  hashtags: string[]
  category?: string
  usageCount: number
}

export interface AnalyticsData {
  date: string
  likes: number
  comments: number
  shares: number
  reach: number
  platform: string
}

interface AppState {
  activeSection: Section
  sidebarCollapsed: boolean
  products: Product[]
  scheduledPosts: ScheduledPost[]
  hashtagSets: HashtagSet[]
  analytics: AnalyticsData[]
  selectedCategory: string
  searchQuery: string
  isAdminAuthenticated: boolean

  setActiveSection: (section: Section) => void
  toggleSidebar: () => void
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  reorderProducts: (products: Product[]) => void
  setScheduledPosts: (posts: ScheduledPost[]) => void
  addScheduledPost: (post: ScheduledPost) => void
  updateScheduledPost: (id: string, post: Partial<ScheduledPost>) => void
  deleteScheduledPost: (id: string) => void
  setHashtagSets: (sets: HashtagSet[]) => void
  addHashtagSet: (set: HashtagSet) => void
  deleteHashtagSet: (id: string) => void
  setAnalytics: (data: AnalyticsData[]) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  loginAdmin: (username: string, password: string) => boolean
  logoutAdmin: () => void
}

const ADMIN_USERNAME = 'MariscalGaleria'
const ADMIN_PASSWORD = 'Losgallos03'

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'gallery',
  sidebarCollapsed: false,
  products: [],
  scheduledPosts: [],
  hashtagSets: [],
  analytics: [],
  selectedCategory: 'all',
  searchQuery: '',
  isAdminAuthenticated: false,

  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),
  reorderProducts: (products) => set({ products }),
  setScheduledPosts: (posts) => set({ scheduledPosts: posts }),
  addScheduledPost: (post) => set((state) => ({ scheduledPosts: [...state.scheduledPosts, post] })),
  updateScheduledPost: (id, updates) => set((state) => ({
    scheduledPosts: state.scheduledPosts.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  deleteScheduledPost: (id) => set((state) => ({
    scheduledPosts: state.scheduledPosts.filter((p) => p.id !== id),
  })),
  setHashtagSets: (sets) => set({ hashtagSets: sets }),
  addHashtagSet: (set) => set((state) => ({ hashtagSets: [...state.hashtagSets, set] })),
  deleteHashtagSet: (id) => set((state) => ({
    hashtagSets: state.hashtagSets.filter((s) => s.id !== id),
  })),
  setAnalytics: (data) => set({ analytics: data }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  loginAdmin: (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      set({ isAdminAuthenticated: true })
      return true
    }
    return false
  },
  logoutAdmin: () => set({ isAdminAuthenticated: false }),
}))

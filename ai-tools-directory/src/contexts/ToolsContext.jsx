import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import api from '../utils/api'

const ToolsContext = createContext()

export const ToolsProvider = ({ children }) => {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    pricing: 'all',
    sort: 'rating-desc'
  })
  const [toolsCache, setToolsCache] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const cacheKey = JSON.stringify({ ...filters, page: currentPage })

  const loadTools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      if (toolsCache[cacheKey]) {
        setTools(toolsCache[cacheKey].tools)
        setTotalPages(toolsCache[cacheKey].totalPages)
        setLoading(false)
        return
      }

      const response = await api.get('/api/tools', {
        params: {
          category: filters.category !== 'all' ? filters.category : undefined,
          search: filters.search || undefined,
          sort: filters.sort,
          page: currentPage,
          limit: 28 // 4 tools per row × 7 rows
        }
      })

      const { tools: fetchedTools, total, pages } = response.data

      // Update cache
      setToolsCache(prev => ({
        ...prev,
        [cacheKey]: {
          tools: fetchedTools,
          totalPages: pages
        }
      }))

      setTools(fetchedTools)
      setTotalPages(pages)
    } catch (err) {
      setError('Failed to load tools. Please try again.')
      console.error('Error loading tools:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, cacheKey, toolsCache])

  // Load tools when filters or page changes
  useEffect(() => {
    loadTools()
  }, [loadTools])

  // Get unique categories from tools
  const categories = useMemo(() => {
    const uniqueCategories = new Set()
    tools.forEach(tool => {
      if (tool.category) {
        uniqueCategories.add(tool.category)
      }
      if (tool.categories) {
        if (Array.isArray(tool.categories)) {
          tool.categories.forEach(category => {
            if (category) uniqueCategories.add(category)
          })
        } else if (typeof tool.categories === 'string') {
          uniqueCategories.add(tool.categories)
        }
      }
    })
    return Array.from(uniqueCategories)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  }, [tools])

  // Get tools count by category
  const categoryStats = useMemo(() => {
    const stats = {}
    tools.forEach(tool => {
      const addToStats = (category) => {
        if (category) {
          stats[category] = (stats[category] || 0) + 1
        }
      }

      if (tool.category) {
        addToStats(tool.category)
      }
      if (tool.categories) {
        if (Array.isArray(tool.categories)) {
          tool.categories.forEach(addToStats)
        } else if (typeof tool.categories === 'string') {
          addToStats(tool.categories)
        }
      }
    })
    return stats
  }, [tools])

  // Get unique pricing options from tools
  const pricingOptions = useMemo(() => {
    const uniquePricing = new Set()
    tools.forEach(tool => {
      if (tool.pricing) {
        uniquePricing.add(tool.pricing)
      }
    })
    return Array.from(uniquePricing)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  }, [tools])

  const getFilteredTools = useCallback(() => {
    return tools
      .filter((tool) => {
        const matchesSearch =
          filters.search === '' ||
          tool.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          tool.description.toLowerCase().includes(filters.search.toLowerCase())

        const matchesCategory =
          filters.category === 'all' ||
          (tool.category && tool.category.toLowerCase() === filters.category.toLowerCase()) ||
          (tool.categories && (
            Array.isArray(tool.categories) 
              ? tool.categories.some(cat => cat.toLowerCase() === filters.category.toLowerCase())
              : tool.categories.toLowerCase() === filters.category.toLowerCase()
          ))

        const matchesPricing =
          filters.pricing === 'all' ||
          (tool.pricing && tool.pricing.toLowerCase() === filters.pricing.toLowerCase())

        return matchesSearch && matchesCategory && matchesPricing
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case 'rating-desc':
            return b.rating - a.rating
          case 'rating-asc':
            return a.rating - b.rating
          case 'reviews-desc':
            return b.reviewCount - a.reviewCount
          case 'name-asc':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          default:
            return 0
        }
      })
  }, [tools, filters])

  const value = {
    tools,
    loading,
    error,
    filters,
    setFilters,
    categories,
    pricingOptions,
    categoryStats,
    getFilteredTools,
    currentPage,
    setCurrentPage,
    totalPages,
    refresh: loadTools
  }

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>
}

export const useTools = () => {
  const context = useContext(ToolsContext)
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider')
  }
  return context
}

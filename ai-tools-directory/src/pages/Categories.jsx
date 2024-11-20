import { motion } from 'framer-motion'
import { useTools } from '../contexts/ToolsContext'
import { Link } from 'react-router-dom'
import { FiGrid, FiArrowRight } from 'react-icons/fi'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Categories() {
  const { categories, tools } = useTools()

  // Count tools per category
  const getCategoryCount = (category) => {
    return tools.filter(tool => 
      tool.categories && tool.categories.includes(category)
    ).length
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 sm:text-5xl"
            >
              AI Tool Categories
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-xl text-gray-600"
            >
              Browse AI tools by category
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((category) => (
            <motion.div
              key={category}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <Link
                to={`/tools?category=${encodeURIComponent(category)}`}
                className="block h-full"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                      <FiGrid className="w-6 h-6" />
                    </div>
                    <div className="flex items-center text-gray-400 group-hover:text-blue-600 transition-colors duration-300">
                      <span className="mr-2">View Tools</span>
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {getCategoryCount(category)} tools available
                  </p>
                  
                  <div className="absolute bottom-6 left-6 right-6 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Directory Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {categories.length}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {tools.length}
                </div>
                <div className="text-gray-600">Total Tools</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(tools.reduce((sum, tool) => sum + (tool.rating || 0), 0) / tools.length).toFixed(1)}
                </div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

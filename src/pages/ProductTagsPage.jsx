import { useState, useEffect } from 'react'
import { Search, Plus, X, Check, AlertCircle } from 'lucide-react'
import api from '../api/axios'

export default function ProductTagsPage() {
  const [products, setProducts] = useState([])
  const [allTags, setAllTags] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productTags, setProductTags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tagSearchTerm, setTagSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch products
      const productsRes = await api.get('/products')
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
      
      // Fetch tags
      const tagsRes = await api.get('/tags')
      setAllTags(tagsRes.data || [])
      
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product)
    try {
      const response = await api.get(`/tags/product/${product._id}`)
      setProductTags(response.data || [])
      setSuccess(null)
    } catch (err) {
      console.error('Error fetching product tags:', err)
      setProductTags([])
    }
  }

  const handleAddTag = async (tag) => {
    if (!selectedProduct) return
    
    // Check if tag already assigned
    if (productTags.some(t => (t._id || t.id) === tag._id)) {
      setError('This tag is already assigned to the product')
      return
    }

    try {
      setSaving(true)
      await api.post(`/tags/product/${selectedProduct._id}/add/${tag._id}`)
      setProductTags([...productTags, tag])
      setSuccess(`Tag "${tag.name}" added successfully!`)
      setError(null)
    } catch (err) {
      console.error('Error adding tag:', err)
      setError('Failed to add tag')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveTag = async (tagId) => {
    if (!selectedProduct) return

    try {
      setSaving(true)
      await api.post(`/tags/product/${selectedProduct._id}/remove/${tagId}`)
      setProductTags(productTags.filter(t => (t._id || t.id) !== tagId))
      setSuccess('Tag removed successfully!')
      setError(null)
    } catch (err) {
      console.error('Error removing tag:', err)
      setError('Failed to remove tag')
    } finally {
      setSaving(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter tags
  const availableTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
    !productTags.some(pt => (pt._id || pt.id) === tag._id)
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Tagging</h1>
          <p className="text-gray-600">Manage tags for your products</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Products</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedProduct?._id === product._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <p className="font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    {product.tags && product.tags.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2">
                        {product.tags.length} tag{product.tags.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Product Details & Tags */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            {selectedProduct ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  Product Details
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Product Name</p>
                    <p className="font-bold text-gray-900 text-lg line-clamp-2">{selectedProduct.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Category</p>
                      <p className="font-bold text-gray-900">{selectedProduct.category}</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Price</p>
                      <p className="font-bold text-gray-900">₹{selectedProduct.price}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Stock Available</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedProduct.stock || 0} units</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <AlertCircle size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Select a product to manage its tags</p>
                <p className="text-gray-500 text-sm mt-2">Choose from the products list on the left</p>
              </div>
            )}

            {/* Current Tags */}
            {selectedProduct && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     Assigned Tags ({productTags.length})
                   </h2>
                 </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                      <AlertCircle size={16} /> {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                    <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                      <Check size={16} /> {success}
                    </p>
                  </div>
                )}

                {productTags.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-400 text-sm">No tags assigned yet</p>
                    <p className="text-gray-500 text-xs mt-2">Select tags from the available list below</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                   {productTags.map(tag => (
                     <div
                       key={tag._id || tag.id}
                       className={`${tag.color} text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition duration-300 group`}
                     >
                       <span>{tag.name}</span>
                       <button
                         onClick={() => handleRemoveTag(tag._id || tag.id)}
                         disabled={saving}
                         className="ml-1 opacity-75 hover:opacity-100 transition duration-200 group-hover:scale-110"
                         title="Remove tag"
                       >
                         <X size={16} />
                       </button>
                     </div>
                   ))}
                  </div>
                )}
              </div>
            )}

            {/* Available Tags */}
            {selectedProduct && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Add More Tags
                </h2>
                
                <div className="relative mb-5">
                  <Search size={18} className="absolute left-4 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search available tags..."
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {availableTags.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 text-sm font-medium">
                      {allTags.length === productTags.length
                        ? '✓ All tags assigned!'
                        : '🔍 No tags match your search'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag._id}
                        onClick={() => handleAddTag(tag)}
                        disabled={saving}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition duration-300 flex items-center justify-between group disabled:opacity-50 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 text-left flex-1">
                          <span className="text-2xl flex-shrink-0">{tag.icon}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{tag.name}</p>
                            <p className="text-xs text-gray-600 line-clamp-1">{tag.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className={`flex-shrink-0 ml-2 p-2 rounded-lg ${tag.color} transition duration-300 opacity-0 group-hover:opacity-100`}>
                          <Plus size={18} className="text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

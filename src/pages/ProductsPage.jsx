import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Plus, Edit2, Trash2, Search, Trash } from 'lucide-react'
import { toast } from 'react-toastify'
import ProductModal from '../components/ProductModal'
import ConfirmModal from '../components/ConfirmModal'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Products error:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p._id !== id))
      toast.success('Product deleted')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleSave = async (productData, imageFile) => {
    try {
      // Create FormData to handle file uploads
      const formData = new FormData()
      formData.append('name', productData.name)
      formData.append('category', productData.category)
      formData.append('price', productData.price)
      formData.append('originalPrice', productData.originalPrice)
      formData.append('weight', productData.weight)
      formData.append('description', productData.description)
      formData.append('rating', productData.rating)
      formData.append('stock', productData.stock)
      formData.append('imageUrl', productData.imageUrl)
      formData.append('categoryId', productData.categoryId)
      formData.append('subcategoryId', productData.subcategoryId)
      formData.append('features', JSON.stringify(productData.features || {}))
      formData.append('specifications', JSON.stringify(productData.specifications || {}))
      
      if (imageFile) {
        formData.append('productImage', imageFile)
      }

      if (editingProduct) {
        const { data: updatedProduct } = await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        // Update in place without reload
        setProducts(products.map(p => p._id === editingProduct._id ? updatedProduct : p))
        toast.success('Product updated')
      } else {
        const { data: newProduct } = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        console.log('New product created:', newProduct)
        // Add new product to list immediately
        setProducts([newProduct, ...products])
        toast.success('Product created')
      }
      
      setShowModal(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error.response?.data?.error || 'Failed to save product')
    }
  }

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true)
    try {
      await Promise.all(
        products.map(product => api.delete(`/products/${product._id}`))
      )
      toast.success(`Deleted ${products.length} products`)
      setProducts([])
      setShowDeleteAllModal(false)
    } catch (error) {
      console.error('Delete all error:', error)
      toast.error('Failed to delete some products')
    } finally {
      setDeleteAllLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-3">
          {products.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Trash size={20} />
              Delete All
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td 
                  className="px-6 py-4 text-sm text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.stock || 0}</td>
                <td className="px-6 py-4 text-sm space-x-2 flex">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id || product.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
        />
      )}

      {showDeleteAllModal && (
        <ConfirmModal
          title="Delete All Products"
          message={`Are you sure you want to delete all ${products.length} products? This action cannot be undone.`}
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteAllModal(false)}
          confirmText="Delete All"
          cancelText="Cancel"
          isLoading={deleteAllLoading}
          isDangerous={true}
        />
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'
import ProductModal from '../components/ProductModal'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/products/${productId}`)
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
      setTimeout(() => navigate('/products'), 1500)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${productId}`)
      toast.success('Product deleted')
      navigate('/products')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleSave = async (productData, imageFile) => {
    try {
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

      const { data: updatedProduct } = await api.put(`/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setProduct(updatedProduct)
      setShowEditModal(false)
      toast.success('Product updated successfully')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error.response?.data?.error || 'Failed to update product')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-600">Product not found</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit2 size={18} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Image */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-contain rounded-lg bg-gray-50"
            />
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold text-gray-900">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subcategory</p>
                <p className="text-lg font-semibold text-gray-900">{product.subcategoryName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-semibold text-gray-900">₹{product.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Original Price</p>
                <p className="text-lg font-semibold text-gray-900">₹{product.originalPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock</p>
                <p className="text-lg font-semibold text-gray-900">{product.stock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-lg font-semibold text-gray-900">{product.weight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-semibold text-gray-900">⭐ {product.rating}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Features */}
          {product.features && Object.keys(product.features).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.features).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProductModal
          product={product}
          onSave={handleSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

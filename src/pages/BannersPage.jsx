import { useState, useEffect } from 'react'
import { Plus, Trash2, Upload, Eye } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'

export default function BannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'category',
    order: 0,
    imageUrl: ''
  })
  const [imagePreview, setImagePreview] = useState(null)

  // Fetch banners
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching banners from API...')
      const response = await api.get('/banners')
      console.log('✅ Banners loaded:', response.data.length, 'banners')
      response.data.forEach((banner, idx) => {
        console.log(`${idx + 1}. ${banner.title}`)
        console.log(`   ID: ${banner._id}`)
        console.log(`   Image: ${banner.image}`)
        console.log(`   URL: http://localhost:5000${banner.image}`)
      })
      setBanners(response.data)
    } catch (error) {
      console.error('❌ Error fetching banners:', error)
      toast.error('Error loading banners')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }))
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }))
    setImagePreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.type || !formData.imageUrl) {
      toast.warning('Please fill all required fields')
      return
    }

    try {
      setSubmitting(true)
      console.log('📤 Creating banner...')
      const response = await api.post('/banners', {
        title: formData.title,
        type: formData.type,
        order: formData.order,
        imageUrl: formData.imageUrl
      })

      if (response.status === 201) {
        console.log('✅ Banner created:', response.data)
        toast.success('Banner created successfully!')
        setFormData({
          title: '',
          type: 'category',
          order: 0,
          imageUrl: ''
        })
        setImagePreview(null)
        setShowForm(false)
        fetchBanners()
      }
    } catch (error) {
      console.error('❌ Error uploading banner:', error)
      console.log('Response data:', error.response?.data)
      console.log('Status:', error.response?.status)
      toast.error('Error uploading banner: ' + (error.response?.data?.error || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      const response = await api.delete(`/banners/${id}`)
      if (response.status === 200) {
        toast.success('Banner deleted successfully!')
        fetchBanners()
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Error deleting banner')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners and promotional images</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
           <h2 className="text-xl font-semibold mb-6">Create New Banner</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Banner, Holiday Sale"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="main">Main Banner</option>
                  <option value="category">Category Banner</option>
                  <option value="delivery">Delivery Banner</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter image URL (recommended: 1200x400px)</p>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="relative max-w-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                {submitting ? 'Creating...' : 'Create Banner'}
              </button>
              <button
                type="button"
                onClick={() => {
                   setShowForm(false)
                   setImagePreview(null)
                   setFormData({
                     title: '',
                     type: 'category',
                     order: 0,
                     imageUrl: ''
                   })
                 }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No banners uploaded yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Upload First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(banner => (
            <div
              key={banner._id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition border border-gray-200"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100 overflow-hidden group">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {banner.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Type:</span>{' '}
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                      {banner.type}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Order:</span> {banner.order}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={banner.active ? 'text-green-600' : 'text-gray-400'}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={banner.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition text-sm font-medium"
                  >
                    <Eye size={16} />
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition font-medium"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

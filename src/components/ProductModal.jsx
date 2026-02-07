import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { getCategories, getFeatureTemplate } from '../api/categoryService'
import api from '../api/axios'

export default function ProductModal({ product, onSave, onClose }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [featureTemplate, setFeatureTemplate] = useState(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [loadingBrands, setLoadingBrands] = useState(false)
  
  const [formData, setFormData] = useState(product ? {
    name: product.name,
    category: product.category,
    categoryId: product.categoryId || '',
    subcategoryId: product.subcategoryId || '',
    subcategoryName: product.subcategoryName || '',
    brand: product.brand || '',
    price: product.price,
    originalPrice: product.originalPrice || '',
    description: product.description || '',
    imageUrl: product.image && product.image.startsWith('http') ? product.image : '',
    stock: product.stock || 0,
    weight: product.weight || '',
    rating: product.rating || 0,
    features: product.features || {},
    specifications: product.specifications || {},
  } : {
    name: '',
    category: '',
    categoryId: '',
    subcategoryId: '',
    subcategoryName: '',
    brand: '',
    price: '',
    originalPrice: '',
    description: '',
    imageUrl: '',
    stock: 0,
    weight: '',
    rating: 0,
    features: {},
    specifications: {},
  })
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image && !product.image.startsWith('/uploads') ? product.image : null)
  const [multipleImages, setMultipleImages] = useState(product?.images || [])
  const [multipleImagePreviews, setMultipleImagePreviews] = useState(
    product?.images?.map(img => (img.startsWith('http') ? img : null)).filter(Boolean) || []
  )

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Update subcategories and fetch template when selected category changes
  useEffect(() => {
    if (formData.categoryId) {
      const selected = categories.find(cat => cat._id === formData.categoryId)
      setSubcategories(selected?.subcategories || [])
      // Fetch feature template for the category
      fetchFeatureTemplate(formData.categoryId, formData.subcategoryId)
    } else {
      setSubcategories([])
      setFeatureTemplate(null)
    }
  }, [formData.categoryId, categories])

  // Update feature template and fetch brands when subcategory changes
  useEffect(() => {
    if (formData.categoryId) {
      fetchFeatureTemplate(formData.categoryId, formData.subcategoryId)
      if (formData.subcategoryId) {
        fetchBrands(formData.categoryId, formData.subcategoryId)
      } else {
        setBrands([])
      }
    }
  }, [formData.subcategoryId])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchBrands = async (categoryId, subcategoryId) => {
    try {
      setLoadingBrands(true)
      const { data } = await api.get(`/categories/${categoryId}/subcategories/${subcategoryId}/brands`)
      setBrands(data.brands || [])
    } catch (err) {
      console.error('Failed to fetch brands:', err)
      setBrands([])
    } finally {
      setLoadingBrands(false)
    }
  }

  const fetchFeatureTemplate = async (categoryId, subcategoryId) => {
    try {
      setLoadingTemplate(true)
      const template = await getFeatureTemplate(categoryId, subcategoryId)
      setFeatureTemplate(template)
      
      // Initialize features with empty values based on template
      if (template?.featureFields?.length > 0) {
        const newFeatures = {}
        template.featureFields.forEach(field => {
          newFeatures[field.name] = formData.features?.[field.name] || ''
        })
        setFormData(prev => ({ ...prev, features: newFeatures }))
      }
      
      // Initialize specifications with empty values based on template
      if (template?.specFields?.length > 0) {
        const newSpecs = {}
        template.specFields.forEach(field => {
          newSpecs[field.key] = formData.specifications?.[field.key] || ''
        })
        setFormData(prev => ({ ...prev, specifications: newSpecs }))
      }
    } catch (err) {
      console.error('Failed to fetch template:', err)
      setFeatureTemplate(null)
    } finally {
      setLoadingTemplate(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFeatureChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [fieldName]: value
      }
    }))
  }

  const handleSpecificationChange = (fieldKey, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [fieldKey]: value
      }
    }))
  }

  const renderFeatureField = (field) => {
    const value = formData.features?.[field.name] || ''
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFeatureChange(field.name, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value === true || value === 'true'}
            onChange={(e) => handleFeatureChange(field.name, e.target.checked)}
            className="w-4 h-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFeatureChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        )
      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFeatureChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        )
    }
  }

  const renderSpecificationField = (field) => {
    const value = formData.specifications?.[field.key] || ''
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        )
      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        )
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...multipleImages]
    const newPreviews = [...multipleImagePreviews]

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(file)
        newPreviews.push(reader.result)
        setMultipleImages([...newImages])
        setMultipleImagePreviews([...newPreviews])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const newImages = multipleImages.filter((_, i) => i !== index)
    const newPreviews = multipleImagePreviews.filter((_, i) => i !== index)
    setMultipleImages(newImages)
    setMultipleImagePreviews(newPreviews)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData, imageFile)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              {loadingCategories ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                  Loading categories...
                </div>
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => {
                    const selected = categories.find(cat => cat._id === e.target.value)
                    setFormData(prev => ({
                      ...prev,
                      categoryId: e.target.value,
                      category: selected?.name || '',
                      subcategoryId: '',
                      subcategoryName: ''
                    }))
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {formData.categoryId && subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={formData.subcategoryId}
                  onChange={(e) => {
                    const selected = subcategories.find(sub => sub._id === e.target.value)
                    setFormData(prev => ({
                      ...prev,
                      subcategoryId: e.target.value,
                      subcategoryName: selected?.name || ''
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Subcategory (Optional)</option>
                  {subcategories.map(sub => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.subcategoryId && brands.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  disabled={loadingBrands}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Brand (Optional)</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 500g"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 w-full h-32 rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                <img src={imagePreview} alt="Preview" className="h-full object-contain" />
              </div>
            )}

            {/* File Upload */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                <div className="text-center">
                  <Upload size={20} className="mx-auto text-gray-600 mb-1" />
                  <span className="text-sm text-gray-600">Upload Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Or Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Multiple Images Upload */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Product Images
              </label>
              <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition mb-4">
                <div className="text-center">
                  <Upload size={20} className="mx-auto text-gray-600 mb-1" />
                  <span className="text-sm text-gray-600">Click to upload multiple images</span>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesChange}
                  className="hidden"
                />
              </label>

              {/* Image Previews Grid */}
              {multipleImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {multipleImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-24 rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                        <img src={preview} alt={`Preview ${index}`} className="h-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Features Section */}
          {loadingTemplate ? (
            <div className="text-center py-4 text-gray-600">Loading features...</div>
          ) : featureTemplate?.featureFields?.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {featureTemplate.featureFields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderFeatureField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Section */}
          {featureTemplate?.specFields?.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {featureTemplate.specFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderSpecificationField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { getCategoryById, getFeatureTemplate, saveFeatureTemplate } from '../api/categoryService'

export default function FeaturesTemplate() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  
  const [category, setCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [featureFields, setFeatureFields] = useState([])
  const [specFields, setSpecFields] = useState([])
  const [error, setError] = useState(null)

  const [showFeatureForm, setShowFeatureForm] = useState(false)
  const [showSpecForm, setShowSpecForm] = useState(false)
  
  const [featureForm, setFeatureForm] = useState({
    name: '',
    label: '',
    type: 'text',
    options: '',
    required: false,
    placeholder: ''
  })
  
  const [specForm, setSpecForm] = useState({
    key: '',
    label: '',
    type: 'text',
    options: '',
    required: false,
    placeholder: ''
  })

  useEffect(() => {
    fetchCategoryAndTemplate()
  }, [categoryId, selectedSubcategory])

  const fetchCategoryAndTemplate = async () => {
    try {
      setLoading(true)
      setError(null)
      const categoryData = await getCategoryById(categoryId)
      setCategory(categoryData)
      
      // Always fetch template (with or without subcategory)
      const template = await getFeatureTemplate(categoryId, selectedSubcategory)
      setFeatureFields(template.featureFields || [])
      setSpecFields(template.specFields || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load template. Please check if category exists and backend is running.')
      setCategory(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeature = (e) => {
    e.preventDefault()
    if (!featureForm.name.trim() || !featureForm.label.trim()) {
      alert('Name and Label are required')
      return
    }

    const newFeature = {
      ...featureForm,
      options: featureForm.options ? featureForm.options.split(',').map(o => o.trim()) : []
    }

    setFeatureFields([...featureFields, newFeature])
    setFeatureForm({ name: '', label: '', type: 'text', options: '', required: false, placeholder: '' })
    setShowFeatureForm(false)
  }

  const handleAddSpec = (e) => {
    e.preventDefault()
    if (!specForm.key.trim() || !specForm.label.trim()) {
      alert('Key and Label are required')
      return
    }

    const newSpec = {
      ...specForm,
      options: specForm.options ? specForm.options.split(',').map(o => o.trim()) : []
    }

    setSpecFields([...specFields, newSpec])
    setSpecForm({ key: '', label: '', type: 'text', options: '', required: false, placeholder: '' })
    setShowSpecForm(false)
  }

  const handleSaveTemplate = async () => {
    try {
      setSaving(true)
      await saveFeatureTemplate(categoryId, {
        subcategoryId: selectedSubcategory,
        subcategoryName: selectedSubcategory 
          ? category.subcategories?.find(s => s._id === selectedSubcategory)?.name
          : null,
        categoryName: category.name,
        featureFields,
        specFields
      })
      alert('Template saved successfully!')
    } catch (err) {
      alert('Error saving template: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center py-12">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/admin/categories')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Categories
        </button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-800">Error Loading Template</h2>
          <p className="text-red-700 mt-2">{error}</p>
          <p className="text-sm text-red-600 mt-3">Debug: categoryId = {categoryId}</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return <div className="p-6 text-center py-12">Category not found</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/categories')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Categories
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Features & Specifications Template
        </h1>
        <p className="text-gray-600 mt-2">{category.icon} {category.name}</p>
      </div>

      {/* Subcategory Selection */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Select Subcategory (Optional)
          </label>
          <select
            value={selectedSubcategory || ''}
            onChange={(e) => setSelectedSubcategory(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Default Template (All Subcategories)</option>
            {category.subcategories.map(sub => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-2">
            You can set a default template for all products, or customize per subcategory
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Features Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Features</h2>
            <button
              onClick={() => setShowFeatureForm(!showFeatureForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Feature
            </button>
          </div>

          {showFeatureForm && (
            <form onSubmit={handleAddFeature} className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Field name (e.g., displayType)"
                value={featureForm.name}
                onChange={(e) => setFeatureForm({...featureForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Label (e.g., Display Type)"
                value={featureForm.label}
                onChange={(e) => setFeatureForm({...featureForm, label: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <select
                value={featureForm.type}
                onChange={(e) => setFeatureForm({...featureForm, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="text">Text</option>
                <option value="select">Select/Dropdown</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
              </select>
              {featureForm.type === 'select' && (
                <textarea
                  placeholder="Options (comma-separated, e.g., AMOLED, IPS, LCD)"
                  value={featureForm.options}
                  onChange={(e) => setFeatureForm({...featureForm, options: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                />
              )}
              <input
                type="text"
                placeholder="Placeholder text"
                value={featureForm.placeholder}
                onChange={(e) => setFeatureForm({...featureForm, placeholder: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featureForm.required}
                  onChange={(e) => setFeatureForm({...featureForm, required: e.target.checked})}
                />
                Required field
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                  Add Feature
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeatureForm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {featureFields.length > 0 ? (
            <div className="space-y-2">
              {featureFields.map((field, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{field.label}</p>
                      <p className="text-sm text-gray-600">Type: {field.type}</p>
                      {field.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>}
                      {field.options?.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">Options: {field.options.join(', ')}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setFeatureFields(featureFields.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No features added yet
            </div>
          )}
        </div>

        {/* Specifications Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Specifications</h2>
            <button
              onClick={() => setShowSpecForm(!showSpecForm)}
              className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700"
            >
              <Plus size={18} />
              Add Spec
            </button>
          </div>

          {showSpecForm && (
            <form onSubmit={handleAddSpec} className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Key (e.g., weight)"
                value={specForm.key}
                onChange={(e) => setSpecForm({...specForm, key: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Label (e.g., Weight)"
                value={specForm.label}
                onChange={(e) => setSpecForm({...specForm, label: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <select
                value={specForm.type}
                onChange={(e) => setSpecForm({...specForm, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="text">Text</option>
                <option value="select">Select/Dropdown</option>
                <option value="number">Number</option>
              </select>
              {specForm.type === 'select' && (
                <textarea
                  placeholder="Options (comma-separated)"
                  value={specForm.options}
                  onChange={(e) => setSpecForm({...specForm, options: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                />
              )}
              <input
                type="text"
                placeholder="Placeholder text"
                value={specForm.placeholder}
                onChange={(e) => setSpecForm({...specForm, placeholder: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={specForm.required}
                  onChange={(e) => setSpecForm({...specForm, required: e.target.checked})}
                />
                Required field
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                  Add Specification
                </button>
                <button
                  type="button"
                  onClick={() => setShowSpecForm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {specFields.length > 0 ? (
            <div className="space-y-2">
              {specFields.map((field, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{field.label}</p>
                      <p className="text-sm text-gray-600">Key: {field.key}</p>
                      <p className="text-sm text-gray-600">Type: {field.type}</p>
                      {field.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>}
                      {field.options?.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">Options: {field.options.join(', ')}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSpecFields(specFields.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No specifications added yet
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center">
        <p className="text-gray-800">
          <span className="font-bold">{featureFields.length}</span> Features,{' '}
          <span className="font-bold">{specFields.length}</span> Specifications
        </p>
        <button
          onClick={handleSaveTemplate}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  )
}

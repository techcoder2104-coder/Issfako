import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle, Tag, X } from 'lucide-react'
import { getCategories, createCategory, addSubcategory, deleteCategory, updateCategory, updateSubcategory } from '../api/categoryService'
import api from '../api/axios'

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [showBrandModal, setShowBrandModal] = useState(null)
  const [subBrands, setSubBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [newBrand, setNewBrand] = useState('')
  const [deleteBrandConfirm, setDeleteBrandConfirm] = useState(null)
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    icon: ''
  })
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      if (editingCategory) {
        // Update existing category
        const updated = await updateCategory(editingCategory._id, categoryForm)
        setCategories(categories.map(cat => cat._id === editingCategory._id ? updated : cat))
        alert('Category updated successfully!')
      } else {
        // Create new category
        const newCategory = await createCategory(categoryForm)
        setCategories([...categories, newCategory])
        alert('Category created successfully!')
      }
      setCategoryForm({ name: '', description: '', image: '', icon: '' })
      setShowCategoryForm(false)
      setEditingCategory(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon
    })
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleAddSubcategory = async (e, categoryId) => {
    e.preventDefault()
    if (!subcategoryForm.name.trim()) {
      alert('Subcategory name is required')
      return
    }

    try {
      if (editingSubcategory) {
        // Update existing subcategory
        await updateSubcategory(categoryId, editingSubcategory._id, subcategoryForm)
        setCategories(categories.map(cat => 
          cat._id === categoryId 
            ? {
                ...cat,
                subcategories: cat.subcategories.map(sub =>
                  sub._id === editingSubcategory._id
                    ? { ...sub, ...subcategoryForm }
                    : sub
                )
              }
            : cat
        ))
        alert('Subcategory updated successfully!')
      } else {
        // Add new subcategory
        const newSubcategory = await addSubcategory(categoryId, subcategoryForm)
        setCategories(categories.map(cat => 
          cat._id === categoryId 
            ? { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] }
            : cat
        ))
        alert('Subcategory added successfully!')
      }
      
      setSubcategoryForm({ name: '', description: '', image: '' })
      setShowSubcategoryForm(null)
      setEditingSubcategory(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleEditSubcategory = (categoryId, subcategory) => {
    setSubcategoryForm({
      name: subcategory.name,
      description: subcategory.description,
      image: subcategory.image
    })
    setEditingSubcategory(subcategory)
    setShowSubcategoryForm(categoryId)
  }

  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      await deleteCategory(categoryId)
      setCategories(categories.filter(cat => cat._id !== categoryId))
      setDeleteConfirm(null)
      alert(`Category "${categoryName}" deleted successfully!`)
    } catch (err) {
      alert('Error deleting category: ' + err.message)
    }
  }

  const fetchBrands = async (categoryId, subcategoryId) => {
    try {
      setLoadingBrands(true)
      const { data } = await api.get(`/categories/${categoryId}/subcategories/${subcategoryId}/brands`)
      setSubBrands(data.brands || [])
    } catch (err) {
      console.error('Error fetching brands:', err)
      setSubBrands([])
    } finally {
      setLoadingBrands(false)
    }
  }

  const handleOpenBrandModal = (categoryId, subcategoryId) => {
    setShowBrandModal({ categoryId, subcategoryId })
    setNewBrand('')
    fetchBrands(categoryId, subcategoryId)
  }

  const handleAddBrand = async (e) => {
    e.preventDefault()
    if (!newBrand.trim()) {
      alert('Brand name is required')
      return
    }

    try {
      const { categoryId, subcategoryId } = showBrandModal
      const { data } = await api.post(
        `/categories/${categoryId}/subcategories/${subcategoryId}/brands`,
        { brand: newBrand }
      )
      setSubBrands(data.brands || [])
      setNewBrand('')
      alert('Brand added successfully!')
    } catch (err) {
      alert('Error adding brand: ' + err.response?.data?.error || err.message)
    }
  }

  const handleDeleteBrand = async (brand) => {
    try {
      const { categoryId, subcategoryId } = showBrandModal
      const { data } = await api.delete(
        `/categories/${categoryId}/subcategories/${subcategoryId}/brands/${encodeURIComponent(brand)}`
      )
      setSubBrands(data.brands || [])
      setDeleteBrandConfirm(null)
      alert('Brand deleted successfully!')
    } catch (err) {
      alert('Error deleting brand: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Create/Edit Category Form */}
      {showCategoryForm && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Electronics, Fashion, Home"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Category description"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon/Emoji
                </label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="📱 or icon code"
                  maxLength="10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                  setCategoryForm({ name: '', description: '', image: '', icon: '' })
                }}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Create one to get started!
          </div>
        ) : (
          categories.map(category => (
            <div key={category._id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div
                onClick={() => setExpandedId(expandedId === category._id ? null : category._id)}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {expandedId === category._id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {category.icon} {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleEditCategory(category)}
                     className="p-2 hover:bg-white rounded-lg"
                   >
                     <Edit2 size={18} className="text-blue-600 hover:text-blue-700" />
                   </button>
                  <button 
                    onClick={() => setDeleteConfirm(category._id)}
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    <Trash2 size={18} className="text-red-600 hover:text-red-700" />
                  </button>
                </div>
              </div>

              {/* Expanded Content - Subcategories */}
              {expandedId === category._id && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <h4 className="font-bold text-gray-900 mb-4">
                    Subcategories ({category.subcategories?.length || 0})
                  </h4>

                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {category.subcategories.map(sub => (
                        <div
                          key={sub._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{sub.name}</p>
                            <p className="text-sm text-gray-600">{sub.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenBrandModal(category._id, sub._id)}
                              className="p-1 hover:bg-white rounded"
                              title="Manage Brands"
                            >
                              <Tag size={16} className="text-purple-600 hover:text-purple-700" />
                            </button>
                            <button 
                              onClick={() => handleEditSubcategory(category._id, sub)}
                              className="p-1 hover:bg-white rounded"
                            >
                              <Edit2 size={16} className="text-blue-600 hover:text-blue-700" />
                            </button>
                            <button className="p-1 hover:bg-white rounded">
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Subcategory Form */}
                  {showSubcategoryForm === category._id ? (
                    <form onSubmit={(e) => handleAddSubcategory(e, category._id)} className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-bold text-gray-900">
                        {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                      </h4>
                      <input
                        type="text"
                        value={subcategoryForm.name}
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                        placeholder="Subcategory name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <textarea
                        value={subcategoryForm.description}
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, description: e.target.value})}
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="2"
                      />
                      <input
                        type="text"
                        value={subcategoryForm.image}
                        onChange={(e) => setSubcategoryForm({...subcategoryForm, image: e.target.value})}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                          {editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSubcategoryForm(null)
                            setEditingSubcategory(null)
                            setSubcategoryForm({ name: '', description: '', image: '' })
                          }}
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowSubcategoryForm(category._id)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus size={18} />
                      Add Subcategory
                    </button>
                  )}

                  {/* Set Features & Specs Button */}
                  <button
                    onClick={() => window.location.href = `/features-template/${category._id}`}
                    className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Configure Features & Specs
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Brand Management Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Manage Brands</h3>
              <button
                onClick={() => {
                  setShowBrandModal(null)
                  setNewBrand('')
                  setDeleteBrandConfirm(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Add Brand Form */}
              <form onSubmit={handleAddBrand} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Brand
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Brand name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Brands List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Brands ({subBrands.length})
                </h4>
                {loadingBrands ? (
                  <div className="text-center py-4 text-gray-500">Loading brands...</div>
                ) : subBrands.length === 0 ? (
                  <p className="text-gray-500 text-sm">No brands added yet</p>
                ) : (
                  <div className="space-y-2">
                    {subBrands.map(brand => (
                      <div
                        key={brand}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-800">{brand}</span>
                        <button
                          onClick={() => setDeleteBrandConfirm(brand)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete Brand Confirmation */}
              {deleteBrandConfirm && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    Delete brand <strong>"{deleteBrandConfirm}"</strong>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteBrandConfirm(null)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(deleteBrandConfirm)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
              </div>

              {/* Title and Message */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Category?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                This action cannot be undone. All subcategories and their configurations will be deleted.
              </p>

              {/* Category Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Category:</strong> {categories.find(c => c._id === deleteConfirm)?.name}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Subcategories:</strong> {categories.find(c => c._id === deleteConfirm)?.subcategories?.length || 0}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCategory(deleteConfirm, categories.find(c => c._id === deleteConfirm)?.name)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

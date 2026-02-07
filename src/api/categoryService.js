import api from './axios'

// Get all categories
export const getCategories = async () => {
  try {
    const { data } = await api.get('/categories')
    return data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

// Get single category
export const getCategoryById = async (id) => {
  try {
    const { data } = await api.get(`/categories/${id}`)
    return data
  } catch (error) {
    console.error('Error fetching category:', error)
    const message = error.response?.data?.error || error.message || 'Failed to fetch category'
    throw new Error(message)
  }
}

// Create category
export const createCategory = async (categoryData) => {
  try {
    const { data } = await api.post('/categories', categoryData)
    return data
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Add subcategory
export const addSubcategory = async (categoryId, subcategoryData) => {
  try {
    const { data } = await api.post(`/categories/${categoryId}/subcategories`, subcategoryData)
    return data
  } catch (error) {
    console.error('Error adding subcategory:', error)
    throw error
  }
}

// Update subcategory
export const updateSubcategory = async (categoryId, subcategoryId, subcategoryData) => {
  try {
    const { data } = await api.put(`/categories/${categoryId}/subcategories/${subcategoryId}`, subcategoryData)
    return data
  } catch (error) {
    console.error('Error updating subcategory:', error)
    throw error
  }
}

// Update category
export const updateCategory = async (id, categoryData) => {
  try {
    const { data } = await api.put(`/categories/${id}`, categoryData)
    return data
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Delete category
export const deleteCategory = async (id) => {
  try {
    const { data } = await api.delete(`/categories/${id}`)
    return data
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

// Get feature template for category/subcategory
export const getFeatureTemplate = async (categoryId, subcategoryId = null) => {
  try {
    const url = subcategoryId 
      ? `/categories/${categoryId}/template/${subcategoryId}`
      : `/categories/${categoryId}/template`
    const { data } = await api.get(url)
    return data
  } catch (error) {
    console.error('Error fetching template:', error)
    return { featureFields: [], specFields: [] }
  }
}

// Save feature template
export const saveFeatureTemplate = async (categoryId, templateData) => {
  try {
    const { data } = await api.post(`/categories/${categoryId}/template`, templateData)
    return data
  } catch (error) {
    console.error('Error saving template:', error)
    throw error
  }
}

export default {
  getCategories,
  getCategoryById,
  createCategory,
  addSubcategory,
  updateSubcategory,
  updateCategory,
  deleteCategory,
  getFeatureTemplate,
  saveFeatureTemplate
}

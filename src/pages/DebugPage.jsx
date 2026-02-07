import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function DebugPage() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      console.log('Products from API:', data)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug - Product Images</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Products</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map(product => (
                <button
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full text-left p-2 rounded transition ${
                    selectedProduct?._id === product._id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">{product._id}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Preview & Debug Info */}
        {selectedProduct && (
          <div className="lg:col-span-2 space-y-6">
            {/* Image Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Image Preview</h2>
              {selectedProduct.image ? (
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg border border-gray-200 mb-4"
                    onError={(e) => {
                      console.error('Image load error:', selectedProduct.image)
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%23999%22%3EImage not found%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded break-all">
                    {selectedProduct.image}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 text-red-600 p-4 rounded">
                  No image URL
                </div>
              )}
            </div>

            {/* Full Product Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Product JSON</h2>
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto border border-gray-200">
                {JSON.stringify(selectedProduct, null, 2)}
              </pre>
            </div>

            {/* Image URL Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Image URL Status</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Full URL:</span>
                  <br />
                  <code className="text-xs bg-gray-100 p-1 rounded block break-all">
                    {selectedProduct.image ? `http://localhost:5000${selectedProduct.image}` : 'N/A'}
                  </code>
                </div>
                <div className="pt-2">
                  <span className="font-semibold">Is Local Upload:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    selectedProduct.image?.startsWith('/uploads')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedProduct.image?.startsWith('/uploads') ? 'Yes (Uploaded)' : 'No (URL)'}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold">File Exists:</span>
                  <div className="text-xs text-gray-600 mt-1">
                    To verify, check backend: <code>/backend/uploads/products/</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Quick Test</h2>
              <button
                onClick={() => {
                  const img = new Image()
                  img.onload = () => console.log('✅ Image loads successfully')
                  img.onerror = () => console.error('❌ Image failed to load')
                  img.src = selectedProduct.image
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test Image Load
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-3">How to Debug</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-900 text-sm">
          <li>Select a product from the list</li>
          <li>Check if image URL is displayed</li>
          <li>Verify image preview loads</li>
          <li>Check the image URL path format</li>
          <li>For uploaded images, should start with <code className="bg-white px-1">/uploads/products/</code></li>
          <li>For URL images, should be full HTTP URL</li>
          <li>Click "Test Image Load" button to verify connectivity</li>
          <li>Check browser console (F12) for any errors</li>
        </ol>
      </div>
    </div>
  )
}

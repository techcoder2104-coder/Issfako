import { useEffect, useState } from 'react'
import api from '../api/axios'
import { ChevronDown, Edit2, MapPin, Phone, TrendingUp } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/orders')
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Orders error:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId) => {
    try {
      await api.put(`/admin/update-delivery/${orderId}`, {
        orderStatus: editStatus,
        deliveryNotes: ''
      })
      setEditingOrderId(null)
      fetchOrders()
      alert('Order status updated successfully')
    } catch (error) {
      alert('Failed to update order status: ' + error.message)
    }
  }

  const filteredOrders = orders.filter(order =>
    order._id?.includes(searchTerm) ||
    order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Orders Management</h1>
        <p className="text-gray-600">Manage all customer orders and update their status</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by order ID or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition flex justify-between items-center"
                onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">Order #{order._id?.slice(-8).toUpperCase()}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>{order.userId?.name}</span>
                    <span>₹{order.totalAmount?.toLocaleString()}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${expandedOrderId === order._id ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Order Details */}
              {expandedOrderId === order._id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {/* Status Update Section */}
                  <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Edit2 size={16} />
                        Update Order Status
                      </h4>
                      <p className="text-xs text-gray-500">
                        This updates the order timeline on customer's order page
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={editingOrderId === order._id ? editStatus : order.orderStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        onClick={() => setEditingOrderId(order._id)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                      {editingOrderId === order._id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(order._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      👉 To manage delivery assignment and tracking, go to <strong>Delivery Management</strong> page
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Customer</p>
                      <p className="font-semibold text-gray-900">{order.userId?.name}</p>
                      <p className="text-sm text-gray-600">{order.userId?.email}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                        <Phone size={14} />
                        {order.userId?.phone}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        <MapPin size={14} />
                        {order.shippingAddress?.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Items ({order.items?.length || 0})</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between pb-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-gray-900">₹{(item.price * item.quantity)?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                      <p className={`text-sm capitalize mt-2 ${
                        order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, MapPin, Phone, CheckCircle, Package, AlertCircle, Clock, Ban, Lock, Unlock } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'

export default function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState('deliveries') // 'deliveries' or 'persons'
  const [deliveries, setDeliveries] = useState([])
  const [deliveryPersons, setDeliveryPersons] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [deliveryZones, setDeliveryZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPersonModal, setShowPersonModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [deliveryForm, setDeliveryForm] = useState({
    orderId: '',
    deliveryPersonId: '',
    orderStatus: '',
    deliveryNotes: ''
  })

  const [personForm, setPersonForm] = useState({
    userId: '',
    deliveryPhone: '',
    vehicleType: 'bike',
    selectedZones: []
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'deliveries') {
        // Fetch deliveries data
        await fetchDeliveriesData()
      } else {
        const [personsResponse, usersResponse, zonesResponse] = await Promise.all([
          api.get('/admin/delivery-persons'),
          api.get('/admin/users'),
          api.get('/delivery-zones')
        ])
        setDeliveryPersons(personsResponse.data)
        setAllUsers(usersResponse.data)
        setDeliveryZones(Array.isArray(zonesResponse.data) ? zonesResponse.data : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDelivery = async (e) => {
    e.preventDefault()
    if (!deliveryForm.orderId || !deliveryForm.deliveryPersonId) {
      alert('Please select both order and delivery person')
      return
    }

    try {
      const response = await api.put(`/admin/assign-delivery/${deliveryForm.orderId}`, {
        deliveryPersonId: deliveryForm.deliveryPersonId
      })
      
      setShowModal(false)
      setDeliveryForm({ orderId: '', deliveryPersonId: '', orderStatus: '', deliveryNotes: '' })
      // Refetch both data
      await fetchDeliveriesData()
      alert('Delivery assigned successfully!')
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred'
      alert('Failed to assign delivery: ' + errorMessage)
    }
  }

  const fetchDeliveriesData = async () => {
    try {
      // Always fetch both orders and delivery persons
      const [ordersResponse, trackingResponse, personsResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/admin/all-deliveries'),
        api.get('/admin/delivery-persons')
      ])
      
      // Combine orders with their delivery tracking info
      const ordersWithDelivery = ordersResponse.data.map(order => {
        const tracking = trackingResponse.data.find(t => t.orderId?._id === order._id || t.orderId === order._id)
        return {
          ...order,
          delivery: tracking || null
        }
      })
      
      setDeliveries(ordersWithDelivery)
      setDeliveryPersons(personsResponse.data)
    } catch (error) {
      console.error('Error fetching deliveries data:', error)
    }
  }

  const handleUpdateDelivery = async (orderId) => {
    try {
      await api.put(`/admin/update-delivery/${orderId}`, {
        orderStatus: deliveryForm.orderStatus,
        deliveryNotes: deliveryForm.deliveryNotes
      })
      
      setSelectedDelivery(null)
      setDeliveryForm({ orderId: '', deliveryPersonId: '', orderStatus: '', deliveryNotes: '' })
      await fetchData()
    } catch (error) {
      alert('Failed to update delivery: ' + error.message)
    }
  }

  const handleCreateDeliveryPerson = async (e) => {
    e.preventDefault()
    if (!personForm.userId || !personForm.deliveryPhone || !personForm.vehicleType) {
      alert('Please fill all required fields')
      return
    }

    if (personForm.selectedZones.length === 0) {
      alert('Please select at least one delivery zone')
      return
    }

    try {
      // Create delivery person
      const dpResponse = await api.post('/admin/delivery-persons', {
        userId: personForm.userId,
        deliveryPhone: personForm.deliveryPhone,
        vehicleType: personForm.vehicleType
      })

      const deliveryPersonId = dpResponse.data._id

      // Add to selected zones
      for (const zoneId of personForm.selectedZones) {
        await api.post(`/delivery-zones/${zoneId}/assign-delivery-person`, {
          deliveryPersonId: deliveryPersonId,
          maxCapacity: 10
        })
      }

      alert('Delivery person created and assigned to zones successfully!')
      setShowPersonModal(false)
      setPersonForm({ userId: '', deliveryPhone: '', vehicleType: 'bike', selectedZones: [] })
      await fetchData()
    } catch (error) {
      alert('Failed to create delivery person: ' + error.message)
    }
  }

  const handleRemoveDeliveryPerson = async (personId) => {
    if (confirm('Are you sure you want to remove this delivery person?')) {
      try {
        await api.delete(`/admin/delivery-persons/${personId}`)
        toast.success('Delivery person removed successfully')
        await fetchData()
      } catch (error) {
        toast.error('Failed to remove delivery person: ' + error.message)
      }
    }
  }

  const handleBanDeliveryPerson = async (personId) => {
    if (!window.confirm('Are you sure you want to ban this delivery person?')) return
    try {
      await api.put(`/admin/delivery-persons/${personId}/ban`)
      toast.success('Delivery person banned successfully')
      await fetchData()
    } catch (error) {
      toast.error('Failed to ban delivery person: ' + error.response?.data?.message || error.message)
    }
  }

  const handleUnbanDeliveryPerson = async (personId) => {
    if (!window.confirm('Are you sure you want to unban this delivery person?')) return
    try {
      await api.put(`/admin/delivery-persons/${personId}/unban`)
      toast.success('Delivery person unbanned successfully')
      await fetchData()
    } catch (error) {
      toast.error('Failed to unban delivery person: ' + error.response?.data?.message || error.message)
    }
  }

  const handleSuspendDeliveryPerson = async (personId) => {
    if (!window.confirm('Are you sure you want to suspend this delivery person?')) return
    try {
      await api.put(`/admin/delivery-persons/${personId}/suspend`)
      toast.success('Delivery person suspended successfully')
      await fetchData()
    } catch (error) {
      toast.error('Failed to suspend delivery person: ' + error.response?.data?.message || error.message)
    }
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-600" size={18} />
      case 'out_for_delivery':
        return <Package className="text-orange-600" size={18} />
      case 'cancelled':
        return <AlertCircle className="text-red-600" size={18} />
      default:
        return <Clock className="text-gray-600" size={18} />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Delivery Management</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'deliveries'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Deliveries
          </button>
          <button
            onClick={() => setActiveTab('persons')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'persons'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Delivery Persons
          </button>
        </div>
      </div>

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <div>
          <button
            onClick={async () => {
              // Fetch delivery persons before opening modal
              try {
                const response = await api.get('/admin/delivery-persons')
                setDeliveryPersons(response.data)
              } catch (error) {
                console.error('Error fetching delivery persons:', error)
              }
              setShowModal(true)
            }}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Assign Delivery
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
          />

          {/* Deliveries List */}
          <div className="space-y-4">
            {deliveries
              .filter(d => 
                !searchTerm || 
                d._id?.includes(searchTerm) || 
                d.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((delivery) => (
                <div key={delivery._id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-semibold text-lg text-gray-900">Order #{delivery._id.slice(-8).toUpperCase()}</h3>
                       <p className="text-sm text-gray-600">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2 ${getStatusColor(delivery.orderStatus)}`}>
                       {getStatusIcon(delivery.orderStatus)}
                       {delivery.orderStatus.replace('_', ' ').toUpperCase()}
                     </span>
                   </div>

                  <div className="grid md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                    {/* Customer */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Customer</p>
                      <p className="text-gray-900">{delivery.userId?.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone size={14} />
                        {delivery.shippingAddress?.phone}
                      </p>
                    </div>

                    {/* Delivery Status */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Delivery Status</p>
                      {delivery.delivery?.deliveryPersonId ? (
                        <>
                          <p className="text-gray-900">{delivery.delivery.deliveryPersonId?.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {delivery.delivery?.status?.replace('_', ' ').toUpperCase()}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500 italic">⏳ Not Assigned</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">₹{delivery.totalAmount?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {!delivery.delivery?.deliveryPersonId && delivery.orderStatus !== 'delivered' && delivery.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery)
                          setDeliveryForm({ ...deliveryForm, orderId: delivery._id })
                          setShowModal(true)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Assign Delivery
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedDelivery(delivery)
                        setDeliveryForm({
                          orderId: delivery._id,
                          orderStatus: delivery.orderStatus,
                          deliveryNotes: delivery.deliveryNotes || ''
                        })
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Update
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Delivery Persons Tab */}
      {activeTab === 'persons' && (
        <div>
          <button
            onClick={() => {
              setPersonForm({ userId: '', deliveryPhone: '', vehicleType: 'bike', selectedZones: [] })
              setShowPersonModal(true)
            }}
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Add Delivery Person
          </button>

          {/* Delivery Persons List */}
          <div className="grid md:grid-cols-2 gap-6">
            {deliveryPersons.map((person) => (
              <div key={person._id} className="bg-white rounded-lg border border-gray-200 p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="font-semibold text-lg text-gray-900">{person.userId?.name || person.name}</h3>
                     <p className="text-sm text-gray-600">{person.userId?.email || person.email}</p>
                     <p className={`text-xs mt-2 font-medium ${
                       person.isBanned
                         ? 'text-red-600'
                         : person.isSuspended
                         ? 'text-yellow-600'
                         : 'text-green-600'
                     }`}>
                       {person.isBanned ? '🚫 Banned' : person.isSuspended ? '⏸️ Suspended' : '✓ Active'}
                     </p>
                   </div>
                   <div className="flex gap-2">
                     {!person.isBanned && (
                       <button
                         onClick={() => handleBanDeliveryPerson(person._id)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                         title="Ban Delivery Person"
                       >
                         <Ban size={18} />
                       </button>
                     )}
                     {person.isBanned && (
                       <button
                         onClick={() => handleUnbanDeliveryPerson(person._id)}
                         className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                         title="Unban Delivery Person"
                       >
                         <Unlock size={18} />
                       </button>
                     )}
                     {!person.isSuspended && (
                       <button
                         onClick={() => handleSuspendDeliveryPerson(person._id)}
                         className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                         title="Suspend Delivery Person"
                       >
                         <Lock size={18} />
                       </button>
                     )}
                     <button
                       onClick={() => handleRemoveDeliveryPerson(person._id)}
                       className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                       title="Delete Delivery Person"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="text-gray-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{person.deliveryPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="text-gray-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Type</p>
                      <p className="font-medium text-gray-900 capitalize">{person.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-gray-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-gray-900 capitalize">{person.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deliveryPersons.length === 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No delivery persons yet</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Delivery Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Delivery</h2>
            <form onSubmit={handleAssignDelivery} className="space-y-4">
              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                <select
                  value={deliveryForm.orderId}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, orderId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Order</option>
                  {deliveries
                    .map(d => (
                      <option key={d._id} value={d._id}>
                        Order #{d._id.slice(-6)} - {d.userId?.name} (₹{d.totalAmount}) {d.delivery?.deliveryPersonId ? '(Assigned)' : '(Unassigned)'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Delivery Person */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Person</label>
                <select
                  value={deliveryForm.deliveryPersonId}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPersonId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Delivery Person</option>
                  {deliveryPersons.length > 0 ? (
                    deliveryPersons.map(person => (
                      <option key={person._id} value={person._id}>
                        {person.userId?.name || person.name} - {person.vehicleType}
                      </option>
                    ))
                  ) : (
                    <option disabled>No delivery persons available</option>
                  )}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedDelivery(null)
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Delivery Person Modal */}
      {showPersonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Delivery Person</h2>
            <form onSubmit={handleCreateDeliveryPerson} className="space-y-4">
                {/* User */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">User</label>
                  <select
                    value={personForm.userId}
                    onChange={(e) => setPersonForm({ ...personForm, userId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select User</option>
                    {allUsers
                      .filter(u => !u.isDeliveryPerson)
                      .map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personForm.deliveryPhone}
                    onChange={(e) => setPersonForm({ ...personForm, deliveryPhone: e.target.value })}
                    placeholder="10-digit phone number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    value={personForm.vehicleType}
                    onChange={(e) => setPersonForm({ ...personForm, vehicleType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="auto">Auto</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                {/* Delivery Zones */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Zones *</label>
                  {deliveryZones.length > 0 ? (
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {deliveryZones.map(zone => (
                        <label key={zone._id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={personForm.selectedZones.includes(zone._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPersonForm({
                                  ...personForm,
                                  selectedZones: [...personForm.selectedZones, zone._id]
                                })
                              } else {
                                setPersonForm({
                                  ...personForm,
                                  selectedZones: personForm.selectedZones.filter(z => z !== zone._id)
                                })
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{zone.name} ({zone.city})</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No delivery zones available. Create zones first.</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {personForm.selectedZones.length} zone(s)
                  </p>
                </div>

                {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPersonModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

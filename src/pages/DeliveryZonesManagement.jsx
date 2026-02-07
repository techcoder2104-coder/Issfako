import { useState, useEffect } from 'react'
import api from '../api/axios'
import { Plus, Trash2, Edit2, MapPin, Users } from 'lucide-react'

export default function DeliveryZonesManagement() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)
  const [showZoneDetails, setShowZoneDetails] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    pincodes: '',
    areas: ''
  })

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      const response = await api.get('/delivery-zones')
      setZones(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching zones:', error)
      setZones([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.city || !formData.pincodes) {
      alert('Name, city, and pincodes are required')
      return
    }

    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        pincodes: formData.pincodes.split(',').map(p => p.trim()),
        areas: formData.areas ? formData.areas.split(',').map(a => a.trim()) : []
      }

      if (editingZone) {
        await api.put(`/delivery-zones/${editingZone._id}`, payload)
        alert('Zone updated successfully')
      } else {
        await api.post('/delivery-zones/create', payload)
        alert('Zone created successfully')
      }

      setFormData({ name: '', city: '', pincodes: '', areas: '' })
      setEditingZone(null)
      setShowForm(false)
      fetchZones()
    } catch (error) {
      alert('Error saving zone: ' + error.response?.data?.error)
    }
  }

  const handleEdit = (zone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      city: zone.city,
      pincodes: zone.pincodes.join(', '),
      areas: zone.areas.join(', ')
    })
    setShowForm(true)
  }

  const handleDelete = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return

    try {
      await api.delete(`/delivery-zones/${zoneId}`)
      alert('Zone deleted successfully')
      fetchZones()
    } catch (error) {
      alert('Error deleting zone: ' + error.response?.data?.error)
    }
  }

  const handleViewDetails = async (zone) => {
    try {
      const response = await api.get(`/delivery-zones/${zone._id}`)
      setSelectedZone(response.data.zone)
      setShowZoneDetails(true)
    } catch (error) {
      alert('Error loading zone details')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Zones</h1>
        <button
          onClick={() => {
            setEditingZone(null)
            setFormData({ name: '', city: '', pincodes: '', areas: '' })
            setShowForm(!showForm)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> New Zone
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingZone ? 'Edit Zone' : 'Create New Zone'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Zone Name (e.g., South Delhi)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <input
              type="text"
              name="pincodes"
              value={formData.pincodes}
              onChange={handleInputChange}
              placeholder="Pincodes (comma-separated, e.g., 110001, 110002, 110003)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="areas"
              value={formData.areas}
              onChange={handleInputChange}
              placeholder="Areas (comma-separated, e.g., Dwarka, Vasant Kunj, Chatarpur)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
                <p className="text-sm text-gray-600">{zone.city}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                zone.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {zone.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span>{zone.pincodes.length} pincodes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} />
                <span>{zone.assignedDeliveryPersons?.length || 0} delivery persons</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(zone)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 text-sm font-medium"
              >
                View Details
              </button>
              <button
                onClick={() => handleEdit(zone)}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(zone._id)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {zones.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No delivery zones created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create First Zone
          </button>
        </div>
      )}

      {/* Zone Details Modal */}
      {showZoneDetails && selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{selectedZone.name}</h2>
              <button
                onClick={() => setShowZoneDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Zone Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">City</p>
                    <p className="font-medium text-gray-900">{selectedZone.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-medium ${selectedZone.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedZone.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pincodes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedZone.pincodes.map((pincode, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {pincode}
                    </span>
                  ))}
                </div>
              </div>

              {selectedZone.areas?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedZone.areas.map((area, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedZone.assignedDeliveryPersons?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Assigned Delivery Persons ({selectedZone.assignedDeliveryPersons.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedZone.assignedDeliveryPersons.map((dp, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{dp.deliveryPersonId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{dp.deliveryPersonId?.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Load: {dp.currentLoad}/{dp.maxCapacity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

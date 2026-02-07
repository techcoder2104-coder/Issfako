import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import api from '../api/axios'

export default function DeliveryRequestsManagement() {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/delivery-requests/admin/all-requests${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`
      )
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
      alert('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    if (confirm('Approve this delivery request?')) {
      try {
        await api.put(`/delivery-requests/admin/approve/${requestId}`)
        await fetchRequests()
        alert('Request approved successfully!')
      } catch (error) {
        alert('Failed to approve request: ' + error.message)
      }
    }
  }

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      await api.put(`/delivery-requests/admin/reject/${requestId}`, { rejectionReason: rejectReason })
      setShowRejectModal(false)
      setRejectReason('')
      await fetchRequests()
      alert('Request rejected successfully!')
    } catch (error) {
      alert('Failed to reject request: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const badgeClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badgeClasses[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={18} />
      case 'rejected':
        return <XCircle className="text-red-600" size={18} />
      default:
        return <Clock className="text-yellow-600" size={18} />
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Delivery Requests</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-4">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Delivery Area</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vehicle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No delivery requests found
                </td>
              </tr>
            ) : (
              requests.map(request => (
                <tr key={request._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-600">{request.userId?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{request.phone}</p>
                    <p className="text-xs text-gray-500">{request.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.deliveryArea}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 capitalize">{request.vehicleType}</p>
                      <p className="text-xs text-gray-600">{request.vehicleNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowDetailsModal(true)
                        }}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition text-sm font-medium flex items-center gap-1"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowRejectModal(true)
                            }}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium flex items-center gap-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Details</h2>
            
            <div className="space-y-4">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Area</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.deliveryArea}</p>
                </div>
              </div>

              {/* Government IDs */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Government IDs</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Aadhar Number</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.aadharNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.panNumber}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
                <p className="text-sm text-gray-700">
                  {selectedRequest.address?.street}<br/>
                  {selectedRequest.address?.city}, {selectedRequest.address?.state} {selectedRequest.address?.pincode}
                </p>
              </div>

              {/* Vehicle Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Vehicle Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedRequest.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Number</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience (Years)</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.experienceYears}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              {selectedRequest.bankAccountNumber && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Bank Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.bankAccountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IFSC Code</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.ifscCode}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="border-t pt-4 bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-semibold">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Request</h2>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

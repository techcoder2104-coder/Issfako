import { useState, useEffect } from 'react'
import { X, Phone, Mail, MapPin, Check, Clock } from 'lucide-react'
import api from '../api/axios'

export default function UserDetailsModal({ userId, isOpen, onClose }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/auth/users`)
      const users = Array.isArray(response.data) ? response.data : []
      const foundUser = users.find(u => u._id === userId)
      
      if (foundUser) {
        setUser(foundUser)
      } else {
        setError('User not found')
      }
    } catch (err) {
      setError('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading user details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {user.role}
                      {user.isDeliveryPerson && ' • Delivery Person'}
                      {user.isAdmin && ' • Admin'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Onboarding Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {user.phoneVerified ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Clock size={18} className="text-yellow-600" />
                      )}
                      <span className="text-gray-900 font-medium">Phone Verification</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.phoneVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.phoneVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {user.emailVerified ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Clock size={18} className="text-yellow-600" />
                      )}
                      <span className="text-gray-900 font-medium">Email Verification</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.emailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {user.addressAdded ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Clock size={18} className="text-yellow-600" />
                      )}
                      <span className="text-gray-900 font-medium">Address Added</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.addressAdded
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.addressAdded ? 'Added' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2">
                      {user.onboardingCompleted ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Clock size={18} className="text-red-600" />
                      )}
                      <span className="text-gray-900 font-bold">Onboarding Complete</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.onboardingCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.onboardingCompleted ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Addresses */}
              {user.addresses && user.addresses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    Saved Addresses ({user.addresses.length})
                  </h3>
                  <div className="space-y-3">
                    {user.addresses.map((address, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{address.street}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                            {address.isDefault && (
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                    <p className="font-mono text-gray-900 break-all">{user._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Joined</p>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

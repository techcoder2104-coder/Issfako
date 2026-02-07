import { useEffect, useState } from 'react'
import api from '../api/axios'
import { toast } from 'react-toastify'
import UserDetailsModal from './UserDetailsModal'
import { Eye, Ban, Lock, Unlock, Trash2 } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Users error:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return
    try {
      await api.put(`/auth/users/${userId}/ban`)
      toast.success('User banned successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to ban user: ' + error.response?.data?.message || error.message)
    }
  }

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return
    try {
      await api.put(`/auth/users/${userId}/unban`)
      toast.success('User unbanned successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to unban user: ' + error.response?.data?.message || error.message)
    }
  }

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return
    try {
      await api.put(`/auth/users/${userId}/suspend`)
      toast.success('User suspended successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to suspend user: ' + error.response?.data?.message || error.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    try {
      await api.delete(`/auth/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user: ' + error.response?.data?.message || error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isBanned
                      ? 'bg-red-100 text-red-800'
                      : user.isSuspended
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isBanned ? 'Banned' : user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUserId(user._id)
                        setShowDetailsModal(true)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-xs"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    {!user.isBanned && (
                      <button
                        onClick={() => handleBanUser(user._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-xs"
                        title="Ban User"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                    {user.isBanned && (
                      <button
                        onClick={() => handleUnbanUser(user._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-xs"
                        title="Unban User"
                      >
                        <Unlock size={14} />
                      </button>
                    )}
                    {!user.isSuspended && (
                      <button
                        onClick={() => handleSuspendUser(user._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition text-xs"
                        title="Suspend User"
                      >
                        <Lock size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition text-xs"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </div>

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedUserId(null)
        }}
      />
    </div>
  )
}

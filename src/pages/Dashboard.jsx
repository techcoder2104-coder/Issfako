import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import StatCard from '../components/StatCard'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const requests = [
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/auth/users').catch(() => ({ data: [] })),
      ]

      const [productsRes, ordersRes, usersRes] = await Promise.all(requests)

      let totalRevenue = 0
      if (ordersRes.data && ordersRes.data.length > 0) {
        totalRevenue = ordersRes.data.reduce((sum, order) => {
          return sum + (order.totalAmount || order.total || 0)
        }, 0)
      }

      setStats({
        totalProducts: productsRes.data ? productsRes.data.length : 0,
        totalOrders: ordersRes.data ? ordersRes.data.length : 0,
        totalUsers: usersRes.data ? usersRes.data.length : 0,
        totalRevenue,
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      // Set default values if all requests fail
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center text-gray-500 py-8">
          No recent activity
        </div>
      </div>
    </div>
  )
}

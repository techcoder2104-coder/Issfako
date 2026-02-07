import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  LineChart,
  PieChart,
} from "lucide-react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import api from "../api/axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    conversationRate: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch basic stats
      const [productsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/orders").catch(() => ({ data: [] })),
        api.get("/auth/users").catch(() => ({ data: [] })),
        api.get(`/admin/analytics?timeframe=${timeframe}`).catch(() => ({ data: {} })),
      ]);

      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];

      let totalRevenue = 0;
      orders.forEach((order) => {
        totalRevenue += order.totalAmount || order.total || 0;
      });

      const averageOrderValue =
        orders.length > 0 ? totalRevenue / orders.length : 0;
      const conversationRate =
        users.length > 0
          ? ((orders.length / users.length) * 100).toFixed(2)
          : 0;

      setStats({
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        averageOrderValue: Math.round(averageOrderValue),
        conversationRate,
      });

      // Process chart data
      const analytics = analyticsRes.data;
      if (analytics.revenueData) {
        setChartData({
          revenueChart: {
            labels: analytics.revenueData.map((d) => d._id),
            datasets: [
              {
                label: "Daily Revenue (₹)",
                data: analytics.revenueData.map((d) => d.revenue),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
              },
            ],
          },
          topProductsChart: {
            labels: analytics.topProducts.map((p) => p.productName || "Unknown"),
            datasets: [
              {
                label: "Revenue (₹)",
                data: analytics.topProducts.map((p) => p.revenue),
                backgroundColor: [
                  "#3b82f6",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#06b6d4",
                  "#ec4899",
                  "#f97316",
                  "#6366f1",
                  "#14b8a6",
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          },
          categoryChart: {
            labels: analytics.categoryStats.map((c) => c._id || "Uncategorized"),
            datasets: [
              {
                label: "Sales (₹)",
                data: analytics.categoryStats.map((c) => c.sales),
                backgroundColor: [
                  "rgba(59, 130, 246, 0.8)",
                  "rgba(16, 185, 129, 0.8)",
                  "rgba(245, 158, 11, 0.8)",
                  "rgba(239, 68, 68, 0.8)",
                  "rgba(139, 92, 246, 0.8)",
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          },
          userChart: {
            labels: ["Active", "Banned", "Suspended"],
            datasets: [
              {
                data: [
                  (analytics.userStats?.active?.[0]?.count || 0),
                  (analytics.userStats?.banned?.[0]?.count || 0),
                  (analytics.userStats?.suspended?.[0]?.count || 0),
                ],
                backgroundColor: [
                  "rgba(16, 185, 129, 0.8)",
                  "rgba(239, 68, 68, 0.8)",
                  "rgba(245, 158, 11, 0.8)",
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          },
          orderStatusChart: {
            labels: analytics.orderStats.map((o) => 
              o._id.charAt(0).toUpperCase() + o._id.slice(1).replace(/_/g, " ")
            ),
            datasets: [
              {
                label: "Orders",
                data: analytics.orderStats.map((o) => o.count),
                backgroundColor: [
                  "#3b82f6",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          },
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatBox = ({ icon: Icon, label, value, color }) => (
    <div
      className="bg-white rounded-lg shadow p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon size={32} className="text-gray-400" />
      </div>
    </div>
  );

  const ChartContainer = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="relative h-80">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics & Reports
        </h1>
        <div className="flex gap-2">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeframe(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeframe === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatBox
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          color="#10b981"
        />
        <StatBox
          icon={ShoppingCart}
          label="Total Orders"
          value={stats.totalOrders}
          color="#3b82f6"
        />
        <StatBox
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="#8b5cf6"
        />
        <StatBox
          icon={BarChart3}
          label="Total Products"
          value={stats.totalProducts}
          color="#f59e0b"
        />
        <StatBox
          icon={TrendingUp}
          label="Avg. Order Value"
          value={`₹${stats.averageOrderValue.toLocaleString()}`}
          color="#ec4899"
        />
        <StatBox
          icon={Calendar}
          label="Conversion Rate"
          value={`${stats.conversationRate}%`}
          color="#06b6d4"
        />
      </div>

      {/* Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <ChartContainer title="Revenue Trend" icon={LineChart}>
            <Line
              data={chartData.revenueChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => "₹" + value.toLocaleString() },
                  },
                },
              }}
            />
          </ChartContainer>

          {/* Top Products */}
          <ChartContainer title="Top 10 Products by Revenue" icon={BarChart3}>
            <Bar
              data={chartData.topProductsChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                  legend: { position: "top" },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 12,
                    callbacks: {
                      label: (context) =>
                        "₹" + Math.round(context.parsed.x).toLocaleString(),
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: { callback: (value) => "₹" + value.toLocaleString() },
                  },
                },
              }}
            />
          </ChartContainer>

          {/* Sales by Category */}
          <ChartContainer title="Sales by Category" icon={PieChart}>
            <Pie
              data={chartData.categoryChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 12,
                    callbacks: {
                      label: (context) =>
                        "₹" + Math.round(context.parsed).toLocaleString(),
                    },
                  },
                },
              }}
            />
          </ChartContainer>

          {/* User Status Distribution */}
          <ChartContainer title="User Status Distribution" icon={Users}>
            <Doughnut
              data={chartData.userChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 12,
                  },
                },
              }}
            />
          </ChartContainer>

          {/* Order Status Breakdown */}
          <ChartContainer title="Order Status Breakdown" icon={ShoppingCart}>
            <Bar
              data={chartData.orderStatusChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 12,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </ChartContainer>
        </div>
      )}

      {/* Empty State */}
      {!chartData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-800">No chart data available</p>
        </div>
      )}
    </div>
  );
}

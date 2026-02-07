import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'
import ProductTagsPage from './pages/ProductTagsPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ResetAnalyticsPage from './pages/ResetAnalyticsPage'
import DebugPage from './pages/DebugPage'
import LoginPage from './pages/LoginPage'
import CategoriesManagement from './pages/CategoriesManagement'
import FeaturesTemplate from './pages/FeaturesTemplate'
import BannersPage from './pages/BannersPage'
import DeliveryManagement from './pages/DeliveryManagement'
import DeliveryRequestsManagement from './pages/DeliveryRequestsManagement'
import DeliveryZonesManagement from './pages/DeliveryZonesManagement'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/product-tags" element={<ProductTagsPage />} />
              <Route path="/categories" element={<CategoriesManagement />} />
              <Route path="/features-template/:categoryId" element={<FeaturesTemplate />} />
              <Route path="/banners" element={<BannersPage />} />
              <Route path="/delivery" element={<DeliveryManagement />} />
              <Route path="/delivery-requests" element={<DeliveryRequestsManagement />} />
              <Route path="/delivery-zones" element={<DeliveryZonesManagement />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reset-analytics" element={<ResetAnalyticsPage />} />
              <Route path="/debug" element={<DebugPage />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </AuthProvider>
  )
}

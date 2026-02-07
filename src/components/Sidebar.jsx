import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Folder,
  Tags,
  Image,
  Truck,
  FileCheck,
  MapPin,
  RotateCcw,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/products", label: "Products", icon: Package },
    { path: "/product-tags", label: "Product Tags", icon: Tags },
    { path: "/categories", label: "Categories", icon: Folder },
    { path: "/banners", label: "Banners", icon: Image },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/delivery", label: "Delivery Management", icon: Truck },
    { path: "/delivery-zones", label: "Delivery Zones", icon: MapPin },
    { path: "/delivery-requests", label: "Delivery Requests", icon: FileCheck },
    { path: "/users", label: "Users", icon: Users },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    {
      path: "/reset-analytics",
      label: "Reset Data",
      icon: RotateCcw,
      isDangerous: true,
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Tradon Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {menuItems.map(({ path, label, icon: Icon, isDangerous }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-300 ${
              isActive(path)
                ? isDangerous
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
                : isDangerous
                  ? "text-red-400 hover:bg-red-900/20"
                  : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

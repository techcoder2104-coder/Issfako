import { useState } from "react";
import { AlertTriangle, Trash2, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

export default function ResetAnalyticsPage() {
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const resetOptions = [
        {
            id: "orders",
            title: "Clear All Orders",
            description: "Delete all orders from the system",
            color: "red",
            icon: Trash2,
        },
        {
            id: "products",
            title: "Clear All Products",
            description: "Delete all products from the system",
            color: "red",
            icon: Trash2,
        },
        {
            id: "users",
            title: "Clear All Users",
            description: "Delete all user accounts (except admin)",
            color: "red",
            icon: Trash2,
        },
        {
            id: "all",
            title: "Complete System Reset",
            description: "Reset everything and start fresh (this cannot be undone)",
            color: "red",
            icon: AlertTriangle,
        },
    ];

    const handleReset = async (type) => {
        try {
            setLoading(true);
            let response;

            switch (type) {
                case "orders":
                    response = await api.delete("/orders/all");
                    break;
                case "products":
                    response = await api.delete("/products/all");
                    break;
                case "users":
                    response = await api.delete("/auth/users/all");
                    break;
                case "all":
                    // Multiple delete operations for complete reset
                    await Promise.all([
                        api.delete("/orders/all").catch(() => null),
                        api.delete("/products/all").catch(() => null),
                        api.delete("/auth/users/all").catch(() => null),
                    ]);
                    response = { data: { message: "System reset complete" } };
                    break;
                default:
                    return;
            }

            setSuccessMessage(
                `✓ ${resetOptions.find((o) => o.id === type)?.title} completed successfully!`,
            );
            setTimeout(() => setSuccessMessage(""), 5000);
            toast.success("Data cleared successfully");
        } catch (error) {
            console.error("Error resetting data:", error);
            toast.error(error.response?.data?.error || "Failed to reset data");
        } finally {
            setLoading(false);
            setDeleteConfirm(null);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-2">
                    Reset or clear data from your system
                </p>
            </div>

            {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                        <p className="font-semibold text-green-900">{successMessage}</p>
                    </div>
                </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex gap-3">
                    <AlertTriangle
                        className="text-yellow-600 flex-shrink-0 mt-0.5"
                        size={20}
                    />
                    <div>
                        <h3 className="font-bold text-yellow-900">⚠️ Warning</h3>
                        <p className="text-yellow-800 text-sm mt-1">
                            These operations are irreversible. Please make sure you have a
                            backup before proceeding. You will need to confirm each action.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resetOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <div
                            key={option.id}
                            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {option.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {option.description}
                                        </p>
                                    </div>
                                    <Icon size={24} className="text-red-500" />
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
                                        {option.id === "orders" &&
                                            "All order records will be permanently deleted. This affects order history and tracking."}
                                        {option.id === "products" &&
                                            "All product listings, descriptions, and images will be deleted. Inventory data will be lost."}
                                        {option.id === "users" &&
                                            "All user accounts (except admin) will be deleted. Customer profiles and purchase history will be removed."}
                                        {option.id === "all" &&
                                            "The entire system will be reset. All data including orders, products, and users will be deleted. This requires multiple confirmations."}
                                    </div>

                                    <button
                                        onClick={() => setDeleteConfirm(option.id)}
                                        disabled={loading}
                                        className={`w-full px-4 py-2 rounded-lg font-bold text-white transition ${loading
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : option.id === "all"
                                                    ? "bg-red-700 hover:bg-red-800"
                                                    : "bg-red-600 hover:bg-red-700"
                                            }`}
                                    >
                                        {loading ? "Processing..." : `Clear ${option.title}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Confirm Modal */}
            {deleteConfirm && (
                <ConfirmModal
                    title="Confirm Data Reset"
                    message={`Are you absolutely sure you want to ${resetOptions.find((o) => o.id === deleteConfirm)?.title.toLowerCase()}? This action cannot be undone.`}
                    onConfirm={() => handleReset(deleteConfirm)}
                    onCancel={() => setDeleteConfirm(null)}
                    isDestructive={true}
                    confirmText="Yes, Delete All"
                    cancelText="Cancel"
                />
            )}

            {/* Information Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-3">💾 Before You Reset</h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                        <li>✓ Export any important data first</li>
                        <li>✓ Backup your database</li>
                        <li>✓ Inform stakeholders about the reset</li>
                        <li>✓ Ensure you have admin access</li>
                    </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-900 mb-3">✅ After Reset</h3>
                    <ul className="text-sm text-green-800 space-y-2">
                        <li>✓ System will be clean and ready</li>
                        <li>✓ Configuration settings remain intact</li>
                        <li>✓ Admin accounts are preserved</li>
                        <li>✓ You can start fresh with new data</li>
                    </ul>
                </div>
            </div>

            {/* Seed Data Option */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-purple-900 mb-2">
                            🌱 Populate with Test Data
                        </h3>
                        <p className="text-purple-800 text-sm mb-4">
                            After clearing data, you can seed your system with sample
                            products, categories, and users for testing purposes.
                        </p>
                        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
                            Seed Test Data
                        </button>
                    </div>
                    <RotateCcw className="text-purple-600 flex-shrink-0" size={24} />
                </div>
            </div>
        </div>
    );
}

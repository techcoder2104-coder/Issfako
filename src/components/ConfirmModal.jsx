import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  isDangerous = true
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className={`flex items-center gap-3 p-6 border-b ${isDangerous ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
          {isDangerous && <AlertTriangle className="text-red-600" size={24} />}
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-gray-700 text-center">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white transition disabled:opacity-50 ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

const colorClasses = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue' }) {
  const { bg, icon, border } = colorClasses[color]

  return (
    <div className={`${bg} border ${border} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${icon} p-3 bg-white rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

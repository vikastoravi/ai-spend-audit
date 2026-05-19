import { useEffect } from 'react'

export default function Toast({ id, message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [id, onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-gray-800',
  }[type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type]

  return (
    <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
      <span className="text-lg font-bold">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

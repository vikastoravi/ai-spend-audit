import { useState, useCallback } from 'react'
import Toast from '@/components/Toast'

export default function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const closeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        </div>
      ))}
    </div>
  )

  return {
    showToast,
    ToastContainer,
  }
}

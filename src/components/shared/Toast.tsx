import { useToast } from '../../context/ToastContext'

const typeClasses = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-700 text-white',
}

export function ToastList() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${typeClasses[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

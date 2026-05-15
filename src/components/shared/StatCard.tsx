import { useState } from 'react'
import { useToast } from '../../context/ToastContext'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
}

export function StatCard({ label, value, subtext }: StatCardProps) {
  const [hovered, setHovered] = useState(false)
  const { addToast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      addToast(`Copied: ${value}`, 'success')
    })
  }

  return (
    <div
      className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCopy}
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtext && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>
      )}
      {hovered && (
        <div className="absolute top-3 right-3 text-slate-400 dark:text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

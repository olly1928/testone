import type { PenetrationStatus } from '../../types/database'

const STATUSES: PenetrationStatus[] = [
  'Unmapped',
  'Researching',
  'Outreach sent',
  'In conversation',
  'Relationship established',
]

const ACTIVE: Record<PenetrationStatus, string> = {
  Unmapped: 'bg-slate-400 text-white border-transparent',
  Researching: 'bg-blue-500 text-white border-transparent',
  'Outreach sent': 'bg-amber-500 text-white border-transparent',
  'In conversation': 'bg-orange-500 text-white border-transparent',
  'Relationship established': 'bg-green-500 text-white border-transparent',
}

const IDLE: Record<PenetrationStatus, string> = {
  Unmapped: 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400',
  Researching: 'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400',
  'Outreach sent': 'border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400',
  'In conversation': 'border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400',
  'Relationship established': 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400',
}

export const STATUS_TAG: Record<PenetrationStatus, string> = {
  Unmapped: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  Researching: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Outreach sent': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'In conversation': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Relationship established': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export const STATUS_DOT: Record<PenetrationStatus, string> = {
  Unmapped: 'bg-slate-400',
  Researching: 'bg-blue-500',
  'Outreach sent': 'bg-amber-500',
  'In conversation': 'bg-orange-500',
  'Relationship established': 'bg-green-500',
}

interface Props {
  current: PenetrationStatus
  onChange: (status: PenetrationStatus) => void
}

export function PenetrationSelector({ current, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            s === current
              ? ACTIVE[s]
              : `${IDLE[s]} bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50`
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

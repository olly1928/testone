import { useState, useMemo } from 'react'
import { useExecutives } from '../../hooks/useExecutives'
import { useContactTracking } from '../../hooks/useContactTracking'
import { useSegments } from '../../hooks/useSegments'
import type { Executive, RelationshipStatus, ExecutiveLevel } from '../../types/database'

// Extend Executive with DB column not yet in the base interface
type ExecFull = Executive & {
  is_nordics_benelux_relevant?: boolean | null
}

type FilterKey = 'all' | 'board' | 'exco' | 'functional' | 'priority' | 'new' | 'nordics'
type SortKey = 'name' | 'segment' | 'level' | 'priority' | 'status'
type SortDir = 'asc' | 'desc'

interface Props {
  onExecSelect: (exec: Executive) => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

const LEVEL_RANK: Record<string, number> = {
  'Board of Management': 0,
  'Executive Committee': 1,
  'Functional Leader': 2,
  'Supervisory Board': 3,
}

const STATUS_RANK: Record<RelationshipStatus, number> = {
  'Active relationship': 0,
  'Had a conversation': 1,
  'Outreach sent': 2,
  Researched: 3,
  'No contact': 4,
}

const STATUS_COLOURS: Record<RelationshipStatus, { dot: string; text: string }> = {
  'No contact': {
    dot: 'bg-slate-400',
    text: 'text-slate-500 dark:text-slate-400',
  },
  Researched: {
    dot: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  'Outreach sent': {
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  'Had a conversation': {
    dot: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
  },
  'Active relationship': {
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
}

const LEVEL_TAG: Record<ExecutiveLevel, string> = {
  'Board of Management':
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Executive Committee':
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Functional Leader':
    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'Supervisory Board':
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

const PRIORITY_TAG: Record<string, string> = {
  High: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

const FILTERS: { key: FilterKey; label: string; tooltip?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'board', label: 'Board of Management' },
  { key: 'exco', label: 'Executive Committee' },
  { key: 'functional', label: 'Functional Leaders' },
  { key: 'priority', label: 'High priority' },
  { key: 'new', label: 'New in role' },
  {
    key: 'nordics',
    label: 'Nordics & Benelux',
    tooltip:
      'Philips HQ is in Amsterdam. This surfaces contacts most relevant to a Benelux/Nordics territory.',
  },
]

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name & Title' },
  { key: 'segment', label: 'Segment / Function' },
  { key: 'level', label: 'Level' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 opacity-20">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

// ── Main component ────────────────────────────────────────────────────────────

export function KeyContacts({ onExecSelect }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { executives, loading: execLoading } = useExecutives()
  const { trackingMap, loading: trackingLoading } = useContactTracking()
  const { segments } = useSegments()

  const segmentMap = useMemo(
    () => Object.fromEntries(segments.map((s) => [s.id, s.name])),
    [segments],
  )

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const execs = executives as unknown as ExecFull[]
    const lc = search.toLowerCase()

    return execs
      .filter((exec) => {
        if (lc) {
          const seg = segmentMap[exec.segment_id ?? ''] ?? ''
          if (
            !exec.name.toLowerCase().includes(lc) &&
            !exec.title.toLowerCase().includes(lc) &&
            !seg.toLowerCase().includes(lc)
          )
            return false
        }
        switch (filter) {
          case 'board':
            return exec.level === 'Board of Management'
          case 'exco':
            return exec.level === 'Executive Committee'
          case 'functional':
            return exec.level === 'Functional Leader'
          case 'priority':
            return exec.priority === 'High'
          case 'new':
            return exec.flag === 'new'
          case 'nordics':
            return exec.is_nordics_benelux_relevant === true
          default:
            return true
        }
      })
      .sort((a, b) => {
        let cmp = 0
        switch (sortKey) {
          case 'name':
            cmp = a.name.localeCompare(b.name)
            break
          case 'segment':
            cmp = (segmentMap[a.segment_id ?? ''] ?? '').localeCompare(
              segmentMap[b.segment_id ?? ''] ?? '',
            )
            break
          case 'level':
            cmp = (LEVEL_RANK[a.level] ?? 99) - (LEVEL_RANK[b.level] ?? 99)
            break
          case 'priority':
            cmp =
              (PRIORITY_RANK[a.priority ?? ''] ?? 99) -
              (PRIORITY_RANK[b.priority ?? ''] ?? 99)
            break
          case 'status': {
            const as_ = trackingMap[a.id]?.relationship_status ?? 'No contact'
            const bs_ = trackingMap[b.id]?.relationship_status ?? 'No contact'
            cmp = STATUS_RANK[as_] - STATUS_RANK[bs_]
            break
          }
        }
        return sortDir === 'desc' ? -cmp : cmp
      })
  }, [executives, search, filter, sortKey, sortDir, segmentMap, trackingMap])

  const loading = execLoading || trackingLoading

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Key Contacts</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {executives.length} contacts · {filtered.length} shown
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, title or segment…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(({ key, label, tooltip }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            title={tooltip}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {label}
            {tooltip && <span className="ml-1 text-xs opacity-60">ⓘ</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              {SORT_COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {label}
                  <SortArrow active={sortKey === key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  No contacts match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((exec, idx) => {
                const status: RelationshipStatus =
                  trackingMap[exec.id]?.relationship_status ?? 'No contact'
                const { dot, text } = STATUS_COLOURS[status]
                return (
                  <tr
                    key={exec.id}
                    onClick={() => onExecSelect(exec)}
                    className={`cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors hover:bg-primary/5 dark:hover:bg-primary/10 ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-slate-800'
                        : 'bg-slate-50/60 dark:bg-slate-800/40'
                    }`}
                  >
                    {/* Name & Title */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {exec.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {exec.title}
                          </div>
                        </div>
                        {exec.flag === 'new' && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Segment / Function */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {exec.segment_id ? (segmentMap[exec.segment_id] ?? '—') : '—'}
                    </td>

                    {/* Level */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${LEVEL_TAG[exec.level]}`}
                      >
                        {exec.level}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      {exec.priority ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_TAG[exec.priority] ?? ''}`}
                        >
                          {exec.priority}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                        <span className={`text-xs font-medium whitespace-nowrap ${text}`}>
                          {status}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

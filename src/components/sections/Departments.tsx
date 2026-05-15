import { useState } from 'react'
import { useDepartments } from '../../hooks/useDepartments'
import { useExecutives } from '../../hooks/useExecutives'
import { useDepartmentTracking } from '../../hooks/useDepartmentTracking'
import { PenetrationSelector, STATUS_TAG, STATUS_DOT } from '../shared/PenetrationSelector'
import type { Department, Executive, PenetrationStatus } from '../../types/database'

// Extend base type with DB columns not yet reflected in the TypeScript interfaces
type DeptFull = Department & {
  leader_name_override?: string | null
  prospecting_priority?: 'high' | 'medium' | 'low' | null
  is_nordics_benelux_relevant?: boolean | null
  has_transformation?: boolean | null
  initiative?: string | null
  transformation_note?: string | null
}

type FilterKey = 'all' | 'leader' | 'tech' | 'priority' | 'nordics'

interface Props {
  onExecSelect: (exec: Executive) => void
}

// ── Department card ───────────────────────────────────────────────────────────

function DeptCard({
  dept,
  executives,
  deptStatus,
  onExecSelect,
  onClick,
}: {
  dept: DeptFull
  executives: Executive[]
  deptStatus: PenetrationStatus
  onExecSelect: (exec: Executive) => void
  onClick: (dept: DeptFull) => void
}) {
  const leader = dept.leader_id
    ? (executives.find((e) => e.id === dept.leader_id) ?? null)
    : null
  const leaderName = leader ? leader.name : (dept.leader_name_override ?? null)
  const priority = dept.prospecting_priority ?? (dept.is_high_priority ? 'high' : null)

  const priorityTag =
    priority === 'high'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      : priority === 'medium'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'

  const note = dept.initiative ?? dept.transformation_note ?? null

  return (
    <div
      onClick={() => onClick(dept)}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3 cursor-pointer hover:border-primary hover:shadow-sm transition-all"
    >
      {/* Name + status tag */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
          {dept.name}
        </h3>
        <span
          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TAG[deptStatus]}`}
        >
          {deptStatus}
        </span>
      </div>

      {/* Description */}
      {dept.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {dept.description}
        </p>
      )}

      {/* Leader */}
      <div className="text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-300">Leader: </span>
        {leader ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onExecSelect(leader)
            }}
            className="text-primary hover:underline"
          >
            {leader.name}
          </button>
        ) : leaderName ? (
          <span className="text-slate-600 dark:text-slate-300">{leaderName}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">—</span>
        )}
      </div>

      {/* Initiative / transformation note */}
      {note && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">{note}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {priority && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityTag}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
          </span>
        )}
        {dept.is_tech_related && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            Tech
          </span>
        )}
        {dept.has_transformation && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            Transformation
          </span>
        )}
      </div>
    </div>
  )
}

// ── Department drawer ─────────────────────────────────────────────────────────

function DeptDrawer({
  dept,
  executives,
  deptStatus,
  onClose,
  onStatusChange,
  onExecSelect,
}: {
  dept: DeptFull | null
  executives: Executive[]
  deptStatus: PenetrationStatus
  onClose: () => void
  onStatusChange: (id: string, s: PenetrationStatus) => void
  onExecSelect: (exec: Executive) => void
}) {
  const isOpen = dept !== null
  const leader = dept?.leader_id
    ? (executives.find((e) => e.id === dept.leader_id) ?? null)
    : null
  const leaderName = leader ? leader.name : (dept?.leader_name_override ?? null)
  const note = dept ? (dept.initiative ?? dept.transformation_note ?? null) : null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {dept && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {dept.name}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_TAG[deptStatus]}`}
                  >
                    {deptStatus}
                  </span>
                  {(dept.prospecting_priority === 'high' || dept.is_high_priority) && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      High priority
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Description */}
              {dept.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dept.description}
                </p>
              )}

              {/* Leader */}
              <div className="text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">Leader: </span>
                {leader ? (
                  <button
                    type="button"
                    onClick={() => {
                      onExecSelect(leader)
                      onClose()
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    {leader.name}
                  </button>
                ) : leaderName ? (
                  <span className="text-slate-700 dark:text-slate-200">{leaderName}</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">—</span>
                )}
              </div>

              {/* Initiative / note */}
              {note && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">
                    Initiative
                  </p>
                  <p className="text-sm text-amber-900 dark:text-amber-100">{note}</p>
                </div>
              )}

              {/* Penetration status */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Penetration Status
                </p>
                <PenetrationSelector
                  current={deptStatus}
                  onChange={(s) => onStatusChange(dept.id, s)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Rollup section ────────────────────────────────────────────────────────────

function DeptRollup({
  departments,
  executives,
  statusMap,
  onExecSelect,
}: {
  departments: DeptFull[]
  executives: Executive[]
  statusMap: Record<string, PenetrationStatus>
  onExecSelect: (exec: Executive) => void
}) {
  const grouped = new Map<string, DeptFull[]>()
  for (const dept of departments) {
    const key = dept.reports_to_exec ?? '__unassigned__'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(dept)
  }

  // Put unassigned at the end
  const entries = Array.from(grouped.entries()).sort(([a], [b]) => {
    if (a === '__unassigned__') return 1
    if (b === '__unassigned__') return -1
    return 0
  })

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">
        Department rollup by executive
      </h2>
      <div className="space-y-7">
        {entries.map(([execId, depts]) => {
          const exec =
            execId === '__unassigned__'
              ? null
              : (executives.find((e) => e.id === execId) ?? null)

          return (
            <div key={execId}>
              {exec ? (
                <button
                  type="button"
                  onClick={() => onExecSelect(exec)}
                  className="flex items-baseline gap-2 mb-2 group text-left"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                    {exec.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{exec.title}</span>
                </button>
              ) : (
                <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 italic mb-2">
                  Unassigned
                </h3>
              )}
              <div className="ml-3 border-l border-slate-200 dark:border-slate-700 pl-4 space-y-1.5">
                {depts.map((dept) => {
                  const status = statusMap[dept.id] ?? 'Unmapped'
                  return (
                    <div key={dept.id} className="flex items-center gap-2 py-0.5">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {dept.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string; tooltip?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'leader', label: 'Has named leader' },
  { key: 'tech', label: 'Tech-related' },
  { key: 'priority', label: 'High priority' },
  {
    key: 'nordics',
    label: 'Nordics & Benelux',
    tooltip:
      'Philips HQ is in Amsterdam. This surfaces departments most relevant to a Benelux/Nordics territory.',
  },
]

export function Departments({ onExecSelect }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selectedDept, setSelectedDept] = useState<DeptFull | null>(null)
  const { departments, loading } = useDepartments()
  const { executives } = useExecutives()
  const { trackingMap, upsertDepartment } = useDepartmentTracking()

  const depts = departments as unknown as DeptFull[]

  const statusMap: Record<string, PenetrationStatus> = Object.fromEntries(
    Object.entries(trackingMap).map(([k, v]) => [k, v.penetration_status]),
  )

  const filtered = depts.filter((dept) => {
    switch (filter) {
      case 'leader':
        return dept.leader_id != null || dept.leader_name_override != null
      case 'tech':
        return dept.is_tech_related === true
      case 'priority':
        return dept.prospecting_priority === 'high' || dept.is_high_priority === true
      case 'nordics':
        return dept.is_nordics_benelux_relevant === true
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
        Corporate Functions
      </p>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
        Departments &amp; Functions
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        {depts.length} department{depts.length !== 1 ? 's' : ''} · {filtered.length} shown · click a card to view details
      </p>

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
            {tooltip && (
              <span className="ml-1 text-xs opacity-60">ⓘ</span>
            )}
          </button>
        ))}
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-12 text-center">
          No departments match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <DeptCard
              key={dept.id}
              dept={dept}
              executives={executives}
              deptStatus={statusMap[dept.id] ?? 'Unmapped'}
              onExecSelect={onExecSelect}
              onClick={setSelectedDept}
            />
          ))}
        </div>
      )}

      {/* Rollup — uses all departments, not the filtered subset */}
      <DeptRollup
        departments={depts}
        executives={executives}
        statusMap={statusMap}
        onExecSelect={onExecSelect}
      />

      {/* Department detail drawer */}
      <DeptDrawer
        dept={selectedDept}
        executives={executives}
        deptStatus={selectedDept ? (statusMap[selectedDept.id] ?? 'Unmapped') : 'Unmapped'}
        onClose={() => setSelectedDept(null)}
        onStatusChange={(id, s) => void upsertDepartment(id, { penetration_status: s })}
        onExecSelect={onExecSelect}
      />
    </div>
  )
}

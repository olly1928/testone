import { useState } from 'react'
import { useSegments } from '../../hooks/useSegments'
import { useSubDivisions } from '../../hooks/useSubDivisions'
import { useExecutives } from '../../hooks/useExecutives'
import { useSegmentTracking } from '../../hooks/useSegmentTracking'
import { useSubDivisionTracking } from '../../hooks/useSubDivisionTracking'
import { PenetrationSelector, STATUS_TAG } from '../shared/PenetrationSelector'
import type { Segment, SubDivision, Executive, PenetrationStatus } from '../../types/database'

// Extend base types with DB columns not yet reflected in the TypeScript interfaces
type SegmentFull = Segment & {
  revenue?: string | null
  revenue_share?: string | null
  growth_pct?: number | null
  margin_pct?: number | null
  products?: string | null
  strategic_priorities?: string | null
  box_relevance?: string | null
}

type SubDivisionFull = SubDivision & {
  detail?: string | null
}

type DrawerItem =
  | { kind: 'segment'; segment: SegmentFull }
  | { kind: 'subdivision'; sub: SubDivisionFull }
  | null

interface Props {
  onExecSelect: (exec: Executive) => void
}

// ── Stat mini-card ────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{value}</div>
    </div>
  )
}

// ── Status drawer (shared by segments and sub-divisions) ──────────────────────

function StatusDrawer({
  item,
  status,
  onClose,
  onStatusChange,
}: {
  item: DrawerItem
  status: PenetrationStatus
  onClose: () => void
  onStatusChange: (s: PenetrationStatus) => void
}) {
  const isOpen = item !== null
  const title = item
    ? item.kind === 'segment' ? item.segment.name : item.sub.name
    : ''
  const description = item
    ? item.kind === 'segment'
      ? (item.segment.description ?? null)
      : (item.sub.description ?? item.sub.detail ?? null)
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {item && (
          <>
            <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                  {item.kind === 'segment' ? 'Segment' : 'Sub-division'}
                </p>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {description}
                </p>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Penetration Status
                </p>
                <PenetrationSelector current={status} onChange={onStatusChange} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Segment card ──────────────────────────────────────────────────────────────

interface CardProps {
  segment: SegmentFull
  subs: SubDivisionFull[]
  executives: Executive[]
  segStatus: PenetrationStatus
  subStatusMap: Record<string, PenetrationStatus>
  onExecSelect: (exec: Executive) => void
  onSegmentClick: (segment: SegmentFull) => void
  onSubClick: (sub: SubDivisionFull) => void
}

function SegmentCard({
  segment,
  subs,
  executives,
  segStatus,
  subStatusMap,
  onExecSelect,
  onSegmentClick,
  onSubClick,
}: CardProps) {
  const [open, setOpen] = useState(false)
  const leader = segment.leader_id
    ? (executives.find((e) => e.id === segment.leader_id) ?? null)
    : null

  const revPct = segment.revenue_share ?? (segment.revenue_pct != null ? `${segment.revenue_pct}%` : null)
  const revLine = segment.revenue_bn != null
    ? `€${segment.revenue_bn}bn${revPct ? ` · ${revPct} of revenue` : ''}`
    : null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {segment.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSegmentClick(segment)
              }}
              className={`px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${STATUS_TAG[segStatus]}`}
            >
              {segStatus}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {revLine && (
              <span className="text-sm text-slate-500 dark:text-slate-400">{revLine}</span>
            )}
            {leader && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onExecSelect(leader)
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                {leader.name}
              </button>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-5 space-y-5">
          {segment.description && (
            <p className="pt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {segment.description}
            </p>
          )}

          {/* Mini stat row */}
          {(segment.revenue_bn != null ||
            segment.revenue_pct != null ||
            segment.growth_pct != null ||
            segment.margin_pct != null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {segment.revenue_bn != null && (
                <Stat label="Revenue" value={`€${segment.revenue_bn}B`} />
              )}
              {segment.revenue_pct != null && (
                <Stat label="Revenue share" value={`${segment.revenue_pct}%`} />
              )}
              {segment.growth_pct != null && (
                <Stat label="Growth" value={`${segment.growth_pct}%`} />
              )}
              {segment.margin_pct != null && (
                <Stat label="Margin" value={`${segment.margin_pct}%`} />
              )}
            </div>
          )}

          {/* Sub-divisions */}
          {subs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Sub-divisions
              </h4>
              <div className="space-y-2">
                {subs.map((sub) => {
                  const subStatus = subStatusMap[sub.id] ?? 'Unmapped'
                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {sub.name}
                          </div>
                          {(sub.description ?? sub.detail) && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {sub.description ?? sub.detail}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onSubClick(sub)}
                          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${STATUS_TAG[subStatus]}`}
                        >
                          {subStatus}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Products */}
          {segment.products && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Products
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{segment.products}</p>
            </div>
          )}

          {/* Strategic priorities */}
          {segment.strategic_priorities && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Strategic Priorities
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {segment.strategic_priorities}
              </p>
            </div>
          )}

          {/* Box relevance callout */}
          {segment.box_relevance && (
            <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-r-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1">
                Box Relevance
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-100">{segment.box_relevance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Segments({ onExecSelect }: Props) {
  const [drawerItem, setDrawerItem] = useState<DrawerItem>(null)
  const { segments, loading: segLoading } = useSegments()
  const { subDivisions, loading: subLoading } = useSubDivisions()
  const { executives } = useExecutives()
  const { trackingMap: segTracking, upsertSegment } = useSegmentTracking()
  const { trackingMap: subTracking, upsertSubDivision } = useSubDivisionTracking()

  const segsFull = (segments as unknown as SegmentFull[])
    .slice()
    .sort((a, b) => (b.revenue_bn ?? 0) - (a.revenue_bn ?? 0))
  const subsFull = subDivisions as unknown as SubDivisionFull[]

  const subStatusMap: Record<string, PenetrationStatus> = Object.fromEntries(
    Object.entries(subTracking).map(([k, v]) => [k, v.penetration_status]),
  )

  const drawerStatus: PenetrationStatus = drawerItem
    ? drawerItem.kind === 'segment'
      ? (segTracking[drawerItem.segment.id]?.penetration_status ?? 'Unmapped')
      : (subTracking[drawerItem.sub.id]?.penetration_status ?? 'Unmapped')
    : 'Unmapped'

  const handleDrawerStatusChange = (status: PenetrationStatus) => {
    if (!drawerItem) return
    if (drawerItem.kind === 'segment') {
      void upsertSegment(drawerItem.segment.id, { penetration_status: status })
    } else {
      void upsertSubDivision(drawerItem.sub.id, { penetration_status: status })
    }
  }

  if (segLoading || subLoading) {
    return (
      <div className="p-8">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Segments</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {segsFull.length} business segment{segsFull.length !== 1 ? 's' : ''} · click status badge to update · click card to expand
      </p>
      <div className="space-y-3">
        {segsFull.map((seg) => (
          <SegmentCard
            key={seg.id}
            segment={seg}
            subs={subsFull.filter((s) => s.segment_id === seg.id)}
            executives={executives}
            segStatus={segTracking[seg.id]?.penetration_status ?? 'Unmapped'}
            subStatusMap={subStatusMap}
            onExecSelect={onExecSelect}
            onSegmentClick={(segment) => setDrawerItem({ kind: 'segment', segment })}
            onSubClick={(sub) => setDrawerItem({ kind: 'subdivision', sub })}
          />
        ))}
      </div>

      <StatusDrawer
        item={drawerItem}
        status={drawerStatus}
        onClose={() => setDrawerItem(null)}
        onStatusChange={handleDrawerStatusChange}
      />
    </div>
  )
}

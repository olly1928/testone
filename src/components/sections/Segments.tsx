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
  growth_pct?: number | null
  margin_pct?: number | null
  products?: string | null
  strategic_priorities?: string | null
  box_relevance?: string | null
}

type SubDivisionFull = SubDivision & {
  detail?: string | null
}

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

// ── Segment card ──────────────────────────────────────────────────────────────

interface CardProps {
  segment: SegmentFull
  subs: SubDivisionFull[]
  executives: Executive[]
  segStatus: PenetrationStatus
  subStatusMap: Record<string, PenetrationStatus>
  onExecSelect: (exec: Executive) => void
  onSegmentStatus: (id: string, s: PenetrationStatus) => void
  onSubStatus: (id: string, s: PenetrationStatus) => void
}

function SegmentCard({
  segment,
  subs,
  executives,
  segStatus,
  subStatusMap,
  onExecSelect,
  onSegmentStatus,
  onSubStatus,
}: CardProps) {
  const [open, setOpen] = useState(false)
  const leader = segment.leader_id
    ? (executives.find((e) => e.id === segment.leader_id) ?? null)
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
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TAG[segStatus]}`}>
              {segStatus}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {segment.revenue_bn != null && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                €{segment.revenue_bn}B revenue
              </span>
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
                      className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3 space-y-2"
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
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TAG[subStatus]}`}
                        >
                          {subStatus}
                        </span>
                      </div>
                      <PenetrationSelector
                        current={subStatus}
                        onChange={(s) => onSubStatus(sub.id, s)}
                      />
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

          {/* Segment penetration status selector */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Penetration Status
            </h4>
            <PenetrationSelector
              current={segStatus}
              onChange={(s) => onSegmentStatus(segment.id, s)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Segments({ onExecSelect }: Props) {
  const { segments, loading: segLoading } = useSegments()
  const { subDivisions, loading: subLoading } = useSubDivisions()
  const { executives } = useExecutives()
  const { trackingMap: segTracking, upsertSegment } = useSegmentTracking()
  const { trackingMap: subTracking, upsertSubDivision } = useSubDivisionTracking()

  const segsFull = segments as unknown as SegmentFull[]
  const subsFull = subDivisions as unknown as SubDivisionFull[]

  const subStatusMap: Record<string, PenetrationStatus> = Object.fromEntries(
    Object.entries(subTracking).map(([k, v]) => [k, v.penetration_status]),
  )

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
        {segsFull.length} business segment{segsFull.length !== 1 ? 's' : ''} · click to expand
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
            onSegmentStatus={(id, s) => void upsertSegment(id, { penetration_status: s })}
            onSubStatus={(id, s) => void upsertSubDivision(id, { penetration_status: s })}
          />
        ))}
      </div>
    </div>
  )
}

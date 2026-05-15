import { useToast } from '../../context/ToastContext'
import { useTalkingPoints } from '../../hooks/useTalkingPoints'
import { useRiskFactors } from '../../hooks/useRiskFactors'
import { useTimelyOpeners } from '../../hooks/useTimelyOpeners'
import { useOutreachSequence } from '../../hooks/useOutreachSequence'
import { useExecutives } from '../../hooks/useExecutives'
import type { TalkingPoint, TimelyOpener, RiskFactor, Executive } from '../../types/database'

// Extend base type for sort_order which may exist in DB but isn't in the interface
type TimelyOpenerFull = TimelyOpener & { sort_order?: number | null }

interface Props {
  onExecSelect: (exec: Executive) => void
}

// ── Colour helpers for callout boxes ─────────────────────────────────────────

type CalloutColour = 'amber' | 'blue' | 'green'

const CALLOUT_STYLES: Record<
  CalloutColour,
  { wrapper: string; heading: string; body: string; icon: string }
> = {
  amber: {
    wrapper: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700',
    heading: 'text-amber-800 dark:text-amber-300',
    body: 'text-amber-900 dark:text-amber-200',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    wrapper: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700',
    heading: 'text-blue-800 dark:text-blue-300',
    body: 'text-blue-900 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    wrapper: 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700',
    heading: 'text-green-800 dark:text-green-300',
    body: 'text-green-900 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400',
  },
}

function toCalloutColour(raw: string | null): CalloutColour {
  if (raw === 'amber' || raw === 'blue' || raw === 'green') return raw
  return 'blue'
}

// ── Severity helpers for risk cards ──────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { border: string; tag: string }> = {
  High: {
    border: 'border-l-red-500',
    tag: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  Medium: {
    border: 'border-l-amber-500',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  Low: {
    border: 'border-l-slate-400',
    tag: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  },
}

function severityStyle(sev: string | null) {
  return SEVERITY_STYLES[sev ?? ''] ?? SEVERITY_STYLES.Low
}

// ── SVG icons (inline) ────────────────────────────────────────────────────────

function WarningIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

// ── Part 1 sub-components ─────────────────────────────────────────────────────

function TalkingPointCard({
  point,
  onCopy,
}: {
  point: TalkingPoint
  onCopy: (text: string) => void
}) {
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-primary px-5 py-4 flex items-start gap-4">
      <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
        {point.point}
      </p>
      <button
        type="button"
        onClick={() => onCopy(point.point)}
        title="Copy to clipboard"
        className="flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ClipboardIcon />
      </button>
    </div>
  )
}

// ── Part 2 sub-components ─────────────────────────────────────────────────────

function SimpleOpenerRow({ item }: { item: TimelyOpener }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <span className="flex-shrink-0 mt-0.5 text-slate-400">
        <CalendarIcon />
      </span>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {item.description}
      </p>
    </div>
  )
}

function FeaturedCallout({ item }: { item: TimelyOpenerFull }) {
  const colour = toCalloutColour(item.callout_colour)
  const s = CALLOUT_STYLES[colour]
  const Icon = colour === 'amber' ? WarningIcon : colour === 'green' ? CheckCircleIcon : InfoIcon

  return (
    <div className={`rounded-xl p-5 ${s.wrapper}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${s.icon}`}>
          <Icon />
        </div>
        <div className="min-w-0">
          <h4 className={`text-sm font-bold mb-1.5 ${s.heading}`}>{item.title}</h4>
          <p className={`text-sm leading-relaxed ${s.body}`}>{item.description}</p>
        </div>
      </div>
    </div>
  )
}

// ── Part 3 sub-components ─────────────────────────────────────────────────────

function RiskCard({ risk }: { risk: RiskFactor }) {
  const { border, tag } = severityStyle(risk.severity)

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${border} p-4`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
          {risk.factor}
        </h4>
        {risk.severity && (
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${tag}`}>
            {risk.severity}
          </span>
        )}
      </div>
      {risk.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {risk.description}
        </p>
      )}
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProspectingIntelligence({ onExecSelect }: Props) {
  const { addToast } = useToast()
  const { talkingPoints, loading: tpLoading } = useTalkingPoints()
  const { timelyOpeners, loading: toLoading } = useTimelyOpeners()
  const { riskFactors, loading: rfLoading } = useRiskFactors()
  const { sequence, loading: seqLoading } = useOutreachSequence()
  const { executives } = useExecutives()

  const execMap = Object.fromEntries(executives.map((e) => [e.id, e]))

  const openersFull = (timelyOpeners as unknown as TimelyOpenerFull[]).slice().sort((a, b) => {
    if (a.sort_order == null && b.sort_order == null) return 0
    if (a.sort_order == null) return 1
    if (b.sort_order == null) return -1
    return a.sort_order - b.sort_order
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => addToast('Copied to clipboard', 'success'),
      () => addToast('Copy failed', 'error'),
    )
  }

  const loading = tpLoading || toLoading || rfLoading || seqLoading

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Prospecting Intelligence
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Talking points, timely openers, risks, and suggested outreach sequence
        </p>
      </div>

      {/* ── Part 1: Talking Points ── */}
      <section>
        <SectionHeading title="Key Talking Points" />
        <div className="space-y-2">
          {talkingPoints.map((point) => (
            <TalkingPointCard key={point.id} point={point} onCopy={handleCopy} />
          ))}
          {talkingPoints.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
              No talking points found.
            </p>
          )}
        </div>
      </section>

      {/* ── Part 2: Timely Openers ── */}
      <section>
        <SectionHeading
          title="Timely Conversation Openers"
          subtitle="Recent events, appointments, and changes you can reference in outreach"
        />
        <div className="space-y-3">
          {openersFull.map((item) =>
            item.is_featured ? (
              <FeaturedCallout key={item.id} item={item} />
            ) : (
              <SimpleOpenerRow key={item.id} item={item} />
            ),
          )}
          {openersFull.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
              No timely openers found.
            </p>
          )}
        </div>
      </section>

      {/* ── Part 3: Risk Factors ── */}
      <section>
        <SectionHeading
          title="Disclosed Risk Factors"
          subtitle="Risks Philips has explicitly called out — each represents a potential urgency driver for outreach"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {riskFactors.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
          {riskFactors.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 col-span-2">
              No risk factors found.
            </p>
          )}
        </div>
      </section>

      {/* ── Part 4: Outreach Sequence ── */}
      <section>
        <SectionHeading
          title="Suggested Outreach Sequence"
          subtitle="Who to contact first, and why — ordered by highest leverage entry point"
        />
        <div>
          {sequence.map((item, idx) => {
            const exec: Executive | undefined = item.executive_id
              ? execMap[item.executive_id]
              : undefined

            return (
              <div key={item.id}>
                <div className="flex items-start gap-5 py-5">
                  {/* Position number */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-2xl font-bold text-primary leading-none">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {exec ? (
                      <button
                        type="button"
                        onClick={() => onExecSelect(exec)}
                        className="text-left group"
                      >
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {exec.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {exec.title}
                        </div>
                      </button>
                    ) : (
                      <div className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                        Unknown executive
                      </div>
                    )}

                    {item.reason && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        {item.reason}
                      </p>
                    )}

                    {exec && (
                      <a
                        href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${exec.name} Philips`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                        Find on LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {/* Divider — omit after last item */}
                {idx < sequence.length - 1 && (
                  <div className="border-t border-slate-100 dark:border-slate-700/50" />
                )}
              </div>
            )
          })}
          {sequence.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
              No outreach sequence found.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

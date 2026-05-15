import { useTechStack } from '../../hooks/useTechStack'
import { useBoxFit } from '../../hooks/useBoxFit'
import type { TechStackItem } from '../../types/database'

// Extend base type for possible description/notes columns in the DB
type TechStackFull = TechStackItem & {
  description?: string | null
  notes?: string | null
}

// ── Category colours ──────────────────────────────────────────────────────────
// Assigned deterministically by hashing the category string so the same
// category always gets the same colour regardless of ordering.

const CATEGORY_PALETTE = [
  {
    border: 'border-l-blue-500',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    border: 'border-l-teal-500',
    tag: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
  {
    border: 'border-l-indigo-500',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  {
    border: 'border-l-purple-500',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    border: 'border-l-orange-500',
    tag: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  {
    border: 'border-l-cyan-500',
    tag: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
  {
    border: 'border-l-green-500',
    tag: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  {
    border: 'border-l-rose-500',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
]

function categoryStyle(category: string | null) {
  if (!category) return CATEGORY_PALETTE[0]
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0
  }
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length]
}

// ── Tech card (known stack) ───────────────────────────────────────────────────

function TechCard({ item }: { item: TechStackFull }) {
  const style = categoryStyle(item.category)
  const detail = item.description ?? item.notes ?? null

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${style.border} p-4 flex flex-col gap-2`}
    >
      {item.category && (
        <span className={`self-start px-2 py-0.5 rounded text-xs font-medium ${style.tag}`}>
          {item.category}
        </span>
      )}
      <div className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
        {item.vendor}
      </div>
      {item.product !== item.vendor && (
        <div className="text-xs text-slate-500 dark:text-slate-400">{item.product}</div>
      )}
      {detail && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{detail}</p>
      )}
    </div>
  )
}

// ── Gap card ──────────────────────────────────────────────────────────────────

function GapCard({ item }: { item: TechStackFull }) {
  const detail = item.description ?? item.notes ?? null

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border-2 border-dashed border-amber-400 dark:border-amber-600 p-4 flex flex-col gap-2">
      {item.category && (
        <span className="self-start px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {item.category}
        </span>
      )}
      <div className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
        {item.vendor}
      </div>
      {item.product !== item.vendor && (
        <div className="text-xs text-slate-500 dark:text-slate-400">{item.product}</div>
      )}
      {detail && (
        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{detail}</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TechLandscape() {
  const { techStack, loading: techLoading } = useTechStack()
  const { boxFit, loading: boxLoading } = useBoxFit()

  const stackFull = techStack as unknown as TechStackFull[]
  const known = stackFull.filter((i) => !i.is_gap)
  const gaps = stackFull.filter((i) => i.is_gap)

  if (techLoading || boxLoading) {
    return (
      <div className="p-8">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Tech Landscape</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {known.length} known tool{known.length !== 1 ? 's' : ''} · {gaps.length} identified gap
          {gaps.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Known technology stack */}
      {known.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Known Technology Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {known.map((item) => (
              <TechCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Identified gaps */}
      {gaps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Identified Gaps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gaps.map((item) => (
              <GapCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* CISO intelligence note */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 p-5 flex gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
            CISO Intelligence Note
          </h3>
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed mb-3">
            The CISO is not named in the 20-F filing. A possible LinkedIn lead is{' '}
            <strong>Gert-Jan Adriaans</strong> (listed as Global Inf. Security Manager | CISO at
            Philips — unconfirmed as group-level CISO; verify before outreach). Suggested LinkedIn
            search: <em>Gert-Jan Adriaans Philips security</em>. The role reports to the Head of
            Group Security, who reports to CFO Charlotte Hanneman.
          </p>
          <a
            href="https://www.linkedin.com/search/results/people/?keywords=Gert-Jan+Adriaans+Philips+security"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            Search on LinkedIn
          </a>
        </div>
      </div>

      {/* Box fit summary */}
      {boxFit.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Where Box Fits
          </h2>
          <div className="border-l-4 border-primary bg-blue-50 dark:bg-blue-900/20 rounded-r-xl px-5 py-4">
            <ul className="space-y-2.5">
              {boxFit.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-blue-900 dark:text-blue-100">{item.point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

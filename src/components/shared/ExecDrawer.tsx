import { useState, useEffect } from 'react'
import type { Executive, ContactTracking, RelationshipStatus } from '../../types/database'
import { useToast } from '../../context/ToastContext'

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return `${date} at ${time}`
  } catch {
    return iso
  }
}

const RELATIONSHIP_STATUSES: RelationshipStatus[] = [
  'No contact',
  'Researched',
  'Outreach sent',
  'Had a conversation',
  'Active relationship',
]

const statusColour: Record<RelationshipStatus, string> = {
  'No contact': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
  'Researched': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  'Outreach sent': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  'Had a conversation': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  'Active relationship': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
}

const activeStatusColour: Record<RelationshipStatus, string> = {
  'No contact': 'bg-slate-500 text-white border-slate-500',
  'Researched': 'bg-blue-600 text-white border-blue-600',
  'Outreach sent': 'bg-amber-500 text-white border-amber-500',
  'Had a conversation': 'bg-orange-500 text-white border-orange-500',
  'Active relationship': 'bg-green-600 text-white border-green-600',
}

const levelColour: Record<string, string> = {
  'Board of Management': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Executive Committee': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Functional Leader': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'Supervisory Board': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

const priorityColour: Record<string, string> = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

interface ExecDrawerProps {
  exec: Executive | null
  executives: Executive[]
  onClose: () => void
  trackingMap: Record<string, ContactTracking>
  upsertContact: (
    executive_id: string,
    patch: { relationship_status?: RelationshipStatus; notes?: string },
  ) => Promise<unknown>
}

export function ExecDrawer({
  exec,
  executives,
  onClose,
  trackingMap,
  upsertContact,
}: ExecDrawerProps) {
  const { addToast } = useToast()
  const tracking = exec ? (trackingMap[exec.id] ?? null) : null
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Sync notes from tracking whenever exec or tracking changes
  useEffect(() => {
    setNotes(tracking?.notes ?? '')
  }, [exec?.id, tracking?.notes])

  const reportsToExec = exec?.reports_to
    ? executives.find((e) => e.id === exec.reports_to)
    : null

  const handleStatusClick = async (status: RelationshipStatus) => {
    if (!exec) return
    const err = await upsertContact(exec.id, { relationship_status: status })
    if (err) addToast('Failed to save status', 'error')
    else addToast('Status saved', 'success')
  }

  const handleSaveNotes = async () => {
    if (!exec) return
    setSaving(true)
    const err = await upsertContact(exec.id, { notes })
    setSaving(false)
    if (err) addToast('Failed to save notes', 'error')
    else addToast('Notes saved', 'success')
  }

  const handleLinkedIn = () => {
    if (!exec) return
    const q = encodeURIComponent(`${exec.name} Philips`)
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${q}`, '_blank')
  }

  const handleCopyBrief = () => {
    if (!exec) return
    const brief = [
      `Name: ${exec.name}`,
      `Title: ${exec.title}`,
      `Level: ${exec.level}`,
      reportsToExec ? `Reports to: ${reportsToExec.name}` : null,
      exec.responsibilities ? `\nResponsibilities:\n${exec.responsibilities}` : null,
      exec.outreach_angle ? `\nOutreach angle:\n${exec.outreach_angle}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(brief).then(() => {
      addToast('Contact brief copied', 'success')
    })
  }

  const isOpen = exec !== null

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
        {exec && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {exec.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{exec.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColour[exec.level] ?? ''}`}>
                    {exec.level}
                  </span>
                  {exec.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColour[exec.priority] ?? ''}`}>
                      {exec.priority} priority
                    </span>
                  )}
                  {exec.flag === 'new' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      New in role
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
              {/* Details */}
              <div className="space-y-2 text-sm">
                {reportsToExec && (
                  <div className="flex gap-2">
                    <span className="text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">Reports to</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{reportsToExec.name}</span>
                  </div>
                )}
                {exec.responsibilities && (
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 mb-1">Responsibilities</p>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{exec.responsibilities}</p>
                  </div>
                )}
                {exec.background && (
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 mb-1">Background</p>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{exec.background}</p>
                  </div>
                )}
              </div>

              {/* Outreach angle */}
              {exec.outreach_angle && (
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    Outreach angle
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {exec.outreach_angle}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleLinkedIn}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  LinkedIn
                </button>
                <button
                  onClick={handleCopyBrief}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy brief
                </button>
              </div>

              {/* Relationship status */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Relationship density
                </p>
                <div className="flex flex-col gap-1.5">
                  {RELATIONSHIP_STATUSES.map((s) => {
                    const isActive = (tracking?.relationship_status ?? 'No contact') === s
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusClick(s)}
                        className={`text-left text-sm px-3 py-2 rounded-lg border font-medium transition-colors ${isActive ? activeStatusColour[s] : statusColour[s]} hover:opacity-80`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Notes
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {notes.length}/500
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Add notes…"
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="mt-2 w-full py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save notes'}
                </button>
                {tracking?.notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium uppercase tracking-wide">
                      Saved note
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {tracking.notes}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      Last updated {formatTimestamp(tracking.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

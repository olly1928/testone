import { Tree, TreeNode } from 'react-organizational-chart'
import { useExecutives } from '../../hooks/useExecutives'
import { buildExecutiveTree } from '../../utils/treeBuilder'
import { useTheme } from '../../context/ThemeContext'
import type { ExecNode, Executive, ContactTracking, RelationshipStatus } from '../../types/database'

const statusDot: Record<RelationshipStatus, string> = {
  'No contact': 'bg-slate-300 dark:bg-slate-600',
  'Researched': 'bg-blue-400',
  'Outreach sent': 'bg-amber-400',
  'Had a conversation': 'bg-orange-400',
  'Active relationship': 'bg-green-500',
}

interface OrgNodeProps {
  exec: Executive
  status: RelationshipStatus
  onClick: (exec: Executive) => void
}

function OrgNodeCard({ exec, status, onClick }: OrgNodeProps) {
  return (
    <button
      onClick={() => onClick(exec)}
      className="group inline-block text-left rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 px-3 py-2 min-w-[120px] max-w-[180px] shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
    >
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
        {exec.name}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
        {exec.title}
      </p>
      <div className="flex items-center gap-1 mt-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status]}`} />
        <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{status}</span>
      </div>
    </button>
  )
}

function renderTreeNode(
  node: ExecNode,
  trackingMap: Record<string, ContactTracking>,
  onSelect: (exec: Executive) => void,
) {
  const status: RelationshipStatus =
    trackingMap[node.id]?.relationship_status ?? 'No contact'

  return (
    <TreeNode
      key={node.id}
      label={<OrgNodeCard exec={node} status={status} onClick={onSelect} />}
    >
      {node.children.map((child) => renderTreeNode(child, trackingMap, onSelect))}
    </TreeNode>
  )
}

interface OrgStructureProps {
  onExecSelect: (exec: Executive) => void
  trackingMap: Record<string, ContactTracking>
}

export function OrgStructure({ onExecSelect, trackingMap }: OrgStructureProps) {
  const { executives, loading: execLoading } = useExecutives()
  const { isDark } = useTheme()

  const loading = execLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const roots = buildExecutiveTree(executives)

  if (roots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 dark:text-slate-500 text-sm">No executives found in database.</p>
      </div>
    )
  }

  const lineColor = isDark ? '#4b5563' : '#d1d5db'

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Org Structure</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Click any node to open the executive detail panel. Status badges update live.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-slate-500 dark:text-slate-400">
        {(Object.keys(statusDot) as RelationshipStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot[s]}`} />
            {s}
          </span>
        ))}
      </div>

      {/* Scrollable org chart */}
      <div className="overflow-x-auto pb-6">
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 italic">
          Scroll horizontally to explore
        </p>
        <div className="min-w-max">
          {roots.map((root) => {
            const rootStatus: RelationshipStatus =
              trackingMap[root.id]?.relationship_status ?? 'No contact'
            return (
              <div key={root.id} className="mb-12">
                <Tree
                  label={<OrgNodeCard exec={root} status={rootStatus} onClick={onExecSelect} />}
                  lineColor={lineColor}
                  lineWidth="1px"
                  lineHeight="30px"
                  nodePadding="8px"
                  lineBorderRadius="6px"
                >
                  {root.children.map((child) =>
                    renderTreeNode(child, trackingMap, onExecSelect),
                  )}
                </Tree>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

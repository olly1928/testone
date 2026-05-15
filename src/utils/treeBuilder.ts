import type { Executive, ExecNode } from '../types/database'

export function buildExecutiveTree(executives: Executive[]): ExecNode[] {
  const nodeMap = new Map<string, ExecNode>()

  for (const exec of executives) {
    nodeMap.set(exec.id.trim(), { ...exec, children: [] })
  }

  const roots: ExecNode[] = []

  for (const node of nodeMap.values()) {
    const reportsTo = node.reports_to?.trim() ?? null
    if (!reportsTo || !nodeMap.has(reportsTo)) {
      roots.push(node)
    } else {
      nodeMap.get(reportsTo)!.children.push(node)
    }
  }

  return roots
}

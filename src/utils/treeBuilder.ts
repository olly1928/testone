import type { Executive, ExecNode } from '../types/database'

export function buildExecutiveTree(executives: Executive[]): ExecNode[] {
  const nodeMap = new Map<string, ExecNode>()

  for (const exec of executives) {
    nodeMap.set(exec.id, { ...exec, children: [] })
  }

  const roots: ExecNode[] = []

  for (const node of nodeMap.values()) {
    if (!node.reports_to || !nodeMap.has(node.reports_to)) {
      roots.push(node)
    } else {
      nodeMap.get(node.reports_to)!.children.push(node)
    }
  }

  return roots
}

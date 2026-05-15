export type RelationshipStatus =
  | 'No contact'
  | 'Researched'
  | 'Outreach sent'
  | 'Had a conversation'
  | 'Active relationship'

export type PenetrationStatus =
  | 'Unmapped'
  | 'Researching'
  | 'Outreach sent'
  | 'In conversation'
  | 'Relationship established'

export type ExecutiveLevel =
  | 'Board of Management'
  | 'Executive Committee'
  | 'Functional Leader'
  | 'Supervisory Board'

// ── Static tables (read-only) ─────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  tagline: string | null
  headquarters: string | null
  employee_count: number | null
  annual_revenue: string | null
  market_cap: string | null
  founded_year: number | null
  description: string | null
  why_this_account: string | null
}

export interface Executive {
  id: string
  company_id: string
  name: string
  title: string
  level: ExecutiveLevel
  reports_to: string | null
  segment_id: string | null
  responsibilities: string | null
  background: string | null
  outreach_angle: string | null
  priority: 'High' | 'Medium' | 'Low' | null
  flag: string | null
}

export interface Segment {
  id: string
  company_id: string
  name: string
  leader_id: string | null
  revenue_bn: number | null
  revenue_pct: number | null
  description: string | null
}

export interface SubDivision {
  id: string
  segment_id: string
  name: string
  description: string | null
}

export interface Department {
  id: string
  company_id: string
  name: string
  leader_id: string | null
  reports_to_exec: string | null
  function_type: string | null
  description: string | null
  is_tech_related: boolean | null
  is_high_priority: boolean | null
}

export interface TechStackItem {
  id: string
  company_id: string
  vendor: string
  product: string
  category: string | null
  is_gap: boolean
}

export interface BoxFitItem {
  id: string
  company_id: string
  point: string
  category: string | null
}

export interface TalkingPoint {
  id: string
  company_id: string
  point: string
  category: string | null
}

export interface TimelyOpener {
  id: string
  company_id: string
  title: string
  description: string
  is_featured: boolean
  callout_colour: string | null
}

export interface RiskFactor {
  id: string
  company_id: string
  factor: string
  severity: string | null
  description: string | null
}

export interface OutreachSequenceItem {
  id: string
  company_id: string
  order_index: number
  executive_id: string | null
  reason: string | null
}

export interface GeographyRegion {
  id: string
  company_id: string
  region: string
  revenue_bn: number | null
  revenue_pct: number | null
  growth_rate: number | null
}

export interface SupervisoryBoardMember {
  id: string
  company_id: string
  name: string
  title: string
  background: string | null
}

// ── Tracking tables (read + write, realtime) ──────────────────────────────────

export interface ContactTracking {
  id: string
  executive_id: string
  relationship_status: RelationshipStatus
  notes: string | null
  updated_at: string
}

export interface SegmentTracking {
  id: string
  segment_id: string
  penetration_status: PenetrationStatus
  updated_at: string
}

export interface SubDivisionTracking {
  id: string
  subdivision_id: string
  penetration_status: PenetrationStatus
  updated_at: string
}

export interface DepartmentTracking {
  id: string
  department_id: string
  penetration_status: PenetrationStatus
  updated_at: string
}

// ── Derived types ─────────────────────────────────────────────────────────────

export interface ExecNode extends Executive {
  children: ExecNode[]
}

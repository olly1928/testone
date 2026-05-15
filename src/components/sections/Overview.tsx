import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { useCompany } from '../../hooks/useCompany'
import { useSegments } from '../../hooks/useSegments'
import { useGeographyRegions } from '../../hooks/useGeographyRegions'
import { StatCard } from '../shared/StatCard'

function fmt(n: number | null | undefined, prefix = '', suffix = '') {
  if (n == null) return '—'
  return `${prefix}${n.toLocaleString()}${suffix}`
}

type GeoRow = { region?: string; name?: string; revenue_bn: number | null; growth_rate: number | null }
type GeoEntry = { name: string; revenue: number | null; growth: number | null }

function GeoTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: GeoEntry }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{d.name}</p>
      {d.revenue != null && (
        <p className="text-slate-600 dark:text-slate-300">Revenue: €{d.revenue.toFixed(2)}bn</p>
      )}
      {d.growth != null && (
        <p className={d.growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          Growth: {d.growth > 0 ? '+' : ''}{d.growth}%
        </p>
      )}
    </div>
  )
}

function ChartContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-5 shadow-card">
      <h3 className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function Overview() {
  const { company, loading: companyLoading } = useCompany()
  const { segments, loading: segLoading } = useSegments()
  const { regions, loading: geoLoading } = useGeographyRegions()

  const loading = companyLoading || segLoading || geoLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const segChartData = segments
    .filter((s) => s.revenue_bn != null)
    .sort((a, b) => (b.revenue_bn ?? 0) - (a.revenue_bn ?? 0))
    .map((s) => ({
      name: s.name,
      revenue: s.revenue_bn,
      label: `€${s.revenue_bn}bn${s.revenue_pct != null ? ` · ${s.revenue_pct}%` : ''}`,
    }))

  const geoChartData = (regions as unknown as GeoRow[])
    .filter((r) => r.revenue_bn != null)
    .map((r) => ({
      name: r.region ?? r.name ?? '',
      revenue: r.revenue_bn as number,
      growth: r.growth_rate,
    }))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
          Account Overview
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {company?.name ?? 'Philips'}
        </h1>
        {company?.tagline && (
          <p className="text-slate-500 dark:text-slate-400 mt-1">{company.tagline}</p>
        )}
        {company?.headquarters && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            HQ: {company.headquarters}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Employees"
          value={company?.employee_count ? fmt(company.employee_count) : '—'}
          subtext="Full-time globally"
        />
        <StatCard
          label="Annual Revenue"
          value={company?.annual_revenue ?? '—'}
          subtext={company?.founded_year ? `Est. ${company.founded_year}` : undefined}
        />
        <StatCard label="Market Cap" value={company?.market_cap ?? '—'} />
        <StatCard
          label="Segments"
          value={segments.length > 0 ? String(segments.length) : '—'}
          subtext="Business divisions"
        />
      </div>

      {/* Why this account */}
      {company?.why_this_account && (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-5">
          <h2 className="text-[11px] font-mono font-semibold text-primary uppercase tracking-widest mb-2">
            Why this account
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {company.why_this_account}
          </p>
        </div>
      )}

      {/* Revenue by segment chart */}
      {segChartData.length > 0 && (
        <ChartContainer title="Revenue by segment (€bn)">
          <ResponsiveContainer width="100%" height={Math.max(segChartData.length * 44, 180)}>
            <BarChart
              layout="vertical"
              data={segChartData}
              margin={{ top: 0, right: 120, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`€${v.toFixed(2)}bn`, 'Revenue']}
                contentStyle={{
                  background: 'var(--tw-color-bg, #fff)',
                  border: '1px solid var(--chart-grid)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="revenue" fill="var(--chart-bar)" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="label"
                  position="right"
                  style={{ fill: 'var(--chart-text)', fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Revenue by geography chart */}
      {geoChartData.length > 0 && (
        <ChartContainer title="Revenue by geography (€bn) — colour by growth">
          <ResponsiveContainer width="100%" height={Math.max(geoChartData.length * 44, 180)}>
            <BarChart
              layout="vertical"
              data={geoChartData}
              margin={{ top: 0, right: 100, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={200}
                interval={0}
                tick={{ fill: 'var(--chart-text)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GeoTooltip />} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {geoChartData.map((entry, index) => {
                  const g = entry.growth
                  const fill =
                    g == null
                      ? 'var(--chart-bar-neutral)'
                      : g > 0
                        ? 'var(--chart-bar-positive)'
                        : 'var(--chart-bar-negative)'
                  return <Cell key={index} fill={fill} />
                })}
                <LabelList
                  dataKey="revenue"
                  position="right"
                  formatter={(v: number) => `€${v.toFixed(1)}bn`}
                  style={{ fill: 'var(--chart-text)', fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 flex-shrink-0" /> Growth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500 flex-shrink-0" /> Decline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-400 flex-shrink-0" /> No data
            </span>
          </div>
        </ChartContainer>
      )}
    </div>
  )
}

import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { Sidebar } from './components/layout/Sidebar'
import { ToastList } from './components/shared/Toast'
import { ExecDrawer } from './components/shared/ExecDrawer'
import { Overview } from './components/sections/Overview'
import { OrgStructure } from './components/sections/OrgStructure'
import { Segments } from './components/sections/Segments'
import { Departments } from './components/sections/Departments'
import { KeyContacts } from './components/sections/KeyContacts'
import { TechLandscape } from './components/sections/TechLandscape'
import { ProspectingIntelligence } from './components/sections/ProspectingIntelligence'
import { useContactTracking } from './hooks/useContactTracking'
import { useExecutives } from './hooks/useExecutives'
import type { Executive } from './types/database'

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedExec, setSelectedExec] = useState<Executive | null>(null)
  const { trackingMap, upsertContact } = useContactTracking()
  const { executives } = useExecutives()

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 md:ml-60 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route
            path="/org"
            element={<OrgStructure onExecSelect={setSelectedExec} trackingMap={trackingMap} />}
          />
          <Route path="/segments" element={<Segments onExecSelect={setSelectedExec} />} />
          <Route path="/departments" element={<Departments onExecSelect={setSelectedExec} />} />
          <Route path="/contacts" element={<KeyContacts onExecSelect={setSelectedExec} trackingMap={trackingMap} />} />
          <Route path="/tech" element={<TechLandscape />} />
          <Route path="/intelligence" element={<ProspectingIntelligence onExecSelect={setSelectedExec} />} />
        </Routes>
      </main>

      <ExecDrawer
        exec={selectedExec}
        executives={executives}
        onClose={() => setSelectedExec(null)}
        trackingMap={trackingMap}
        upsertContact={upsertContact}
      />

      <ToastList />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

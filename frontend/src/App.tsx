import { useState } from 'react'
import TicketList from './components/TicketList'
import TicketCreate from './components/TicketCreate'
import TicketDetail from './components/TicketDetail'

type View =
  | { page: 'list' }
  | { page: 'create' }
  | { page: 'detail'; ticketId: string }

export default function App() {
  const [view, setView] = useState<View>({ page: 'list' })

  const navItems = [
    {
      label: 'Dashboard',
      active: view.page === 'list',
      onClick: () => setView({ page: 'list' }),
    },
    {
      label: 'New Ticket',
      active: view.page === 'create',
      onClick: () => setView({ page: 'create' }),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Datastraw CRM</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Support Ticketing System</p>
              </div>
            </div>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {view.page === 'list' && (
            <TicketList
              onSelect={(id) => setView({ page: 'detail', ticketId: id })}
              onCreateNew={() => setView({ page: 'create' })}
            />
          )}
          {view.page === 'create' && (
            <TicketCreate
              onCancel={() => setView({ page: 'list' })}
              onCreated={(id) => setView({ page: 'detail', ticketId: id })}
            />
          )}
          {view.page === 'detail' && (
            <TicketDetail
              ticketId={view.ticketId}
              onBack={() => setView({ page: 'list' })}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-400">
          Datastraw Support CRM &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
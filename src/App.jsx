import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import TaskList from './components/TaskList'
import Sidebar from './components/Sidebar'
import { Loader2 } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [showPending, setShowPending] = useState(false)
  const [categories, setCategories] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // ... existing useEffect logic ...
    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(catChannel)
    }
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    if (data) setCategories(data)
  }

  if (!supabase) {
    // ... missing credentials UI ...
  }

  if (loading) {
    // ... loading spinner ...
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="flex h-screen bg-[#f5e6ff] font-sans antialiased text-gray-800 overflow-hidden relative">
      {/* Background blobs for vibrancy */}
      <div className="fixed top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-pink-200/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        onSelectCategory={(id) => {
          setSelectedCategoryId(id)
          setIsSidebarOpen(false)
        }}
        selectedCategoryId={selectedCategoryId}
        onSelectPending={(val) => {
          setShowPending(val)
          setIsSidebarOpen(false)
        }}
        showPending={showPending}
        categories={categories}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-6 bg-white/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-30">
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 tracking-tighter">
            {showPending ? 'Pendientes' : selectedCategoryId ? (categories.find(c => c.id === selectedCategoryId)?.name || 'Categoría') : 'Mi Día'}
          </h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-white/50 rounded-2xl shadow-sm hover:bg-white/80 transition-all active:scale-95"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Subtle ambient lighting */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex-1">
          <TaskList
            session={session}
            selectedCategoryId={selectedCategoryId}
            showPending={showPending}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}

export default App

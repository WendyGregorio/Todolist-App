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

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#f5e6ff] text-gray-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg bg-white/40 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
          <h1 className="text-3xl font-black mb-4 text-red-400 tracking-tighter">Conexión faltante</h1>
          <p className="text-gray-600 mb-6 leading-relaxed font-semibold">
            La aplicación no puede conectarse a Supabase porque faltan las variables de entorno.
          </p>
          <div className="bg-white/50 rounded-2xl p-4 text-left border border-white/20 shadow-inner">
            <p className="text-sm text-gray-500 mb-2">Por favor crea un archivo <code className="text-pink-400 px-1 py-0.5 bg-white rounded font-bold">.env</code> con:</p>
            <pre className="text-xs text-gray-700 overflow-x-auto font-bold p-2">
              VITE_SUPABASE_URL=tu_url_de_proyecto{"\n"}
              VITE_SUPABASE_ANON_KEY=tu_anon_key
            </pre>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5e6ff] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#a0c4ff] animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="flex h-screen bg-[#f5e6ff] font-sans antialiased text-gray-800 overflow-hidden">
      {/* Background blobs for vibrancy */}
      <div className="fixed top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-pink-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none"></div>

      <Sidebar
        onSelectCategory={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
        onSelectPending={setShowPending}
        showPending={showPending}
      />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <TaskList
            session={session}
            selectedCategoryId={selectedCategoryId}
            showPending={showPending}
          />
        </div>
      </div>
    </div>
  )
}

export default App

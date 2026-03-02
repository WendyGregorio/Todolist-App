import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import TaskList from './components/TaskList'
import { Loader2 } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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
      <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob pointer-events-none"></div>
        <div className="relative z-10 max-w-lg bg-slate-800/50 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-bold mb-4 text-red-400">Database Connection Missing</h1>
          <p className="text-slate-300 mb-6 leading-relaxed">
            The application cannot connect to Supabase because the environment variables are missing.
          </p>
          <div className="bg-slate-900/80 rounded-xl p-4 text-left border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Please create a <code className="text-primary-400 px-1 py-0.5 bg-slate-800 rounded">.env</code> file in the project root with:</p>
            <pre className="text-xs text-green-400 overflow-x-auto">
              VITE_SUPABASE_URL=your_project_url
              VITE_SUPABASE_ANON_KEY=your_anon_key
            </pre>
          </div>
        </div>
      </div>
    )
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] relative overflow-hidden font-sans antialiased text-gray-900">
      {/* Subtle ambient lighting matched to reference */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#f8f9fb_0%,_transparent_100%)] pointer-events-none"></div>

      <div className="relative z-10">
        <TaskList session={session} />
      </div>
    </div>
  )
}

export default App

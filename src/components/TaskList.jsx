import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'
import { Search, Loader2, Calendar } from 'lucide-react'

export default function TaskList({ session, selectedCategoryId, showPending }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchTasks()

        const channel = supabase
            .channel('tasks_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${session.user.id}`,
                },
                fetchTasks
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [session.user.id, selectedCategoryId, showPending])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('tasks')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (selectedCategoryId) {
                query = query.eq('category_id', selectedCategoryId)
            }

            if (showPending) {
                query = query.eq('is_pending', true)
            }

            const { data, error } = await query
            if (error) throw error
            setTasks(data || [])
        } catch (error) {
            console.error('Error al obtener tareas:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTask = async (taskData) => {
        try {
            const { error } = await supabase.from('tasks').insert([
                {
                    ...taskData,
                    user_id: session.user.id,
                    category_id: selectedCategoryId || null
                },
            ])
            if (error) throw error
        } catch (error) {
            console.error('Error al añadir tarea:', error.message)
        }
    }

    const handleToggleTask = async (task) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: !task.completed })
                .eq('id', task.id)
            if (error) throw error
        } catch (error) {
            console.error('Error al cambiar estado de tarea:', error.message)
        }
    }

    const handleTogglePending = async (task) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ is_pending: !task.is_pending })
                .eq('id', task.id)
            if (error) throw error
        } catch (error) {
            console.error('Error al cambiar estado pendiente:', error.message)
        }
    }

    const handleDeleteTask = async (id) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id)
            if (error) throw error
        } catch (error) {
            console.error('Error al eliminar tarea:', error.message)
        }
    }

    const filteredTasks = tasks.filter((task) => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'active' && !task.completed) ||
            (filter === 'completed' && task.completed)

        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesFilter && matchesSearch
    })

    const activeCount = tasks.filter((t) => !t.completed).length

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-12">
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black text-gray-800 tracking-tighter mb-2">
                        {showPending ? 'Tareas Pendientes' : selectedCategoryId ? 'Categoría' : 'Mi Día'}
                    </h2>
                    <div className="flex items-center text-gray-500 font-bold tracking-tight uppercase text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-2" />
                        <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold mb-1">{session.user.email}</p>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="px-6 py-2 bg-[#ffcdd2] text-gray-700 font-black rounded-xl shadow-lg hover:shadow-xl transition-all text-[10px] uppercase tracking-widest"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <TaskForm onAdd={handleAddTask} selectedCategoryId={selectedCategoryId} />

            {/* Filtros y Búsqueda */}
            <div className="bg-[#e0f7fa] rounded-[2rem] p-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/40 shadow-xl shadow-[#e0f7fa]/20">
                <div className="flex space-x-2 w-full md:w-auto p-1 bg-[#b2dfdb]/20 rounded-2xl">
                    {[
                        { id: 'all', label: 'Todas' },
                        { id: 'active', label: 'Activas' },
                        { id: 'completed', label: 'Completadas' }
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl text-sm font-black transition-all duration-300 ${filter === f.id
                                ? 'bg-[#fff9c4] text-gray-700 shadow-lg scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f.id === 'active' ? (
                                <div className="flex items-center">
                                    {f.label}
                                    <span className="ml-2 bg-[#e0f2f1] text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                                        {activeCount}
                                    </span>
                                </div>
                            ) : f.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar tareas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#b2dfdb]/30 border-none rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#b2dfdb]/40 transition-all font-bold"
                    />
                </div>
            </div>

            {loading && tasks.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 text-[#a0c4ff] animate-spin" />
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-24 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-inner">
                    <p className="text-gray-400 font-black text-xl tracking-tight uppercase">No hay tareas aquí</p>
                    <p className="text-gray-400/60 text-sm font-bold mt-2">Prueba a añadir una nueva tarea</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={handleToggleTask}
                            onTogglePending={handleTogglePending}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

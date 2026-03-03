import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'
import { Search, Loader2, Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import { addDays, addWeeks, addMonths, parseISO, format } from 'date-fns'

export default function TaskList({ session, selectedCategoryId, showPending, categories }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchTasks()

        const channel = supabase
            .channel('tasks_changes')
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

            // Lógica de "Movimiento":
            // Si estamos en Tareas Pendientes, solo mostramos las pendientes.
            // Si NO estamos en Tareas Pendientes, ocultamos las pendientes de la lista principal.
            if (showPending) {
                query = query.eq('is_pending', true)
            } else {
                query = query.eq('is_pending', false)
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
                    // Usar la categoría seleccionada si no viene una del form
                    category_id: taskData.category_id || selectedCategoryId || null
                },
            ])
            if (error) throw error
        } catch (error) {
            console.error('Error al añadir tarea:', error.message)
        }
    }

    const handleToggleTask = async (task) => {
        try {
            const isCompleting = !task.completed
            const { error } = await supabase
                .from('tasks')
                .update({
                    completed: isCompleting,
                    completed_at: isCompleting ? new Date().toISOString() : null
                })
                .eq('id', task.id)

            if (error) throw error

            // Lógica de repetición: autogenerar nueva instancia
            if (isCompleting && task.repeat_type && task.repeat_type !== 'none') {
                let nextDueDate = task.due_date ? parseISO(task.due_date) : new Date();

                if (task.repeat_type === 'daily') nextDueDate = addDays(nextDueDate, 1);
                else if (task.repeat_type === 'weekly') nextDueDate = addWeeks(nextDueDate, 1);
                else if (task.repeat_type === 'monthly') nextDueDate = addMonths(nextDueDate, 1);

                await handleAddTask({
                    title: task.title,
                    description: task.description,
                    category_id: task.category_id,
                    priority: task.priority,
                    repeat_type: task.repeat_type,
                    due_date: nextDueDate.toISOString()
                })
            }
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

    // Obtener nombre de la categoría actual
    const currentCategory = categories.find(c => c.id === selectedCategoryId)

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tighter mb-2">
                        {showPending ? 'Tareas Pendientes' : selectedCategoryId ? (currentCategory?.name || 'Categoría') : 'Mi Día'}
                    </h2>
                    <div className="flex items-center text-gray-500 font-bold tracking-tight uppercase text-[10px] sm:text-xs">
                        <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                        <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4">
                    <p className="text-gray-400 text-[10px] sm:text-xs font-bold truncate max-w-[150px] sm:max-w-none">{session.user.email}</p>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="px-4 sm:px-6 py-2 bg-[#ffcdd2] text-gray-700 font-black rounded-xl shadow-lg hover:shadow-xl transition-all text-[10px] uppercase tracking-widest whitespace-nowrap"
                    >
                        Salir
                    </button>
                </div>
            </div>

            <TaskForm
                onAdd={handleAddTask}
                selectedCategoryId={selectedCategoryId}
                categories={categories}
            />

            {/* Filtros y Búsqueda */}
            <div className="bg-[#e0f7fa] rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 mb-8 sm:mb-10 flex flex-col items-stretch gap-4 sm:gap-6 border border-white/40 shadow-xl shadow-[#e0f7fa]/20">
                <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar -mx-1 px-1">
                    <div className="flex space-x-2 bg-[#b2dfdb]/20 p-1 rounded-xl sm:rounded-2xl min-w-max">
                        {[
                            { id: 'all', label: 'Todas' },
                            { id: 'active', label: 'Activas' },
                            { id: 'completed', label: 'Completas' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-black transition-all duration-300 whitespace-nowrap ${filter === f.id
                                    ? 'bg-[#fff9c4] text-gray-800 shadow-md sm:shadow-lg scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {f.id === 'active' ? (
                                    <div className="flex items-center">
                                        {f.label}
                                        <span className="ml-1.5 sm:ml-2 bg-[#e0f2f1] text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold">
                                            {activeCount}
                                        </span>
                                    </div>
                                ) : f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar tareas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-[#b2dfdb]/30 border-none rounded-xl sm:rounded-2xl text-[11px] sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#b2dfdb]/40 transition-all font-bold"
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

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'
import { Search, Loader2 } from 'lucide-react'

export default function TaskList({ session }) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchTasks()

        // Set up real-time subscription
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
                (payload) => {
                    console.log('Real-time update:', payload)
                    if (payload.eventType === 'INSERT') {
                        setTasks((prev) => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks((prev) =>
                            prev.map((task) => (task.id === payload.new.id ? payload.new : task))
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [session.user.id])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTasks(data || [])
        } catch (error) {
            console.error('Error fetching tasks:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTask = async ({ title, description }) => {
        try {
            const { error } = await supabase.from('tasks').insert([
                {
                    title,
                    description,
                    user_id: session.user.id,
                },
            ])
            if (error) throw error
        } catch (error) {
            console.error('Error adding task:', error.message)
        }
    }

    const handleUpdateTask = async (id, updates) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)

            if (error) throw error

            // Optimistic update
            setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t))
        } catch (error) {
            console.error('Error updating task:', error.message)
        }
    }

    const handleToggleTask = async (task) => {
        await handleUpdateTask(task.id, { completed: !task.completed })
    }

    const handleDeleteTask = async (id) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id)
            if (error) throw error

            // Optimistic delete
            setTasks(tasks.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting task:', error.message)
        }
    }

    // Filter and search computation
    const filteredTasks = tasks.filter((task) => {
        // 1. Text Search Filter
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        if (!matchesSearch) return false

        // 2. Status Filter
        if (filter === 'active') return !task.completed
        if (filter === 'completed') return task.completed
        return true
    })

    // Stats
    const activeCount = tasks.filter((t) => !t.completed).length
    const completedCount = tasks.filter((t) => t.completed).length

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 relative z-10">
            <TaskForm onAdd={handleAddTask} />

            {/* Filters and Search */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-[1.5rem] p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-[1.25rem] w-full sm:w-auto">
                    {['all', 'active', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${filter === f
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {f}
                            {f === 'active' && activeCount > 0 && (
                                <span className="ml-1.5 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-bold">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-foreground placeholder-gray-400 focus:outline-none focus:border-accent-green focus:ring-4 focus:ring-accent-green/10 transition-all duration-200 shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white/50 backdrop-blur border border-gray-200 border-dashed rounded-[2rem]">
                    <div className="mx-auto w-16 h-16 bg-primary-50 border border-primary-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No tasks yet</h3>
                    <p className="text-gray-500">Get started by adding a task above.</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 px-4 border border-gray-200 border-dashed rounded-[2rem] bg-white/50 backdrop-blur">
                    <p className="text-gray-500 font-medium">No tasks found matching your filters.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                            onUpdate={handleUpdateTask}
                        />
                    ))}
                </div>
            )}

            {tasks.length > 0 && (
                <div className="mt-8 flex items-center justify-between text-sm font-medium text-gray-500 px-2">
                    <span>{activeCount} items left</span>
                    {completedCount > 0 && (
                        <button
                            onClick={() => {
                                tasks.filter((t) => t.completed).forEach((t) => handleDeleteTask(t.id))
                            }}
                            className="px-3 py-1.5 rounded-lg text-accent-red hover:bg-red-50 transition-colors"
                        >
                            Clear completed
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

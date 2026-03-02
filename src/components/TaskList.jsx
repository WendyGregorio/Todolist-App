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
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-12">
                <span className="text-gray-500 text-sm font-semibold">{session.user.email}</span>
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-8 py-3 bg-[#ffcdd2] text-gray-700 font-bold rounded-2xl shadow-[0_4px_12px_rgba(255,205,210,0.3)] hover:shadow-md transition-all text-sm border-none"
                >
                    Sign Out
                </button>
            </div>

            <TaskForm onAdd={handleAddTask} />

            {/* Filters and Search */}
            <div className="bg-[#e0f7fa] rounded-[2rem] p-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(224,247,250,0.3)]">
                <div className="flex space-x-2 w-full md:w-auto p-1 bg-[#b2dfdb]/20 rounded-2xl">
                    {['all', 'active', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl text-sm font-extrabold capitalize transition-all duration-300 ${filter === f
                                ? 'bg-[#fff9c4] text-gray-700 shadow-[0_4px_15px_rgba(255,249,196,0.6)] scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f === 'active' ? (
                                <div className="flex items-center">
                                    Active
                                    <span className="ml-2 bg-[#e0f2f1] text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                                        {activeCount}
                                    </span>
                                </div>
                            ) : f}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#b2dfdb] border-none rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#b2dfdb]/40 transition-all font-medium"
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

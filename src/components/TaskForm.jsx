import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

export default function TaskForm({ onAdd }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        await onAdd({ title, description })
        setTitle('')
        setDescription('')
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-gray-100 mb-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]">
            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-[1rem] px-5 py-4 text-foreground placeholder-gray-400 focus:outline-none focus:border-accent-green focus:ring-4 focus:ring-accent-green/10 transition-all text-lg font-medium shadow-sm"
                    />
                </div>
                <div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description (optional)"
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-[1rem] px-5 py-4 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-accent-green focus:ring-4 focus:ring-accent-green/10 transition-all resize-none shadow-sm"
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-primary-400 to-accent-orange hover:from-primary-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-md shadow-primary-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <PlusCircle className="w-5 h-5 mr-2 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                        Add Task
                    </button>
                </div>
            </div>
        </form>
    )
}

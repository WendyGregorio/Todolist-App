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
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 sm:p-12 mb-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="space-y-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                    className="w-full bg-white border border-gray-100 rounded-[1.25rem] px-8 py-5 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-50/50 transition-all text-xl font-medium shadow-sm"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description (optional)"
                    rows={2}
                    className="w-full bg-white border border-gray-100 rounded-[1.25rem] px-8 py-5 text-gray-500 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-50/50 transition-all resize-none shadow-sm text-lg"
                />
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="px-10 py-4 bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-100 rounded-2xl font-bold shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {loading ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </form>
    )
}

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
        <form onSubmit={handleSubmit} className="bg-[#e0f7fa] rounded-[2.5rem] p-10 sm:p-14 mb-12 shadow-[0_20px_50px_rgba(224,247,250,0.4)] border-none">
            <div className="space-y-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                    className="w-full bg-[#ffe5d9] border-none rounded-[1.25rem] px-8 py-5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#ffe5d9]/50 transition-all text-xl font-bold shadow-sm"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description (optional)"
                    rows={2}
                    className="w-full bg-[#fff2cc] border-none rounded-[1.25rem] px-8 py-5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#fff2cc]/50 transition-all resize-none shadow-sm text-lg font-medium"
                />
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="px-12 py-4 bg-white/40 text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-2xl font-black shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                    >
                        {loading ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </form>
    )
}

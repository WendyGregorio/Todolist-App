import { useState } from 'react'
import { CheckCircle2, Circle, Trash2, Edit2, X, Save } from 'lucide-react'

export default function TaskItem({ task, onToggle, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(task.title)
    const [editDescription, setEditDescription] = useState(task.description || '')

    const [isUpdating, setIsUpdating] = useState(false)

    const handleSave = async () => {
        if (!editTitle.trim() || isUpdating) return
        setIsUpdating(true)
        await onUpdate(task.id, { title: editTitle, description: editDescription })
        setIsEditing(false)
        setIsUpdating(false)
    }

    const handleCancel = () => {
        setEditTitle(task.title)
        setEditDescription(task.description || '')
        setIsEditing(false)
    }

    return (
        <div className={`group flex flex-col p-8 sm:p-10 bg-[#e1f5fe] transition-all rounded-[2.5rem] border-none mb-6 shadow-[0_15px_40px_rgba(225,245,254,0.4)] hover:shadow-[0_20px_50px_rgba(225,245,254,0.6)] ${task.completed ? 'opacity-60' : ''}`}>
            {isEditing ? (
                <div className="space-y-4 w-full">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white/60 border-none rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all font-extrabold shadow-sm text-lg"
                        autoFocus
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-white/60 border-none rounded-2xl px-6 py-4 text-gray-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all resize-none shadow-sm font-medium"
                    />
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded-xl transition-all font-black text-sm uppercase"
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 text-white bg-gray-800 hover:bg-black shadow-lg rounded-xl transition-all font-black text-sm uppercase"
                            disabled={isUpdating || !editTitle.trim()}
                        >
                            {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start">
                    <button
                        onClick={() => onToggle(task)}
                        className="mt-1 flex-shrink-0 text-[#a0c4ff] hover:text-[#5390ef] transition-colors focus:outline-none"
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-9 h-9 text-[#5390ef]" />
                        ) : (
                            <Circle className="w-9 h-9" />
                        )}
                    </button>

                    <div className="ml-8 flex-1 min-w-0">
                        <h3 className={`text-2xl transition-all ${task.completed ? 'text-gray-400 line-through font-bold' : 'text-gray-800 font-black'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className={`mt-3 text-lg ${task.completed ? 'text-gray-400' : 'text-gray-600'} break-words leading-relaxed font-semibold`}>
                                {task.description}
                            </p>
                        )}
                        <div className="mt-6 flex items-center text-sm text-gray-400 font-black tracking-widest uppercase">
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-3 text-[#a0c4ff] hover:text-[#5390ef] hover:bg-white/40 rounded-2xl transition-all"
                            aria-label="Edit task"
                        >
                            <Edit2 className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-3 text-[#a0c4ff] hover:text-red-400 hover:bg-red-50/40 rounded-2xl transition-all"
                            aria-label="Delete task"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

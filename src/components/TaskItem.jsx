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
        <div className={`group flex flex-col p-8 sm:p-10 bg-white transition-all rounded-[2.5rem] border border-gray-100 mb-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.06)] ${task.completed ? 'opacity-60' : ''}`}>
            {isEditing ? (
                <div className="space-y-4 w-full">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-50 transition-all font-semibold shadow-sm text-lg"
                        autoFocus
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-50 transition-all resize-none shadow-sm"
                    />
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all font-bold text-sm"
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 text-white bg-gray-800 hover:bg-black shadow-lg rounded-xl transition-all font-bold text-sm"
                            disabled={isUpdating || !editTitle.trim()}
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start">
                    <button
                        onClick={() => onToggle(task)}
                        className="mt-1 flex-shrink-0 text-gray-200 hover:text-gray-400 transition-colors focus:outline-none"
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-8 h-8 text-gray-400" />
                        ) : (
                            <Circle className="w-8 h-8" />
                        )}
                    </button>

                    <div className="ml-8 flex-1 min-w-0">
                        <h3 className={`text-xl transition-all ${task.completed ? 'text-gray-300 line-through font-medium' : 'text-gray-800 font-bold'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className={`mt-2 text-base ${task.completed ? 'text-gray-300' : 'text-gray-500'} break-words leading-relaxed`}>
                                {task.description}
                            </p>
                        )}
                        <div className="mt-6 flex items-center text-sm text-gray-300 font-bold tracking-tight">
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                            aria-label="Edit task"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-2.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                            aria-label="Delete task"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

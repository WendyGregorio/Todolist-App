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
        <div className={`group flex flex-col p-5 bg-white hover:bg-gray-50 transition-all rounded-[1.5rem] border border-gray-200 mb-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] ${task.completed ? 'opacity-70 bg-gray-50/50' : ''}`}>
            {isEditing ? (
                <div className="space-y-3 w-full animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-green focus:ring-4 focus:ring-accent-green/10 transition-all shadow-sm"
                        autoFocus
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:border-accent-green focus:ring-4 focus:ring-accent-green/10 transition-all resize-none shadow-sm"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={handleCancel}
                            className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm flex items-center"
                            disabled={isUpdating}
                        >
                            <X className="w-4 h-4 mr-1" /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-2.5 text-white bg-accent-green hover:bg-green-600 shadow-sm shadow-accent-green/20 rounded-xl transition-all font-medium text-sm flex items-center"
                            disabled={isUpdating || !editTitle.trim()}
                        >
                            <Save className="w-4 h-4 mr-1" /> Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start">
                    <button
                        onClick={() => onToggle(task)}
                        className="mt-1 flex-shrink-0 text-gray-300 hover:text-accent-green transition-colors focus:outline-none"
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-accent-green drop-shadow-[0_2px_8px_rgba(34,197,94,0.3)]" />
                        ) : (
                            <Circle className="w-6 h-6" />
                        )}
                    </button>

                    <div className="ml-4 flex-1 min-w-0">
                        <h3 className={`text-lg transition-all ${task.completed ? 'text-gray-400 line-through font-normal' : 'text-foreground font-semibold'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'} break-words`}>
                                {task.description}
                            </p>
                        )}
                        <div className="mt-3 flex items-center text-xs text-gray-400 font-medium">
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="ml-4 flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-gray-400 hover:text-accent-blue hover:bg-blue-50 rounded-xl transition-all focus:outline-none focus:opacity-100"
                            aria-label="Edit task"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-2 text-gray-400 hover:text-accent-red hover:bg-red-50 rounded-xl transition-all focus:outline-none focus:opacity-100"
                            aria-label="Delete task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

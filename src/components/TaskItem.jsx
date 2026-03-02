import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle2, Circle, Trash2, Edit2, Clock, Tag, Save, RotateCcw } from 'lucide-react'

export default function TaskItem({ task, onToggle, onTogglePending, onDelete }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(task.title)
    const [editDescription, setEditDescription] = useState(task.description || '')
    const [categoryName, setCategoryName] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (task.category_id) {
            fetchCategoryName()
        }
    }, [task.category_id])

    const fetchCategoryName = async () => {
        const { data } = await supabase
            .from('categories')
            .select('name')
            .eq('id', task.category_id)
            .single()
        if (data) setCategoryName(data.name)
    }

    const handleSave = async () => {
        if (!editTitle.trim() || isUpdating) return
        setIsUpdating(true)
        const { error } = await supabase
            .from('tasks')
            .update({ title: editTitle, description: editDescription })
            .eq('id', task.id)

        if (!error) {
            setIsEditing(false)
        }
        setIsUpdating(false)
    }

    const handleCancel = () => {
        setEditTitle(task.title)
        setEditDescription(task.description || '')
        setIsEditing(false)
    }

    return (
        <div className={`group flex flex-col p-8 sm:p-10 bg-[#e1f5fe] transition-all duration-500 rounded-[2.5rem] border-none mb-6 shadow-xl shadow-[#e1f5fe]/20 hover:shadow-2xl hover:shadow-[#e1f5fe]/40 ${task.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}>
            {isEditing ? (
                <div className="space-y-4 w-full">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white/60 border-none rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all font-black shadow-sm text-lg"
                        autoFocus
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-white/60 border-none rounded-2xl px-6 py-4 text-gray-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all resize-none shadow-sm font-bold"
                    />
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                            disabled={isUpdating}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 text-white bg-gray-800 hover:bg-black shadow-lg rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                            disabled={isUpdating || !editTitle.trim()}
                        >
                            {isUpdating ? 'Guardando...' : 'Guardar'}
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
                            <CheckCircle2 className="w-10 h-10 text-[#5390ef]" />
                        ) : (
                            <Circle className="w-10 h-10" />
                        )}
                    </button>

                    <div className="ml-8 flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-2">
                            {categoryName && (
                                <span className="flex items-center px-3 py-1 bg-white/50 text-[#5390ef] rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    <Tag className="w-3 h-3 mr-1.5" />
                                    {categoryName}
                                </span>
                            )}
                            {task.is_pending && (
                                <span className="flex items-center px-3 py-1 bg-orange-100 text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    Pendiente
                                </span>
                            )}
                        </div>

                        <h3 className={`text-2xl transition-all ${task.completed ? 'text-gray-400 line-through font-extrabold' : 'text-gray-800 font-black'}`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className={`mt-3 text-lg ${task.completed ? 'text-gray-400' : 'text-gray-600'} break-words leading-relaxed font-bold`}>
                                {task.description}
                            </p>
                        )}
                        <div className="mt-6 flex items-center text-[10px] text-gray-400 font-black tracking-widest uppercase">
                            <span>{new Date(task.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onTogglePending(task)}
                            className={`p-3 rounded-2xl transition-all ${task.is_pending ? 'bg-orange-100 text-orange-400' : 'text-[#a0c4ff] hover:bg-white/40'}`}
                            title={task.is_pending ? "Quitar de pendientes" : "Marcar como pendiente"}
                        >
                            {task.is_pending ? <RotateCcw className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-3 text-[#a0c4ff] hover:text-[#5390ef] hover:bg-white/40 rounded-2xl transition-all"
                            title="Editar tarea"
                        >
                            <Edit2 className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-3 text-[#a0c4ff] hover:text-red-400 hover:bg-red-50/40 rounded-2xl transition-all"
                            title="Eliminar tarea"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

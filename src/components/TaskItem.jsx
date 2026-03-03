import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle2, Circle, Trash2, Edit2, Clock, Tag, Save, RotateCcw, Calendar, AlertCircle, RefreshCw } from 'lucide-react'

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

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return null
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className={`group flex flex-col p-6 sm:p-10 bg-[#e1f5fe] transition-all duration-500 rounded-[2rem] sm:rounded-[2.5rem] border-none mb-4 sm:mb-6 shadow-xl shadow-[#e1f5fe]/20 hover:shadow-2xl hover:shadow-[#e1f5fe]/40 ${task.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}>
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
                            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#5390ef]" />
                        ) : (
                            <Circle className="w-8 h-8 sm:w-10 sm:h-10" />
                        )}
                    </button>

                    <div className="ml-4 sm:ml-8 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 flex-wrap gap-y-2">
                            {categoryName && (
                                <span className="flex items-center px-2 sm:px-3 py-1 bg-white/50 text-[#5390ef] rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                                    {categoryName}
                                </span>
                            )}
                            {task.is_pending && (
                                <span className="flex items-center px-2 sm:px-3 py-1 bg-orange-100 text-orange-400 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                                    Pendiente
                                </span>
                            )}
                            {task.priority && (
                                <span className={`flex items-center px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${task.priority === 'urgent' ? 'bg-red-50 text-red-500 border-red-100' :
                                        task.priority === 'pending' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100'
                                    }`}>
                                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                                    {task.priority === 'urgent' ? 'Urgente' :
                                        task.priority === 'pending' ? 'Pendiente' : 'No Urgente'}
                                </span>
                            )}
                            {task.repeat_type && task.repeat_type !== 'none' && (
                                <span className="flex items-center px-2 sm:px-3 py-1 bg-green-50 text-green-500 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-green-100">
                                    <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                                    {task.repeat_type === 'daily' ? 'Diario' : task.repeat_type === 'weekly' ? 'Semanal' : 'Mensual'}
                                </span>
                            )}
                            {task.due_date && (
                                <span className="flex items-center px-2 sm:px-3 py-1 bg-purple-100 text-purple-400 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-purple-200/30">
                                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                                    Vence: {formatDate(task.due_date)}
                                </span>
                            )}
                        </div>

                        <h3 className={`text-xl sm:text-2xl transition-all ${task.completed ? 'text-gray-400 line-through font-extrabold' : 'text-gray-800 font-black'} break-words truncate sm:whitespace-normal`}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className={`mt-2 sm:mt-3 text-base sm:text-lg ${task.completed ? 'text-gray-400' : 'text-gray-600'} break-words leading-relaxed font-bold line-clamp-3 sm:line-clamp-none`}>
                                {task.description}
                            </p>
                        )}
                    </div>

                    <div className="ml-4 sm:ml-6 flex flex-col space-y-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onTogglePending(task)}
                            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${task.is_pending ? 'bg-orange-100 text-orange-400 shadow-sm' : 'text-[#a0c4ff] hover:bg-white/40'}`}
                            title={task.is_pending ? "Quitar de pendientes" : "Marcar como pendiente"}
                        >
                            {task.is_pending ? <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 sm:p-3 text-[#a0c4ff] hover:text-[#5390ef] hover:bg-white/40 rounded-xl sm:rounded-2xl transition-all"
                            title="Editar tarea"
                        >
                            <Edit2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-2 sm:p-3 text-[#a0c4ff] hover:text-red-400 hover:bg-red-50/40 rounded-xl sm:rounded-2xl transition-all"
                            title="Eliminar tarea"
                        >
                            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

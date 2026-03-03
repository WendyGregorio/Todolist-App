import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PlusCircle, Tag, Calendar, AlertCircle, RefreshCw } from 'lucide-react'

export default function TaskForm({ onAdd, selectedCategoryId, categories }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState(selectedCategoryId || '')
    const [dueDate, setDueDate] = useState('')
    const [dueTime, setDueTime] = useState('')
    const [priority, setPriority] = useState('pending')
    const [repeatType, setRepeatType] = useState('none')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setCategoryId(selectedCategoryId || '')
    }, [selectedCategoryId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        let finalDueDate = null
        if (dueDate) {
            finalDueDate = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:59`
        }

        await onAdd({
            title,
            description,
            category_id: categoryId || null,
            due_date: finalDueDate,
            priority,
            repeat_type: repeatType
        })
        setTitle('')
        setDescription('')
        setDueDate('')
        setDueTime('')
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-[#e0f7fa] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-14 mb-8 sm:mb-12 border-none shadow-2xl shadow-[#e0f7fa]/30">
            <div className="space-y-4 sm:space-y-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="¿Qué hay que hacer?"
                    required
                    className="w-full bg-[#ffe5d9] border-none rounded-xl sm:rounded-[1.25rem] px-5 sm:px-8 py-3.5 sm:py-5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#ffe5d9]/50 transition-all text-lg sm:text-xl font-black shadow-sm"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Añade una descripción (opcional)"
                    rows={2}
                    className="w-full bg-[#fff2cc] border-none rounded-xl sm:rounded-[1.25rem] px-5 sm:px-8 py-3.5 sm:py-5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#fff2cc]/50 transition-all resize-none shadow-sm text-base sm:text-lg font-bold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
                    <div className="flex items-center space-x-3 bg-white/40 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/20">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="bg-transparent border-none text-xs sm:text-sm font-black text-gray-600 focus:ring-0 cursor-pointer w-full"
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/40 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/20">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col flex-1">
                            <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Fecha y Hora</span>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="bg-transparent border-none text-xs sm:text-sm font-black text-gray-600 focus:ring-0 cursor-pointer p-0 w-1/2"
                                />
                                <input
                                    type="time"
                                    value={dueTime}
                                    onChange={(e) => setDueTime(e.target.value)}
                                    className="bg-transparent border-none text-xs sm:text-sm font-black text-gray-600 focus:ring-0 cursor-pointer p-0 w-1/2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/40 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/20">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col flex-1">
                            <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Prioridad</span>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="bg-transparent border-none text-xs sm:text-sm font-black text-gray-600 focus:ring-0 cursor-pointer w-full p-0"
                            >
                                <option value="urgent">Urgente</option>
                                <option value="pending">Pendiente</option>
                                <option value="not_urgent">No Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/40 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/20">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col flex-1">
                            <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Repetir</span>
                            <select
                                value={repeatType}
                                onChange={(e) => setRepeatType(e.target.value)}
                                className="bg-transparent border-none text-xs sm:text-sm font-black text-gray-600 focus:ring-0 cursor-pointer w-full p-0"
                            >
                                <option value="none">Nunca</option>
                                <option value="daily">Diario</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2 sm:pt-4">
                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="w-full sm:w-auto px-10 sm:px-12 py-3.5 sm:py-4 bg-white/60 text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-xl sm:rounded-2xl font-black shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        {loading ? 'Añadiendo...' : 'Añadir Tarea'}
                    </button>
                </div>
            </div>
        </form>
    )
}

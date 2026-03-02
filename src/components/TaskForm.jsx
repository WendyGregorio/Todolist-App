import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PlusCircle, Tag } from 'lucide-react'

export default function TaskForm({ onAdd, selectedCategoryId }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState(selectedCategoryId || '')
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
        setCategoryId(selectedCategoryId || '')
    }, [selectedCategoryId])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })
        if (data) setCategories(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        await onAdd({
            title,
            description,
            category_id: categoryId || null
        })
        setTitle('')
        setDescription('')
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-[#e0f7fa] rounded-[2.5rem] p-10 sm:p-14 mb-12 border-none shadow-2xl shadow-[#e0f7fa]/30">
            <div className="space-y-6">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="¿Qué hay que hacer?"
                    required
                    className="w-full bg-[#ffe5d9] border-none rounded-[1.25rem] px-8 py-5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#ffe5d9]/50 transition-all text-xl font-black shadow-sm"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Añade una descripción (opcional)"
                    rows={2}
                    className="w-full bg-[#fff2cc] border-none rounded-[1.25rem] px-8 py-5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#fff2cc]/50 transition-all resize-none shadow-sm text-lg font-bold"
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                    <div className="flex items-center space-x-3 bg-white/40 px-6 py-3 rounded-2xl border border-white/20">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="bg-transparent border-none text-sm font-black text-gray-600 focus:ring-0 cursor-pointer"
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="px-12 py-4 bg-white/60 text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-2xl font-black shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        {loading ? 'Añadiendo...' : 'Añadir Tarea'}
                    </button>
                </div>
            </div>
        </form>
    )
}

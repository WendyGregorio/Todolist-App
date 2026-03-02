import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    Plus,
    Hash,
    Clock,
    MoreVertical,
    Trash2,
    Edit3,
    List
} from 'lucide-react'

const Sidebar = ({ onSelectCategory, selectedCategoryId, onSelectPending, showPending, categories }) => {
    const [newCategoryName, setNewCategoryName] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState('')

    const handleAddCategory = async (e) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { error } = await supabase
            .from('categories')
            .insert([{ name: newCategoryName, user_id: session.user.id }])

        if (!error) {
            setNewCategoryName('')
            setIsAdding(false)
        }
    }

    const handleDeleteCategory = async (id) => {
        await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (selectedCategoryId === id) {
            onSelectCategory(null)
        }
    }

    const handleUpdateCategory = async (id) => {
        if (!editName.trim()) return
        const { error } = await supabase
            .from('categories')
            .update({ name: editName })
            .eq('id', id)

        if (!error) {
            setEditingId(null)
        }
    }

    return (
        <div className="w-80 h-screen bg-[#e0f7fa]/30 backdrop-blur-xl flex flex-col p-6 border-r border-white/20 z-30">
            <div className="mb-12">
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 tracking-tighter">
                    Mis Tareas
                </h1>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <button
                    onClick={() => {
                        onSelectCategory(null)
                        onSelectPending(false)
                    }}
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${!selectedCategoryId && !showPending
                        ? 'bg-[#fff9c4] text-gray-800 shadow-lg scale-[1.02]'
                        : 'hover:bg-white/40 text-gray-500'
                        }`}
                >
                    <List className="w-5 h-5" />
                    <span>Todas las tareas</span>
                </button>

                <button
                    onClick={() => {
                        onSelectCategory(null)
                        onSelectPending(true)
                    }}
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${showPending
                        ? 'bg-[#ffe5d9] text-gray-800 shadow-lg scale-[1.02]'
                        : 'hover:bg-white/40 text-gray-500'
                        }`}
                >
                    <Clock className="w-5 h-5" />
                    <span>Tareas Pendientes</span>
                </button>

                <div className="pt-8 pb-4">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Categorías</span>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="p-1.5 hover:bg-white/50 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {isAdding && (
                        <form onSubmit={handleAddCategory} className="mb-4">
                            <input
                                autoFocus
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nueva categoría..."
                                className="w-full bg-white/60 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#e0f7fa] transition-all font-bold placeholder:font-medium placeholder-gray-400"
                            />
                        </form>
                    )}

                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="group relative">
                                {editingId === cat.id ? (
                                    <input
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={() => handleUpdateCategory(cat.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                                        className="w-full bg-white/60 border-none rounded-xl px-4 py-3 text-sm font-bold"
                                    />
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                onSelectCategory(cat.id)
                                                onSelectPending(false)
                                            }}
                                            className={`flex-1 flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${selectedCategoryId === cat.id
                                                ? 'bg-[#e1f5fe] text-gray-800 shadow-lg scale-[1.02]'
                                                : 'hover:bg-white/40 text-gray-500'
                                                }`}
                                        >
                                            <Hash className="w-4 h-4" />
                                            <span className="truncate">{cat.name}</span>
                                        </button>

                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity pr-2 space-x-1">
                                            <button
                                                onClick={() => {
                                                    setEditingId(cat.id)
                                                    setEditName(cat.name)
                                                }}
                                                className="p-1.5 hover:bg-white/50 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar

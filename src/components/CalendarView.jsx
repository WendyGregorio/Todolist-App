import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday,
    parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, GripVertical, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

const CalendarView = ({ session, categories }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState('month'); // 'month', 'week'
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
        const channel = supabase
            .channel('calendar_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` }, fetchTasks)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [currentMonth, session.user.id]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', session.user.id)
                .not('due_date', 'is', null);

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks for calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateDueDate = async (taskId, newDate) => {
        const { error } = await supabase
            .from('tasks')
            .update({ due_date: newDate.toISOString() })
            .eq('id', taskId);
        if (error) console.error('Error updating due date:', error);
    };

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-xl">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            if (view === 'month') setCurrentMonth(subMonths(currentMonth, 1));
                            else setCurrentMonth(addDays(currentMonth, -7));
                        }}
                        className="p-2 hover:bg-white/60 rounded-full transition-all text-gray-400 hover:text-gray-800"
                    >
                        <ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter capitalize">
                        {view === 'month'
                            ? format(currentMonth, dateFormat, { locale: es })
                            : `Semana del ${format(startOfWeek(currentMonth, { locale: es }), 'd MMM', { locale: es })}`
                        }
                    </h2>
                    <button
                        onClick={() => {
                            if (view === 'month') setCurrentMonth(addMonths(currentMonth, 1));
                            else setCurrentMonth(addDays(currentMonth, 7));
                        }}
                        className="p-2 hover:bg-white/60 rounded-full transition-all text-gray-400 hover:text-gray-800"
                    >
                        <ChevronRight />
                    </button>
                </div>

                <div className="flex bg-white/50 p-1 rounded-2xl border border-white/20">
                    <button
                        onClick={() => setView('month')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'month' ? 'bg-[#fff9c4] text-gray-800 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'week' ? 'bg-[#fff9c4] text-gray-800 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Semana
                    </button>
                </div>
            </div>
        );
    };

    const renderDaysLabels = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const dayTasks = tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), cloneDay));

                days.push(
                    <div
                        key={day.toString()}
                        className={`relative min-h-[100px] sm:min-h-[120px] p-2 border border-white/10 transition-all ${!isSameMonth(day, monthStart) ? "opacity-20 pointer-events-none" : ""
                            } ${isToday(day) ? "bg-[#fff9c4]/10" : "bg-white/5 hover:bg-white/20"}`}
                    >
                        <span className={`text-xs font-black ${isToday(day) ? "text-[#fbc02d]" : "text-gray-400"}`}>
                            {formattedDate}
                        </span>
                        <div className="mt-2 space-y-1">
                            {dayTasks.slice(0, 3).map(task => {
                                const categoryColor = categories.find(c => c.id === task.category_id)?.color || '#a0c4ff';
                                return (
                                    <div
                                        key={task.id}
                                        style={{ borderLeftColor: categoryColor }}
                                        className={`text-[9px] font-bold p-1 px-2 rounded-md bg-white/60 border-l-4 truncate shadow-sm ${task.completed ? 'opacity-50 line-through' : 'text-gray-700'}`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                );
                            })}
                            {dayTasks.length > 3 && (
                                <div className="text-[8px] font-black text-[#5390ef] uppercase text-center py-1">
                                    + {dayTasks.length - 3} tareas
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">{rows}</div>;
    };

    const renderWeekView = () => {
        const startDate = startOfWeek(currentMonth);
        const endDate = endOfWeek(currentMonth);
        const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="space-y-6">
                {weekDays.map(day => {
                    const dayTasks = tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), day));
                    return (
                        <div key={day.toString()} className="flex flex-col sm:flex-row gap-4 bg-white/30 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 shadow-lg">
                            <div className="sm:w-32 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/20 pb-4 sm:pb-0 sm:pr-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {format(day, 'EEE', { locale: es })}
                                </span>
                                <span className={`text-3xl font-black ${isToday(day) ? 'text-[#fbc02d]' : 'text-gray-800'}`}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="flex-1 space-y-3">
                                {dayTasks.length === 0 ? (
                                    <div className="h-full flex items-center justify-center py-4 opacity-30 italic text-sm font-bold">
                                        Sin tareas programadas
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dayTasks.map(task => (
                                            <div key={task.id} className="flex items-center space-x-3 bg-white/50 p-4 rounded-2xl shadow-sm group">
                                                <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing" />
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-black ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                        {task.title}
                                                    </h4>
                                                    {task.description && (
                                                        <p className="text-[10px] font-bold text-gray-500 truncate mt-0.5">{task.description}</p>
                                                    )}
                                                </div>
                                                {task.category_id && (
                                                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: categories.find(c => c.id === task.category_id)?.color }}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            {renderHeader()}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {view === 'month' ? (
                    <>
                        {renderDaysLabels()}
                        {renderCells()}
                    </>
                ) : (
                    renderWeekView()
                )}
            </motion.div>
        </div>
    );
};

export default CalendarView;

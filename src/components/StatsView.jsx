import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    startOfMonth,
    endOfMonth,
    subDays,
    isWithinInterval,
    parseISO,
    isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';

const COLORS = ['#a0c4ff', '#ffcdd2', '#fff9c4', '#b2dfdb', '#e1f5fe'];

const StatsView = ({ session }) => {
    const [stats, setStats] = useState({
        completedWeekly: 0,
        pendingTotal: 0,
        monthlyProductivity: 0,
        streak: 0,
        weeklyData: [],
        monthlyData: [],
        distribution: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        // Sincronización en tiempo real para estadísticas
        const channel = supabase
            .channel('stats_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` }, fetchStats)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [session.user.id]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data: allTasks, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) throw error;

            const now = new Date();
            const weekStart = startOfWeek(now);
            const weekEnd = endOfWeek(now);
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);

            // 1. Weekly Completed
            const completedThisWeek = allTasks.filter(t =>
                t.completed &&
                t.completed_at &&
                isWithinInterval(parseISO(t.completed_at), { start: weekStart, end: weekEnd })
            ).length;

            // 2. Pending Total
            const pending = allTasks.filter(t => !t.completed).length;

            // 3. Monthly Productivity
            const createdThisMonth = allTasks.filter(t =>
                isWithinInterval(parseISO(t.created_at), { start: monthStart, end: monthEnd })
            ).length;
            const completedThisMonth = allTasks.filter(t =>
                t.completed &&
                t.completed_at &&
                isWithinInterval(parseISO(t.completed_at), { start: monthStart, end: monthEnd })
            ).length;
            const productivity = createdThisMonth > 0 ? Math.round((completedThisMonth / createdThisMonth) * 100) : 0;

            // 4. Weekly Data Chart
            const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
            const weeklyData = weekDays.map(day => ({
                day: format(day, 'EEE', { locale: es }),
                completadas: allTasks.filter(t => t.completed && t.completed_at && isSameDay(parseISO(t.completed_at), day)).length,
                creadas: allTasks.filter(t => isSameDay(parseISO(t.created_at), day)).length
            }));

            // 5. Distribution (Pie)
            const distribution = [
                { name: 'Completas', value: allTasks.filter(t => t.completed).length },
                { name: 'Pendientes', value: pending }
            ];

            // 6. Streak Logic (simplified)
            let streak = 0;
            let checkDay = now;
            while (allTasks.some(t => t.completed && t.completed_at && isSameDay(parseISO(t.completed_at), checkDay))) {
                streak++;
                checkDay = subDays(checkDay, 1);
            }

            setStats({
                completedWeekly: completedThisWeek,
                pendingTotal: pending,
                monthlyProductivity: productivity,
                streak,
                weeklyData,
                distribution
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, color, unit }) => (
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-xl flex items-center space-x-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-20`}>
                <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tighter">
                    {value}{unit}
                </h3>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tighter mb-8">Tu Productividad</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={CheckCircle}
                    title="Esta Semana"
                    value={stats.completedWeekly}
                    color="bg-blue-400"
                    unit=" Tareas"
                />
                <StatCard
                    icon={Clock}
                    title="Pendientes"
                    value={stats.pendingTotal}
                    color="bg-orange-400"
                    unit=""
                />
                <StatCard
                    icon={TrendingUp}
                    title="Eficiencia"
                    value={stats.monthlyProductivity}
                    color="bg-green-400"
                    unit="%"
                />
                <StatCard
                    icon={Zap}
                    title="Racha Actual"
                    value={stats.streak}
                    color="bg-yellow-400"
                    unit=" Días"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Gráfica Semanal */}
                <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight uppercase mb-8">Desempeño Semanal</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                />
                                <Bar dataKey="completadas" fill="#a0c4ff" radius={[10, 10, 0, 0]} />
                                <Bar dataKey="creadas" fill="#ffcdd2" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribución Circular */}
                <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight uppercase mb-8">Distribución de Tareas</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {stats.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-gray-800 tracking-tighter">{stats.completedWeekly + stats.pendingTotal}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsView;

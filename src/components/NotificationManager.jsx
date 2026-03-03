import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { parseISO, subHours, subDays, isBefore, isAfter } from 'date-fns';

const NotificationManager = ({ session }) => {
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        if (permission === 'granted') {
            const interval = setInterval(checkDeadlines, 60000 * 5); // Cada 5 minutos
            checkDeadlines();
            return () => clearInterval(interval);
        }
    }, [permission]);

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    const checkDeadlines = async () => {
        try {
            const { data: tasks, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('completed', false)
                .is('reminder_sent', false)
                .not('due_date', 'is', null);

            if (error) throw error;

            const now = new Date();

            for (const task of tasks) {
                const dueDate = parseISO(task.due_date);
                const oneDayBefore = subDays(dueDate, 1);
                const oneHourBefore = subHours(dueDate, 1);

                let shouldNotify = false;
                let message = "";

                if (isBefore(oneDayBefore, now) && isAfter(dueDate, now)) {
                    shouldNotify = true;
                    message = `Recuerda: "${task.title}" vence mañana.`;
                } else if (isBefore(oneHourBefore, now) && isAfter(dueDate, now)) {
                    shouldNotify = true;
                    message = `¡Urgente! "${task.title}" vence en una hora.`;
                } else if (isBefore(dueDate, now)) {
                    shouldNotify = true;
                    message = `"${task.title}" ha vencido hoy.`;
                }

                if (shouldNotify) {
                    sendNotification(task.title, message);
                    await markAsSent(task.id);
                }
            }
        } catch (error) {
            console.error('Error checking deadlines:', error);
        }
    };

    const sendNotification = (title, body) => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    vibrate: [200, 100, 200],
                    tag: 'task-reminder'
                });
            });
        }
    };

    const markAsSent = async (taskId) => {
        await supabase
            .from('tasks')
            .update({ reminder_sent: true })
            .eq('id', taskId);
    };

    return (
        <div className="fixed top-24 right-6 z-50">
            {permission !== 'granted' ? (
                <button
                    onClick={requestPermission}
                    className="flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-white/40 text-gray-600 px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-white/80 transition-all text-[10px] uppercase tracking-widest"
                    title={`Notificaciones activadas para: ${session.user.email}`}
                >
                    <BellRing className="w-4 h-4 text-orange-400" />
                    <span>Activar Avisos</span>
                </button>
            ) : (
                <div
                    className="bg-white/30 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-sm text-green-500 group cursor-help"
                    title={`Avisos configurados para ${session.user.email}`}
                >
                    <Bell className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
            )}
        </div>
    );
};

export default NotificationManager;

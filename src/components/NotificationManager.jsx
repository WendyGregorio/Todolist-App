import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { parseISO, subMinutes, format } from 'date-fns';

const NotificationManager = ({ session }) => {
    const [permission, setPermission] = useState(Notification.permission);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);

        if (permission === 'granted') {
            const interval = setInterval(checkDeadlines, 60000); // Revisar cada minuto para mayor precisión
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

            for (const task of tasks) {
                const dueDate = parseISO(task.due_date);
                const now = new Date();
                const diffInMinutes = (dueDate.getTime() - now.getTime()) / 60000;

                console.log(`[Notificaciones] Revisando: "${task.title}"`);
                console.log(`- Vence en: ${format(dueDate, 'PPpp')}`);
                console.log(`- Ahora es: ${format(now, 'PPpp')}`);
                console.log(`- Diferencia: ${diffInMinutes.toFixed(2)} minutos`);

                let shouldNotify = false;
                let message = "";

                // Rango de 28 a 32 minutos para asegurar que el check de cada minuto lo capture
                if (diffInMinutes <= 31 && diffInMinutes >= 29) {
                    shouldNotify = true;
                    message = `¡Recordatorio! "${task.title}" vence en 30 minutos (${format(dueDate, 'HH:mm')}).`;
                } else if (diffInMinutes <= 0 && diffInMinutes > -10) {
                    shouldNotify = true;
                    message = `"${task.title}" ha llegado a su hora límite (${format(dueDate, 'HH:mm')}).`;
                }

                if (shouldNotify) {
                    console.log(`[Notificaciones] DISPARANDO NOTIFICACIÓN: ${message}`);
                    sendNotification(task.title, message);
                    await markAsSent(task.id);
                }
            }
        } catch (error) {
            console.error('Error checking deadlines:', error);
        }
    };

    const handleTestNotification = () => {
        if (permission !== 'granted') {
            requestPermission();
        } else {
            sendNotification(
                "¡Prueba Exitosa! 🎉",
                "Si ves esto, tu teléfono permite recibir avisos de Cloud Task."
            );
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

            <div className="mt-4 flex flex-col items-end space-y-2">
                <button
                    onClick={handleTestNotification}
                    className="bg-white/40 backdrop-blur-md p-2 rounded-xl border border-white/20 text-gray-500 hover:text-blue-500 transition-all shadow-sm"
                    title="Probar notificación ahora"
                >
                    <span className="text-[9px] font-black uppercase tracking-widest px-1">Probar Aviso</span>
                </button>

                {!isStandalone && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
                    <div className="bg-orange-50/80 backdrop-blur-md p-3 rounded-2xl border border-orange-100 shadow-lg max-w-[200px] animate-pulse">
                        <p className="text-[9px] font-black text-orange-600 leading-tight">
                            ⚠️ PARA AVISOS EN MÓVIL: <br />
                            Pulsa "Compartir" y luego <br />
                            "Añadir a pantalla de inicio"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationManager;

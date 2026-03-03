import { Bell, BellOff, BellRing } from 'lucide-react';
import { parseISO, subMinutes, format } from 'date-fns';

const NotificationManager = ({ session }) => {
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
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

            const now = new Date();

            for (const task of tasks) {
                const dueDate = parseISO(task.due_date);
                const thirtyMinutesBefore = subMinutes(dueDate, 30);

                // Si faltan entre 25 y 35 minutos para la tarea (ventana de detección)
                // O si la tarea acaba de vencer hace poco (menos de 5 min)
                const diffInMinutes = (dueDate.getTime() - now.getTime()) / 60000;

                let shouldNotify = false;
                let message = "";

                if (diffInMinutes <= 30 && diffInMinutes > 0) {
                    shouldNotify = true;
                    message = `¡Recordatorio! "${task.title}" vence en 30 minutos (${format(dueDate, 'HH:mm')}).`;
                } else if (diffInMinutes <= 0 && diffInMinutes > -5) {
                    shouldNotify = true;
                    message = `"${task.title}" ha llegado a su hora límite (${format(dueDate, 'HH:mm')}).`;
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

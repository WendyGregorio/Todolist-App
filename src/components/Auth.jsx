import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2, User, Mail, Lock, Twitter, Instagram, Facebook, Github } from 'lucide-react'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(false) // Default to Register matching the image
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name }
                    }
                })
                if (error) throw error
                setMessage({
                    type: 'success',
                    text: '¡Registro exitoso! Por favor verifica tu correo electrónico.',
                })
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Ocurrió un error inesperado' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5e6ff] p-4 relative overflow-hidden">
            {/* Ambient Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-yellow-200/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* The Main Split Container */}
            <div className={`relative w-full max-w-[900px] min-h-[550px] bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-700 ease-in-out border border-white/20 ${isLogin ? 'md:flex-row-reverse' : ''}`}>

                {/* Colored Panel */}
                <div className="relative w-full md:w-[45%] bg-[#FACC15] flex flex-col justify-center items-center p-12 text-center z-20">
                    <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter shadow-sm">
                        {isLogin ? '¡Bienvenido!' : '¡Hola!'}
                    </h2>
                    <p className="text-white text-sm mb-12 leading-relaxed font-black px-4 uppercase tracking-widest opacity-90">
                        {isLogin
                            ? 'Mantente conectado con nosotros, inicia sesión con tu cuenta personal'
                            : 'Regístrate con tus datos personales para acceder a todas las funciones'}
                    </p>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setMessage({ type: '', text: '' }); setName('') }}
                        className="py-4 px-12 border-4 border-white text-white rounded-2xl font-black tracking-widest hover:bg-white hover:text-[#FACC15] transition-all duration-300 focus:outline-none uppercase text-xs"
                    >
                        {isLogin ? 'Crear cuenta' : 'Ya tengo cuenta'}
                    </button>
                </div>

                {/* White Panel (Form Area) */}
                <div className="relative w-full md:w-[55%] bg-white/40 p-10 md:p-14 flex flex-col justify-center items-center z-10 transition-all duration-500">

                    <h2 className="text-3xl font-black text-gray-800 mb-8 tracking-tighter uppercase">
                        {isLogin ? 'Iniciar Sesión' : 'Registro'}
                    </h2>

                    {message.text && (
                        <div className={`w-full p-4 rounded-2xl mb-8 text-[11px] font-black text-center border uppercase tracking-widest ${message.type === 'error' ? 'bg-red-50/50 border-red-200 text-red-500' : 'bg-green-50/50 border-green-200 text-green-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="w-full max-w-[320px] space-y-5">
                        {!isLogin && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nombre Completo"
                                    required={!isLogin}
                                    className="w-full pl-12 pr-6 py-4 bg-white/60 border border-transparent rounded-[1.25rem] text-gray-800 text-sm focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 transition-all font-bold placeholder-gray-400 shadow-sm"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Correo electrónico"
                                required
                                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-transparent rounded-[1.25rem] text-gray-800 text-sm focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 transition-all font-bold placeholder-gray-400 shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                required
                                minLength={6}
                                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-transparent rounded-[1.25rem] text-gray-800 text-sm focus:outline-none focus:ring-4 focus:ring-[#FACC15]/20 transition-all font-bold placeholder-gray-400 shadow-sm"
                            />
                        </div>

                        {isLogin && (
                            <div className="text-center pt-2">
                                <a href="#" className="text-[11px] text-gray-500 hover:text-[#FACC15] transition-colors font-black uppercase tracking-widest">¿Olvidaste tu contraseña?</a>
                            </div>
                        )}

                        <div className="pt-8 text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#FACC15] hover:bg-[#eab308] text-white rounded-[1.25rem] font-black tracking-widest text-[11px] uppercase transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#FACC15]/40 shadow-xl shadow-[#FACC15]/20 hover:shadow-[#FACC15]/30 hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : (isLogin ? 'ACCEDER AHORA' : 'EMPEZAR GRATIS')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

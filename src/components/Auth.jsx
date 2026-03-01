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
                    text: 'Registration successful! Check your email.',
                })
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7f9] p-4 relative overflow-hidden">
            {/* Ambient Background to ground the floating card */}
            <div className="absolute inset-0 pointer-events-none"></div>

            {/* The Main Split Container */}
            <div className={`relative w-full max-w-[900px] min-h-[550px] bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-700 ease-in-out ${isLogin ? 'md:flex-row-reverse' : ''}`}>

                {/* Colored Panel (Yellow as requested) */}
                <div className="relative w-full md:w-[45%] bg-[#FACC15] flex flex-col justify-center items-center p-12 text-center z-20">
                    <h2 className="text-4xl font-extrabold text-white mb-6">
                        {isLogin ? '¡Hola, amigo!' : '¡Hola!'}
                    </h2>
                    <p className="text-white text-sm mb-12 leading-relaxed font-medium px-4">
                        {isLogin
                            ? 'Para mantenerte conectado con nosotros, inicia sesión con tu información personal'
                            : 'Regístrese con sus datos personales para utilizar todas las funciones del sitio'}
                    </p>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setMessage({ type: '', text: '' }); setName('') }}
                        className="py-3 px-10 border-2 border-white text-white rounded-full font-bold tracking-wide hover:bg-white hover:text-[#FACC15] transition-colors focus:outline-none"
                    >
                        {isLogin ? 'REGISTRARSE' : 'Iniciar sesión'}
                    </button>

                    {/* The Curved Intersection Effect matching the image */}
                    <div className={`hidden md:block absolute top-[50%] -translate-y-1/2 ${isLogin ? 'left-[-15%]' : 'right-[-25%]'} w-[50%] h-[120%] bg-[#FACC15] rounded-[100%] -z-10 transition-all duration-700`}></div>
                </div>

                {/* White Panel (Form Area) */}
                <div className="relative w-full md:w-[55%] bg-white p-10 md:p-14 flex flex-col justify-center items-center z-10 transition-all duration-500">

                    <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
                        {isLogin ? 'Iniciar sesión' : 'Registrarse'}
                    </h2>



                    {message.text && (
                        <div className={`w-full p-3 rounded-lg mb-6 text-xs font-bold text-center border ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="w-full max-w-[320px] space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-[#FACC15]" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nombre"
                                    required={!isLogin}
                                    className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] border border-transparent rounded-md text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FACC15] transition-all font-medium placeholder-gray-400"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-[#FACC15]" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] border border-transparent rounded-md text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FACC15] transition-all font-medium placeholder-gray-400"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#FACC15]" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                minLength={6}
                                className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] border border-transparent rounded-md text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FACC15] transition-all font-medium placeholder-gray-400"
                            />
                        </div>

                        {isLogin && (
                            <div className="text-center pt-2">
                                <a href="#" className="text-[13px] text-gray-500 hover:text-[#FACC15] transition-colors font-medium">¿Olvidaste tu contraseña?</a>
                            </div>
                        )}

                        <div className="pt-6 text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="py-3 px-14 bg-[#FACC15] hover:bg-[#eab308] text-white rounded-md font-bold tracking-wider text-[13px] uppercase transition-all disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#FACC15]/40 shadow-lg shadow-[#FACC15]/30 hover:shadow-xl hover:shadow-[#FACC15]/40 hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

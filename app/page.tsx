'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const fullText =
    'Save, organize & access your links privately.'

  const [typedText, setTypedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [index, setIndex] = useState(0)

  // 🔐 Check session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router])

  // ✨ Continuous Typewriter
  useEffect(() => {
    const typingSpeed = isDeleting ? 35 : 60
    const pauseTime = 1200

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(fullText.slice(0, index + 1))
        setIndex(index + 1)

        if (index + 1 === fullText.length) {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        setTypedText(fullText.slice(0, index - 1))
        setIndex(index - 1)

        if (index - 1 === 0) {
          setIsDeleting(false)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [index, isDeleting, fullText])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center px-4 sm:px-6">

      {/* Floating Background Icons (hide some on small screens) */}
      <div className="hidden sm:block absolute text-white/10 text-6xl top-20 left-20 animate-float1">
        🔗
      </div>

      <div className="hidden md:block absolute text-white/10 text-5xl top-1/3 right-32 animate-float2">
        🚀
      </div>

      <div className="hidden sm:block absolute text-white/10 text-7xl bottom-32 left-1/4 animate-float3">
        ⭐
      </div>

      <div className="hidden md:block absolute text-white/10 text-6xl bottom-20 right-20 animate-float4">
        🔒
      </div>

      {/* Background Blobs */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-purple-600/30 rounded-full blur-3xl animate-slowZoom top-10 left-5 sm:left-10"></div>
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-slowZoom bottom-10 right-5 sm:right-10"></div>

      <div className="relative z-10 max-w-md w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full bg-white/10 backdrop-blur border border-white/20 text-gray-200 animate-badgeZoom">
          🚀 Private • Real-time • Secure
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
          Smart Bookmark
        </h1>

        {/* Typewriter */}
        <p className="text-gray-300 text-base sm:text-lg mb-8 sm:mb-10 min-h-[28px] px-2">
          {typedText}
          <span className="animate-pulse">|</span>
        </p>

        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 transition-all duration-500 hover:scale-[1.02]">

          <button
            onClick={handleLogin}
            className="group w-full flex items-center justify-center gap-3 
                       bg-gradient-to-r from-purple-600 to-indigo-600
                       text-white font-semibold py-3 rounded-xl 
                       transition-all duration-300
                       hover:from-indigo-600 hover:to-purple-600
                       hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]
                       active:scale-95 cursor-pointer"
          >
            <span className="text-xl transition-transform duration-300 group-hover:rotate-12">
              🔐
            </span>

            Continue with Google
          </button>

          <p className="text-xs text-gray-400 mt-5 sm:mt-6">
            We only access your basic profile information.
          </p>
        </div>
      </div>
    </div>
  )
}

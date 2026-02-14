'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, LogOut, Bookmark } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ------------------------
  // Get User
  // ------------------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/')
      } else {
        setUser(data.user)
        fetchBookmarks(data.user.id)
      }
    }
    getUser()
  }, [router])

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  // ------------------------
  // Realtime
  // ------------------------
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => fetchBookmarks(user.id)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // ------------------------
  // Add Bookmark
  // ------------------------
  const addBookmark = async () => {
  setError('')

  if (!title.trim()) return setError('Title is required.')
  if (!url.trim()) return setError('URL is required.')
  if (!url.startsWith('http'))
    return setError('URL must start with http or https.')

  setLoading(true)

  const { error } = await supabase.from('bookmarks').insert([
    { title, url, user_id: user.id },
  ])

  if (!error && user) {
    await fetchBookmarks(user.id) 
    setTitle('')
    setUrl('')
  }

  setLoading(false)
}


  // ------------------------
  // Delete
  // ------------------------
  const confirmDelete = async () => {
  if (!deleteId || !user) return

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', deleteId)

  if (!error) {
    await fetchBookmarks(user.id) 
  }

  setDeleteId(null)
}

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // ------------------------
// Sync Logout Across Tabs
// ------------------------
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!session) {
        router.push('/')
      }
    }
  )

  return () => {
    listener.subscription.unsubscribe()
  }
}, [router])


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4 sm:px-6 py-10 sm:py-12">

      {/* Background Glow */}
      <div className="absolute w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/30 rounded-full blur-3xl animate-slowZoom top-10 left-5 sm:left-10"></div>
      <div className="absolute w-72 sm:w-96 h-72 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-slowZoom bottom-10 right-5 sm:right-10"></div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10 sm:mb-12">

          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-white">
            <Bookmark size={28} className="text-purple-400 sm:w-8 sm:h-8" />
            Smart Bookmarks
          </h1>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full hover:bg-white/20 transition cursor-pointer w-full sm:w-auto"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Add Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 rounded-2xl mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row gap-4">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title"
              className="flex-1 p-3 rounded-xl bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-purple-400 outline-none"
            />

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 p-3 rounded-xl bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-purple-400 outline-none"
            />

            <button
              onClick={addBookmark}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition cursor-pointer w-full md:w-auto"
            >
              <Plus size={18} />
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 mt-4 text-sm">{error}</p>
          )}
        </div>

        {/* List Layout */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <div className="text-center text-gray-300">
              No bookmarks yet 🚀
            </div>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-5 rounded-xl hover:bg-white/20 transition"
            >
              <div className="break-words">
                <h3 className="text-white font-semibold text-sm sm:text-base">
                  {bookmark.title}
                </h3>

                <a
                  href={bookmark.url}
                  target="_blank"
                  className="text-purple-300 text-xs sm:text-sm break-all hover:underline"
                >
                  {bookmark.url}
                </a>
              </div>

              <button
                onClick={() => setDeleteId(bookmark.id)}
                className="text-red-400 hover:text-red-500 transition cursor-pointer self-end sm:self-auto"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-sm text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Delete Bookmark?
            </h2>

            <p className="text-gray-300 text-sm mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

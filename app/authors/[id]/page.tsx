'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar,
  Globe,
  Mail,
  FileText,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  Loader2,
  TrendingUp,
  Award,
  ChevronRight,
  BookMarked,
  Tag,
  Clock,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface Book {
  id: string
  title: string
  description: string | null
  isbn: string | null
  publishedYear: number | null
  genre: string | null
  pages: number | null
  createdAt: string
}

interface Author {
  id: string
  name: string
  email: string
  bio: string | null
  nationality: string | null
  birthYear: number | null
  books: Book[]
}

interface AuthorStats {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: { title: string; year: number } | null
  latestBook: { title: string; year: number } | null
  averagePages: number
  genres: string[]
  longestBook: { title: string; pages: number } | null
  shortestBook: { title: string; pages: number } | null
}

export default function AuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const authorId = resolvedParams.id

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Forms states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  
  // Profile edit form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    nationality: '',
    birthYear: '',
    bio: ''
  })
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  // Book creation form
  const [bookData, setBookData] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: ''
  })
  const [bookError, setBookError] = useState<string | null>(null)
  const [bookSubmitting, setBookSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch profile & books
      const authorRes = await fetch(`/api/authors/${authorId}`)
      if (!authorRes.ok) throw new Error('No se pudo encontrar la información del autor')
      const authorData = await authorRes.json()
      setAuthor(authorData)
      
      setProfileData({
        name: authorData.name,
        email: authorData.email,
        nationality: authorData.nationality || '',
        birthYear: authorData.birthYear ? authorData.birthYear.toString() : '',
        bio: authorData.bio || ''
      })

      // Fetch statistics
      const statsRes = await fetch(`/api/authors/${authorId}/stats`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [authorId])

  // Delete author
  const handleDeleteAuthor = async () => {
    if (!author) return
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al autor "${author.name}" y todos sus libros?`)) return
    
    try {
      const res = await fetch(`/api/authors/${authorId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('No se pudo eliminar al autor')
      router.push('/')
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Edit Profile submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSubmitting(true)

    try {
      const res = await fetch(`/api/authors/${authorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          birthYear: profileData.birthYear ? parseInt(profileData.birthYear) : null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al actualizar perfil')
      
      setIsEditProfileOpen(false)
      fetchData()
    } catch (err: any) {
      setProfileError(err.message)
    } finally {
      setProfileSubmitting(false)
    }
  }

  // Add Book submission
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookError(null)
    setBookSubmitting(true)

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookData,
          authorId,
          publishedYear: bookData.publishedYear ? parseInt(bookData.publishedYear) : null,
          pages: bookData.pages ? parseInt(bookData.pages) : null,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar libro')

      setIsAddBookOpen(false)
      setBookData({
        title: '',
        description: '',
        isbn: '',
        publishedYear: '',
        genre: '',
        pages: ''
      })
      fetchData()
    } catch (err: any) {
      setBookError(err.message)
    } finally {
      setBookSubmitting(false)
    }
  }

  // Delete a book
  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el libro "${title}"?`)) return
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('No se pudo eliminar el libro')
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-slate-500 text-sm">Cargando perfil del autor...</p>
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="space-y-6 text-center max-w-md mx-auto py-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-655 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error || 'Autor no encontrado'}
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-450 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Botón de retroceso */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a Autores
        </Link>
      </div>

      {/* Perfil del Autor */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400">
                <Award className="h-3.5 w-3.5" />
                Perfil de Autor
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{author.name}</h1>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-450">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                {author.email}
              </span>
              {author.nationality && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-400" />
                  {author.nationality}
                </span>
              )}
              {author.birthYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Nacido en {author.birthYear}
                </span>
              )}
            </div>

            {author.bio ? (
              <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-sm max-w-3xl pt-2">
                {author.bio}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-500 pt-2">Sin biografía registrada</p>
            )}
          </div>

          <div className="flex flex-row md:flex-col gap-2 min-w-[150px]">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar Perfil
            </button>
            <button
              onClick={handleDeleteAuthor}
              className="p-2.5 rounded-xl text-red-650 hover:bg-red-50 border border-red-200/50 dark:text-red-400 dark:hover:bg-red-950/20 dark:border-red-900/30 transition-colors"
              title="Eliminar autor"
            >
              <Trash2 className="h-4 w-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas del Autor */}
      {stats && stats.totalBooks > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Estadísticas de Publicación
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Libros Publicados</p>
              <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">{stats.totalBooks}</h3>
              {stats.genres.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 line-clamp-1">
                  En {stats.genres.length} géneros únicos
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trayectoria</p>
              {stats.firstBook && stats.latestBook ? (
                <>
                  <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">
                    {stats.latestBook.year && stats.firstBook.year 
                      ? `${stats.latestBook.year - stats.firstBook.year} años`
                      : 'N/A'
                    }
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 line-clamp-1">
                    {stats.firstBook.year} ({stats.firstBook.title}) - {stats.latestBook.year}
                  </p>
                </>
              ) : (
                <h3 className="text-2xl font-extrabold text-slate-400 mt-1">N/A</h3>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio de Páginas</p>
              <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">{stats.averagePages} págs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-2">Por publicación</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Libros Extremos</p>
              {stats.longestBook || stats.shortestBook ? (
                <div className="mt-2 space-y-1 text-xs">
                  {stats.longestBook && (
                    <p className="text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">Max: {stats.longestBook.title}</span>
                      <span className="font-mono text-emerald-500 shrink-0">{stats.longestBook.pages}p</span>
                    </p>
                  )}
                  {stats.shortestBook && (
                    <p className="text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">Min: {stats.shortestBook.title}</span>
                      <span className="font-mono text-emerald-500 shrink-0">{stats.shortestBook.pages}p</span>
                    </p>
                  )}
                </div>
              ) : (
                <h3 className="text-2xl font-extrabold text-slate-400 mt-1">N/A</h3>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Listado de Libros */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Libros del Autor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">Colección completa de las obras escritas por {author.name}.</p>
          </div>
          <button
            onClick={() => setIsAddBookOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2.5 text-sm font-bold shadow"
          >
            <Plus className="h-4 w-4" />
            Agregar Obra
          </button>
        </div>

        {author.books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <BookMarked className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Aún no hay libros</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registra el primer libro escrito por este autor.</p>
            <button
              onClick={() => setIsAddBookOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-bold shadow"
            >
              Agregar Libro
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {author.books.map((book) => (
              <div 
                key={book.id} 
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  <div>
                    {book.genre && (
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider mb-2 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                        {book.genre}
                      </span>
                    )}
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {book.title}
                    </h3>
                  </div>

                  {book.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 dark:border-slate-800/80 pt-3">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Año: {book.publishedYear || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      Págs: {book.pages || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                  <button
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-650 text-xs font-bold py-2 dark:border-red-900/30 dark:hover:bg-red-950/20 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Editar Perfil Autor */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">Editar Perfil del Autor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Actualiza los datos personales del autor.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {profileError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-650 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                  {profileError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del Autor *</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email *</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nacionalidad</label>
                  <input 
                    type="text" 
                    value={profileData.nationality}
                    onChange={e => setProfileData({ ...profileData, nationality: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Año de Nacimiento</label>
                  <input 
                    type="number" 
                    value={profileData.birthYear}
                    onChange={e => setProfileData({ ...profileData, birthYear: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Biografía</label>
                <textarea 
                  value={profileData.bio}
                  onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-emerald-500/10 disabled:opacity-50 transition-all"
                >
                  {profileSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Libro para este Autor */}
      {isAddBookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">Registrar Libro de {author.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">Completa los datos de la obra.</p>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              {bookError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-650 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                  {bookError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Título del Libro *</label>
                <input 
                  type="text" 
                  value={bookData.title}
                  onChange={e => setBookData({ ...bookData, title: e.target.value })}
                  placeholder="Ej. La hojarasca"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Género</label>
                  <select
                    value={bookData.genre}
                    onChange={e => setBookData({ ...bookData, genre: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  >
                    <option value="">Sin género</option>
                    {['Novela', 'Ficción', 'Drama', 'Poesía', 'Ensayo', 'Biografía', 'Historia', 'Ciencia', 'Fantasía', 'Terror'].map((g, idx) => (
                      <option key={idx} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Año de Publicación</label>
                  <input 
                    type="number" 
                    value={bookData.publishedYear}
                    onChange={e => setBookData({ ...bookData, publishedYear: e.target.value })}
                    placeholder="Ej. 1955"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Número de Páginas</label>
                  <input 
                    type="number" 
                    value={bookData.pages}
                    onChange={e => setBookData({ ...bookData, pages: e.target.value })}
                    placeholder="Ej. 285"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ISBN</label>
                  <input 
                    type="text" 
                    value={bookData.isbn}
                    onChange={e => setBookData({ ...bookData, isbn: e.target.value })}
                    placeholder="Ej. 978-0-307-35193-7"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descripción / Resumen</label>
                <textarea 
                  value={bookData.description}
                  onChange={e => setBookData({ ...bookData, description: e.target.value })}
                  placeholder="Resumen del argumento..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={bookSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-emerald-500/10 disabled:opacity-50 transition-all"
                >
                  {bookSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

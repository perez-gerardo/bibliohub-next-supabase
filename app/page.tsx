'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  UserPlus, 
  Users, 
  BookOpen, 
  Calendar, 
  Globe, 
  FileText, 
  Edit3, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  Bookmark,
  Sparkles,
  Loader2,
  Plus
} from 'lucide-react'

interface Author {
  id: string
  name: string
  email: string
  bio: string | null
  nationality: string | null
  birthYear: number | null
  createdAt: string
  _count?: {
    books: number
  }
}

export default function Dashboard() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nationality: '',
    birthYear: '',
    bio: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch authors
  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/authors')
      if (!res.ok) throw new Error('Error al obtener la lista de autores')
      const data = await res.json()
      setAuthors(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuthors()
  }, [])

  // Open form for creation
  const handleNewAuthor = () => {
    setEditingAuthor(null)
    setFormData({
      name: '',
      email: '',
      nationality: '',
      birthYear: '',
      bio: ''
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open form for editing
  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author)
    setFormData({
      name: author.name,
      email: author.email,
      nationality: author.nationality || '',
      birthYear: author.birthYear ? author.birthYear.toString() : '',
      bio: author.bio || ''
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  // Delete author
  const handleDeleteAuthor = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al autor "${name}"?`)) return
    
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'No se pudo eliminar al autor')
      }
      // Refresh list
      fetchAuthors()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    // Basic validation
    if (!formData.name || !formData.email) {
      setFormError('El nombre y el email son campos obligatorios')
      setSubmitting(false)
      return
    }

    try {
      const url = editingAuthor ? `/api/authors/${editingAuthor.id}` : '/api/authors'
      const method = editingAuthor ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud')
      }

      setIsFormOpen(false)
      fetchAuthors()
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate general stats
  const totalAuthors = authors.length
  const totalBooks = authors.reduce((acc, curr) => acc + (curr._count?.books || 0), 0)
  const countriesCount = new Set(authors.map(a => a.nationality).filter(Boolean)).size

  return (
    <div className="space-y-10">
      {/* Banner de Bienvenida Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-cyan-800 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 px-8 py-12 md:p-16 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
            Sistema de Biblioteca v2.0
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            No hay nada mejor que leer.
          </h1>
          <p className="text-emerald-100 text-lg font-medium leading-relaxed">
            Administra autores, gestiona libros y visualiza estadísticas en tiempo real de tu biblioteca.
          </p>
          <div className="pt-2">
            <button
              onClick={handleNewAuthor}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-800 px-6 py-3 font-bold hover:bg-emerald-50 active:scale-95 shadow-lg shadow-black/10 hover:shadow-black/20 transition-all duration-200"
            >
              <UserPlus className="h-5 w-5" />
              Nuevo Autor
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Generales */}
      <section className="grid gap-6 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Autores</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : totalAuthors}
              </h3>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Libros</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : totalBooks}
              </h3>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Países Representados</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : countriesCount}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Sección del Listado de Autores */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Autores Registrados</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra los perfiles de los autores de tu catálogo.</p>
          </div>
          <button
            onClick={handleNewAuthor}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 text-sm font-bold shadow transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-slate-500 text-sm">Cargando autores...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        ) : authors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No hay autores registrados</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Comienza agregando un nuevo autor al sistema.</p>
            <button
              onClick={handleNewAuthor}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold shadow"
            >
              Agregar Autor
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <div 
                key={author.id} 
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {author.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">{author.email}</p>
                    </div>
                    <span className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                      {author._count?.books || 0} libros
                    </span>
                  </div>
                  
                  {author.bio ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {author.bio}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400 dark:text-slate-500">Sin biografía disponible</p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {author.nationality && (
                      <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                        <Globe className="h-3 w-3" />
                        {author.nationality}
                      </span>
                    )}
                    {author.birthYear && (
                      <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                        <Calendar className="h-3 w-3" />
                        Nac. {author.birthYear}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                  <Link
                    href={`/authors/${author.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-2 dark:bg-slate-800 dark:hover:bg-slate-705 dark:text-slate-300 dark:border-slate-700 transition-colors"
                  >
                    Detalles
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={() => handleEditAuthor(author)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:border-slate-700 transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAuthor(author.id, author.name)}
                    className="p-2 rounded-xl text-red-650 hover:bg-red-50 border border-red-200/50 dark:text-red-400 dark:hover:bg-red-950/20 dark:border-red-900/30 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Formulario Modal (Agregar/Editar) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">
                {editingAuthor ? 'Editar Autor' : 'Registrar Nuevo Autor'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completa la información del autor a continuación.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-650 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del Autor *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Gabriel García Márquez"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="gabo@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nacionalidad</label>
                  <input 
                    type="text" 
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Ej. Colombia"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Año de Nacimiento</label>
                  <input 
                    type="number" 
                    value={formData.birthYear}
                    onChange={e => setFormData({ ...formData, birthYear: e.target.value })}
                    placeholder="Ej. 1927"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Biografía</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Breve reseña sobre el autor..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-emerald-500/10 disabled:opacity-50 transition-all"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingAuthor ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

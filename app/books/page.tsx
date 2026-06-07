'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar, 
  Hash, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpDown
} from 'lucide-react'

interface Author {
  id: string
  name: string
}

interface Book {
  id: string
  title: string
  description: string | null
  isbn: string | null
  publishedYear: number | null
  genre: string | null
  pages: number | null
  authorId: string
  createdAt: string
  author?: {
    name: string
    nationality: string | null
  }
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and Pagination State
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorIdFilter, setAuthorIdFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [limit] = useState(6) // 6 items per page for a beautiful responsive grid
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Book Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
    authorId: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Authors for dropdown filters & creation form
  const fetchAuthors = async () => {
    try {
      const res = await fetch('/api/authors')
      if (res.ok) {
        const data = await res.json()
        setAuthors(data)
      }
    } catch (err) {
      console.error('Error fetching authors:', err)
    }
  }

  // Fetch Books with Search, Filters, Sorting & Pagination
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get author name from author filter if selected
      let authorName = ''
      if (authorIdFilter) {
        const selectedAuthor = authors.find(a => a.id === authorIdFilter)
        if (selectedAuthor) {
          authorName = selectedAuthor.name
        }
      }

      const queryParams = new URLSearchParams({
        search,
        genre,
        authorName,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order
      })

      const res = await fetch(`/api/books/search?${queryParams.toString()}`)
      if (!res.ok) throw new Error('Error al buscar libros')
      
      const result = await res.json()
      setBooks(result.data)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la base de datos')
    } finally {
      setLoading(false)
    }
  }, [search, genre, authorIdFilter, page, limit, sortBy, order, authors])

  // Trigger search on filter changes or manual search
  useEffect(() => {
    fetchAuthors()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1) // Reset page on query change
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenre(e.target.value)
    setPage(1)
  }

  const handleAuthorFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAuthorIdFilter(e.target.value)
    setPage(1)
  }

  // Open creation form
  const handleNewBook = () => {
    setEditingBook(null)
    setFormData({
      title: '',
      description: '',
      isbn: '',
      publishedYear: '',
      genre: '',
      pages: '',
      authorId: authors[0]?.id || ''
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open edit form
  const handleEditBook = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      description: book.description || '',
      isbn: book.isbn || '',
      publishedYear: book.publishedYear ? book.publishedYear.toString() : '',
      genre: book.genre || '',
      pages: book.pages ? book.pages.toString() : '',
      authorId: book.authorId
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  // Delete book
  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el libro "${title}"?`)) return
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'No se pudo eliminar el libro')
      }
      fetchBooks()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Submit book creation/editing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (!formData.title || !formData.authorId) {
      setFormError('El título y el autor son campos obligatorios')
      setSubmitting(false)
      return
    }

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
        pages: formData.pages ? parseInt(formData.pages) : null,
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar la solicitud')

      setIsFormOpen(false)
      fetchBooks()
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error')
    } finally {
      setSubmitting(false)
    }
  }

  // Available genres list for selection
  const genreList = ['Novela', 'Ficción', 'Drama', 'Poesía', 'Ensayo', 'Biografía', 'Historia', 'Ciencia', 'Fantasía', 'Terror']

  return (
    <div className="space-y-8">
      {/* Cabecera y botón de crear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Búsqueda y Gestión de Libros</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Busca, filtra, agrega y edita libros de tu catálogo.</p>
        </div>
        <button
          onClick={handleNewBook}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all duration-250"
        >
          <Plus className="h-5 w-5" />
          Registrar Libro
        </button>
      </div>

      {/* Panel de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
        <div className="grid gap-4 sm:grid-cols-12">
          {/* Barra de Búsqueda */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título de libro..."
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Filtro por Género */}
          <div className="relative sm:col-span-3">
            <select
              value={genre}
              onChange={handleGenreChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all appearance-none"
            >
              <option value="">Todos los géneros</option>
              {genreList.map((g, idx) => (
                <option key={idx} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Autor */}
          <div className="relative sm:col-span-3">
            <select
              value={authorIdFilter}
              onChange={handleAuthorFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all appearance-none"
            >
              <option value="">Todos los autores</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Resultados encontrados: <strong className="text-slate-800 dark:text-slate-200">{total}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" /> Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="createdAt">Fecha de creación</option>
              <option value="title">Título</option>
              <option value="publishedYear">Año de publicación</option>
            </select>
            <select
              value={order}
              onChange={e => { setOrder(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid del Listado de Libros */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-500 text-sm">Cargando libros...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-650 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-700">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No se encontraron libros</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Intenta cambiar los términos de búsqueda o los filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div 
                key={book.id} 
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
              >
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center rounded-lg bg-emerald-550/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 text-xs font-bold uppercase tracking-wider mb-2">
                      {book.genre || 'General'}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {book.author?.name || 'Autor Desconocido'}
                    </p>
                  </div>

                  {book.description && (
                    <p className="text-sm text-slate-650 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 dark:border-slate-800/80 pt-3">
                    <span className="flex items-center gap-1.5 text-slate-550 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Año: {book.publishedYear || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-550 dark:text-slate-400">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      Págs: {book.pages || 'N/A'}
                    </span>
                    {book.isbn && (
                      <span className="col-span-2 flex items-center gap-1.5 text-slate-550 dark:text-slate-400 font-mono text-[10px] tracking-tight mt-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <Hash className="h-3 w-3 text-slate-400" />
                        ISBN: {book.isbn}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                  <button
                    onClick={() => handleEditBook(book)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-350 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    className="p-2 rounded-xl text-red-650 hover:bg-red-50 border border-red-200/50 dark:text-red-400 dark:hover:bg-red-950/20 dark:border-red-900/30 transition-colors"
                    title="Eliminar libro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold text-slate-650 dark:text-slate-400">
                Página <strong className="text-slate-900 dark:text-white">{page}</strong> de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Agregar/Editar Libro */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">
                {editingBook ? 'Editar Libro' : 'Registrar Nuevo Libro'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completa los datos de la publicación.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-650 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Título del Libro *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Cien años de soledad"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Autor *</label>
                <select
                  value={formData.authorId}
                  onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  required
                >
                  <option value="" disabled>Selecciona un autor</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Género</label>
                  <select
                    value={formData.genre}
                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  >
                    <option value="">Sin género</option>
                    {genreList.map((g, idx) => (
                      <option key={idx} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Año de Publicación</label>
                  <input 
                    type="number" 
                    value={formData.publishedYear}
                    onChange={e => setFormData({ ...formData, publishedYear: e.target.value })}
                    placeholder="Ej. 1967"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Número de Páginas</label>
                  <input 
                    type="number" 
                    value={formData.pages}
                    onChange={e => setFormData({ ...formData, pages: e.target.value })}
                    placeholder="Ej. 417"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ISBN</label>
                  <input 
                    type="text" 
                    value={formData.isbn}
                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="Ej. 978-0-307-35193-7"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descripción / Resumen</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Escribe un breve resumen de la sinopsis..."
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
                  {editingBook ? 'Guardar Cambios' : 'Registrar Libro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

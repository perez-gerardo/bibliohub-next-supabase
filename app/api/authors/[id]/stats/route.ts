import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if author exists
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: true
      }
    })
    
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }
    
    const books = author.books
    const totalBooks = books.length
    
    if (totalBooks === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks: 0,
        firstBook: null,
        latestBook: null,
        averagePages: 0,
        genres: [],
        longestBook: null,
        shortestBook: null
      })
    }
    
    // Find first and latest book by publishedYear
    const booksWithYear = books.filter(b => b.publishedYear !== null)
    let firstBook = null
    let latestBook = null
    if (booksWithYear.length > 0) {
      const sortedByYear = [...booksWithYear].sort((a, b) => (a.publishedYear || 0) - (b.publishedYear || 0))
      firstBook = {
        title: sortedByYear[0].title,
        year: sortedByYear[0].publishedYear
      }
      latestBook = {
        title: sortedByYear[sortedByYear.length - 1].title,
        year: sortedByYear[sortedByYear.length - 1].publishedYear
      }
    }
    
    // Pages calculations
    const booksWithPages = books.filter(b => b.pages !== null)
    let averagePages = 0
    let longestBook = null
    let shortestBook = null
    
    if (booksWithPages.length > 0) {
      const totalPages = booksWithPages.reduce((sum, b) => sum + (b.pages || 0), 0)
      averagePages = Math.round(totalPages / booksWithPages.length)
      
      const sortedByPages = [...booksWithPages].sort((a, b) => (a.pages || 0) - (b.pages || 0))
      shortestBook = {
        title: sortedByPages[0].title,
        pages: sortedByPages[0].pages
      }
      longestBook = {
        title: sortedByPages[sortedByPages.length - 1].title,
        pages: sortedByPages[sortedByPages.length - 1].pages
      }
    }
    
    // Unique genres
    const genres = Array.from(new Set(books.map(b => b.genre).filter((g): g is string => g !== null)))
    
    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook
    })
  } catch (error) {
    console.error('Error generating author stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

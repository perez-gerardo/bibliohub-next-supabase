import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: true
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, isbn, publishedYear, genre, pages, authorId } = body

    if (!title || !authorId) {
      return NextResponse.json({ error: 'Title and authorId are required' }, { status: 400 })
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        description: description || null,
        isbn: isbn || null,
        publishedYear: publishedYear ? parseInt(publishedYear) : null,
        genre: genre || null,
        pages: pages ? parseInt(pages) : null,
        authorId
      }
    })

    return NextResponse.json(book)
  } catch (error: any) {
    console.error('Error updating book:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'ISBN already exists' }, { status: 400 })
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Author not found' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.book.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting book:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

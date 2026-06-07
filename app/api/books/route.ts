import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')

    const books = await prisma.book.findMany({
      where: genre ? { genre } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            nationality: true
          }
        }
      }
    })
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, isbn, publishedYear, genre, pages, authorId } = body

    if (!title || !authorId) {
      return NextResponse.json({ error: 'Title and authorId are required' }, { status: 400 })
    }

    const book = await prisma.book.create({
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

    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    console.error('Error creating book:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'ISBN already exists' }, { status: 400 })
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Author not found' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

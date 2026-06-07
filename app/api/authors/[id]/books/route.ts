import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const books = await prisma.book.findMany({
      where: { authorId: id },
      orderBy: { publishedYear: 'desc' }
    })
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching author books:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

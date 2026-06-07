import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query params
    const search = searchParams.get('search') || undefined
    const genre = searchParams.get('genre') || undefined
    const authorName = searchParams.get('authorName') || undefined
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    
    // Validate sortBy field to prevent errors
    const validSortFields = ['title', 'publishedYear', 'createdAt']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    if (genre) {
      where.genre = genre
    }
    
    if (authorName) {
      where.author = {
        name: {
          contains: authorName,
          mode: 'insensitive'
        }
      }
    }
    
    // Calculate pagination offset
    const skip = (page - 1) * limit
    
    // Fetch data and count total
    const [books, total] = await prisma.$transaction([
      prisma.book.findMany({
        where,
        orderBy: { [sortField]: order },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              nationality: true
            }
          }
        }
      }),
      prisma.book.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1
    
    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })
  } catch (error) {
    console.error('Error in search endpoint:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

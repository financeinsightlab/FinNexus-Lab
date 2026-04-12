import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/blocks/templates?category=hero
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')

    const templates = await prisma.blockTemplate.findMany({
      where: {
        isPublic: true,
        ...(category ? { category } : {})
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, templates })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/blocks/templates — Save a new template
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'ANALYST'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, type, category, data, isPublic } = body

    const template = await prisma.blockTemplate.create({
      data: {
        name,
        description,
        type: type || 'section',
        category: category || 'custom',
        data: data as any,
        isPublic: isPublic ?? true,
        createdBy: session.user.id!,
      }
    })

    return NextResponse.json({ success: true, template })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/blocks/templates?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const template = await prisma.blockTemplate.findUnique({ where: { id } })
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isOwner = template.createdBy === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.blockTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

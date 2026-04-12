import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Block } from '@/lib/blocks/registry'

// GET /api/blocks?postId=xxx or ?pageId=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = request.nextUrl
    const postId = searchParams.get('postId')
    const pageId = searchParams.get('pageId')

    if (!postId && !pageId) {
      return NextResponse.json({ error: 'postId or pageId required' }, { status: 400 })
    }

    const blocks = await prisma.contentBlock.findMany({
      where: postId ? { postId } : { pageId: pageId! },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, blocks })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/blocks — Save all blocks for a post/page (full replace)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { postId, pageId, blocks }: { postId?: string; pageId?: string; blocks: Block[] } = body

    if (!postId && !pageId) {
      return NextResponse.json({ error: 'postId or pageId required' }, { status: 400 })
    }

    // Delete existing blocks for this post/page
    if (postId) {
      await prisma.contentBlock.deleteMany({ where: { postId } })
    } else if (pageId) {
      await prisma.contentBlock.deleteMany({ where: { pageId: pageId! } })
    }

    // Create new blocks (flatten — nested columns stored inside data JSON)
    const created = await Promise.all(
      blocks.map((block) =>
        prisma.contentBlock.create({
          data: {
            id: block.id,
            type: block.type,
            data: block.data as any,
            attributes: (block.attributes || null) as any,
            order: block.order,
            parentId: null,
            postId: postId || null,
            pageId: pageId || null,
          },
        })
      )
    )

    return NextResponse.json({ success: true, count: created.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

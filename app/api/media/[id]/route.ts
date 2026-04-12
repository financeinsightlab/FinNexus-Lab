import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateMediaMetadata, deleteMedia } from '@/lib/media-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const p = await params
    
    const result = await updateMediaMetadata(p.id, session.user.id!, body)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result.media })
  } catch (error: unknown) {
    console.error('Media update error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const p = await params
    const result = await deleteMedia(p.id, session.user.id!)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Media delete error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

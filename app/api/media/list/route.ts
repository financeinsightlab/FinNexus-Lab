import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getMediaList, MediaListParams } from '@/lib/media-utils'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params: MediaListParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') || undefined,
      orderBy: (searchParams.get('orderBy') as MediaListParams['orderBy']) || undefined
    }

    // Get media list
    const result = await getMediaList(params)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: unknown) {
    console.error('Media list API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use GET to retrieve media list.' 
    },
    { status: 405 }
  )
}
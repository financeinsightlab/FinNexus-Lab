import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { mediaStorage } from '@/lib/media'
import { parseUploadFormData, validateFiles, saveMediaToDatabase, MediaUploadResult } from '@/lib/media-utils'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data
    const { files, fields } = await parseUploadFormData(request)
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      )
    }

    // Validate files
    const validation = validateFiles(files)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const results: MediaUploadResult[] = []
    
    // Process each file
    for (const file of files) {
      try {
        // Save file to storage
        const mediaFile = await mediaStorage.saveFile(file)

        // Save to database
        const media = await saveMediaToDatabase(
          mediaFile,
          session.user.id!,
          fields.altText,
          fields.caption,
          fields.description
        )

        results.push({
          success: true,
          media
        })
      } catch (error: unknown) {
        console.error('Failed to process file:', error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Check if all uploads succeeded
    const allSuccess = results.every(r => r.success)
    
    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess 
        ? `Successfully uploaded ${results.length} file(s)`
        : 'Some files failed to upload'
    }, {
      status: allSuccess ? 200 : 207 // 207 Multi-Status for partial success
    })

  } catch (error: unknown) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST for file uploads.' 
    },
    { status: 405 }
  )
}
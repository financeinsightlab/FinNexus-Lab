import { NextRequest } from 'next/server'
import { mediaStorage, UploadedFile, MediaFile } from './media'
import { prisma } from './prisma'
import { auth } from '@/auth'
import type { Prisma } from '@prisma/client'

// Media type matching Prisma schema
export interface Media {
  id: string
  filename: string
  originalName: string
  path: string
  url: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  altText?: string | null
  caption?: string | null
  description?: string | null
  uploadedBy: string
  uploadedAt: Date
  metadata?: Record<string, unknown> | null
  thumbnailUrl?: string | null
  mediumUrl?: string | null
  largeUrl?: string | null
}

export interface MediaUploadResult {
  success: boolean
  media?: Media
  error?: string
}

export interface MediaListParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  orderBy?: 'newest' | 'oldest' | 'name' | 'size'
}

/**
 * Parse multipart form data for file upload
 */
export async function parseUploadFormData(request: NextRequest): Promise<{ files: UploadedFile[], fields: Record<string, string> }> {
  const formData = await request.formData()
  const files: UploadedFile[] = []
  const fields: Record<string, string> = {}
  
  // Iterate through form data entries
  for (const key of formData.keys()) {
    const value = formData.get(key)
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer())
      files.push({
        originalname: value.name,
        buffer,
        mimetype: value.type,
        size: value.size
      })
    } else if (typeof value === 'string') {
      fields[key] = value
    }
  }
  
  return { files, fields }
}

/**
 * Validate uploaded files
 */
export function validateFiles(files: UploadedFile[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const file of files) {
    if (!mediaStorage.isValidFileType(file.mimetype)) {
      errors.push(`File type not allowed: ${file.originalname} (${file.mimetype})`)
    }
    
    if (!mediaStorage.isValidFileSize(file.size)) {
      errors.push(`File too large: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Save media to database
 */
export async function saveMediaToDatabase(
  mediaFile: MediaFile & {
    metadata?: Record<string, unknown>
    thumbnailUrl?: string
    mediumUrl?: string
    largeUrl?: string
  },
  userId: string,
  altText?: string,
  caption?: string,
  description?: string
): Promise<Media> {
  // Prepare metadata including thumbnail URLs
  const metadata: Record<string, unknown> = {
    ...(mediaFile.metadata || {}),
    ...(mediaFile.thumbnailUrl && { thumbnailUrl: mediaFile.thumbnailUrl }),
    ...(mediaFile.mediumUrl && { mediumUrl: mediaFile.mediumUrl }),
    ...(mediaFile.largeUrl && { largeUrl: mediaFile.largeUrl })
  }

  // Use actual Prisma client
  const media = await prisma.media.create({
    data: {
      filename: mediaFile.filename,
      originalName: mediaFile.originalName,
      path: mediaFile.path,
      url: mediaFile.url,
      mimeType: mediaFile.mimeType,
      size: mediaFile.size,
      width: mediaFile.width,
      height: mediaFile.height,
      altText: altText || mediaFile.originalName,
      caption,
      description,
      uploadedBy: userId,
      metadata: Object.keys(metadata).length > 0 ? metadata as any : undefined
    }
  })
  
  // Convert to our Media interface format
  return {
    id: media.id,
    filename: media.filename,
    originalName: media.originalName,
    path: media.path,
    url: media.url,
    mimeType: media.mimeType,
    size: media.size,
    width: media.width,
    height: media.height,
    altText: media.altText,
    caption: media.caption,
    description: media.description,
    uploadedBy: media.uploadedBy,
    uploadedAt: media.uploadedAt,
    metadata: media.metadata as Record<string, unknown> | null || undefined,
    thumbnailUrl: mediaFile.thumbnailUrl,
    mediumUrl: mediaFile.mediumUrl,
    largeUrl: mediaFile.largeUrl
  }
}

/**
 * Get paginated media list
 */
export async function getMediaList(params: MediaListParams = {}) {
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit
  
  const where: {
    OR?: Array<{
      filename?: { contains: string; mode: 'insensitive' }
      originalName?: { contains: string; mode: 'insensitive' }
      altText?: { contains: string; mode: 'insensitive' }
    }>
    mimeType?: { startsWith: string }
  } = {}
  
  if (params.search) {
    where.OR = [
      { filename: { contains: params.search, mode: 'insensitive' } },
      { originalName: { contains: params.search, mode: 'insensitive' } },
      { altText: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  if (params.type) {
    where.mimeType = { startsWith: params.type }
  }

  let orderBy: { uploadedAt?: 'asc' | 'desc'; originalName?: 'asc'; size?: 'desc' } = { uploadedAt: 'desc' }
  if (params.orderBy === 'oldest') orderBy = { uploadedAt: 'asc' }
  if (params.orderBy === 'name') orderBy = { originalName: 'asc' }
  if (params.orderBy === 'size') orderBy = { size: 'desc' }

  const [mediaItems, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.media.count({ where })
  ])
  
  return {
    media: mediaItems.map(item => ({
      ...item,
      metadata: item.metadata as Record<string, unknown> | null || undefined
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

/**
 * Delete media from storage and database
 */
export async function deleteMedia(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const media = await prisma.media.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!media) {
      return { success: false, error: 'Media not found' }
    }
    
    // Check permission (admin or owner)
    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'
    const isOwner = media.uploadedBy === userId
    
    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Permission denied' }
    }
    
    // Delete from storage
    try {
      await mediaStorage.deleteFile(media.path)
    } catch (fsError) {
      console.warn("Could not delete file from FS, it may already be deleted:", fsError)
    }
    
    // Delete from database
    await prisma.media.delete({
      where: { id }
    })
    
    return { success: true }
  } catch (error: unknown) {
    console.error('Failed to delete media:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(
  id: string,
  userId: string,
  data: { filename?: string; altText?: string; caption?: string; description?: string }
): Promise<{ success: boolean; media?: Media; error?: string }> {
  try {
    const media = await prisma.media.findUnique({
      where: { id }
    })
    
    if (!media) {
      return { success: false, error: 'Media not found' }
    }
    
    // Check permission (admin or owner)
    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'
    const isOwner = media.uploadedBy === userId
    
    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Permission denied' }
    }
    
    const updated = await prisma.media.update({
      where: { id },
      data: {
        originalName: data.filename !== undefined ? data.filename : media.originalName,
        altText: data.altText !== undefined ? data.altText : media.altText,
        caption: data.caption !== undefined ? data.caption : media.caption,
        description: data.description !== undefined ? data.description : media.description
      }
    })
    
    const returnedMedia: Media = {
      ...updated,
      metadata: updated.metadata as Record<string, unknown> | null || undefined
    }
    
    return { success: true, media: returnedMedia }
  } catch (error: unknown) {
    console.error('Failed to update media:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
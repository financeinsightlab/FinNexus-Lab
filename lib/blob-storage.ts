import { put, del, head } from '@vercel/blob'
import sharp from 'sharp'
import { randomBytes } from 'crypto'
import path from 'path'

export interface UploadedFile {
  originalname: string
  buffer: Buffer
  mimetype: string
  size: number
}

export interface MediaFile {
  filename: string
  originalName: string
  path: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  thumbnailUrl?: string
  mediumUrl?: string
  largeUrl?: string
}

export class BlobStorage {
  /**
   * Generate a secure filename with timestamp and random string
   */
  generateFilename(originalName: string): string {
    const ext = path.extname(originalName)
    const name = path.basename(originalName, ext)
    const timestamp = Date.now()
    const random = randomBytes(8).toString('hex')
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    return `${safeName}-${timestamp}-${random}${ext}`
  }

  /**
   * Get directory path for today's date (YYYY/MM/DD)
   */
  getDatePath(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  /**
   * Process and save an uploaded file to Vercel Blob Storage
   */
  async saveFile(file: UploadedFile): Promise<MediaFile> {
    const datePath = this.getDatePath()
    const filename = this.generateFilename(file.originalname)
    const blobPath = `${datePath}/${filename}`
    
    // Save the original file to blob storage
    const blob = await put(blobPath, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      addRandomSuffix: false
    })

    // Process image if it's an image
    let width: number | undefined
    let height: number | undefined
    let thumbnailUrl: string | undefined
    let mediumUrl: string | undefined
    let largeUrl: string | undefined

    if (file.mimetype.startsWith('image/')) {
      try {
        const image = sharp(file.buffer)
        const metadata = await image.metadata()
        width = metadata.width
        height = metadata.height

        // Generate thumbnail (300x300)
        const thumbnailBuffer = await image
          .resize(300, 300, { fit: 'inside' })
          .toBuffer()
        
        const thumbnailBlob = await put(`${datePath}/thumbnail/${filename}`, thumbnailBuffer, {
          access: 'public',
          contentType: file.mimetype,
          addRandomSuffix: false
        })
        thumbnailUrl = thumbnailBlob.url

        // Generate medium size (768x768)
        const mediumBuffer = await image
          .resize(768, 768, { fit: 'inside' })
          .toBuffer()
        
        const mediumBlob = await put(`${datePath}/medium/${filename}`, mediumBuffer, {
          access: 'public',
          contentType: file.mimetype,
          addRandomSuffix: false
        })
        mediumUrl = mediumBlob.url

        // Generate large size (1200x1200)
        const largeBuffer = await image
          .resize(1200, 1200, { fit: 'inside' })
          .toBuffer()
        
        const largeBlob = await put(`${datePath}/large/${filename}`, largeBuffer, {
          access: 'public',
          contentType: file.mimetype,
          addRandomSuffix: false
        })
        largeUrl = largeBlob.url
      } catch (error) {
        console.warn('Image processing failed:', error)
        // Continue even if image processing fails
      }
    }

    return {
      filename,
      originalName: file.originalname,
      path: blobPath,
      url: blob.url,
      mimeType: file.mimetype,
      size: file.size,
      width,
      height,
      thumbnailUrl,
      mediumUrl,
      largeUrl
    }
  }

  /**
   * Delete a file from blob storage
   */
  async deleteFile(url: string): Promise<void> {
    try {
      await del(url)
    } catch (error) {
      console.error('Failed to delete blob:', error)
      throw error
    }
  }

  /**
   * Check if a file exists in blob storage
   */
  async fileExists(url: string): Promise<boolean> {
    try {
      await head(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate file type
   */
  isValidFileType(mimetype: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    return allowedTypes.includes(mimetype)
  }

  /**
   * Validate file size (max 10MB)
   */
  isValidFileSize(size: number): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return size <= maxSize
  }
}

// Singleton instance
export const blobStorage = new BlobStorage()
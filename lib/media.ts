import fs from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import sharp from 'sharp'
import type { Stats } from 'fs'
import { blobStorage } from './blob-storage'

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

export class MediaStorage {
  private baseDir: string
  private useBlobStorage: boolean
  
  constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'uploads')
    // Use blob storage in production (Vercel) and local storage in development
    this.useBlobStorage = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  }
  
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
   * Create directory if it doesn't exist
   */
  async ensureDir(dirPath: string): Promise<void> {
    if (this.useBlobStorage) {
      // No need to create directories in blob storage
      return
    }
    
    const fullPath = path.join(this.baseDir, dirPath)
    try {
      await fs.access(fullPath)
    } catch {
      await fs.mkdir(fullPath, { recursive: true })
    }
  }
  
  /**
   * Process and save an uploaded file
   */
  async saveFile(file: UploadedFile): Promise<MediaFile> {
    if (this.useBlobStorage) {
      return await blobStorage.saveFile(file)
    }
    
    // Local filesystem implementation
    const datePath = this.getDatePath()
    await this.ensureDir(datePath)
    
    const filename = this.generateFilename(file.originalname)
    const relativePath = path.join(datePath, filename)
    const fullPath = path.join(this.baseDir, relativePath)
    
    // Save the original file
    await fs.writeFile(fullPath, file.buffer)
    
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
        
        // Generate thumbnail
        const thumbDir = path.join(this.baseDir, datePath, 'thumbnail')
        await this.ensureDir(path.join(datePath, 'thumbnail'))
        await image
          .resize(300, 300, { fit: 'inside' })
          .toFile(path.join(thumbDir, filename))
        thumbnailUrl = `/uploads/${datePath}/thumbnail/${filename}`
          
        // Generate medium size
        const mediumDir = path.join(this.baseDir, datePath, 'medium')
        await this.ensureDir(path.join(datePath, 'medium'))
        await image
          .resize(768, 768, { fit: 'inside' })
          .toFile(path.join(mediumDir, filename))
        mediumUrl = `/uploads/${datePath}/medium/${filename}`
          
        // Generate large size
        const largeDir = path.join(this.baseDir, datePath, 'large')
        await this.ensureDir(path.join(datePath, 'large'))
        await image
          .resize(1200, 1200, { fit: 'inside' })
          .toFile(path.join(largeDir, filename))
        largeUrl = `/uploads/${datePath}/large/${filename}`
      } catch (error) {
        console.warn('Image processing failed:', error)
      }
    }
    
    const url = `/uploads/${relativePath.replace(/\\/g, '/')}`
    
    return {
      filename,
      originalName: file.originalname,
      path: relativePath,
      url,
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
   * Delete a file from storage
   */
  async deleteFile(filePathOrUrl: string): Promise<void> {
    if (this.useBlobStorage) {
      // If it's a blob URL, delete from blob storage
      if (filePathOrUrl.includes('blob.vercel-storage.com')) {
        return await blobStorage.deleteFile(filePathOrUrl)
      }
      // If it's a relative path, we can't delete from blob storage
      return
    }
    
    // Local filesystem implementation
    const relativePath = filePathOrUrl.replace('/uploads/', '')
    const fullPath = path.join(this.baseDir, relativePath)
    
    try {
      await fs.unlink(fullPath)
      
      // Also delete thumbnails if they exist
      const dir = path.dirname(relativePath)
      const filename = path.basename(relativePath)
      
      const thumbPath = path.join(this.baseDir, dir, 'thumbnail', filename)
      const mediumPath = path.join(this.baseDir, dir, 'medium', filename)
      const largePath = path.join(this.baseDir, dir, 'large', filename)
      
      await Promise.allSettled([
        fs.unlink(thumbPath).catch(() => {}),
        fs.unlink(mediumPath).catch(() => {}),
        fs.unlink(largePath).catch(() => {})
      ])
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }
  
  /**
   * Get file info
   */
  async getFileInfo(relativePath: string): Promise<Stats | null> {
    if (this.useBlobStorage) {
      // Can't get file stats from blob storage
      return null
    }
    
    const fullPath = path.join(this.baseDir, relativePath)
    try {
      return await fs.stat(fullPath)
    } catch {
      return null
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

  /**
   * Check if using blob storage
   */
  isUsingBlobStorage(): boolean {
    return this.useBlobStorage
  }
}

// Singleton instance
export const mediaStorage = new MediaStorage()
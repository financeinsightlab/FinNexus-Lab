"use client"

import { useState, useEffect } from 'react'
import { X, Search, Grid, List, Upload, Check, Image as ImageIcon, File, Film, Music, FileText, Trash2, Save, Copy } from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  uploadedAt: string
  altText?: string | null
  caption?: string | null
  description?: string | null
}

interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaUrl: string, altText?: string) => void
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Edit Form Fields
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    filename: '',
    altText: '',
    caption: '',
    description: ''
  })

  // Watch selected media
  useEffect(() => {
    if (selectedMedia) {
      const item = media.find(m => m.id === selectedMedia)
      if (item) {
        setEditForm({
          filename: item.originalName || '',
          altText: item.altText || '',
          caption: item.caption || '',
          description: item.description || ''
        })
      }
    }
  }, [selectedMedia, media])

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/media/list')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.media) {
          setMedia(data.data.media || [])
        } else if (data.media) {
          setMedia(data.media || [])
        } else {
          setMedia([])
        }
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setUploadProgress(0)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (response.ok) {
        setUploadProgress(100)
        const result = await response.json()
        
        if (result.success && result.results && result.results.length > 0) {
          const uploadedMedia = result.results[0].media
          if (uploadedMedia) {
            setMedia(prev => [uploadedMedia, ...prev])
            setSelectedMedia(uploadedMedia.id)
            setSearchTerm('')
          }
        }
        
        setTimeout(() => {
          setUploadProgress(0)
          setUploading(false)
        }, 500)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploading(false)
      setUploadProgress(0)
      alert('Failed to upload file. Please try again.')
    }
  }

  const handleSelect = () => {
    if (selectedMedia) {
      const selectedItem = media.find(item => item.id === selectedMedia)
      if (selectedItem) {
        onSelect(selectedItem.url, selectedItem.altText || '')
        onClose()
      }
    }
  }
  
  const handleSaveMetadata = async () => {
    if (!selectedMedia) return
    try {
      setIsSaving(true)
      const res = await fetch(`/api/media/${selectedMedia}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          setMedia(prev => prev.map(m => m.id === selectedMedia ? { ...m, ...result.data } : m))
          alert('Saved changes!')
        }
      } else {
        alert('Failed to save changes.')
      }
    } catch (e) {
      console.error(e)
      alert('Error saving changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMedia) return
    if (!confirm('Are you sure you want to permanently delete this item?')) return
    
    try {
      const res = await fetch(`/api/media/${selectedMedia}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setMedia(prev => prev.filter(m => m.id !== selectedMedia))
        setSelectedMedia(null)
      } else {
        alert('Failed to delete media.')
      }
    } catch (e) {
      console.error(e)
      alert('Error deleting media.')
    }
  }

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    alert('Copied URL to clipboard')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />
    if (mimeType.startsWith('video/')) return <Film className="w-5 h-5 text-purple-400" />
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-400" />
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />
    return <File className="w-5 h-5 text-gray-400" />
  }

  const filteredMedia = media.filter(item =>
    item && ((item.originalName || item.filename)?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )
  
  const activeMedia = selectedMedia ? media.find(m => m.id === selectedMedia) : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-2xl w-[95vw] h-[95vh] max-w-7xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2D3748]">
          <div>
            <h2 className="text-xl font-bold text-white">Media Library</h2>
            <p className="text-sm text-gray-400 mt-1">Manage and insert visual content</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-[#2D3748] bg-[#0F1117]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1A1F2E] border border-[#2D3748] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0D6E6E] w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#0D6E6E]/20 text-[#0D6E6E]' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#0D6E6E]/20 text-[#0D6E6E]' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                id="media-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="media-upload"
                className="flex items-center gap-2 px-4 py-2 bg-[#0D6E6E] hover:bg-[#0D6E6E]/80 text-white rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Media
              </label>
              {uploading && (
                <div className="absolute -bottom-6 left-0 right-0">
                  <div className="h-1 bg-[#2D3748] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0D6E6E] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area with Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Media Area */}
          <div className={`flex-1 overflow-auto p-6 ${selectedMedia ? 'border-r border-[#2D3748]' : ''}`}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6E6E] mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading media library...</p>
                </div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-[#0F1117] rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No media found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try a different search term' : 'Upload your first media file'}
                </p>
                <label
                  htmlFor="media-upload"
                  className="px-6 py-3 bg-[#0D6E6E] hover:bg-[#0D6E6E]/80 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Media
                </label>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative bg-[#0F1117] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedMedia === item.id 
                        ? 'border-[#0D6E6E] ring-2 ring-[#0D6E6E]/20' 
                        : 'border-[#2D3748] hover:border-[#0D6E6E]/50'
                    }`}
                    onClick={() => setSelectedMedia(item.id)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-[#1A1F2E]">
                      {item.mimeType.startsWith('image/') ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={item.url}
                            alt={item.originalName || item.filename}
                            fill
                            className="object-cover"
                            sizes="(max-width: 200px) 100vw, 200px"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            {getFileIcon(item.mimeType)}
                            <p className="mt-2 text-xs text-gray-400 truncate px-2">
                              {item.filename.split('.').pop()?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedMedia === item.id && (
                        <div className="absolute top-2 right-2 bg-[#0D6E6E] text-white p-1 rounded-full">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-white truncate">{item.originalName || item.filename}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatFileSize(item.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1F2E] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0F1117]">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">File</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Size</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Type</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedia.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-[#2D3748] hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedMedia === item.id ? 'bg-[#0D6E6E]/10' : ''
                        }`}
                        onClick={() => setSelectedMedia(item.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0F1117] rounded-lg flex items-center justify-center">
                              {getFileIcon(item.mimeType)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.originalName || item.filename}</p>
                              {item.mimeType.startsWith('image/') && item.width && item.height && (
                                <p className="text-xs text-gray-500">
                                  {item.width}×{item.height}
                                </p>
                              )}
                            </div>
                            {selectedMedia === item.id && (
                              <Check className="w-4 h-4 text-[#0D6E6E] ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {formatFileSize(item.size)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 text-xs bg-[#0F1117] text-gray-400 rounded">
                            {item.mimeType.split('/')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Attachment Details Sidebar */}
          {activeMedia && (
            <div className="w-80 bg-[#151925] border-l border-[#2D3748] flex flex-col overflow-y-auto">
              {/* Preview */}
              <div className="p-4 border-b border-[#2D3748] bg-[#0F1117]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Attachment Details</h3>
                <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50 mb-3 border border-white/5">
                  {activeMedia.mimeType.startsWith('image/') ? (
                    <Image
                      src={activeMedia.url}
                      alt={activeMedia.originalName || activeMedia.filename}
                      fill
                      className="object-contain"
                      sizes="320px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(activeMedia.mimeType)}
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p><span className="font-semibold text-gray-300">File name:</span> {activeMedia.filename}</p>
                  <p><span className="font-semibold text-gray-300">File type:</span> {activeMedia.mimeType}</p>
                  <p><span className="font-semibold text-gray-300">File size:</span> {formatFileSize(activeMedia.size)}</p>
                  {activeMedia.width && activeMedia.height && (
                    <p><span className="font-semibold text-gray-300">Dimensions:</span> {activeMedia.width} by {activeMedia.height} pixels</p>
                  )}
                </div>
                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                  <button onClick={() => handleDelete()} className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete permanently
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <div className="p-4 space-y-4 flex-1">
                <div>
                   <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">File URL</label>
                   <div className="flex">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}${activeMedia.url}`}
                      className="flex-1 bg-[#1A1F2E] border border-[#2D3748] border-r-0 rounded-l-lg p-2 text-xs text-gray-300 outline-none"
                    />
                    <button 
                      onClick={() => handleCopyUrl(activeMedia.url)}
                      className="px-3 bg-[#2D3748] hover:bg-[#3d4b66] border border-[#2D3748] rounded-r-lg text-white transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Title</label>
                   <input 
                    type="text" 
                    value={editForm.filename}
                    onChange={(e) => setEditForm({...editForm, filename: e.target.value})}
                    className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-2 text-sm text-white outline-none focus:border-[#0D6E6E]" 
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Alt Text</label>
                   <textarea 
                    rows={2}
                    value={editForm.altText}
                    onChange={(e) => setEditForm({...editForm, altText: e.target.value})}
                    placeholder="Describe the image for screen readers"
                    className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-2 text-sm text-white outline-none focus:border-[#0D6E6E]" 
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Caption</label>
                   <textarea 
                    rows={2}
                    value={editForm.caption}
                    onChange={(e) => setEditForm({...editForm, caption: e.target.value})}
                    className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-2 text-sm text-white outline-none focus:border-[#0D6E6E]" 
                   />
                </div>

                <div>
                   <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Description</label>
                   <textarea 
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-2 text-sm text-white outline-none focus:border-[#0D6E6E]" 
                   />
                </div>

                <div className="pt-2">
                   <button 
                    onClick={handleSaveMetadata} 
                    disabled={isSaving}
                    className="w-full py-2 bg-[#0F1117] hover:bg-[#1f2533] border border-[#2D3748] rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                   >
                     {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Save className="w-4 h-4" />}
                     {isSaving ? 'Saving...' : 'Save Details'}
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#2D3748] bg-[#0F1117] mt-auto">
          <div className="text-sm text-gray-400">
            {activeMedia ? (
              <span className="text-white">
                Selected: <span className="font-medium">{activeMedia.originalName || activeMedia.filename}</span>
              </span>
            ) : (
              'No media selected'
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-[#2D3748] text-gray-400 hover:text-white hover:border-white/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!activeMedia}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeMedia 
                  ? 'bg-[#0D6E6E] hover:bg-[#0D6E6E]/80 text-white' 
                  : 'bg-[#2D3748] text-gray-500 cursor-not-allowed'
              }`}
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
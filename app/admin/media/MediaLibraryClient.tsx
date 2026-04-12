'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, Search, Grid, List, Filter, X, Check, Image as ImageIcon, FileText, Video, Music, Trash2, Save, Copy } from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  altText?: string | null
  caption?: string | null
  description?: string | null
  uploadedAt: string
}

export default function MediaLibraryClient() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  // Edit fields
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    filename: '',
    altText: '',
    caption: '',
    description: ''
  })

  // Watch selected media for editing
  useEffect(() => {
    if (selectedMedia.length === 1) {
      const item = media.find(m => m.id === selectedMedia[0])
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

  // Fetch media from API
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterType !== 'all') params.append('type', filterType)
      
      const response = await fetch(`/api/media/list?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setMedia(data.data.media || [])
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }, [search, filterType])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadProgress(0)
    
    const formData = new FormData()
    acceptedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      const result = await response.json()
      setUploadProgress(100)

      if (result.success) {
        await fetchMedia()
        setSelectedMedia([])
      } else {
        console.error('Upload failed:', result.error)
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload error occurred. Please try again.')
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }, [fetchMedia])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Handle media selection
  const toggleMediaSelection = (id: string, shiftKey: boolean = false) => {
    setSelectedMedia(prev => {
      if (shiftKey && prev.length > 0) {
         // simplistic multiple selection range omitted for brevity, just toggle.
      }
      return prev.includes(id)
        ? prev.filter(mediaId => mediaId !== id)
        : [...prev, id]
    })
  }

  // Handle single clear selection
  const handleClearSelection = () => {
    setSelectedMedia([])
  }

  // Handle bulk or single delete
  const handleDeleteSelected = async () => {
    if (!selectedMedia.length) return
    const msg = selectedMedia.length === 1 
      ? 'Delete this item permanently?' 
      : `Delete ${selectedMedia.length} selected items permanently?`
    
    if (!confirm(msg)) return

    try {
      // Loop over and delete. A bulk delete API is better, but this works for now.
      for (const id of selectedMedia) {
        await fetch(`/api/media/${id}`, { method: 'DELETE' })
      }
      setSelectedMedia([])
      await fetchMedia()
    } catch (error) {
      console.error('Delete failed:', error)
      alert("Failed to delete some items.")
    }
  }

  // Handle single item save
  const handleSaveMetadata = async (id: string) => {
    try {
      setIsSaving(true)
      const res = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          setMedia(prev => prev.map(m => m.id === id ? { ...m, ...result.data } : m))
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
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-400" />
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  const filteredMedia = media.filter(item => {
    if (filterType === 'all') return true
    if (filterType === 'image') return item.mimeType.startsWith('image/')
    if (filterType === 'document') return item.mimeType.startsWith('application/')
    return item.mimeType.includes(filterType)
  })

  // Which item are we single-viewing for details?
  const activeMediaId = selectedMedia.length === 1 ? selectedMedia[0] : null
  const activeMedia = activeMediaId ? media.find(m => m.id === activeMediaId) : null

  return (
    <div className="min-h-screen bg-[#0B0D13] text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-gray-400 mt-2">Upload and manage your media files</p>
      </div>

      <div className="flex flex-1 gap-6 min-h-[500px]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-brand-teal bg-brand-teal/10'
                : 'border-[#2D3748] hover:border-gray-500 bg-[#1A1F2E]'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-gray-400 mb-4">or click to browse</p>
            <p className="text-sm text-gray-500">Supports images, PDFs, and documents up to 10MB</p>
            
            {uploading && (
              <div className="mt-6">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-brand-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-[#0D6E6E] mt-2 font-bold uppercase tracking-widest">Uploading... {Math.floor(uploadProgress)}%</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1A1F2E] border border-[#2D3748] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg px-3 py-2 text-white outline-none focus:border-[#0D6E6E]"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="application/pdf">PDFs</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#2D3748]' : 'text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#2D3748]' : 'text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedMedia.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold bg-[#0D6E6E]/20 text-[#0D6E6E] px-3 py-1.5 rounded-lg border border-[#0D6E6E]/50">
                    {selectedMedia.length} selected
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="p-1.5 bg-[#1A1F2E] hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {selectedMedia.length > 1 && (
                     <button
                        onClick={handleDeleteSelected}
                        className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-500/50"
                     >
                       Bulk Delete
                     </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Media Grid/List */}
          <div className="flex-1 overflow-auto bg-[#1A1F2E] rounded-2xl border border-[#2D3748] p-6 shadow-2xl">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-teal"></div>
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Loading media repository...</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-20 rounded-xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
                  <ImageIcon className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No media found</h3>
                <p className="text-gray-500 text-sm">
                  {search || filterType !== 'all' ? 'Try changing your search or filter configuration' : 'Upload your first file to the global media pool'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group bg-[#0F1117] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                      selectedMedia.includes(item.id) ? 'border-[#0D6E6E] ring-2 ring-[#0D6E6E]/30' : 'border-[#2D3748] hover:border-white/20'
                    }`}
                    onClick={(e) => toggleMediaSelection(item.id, e.shiftKey)}
                  >
                    <div className="absolute top-3 left-3 z-10">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                        selectedMedia.includes(item.id) ? 'bg-[#0D6E6E] border-[#0D6E6E]' : 'bg-black/50 border-white/20 group-hover:border-white/50'
                      }`}>
                        {selectedMedia.includes(item.id) && <Check className="w-4 h-4 text-white font-bold" />}
                      </div>
                    </div>

                    <div className="aspect-square relative bg-[#1A1F2E]">
                      {item.mimeType.startsWith('image/') ? (
                        <Image
                          src={item.url}
                          alt={item.originalName || ''}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-500"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             {getFileIcon(item.mimeType)}
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                            {item.mimeType.split('/')[1]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-[#2D3748]">
                      <p className="text-sm font-bold truncate group-hover:text-white transition-colors text-gray-300" title={item.originalName}>{item.originalName}</p>
                      <div className="flex justify-between items-center mt-2 opacity-70">
                        <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                          {formatFileSize(item.size)}
                        </span>
                        <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                          {new Date(item.uploadedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0F1117] rounded-xl overflow-hidden border border-[#2D3748]">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1F2E] border-b border-[#2D3748]">
                    <tr>
                      <th className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedMedia.length === filteredMedia.length && filteredMedia.length > 0}
                          onChange={() => {
                            if (selectedMedia.length === filteredMedia.length) setSelectedMedia([])
                            else setSelectedMedia(filteredMedia.map(item => item.id))
                          }}
                          className="rounded bg-transparent border-gray-600"
                        />
                      </th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Size</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D3748]">
                    {filteredMedia.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => toggleMediaSelection(item.id)}
                        className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                          selectedMedia.includes(item.id) ? 'bg-[#0D6E6E]/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(item.id)}
                            readOnly
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleMediaSelection(item.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1A1F2E] rounded-xl flex items-center justify-center border border-[#2D3748] relative overflow-hidden flex-shrink-0">
                               {item.mimeType.startsWith('image/') ? (
                                  <Image src={item.url} alt={item.originalName} fill className="object-cover" />
                               ) : (
                                  getFileIcon(item.mimeType)
                               )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors truncate">{item.originalName}</p>
                              <p className="text-xs text-gray-500 truncate" title={item.url}>{item.url}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {item.mimeType.split('/')[1] || item.mimeType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-400">
                          {formatFileSize(item.size)}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-400">
                          {new Date(item.uploadedAt).toLocaleDateString(undefined, {dateStyle: 'medium'})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Attachment Details Sidebar - Visible when exactly ONE item is selected */}
        {activeMedia && (
          <div className="w-80 lg:w-96 bg-[#1A1F2E] border border-[#2D3748] flex flex-col rounded-2xl overflow-hidden shadow-2xl shrink-0 my-auto h-[min(calc(100vh-250px),800px)]">
             <div className="p-5 border-b border-[#2D3748] bg-[#0F1117] flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#0D6E6E] uppercase tracking-[0.2em]">Attachment Details</h3>
                <button onClick={handleClearSelection} className="p-1 hover:bg-white/10 rounded-lg text-gray-500">
                  <X className="w-4 h-4" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto">
               <div className="p-5 border-b border-[#2D3748] bg-[#1A1F2E]">
                  <div className="aspect-video relative rounded-xl overflow-hidden bg-black/50 mb-4 border border-[#2D3748] shadow-inner">
                    {activeMedia.mimeType.startsWith('image/') ? (
                      <Image
                        src={activeMedia.url}
                        alt={activeMedia.altText || activeMedia.originalName}
                        fill
                        className="object-contain"
                        sizes="320px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        {getFileIcon(activeMedia.mimeType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-xs font-medium text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="truncate ml-2 text-gray-300 font-bold">{activeMedia.originalName}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="text-gray-300">{activeMedia.mimeType}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Uploaded:</span> <span className="text-gray-300">{new Date(activeMedia.uploadedAt).toLocaleString()}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">File size:</span> <span className="text-gray-300 font-mono">{formatFileSize(activeMedia.size)}</span></p>
                    {activeMedia.width && activeMedia.height && (
                      <p className="flex justify-between"><span className="text-gray-500">Dimensions:</span> <span className="text-gray-300 font-mono">{activeMedia.width} x {activeMedia.height}</span></p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#2D3748]">
                    <button onClick={() => handleDeleteSelected()} className="flex items-center gap-2 text-red-400 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors w-full justify-center border border-transparent hover:border-red-500/30">
                      <Trash2 className="w-4 h-4" /> Permanently Delete
                    </button>
                  </div>
               </div>

               <div className="p-5 space-y-5 bg-[#0F1117] h-full">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Original File URL</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}${activeMedia.url}`}
                        className="flex-1 bg-[#1A1F2E] border border-[#2D3748] border-r-0 rounded-l-lg px-3 py-2.5 text-xs text-gray-400 font-mono outline-none"
                      />
                      <button 
                        onClick={() => handleCopyUrl(activeMedia.url)}
                        className="px-4 bg-[#2D3748] hover:bg-white/20 border border-[#2D3748] rounded-r-lg text-white transition-colors border-l-0"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
                    <input 
                      type="text" 
                      value={editForm.filename}
                      onChange={(e) => setEditForm({...editForm, filename: e.target.value})}
                      className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#0D6E6E] focus:ring-1 focus:ring-[#0D6E6E]" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Alt Text <span className="text-gray-600 font-normal normal-case ml-1">(Important for SEO)</span></label>
                    <textarea 
                      rows={2}
                      value={editForm.altText}
                      onChange={(e) => setEditForm({...editForm, altText: e.target.value})}
                      placeholder="Describe the image..."
                      className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-[#0D6E6E] resize-none" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Caption</label>
                    <textarea 
                      rows={2}
                      value={editForm.caption}
                      onChange={(e) => setEditForm({...editForm, caption: e.target.value})}
                      className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-[#0D6E6E] resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-[#0D6E6E] resize-none" 
                    />
                  </div>
               </div>
             </div>
             
             {/* Save Button */}
             <div className="p-4 border-t border-[#2D3748] bg-[#1A1F2E]">
               <button 
                  onClick={() => handleSaveMetadata(activeMedia.id)} 
                  disabled={isSaving}
                  className="w-full py-3 bg-[#0D6E6E] hover:bg-[#0F9E9E] rounded-xl text-sm font-bold text-white shadow-[0_0_20px_rgba(13,110,110,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Save className="w-4 h-4" />}
                  {isSaving ? 'UPDATING METADATA...' : 'SAVE DETAILS'}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
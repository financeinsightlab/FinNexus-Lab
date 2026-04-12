'use client'

import { useState, useCallback, useRef } from 'react'
import { Block, BlockType, createBlock, BLOCK_REGISTRY } from '@/lib/blocks/registry'
import BlockSidebar from './BlockSidebar'
import BlockCanvas from './BlockCanvas'
import BlockSettingsPanel from './BlockSettingsPanel'
import { Monitor, Tablet, Smartphone, LayoutTemplate, Eye, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface BlockEditorProps {
  initialBlocks?: Block[]
  onChange: (blocks: Block[]) => void
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

export default function BlockEditor({ initialBlocks = [], onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [showTemplates, setShowTemplates] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dragOverIndex = useRef<number | null>(null)

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null

  const updateBlocks = useCallback((updated: Block[]) => {
    // Re-assign order indices
    const reordered = updated.map((b, i) => ({ ...b, order: i }))
    setBlocks(reordered)
    onChange(reordered)
  }, [onChange])

  // Add a new block of a given type at the end or after selectedBlock
  const addBlock = useCallback((type: BlockType) => {
    const newBlock = createBlock(type)
    let insertAt = blocks.length

    if (selectedBlockId) {
      const idx = blocks.findIndex(b => b.id === selectedBlockId)
      if (idx >= 0) insertAt = idx + 1
    }

    const updated = [
      ...blocks.slice(0, insertAt),
      newBlock,
      ...blocks.slice(insertAt)
    ]
    updateBlocks(updated)
    setSelectedBlockId(newBlock.id)
  }, [blocks, selectedBlockId, updateBlocks])

  // Update specific block's data
  const updateBlock = useCallback((id: string, data: Partial<Block['data']>, attributes?: Partial<Block['attributes']>) => {
    const updated = blocks.map(b =>
      b.id === id
        ? {
            ...b,
            data: { ...b.data, ...data },
            attributes: { ...(b.attributes || {}), ...(attributes || {}) }
          }
        : b
    )
    updateBlocks(updated)
  }, [blocks, updateBlocks])

  // Delete a block
  const deleteBlock = useCallback((id: string) => {
    const updated = blocks.filter(b => b.id !== id)
    updateBlocks(updated)
    if (selectedBlockId === id) setSelectedBlockId(null)
  }, [blocks, selectedBlockId, updateBlocks])

  // Move block up/down
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id)
    if (idx < 0) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === blocks.length - 1) return

    const updated = [...blocks]
    const swap = direction === 'up' ? idx - 1 : idx + 1
    ;[updated[idx], updated[swap]] = [updated[swap], updated[idx]]
    updateBlocks(updated)
  }, [blocks, updateBlocks])

  // Duplicate a block
  const duplicateBlock = useCallback((id: string) => {
    const idx = blocks.findIndex(b => b.id === id)
    if (idx < 0) return
    const original = blocks[idx]
    const dup: Block = {
      ...original,
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }
    const updated = [
      ...blocks.slice(0, idx + 1),
      dup,
      ...blocks.slice(idx + 1)
    ]
    updateBlocks(updated)
    setSelectedBlockId(dup.id)
  }, [blocks, updateBlocks])

  // Handle drag-reorder from canvas
  const onDragReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const updated = [...blocks]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    updateBlocks(updated)
  }, [blocks, updateBlocks])

  const previewWidths: Record<PreviewMode, string> = {
    desktop: 'w-full',
    tablet: 'max-w-[768px] mx-auto border border-white/10 rounded-2xl bg-[#0F1117] shadow-2xl',
    mobile: 'max-w-[375px] mx-auto border-[8px] border-[#1A1F2E] rounded-[3rem] bg-[#0F1117] shadow-2xl overflow-y-auto aspect-[9/19]',
  }

  return (
    <div className="flex h-full bg-[#0B0D13] overflow-hidden">
      {/* Left: Block Palette Sidebar */}
      {sidebarOpen && (
        <BlockSidebar
          onAddBlock={addBlock}
          onShowTemplates={() => setShowTemplates(true)}
        />
      )}

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas toolbar */}
        <div className="h-12 flex items-center justify-between px-4 bg-[#1A1F2E] border-b border-[#2D3748] shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-1.5 hover:text-white transition-colors bg-white/5 rounded-lg"
              title="Toggle Block Library"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
            {([
              { mode: 'desktop', icon: Monitor },
              { mode: 'tablet', icon: Tablet },
              { mode: 'mobile', icon: Smartphone },
            ] as const).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`p-2 rounded-lg transition-all ${
                  previewMode === mode
                    ? 'bg-[#0D6E6E] text-white shadow'
                    : 'text-slate-500 hover:text-white'
                }`}
                title={mode}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600 uppercase tracking-widest">
            <Eye className="w-4 h-4" />
            {blocks.length} Block{blocks.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-xs font-bold"
          >
            <LayoutTemplate className="w-4 h-4" />
            Templates
          </button>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 overflow-y-auto bg-[#0F1117] p-6">
          <div className={`transition-all duration-300 ${previewWidths[previewMode]}`}>
            <BlockCanvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onDeleteBlock={deleteBlock}
              onDuplicateBlock={duplicateBlock}
              onMoveBlock={moveBlock}
              onDragReorder={onDragReorder}
              onAddBlock={addBlock}
            />
          </div>
        </div>
      </div>

      {/* Right: Settings Panel */}
      {selectedBlock && (
        <BlockSettingsPanel
          block={selectedBlock}
          onUpdate={(data, attrs) => updateBlock(selectedBlock.id, data, attrs)}
          onDelete={() => deleteBlock(selectedBlock.id)}
          onClose={() => setSelectedBlockId(null)}
        />
      )}
    </div>
  )
}

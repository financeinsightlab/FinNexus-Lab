'use client'

import { useRef, useState } from 'react'
import { Block, BlockType } from '@/lib/blocks/registry'
import BlockPreview from './BlockPreview'
import { Plus, GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Settings } from 'lucide-react'

interface BlockCanvasProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelectBlock: (id: string) => void
  onDeleteBlock: (id: string) => void
  onDuplicateBlock: (id: string) => void
  onMoveBlock: (id: string, dir: 'up' | 'down') => void
  onDragReorder: (from: number, to: number) => void
  onAddBlock: (type: BlockType) => void
}

export default function BlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onDragReorder,
  onAddBlock,
}: BlockCanvasProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragNode = useRef<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragNode.current = index
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(index)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragNode.current !== null && dragNode.current !== index) {
      onDragReorder(dragNode.current, index)
    }
    setDragIndex(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  if (blocks.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-[#1A1F2E] border-2 border-dashed border-[#2D3748] flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-400 mb-2">Your canvas is empty</h3>
          <p className="text-sm text-slate-600 mb-6">
            Add blocks from the sidebar to start building your layout
          </p>
          <button
            onClick={() => onAddBlock('paragraph')}
            className="px-6 py-3 bg-[#0D6E6E] text-white font-bold rounded-xl hover:bg-[#0F9E9E] transition-all shadow-[0_0_20px_rgba(13,110,110,0.3)] text-sm"
          >
            + Add First Block
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 pb-20">
      {/* Insert point before first block */}
      <InsertPoint onClick={() => onAddBlock('paragraph')} />

      {blocks.map((block, index) => {
        const isSelected = selectedBlockId === block.id
        const isDragging = dragIndex === index
        const isDragTarget = dragOverIdx === index

        return (
          <div key={block.id}>
            <div
              className={`relative group rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'border-[#0D6E6E] shadow-[0_0_0_2px_rgba(13,110,110,0.2)]'
                  : 'border-transparent hover:border-white/10'
              } ${isDragging ? 'opacity-40 scale-95' : ''} ${
                isDragTarget ? 'border-[#0D6E6E] scale-[1.01]' : ''
              }`}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectBlock(block.id)}
            >
              {/* Block Actions Toolbar — hover revealed */}
              <div className={`absolute -top-3 right-3 flex items-center gap-1 z-10 transition-all ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className="flex items-center gap-1 bg-[#1A1F2E] border border-[#2D3748] rounded-xl px-2 py-1 shadow-xl">
                  {/* Block type label */}
                  <span className="text-[9px] font-bold text-[#0D6E6E] uppercase tracking-widest mr-1 px-2 border-r border-white/10">
                    {block.type}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'up') }}
                    className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    title="Move Up"
                  ><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'down') }}
                    className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    title="Move Down"
                  ><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={e => { e.stopPropagation(); onDuplicateBlock(block.id) }}
                    className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                    title="Duplicate"
                  ><Copy className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={e => { e.stopPropagation(); onSelectBlock(block.id) }}
                    className={`p-1.5 transition-colors rounded-lg ${isSelected ? 'text-[#0D6E6E] bg-[#0D6E6E]/10' : 'text-slate-500 hover:text-[#0D6E6E] hover:bg-[#0D6E6E]/10'}`}
                    title="Settings"
                  ><Settings className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteBlock(block.id) }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    title="Delete Block"
                  ><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Drag handle */}
              <div className={`absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-opacity ${
                isSelected ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'
              }`}>
                <GripVertical className="w-4 h-4 text-slate-500" />
              </div>

              {/* Block Content Preview */}
              <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
                <BlockPreview block={block} isSelected={isSelected} />
              </div>
            </div>

            {/* Insert point after each block */}
            <InsertPoint onClick={() => onAddBlock('paragraph')} />
          </div>
        )
      })}
    </div>
  )
}

function InsertPoint({ onClick }: { onClick: () => void }) {
  return (
    <div className="group flex items-center gap-3 my-1 cursor-pointer" onClick={onClick}>
      <div className="flex-1 h-px bg-transparent group-hover:bg-[#0D6E6E]/30 transition-colors" />
      <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center w-7 h-7 rounded-full border border-[#0D6E6E]/50 bg-[#0D6E6E]/10 text-[#0D6E6E]">
        <Plus className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 h-px bg-transparent group-hover:bg-[#0D6E6E]/30 transition-colors" />
    </div>
  )
}

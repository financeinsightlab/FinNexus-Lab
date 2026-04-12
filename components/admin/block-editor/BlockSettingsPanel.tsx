'use client'

import { useState } from 'react'
import { Block, BlockData, BlockAttributes } from '@/lib/blocks/registry'
import { X, Trash2, Palette, Settings } from 'lucide-react'
import MediaLibraryModal from '@/components/admin/MediaLibraryModal'

interface BlockSettingsPanelProps {
  block: Block
  onUpdate: (data: Partial<BlockData>, attributes?: Partial<BlockAttributes>) => void
  onDelete: () => void
  onClose: () => void
}

type PanelTab = 'content' | 'style'

export default function BlockSettingsPanel({ block, onUpdate, onDelete, onClose }: BlockSettingsPanelProps) {
  const [tab, setTab] = useState<PanelTab>('content')
  const [showMedia, setShowMedia] = useState(false)
  const { data, attributes = {} } = block

  const field = (
    label: string,
    children: React.ReactNode,
    hint?: string
  ) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-600 mt-1">{hint}</p>}
    </div>
  )

  const inputCls = "w-full bg-[#0F1117] border border-[#2D3748] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#0D6E6E] transition-colors"
  const textareaCls = `${inputCls} resize-none`

  const section = (title: string, children: React.ReactNode, defaultOpen = true) => (
    <details className="group border border-[#2D3748] rounded-xl overflow-hidden mb-3" open={defaultOpen}>
      <summary className="flex items-center justify-between p-3 bg-black/20 hover:bg-black/40 cursor-pointer select-none transition-colors">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <span className="text-slate-500 group-open:rotate-180 transition-transform">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </summary>
      <div className="p-4 space-y-4 bg-[#1A1F2E] border-t border-[#2D3748]/50">
        {children}
      </div>
    </details>
  )

  const renderContentFields = () => {
    switch (block.type) {
      case 'heading':
        return section('Heading Settings', (
          <>
            {field('Heading Text', 
              <input className={inputCls} value={data.text || ''} onChange={e => onUpdate({ text: e.target.value })} placeholder="Enter heading..." />
            )}
            {field('Level',
              <select className={inputCls} value={data.level || 2} onChange={e => onUpdate({ level: parseInt(e.target.value) as 1|2|3|4 })}>
                <option value={1}>H1 — Page Title</option>
                <option value={2}>H2 — Section</option>
                <option value={3}>H3 — Sub-section</option>
                <option value={4}>H4 — Small</option>
              </select>
            )}
          </>
        ))
      case 'paragraph':
        return section('Text Editor', (
            field('Content (HTML)',
              <textarea rows={8} className={textareaCls} value={data.html || ''} onChange={e => onUpdate({ html: e.target.value })} placeholder="<p>Your content...</p>" />,
              'You can use basic HTML tags like <strong>, <em>, <a href="...">'
            )
        ))
      case 'image':
        return (
          <>
            {section('Source Options', 
              <>
                {field('Image URL',
                  <div className="flex gap-2">
                    <input className={`${inputCls} flex-1`} value={data.src || ''} onChange={e => onUpdate({ src: e.target.value })} placeholder="https://..." />
                    <button
                      onClick={() => setShowMedia(true)}
                      className="px-3 py-2 bg-[#0D6E6E]/20 text-[#0D6E6E] rounded-xl hover:bg-[#0D6E6E] hover:text-white transition-all text-xs font-bold border border-[#0D6E6E]/30"
                    >
                      Library
                    </button>
                  </div>
                )}
                {data.src && <img src={data.src} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-white/10" />}
              </>
            )}
            {section('Display Data', 
              <>
                {field('Alt Text', <input className={inputCls} value={data.alt || ''} onChange={e => onUpdate({ alt: e.target.value })} placeholder="Describe the image..." />)}
                {field('Caption', <input className={inputCls} value={data.caption || ''} onChange={e => onUpdate({ caption: e.target.value })} placeholder="Optional caption..." />)}
                {field('Alignment',
                  <select className={inputCls} value={data.alignment || 'center'} onChange={e => onUpdate({ alignment: e.target.value as any })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="full">Full Width</option>
                  </select>
                )}
              </>, false
            )}
          </>
        )
      case 'quote':
        return section('Quote Config', (
          <>
            {field('Quote Text', <textarea rows={4} className={textareaCls} value={data.quote || ''} onChange={e => onUpdate({ quote: e.target.value })} placeholder="Enter your quote..." />)}
            {field('Attribution (optional)', <input className={inputCls} value={data.attribution || ''} onChange={e => onUpdate({ attribution: e.target.value })} placeholder="Author name or source..." />)}
          </>
        ))
      case 'callout':
        return (
          <>
            {section('Callout Config', 
              <>
                {field('Variant',
                  <select className={inputCls} value={data.variant || 'info'} onChange={e => onUpdate({ variant: e.target.value as any })}>
                    <option value="info">💡 Info</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="success">✅ Success</option>
                    <option value="danger">🚨 Danger</option>
                  </select>
                )}
                {field('Icon Emoji', <input className={inputCls} value={data.icon || ''} onChange={e => onUpdate({ icon: e.target.value })} placeholder="💡" />)}
              </>
            )}
            {section('Content',
              <>
                {field('Title', <input className={inputCls} value={data.title || ''} onChange={e => onUpdate({ title: e.target.value })} placeholder="Key Insight" />)}
                {field('Content', <textarea rows={3} className={textareaCls} value={data.content || ''} onChange={e => onUpdate({ content: e.target.value })} placeholder="Callout text..." />)}
              </>
            )}
          </>
        )
      case 'list':
        return section('List Details', (
          <>
            {field('List Style',
              <select className={inputCls} value={data.listStyle || 'bullet'} onChange={e => onUpdate({ listStyle: e.target.value as any })}>
                <option value="bullet">• Bullet</option>
                <option value="numbered">1. Numbered</option>
                <option value="check">☐ Checklist</option>
              </select>
            )}
            {field('Items (one per line)',
              <textarea
                rows={6}
                className={textareaCls}
                value={(data.items || []).join('\n')}
                onChange={e => onUpdate({ items: e.target.value.split('\n') })}
                placeholder={"First item\nSecond item\nThird item"}
              />,
              'Each line becomes a separate list item'
            )}
          </>
        ))
      case 'embed':
        return section('Embed Setup', (
          <>
            {field('Embed Type',
              <select className={inputCls} value={data.embedType || 'youtube'} onChange={e => onUpdate({ embedType: e.target.value as any })}>
                <option value="youtube">YouTube Video</option>
                <option value="twitter">Twitter/X</option>
                <option value="generic">Generic URL</option>
              </select>
            )}
            {field('URL', <input className={inputCls} value={data.url || ''} onChange={e => onUpdate({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />)}
          </>
        ))
      case 'button':
        return section('Button Elements', (
          <>
            {field('Button Label', <input className={inputCls} value={data.label || ''} onChange={e => onUpdate({ label: e.target.value })} placeholder="Read the Report" />)}
            {field('Link URL', <input className={inputCls} value={data.href || ''} onChange={e => onUpdate({ href: e.target.value })} placeholder="https://..." />)}
            {field('Style',
              <select className={inputCls} value={data.buttonStyle || 'primary'} onChange={e => onUpdate({ buttonStyle: e.target.value as any })}>
                <option value="primary">Primary (Filled)</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            )}
          </>
        ))
      case 'spacer':
        return section('Space Config', (
            field('Height (px)',
              <input
                type="range"
                min={16}
                max={200}
                step={8}
                value={data.height || 48}
                onChange={e => onUpdate({ height: parseInt(e.target.value) })}
                className="w-full accent-[#0D6E6E]"
              />,
              `Current: ${data.height || 48}px`
            )
        ))
      case 'table': {
        const tableData = data.tableData || [['Cell']];
        const handleAddRow = () => {
          const colsCount = tableData[0].length;
          const newRow = Array(colsCount).fill('New Cell');
          onUpdate({ tableData: [...tableData, newRow] });
        };
        const handleAddColumn = () => {
          const newRows = tableData.map(r => [...r, 'New Cell']);
          onUpdate({ tableData: newRows });
        };
        const handleRemoveRow = () => {
          if (tableData.length > 1) {
            onUpdate({ tableData: tableData.slice(0, -1) });
          }
        };
        const handleRemoveColumn = () => {
          if (tableData[0].length > 1) {
            const newRows = tableData.map(r => r.slice(0, -1));
            onUpdate({ tableData: newRows });
          }
        };

        return section('Table Editor', (
          <>
            {field('Has Header Row',
              <input type="checkbox" checked={data.hasHeaderRow !== false} onChange={e => onUpdate({ hasHeaderRow: e.target.checked })} />
            )}
            
            <div className="flex flex-col gap-2 mb-2 bg-black/20 p-2 rounded-xl">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Structure Controls</span>
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={handleAddRow} className="px-2 py-1.5 bg-[#0D6E6E]/20 text-[#0D6E6E] text-[10px] uppercase font-bold tracking-widest rounded hover:bg-[#0D6E6E] hover:text-white transition-colors border border-[#0D6E6E]/30">+ Row</button>
                 <button onClick={handleAddColumn} className="px-2 py-1.5 bg-[#0D6E6E]/20 text-[#0D6E6E] text-[10px] uppercase font-bold tracking-widest rounded hover:bg-[#0D6E6E] hover:text-white transition-colors border border-[#0D6E6E]/30">+ Column</button>
                 <button onClick={handleRemoveRow} disabled={tableData.length <= 1} className="px-2 py-1.5 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 disabled:opacity-50">- Row</button>
                 <button onClick={handleRemoveColumn} disabled={tableData[0].length <= 1} className="px-2 py-1.5 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 disabled:opacity-50">- Column</button>
               </div>
            </div>

            {field('Data Editor (JSON)',
              <textarea
                rows={10}
                className={textareaCls}
                value={JSON.stringify(tableData, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    onUpdate({ tableData: parsed })
                  } catch (err) {}
                }}
                placeholder={"[[\"Header 1\"], [\"Cell 1\"]...]"}
              />,
              'You can also directly edit the matrix data here'
            )}
          </>
        ))
      }
      case 'divider':
        return <p className="text-sm text-slate-500">No content settings for dividers.</p>
      case 'columns':
        return <p className="text-sm text-slate-500">Column block — edit content by clicking inside each column.</p>
      default:
        return <p className="text-sm text-slate-500">No configurable fields for this block type.</p>
    }
  }

  const renderStyleFields = () => (
    <>
      {section('Typography', 
        <>
          {field('Text Alignment',
            <select className={inputCls} value={attributes.textAlign || ''} onChange={e => onUpdate({}, { textAlign: e.target.value as any })}>
              <option value="">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          )}
          {field('Text Color',
            <input type="color" value={attributes.textColor || '#ffffff'} onChange={e => onUpdate({}, { textColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-[#2D3748] bg-transparent cursor-pointer"
            />
          )}
        </>
      )}

      {section('Box Model', 
        <>
          {field('Background Color',
            <input type="color" value={attributes.backgroundColor || '#1A1F2E'} onChange={e => onUpdate({}, { backgroundColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-[#2D3748] bg-transparent cursor-pointer"
            />
          )}
          {field('Padding', 
            <input className={inputCls} value={attributes.padding || ''} onChange={e => onUpdate({}, { padding: e.target.value })} placeholder="e.g. 24px or 1rem 2rem" />
          )}
        </>, false
      )}

      {section('Advanced',
        field('CSS Class',
          <input className={inputCls} value={attributes.className || ''} onChange={e => onUpdate({}, { className: e.target.value })} placeholder="custom-class" />
        ), false
      )}
    </>
  )

  return (
    <>
      <div className="w-72 bg-[#1A1F2E] border-l border-[#2D3748] flex flex-col shrink-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2D3748]">
          <div>
            <p className="text-[10px] font-extrabold text-[#0D6E6E] uppercase tracking-widest">Block Settings</p>
            <p className="text-xs font-bold text-white mt-0.5 capitalize">{block.type} Block</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2D3748] shrink-0">
          {([
            { id: 'content', label: 'Content', Icon: Settings },
            { id: 'style', label: 'Style', Icon: Palette }
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all ${
                tab === id
                  ? 'text-[#0D6E6E] border-b-2 border-[#0D6E6E]'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {tab === 'content' ? renderContentFields() : renderStyleFields()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D3748]">
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold border border-red-500/20 hover:border-red-500"
          >
            <Trash2 className="w-4 h-4" />
            Delete Block
          </button>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={showMedia}
        onClose={() => setShowMedia(false)}
        onSelect={(url) => { onUpdate({ src: url }); setShowMedia(false) }}
      />
    </>
  )
}
